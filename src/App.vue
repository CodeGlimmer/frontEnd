<template>
  <RouterView v-slot="{ Component }">
    <v-scroll-x-transition :duration="{ enter: 500, leave: 100 }">
      <component :is="Component" />
    </v-scroll-x-transition>
  </RouterView>
</template>

<script setup lang="ts"></script>

<style lang="scss" scoped></style>
