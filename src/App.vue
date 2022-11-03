<script setup lang="ts">
import { ref } from "vue";
import type { Ref } from "vue";

import { auth } from "./services/firebase.js";
import {
  onAuthStateChanged,
  User,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";

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
</script>

<template>
  <div class="container p-4 mx-auto">
    <div class="w-full bg-gray-100 shadow-lg p-4 rounded-lg">
      <h1 class="mb-5 text-4xl text-center">IdeaBox</h1>
      <section class="mb-6">
        <form v-if="authUser" class="md:flex">
          <input
            class="w-full p-3 md:flex-auto"
            type="text"
            required
            placeholder="Add your idea"
          />
          <input
            class="w-full p-2 bg-gray-600 text-white cursor-pointer md:flex-1"
            type="submit"
            value="Add idea"
          />
        </form>
        <p v-if="!authUser" class="user-actions">
          Please
          <a @click="doLogin" href="#">login</a>
          first
        </p>
        <p v-else class="user-actions">
          Hi {{ authUser.displayName }},
          <a @click="doLogout" href="#">Logout</a>
        </p>
      </section>
      <AppIdea v-for="idea in ideas" :key="idea.id" :idea="idea" />
    </div>
  </div>
</template>

<style scoped>
.user-actions {
  @apply mt-2 text-center;
}
.user-actions a {
  @apply font-bold underline;
}
</style>
