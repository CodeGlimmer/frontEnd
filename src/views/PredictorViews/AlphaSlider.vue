<template>
  <v-container>
    <v-card class="pa-4">
      <v-card-title class="text-h5 font-weight-bold"> 指数预测法参数调节 </v-card-title>

      <v-card-text>
        <v-row>
          <v-col cols="12">
            <p class="mb-2">
              Alpha参数值: <span class="font-weight-bold">{{ alpha.toFixed(2) }}</span>
            </p>
            <v-slider
              v-model="alpha"
              :min="0"
              :max="1"
              :step="0.01"
              thumb-label="always"
              thumb-color="primary"
              track-color="grey lighten-2"
              color="primary"
            >
              <template v-slot:thumb-label>
                {{ alpha.toFixed(2) }}
              </template>
            </v-slider>
          </v-col>
        </v-row>

        <v-divider class="my-4"></v-divider>

        <v-row>
          <v-col cols="12" md="6">
            <v-text-field
              v-model.number="alpha"
              label="Alpha值"
              type="number"
              min="0"
              max="1"
              step="0.01"
              outlined
              dense
              hide-details
              @input="validateAlpha"
            ></v-text-field>
          </v-col>
          <v-col cols="12" md="6">
            <v-btn color="primary" block @click="applyAlpha" :disabled="!isValidAlpha">
              应用参数
            </v-btn>
          </v-col>
        </v-row>

        <v-alert v-if="showPreview" class="mt-4" color="info" bordered="left" dense text>
          当前Alpha值为 {{ alpha.toFixed(2) }}，这意味着新数据对预测的影响权重为
          {{ (alpha * 100).toFixed(0) }}%， 历史数据的影响权重为
          {{ ((1 - alpha) * 100).toFixed(0) }}%
        </v-alert>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" text @click="resetAlpha"> 重置 </v-btn>
        <v-btn color="success" @click="saveAlpha"> 保存设置 </v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script>
export default {
  name: 'AlphaSlider',

  data() {
    return {
      alpha: 0.6, // 默认值
      defaultAlpha: 0.6,
      isValidAlpha: true,
      showPreview: true,
    }
  },

  methods: {
    validateAlpha() {
      // 确保值在0到1之间
      if (this.alpha < 0) {
        this.alpha = 0
      } else if (this.alpha > 1) {
        this.alpha = 1
      }

      this.isValidAlpha = this.alpha >= 0 && this.alpha <= 1
    },

    applyAlpha() {
      // 这里可以添加应用参数的逻辑
      this.showPreview = true
      console.log(`应用Alpha值: ${this.alpha}`)
      // 触发事件通知父组件
      this.$emit('update:alpha', this.alpha)
    },

    resetAlpha() {
      this.alpha = this.defaultAlpha
      this.showPreview = true
    },

    saveAlpha() {
      // 保存当前设置的逻辑
      console.log(`保存Alpha值: ${this.alpha}`)
      // 可以使用localStorage保存设置
      localStorage.setItem('exponentialSmoothingAlpha', this.alpha)
      // 显示成功消息
      this.$emit('saved', this.alpha)
    },
  },

  created() {
    // 从localStorage加载之前的设置（如果有）
    const savedAlpha = localStorage.getItem('exponentialSmoothingAlpha')
    if (savedAlpha !== null) {
      this.alpha = parseFloat(savedAlpha)
    }
  },
}
</script>

<style scoped>
.v-slider__thumb-label {
  font-size: 0.8rem;
}
</style>
