<template>
  <v-container fluid class="scratch-detection-container">
    <!-- Header Section with Enhanced Design -->
    <v-row class="mb-8">
      <v-col cols="12">
        <v-card
          class="header-card elevation-8"
          color="primary"
          :dark="!themeStore.isDarkMode"
          :light="themeStore.isDarkMode"
        >
          <v-card-title class="text-h3 font-weight-light d-flex align-center pa-8">
            <v-avatar
              size="80"
              class="mr-6"
              :color="themeStore.isDarkMode ? 'primary' : 'white'"
              elevation="4"
            >
              <v-icon size="48" :color="themeStore.isDarkMode ? 'white' : 'primary'">
                mdi-image-search
              </v-icon>
            </v-avatar>
            <div>
              <div class="text-h3 font-weight-light mb-2">划痕检测系统</div>
              <div
                class="text-h6 font-weight-regular"
                :class="themeStore.isDarkMode ? 'white--text' : 'primary--text'"
              >
                <v-icon left :color="themeStore.isDarkMode ? 'white' : 'primary'">
                  mdi-artificial-intelligence
                </v-icon>
                智能图像分析 · 精准缺陷识别
              </div>
            </div>
            <v-spacer></v-spacer>
            <div class="header-stats">
              <v-chip
                :color="themeStore.isDarkMode ? 'primary' : 'white'"
                :text-color="themeStore.isDarkMode ? 'white' : 'primary'"
                class="ma-1"
                label
              >
                <v-icon left small>mdi-check-circle</v-icon>
                83% 准确率
              </v-chip>
              <v-chip
                :color="themeStore.isDarkMode ? 'primary' : 'white'"
                :text-color="themeStore.isDarkMode ? 'white' : 'primary'"
                class="ma-1"
                label
              >
                <v-icon left small>mdi-flash</v-icon>
                毫秒级响应
              </v-chip>
            </div>
          </v-card-title>
        </v-card>
      </v-col>
    </v-row>

    <!-- Main Content Area -->
    <v-row class="mb-6">
      <!-- Upload Section -->
      <v-col cols="12" md="6">
        <v-card class="upload-card elevation-6 h-100" :class="{ 'drag-over': isDragOver }">
          <v-card-title class="text-h5 primary--text">
            <v-icon left color="primary" size="28">mdi-cloud-upload</v-icon>
            图片上传
            <v-spacer></v-spacer>
            <v-chip v-if="imageFile" color="success" outlined small>
              <v-icon left small>mdi-check</v-icon>
              已选择文件
            </v-chip>
          </v-card-title>
          <v-divider></v-divider>
          <v-card-text class="pa-6">
            <div
              class="upload-zone"
              :class="{ 'drag-active': isDragOver }"
              @dragover.prevent="handleDragOver"
              @dragleave.prevent="handleDragLeave"
              @drop.prevent="handleDrop"
            >
              <div class="upload-content">
                <v-icon size="64" color="primary" class="mb-4 upload-icon">
                  {{ imageFile ? 'mdi-check-circle' : 'mdi-cloud-upload-outline' }}
                </v-icon>
                <h3 class="text-h6 mb-2 primary--text">
                  {{ imageFile ? '文件已选择' : '拖拽图片到此处或点击选择' }}
                </h3>
                <p class="text-body-2 grey--text mb-4">支持 JPG、PNG、WEBP 格式，最大 10MB</p>
                <!-- 隐藏的文件输入 -->
                <input
                  type="file"
                  ref="fileInput"
                  accept="image/*"
                  @change="handleFileSelect"
                  style="display: none"
                />

                <v-btn color="primary" large outlined class="upload-btn" @click="triggerFileInput">
                  <v-icon left>mdi-folder-open</v-icon>
                  选择文件
                </v-btn>
              </div>
            </div>

            <!-- File Info Display -->
            <v-expand-transition>
              <div v-if="imageFile" class="file-info mt-4">
                <v-card outlined class="pa-4">
                  <v-row align="center">
                    <v-col cols="auto">
                      <v-avatar size="48" color="primary">
                        <v-icon color="white">mdi-file-image</v-icon>
                      </v-avatar>
                    </v-col>
                    <v-col>
                      <div class="text-subtitle-1 font-weight-medium">{{ imageFile.name }}</div>
                      <div class="text-caption grey--text">
                        {{ formatFileSize(imageFile.size) }} · {{ imageFile.type }}
                      </div>
                    </v-col>
                    <v-col cols="auto">
                      <v-btn icon color="error" @click="clearFile">
                        <v-icon>mdi-close</v-icon>
                      </v-btn>
                    </v-col>
                  </v-row>
                </v-card>
              </div>
            </v-expand-transition>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Info and Controls Section -->
      <v-col cols="12" md="6">
        <v-card class="info-card elevation-6 h-100">
          <v-card-title class="text-h5 secondary--text">
            <v-icon left color="secondary" size="28">mdi-information</v-icon>
            检测信息
          </v-card-title>
          <v-divider></v-divider>
          <v-card-text class="pa-6">
            <!-- 系统信息 -->
            <div class="mb-6">
              <h3 class="text-h6 mb-3 secondary--text">
                <v-icon left color="secondary">mdi-cog</v-icon>
                系统状态
              </h3>
              <v-row>
                <v-col cols="6">
                  <v-card outlined class="pa-3 text-center">
                    <v-icon size="32" color="success" class="mb-2">mdi-check-circle</v-icon>
                    <div class="text-subtitle-2">AI 模型</div>
                    <div class="text-caption grey--text">已就绪</div>
                  </v-card>
                </v-col>
                <v-col cols="6">
                  <v-card outlined class="pa-3 text-center">
                    <v-icon size="32" color="info" class="mb-2">mdi-speedometer</v-icon>
                    <div class="text-subtitle-2">响应时间</div>
                    <div class="text-caption grey--text">&lt; 500ms</div>
                  </v-card>
                </v-col>
              </v-row>
            </div>

            <!-- 检测选项 -->
            <div class="mb-6">
              <h3 class="text-h6 mb-3 secondary--text">
                <v-icon left color="secondary">mdi-tune</v-icon>
                检测选项
              </h3>
              <v-card outlined class="pa-4">
                <v-switch
                  v-model="useAdvancedMode"
                  label="高精度模式"
                  color="primary"
                  hide-details
                  class="mb-2"
                ></v-switch>
                <div class="text-caption grey--text mb-3">使用 TTA 增强技术提高检测精度</div>

                <v-switch
                  v-model="saveResults"
                  label="保存结果"
                  color="secondary"
                  hide-details
                ></v-switch>
                <div class="text-caption grey--text">将检测结果保存到本地记录</div>
              </v-card>
            </div>

            <!-- 使用说明 -->
            <div>
              <h3 class="text-h6 mb-3 secondary--text">
                <v-icon left color="secondary">mdi-help-circle</v-icon>
                使用说明
              </h3>
              <v-timeline dense>
                <v-timeline-item color="primary" small>
                  <div class="text-body-2">上传或拖拽图片文件</div>
                </v-timeline-item>
                <v-timeline-item color="secondary" small>
                  <div class="text-body-2">预览并调整图片</div>
                </v-timeline-item>
                <v-timeline-item color="success" small>
                  <div class="text-body-2">开始 AI 检测分析</div>
                </v-timeline-item>
                <v-timeline-item color="info" small>
                  <div class="text-body-2">查看检测结果</div>
                </v-timeline-item>
              </v-timeline>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Enhanced Image Preview Section -->
    <v-row class="mb-6">
      <v-col cols="12">
        <v-expand-transition>
          <div v-if="imagePreview">
            <v-card class="preview-card elevation-8">
              <v-card-title class="text-h5 secondary--text">
                <v-icon left color="secondary" size="28">mdi-image-multiple</v-icon>
                图片预览
                <v-spacer></v-spacer>
                <div class="preview-toolbar">
                  <v-btn-toggle v-model="previewMode" mandatory class="mr-3">
                    <v-btn small value="fit">
                      <v-icon small>mdi-fit-to-page</v-icon>
                    </v-btn>
                    <v-btn small value="fill">
                      <v-icon small>mdi-fullscreen</v-icon>
                    </v-btn>
                  </v-btn-toggle>

                  <v-tooltip bottom>
                    <template v-slot:activator="{ on, attrs }">
                      <v-btn icon v-bind="attrs" v-on="on" @click="rotateImage" class="mr-1">
                        <v-icon>mdi-rotate-right</v-icon>
                      </v-btn>
                    </template>
                    <span>旋转 90°</span>
                  </v-tooltip>

                  <v-tooltip bottom>
                    <template v-slot:activator="{ on, attrs }">
                      <v-btn icon v-bind="attrs" v-on="on" @click="toggleFullscreen" class="mr-1">
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
                    <span>重置视图</span>
                  </v-tooltip>
                </div>
              </v-card-title>
              <v-divider></v-divider>

              <v-card-text class="pa-0">
                <div class="enhanced-preview-container">
                  <!-- Zoom Controls -->
                  <div class="floating-controls">
                    <v-card class="zoom-panel elevation-4" outlined>
                      <v-card-text class="pa-2">
                        <div class="zoom-controls-vertical">
                          <v-btn
                            icon
                            small
                            color="primary"
                            @click="zoomIn"
                            :disabled="imageZoom >= 5"
                          >
                            <v-icon>mdi-plus</v-icon>
                          </v-btn>
                          <div class="zoom-display">{{ Math.round(imageZoom * 100) }}%</div>
                          <v-btn
                            icon
                            small
                            color="primary"
                            @click="zoomOut"
                            :disabled="imageZoom <= 0.1"
                          >
                            <v-icon>mdi-minus</v-icon>
                          </v-btn>
                        </div>
                      </v-card-text>
                    </v-card>
                  </div>

                  <!-- Image Viewer -->
                  <div
                    class="advanced-image-viewer"
                    :class="{ dragging: isDragging }"
                    @wheel.prevent="handleImageWheel"
                    @mousedown="startDrag"
                    @mousemove="onDrag"
                    @mouseup="stopDrag"
                    @mouseleave="stopDrag"
                    @dblclick="resetImage"
                  >
                    <div class="image-container">
                      <img
                        :src="imagePreview"
                        class="enhanced-preview-img"
                        :style="imageTransformStyle"
                        @load="onImageLoad"
                        draggable="false"
                      />

                      <!-- Loading Overlay -->
                      <div v-if="imageLoading" class="image-loading-overlay">
                        <v-progress-circular
                          indeterminate
                          color="primary"
                          size="64"
                        ></v-progress-circular>
                        <div class="mt-4 text-h6">加载中...</div>
                      </div>
                    </div>
                  </div>

                  <!-- Image Information Panel -->
                  <div class="image-info-panel">
                    <v-row align="center" no-gutters>
                      <v-col>
                        <div class="info-chips">
                          <v-chip small class="mr-2" color="primary" outlined>
                            <v-icon left small>mdi-file-image</v-icon>
                            {{ imageFile?.name || '未知文件' }}
                          </v-chip>
                          <v-chip small class="mr-2" color="secondary" outlined>
                            <v-icon left small>mdi-resize</v-icon>
                            {{ imageDimensions }}
                          </v-chip>
                          <v-chip small class="mr-2" color="accent" outlined>
                            <v-icon left small>mdi-file-size</v-icon>
                            {{ imageFile ? formatFileSize(imageFile.size) : '未知大小' }}
                          </v-chip>
                          <v-chip small color="info" outlined>
                            <v-icon left small>mdi-magnify</v-icon>
                            {{ Math.round(imageZoom * 100) }}%
                          </v-chip>
                        </div>
                      </v-col>
                      <v-col cols="auto">
                        <div class="preview-instructions">
                          <v-icon small class="mr-1">mdi-information-outline</v-icon>
                          <small>滚轮缩放 · 双击重置 · 拖拽移动</small>
                        </div>
                      </v-col>
                    </v-row>
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </div>
        </v-expand-transition>
      </v-col>
    </v-row>

    <!-- Detection Button Section -->
    <v-row class="mb-6">
      <v-col cols="12">
        <v-expand-transition>
          <v-card v-if="imageFile" class="detection-card elevation-6">
            <v-card-text class="pa-6">
              <v-row align="center">
                <v-col cols="12" md="8">
                  <div class="d-flex align-center">
                    <v-icon size="48" color="primary" class="mr-4">
                      mdi-artificial-intelligence
                    </v-icon>
                    <div>
                      <h3 class="text-h5 mb-1 primary--text">准备开始 AI 检测</h3>
                      <p class="text-body-2 grey--text mb-0">
                        AI 模型将分析您的图片，识别可能存在的划痕缺陷
                      </p>
                    </div>
                  </div>
                </v-col>
                <v-col cols="12" md="4" class="text-center">
                  <v-btn
                    color="primary"
                    x-large
                    :loading="loading"
                    :disabled="!imageFile"
                    @click="submitImage"
                    class="detection-btn elevation-4"
                    block
                  >
                    <v-icon left size="24">mdi-rocket-launch</v-icon>
                    开始检测
                    <template v-slot:loader>
                      <div class="custom-loader">
                        <v-icon class="rotating">mdi-cog</v-icon>
                        <span class="ml-2">分析中...</span>
                      </div>
                    </template>
                  </v-btn>
                </v-col>
              </v-row>

              <v-expand-transition>
                <div v-if="loading" class="loading-progress mt-4">
                  <v-progress-linear
                    :value="loadingProgress"
                    height="8"
                    color="primary"
                    striped
                    class="mb-2"
                  ></v-progress-linear>
                  <div class="text-caption text-center">{{ loadingText }}</div>
                </div>
              </v-expand-transition>
            </v-card-text>
          </v-card>
        </v-expand-transition>
      </v-col>
    </v-row>

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
import { ref, computed } from 'vue'
import { useThemeStore } from '@/stores/theme'

// 主题store
const themeStore = useThemeStore()

// 模板引用
const fileInput = ref(null)

// 响应式变量
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

// 新增的响应式变量
const imageZoom = ref(1)
const imagePosition = ref({ x: 0, y: 0 })
const isDragging = ref(false)
const dragStart = ref({ x: 0, y: 0 })
const isDragOver = ref(false)
const previewMode = ref('fit')
const imageLoading = ref(false)
const imageDimensions = ref('未知')
const useAdvancedMode = ref(false)
const saveResults = ref(true)
const loadingProgress = ref(0)
const loadingText = ref('准备中...')

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

const imageTransformStyle = computed(() => {
  return {
    transform: `translate(-50%, -50%) translate(${imagePosition.value.x}px, ${imagePosition.value.y}px) scale(${imageZoom.value}) rotate(${imageRotation.value}deg)`,
    transition: isDragging.value ? 'none' : 'transform 0.3s ease',
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

// 计算方法
const previewImage = (file) => {
  errorMessage.value = ''
  resetImage()

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
  imageLoading.value = true
  const reader = new FileReader()
  reader.onload = (e) => {
    imagePreview.value = e.target.result

    // 预加载图片以获取尺寸信息
    const img = new Image()
    img.onload = () => {
      imageDimensions.value = `${img.width} × ${img.height}`
      imageLoading.value = false
      console.log(`图片尺寸: ${img.width}x${img.height}`)
    }
    img.onerror = () => {
      imageLoading.value = false
      errorMessage.value = '图片加载失败'
    }
    img.src = e.target.result
  }
  reader.onerror = () => {
    imageLoading.value = false
    errorMessage.value = '文件读取失败'
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

// 新增方法
const handleDragOver = (event) => {
  event.preventDefault()
  isDragOver.value = true
}

const handleDragLeave = (event) => {
  event.preventDefault()
  isDragOver.value = false
}

const handleDrop = (event) => {
  event.preventDefault()
  isDragOver.value = false

  const files = event.dataTransfer.files
  if (files.length > 0) {
    const file = files[0]
    // 验证文件类型
    if (file.type.startsWith('image/')) {
      imageFile.value = file
      previewImage(file)
    } else {
      errorMessage.value = '请选择图片文件'
    }
  }
}

const clearFile = () => {
  imageFile.value = null
  imagePreview.value = null
  result.value = null
  errorMessage.value = ''
  // 清除原生文件输入的值
  if (fileInput.value) {
    fileInput.value.value = ''
  }
  resetImage()
}

const triggerFileInput = () => {
  if (fileInput.value) {
    fileInput.value.click()
  }
}

const handleFileSelect = (event) => {
  const file = event.target.files[0]
  if (file) {
    imageFile.value = file
    previewImage(file)
  }
}

const onImageLoad = () => {
  imageLoading.value = false
  // 获取图片尺寸
  const img = new Image()
  img.onload = () => {
    imageDimensions.value = `${img.width} × ${img.height}`
  }
  img.src = imagePreview.value
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
  loadingProgress.value = 0
  result.value = null

  try {
    // 模拟加载进度
    const progressSteps = [
      { progress: 20, text: '准备图片数据...' },
      { progress: 40, text: '上传到服务器...' },
      { progress: 60, text: 'AI 模型分析中...' },
      { progress: 80, text: '处理检测结果...' },
      { progress: 100, text: '检测完成！' },
    ]

    for (const step of progressSteps) {
      loadingProgress.value = step.progress
      loadingText.value = step.text
      await new Promise((resolve) => setTimeout(resolve, 500))
    }

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
        use_tta: useAdvancedMode.value,
        save_result: saveResults.value,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )

    // 处理结果
    if (response.data.success) {
      result.value = response.data
      showSnackbar('AI 检测完成！', 'success')
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
    loadingProgress.value = 0
    loadingText.value = '准备中...'
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
/* Container Styles */
.scratch-detection-container {
  min-height: 100vh;
  padding: 24px;
}

/* Header Card */
.header-card {
  border-radius: 16px !important;
  margin-bottom: 32px;
}

.header-stats {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

/* Upload Card */
.upload-card {
  border-radius: 16px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.upload-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15) !important;
}

.upload-card.drag-over {
  border: 2px dashed var(--v-primary-base);
  background-color: rgba(var(--v-primary-base), 0.05);
}

/* Info Card */
.info-card {
  border-radius: 16px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.info-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15) !important;
}

/* Height consistency */
.h-100 {
  height: 100% !important;
}

.upload-zone {
  border: 2px dashed #e0e0e0;
  border-radius: 12px;
  padding: 48px 24px;
  text-align: center;
  transition: all 0.3s ease;
}

.upload-zone.drag-active {
  border-color: var(--v-primary-base);
  background-color: rgba(var(--v-primary-base), 0.05);
  transform: scale(1.02);
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.upload-icon {
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

.upload-btn {
  border-radius: 24px !important;
  text-transform: none !important;
  font-weight: 500 !important;
  padding: 12px 32px !important;
}

.file-info {
  animation: slideInUp 0.5s ease-out;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Preview Card */
.preview-card {
  border-radius: 16px;
  overflow: hidden;
  animation: slideInUp 0.6s ease-out;
}

.preview-toolbar {
  display: flex;
  align-items: center;
}

.enhanced-preview-container {
  position: relative;
}

.floating-controls {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 10;
}

.zoom-panel {
  border-radius: 8px;
  backdrop-filter: blur(10px);
}

.zoom-controls-vertical {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.zoom-display {
  font-size: 12px;
  font-weight: 500;
  color: var(--v-primary-base);
  min-width: 40px;
  text-align: center;
}

.advanced-image-viewer {
  position: relative;
  height: 500px;
  width: 100%;
  background:
    linear-gradient(45deg, #f0f0f0 25%, transparent 25%),
    linear-gradient(-45deg, #f0f0f0 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #f0f0f0 75%),
    linear-gradient(-45deg, transparent 75%, #f0f0f0 75%);
  background-size: 20px 20px;
  background-position:
    0 0,
    0 10px,
    10px -10px,
    -10px 0px;
  overflow: hidden;
  cursor: grab;
  display: flex;
  align-items: center;
  justify-content: center;
}

.advanced-image-viewer.dragging {
  cursor: grabbing;
}

.image-container {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.enhanced-preview-img {
  position: absolute;
  top: 50%;
  left: 50%;
  transform-origin: center;
  max-width: 90%;
  max-height: 90%;
  object-fit: contain;
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.image-loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 5;
}

.image-info-panel {
  padding: 16px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

.info-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.preview-instructions {
  display: flex;
  align-items: center;
  color: rgba(0, 0, 0, 0.6);
  font-size: 12px;
}

/* Detection Card */
.detection-card {
  border-radius: 16px;
  animation: slideInUp 0.6s ease-out;
}

.detection-content {
  text-align: center;
}

.detection-icon {
  animation: pulse 2s infinite;
}

.option-card {
  border-radius: 12px;
  transition: all 0.3s ease;
  height: 100%;
}

.option-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
}

.detection-btn {
  border-radius: 24px !important;
  text-transform: none !important;
  font-weight: 600 !important;
  padding: 16px 32px !important;
  position: relative;
  overflow: hidden;
  line-height: 16 px;
}

.detection-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.detection-btn:hover::before {
  left: 100%;
}

.custom-loader {
  display: flex;
  align-items: center;
  color: white;
}

.rotating {
  animation: rotate 2s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.loading-progress {
  animation: fadeIn 0.5s ease-out;
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

/* Common Animations */
@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
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

/* Button Enhancements */
.v-btn {
  border-radius: 8px !important;
  text-transform: none !important;
  font-weight: 500 !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

.v-btn:hover:not(.v-btn--disabled) {
  transform: translateY(-2px);
}

/* Card Enhancements */
.v-card {
  border-radius: 12px !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

.v-card:hover {
  transform: translateY(-2px);
}

/* Chip Enhancements */
.v-chip {
  border-radius: 16px !important;
  font-weight: 500 !important;
}

.file-chip {
  animation: chipPulse 2s infinite;
}

@keyframes chipPulse {
  0%,
  100% {
    opacity: 0.8;
  }
  50% {
    opacity: 1;
  }
}

/* Responsive Design */
@media (max-width: 960px) {
  .scratch-detection-container {
    padding: 16px;
  }

  .header-card .v-card-title {
    padding: 24px !important;
    flex-direction: column;
    text-align: center;
  }

  .header-stats {
    align-items: center;
    margin-top: 16px;
  }

  .upload-zone {
    padding: 32px 16px;
  }

  .advanced-image-viewer {
    height: 300px;
  }

  .floating-controls {
    position: relative;
    top: auto;
    right: auto;
    margin-bottom: 16px;
    display: flex;
    justify-content: center;
  }

  .info-chips {
    justify-content: center;
  }
}

@media (max-width: 600px) {
  .header-card .v-card-title {
    padding: 16px !important;
  }

  .detection-card .v-card-text {
    padding: 24px 16px !important;
  }

  .upload-zone {
    padding: 24px 12px;
  }
}

/* Accessibility Improvements */
.v-btn:focus,
.v-text-field:focus-within {
  outline: 2px solid rgba(var(--v-primary-base), 0.5);
  outline-offset: 2px;
}

/* Theme Enhancements */
.theme--light .upload-zone {
  background-color: #ffffff;
  border-color: #e0e0e0;
}

.theme--dark .upload-zone {
  background-color: #2a2a2a;
  border-color: #444;
}

.theme--light .advanced-image-viewer {
  background:
    linear-gradient(45deg, #f0f0f0 25%, transparent 25%),
    linear-gradient(-45deg, #f0f0f0 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #f0f0f0 75%),
    linear-gradient(-45deg, transparent 75%, #f0f0f0 75%);
}

.theme--dark .advanced-image-viewer {
  background:
    linear-gradient(45deg, #333 25%, transparent 25%),
    linear-gradient(-45deg, #333 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #333 75%),
    linear-gradient(-45deg, transparent 75%, #333 75%);
}

.theme--light .image-info-panel {
  background: rgba(255, 255, 255, 0.95);
  border-top-color: rgba(0, 0, 0, 0.1);
}

.theme--dark .image-info-panel {
  background: rgba(42, 42, 42, 0.95);
  border-top-color: rgba(255, 255, 255, 0.1);
}

.theme--light .zoom-panel {
  background: rgba(255, 255, 255, 0.95);
}

.theme--dark .zoom-panel {
  background: rgba(42, 42, 42, 0.95);
}
</style>
