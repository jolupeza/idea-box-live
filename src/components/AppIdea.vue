<script setup lang="ts">
const { idea } = defineProps({
  idea: {
    type: Object,
    required: true,
  },
});
</script>

<template>
  <article class="p-3 mt-4 rounded-lg bg-gray-300 md:flex md:items-center">
    <section class="text-center md:flex-1 md:text-left">
      <h2 class="text-xl md:text-2xl md:leading-6">
        {{ idea.name }}
      </h2>
      <small>{{ idea.username }}</small>
    </section>
    <section
      class="pt-3 border-t-2 mt-6 border-black md:pt-0 md:pl-3 md:border-t-0 md:border-l-2 md:mt-0 md:flex md:items-center"
    >
      <h3 class="text-3xl font-bold text-center">{{ idea.votes }}</h3>
      <nav class="flex justify-center md:block">
        <img
          class="w-10 cursor-pointer"
          src="./../assets/images/arrow.svg"
          alt="Vote up"
        />
        <img
          class="w-10 cursor-pointer transform rotate-180"
          src="./../assets/images/arrow.svg"
          alt="Vote down"
        />
      </nav>
    </section>
  </article>
</template>
