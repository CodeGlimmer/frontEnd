<template>
  <RouterView v-slot="{ Component }">
    <v-scroll-x-transition :duration="{ enter: 500, leave: 100 }">
      <component :is="Component" />
    </v-scroll-x-transition>
  </RouterView>
</template>

<script setup lang="ts"></script>

<style lang="scss" scoped></style>

<!-- <template>
  <AllPrediction />
</template>

<script setup>
import AllPrediction from './views/PredictorViews/AllPrediction.vue'
</script>

<style lang="scss" scoped></style> -->
