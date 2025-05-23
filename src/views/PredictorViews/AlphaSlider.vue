<template>
  <v-container class="pa-2 alpha-slider-container">
    <v-card
      class="alpha-slider-card"
      :class="{ expanded: isExpanded }"
      elevation="2"
      rounded="lg"
      :style="{ maxHeight: isExpanded ? '320px' : '80px' }"
    >
      <div class="d-flex align-center card-header" @click="toggleExpand">
        <v-card-title class="text-h6 font-weight-medium py-2 pl-4 card-title">
          <v-icon class="mr-2 rotate-icon" :class="{ rotated: isExpanded }"> mdi-tune </v-icon>
          指数预测法参数调节
        </v-card-title>
        <v-spacer></v-spacer>
        <v-chip class="alpha-chip ma-2" :color="getAlphaColor" pill small outlined>
          <v-avatar left>
            <v-icon small>mdi-alpha</v-icon>
          </v-avatar>
          {{ alpha.toFixed(2) }}
        </v-chip>
        <v-btn
          icon
          small
          class="expand-btn mr-2"
          :class="{ rotated: isExpanded }"
          @click.stop="toggleExpand"
        >
          <v-icon>mdi-chevron-down</v-icon>
        </v-btn>
      </div>

      <v-expand-transition>
        <div v-show="isExpanded">
          <v-divider></v-divider>

          <v-card-text class="pa-3 card-content">
            <div class="alpha-value-display mb-2">
              <div class="d-flex justify-space-between align-center">
                <span class="caption">Alpha参数值:</span>
                <span class="font-weight-bold" :class="getAlphaColorClass" v-text-reveal>
                  {{ alpha.toFixed(2) }}
                </span>
              </div>
              <v-scale-transition>
                <v-progress-linear
                  :value="alpha * 100"
                  height="4"
                  rounded
                  :color="getAlphaColor"
                  background-opacity="0.2"
                  class="mt-1"
                ></v-progress-linear>
              </v-scale-transition>
            </div>

            <div class="slider-container">
              <v-slider
                v-model="alpha"
                :min="0"
                :max="1"
                :step="0.01"
                thumb-label="always"
                thumb-color="primary"
                track-color="grey lighten-2"
                color="primary"
                dense
                class="alpha-slider"
                hide-details
                @input="onSliderInput"
              >
                <template v-slot:thumb-label>
                  <div class="thumb-label-content">{{ alpha.toFixed(2) }}</div>
                </template>
                <template v-slot:prepend>
                  <v-icon small class="mr-1 slider-icon" color="grey darken-1">mdi-weight</v-icon>
                  <span class="caption mr-1">0</span>
                </template>
                <template v-slot:append>
                  <span class="caption ml-1">1</span>
                  <v-icon small class="ml-1 slider-icon" color="primary">mdi-weight</v-icon>
                </template>
              </v-slider>
            </div>

            <v-row class="mt-0">
              <v-col cols="12" sm="7" class="py-1">
                <v-text-field
                  v-model.number="alphaInput"
                  label="Alpha值"
                  type="number"
                  min="0"
                  max="1"
                  step="0.01"
                  outlined
                  dense
                  hide-details
                  class="alpha-input"
                  :error="!isValidAlpha"
                  :error-messages="alphaErrorMsg"
                  @input="validateAlpha"
                  @blur="applyManualInput"
                  @keydown.enter="applyManualInput"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="5" class="py-1">
                <v-btn
                  color="primary"
                  block
                  small
                  elevation="1"
                  class="apply-btn tw:mt-2"
                  :disabled="!isValidAlpha"
                  @click="applyAlpha"
                >
                  <v-icon left small>mdi-check</v-icon>
                  应用参数
                </v-btn>
              </v-col>
            </v-row>

            <v-expand-transition>
              <div v-if="showPreview" class="preview-container pt-1">
                <v-scale-transition group>
                  <v-alert
                    bordered="left"
                    dense
                    text
                    class="preview-alert mt-2 mb-0 tw:!bg-m-info tw:dark:!bg-m-info-dark"
                    key="preview-alert"
                  >
                    <div class="preview-content">
                      <div class="preview-text">
                        当前Alpha值为 <span class="font-weight-medium">{{ alpha.toFixed(2) }}</span>
                      </div>
                      <div class="weight-distribution">
                        <div class="weight-item">
                          <span class="weight-label">新数据权重</span>
                          <v-progress-linear
                            :value="alpha * 100"
                            height="6"
                            rounded
                            color="primary"
                            background-opacity="0.1"
                            class="weight-bar"
                          ></v-progress-linear>
                          <span class="weight-value primary--text"
                            >{{ (alpha * 100).toFixed(0) }}%</span
                          >
                        </div>
                        <div class="weight-item">
                          <span class="weight-label">历史数据权重</span>
                          <v-progress-linear
                            :value="(1 - alpha) * 100"
                            height="6"
                            rounded
                            color="secondary"
                            background-opacity="0.1"
                            class="weight-bar"
                          ></v-progress-linear>
                          <span class="weight-value secondary--text"
                            >{{ ((1 - alpha) * 100).toFixed(0) }}%</span
                          >
                        </div>
                      </div>
                    </div>
                  </v-alert>
                </v-scale-transition>
              </div>
            </v-expand-transition>
          </v-card-text>

          <v-divider></v-divider>

          <v-card-actions class="pa-2">
            <v-btn text small color="grey" class="action-btn mr-2" @click="resetAlpha">
              <v-icon left x-small>mdi-refresh</v-icon>
              重置
            </v-btn>
            <v-spacer></v-spacer>
            <v-btn
              color="success"
              small
              class="action-btn save-btn"
              elevation="1"
              :loading="isSaving"
              @click="saveAlpha"
            >
              <v-icon left x-small>mdi-content-save</v-icon>
              保存设置
            </v-btn>
          </v-card-actions>
        </div>
      </v-expand-transition>
    </v-card>

    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="snackbar.timeout"
      bottom
      right
      class="notification-snackbar"
    >
      <div class="d-flex align-center">
        <v-icon small class="mr-2">{{ snackbar.icon }}</v-icon>
        {{ snackbar.text }}
      </div>
      <template v-slot:action="{ attrs }">
        <v-btn text x-small v-bind="attrs" @click="snackbar.show = false"> 关闭 </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup>
// import { last } from 'lodash-es'
import { ref, computed, watch, nextTick, onMounted } from 'vue'

// 定义组件名称
defineOptions({
  name: 'AlphaSliderTool',
})

// 定义emit
const emit = defineEmits(['update:alpha', 'saved'])

// 自定义指令
const vTextReveal = {
  mounted: (el) => {
    el.classList.add('text-reveal-animation')
    setTimeout(() => {
      el.classList.remove('text-reveal-animation')
    }, 600)
  },
  updated: (el) => {
    el.classList.add('text-reveal-animation')
    setTimeout(() => {
      el.classList.remove('text-reveal-animation')
    }, 600)
  },
}

// 反应式状态
const alpha = ref(0.6) // 默认值
const alphaInput = ref('0.60')
const defaultAlpha = ref(0.6)
const isValidAlpha = ref(true)
const alphaErrorMsg = ref('')
const showPreview = ref(false)
const isExpanded = ref(false)
const isSaving = ref(false)
const valueChanged = ref(false)
const initialLoad = ref(true)
const lastAppliedAlpha = ref(0.6)
const snackbar = ref({
  show: false,
  text: '',
  color: 'success',
  timeout: 3000,
  icon: 'mdi-check-circle',
})
let alphaChangeAnimation = null
const sliderInteraction = ref(false)

// 计算属性
const getAlphaColor = computed(() => {
  if (alpha.value <= 0.3) return 'blue'
  if (alpha.value <= 0.6) return 'primary'
  if (alpha.value <= 0.8) return 'orange'
  return 'red'
})

const getAlphaColorClass = computed(() => {
  if (alpha.value <= 0.3) return 'blue--text'
  if (alpha.value <= 0.6) return 'primary--text'
  if (alpha.value <= 0.8) return 'orange--text'
  return 'red--text'
})

const hasChanges = computed(() => {
  return lastAppliedAlpha.value !== alpha.value
})

// 侦听器
watch(alpha, (newVal, oldVal) => {
  if (!initialLoad.value && Math.abs(newVal - oldVal) > 0.001) {
    valueChanged.value = true
    alphaInput.value = newVal.toFixed(2)

    // Cancel previous animation
    if (alphaChangeAnimation) {
      clearTimeout(alphaChangeAnimation)
    }

    // If the change is not from slider interaction, add animation
    if (!sliderInteraction.value) {
      animateAlphaChange()
    }
  }
})

watch(isExpanded, (val) => {
  if (val) {
    nextTick(() => {
      showPreview.value = true
    })
  }
})

watch(hasChanges, (val) => {
  if (val && isExpanded.value) {
    pulseActionButtons()
  }
})

// 方法
function toggleExpand() {
  isExpanded.value = !isExpanded.value

  if (isExpanded.value) {
    // Add entry animation
    nextTick(() => {
      animateCardEntry()
    })
  }
}

function animateCardEntry() {
  const elements = document.querySelectorAll('.card-content > *')
  elements.forEach((el, index) => {
    el.style.opacity = '0'
    el.style.transform = 'translateY(10px)'

    setTimeout(
      () => {
        el.style.transition = 'opacity 0.3s ease, transform 0.3s ease'
        el.style.opacity = '1'
        el.style.transform = 'translateY(0)'
      },
      50 + index * 50,
    )
  })
}

function animateAlphaChange() {
  alphaChangeAnimation = setTimeout(() => {
    const valueDisplay = document.querySelector('.alpha-value-display')
    if (valueDisplay) {
      valueDisplay.classList.add('pulse-animation')
      setTimeout(() => {
        valueDisplay.classList.remove('pulse-animation')
      }, 600)
    }
  }, 100)
}

function pulseActionButtons() {
  const saveBtn = document.querySelector('.save-btn')
  if (saveBtn) {
    saveBtn.classList.add('pulse-animation')
    setTimeout(() => {
      saveBtn.classList.remove('pulse-animation')
    }, 600)
  }
}

function onSliderInput() {
  sliderInteraction.value = true
  validateAlpha()
  showPreview.value = true

  // Reset the slider interaction flag after a short delay
  setTimeout(() => {
    sliderInteraction.value = false
  }, 100)
}

function validateAlpha() {
  // 确保值在0到1之间
  if (typeof alphaInput.value === 'string') {
    alphaInput.value = alphaInput.value.replace(/[^\d.-]/g, '')
  }

  const parsedValue = parseFloat(alphaInput.value)

  if (isNaN(parsedValue)) {
    isValidAlpha.value = false
    alphaErrorMsg.value = '请输入有效数字'
    return
  }

  if (parsedValue < 0) {
    isValidAlpha.value = false
    alphaErrorMsg.value = 'Alpha不能小于0'
  } else if (parsedValue > 1) {
    isValidAlpha.value = false
    alphaErrorMsg.value = 'Alpha不能大于1'
  } else {
    isValidAlpha.value = true
    alphaErrorMsg.value = ''
  }
}

function applyManualInput() {
  if (isValidAlpha.value) {
    const parsedValue = parseFloat(alphaInput.value)
    if (!isNaN(parsedValue)) {
      alpha.value = Math.max(0, Math.min(1, parsedValue))
      alphaInput.value = alpha.value.toFixed(2)
      showPreview.value = true
    }
  }
}

function applyAlpha() {
  if (!isValidAlpha.value) return

  // 视觉反馈
  const applyBtn = document.querySelector('.apply-btn')
  applyBtn.classList.add('button-pulse')
  setTimeout(() => {
    applyBtn.classList.remove('button-pulse')
  }, 300)

  lastAppliedAlpha.value = alpha.value
  valueChanged.value = false
  showPreview.value = true

  // 动画展示预览
  const previewEl = document.querySelector('.preview-container')
  if (previewEl) {
    previewEl.classList.add('preview-highlight')
    setTimeout(() => {
      previewEl.classList.remove('preview-highlight')
    }, 600)
  }

  console.log(`应用Alpha值: ${alpha.value}`)
  // 触发事件通知父组件
  saveAlpha()
  emit('update:alpha', alpha.value)

  showNotification('参数已应用', 'success', 'mdi-check-circle')
}

function resetAlpha() {
  const oldAlpha = alpha.value
  alpha.value = defaultAlpha.value
  alphaInput.value = alpha.value.toFixed(2)
  validateAlpha()
  showPreview.value = true

  if (Math.abs(oldAlpha - alpha.value) > 0.001) {
    showNotification('参数已重置为默认值', 'info', 'mdi-refresh')
  }

  // 触发事件通知父组件
  emit('update:alpha', alpha.value)
}

function saveAlpha() {
  isSaving.value = true

  // 模拟保存操作延迟
  setTimeout(() => {
    // 保存当前设置的逻辑
    console.log(`保存Alpha值: ${alpha.value}`)
    // 保存到Storage
    localStorage.setItem('exponentialSmoothingAlpha', alpha.value)

    lastAppliedAlpha.value = alpha.value
    valueChanged.value = false
    isSaving.value = false

    // 显示成功消息
    showNotification('设置已保存', 'success', 'mdi-content-save')
    emit('saved', alpha.value)
  }, 600)
}

function showNotification(text, color, icon) {
  snackbar.value = {
    show: true,
    text,
    color,
    timeout: 3000,
    icon,
  }
}

// 生命周期钩子
// created
;(() => {
  // 从localStorage加载之前的设置（如果有）
  console.log('Hello')
  const savedAlpha = localStorage.getItem('exponentialSmoothingAlpha')
  if (savedAlpha !== null) {
    alpha.value = parseFloat(savedAlpha)
    lastAppliedAlpha.value = alpha.value
  } else {
    lastAppliedAlpha.value = defaultAlpha.value
  }

  alphaInput.value = alpha.value.toFixed(2)

  // 设置短暂延迟后初始化完成
  setTimeout(() => {
    initialLoad.value = false
  }, 500)
})()

onMounted(() => {
  // 添加滑块交互效果
  const sliderThumb = document.querySelector('.v-slider__thumb')
  if (sliderThumb) {
    sliderThumb.addEventListener('mousedown', () => {
      document.querySelector('.alpha-slider').classList.add('slider-active')
    })

    document.addEventListener('mouseup', () => {
      document.querySelector('.alpha-slider').classList.remove('slider-active')
    })
  }
})

// 导出自定义指令和其他方法供模板使用
defineExpose({
  vTextReveal,
  toggleExpand,
  onSliderInput,
  validateAlpha,
  applyManualInput,
  applyAlpha,
  resetAlpha,
  saveAlpha,
})
</script>
<style scoped>
.alpha-slider-container {
  position: relative;
}

.alpha-slider-card {
  transition:
    max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    box-shadow 0.3s ease;
  overflow: hidden;
  will-change: max-height, transform;
  border-radius: 8px;
}

.alpha-slider-card:not(.expanded):hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
}

.card-header {
  cursor: pointer;
  user-select: none;
  position: relative;
  transition: background-color 0.2s ease;
}

.card-header:hover {
  background-color: rgba(0, 0, 0, 0.03);
}

.card-title {
  font-size: 16px !important;
  line-height: 1.2;
  letter-spacing: 0.0125em;
  display: flex;
  align-items: center;
}

.rotate-icon {
  transition: transform 0.3s ease;
}

.rotate-icon.rotated {
  transform: rotate(90deg);
}

.expand-btn {
  transition: transform 0.3s ease;
}

.expand-btn.rotated {
  transform: rotate(180deg);
}

.alpha-chip {
  transition: all 0.3s ease;
  font-size: 12px;
}

.alpha-value-display {
  position: relative;
  transition: all 0.2s ease;
  padding: 4px 8px;
  border-radius: 4px;
}

.slider-container {
  padding: 0 6px;
  margin: 8px 0;
}

.alpha-slider {
  margin-top: 4px;
  transition: opacity 0.3s ease;
}

.slider-active .v-slider__thumb {
  transform: scale(1.2);
  box-shadow: 0 0 0 8px rgba(var(--v-primary-base), 0.16);
}

.thumb-label-content {
  font-size: 0.7rem;
  font-weight: 600;
}

.alpha-input {
  transition: all 0.2s ease;
}

.alpha-input:focus-within {
  transform: scale(1.02);
}

.preview-container {
  transition: all 0.3s ease;
}

.preview-alert {
  border-left-width: 3px !important;
  font-size: 0.8rem;
}

.preview-content {
  padding: 4px 0;
}

.weight-distribution {
  display: flex;
  flex-direction: column;
  margin-top: 8px;
  gap: 8px;
}

.weight-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.weight-label {
  font-size: 0.75rem;
  min-width: 80px;
}

.weight-bar {
  flex-grow: 1;
}

.weight-value {
  font-size: 0.75rem;
  font-weight: 500;
  min-width: 36px;
  text-align: right;
}

.action-btn {
  transition: all 0.2s ease;
}

.action-btn:hover {
  transform: translateY(-2px);
}

.save-btn {
  position: relative;
  overflow: hidden;
}

.save-btn::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 5px;
  height: 5px;
  background: rgba(255, 255, 255, 0.5);
  opacity: 0;
  border-radius: 100%;
  transform: scale(1, 1) translate(-50%, -50%);
  transform-origin: 50% 50%;
}

.save-btn:hover::after {
  animation: ripple 1s ease-out;
}

.notification-snackbar {
  border-radius: 4px;
}

/* Animations */
@keyframes ripple {
  0% {
    transform: scale(0, 0);
    opacity: 0.5;
  }
  100% {
    transform: scale(40, 40);
    opacity: 0;
  }
}

.pulse-animation {
  animation: pulse 0.6s cubic-bezier(0.4, 0, 0.6, 1);
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
    background-color: rgba(var(--v-primary-base), 0.1);
  }
  100% {
    transform: scale(1);
  }
}

.button-pulse {
  animation: buttonPulse 0.3s ease;
}

@keyframes buttonPulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.08);
  }
  100% {
    transform: scale(1);
  }
}

.text-reveal-animation {
  animation: textReveal 0.6s ease;
}

@keyframes textReveal {
  0% {
    opacity: 0.3;
    transform: scale(0.96);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.preview-highlight {
  animation: previewHighlight 0.6s ease;
}

@keyframes previewHighlight {
  0% {
    background-color: rgba(var(--v-primary-base), 0);
  }
  50% {
    background-color: rgba(var(--v-primary-base), 0.1);
  }
  100% {
    background-color: rgba(var(--v-primary-base), 0);
  }
}

/* Material You styling */
.slider-icon {
  opacity: 0.7;
  transition: opacity 0.2s ease;
}

:deep(.v-slider__thumb) {
  transition:
    transform 0.2s cubic-bezier(0.4, 0, 0.2, 1),
    box-shadow 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

:deep(.v-slider__thumb-container:hover .v-slider__thumb) {
  transform: scale(1.1);
  box-shadow: 0 0 0 8px rgba(var(--v-primary-base), 0.16);
}

:deep(.v-slider__track-background) {
  border-radius: 4px;
}

:deep(.v-slider__track-fill) {
  border-radius: 4px;
}

:deep(.v-text-field__slot input) {
  transition: all 0.3s ease;
}

:deep(.v-text-field--outlined fieldset) {
  transition: border-color 0.2s ease;
}

:deep(.v-text-field:hover fieldset) {
  border-color: var(--v-primary-base) !important;
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .weight-label {
    min-width: 60px;
    font-size: 0.7rem;
  }

  .weight-value {
    min-width: 30px;
    font-size: 0.7rem;
  }

  .card-title {
    font-size: 14px !important;
  }
}
</style>
