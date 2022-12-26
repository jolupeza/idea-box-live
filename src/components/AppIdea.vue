<script setup lang="ts">
import { computed } from 'vue'

import { AuthUser, Idea } from '../interfaces/types'

interface Props {
  idea: Idea
  user: AuthUser | null
}

const props = defineProps<Props>()

const emit = defineEmits(['voteIdea'])

const voteIdea = (type: boolean) =>
  emit('voteIdea', { id: props.idea.id, type })

const userVoted = computed(() => {
  if (props.user?.votes) {
    return props.user.votes.find((item) => item === props.idea.id)
  }

  return false
})
</script>

<template>
  <article class="p-3 mt-4 rounded-lg bg-gray-300 md:flex md:items-center">
    <section class="text-center md:flex-1 md:text-left">
      <h2 class="text-xl md:text-2xl md:leading-6">
        {{ idea.name }}
      </h2>
      <small>{{ idea.userName }}</small>
    </section>
    <section
      class="pt-3 border-t-2 mt-6 border-black md:pt-0 md:pl-3 md:border-t-0 md:border-l-2 md:mt-0 md:flex md:items-center md:gap-2 md:w-16"
    >
      <h3 class="text-3xl font-bold text-center">{{ idea.votes }}</h3>
      <nav v-if="user && !userVoted" class="flex justify-center md:block">
        <img
          @click="voteIdea(true)"
          class="w-5 cursor-pointer"
          src="./../assets/images/arrow.svg"
          alt="Vote up"
        />
        <img
          @click="voteIdea(false)"
          class="w-5 cursor-pointer transform rotate-180"
          src="./../assets/images/arrow.svg"
          alt="Vote down"
        />
      </nav>
    </section>
  </article>
</template>
