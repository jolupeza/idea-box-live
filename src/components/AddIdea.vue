<script setup lang="ts">
import { ref } from 'vue'
import { AuthUser } from '../interfaces/types'

defineProps<{
  user: AuthUser | null
}>()

const idea = ref('')

const emit = defineEmits(['doLogin', 'doLogout', 'addIdea'])

const doLogin = () => emit('doLogin')

const doLogout = () => emit('doLogout')

const addIdea = () => {
  emit('addIdea', idea)
  idea.value = ''
}
</script>

<template>
  <section class="mb-6">
    <form v-if="user" @submit.prevent="addIdea" class="md:flex">
      <input
        v-model="idea"
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
    <p v-if="!user" class="user-actions">
      Please
      <a @click="doLogin" href="#">login</a>
      first
    </p>
    <p v-else class="user-actions">
      Hi {{ user.displayName }},
      <a @click="doLogout" href="#">Logout</a>
    </p>
  </section>
</template>

<style scoped>
.user-actions {
  @apply mt-2 text-center;
}

.user-actions a {
  @apply font-bold underline;
}
</style>
