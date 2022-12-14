<script setup lang="ts">
import { ref, defineAsyncComponent } from 'vue'
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
  deleteDoc,
} from '@firebase/firestore'

import AddIdea from './components/AddIdea.vue'
import AppIdea from './components/AppIdea.vue'

const ideas: Ref<Array<Idea>> = ref([])
const authUser: Ref<AuthUser | null> = ref(null)
const isModalActive: Ref<Boolean> = ref(false)

const RemoveIdea = defineAsyncComponent(
  () => import('./components/RemoveIdea.vue')
)

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
      const { name, user, userName, votes, createdAt } = doc.data()
      const id = doc.id

      newIdeas.push({
        id,
        name,
        user,
        userName,
        votes,
        createdAt,
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
      createdAt: Date.now(),
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

type PropsIdeaToRemove = {
  id: string | null
  name: string | null
}

const ideaToRemove: PropsIdeaToRemove = { id: null, name: null }

const showRemoveIdeaModal = ({ name, id }: PropsIdeaToRemove) => {
  ideaToRemove.id = id
  ideaToRemove.name = name
  isModalActive.value = true
}

const removeIdea = async () => {
  if (ideaToRemove.id === null) {
    isModalActive.value = false
    return
  }

  try {
    await deleteDoc(doc(db, 'ideas', ideaToRemove.id))
  } catch (error) {
    console.error(error)
  } finally {
    isModalActive.value = false
    ideaToRemove.id = null
    ideaToRemove.name = null
  }
}
</script>

<template>
  <div class="container p-4 mx-auto">
    <Teleport to="body">
      <RemoveIdea
        v-if="isModalActive"
        :name="ideaToRemove.name"
        @remove-ok="removeIdea"
        @remove-cancel="isModalActive = !isModalActive"
      />
    </Teleport>

    <div class="w-full bg-gray-100 shadow-lg p-4 rounded-lg">
      <h1 class="mb-5 text-4xl text-center">IdeaBox</h1>

      <AddIdea
        :user="authUser"
        @do-login="doLogin"
        @do-logout="doLogout"
        @add-idea="addIdea"
      />

      <TransitionGroup name="list-complete">
        <AppIdea
          v-for="idea in ideas"
          :key="idea.createdAt"
          :idea="idea"
          :user="authUser"
          @vote-idea="voteIdea"
          @remove-idea="showRemoveIdeaModal"
          class="idea"
        />
      </TransitionGroup>
    </div>
  </div>
</template>

<style>
.idea {
  @apply bg-gray-200;
  transition: all 0.8s ease;
}
.idea:nth-of-type(1) {
  @apply bg-red-500;
}
.idea:nth-of-type(2) {
  @apply bg-red-400;
}
.idea:nth-of-type(3) {
  @apply bg-red-300;
}
.idea:nth-of-type(4) {
  @apply bg-red-200;
}
.idea:nth-of-type(5) {
  @apply bg-red-100;
}
.list-complete-enter-from,
.list-complete-leave-to {
  opacity: 0;
  transform: translateY(30px);
}
.list-complete-leave-active {
  position: absolute;
}
.list-complete-move {
  transition: transform 0.3s ease;
}
</style>
