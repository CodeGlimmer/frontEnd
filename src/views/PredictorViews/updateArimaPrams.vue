<template>
  <div>
    <v-menu v-model="menu" :close-on-content-click="false">
      <template v-slot:activator="{ props }">
        <v-btn color="primary" v-bind="props" prepend-icon="mdi-tune"> ARIMA 参数设置 </v-btn>
      </template>

      <v-card min-width="300" class="pa-4">
        <v-card-title>ARIMA 参数配置</v-card-title>

        <v-card-text>
          <v-row>
            <v-col cols="12">
              <v-slider
                v-model="p"
                :min="0"
                :max="20"
                step="1"
                label="p (自回归项数)"
                thumb-label
                show-ticks="always"
                :tick-size="4"
                :tick-labels="tickLabels"
              ></v-slider>
              <div class="text-center">p: {{ p }}</div>
            </v-col>

            <v-col cols="12">
              <v-slider
                v-model="d"
                :min="0"
                :max="5"
                step="1"
                label="d (差分次数)"
                thumb-label
                show-ticks="always"
              ></v-slider>
              <div class="text-center">d: {{ d }}</div>
            </v-col>

            <v-col cols="12">
              <v-slider
                v-model="q"
                :min="0"
                :max="20"
                step="1"
                label="q (移动平均项数)"
                thumb-label
                show-ticks="always"
                :tick-size="4"
                :tick-labels="tickLabels"
              ></v-slider>
              <div class="text-center">q: {{ q }}</div>
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="updateParams"> 更新参数 </v-btn>
          <v-btn color="grey" @click="menu = false"> 关闭 </v-btn>
        </v-card-actions>
      </v-card>
    </v-menu>

    <v-chip class="ml-3" color="info"> 当前ARIMA参数: ({{ p }}, {{ d }}, {{ q }}) </v-chip>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const menu = ref(false)
const p = ref(7)
const d = ref(1)
const q = ref(0)
const tickLabels = [...Array(21).keys()].filter((n) => n % 5 === 0).map(String)

const eimts = defineEmits(['update-arima-params'])

const updateParams = () => {
  localStorage.setItem(
    'arimaParam',
    JSON.stringify({
      p: p.value,
      d: d.value,
      q: q.value,
    }),
  )
  eimts('update-arima-params', {
    p: p.value,
    d: d.value,
    q: q.value,
  })
  menu.value = false
}

;(() => {
  let arimaParam = localStorage.getItem('arimaParam')
  if (arimaParam) {
    arimaParam = JSON.parse(arimaParam)
    p.value = arimaParam.p
    q.value = arimaParam.q
    d.value = arimaParam.d
  }
})()
</script>

<style scoped>
.v-card {
  border-radius: 8px;
}
</style>
