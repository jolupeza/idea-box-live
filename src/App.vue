<script setup lang="ts">
import { ref } from 'vue'
import type { Ref } from 'vue'

import { Idea, AuthUser } from './interfaces/types'

import { auth, db } from './services/firebase.js'
import {
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  Unsubscribe,
} from 'firebase/auth'
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  doc,
  updateDoc,
  increment,
  orderBy,
  setDoc,
  arrayUnion,
  getDoc,
} from '@firebase/firestore'

import AddIdea from './components/AddIdea.vue'
import AppIdea from './components/AppIdea.vue'

const ideas: Ref<Array<Idea>> = ref([])
const authUser: Ref<AuthUser | null> = ref(null)

const provider = new GoogleAuthProvider()

onAuthStateChanged(auth, (user) => {
  let userVotes: Unsubscribe

  if (user) {
    authUser.value = user
    userVotes = onSnapshot(doc(db, 'votes', authUser.value.uid), (doc) => {
      if (doc.exists()) {
        const document = doc.data()

        if ('ideas' in document && authUser.value) {
          authUser.value.votes = document.ideas
        }
      }
    })
  } else {
    authUser.value = null

    userVotes && userVotes()
  }
})

const q = query(collection(db, 'ideas'), orderBy('votes', 'desc'))

onSnapshot(
  q,
  (querySnapshot) => {
    const newIdeas: Array<Idea> = []

    querySnapshot.forEach((doc) => {
      const { name, user, userName, votes } = doc.data()
      const id = doc.id

      newIdeas.push({
        id,
        name,
        user,
        userName,
        votes,
      })

      ideas.value = newIdeas
    })
  },
  (error) => console.error(error)
)

const doLogin = async () => {
  try {
    await signInWithPopup(auth, provider)
  } catch (error) {
    console.error(error)
  }
}

const doLogout = async () => {
  try {
    signOut(auth)
  } catch (error) {
    console.error(error)
  }
}

const addIdea = async (data: Ref) => {
  try {
    await addDoc(collection(db, 'ideas'), {
      name: data.value,
      user: authUser.value?.uid,
      userName: authUser.value?.displayName,
      votes: 0,
    })
  } catch (error) {
    console.error(error)
  }
}

type PropsVoteIdea = {
  id: string
  type: boolean
}

const voteIdea = async ({ id, type }: PropsVoteIdea): Promise<void> => {
  if (!authUser.value) {
    return
  }

  try {
    const votesRef = doc(db, 'votes', authUser.value.uid)
    const votesSnap = await getDoc(votesRef)

    if (votesSnap.exists()) {
      const votes = votesSnap.data().ideas

      if (votes.find((vote: string) => vote === id)) {
        throw new Error('User already voted!')
      }
    }

    const idea = doc(db, 'ideas', id)

    await updateDoc(idea, {
      votes: increment(type ? 1 : -1),
    })

    await setDoc(
      doc(db, 'votes', authUser.value.uid),
      { ideas: arrayUnion(id) },
      { merge: true }
    )
  } catch (error) {
    console.error(error)
  }
}
</script>

<template>
  <div class="container p-4 mx-auto">
    <div class="w-full bg-gray-100 shadow-lg p-4 rounded-lg">
      <h1 class="mb-5 text-4xl text-center">IdeaBox</h1>

      <AddIdea
        :user="authUser"
        @do-login="doLogin"
        @do-logout="doLogout"
        @add-idea="addIdea"
      />

      <AppIdea
        v-for="idea in ideas"
        :key="idea.id"
        :idea="idea"
        :user="authUser"
        @vote-idea="voteIdea"
      />
    </div>
  </div>
</template>
