<script setup lang="ts">
import { ref } from "vue";
import type { Ref } from "vue";

import { auth, db } from "./services/firebase.js";
import {
  onAuthStateChanged,
  User,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { collection, addDoc } from "@firebase/firestore";

import AddIdea from "./components/AddIdea.vue";
import AppIdea from "./components/AppIdea.vue";
import seed from "./seed.json";

const ideas = ref(seed.ideas);
let authUser: Ref<User | null> = ref(null);

const provider = new GoogleAuthProvider();

onAuthStateChanged(auth, async (user) => (authUser.value = user));

const doLogin = async () => {
  try {
    await signInWithPopup(auth, provider);
  } catch (error) {
    console.error(error);
  }
};

const doLogout = async () => {
  try {
    signOut(auth);
  } catch (error) {
    console.error(error);
  }
};

const addIdea = async (data: Ref) => {
  try {
    const docRef = await addDoc(collection(db, "ideas"), {
      name: data.value,
      user: authUser.value?.uid,
      userName: authUser.value?.displayName,
      votes: 0,
    });
  } catch (error) {
    console.error(error);
  }
};
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

      <AppIdea v-for="idea in ideas" :key="idea.id" :idea="idea" />
    </div>
  </div>
</template>
