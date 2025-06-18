<template>
  <v-container>
    <v-fade-transition>
      <v-card class="mx-auto mb-6 elevation-3" max-width="800">
        <v-card-title class="text-h5">
          <v-icon left color="primary">mdi-image-search</v-icon>
          <span class="title-text">划痕检测系统</span>
        </v-card-title>

        <v-card-text>
          <v-row>
            <v-col cols="12">
              <v-slide-y-transition>
                <v-file-input
                  v-model="imageFile"
                  label="选择图片"
                  accept="image/*"
                  prepend-icon="mdi-camera"
                  outlined
                  @change="previewImage"
                  :error-messages="errorMessage"
                  class="file-input-grow"
                  hide-details="auto"
                >
                  <template v-slot:selection="{ text }">
                    <v-chip color="primary" label small class="file-chip">
                      <v-icon left small>mdi-file-image</v-icon>
                      {{ text }}
                    </v-chip>
                  </template>
                </v-file-input>
              </v-slide-y-transition>
            </v-col>
          </v-row>

          <v-expand-transition>
            <div v-if="imagePreview">
              <v-row>
                <v-col cols="12">
                  <v-card class="image-preview-card mb-4">
                    <v-card-title class="preview-header">
                      <span>图片预览</span>
                      <v-spacer></v-spacer>
                      <div class="preview-actions">
                        <v-tooltip bottom>
                          <template v-slot:activator="{ on, attrs }">
                            <v-btn icon v-bind="attrs" v-on="on" @click="rotateImage">
                              <v-icon>mdi-rotate-right</v-icon>
                            </v-btn>
                          </template>
                          <span>旋转</span>
                        </v-tooltip>

                        <v-tooltip bottom>
                          <template v-slot:activator="{ on, attrs }">
                            <v-btn icon v-bind="attrs" v-on="on" @click="toggleFullscreen">
                              <v-icon>mdi-fullscreen</v-icon>
                            </v-btn>
                          </template>
                          <span>全屏预览</span>
                        </v-tooltip>

                        <v-tooltip bottom>
                          <template v-slot:activator="{ on, attrs }">
                            <v-btn icon v-bind="attrs" v-on="on" @click="resetImage">
                              <v-icon>mdi-refresh</v-icon>
                            </v-btn>
                          </template>
                          <span>重置</span>
                        </v-tooltip>
                      </div>
                    </v-card-title>

                    <v-divider></v-divider>

                    <v-card-text class="pa-0">
                      <div class="preview-container improved">
                        <div class="zoom-controls">
                          <v-btn
                            icon
                            small
                            color="primary"
                            @click="zoomIn"
                            class="zoom-btn-overlay"
                          >
                            <v-icon>mdi-plus</v-icon>
                          </v-btn>
                          <v-btn
                            icon
                            small
                            color="primary"
                            @click="zoomOut"
                            class="zoom-btn-overlay mt-1"
                          >
                            <v-icon>mdi-minus</v-icon>
                          </v-btn>
                        </div>

                        <div
                          class="image-viewer"
                          @wheel.prevent="handleImageWheel"
                          @mousedown="startDrag"
                          @mousemove="onDrag"
                          @mouseup="stopDrag"
                          @mouseleave="stopDrag"
                        >
                          <img
                            :src="imagePreview"
                            class="preview-img"
                            :style="{
                              transform: `translate(-50%, -50%) translate(${imagePosition.x}px, ${imagePosition.y}px) scale(${imageZoom}) rotate(${imageRotation}deg)`,
                            }"
                            @dblclick="resetImage"
                          />
                        </div>

                        <div class="image-info">
                          <v-chip small class="mr-2" color="primary" outlined>
                            <v-icon left small>mdi-image</v-icon>
                            {{ imageFile ? imageFile.name : '未知文件' }}
                          </v-chip>

                          <v-chip small class="mr-2" color="secondary" outlined>
                            <v-icon left small>mdi-file-size</v-icon>
                            {{ imageFile ? formatFileSize(imageFile.size) : '未知大小' }}
                          </v-chip>

                          <v-chip small color="accent" outlined>
                            <v-icon left small>mdi-magnify</v-icon>
                            {{ Math.round(imageZoom * 100) }}%
                          </v-chip>
                        </div>

                        <div class="preview-instructions">
                          <v-icon small class="mr-1">mdi-information-outline</v-icon>
                          <small>滚轮缩放 | 双击重置 | 拖拽移动</small>
                        </div>
                      </div>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
            </div>
          </v-expand-transition>

          <v-row>
            <v-col cols="12" class="text-center">
              <v-scale-transition>
                <v-btn
                  color="primary"
                  large
                  :loading="loading"
                  :disabled="!imageFile"
                  @click="submitImage"
                  class="pulse-btn"
                >
                  <v-icon left>mdi-check-circle</v-icon>
                  开始检测
                  <template v-slot:loader>
                    <div class="custom-loader">
                      <v-icon>mdi-image-search</v-icon>
                      <span>检测中...</span>
                    </div>
                  </template>
                </v-btn>
              </v-scale-transition>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-fade-transition>

    <v-dialog v-model="fullscreenPreview" fullscreen transition="dialog-bottom-transition">
      <v-card>
        <v-toolbar dark color="primary">
          <v-btn icon dark @click="toggleFullscreen">
            <v-icon>mdi-close</v-icon>
          </v-btn>
          <v-toolbar-title>图片预览</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn icon dark @click="rotateImage">
            <v-icon>mdi-rotate-right</v-icon>
          </v-btn>
          <v-btn icon dark @click="zoomIn">
            <v-icon>mdi-magnify-plus</v-icon>
          </v-btn>
          <v-btn icon dark @click="zoomOut">
            <v-icon>mdi-magnify-minus</v-icon>
          </v-btn>
          <v-btn icon dark @click="resetZoom">
            <v-icon>mdi-refresh</v-icon>
          </v-btn>
        </v-toolbar>
        <div class="fullscreen-image-container" @wheel="handleZoom">
          <img
            :src="imagePreview"
            class="fullscreen-image"
            :style="{ transform: `scale(${zoomLevel}) rotate(${imageRotation}deg)` }"
            draggable="false"
          />
        </div>
      </v-card>
    </v-dialog>

    <v-slide-y-transition>
      <v-card v-if="result" class="mx-auto elevation-4 result-card" max-width="800">
        <v-card-title class="text-h5" :class="resultClass">
          <v-icon
            left
            :color="resultClass === 'success--text' ? 'success' : 'error'"
            class="icon-pulse"
          >
            {{ resultClass === 'success--text' ? 'mdi-check-circle' : 'mdi-alert-circle' }}
          </v-icon>
          <span class="result-title">检测结果: {{ result.class_name }}</span>
        </v-card-title>

        <v-card-text>
          <v-row>
            <v-col cols="12" sm="6">
              <v-slide-x-transition>
                <v-card outlined hover class="elevation-2 confidence-card">
                  <v-card-title class="subtitle-1">
                    <v-icon left small>mdi-percent</v-icon>
                    置信度
                  </v-card-title>
                  <v-card-text>
                    <v-progress-linear
                      :value="result.confidence * 100"
                      height="25"
                      :color="resultClass === 'success--text' ? 'success' : 'error'"
                      striped
                      class="confidence-progress"
                    >
                      <template v-slot:default>
                        <strong>{{ (result.confidence * 100).toFixed(2) }}%</strong>
                      </template>
                    </v-progress-linear>
                  </v-card-text>
                </v-card>
              </v-slide-x-transition>
            </v-col>

            <v-col cols="12" sm="6">
              <v-slide-x-reverse-transition>
                <v-card outlined hover class="elevation-2">
                  <v-card-title class="subtitle-1">
                    <v-icon left small>mdi-chart-bar</v-icon>
                    概率分布
                  </v-card-title>
                  <v-card-text>
                    <v-simple-table dense>
                      <template v-slot:default>
                        <thead>
                          <tr>
                            <th class="text-left" width="120">类别</th>
                            <th class="text-left">概率</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr
                            v-for="(value, key, index) in result.probabilities"
                            :key="key"
                            class="probability-row"
                            :style="{ animationDelay: `${index * 0.2}s` }"
                          >
                            <td width="120">{{ key }}</td>
                            <td>
                              <div class="probability-outer">
                                <div
                                  class="probability-bar"
                                  :style="{
                                    width: `${value * 100}%`,
                                    backgroundColor:
                                      key === '无划痕'
                                        ? 'var(--v-success-base)'
                                        : 'var(--v-error-base)',
                                  }"
                                >
                                  <span class="probability-text"
                                    >{{ (value * 100).toFixed(2) }}%</span
                                  >
                                </div>
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </template>
                    </v-simple-table>
                  </v-card-text>
                </v-card>
              </v-slide-x-reverse-transition>
            </v-col>
          </v-row>

          <v-row class="mt-3">
            <v-col cols="12">
              <v-expand-transition>
                <v-card outlined hover class="elevation-2 details-card">
                  <v-card-title class="subtitle-1">
                    <v-icon left small>mdi-information</v-icon>
                    检测详情
                  </v-card-title>
                  <v-card-text>
                    <v-list dense>
                      <v-list-item
                        v-for="(item, index) in detailsItems"
                        :key="index"
                        class="detail-item"
                        :style="{ animationDelay: `${index * 0.15}s` }"
                      >
                        <v-list-item-icon>
                          <v-icon small>{{ item.icon }}</v-icon>
                        </v-list-item-icon>
                        <v-list-item-content>
                          <v-list-item-title>{{ item.title }}: {{ item.value }}</v-list-item-title>
                        </v-list-item-content>
                      </v-list-item>
                    </v-list>
                  </v-card-text>
                </v-card>
              </v-expand-transition>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-slide-y-transition>

    <v-snackbar v-model="snackbar" :color="snackbarColor" top>
      <v-icon left>{{ snackbarIcon }}</v-icon>
      {{ snackbarText }}
      <template v-slot:action="{ attrs }">
        <v-btn text v-bind="attrs" @click="snackbar = false" class="pulse-once"> 关闭 </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup>
import axios from 'axios'
import { ref, computed, watch } from 'vue'

// 响应式状态
const imageFile = ref(null)
const imagePreview = ref(null)
const loading = ref(false)
const result = ref(null)
const snackbar = ref(false)
const snackbarText = ref('')
const snackbarColor = ref('info')
const errorMessage = ref('')
const imageRotation = ref(0)
const fullscreenPreview = ref(false)
const zoomLevel = ref(1)
const showMagnifier = ref(false)
const magnifierPosition = ref({ x: 0, y: 0 })
const magnifierSize = ref(150)

// 新增变量
const imageZoom = ref(1)
const imagePosition = ref({ x: 0, y: 0 })
const isDragging = ref(false)
const dragStart = ref({ x: 0, y: 0 })

// 计算属性
const resultClass = computed(() => {
  if (!result.value) return ''
  return result.value.class_name === '无划痕' ? 'success--text' : 'error--text'
})

const snackbarIcon = computed(() => {
  switch (snackbarColor.value) {
    case 'success':
      return 'mdi-check-circle'
    case 'error':
      return 'mdi-alert-circle'
    default:
      return 'mdi-information'
  }
})

const magnifierStyle = computed(() => {
  return {
    left: `${magnifierPosition.value.x}px`,
    top: `${magnifierPosition.value.y}px`,
    width: `${magnifierSize.value}px`,
    height: `${magnifierSize.value}px`,
    backgroundImage: `url(${imagePreview.value})`,
    backgroundPosition: `calc(-${magnifierPosition.value.x - magnifierSize.value / 2}px + 50%) calc(-${magnifierPosition.value.y - magnifierSize.value / 2}px + 50%)`,
    backgroundSize: '200%',
    transform: `rotate(${imageRotation.value}deg)`,
  }
})

const detailsItems = computed(() => {
  if (!result.value) return []

  return [
    { icon: 'mdi-numeric', title: '预测类别代码', value: result.value.predicted_class },
    { icon: 'mdi-cog', title: 'TTA增强', value: result.value.tta_used ? '已启用' : '未启用' },
    { icon: 'mdi-folder', title: '图片路径', value: result.value.image_path },
  ]
})

// 方法
const previewImage = (file) => {
  errorMessage.value = ''
  resetImage() // 重置图片状态

  if (!file) {
    imagePreview.value = null
    return
  }

  // 检查文件大小（限制为10MB）
  if (file.size > 10 * 1024 * 1024) {
    errorMessage.value = '图片大小不能超过10MB'
    imageFile.value = null
    return
  }

  // 创建图片预览
  const reader = new FileReader()
  reader.onload = (e) => {
    imagePreview.value = null // 先清空，制造闪烁效果
    setTimeout(() => {
      imagePreview.value = e.target.result

      // 预加载图片以获取尺寸信息
      const img = new Image()
      img.onload = () => {
        // 可以在这里获取图片尺寸信息
        console.log(`图片尺寸: ${img.width}x${img.height}`)
      }
      img.src = e.target.result
    }, 300)
  }
  reader.readAsDataURL(file)
}

const rotateImage = () => {
  imageRotation.value = (imageRotation.value + 90) % 360
}

const toggleFullscreen = () => {
  fullscreenPreview.value = !fullscreenPreview.value
}

const zoomIn = () => {
  zoomLevel.value = Math.min(zoomLevel.value + 0.2, 3)
}

const zoomOut = () => {
  zoomLevel.value = Math.max(zoomLevel.value - 0.2, 0.5)
}

const resetZoom = () => {
  zoomLevel.value = 1
  imageRotation.value = 0
}

const handleZoom = (event) => {
  if (event.deltaY < 0) {
    zoomIn()
  } else {
    zoomOut()
  }
  event.preventDefault()
}

const updateMagnifier = (event) => {
  const rect = event.target.getBoundingClientRect()
  magnifierPosition.value = {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  }
}

const convertToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = (error) => reject(error)
    reader.readAsDataURL(file)
  })
}

const showSnackbar = (text, color = 'info') => {
  snackbarText.value = text
  snackbarColor.value = color
  snackbar.value = true
}

const submitImage = async () => {
  if (!imageFile.value) return

  loading.value = true
  // 先清空上次结果
  result.value = null

  try {
    // 转换图片为base64
    const base64Data = await convertToBase64(imageFile.value)

    console.log('正在提交图片数据...')

    // 发送到后端
    const response = await axios.post(
      'http://localhost:8000/scratch_detect/',
      {
        image_data: base64Data,
        file_name: imageFile.value.name || 'uploaded_image.jpg',
        content_type: imageFile.value.type || 'image/jpeg',
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )

    // 模拟延迟以展示动画效果
    await new Promise((resolve) => setTimeout(resolve, 800))

    // 处理结果
    if (response.data.success) {
      result.value = response.data
      showSnackbar('检测完成', 'success')
    } else {
      showSnackbar('检测失败: ' + (response.data.message || '未知错误'), 'error')
    }
  } catch (error) {
    console.error('检测出错:', error)

    // 更详细的错误信息记录
    if (error.response) {
      console.error('服务器响应:', error.response.data)
      console.error('状态码:', error.response.status)
      showSnackbar(
        `服务器错误 (${error.response.status}): ${error.response.data.detail || '未知错误'}`,
        'error',
      )
    } else if (error.request) {
      console.error('未收到响应:', error.request)
      showSnackbar('服务器未响应，请检查后端服务是否运行', 'error')
    } else {
      showSnackbar('请求错误: ' + error.message, 'error')
    }
  } finally {
    loading.value = false
  }
}

// 新增方法
const resetImage = () => {
  imageZoom.value = 1
  imageRotation.value = 0
  imagePosition.value = { x: 0, y: 0 }
}

const handleImageWheel = (e) => {
  const delta = e.deltaY > 0 ? -0.1 : 0.1
  imageZoom.value = Math.max(0.5, Math.min(5, imageZoom.value + delta))
}

const startDrag = (e) => {
  isDragging.value = true
  dragStart.value = {
    x: e.clientX - imagePosition.value.x,
    y: e.clientY - imagePosition.value.y,
  }
}

const onDrag = (e) => {
  if (isDragging.value) {
    imagePosition.value = {
      x: e.clientX - dragStart.value.x,
      y: e.clientY - dragStart.value.y,
    }
  }
}

const stopDrag = () => {
  isDragging.value = false
}

const formatFileSize = (bytes) => {
  if (bytes < 1024) return bytes + ' B'
  else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB'
  else return (bytes / 1048576).toFixed(1) + ' MB'
}
</script>

<style scoped>
.v-card {
  border-radius: 8px;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.v-card:hover {
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2) !important;
  transform: translateY(-3px);
}

@keyframes rotate360 {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.file-input-grow {
  transition: all 0.3s ease;
}

.file-input-grow:hover {
  transform: scale(1.02);
}

.file-chip {
  animation: chipPulse 2s infinite;
}

@keyframes chipPulse {
  0% {
    opacity: 0.8;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.8;
  }
}

.preview-container {
  position: relative;
  overflow: hidden;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.preview-container:hover {
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  transform: scale(1.02);
}

.preview-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  opacity: 0;
  transition: opacity 0.3s ease;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1;
}

.preview-container:hover .preview-overlay {
  opacity: 1;
}

.preview-image {
  transition: transform 0.5s ease !important;
}

.zoom-btn {
  position: absolute;
  right: 10px;
  top: 10px;
  background: rgba(0, 0, 0, 0.5) !important;
}

.rotate-btn {
  position: absolute;
  right: 10px;
  bottom: 10px;
  background: rgba(0, 0, 0, 0.5) !important;
}

.preview-transition {
  transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) !important;
}

.pulse-btn {
  position: relative;
  overflow: hidden;
  transform: translate3d(0, 0, 0);
}

.pulse-btn::after {
  content: '';
  display: block;
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  pointer-events: none;
  background-image: radial-gradient(circle, #fff 10%, transparent 10.01%);
  background-repeat: no-repeat;
  background-position: 50%;
  transform: scale(10, 10);
  opacity: 0;
  transition:
    transform 0.5s,
    opacity 1s;
}

.pulse-btn:active::after {
  transform: scale(0, 0);
  opacity: 0.3;
  transition: 0s;
}

.result-card {
  animation: slideUp 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes slideUp {
  from {
    transform: translateY(30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.confidence-card {
  transition: all 0.3s ease;
}

.confidence-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2) !important;
}

.confidence-progress {
  animation: progressGrow 1s ease-out;
}

@keyframes progressGrow {
  from {
    width: 0%;
  }
  to {
    width: 100%;
  }
}

.probability-row {
  animation: fadeInUp 0.5s both;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.probability-outer {
  position: relative;
  height: 30px;
  width: 100%;
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: 4px;
  overflow: hidden;
  margin: 4px 0;
}

.probability-bar {
  position: relative;
  height: 100%;
  min-width: 60px; /* 确保即使百分比很小也有足够空间显示文字 */
  display: flex;
  align-items: center;
  justify-content: center;
  transition: width 1s ease-out;
  animation: barGrow 1s ease-out;
}

.probability-text {
  position: relative;
  font-weight: bold;
  text-shadow: 0px 0px 2px rgba(0, 0, 0, 0.7);
  color: white;
  padding: 0 8px;
  white-space: nowrap;
  z-index: 1;
}

@keyframes barGrow {
  from {
    width: 0%;
  }
  to {
    width: 100%;
  }
}

.details-card {
  animation: expandDown 0.5s ease-out;
}

@keyframes expandDown {
  from {
    max-height: 0;
    opacity: 0;
  }
  to {
    max-height: 500px;
    opacity: 1;
  }
}

.detail-item {
  animation: fadeIn 0.5s both;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.title-text {
  position: relative;
  display: inline-block;
}

.title-text::after {
  content: '';
  position: absolute;
  width: 0;
  height: 2px;
  bottom: -4px;
  left: 0;
  background-color: var(--v-primary-base);
  transition: width 0.3s;
}

.title-text:hover::after {
  width: 100%;
}

.icon-pulse {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

.result-title {
  position: relative;
  overflow: hidden;
}

.result-title::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 100%;
  height: 2px;
  background: currentColor;
  transform: translateX(-100%);
  animation: slideRight 1s forwards;
}

@keyframes slideRight {
  to {
    transform: translateX(0);
  }
}

.pulse-once {
  animation: pulseOnce 0.5s;
}

@keyframes pulseOnce {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}

.fullscreen-image-container {
  width: 100%;
  height: calc(100vh - 64px);
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #121212;
  overflow: hidden;
}

.fullscreen-image {
  max-width: 90%;
  max-height: 90%;
  object-fit: contain;
  transition: transform 0.3s ease;
}

.custom-loader {
  display: flex;
  align-items: center;
  color: white;
}

.custom-loader i {
  animation: searchScan 1.5s infinite;
  margin-right: 8px;
}

@keyframes searchScan {
  0% {
    transform: translateY(-5px);
  }
  50% {
    transform: translateY(5px);
  }
  100% {
    transform: translateY(-5px);
  }
}

.magnifier {
  position: absolute;
  border-radius: 50%;
  border: 2px solid white;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  pointer-events: none;
  z-index: 10;
}

.image-preview-card {
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.preview-header {
  padding: 12px 16px;
  background-color: rgba(0, 0, 0, 0.02);
}

.preview-actions {
  display: flex;
  align-items: center;
}

.image-viewer {
  position: relative;
  height: 400px;
  width: 100%;
  background-color: #f5f5f5;
  overflow: hidden;
  cursor: grab;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-viewer:active {
  cursor: grabbing;
}

.preview-img {
  position: absolute;
  top: 50%;
  left: 50%;
  transform-origin: center;
  max-width: none;
  max-height: none;
  width: auto;
  height: auto;
  max-width: 90%;
  max-height: 90%;
  transition: transform 0.1s ease;
  object-fit: contain;
}

.zoom-controls {
  position: absolute;
  right: 16px;
  top: 16px;
  z-index: 5;
  background-color: rgba(255, 255, 255, 0.7);
  border-radius: 4px;
  padding: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.image-info {
  padding: 12px 16px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.02);
}

.preview-container.improved {
  position: relative;
  box-shadow: none;
  transform: none;
  overflow: visible;
  border-radius: 0;
}

.preview-instructions {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  background-color: rgba(0, 0, 0, 0.03);
  color: rgba(0, 0, 0, 0.6);
}
</style>
