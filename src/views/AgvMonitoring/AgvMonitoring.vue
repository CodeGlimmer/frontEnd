<template>
  <v-container fluid>
    <v-card
      class="ros-viewer-container mb-4 card-elevation-transition"
      variant="elevated"
      rounded="lg"
      :elevation="2"
    >
      <v-card-title class="d-flex align-center py-3 py-sm-4 px-4 px-sm-6 flex-wrap">
        <div class="d-flex align-center">
          <v-icon class="mr-3 text-primary" size="28">mdi-video-wireless-outline</v-icon>
          <span class="font-weight-bold text-h6">ROS视频查看器</span>
        </div>
        <v-spacer></v-spacer>
        <v-btn
          color="primary"
          variant="tonal"
          prepend-icon="mdi-plus"
          @click="addCard"
          :disabled="isAddingCard"
          size="small"
          rounded="pill"
          class="px-4 font-weight-medium btn-transition mt-2 mt-sm-0"
        >
          添加视频卡片
          <v-slide-x-transition>
            <v-icon v-if="!isAddingCard" class="ml-1" end>mdi-arrow-down</v-icon>
          </v-slide-x-transition>
        </v-btn>
      </v-card-title>

      <v-divider></v-divider>

      <v-card-text class="pa-3 pa-sm-4">
        <v-expand-transition>
          <div v-if="isAddingCard" class="mb-4 mb-sm-6">
            <v-card
              variant="outlined"
              class="pa-3 pa-sm-4 card-add-form"
              rounded="lg"
              border="start"
              color="primary"
              elevation="2"
            >
              <div class="d-flex align-center mb-3">
                <v-icon color="primary" class="mr-2">mdi-card-plus-outline</v-icon>
                <span class="text-subtitle-1 font-weight-medium">添加新视频卡片</span>
              </div>
              <v-form ref="cardForm" @submit.prevent="confirmAddCard">
                <v-row dense>
                  <v-col cols="12" sm="12" md="6">
                    <v-text-field
                      v-model="newCard.title"
                      label="卡片标题"
                      variant="outlined"
                      density="comfortable"
                      :rules="[(v) => !!v || '标题不能为空']"
                      prepend-inner-icon="mdi-card-text-outline"
                      class="input-transition"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="12" md="6">
                    <v-text-field
                      v-model="newCard.wsUrl"
                      label="WebSocket URL"
                      variant="outlined"
                      density="comfortable"
                      hint="例如: ws://localhost:9090"
                      persistent-hint
                      prepend-inner-icon="mdi-web"
                      class="input-transition"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="12" md="6">
                    <v-text-field
                      v-model="newCard.topicName"
                      label="Topic 名称"
                      variant="outlined"
                      density="comfortable"
                      hint="例如: /camera/image_raw/compressed"
                      persistent-hint
                      prepend-inner-icon="mdi-message-text-outline"
                      class="input-transition"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="12" md="6">
                    <v-switch
                      v-model="newCard.autoStart"
                      label="自动连接"
                      color="primary"
                      hide-details
                      density="comfortable"
                      prepend-icon="mdi-connection"
                      inset
                    ></v-switch>
                  </v-col>
                </v-row>
                <div class="d-flex justify-end mt-4 flex-wrap">
                  <v-slide-x-transition>
                    <v-btn
                      variant="outlined"
                      @click="cancelAddCard"
                      class="mr-2 mb-2 mb-sm-0 px-4"
                      rounded="pill"
                      size="small"
                      prepend-icon="mdi-close"
                    >
                      取消
                    </v-btn>
                  </v-slide-x-transition>
                  <v-btn
                    color="primary"
                    variant="elevated"
                    type="submit"
                    class="px-5"
                    rounded="pill"
                    size="small"
                    prepend-icon="mdi-check"
                    :elevation="3"
                  >
                    确认添加
                  </v-btn>
                </div>
              </v-form>
            </v-card>
          </div>
        </v-expand-transition>

        <v-scale-transition>
          <v-row v-if="cards.length === 0 && !isAddingCard" class="mt-2">
            <v-col>
              <v-alert
                type="info"
                variant="tonal"
                border="start"
                class="empty-state-alert pa-4 pa-sm-6"
                icon="mdi-video-off-outline"
              >
                <div class="text-center py-4">
                  <v-icon size="48" class="mb-4 empty-icon">mdi-video-off-outline</v-icon>
                  <div class="text-subtitle-1 mb-2">暂无视频卡片</div>
                  <div class="text-body-2 text-medium-emphasis">
                    点击上方"添加视频卡片"按钮开始创建
                  </div>
                  <v-btn
                    color="primary"
                    class="mt-4"
                    variant="tonal"
                    rounded="pill"
                    prepend-icon="mdi-plus"
                    @click="addCard"
                    size="small"
                  >
                    添加第一个视频卡片
                  </v-btn>
                </div>
              </v-alert>
            </v-col>
          </v-row>
        </v-scale-transition>

        <v-fade-transition>
          <div
            v-if="cards.length > 0"
            class="cards-container"
            :class="`grid-cols-${gridCols}`"
            :style="gridStyle"
          >
            <div
              v-for="(card, index) in cards"
              :key="card.id"
              class="card-wrapper"
              :style="cardContainerStyle"
            >
              <v-hover v-slot="{ isHovering, props }">
                <div v-bind="props" class="h-100">
                  <ros-view-card
                    :title="card.title"
                    :ws-url="card.wsUrl"
                    :topic-name="card.topicName"
                    :auto-start="card.autoStart"
                    :saved-presets="card.presets || []"
                    :height="cardHeight"
                    :aspect-ratio="cardAspectRatio"
                    @preset-save="(preset) => onPresetSave(index, preset)"
                    @connection-change="(status) => onConnectionChange(index, status)"
                    class="video-card"
                  />
                  <div
                    :class="[
                      'card-actions elevation-4',
                      { 'card-actions-visible': isHovering || isMobileDevice },
                    ]"
                  >
                    <v-tooltip location="top" text="删除卡片">
                      <template v-slot:activator="{ props }">
                        <v-btn
                          v-bind="props"
                          icon="mdi-delete-outline"
                          color="error"
                          variant="text"
                          size="small"
                          @click="removeCard(index)"
                          class="card-action-btn"
                        ></v-btn>
                      </template>
                    </v-tooltip>
                    <v-tooltip location="top" text="复制配置">
                      <template v-slot:activator="{ props }">
                        <v-btn
                          v-bind="props"
                          icon="mdi-content-copy"
                          color="primary"
                          variant="text"
                          size="small"
                          @click="duplicateCard(index)"
                          class="card-action-btn"
                        ></v-btn>
                      </template>
                    </v-tooltip>
                  </div>

                  <v-chip
                    :color="getConnectionStatusColor(card.connectionStatus)"
                    size="small"
                    class="connection-status-chip"
                    variant="elevated"
                  >
                    <v-icon start size="small">{{
                      getConnectionStatusIcon(card.connectionStatus)
                    }}</v-icon>
                    {{ getConnectionStatusText(card.connectionStatus) }}
                  </v-chip>
                </div>
              </v-hover>
            </div>
          </div>
        </v-fade-transition>
      </v-card-text>

      <v-expand-transition>
        <v-card-actions v-if="cards.length > 0" class="px-4 pb-4">
          <v-spacer></v-spacer>
          <v-chip
            variant="tonal"
            color="primary"
            size="small"
            class="font-weight-medium"
            prepend-icon="mdi-information-outline"
          >
            共 {{ cards.length }} 个视频卡片
          </v-chip>
        </v-card-actions>
      </v-expand-transition>
    </v-card>

    <v-card class="mb-4 card-elevation-transition" variant="elevated" rounded="lg" :elevation="1">
      <v-card-title class="py-3 py-sm-4 px-4 px-sm-6 d-flex align-center">
        <v-icon class="mr-3 text-primary" size="24">mdi-view-grid-outline</v-icon>
        <span class="font-weight-bold">布局设置</span>
      </v-card-title>

      <v-card-text class="px-4 px-sm-6 pb-4 pb-sm-6">
        <v-row>
          <v-col cols="12" md="6">
            <div class="d-flex align-center mb-2">
              <v-icon class="mr-2 text-medium-emphasis">mdi-view-grid-plus-outline</v-icon>
              <span class="text-subtitle-2">每行卡片数量</span>
            </div>
            <v-slider
              v-model="gridCols"
              :min="1"
              :max="4"
              :step="1"
              thumb-label="always"
              label="调整每行显示的卡片数量"
              show-ticks="always"
              :tick-labels="['1', '2', '3', '4']"
              color="primary"
              track-color="primary-lighten-3"
              class="mt-2 mt-sm-4 slider-transition"
              hide-details="auto"
            >
              <template v-slot:append>
                <v-slide-x-transition>
                  <v-text-field
                    v-model="gridCols"
                    type="number"
                    style="width: 70px"
                    density="compact"
                    variant="outlined"
                    :min="1"
                    :max="4"
                    class="ml-2 ml-sm-4 input-transition"
                    hide-details
                    v-if="!$vuetify.display.smAndDown"
                  ></v-text-field>
                </v-slide-x-transition>
              </template>
              <template v-slot:prepend>
                <v-icon class="d-none d-sm-flex">mdi-view-sequential-outline</v-icon>
              </template>
              <template v-slot:append-inner>
                <v-icon class="d-none d-sm-flex">mdi-view-grid-outline</v-icon>
              </template>
            </v-slider>
          </v-col>

          <v-col cols="12" md="6">
            <div class="d-flex align-center mb-2">
              <v-icon class="mr-2 text-medium-emphasis">mdi-aspect-ratio</v-icon>
              <span class="text-subtitle-2">视频宽高比</span>
            </div>
            <v-select
              v-model="cardAspectRatio"
              :items="aspectRatioOptions"
              label="选择视频显示比例"
              density="comfortable"
              variant="outlined"
              prepend-inner-icon="mdi-television"
              class="input-transition"
            >
              <template v-slot:selection="{ item }">
                <div class="d-flex align-center">
                  <v-icon class="mr-2" size="small">
                    {{ getAspectRatioIcon(item.value) }}
                  </v-icon>
                  {{ item.title }}
                </div>
              </template>
              <template v-slot:item="{ item, props }">
                <v-list-item v-bind="props">
                  <template v-slot:prepend>
                    <v-icon>{{ getAspectRatioIcon(item.value) }}</v-icon>
                  </template>
                  <v-list-item-title>{{ item.title }}</v-list-item-title>
                </v-list-item>
              </template>
            </v-select>
          </v-col>

          <v-col cols="12" md="6">
            <div class="d-flex align-center mb-2">
              <v-icon class="mr-2 text-medium-emphasis">mdi-resize</v-icon>
              <span class="text-subtitle-2">卡片最大宽度</span>
            </div>
            <v-slider
              v-model="cardMaxWidth"
              :min="300"
              :max="1200"
              :step="50"
              thumb-label="always"
              label="调整卡片的最大宽度 (像素)"
              color="primary"
              track-color="primary-lighten-3"
              class="mt-2 mt-sm-4 slider-transition"
              hide-details="auto"
            >
              <template v-slot:thumb-label="{ modelValue }"> {{ modelValue }}px </template>
              <template v-slot:append>
                <v-slide-x-transition>
                  <v-text-field
                    v-model="cardMaxWidth"
                    type="number"
                    style="width: 90px"
                    density="compact"
                    variant="outlined"
                    :min="300"
                    :max="1200"
                    :step="50"
                    suffix="px"
                    class="ml-2 ml-sm-4 input-transition"
                    hide-details
                    v-if="!$vuetify.display.smAndDown"
                  ></v-text-field>
                </v-slide-x-transition>
              </template>
              <template v-slot:prepend>
                <v-icon class="d-none d-sm-flex">mdi-arrow-collapse</v-icon>
              </template>
              <template v-slot:append-inner>
                <v-icon class="d-none d-sm-flex">mdi-arrow-expand</v-icon>
              </template>
            </v-slider>
          </v-col>

          <v-col cols="12" md="6">
            <div class="d-flex align-center mb-2">
              <v-icon class="mr-2 text-medium-emphasis">mdi-fit-to-screen-outline</v-icon>
              <span class="text-subtitle-2">自适应内容</span>
            </div>
            <v-switch
              v-model="fitContent"
              label="自适应内容大小"
              color="primary"
              density="comfortable"
              hint="开启后会根据内容自动调整视频大小"
              persistent-hint
              prepend-icon="mdi-responsive"
              inset
              class="mt-3"
            >
              <template v-slot:message>
                <div class="text-caption text-medium-emphasis mt-1">
                  <v-icon size="14" start>mdi-information-outline</v-icon>
                  开启后将优先考虑内容显示，忽略最大宽度限制
                </div>
              </template>
            </v-switch>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- 确认删除对话框 -->
    <v-dialog v-model="deleteDialog.show" max-width="400" transition="dialog-bottom-transition">
      <v-card rounded="lg" class="dialog-card">
        <v-card-title class="d-flex align-center pt-5 pb-2 px-4 px-sm-6">
          <v-icon color="error" class="mr-3" size="24">mdi-delete-alert</v-icon>
          <span class="text-h6 font-weight-medium">确认删除</span>
        </v-card-title>
        <v-card-text class="px-4 px-sm-6 pb-2 pt-3">
          <p class="text-body-1 mb-2">您确定要删除以下视频卡片吗？</p>
          <v-chip color="primary" variant="outlined" class="mt-2 font-weight-medium" size="large">
            <v-icon start>mdi-card-outline</v-icon>
            {{ deleteDialog.cardTitle }}
          </v-chip>
          <div class="text-caption text-medium-emphasis mt-4">
            <v-icon size="16" color="warning" class="mr-1">mdi-alert-circle-outline</v-icon>
            此操作无法撤销
          </div>
        </v-card-text>
        <v-card-actions class="pa-4 pa-sm-6">
          <v-spacer></v-spacer>
          <div class="d-flex flex-column flex-sm-row">
            <v-btn
              variant="tonal"
              @click="deleteDialog.show = false"
              class="mb-2 mb-sm-0 mr-0 mr-sm-3 px-5"
              rounded="pill"
              prepend-icon="mdi-close"
            >
              取消
            </v-btn>
            <v-btn
              color="error"
              variant="elevated"
              @click="confirmDeleteCard"
              rounded="pill"
              class="px-5"
              prepend-icon="mdi-delete-outline"
            >
              删除
            </v-btn>
          </div>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 提示消息 -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      timeout="3000"
      location="top"
      rounded="pill"
      class="snackbar-transition"
    >
      <div class="d-flex align-center">
        <v-icon class="mr-2" :icon="getSnackbarIcon(snackbar.color)"></v-icon>
        {{ snackbar.text }}
      </div>
      <template v-slot:actions>
        <v-btn icon="mdi-close" variant="text" @click="snackbar.show = false"></v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick, onBeforeUnmount } from 'vue'
import RosViewCard from '@/views/AgvMonitoring/RosViewCard.vue'

// 添加移动设备检测
const isMobileDevice = ref(false)

// 卡片数据
const cards = ref([])
const isAddingCard = ref(false)
const cardForm = ref(null)
const gridCols = ref(2)

// 布局设置
const cardAspectRatio = ref('16:9')
const cardMaxWidth = ref(640)
const fitContent = ref(true)

// 宽高比选项
const aspectRatioOptions = [
  { title: '16:9 (宽屏)', value: '16:9' },
  { title: '4:3 (标准)', value: '4:3' },
  { title: '1:1 (正方形)', value: '1:1' },
  { title: '9:16 (竖屏)', value: '9:16' },
]

// 获取宽高比对应图标
const getAspectRatioIcon = (ratio) => {
  switch (ratio) {
    case '16:9':
      return 'mdi-television-widescreen'
    case '4:3':
      return 'mdi-television-classic'
    case '1:1':
      return 'mdi-crop-square'
    case '9:16':
      return 'mdi-phone-portrait'
    default:
      return 'mdi-aspect-ratio'
  }
}

// 计算网格样式
const gridStyle = computed(() => {
  return {
    gridTemplateColumns: `repeat(${gridCols.value}, 1fr)`,
    gap: isMobileDevice.value ? '12px' : '16px',
  }
})

// 计算卡片容器样式
const cardContainerStyle = computed(() => {
  return {
    maxWidth: fitContent.value ? 'auto' : `${cardMaxWidth.value}px`,
    width: '100%',
  }
})

// 计算卡片高度
const cardHeight = computed(() => {
  // 根据宽高比设置高度
  // 由ROS视频卡片组件内部处理
  return 'auto'
})

// 新卡片表单数据
const newCard = ref({
  title: '',
  wsUrl: '',
  topicName: '',
  autoStart: false,
  presets: [],
})

// 删除对话框
const deleteDialog = ref({
  show: false,
  cardIndex: -1,
  cardTitle: '',
  cardId: '', // 添加ID以确保删除正确的卡片
})

// 提示消息
const snackbar = ref({
  show: false,
  text: '',
  color: 'success',
})

// 添加卡片
const addCard = () => {
  isAddingCard.value = true
  // 重置新卡片数据
  newCard.value = {
    title: `ROS视频 ${cards.value.length + 1}`,
    wsUrl: '',
    topicName: '',
    autoStart: false,
    presets: [],
  }

  // 滚动到表单位置
  nextTick(() => {
    const formElement = document.querySelector('.card-add-form')
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }

    // 聚焦标题输入框
    setTimeout(() => {
      const titleInput = document.querySelector('.card-add-form input')
      if (titleInput) titleInput.focus()
    }, 300)
  })
}

// 确认添加卡片
const confirmAddCard = async () => {
  // 表单验证
  const { valid } = await cardForm.value.validate()
  if (!valid) return

  // 添加新卡片
  cards.value.push({
    id: Date.now().toString(),
    title: newCard.value.title,
    wsUrl: newCard.value.wsUrl,
    topicName: newCard.value.topicName,
    autoStart: newCard.value.autoStart,
    presets: [],
    connectionStatus: 'closed',
  })

  // 重置添加状态
  isAddingCard.value = false

  // 显示提示
  showSnackbar(`已添加卡片: ${newCard.value.title}`, 'success')

  // 保存到本地存储
  saveCardsToLocalStorage()
}

// 取消添加卡片
const cancelAddCard = () => {
  isAddingCard.value = false
}

// 删除卡片
const removeCard = (index) => {
  if (index < 0 || index >= cards.value.length) return

  // 保存当前卡片信息到对话框状态
  deleteDialog.value = {
    show: true,
    cardIndex: index,
    cardTitle: cards.value[index].title,
    cardId: cards.value[index].id, // 额外存储ID以确保删除正确的卡片
  }
}

// 确认删除卡片
const confirmDeleteCard = () => {
  const { cardIndex, cardTitle, cardId } = deleteDialog.value

  // 双重验证: 先通过索引检查，再通过ID确认是否正确的卡片
  if (cardIndex >= 0 && cardIndex < cards.value.length) {
    // 再次验证ID匹配
    if (cards.value[cardIndex].id === cardId) {
      // 使用splice直接删除
      cards.value.splice(cardIndex, 1)
    } else {
      // 如果索引的ID不匹配(可能是异步操作导致的不一致)，则通过ID查找
      const realIndex = cards.value.findIndex((card) => card.id === cardId)
      if (realIndex >= 0) {
        cards.value.splice(realIndex, 1)
      }
    }

    showSnackbar(`已删除卡片: ${cardTitle}`, 'info')

    // 确保保存到本地存储
    nextTick(() => {
      saveCardsToLocalStorage()
    })
  }

  // 关闭对话框
  deleteDialog.value.show = false
}

// 复制卡片
const duplicateCard = (index) => {
  if (index < 0 || index >= cards.value.length) return

  const originalCard = cards.value[index]
  const newCardData = {
    ...JSON.parse(JSON.stringify(originalCard)),
    id: Date.now().toString(),
    title: `${originalCard.title} (复制)`,
  }

  cards.value.push(newCardData)
  showSnackbar(`已复制卡片: ${originalCard.title}`, 'success')
  saveCardsToLocalStorage()
}

// 保存预设回调
const onPresetSave = (cardIndex, preset) => {
  if (cardIndex < 0 || cardIndex >= cards.value.length) return

  // 确保预设数组已初始化
  if (!cards.value[cardIndex].presets) {
    cards.value[cardIndex].presets = []
  }

  // 查找是否已有同名预设
  const existingIndex = cards.value[cardIndex].presets.findIndex((p) => p.id === preset.id)

  if (existingIndex >= 0) {
    // 更新现有预设
    cards.value[cardIndex].presets[existingIndex] = preset
  } else {
    // 添加新预设
    cards.value[cardIndex].presets.push(preset)
  }

  saveCardsToLocalStorage()
}

// 连接状态变化回调
const onConnectionChange = (cardIndex, status) => {
  if (cardIndex < 0 || cardIndex >= cards.value.length) return
  cards.value[cardIndex].connectionStatus = status
}

// 获取连接状态颜色
const getConnectionStatusColor = (status) => {
  switch (status) {
    case 'connected':
      return 'success'
    case 'connecting':
      return 'warning'
    case 'error':
      return 'error'
    case 'closed':
    default:
      return 'default'
  }
}

// 获取连接状态图标
const getConnectionStatusIcon = (status) => {
  switch (status) {
    case 'connected':
      return 'mdi-check-circle-outline'
    case 'connecting':
      return 'mdi-progress-clock'
    case 'error':
      return 'mdi-alert-circle-outline'
    case 'closed':
    default:
      return 'mdi-power-plug-off-outline'
  }
}

// 获取连接状态文本
const getConnectionStatusText = (status) => {
  switch (status) {
    case 'connected':
      return '已连接'
    case 'connecting':
      return '连接中'
    case 'error':
      return '连接错误'
    case 'closed':
    default:
      return '未连接'
  }
}

// 获取提示消息图标
const getSnackbarIcon = (color) => {
  switch (color) {
    case 'success':
      return 'mdi-check-circle-outline'
    case 'info':
      return 'mdi-information-outline'
    case 'warning':
      return 'mdi-alert-outline'
    case 'error':
      return 'mdi-alert-circle-outline'
    default:
      return 'mdi-information-outline'
  }
}

// 显示提示消息
const showSnackbar = (text, color = 'success') => {
  snackbar.value = {
    show: true,
    text,
    color,
  }
}

// 保存布局设置
const saveLayoutSettings = () => {
  try {
    localStorage.setItem('ros-viewer-grid-cols', gridCols.value)
    localStorage.setItem('ros-viewer-aspect-ratio', cardAspectRatio.value)
    localStorage.setItem('ros-viewer-card-max-width', cardMaxWidth.value)
    localStorage.setItem('ros-viewer-fit-content', JSON.stringify(fitContent.value))
  } catch (error) {
    console.error('保存布局设置失败:', error)
  }
}

// 保存卡片数据到本地存储
const saveCardsToLocalStorage = () => {
  try {
    localStorage.setItem('ros-viewer-cards', JSON.stringify(cards.value))
  } catch (error) {
    console.error('保存卡片数据失败:', error)
    showSnackbar('保存卡片数据失败', 'error')
  }
}

// 从本地存储加载卡片数据
const loadCardsFromLocalStorage = () => {
  try {
    const savedCards = localStorage.getItem('ros-viewer-cards')
    if (savedCards) {
      cards.value = JSON.parse(savedCards)
    }
  } catch (error) {
    console.error('加载卡片数据失败:', error)
    showSnackbar('加载卡片数据失败', 'error')
  }
}

// 加载布局设置
const loadLayoutSettings = () => {
  try {
    const savedGridCols = localStorage.getItem('ros-viewer-grid-cols')
    if (savedGridCols) {
      gridCols.value = parseInt(savedGridCols, 10)
    }

    const savedAspectRatio = localStorage.getItem('ros-viewer-aspect-ratio')
    if (savedAspectRatio) {
      cardAspectRatio.value = savedAspectRatio
    }

    const savedMaxWidth = localStorage.getItem('ros-viewer-card-max-width')
    if (savedMaxWidth) {
      cardMaxWidth.value = parseInt(savedMaxWidth, 10)
    }

    const savedFitContent = localStorage.getItem('ros-viewer-fit-content')
    if (savedFitContent !== null) {
      fitContent.value = JSON.parse(savedFitContent)
    }
  } catch (error) {
    console.error('加载布局设置失败:', error)
  }
}

// 检测是否是移动设备
const checkMobileDevice = () => {
  isMobileDevice.value =
    window.innerWidth < 600 ||
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

// 监听布局设置变化
watch([gridCols, cardAspectRatio, cardMaxWidth, fitContent], () => {
  // 确保gridCols在有效范围内
  if (gridCols.value < 1) gridCols.value = 1
  if (gridCols.value > 4) gridCols.value = 4

  // 保存布局设置
  saveLayoutSettings()
})

// 处理窗口大小变化
const handleResize = () => {
  // 检测移动设备
  checkMobileDevice()

  // 根据屏幕宽度自动调整网格列数
  const width = window.innerWidth
  if (width < 600) {
    // 小屏幕自动调整为1列
    if (gridCols.value > 1) {
      gridCols.value = 1
    }
  } else if (width < 960 && gridCols.value > 2) {
    // 中等屏幕最多2列
    gridCols.value = 2
  }
}

// 生命周期钩子
onMounted(() => {
  // 检测移动设备
  checkMobileDevice()

  // 加载保存的卡片数据和布局设置
  loadCardsFromLocalStorage()
  loadLayoutSettings()

  // 监听窗口大小变化
  window.addEventListener('resize', handleResize)
  handleResize() // 初始调用一次
})

// 组件卸载前清理事件监听器
onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.ros-viewer-container {
  border-radius: 16px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.card-elevation-transition {
  transition: box-shadow 0.28s cubic-bezier(0.4, 0, 0.2, 1);
}

.card-elevation-transition:hover {
  box-shadow:
    0 5px 15px -3px rgba(var(--v-theme-on-surface), 0.1),
    0 8px 16px -4px rgba(var(--v-theme-on-surface), 0.06) !important;
}

.cards-container {
  display: grid;
  margin-top: 16px;
  width: 100%;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.card-wrapper {
  position: relative;
  width: 100%;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 12px;
  margin: 0 auto;
}

.card-wrapper:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px -2px rgba(var(--v-theme-on-surface), 0.1);
}

.video-card {
  width: 100%;
  height: 100%;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.card-actions {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  gap: 4px;
  background-color: rgba(var(--v-theme-surface), 0.8);
  backdrop-filter: blur(8px);
  border-radius: 8px;
  padding: 4px;
  z-index: 5;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.12);
  opacity: 0;
  visibility: hidden;
  transition:
    opacity 0.3s,
    visibility 0.3s;
}

.card-actions-visible {
  opacity: 1;
  visibility: visible;
}

.connection-status-chip {
  position: absolute;
  bottom: 8px;
  left: 8px;
  z-index: 5;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.card-action-btn {
  opacity: 0.8;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.card-action-btn:hover {
  opacity: 1;
  transform: scale(1.1);
}

.btn-transition {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-transition:hover {
  transform: translateY(-2px);
}

.card-add-form {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.input-transition {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.input-transition:focus-within {
  transform: translateY(-2px);
}

.slider-transition .v-slider-thumb {
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.slider-transition:hover .v-slider-thumb {
  transform: scale(1.1);
}

.dialog-card {
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.empty-icon {
  animation: pulse 2s infinite;
}

.snackbar-transition {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.empty-state-alert {
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 动画效果 */
@keyframes pulse {
  0% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.6;
  }
}

/* 响应式处理 */
@media (max-width: 1280px) {
  .grid-cols-4 {
    grid-template-columns: repeat(3, 1fr) !important;
  }
}

@media (max-width: 960px) {
  .grid-cols-3,
  .grid-cols-4 {
    grid-template-columns: repeat(2, 1fr) !important;
  }
}

@media (max-width: 600px) {
  .grid-cols-2,
  .grid-cols-3,
  .grid-cols-4 {
    grid-template-columns: 1fr !important;
  }

  .card-wrapper {
    margin-bottom: 8px;
  }

  /* 在移动端固定显示操作按钮 */
  .card-actions {
    top: 4px;
    right: 4px;
    padding: 2px;
  }
}

/* 确保移动设备上表单元素更易于点击 */
@media (max-width: 600px) {
  .v-btn {
    min-height: 40px;
  }

  .v-text-field input,
  .v-select__selection {
    font-size: 16px !important; /* 防止iOS上输入时自动缩放 */
  }

  .v-slider-track__container {
    height: 8px;
  }

  .v-slider-thumb {
    width: 24px;
    height: 24px;
  }
}
</style>
