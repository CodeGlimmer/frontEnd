<!-- <template>
  <RouterView v-slot="{ Component }">
    <v-scroll-x-transition :duration="{ enter: 500, leave: 100 }">
      <component :is="Component" />
    </v-scroll-x-transition>
  </RouterView>
</template>

<script setup lang="ts"></script>

<style lang="scss" scoped></style> -->
<!-- <template>
  <div>键盘控制agv小车</div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import ROSLIB from 'roslib'
import { KeyboardControl } from '@/lib/rosConnection/tele-control'

const linear = ref(3)
const angular = ref(0.5)
let kc

onMounted(() => {
  const ros = new ROSLIB.Ros({
    url: 'ws://0.0.0.0:9090',
  })
  kc = new KeyboardControl({
    ros,
    topic: '/cmd_vel',
    linear,
    angular,
    keys: ['i', 'k', 'j', 'l'],
  })
})

onUnmounted(() => {
  kc.dispose()
})
</script>

<style lang="scss" scoped></style> -->
<!-- <template>
  <div>
    <hhh URDFViewer="build_a_car_s0.urdf" />
  </div>
</template>

<script setup>
import hhh from '@/components/hhh.vue'
</script>

<style lang="scss" scoped></style> -->
<template>
  <SendingOperations />
</template>

<script setup>
import SendingOperations from '@/views/DashBoard/SendingOperations.vue'
</script>

<style lang="scss" scoped></style>
