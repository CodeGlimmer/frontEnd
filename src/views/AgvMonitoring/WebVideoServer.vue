<template>
  <div class="web-video-server-page">
    <!-- 页面标题 -->
    <div class="page-header mb-6">
      <v-row align="center">
        <v-col>
          <h1 class="text-h4 font-weight-bold">Web Video Server 视频流</h1>
          <p class="text-body-1 text-medium-emphasis mt-2">
            连接到 ROS2 web_video_server 查看实时视频流
          </p>
        </v-col>
        <v-col cols="auto">
          <v-btn
            color="primary"
            variant="elevated"
            prepend-icon="mdi-plus"
            @click="addVideoCard"
          >
            添加视频卡片
          </v-btn>
        </v-col>
      </v-row>
    </div>

    <!-- 快速连接面板 -->
    <v-card class="mb-6" elevation="2">
      <v-card-title class="d-flex align-center">
        <v-icon class="mr-2">mdi-flash</v-icon>
        快速连接
      </v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="12" md="8">
            <v-text-field
              v-model="quickConnectUrl"
              label="Web Video Server URL"
              placeholder="http://localhost:8080/stream?topic=/camera/image_raw"
              variant="outlined"
              density="comfortable"
              hide-details
              prepend-inner-icon="mdi-link"
            ></v-text-field>
          </v-col>
          <v-col cols="12" md="4">
            <v-btn
              color="primary"
              variant="elevated"
              block
              size="large"
              @click="quickConnect"
              :disabled="!quickConnectUrl"
            >
              快速连接
            </v-btn>
          </v-col>
        </v-row>
        
        <!-- 常用URL预设 -->
        <div class="mt-4">
          <v-chip-group>
            <v-chip
              v-for="preset in urlPresets"
              :key="preset.name"
              variant="outlined"
              @click="quickConnectUrl = preset.url"
              class="mr-2"
            >
              <v-icon start>{{ preset.icon }}</v-icon>
              {{ preset.name }}
            </v-chip>
          </v-chip-group>
        </div>
      </v-card-text>
    </v-card>

    <!-- 使用说明 -->
    <v-card class="mb-6" elevation="1" variant="outlined">
      <v-card-title class="d-flex align-center">
        <v-icon class="mr-2">mdi-information</v-icon>
        使用说明
      </v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="12" md="6">
            <h4 class="text-h6 mb-2">启动 Web Video Server</h4>
            <v-code class="d-block pa-3 mb-3">
              ros2 run web_video_server web_video_server
            </v-code>
            <p class="text-body-2">
              默认情况下，服务器会在 <code>http://localhost:8080</code> 启动
            </p>
          </v-col>
          <v-col cols="12" md="6">
            <h4 class="text-h6 mb-2">URL 格式</h4>
            <ul class="text-body-2">
              <li><strong>MJPEG 流:</strong> <code>/stream?topic=/camera/image_raw</code></li>
              <li><strong>静态图片:</strong> <code>/snapshot?topic=/camera/image_raw</code></li>
              <li><strong>指定格式:</strong> <code>/stream?topic=/camera/image_raw&type=mjpeg</code></li>
              <li><strong>指定质量:</strong> <code>/stream?topic=/camera/image_raw&quality=80</code></li>
            </ul>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- 视频卡片网格 -->
    <div v-if="videoCards.length > 0" class="video-cards-grid">
      <div
        v-for="(card, index) in videoCards"
        :key="card.id"
        class="video-card-wrapper"
      >
        <web-video-server-card
          :title="card.title"
          :url="card.url"
          :auto-start="card.autoStart"
          @connection-change="(status) => onConnectionChange(index, status)"
          @connection-error="(error) => onConnectionError(index, error)"
          @status-update="(message) => onStatusUpdate(index, message)"
        />
        
        <!-- 卡片操作按钮 -->
        <div class="card-actions">
          <v-btn
            icon="mdi-pencil"
            size="small"
            variant="elevated"
            color="primary"
            @click="editCard(index)"
          ></v-btn>
          <v-btn
            icon="mdi-delete"
            size="small"
            variant="elevated"
            color="error"
            @click="removeCard(index)"
          ></v-btn>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <v-card v-else class="text-center pa-8" elevation="1" variant="outlined">
      <v-icon size="64" color="grey-lighten-1">mdi-video-off</v-icon>
      <h3 class="text-h6 mt-4 mb-2">暂无视频流</h3>
      <p class="text-body-2 text-medium-emphasis mb-4">
        点击上方的"添加视频卡片"按钮开始添加视频流
      </p>
      <v-btn color="primary" variant="elevated" @click="addVideoCard">
        添加第一个视频卡片
      </v-btn>
    </v-card>

    <!-- 添加/编辑卡片对话框 -->
    <v-dialog v-model="showCardDialog" max-width="600">
      <v-card>
        <v-card-title>{{ editingIndex >= 0 ? '编辑' : '添加' }}视频卡片</v-card-title>
        <v-card-text>
          <v-form ref="cardForm">
            <v-text-field
              v-model="cardForm.title"
              label="卡片标题"
              variant="outlined"
              :rules="[v => !!v || '请输入标题']"
              class="mb-4"
            ></v-text-field>
            
            <v-text-field
              v-model="cardForm.url"
              label="视频流 URL"
              placeholder="http://localhost:8080/stream?topic=/camera/image_raw"
              variant="outlined"
              :rules="[v => !!v || '请输入URL']"
              class="mb-4"
            ></v-text-field>
            
            <v-switch
              v-model="cardForm.autoStart"
              label="自动开始播放"
              color="primary"
              hide-details
            ></v-switch>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="showCardDialog = false">取消</v-btn>
          <v-btn color="primary" variant="elevated" @click="saveCard">
            {{ editingIndex >= 0 ? '保存' : '添加' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import WebVideoServerCard from '@/components/common/WebVideoServerCard.vue'

// 响应式数据
const videoCards = ref([])
const showCardDialog = ref(false)
const editingIndex = ref(-1)
const quickConnectUrl = ref('')

// 表单数据
const cardForm = reactive({
  title: '',
  url: '',
  autoStart: true,
})

// URL 预设
const urlPresets = [
  {
    name: '默认摄像头',
    url: 'http://localhost:8080/stream?topic=/camera/image_raw',
    icon: 'mdi-camera',
  },
  {
    name: '压缩图像',
    url: 'http://localhost:8080/stream?topic=/camera/image_raw/compressed',
    icon: 'mdi-camera-iris',
  },
  {
    name: '深度图像',
    url: 'http://localhost:8080/stream?topic=/camera/depth/image_raw',
    icon: 'mdi-camera-metering-matrix',
  },
  {
    name: '彩色图像',
    url: 'http://localhost:8080/stream?topic=/camera/color/image_raw',
    icon: 'mdi-palette',
  },
]

// 方法
const addVideoCard = () => {
  editingIndex.value = -1
  cardForm.title = `视频流 ${videoCards.value.length + 1}`
  cardForm.url = ''
  cardForm.autoStart = true
  showCardDialog.value = true
}

const editCard = (index) => {
  editingIndex.value = index
  const card = videoCards.value[index]
  cardForm.title = card.title
  cardForm.url = card.url
  cardForm.autoStart = card.autoStart
  showCardDialog.value = true
}

const saveCard = () => {
  if (!cardForm.title || !cardForm.url) {
    return
  }

  const cardData = {
    id: Date.now(),
    title: cardForm.title,
    url: cardForm.url,
    autoStart: cardForm.autoStart,
    status: 'disconnected',
  }

  if (editingIndex.value >= 0) {
    // 编辑现有卡片
    videoCards.value[editingIndex.value] = {
      ...videoCards.value[editingIndex.value],
      ...cardData,
    }
  } else {
    // 添加新卡片
    videoCards.value.push(cardData)
  }

  showCardDialog.value = false
}

const removeCard = (index) => {
  videoCards.value.splice(index, 1)
}

const quickConnect = () => {
  if (!quickConnectUrl.value) return

  const cardData = {
    id: Date.now(),
    title: `快速连接 ${videoCards.value.length + 1}`,
    url: quickConnectUrl.value,
    autoStart: true,
    status: 'disconnected',
  }

  videoCards.value.push(cardData)
  quickConnectUrl.value = ''
}

// 事件处理器
const onConnectionChange = (index, status) => {
  if (videoCards.value[index]) {
    videoCards.value[index].status = status
  }
}

const onConnectionError = (index, error) => {
  console.error(`视频卡片 ${index} 连接错误:`, error)
}

const onStatusUpdate = (index, message) => {
  console.log(`视频卡片 ${index} 状态更新:`, message)
}
</script>

<style scoped>
.web-video-server-page {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.12);
  padding-bottom: 24px;
}

.video-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 24px;
}

.video-card-wrapper {
  position: relative;
}

.card-actions {
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 10;
}

.video-card-wrapper:hover .card-actions {
  opacity: 1;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .web-video-server-page {
    padding: 16px;
  }

  .video-cards-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}
</style>
