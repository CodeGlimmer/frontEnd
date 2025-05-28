<template>
  <v-container fluid class="chat-container">
    <v-row no-gutters class="fill-height">
      <!-- API 配置侧边栏 -->
      <v-col cols="12" md="3" class="sidebar">
        <v-card class="h-100 d-flex flex-column" elevation="1" rounded="lg">
          <v-card-title class="config-header">
            <v-icon left>mdi-cog</v-icon>
            配置设置
          </v-card-title>

          <v-card-text class="flex-grow-1 config-content">
            <v-form @submit.prevent="saveConfig">
              <v-text-field
                v-model="config.apiKey"
                label="DeepSeek API Key"
                type="password"
                variant="outlined"
                density="compact"
                :rules="[rules.required]"
                hide-details="auto"
                class="mb-4"
                prepend-inner-icon="mdi-key"
              />

              <v-text-field
                v-model="config.apiUrl"
                label="API URL"
                variant="outlined"
                density="compact"
                :rules="[rules.required]"
                hide-details="auto"
                class="mb-4"
                prepend-inner-icon="mdi-link"
              />

              <v-select
                v-model="config.model"
                :items="models"
                label="模型选择"
                variant="outlined"
                density="compact"
                hide-details="auto"
                class="mb-4"
                prepend-inner-icon="mdi-brain"
              />

              <div class="mb-3">
                <label class="text-subtitle-2 mb-2 d-block"
                  >Temperature: {{ config.temperature }}</label
                >
                <v-slider
                  v-model="config.temperature"
                  min="0"
                  max="2"
                  step="0.1"
                  thumb-label
                  hide-details
                  color="primary"
                />
              </div>

              <div class="mb-4">
                <label class="text-subtitle-2 mb-2 d-block"
                  >Max Tokens: {{ config.maxTokens }}</label
                >
                <v-slider
                  v-model="config.maxTokens"
                  min="100"
                  max="4000"
                  step="100"
                  thumb-label
                  hide-details
                  color="primary"
                />
              </div>

              <v-switch
                v-model="config.enableStream"
                label="启用流式响应"
                hide-details
                class="mb-4"
                color="primary"
              />

              <v-btn
                type="submit"
                color="primary"
                block
                :loading="loading"
                class="mb-3"
                variant="elevated"
              >
                <v-icon left>mdi-content-save</v-icon>
                保存配置
              </v-btn>

              <v-btn @click="clearHistory" color="error" variant="outlined" block>
                <v-icon left>mdi-delete</v-icon>
                清空记录
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- 聊天主区域 -->
      <v-col cols="12" md="9" class="chat-main">
        <v-card class="h-100 d-flex flex-column" elevation="1" rounded="lg">
          <v-card-title class="chat-header">
            <v-icon left>mdi-robot</v-icon>
            DeepSeek 智能助手
            <v-spacer />
            <v-chip
              :color="isConfigured ? 'success' : 'warning'"
              size="small"
              variant="tonal"
              rounded="lg"
            >
              <v-icon left size="small">
                {{ isConfigured ? 'mdi-check-circle' : 'mdi-alert-circle' }}
              </v-icon>
              {{ isConfigured ? '已就绪' : '需配置' }}
            </v-chip>
          </v-card-title>

          <!-- 聊天消息区域 -->
          <v-card-text class="flex-grow-1 overflow-y-auto pa-0">
            <div ref="messagesContainer" class="messages-container">
              <div v-if="messages.length === 0" class="empty-state">
                <v-icon size="80" color="outline">mdi-chat-question-outline</v-icon>
                <h3 class="empty-title">开始与 DeepSeek 对话</h3>
                <p class="empty-subtitle">
                  请先配置 API 密钥，然后输入消息开始聊天<br />
                  支持 Markdown 格式和代码高亮
                </p>
              </div>

              <div
                v-for="message in messages"
                :key="message.id"
                class="message-item"
                :class="{ 'user-message': message.role === 'user' }"
              >
                <v-card
                  class="message-bubble"
                  :class="{ 'user-message-bubble': message.role === 'user' }"
                  elevation="1"
                  rounded="xl"
                >
                  <v-card-text class="message-body">
                    <div class="message-header">
                      <v-avatar
                        size="36"
                        :color="message.role === 'user' ? 'primary' : 'secondary'"
                        class="mr-3"
                      >
                        <v-icon color="white">
                          {{ message.role === 'user' ? 'mdi-account' : 'mdi-robot' }}
                        </v-icon>
                      </v-avatar>
                      <div class="flex-grow-1">
                        <div class="message-role text-subtitle-2 font-weight-medium">
                          {{ message.role === 'user' ? '我' : 'DeepSeek' }}
                        </div>
                        <div class="message-time text-caption text-medium-emphasis">
                          {{ formatTime(message.timestamp) }}
                        </div>
                      </div>
                      <v-btn
                        v-if="message.role === 'assistant'"
                        @click="copyMessage(message.content)"
                        icon
                        size="small"
                        variant="text"
                        density="comfortable"
                      >
                        <v-icon size="16">mdi-content-copy</v-icon>
                      </v-btn>
                    </div>

                    <div class="message-text" v-html="formatMessage(message.content)"></div>
                  </v-card-text>
                </v-card>
              </div>

              <!-- 加载指示器 -->
              <div v-if="loading" class="message-item">
                <v-card class="message-bubble loading-bubble" elevation="1" rounded="xl">
                  <v-card-text class="message-body">
                    <div class="message-header">
                      <v-avatar size="36" color="secondary" class="mr-3">
                        <v-icon color="white">mdi-robot</v-icon>
                      </v-avatar>
                      <div class="flex-grow-1">
                        <div class="message-role text-subtitle-2 font-weight-medium">DeepSeek</div>
                      </div>
                    </div>
                    <div class="typing-indicator">
                      <v-progress-circular
                        indeterminate
                        size="20"
                        width="2"
                        color="primary"
                        class="mr-2"
                      />
                      <span class="text-medium-emphasis">{{ loadingText }}</span>
                    </div>
                  </v-card-text>
                </v-card>
              </div>
            </div>
          </v-card-text>

          <!-- 消息输入区域 -->
          <v-divider />
          <v-card-actions class="input-area">
            <v-row no-gutters align="center">
              <v-col>
                <v-textarea
                  v-model="newMessage"
                  placeholder="输入您的问题... (支持 Markdown 格式)"
                  variant="outlined"
                  density="compact"
                  rows="2"
                  auto-grow
                  max-rows="6"
                  hide-details
                  @keydown.ctrl.enter="sendMessage"
                  @keydown.meta.enter="sendMessage"
                  :disabled="loading"
                />
              </v-col>
              <v-col cols="auto" class="ml-3">
                <v-btn
                  @click="sendMessage"
                  color="primary"
                  size="large"
                  :disabled="!newMessage.trim() || !isConfigured || loading"
                  variant="elevated"
                  class="send-btn"
                >
                  <v-icon>{{ loading ? 'mdi-stop' : 'mdi-send' }}</v-icon>
                </v-btn>
              </v-col>
            </v-row>
            <div class="w-100 d-flex justify-space-between align-center mt-2">
              <div class="text-caption text-medium-emphasis">按 Ctrl+Enter 快速发送</div>
              <div class="text-caption text-medium-emphasis">消息数: {{ messages.length }}</div>
            </div>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- 通知组件 -->
    <v-snackbar
      v-model="notification.show"
      :color="notification.type"
      timeout="4000"
      location="top right"
    >
      {{ notification.message }}
      <template #actions>
        <v-btn color="white" variant="text" @click="notification.show = false"> 关闭 </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, nextTick, onMounted, watch } from 'vue'
import {
  DeepSeekService,
  useChatConfig,
  useChatMessages,
  formatMessage,
  formatTime,
} from './chatService.js'

// 使用组合式函数
const {
  config,
  models,
  isConfigured,
  loadConfig,
  saveConfig: saveConfigToStorage,
} = useChatConfig()
const { messages, addMessage, updateLastMessage, loadMessages, clearMessages } = useChatMessages()

// 响应式数据
const newMessage = ref('')
const loading = ref(false)
const loadingText = ref('正在思考...')
const messagesContainer = ref(null)
const abortController = ref(null)

// 添加启用流式响应配置
config.value.enableStream = true

const notification = ref({
  show: false,
  message: '',
  type: 'info',
})

// 表单验证规则
const rules = {
  required: (value) => !!value || '此字段为必填项',
}

// 方法
const saveConfig = () => {
  if (saveConfigToStorage()) {
    showNotification('配置已保存', 'success')
  } else {
    showNotification('保存配置失败', 'error')
  }
}

const clearHistory = () => {
  clearMessages()
  showNotification('聊天记录已清空', 'success')
}

const sendMessage = async () => {
  if (!newMessage.value.trim() || !isConfigured.value) {
    return
  }

  if (loading.value) {
    // 如果正在加载，停止当前请求
    if (abortController.value) {
      abortController.value.abort()
      abortController.value = null
    }
    loading.value = false
    loadingText.value = '正在思考...'
    return
  }

  const userMessage = newMessage.value.trim()
  addMessage('user', userMessage)
  newMessage.value = ''
  loading.value = true
  loadingText.value = '正在连接...'

  await nextTick()
  scrollToBottom()

  try {
    const service = new DeepSeekService(config.value)
    abortController.value = new AbortController()

    if (config.value.enableStream) {
      // 流式响应
      addMessage('assistant', '')
      let content = ''
      loadingText.value = '正在接收响应...'

      await service.sendStreamMessage(
        messages.value.slice(0, -1), // 不包括刚添加的空助手消息
        (chunk) => {
          content += chunk
          updateLastMessage(content)
          scrollToBottom()
        },
      )
    } else {
      // 普通响应
      loadingText.value = '等待响应...'
      const response = await service.sendMessage(messages.value)

      if (response.choices && response.choices.length > 0) {
        addMessage('assistant', response.choices[0].message.content)
        await nextTick()
        scrollToBottom()
      } else {
        throw new Error('API 返回数据格式错误')
      }
    }
  } catch (error) {
    console.error('发送消息失败:', error)
    if (error.name !== 'AbortError') {
      showNotification(`发送失败: ${error.message}`, 'error')
    }
  } finally {
    loading.value = false
    loadingText.value = '正在思考...'
    abortController.value = null
  }
}

const scrollToBottom = () => {
  if (messagesContainer.value) {
    setTimeout(() => {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }, 100)
  }
}

const copyMessage = async (content) => {
  try {
    await navigator.clipboard.writeText(content)
    showNotification('消息已复制到剪贴板', 'success')
  } catch (err) {
    showNotification('复制失败', 'error:', err)
  }
}

const showNotification = (message, type = 'info') => {
  notification.value = {
    show: true,
    message,
    type,
  }
}

// 监听配置变化自动保存
watch(
  config,
  () => {
    saveConfigToStorage()
  },
  { deep: true },
)

// 生命周期
onMounted(() => {
  loadConfig()
  loadMessages()
  scrollToBottom()
})
</script>

<style scoped>
.chat-container {
  height: 100%;
  padding: 24px;
  background-color: rgb(var(--v-theme-surface-dim));
}

.sidebar {
  padding-right: 12px;
}

.chat-main {
  padding-left: 12px;
}

/* 配置区域样式 */
.config-header {
  padding: 20px 24px 16px;
  background-color: rgb(var(--v-theme-surface-container));
  color: rgb(var(--v-theme-on-surface));
  border-radius: 12px 12px 0 0;
  border-bottom: 1px solid rgb(var(--v-theme-outline-variant));
}

.config-content {
  padding: 24px;
  background-color: rgb(var(--v-theme-surface));
}

/* 聊天区域样式 */
.chat-header {
  padding: 20px 24px 16px;
  background-color: rgb(var(--v-theme-surface-container));
  color: rgb(var(--v-theme-on-surface));
  border-radius: 12px 12px 0 0;
  border-bottom: 1px solid rgb(var(--v-theme-outline-variant));
}

.messages-container {
  height: 100%;
  overflow-y: auto;
  padding: 24px;
  scroll-behavior: smooth;
  background-color: rgb(var(--v-theme-surface));
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
  padding: 40px;
}

.empty-title {
  color: rgb(var(--v-theme-on-surface));
  font-size: 1.5rem;
  font-weight: 500;
  margin: 16px 0 8px;
}

.empty-subtitle {
  color: rgb(var(--v-theme-on-surface-variant));
  font-size: 1rem;
  line-height: 1.5;
  margin: 0;
}

/* 消息样式 */
.message-item {
  margin-bottom: 24px;
  display: flex;
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.user-message {
  justify-content: flex-end;
}

.message-bubble {
  max-width: 75%;
  background-color: rgb(var(--v-theme-surface-container));
  color: rgb(var(--v-theme-on-surface));
}

.user-message-bubble {
  background-color: rgb(var(--v-theme-primary-container));
  color: rgb(var(--v-theme-on-primary-container));
}

.loading-bubble {
  background-color: rgb(var(--v-theme-surface-container-low));
  color: rgb(var(--v-theme-on-surface-variant));
}

.message-body {
  padding: 20px 24px;
}

.message-header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.message-role {
  color: rgb(var(--v-theme-on-surface));
  font-weight: 600;
  font-size: 0.875rem;
}

.message-time {
  color: rgb(var(--v-theme-on-surface-variant));
  font-size: 0.75rem;
  opacity: 0.8;
}

.user-message-bubble .message-role {
  color: rgb(var(--v-theme-on-primary-container));
}

.user-message-bubble .message-time {
  color: rgba(var(--v-theme-on-primary-container), 0.7);
}

/* 消息文本样式 */
.message-text {
  line-height: 1.6;
  word-wrap: break-word;
  color: rgb(var(--v-theme-on-surface));
  font-size: 0.95rem;
}

.user-message-bubble .message-text {
  color: rgb(var(--v-theme-on-primary-container));
}

/* 代码样式 */
.message-text :deep(code) {
  background-color: rgb(var(--v-theme-surface-container-high));
  color: rgb(var(--v-theme-primary));
  padding: 4px 8px;
  border-radius: 6px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.85rem;
  border: 1px solid rgb(var(--v-theme-outline-variant));
  font-weight: 500;
}

.message-text :deep(pre) {
  background-color: rgb(var(--v-theme-surface-container-lowest));
  color: rgb(var(--v-theme-on-surface));
  padding: 16px 20px;
  border-radius: 12px;
  overflow-x: auto;
  margin: 12px 0;
  border-left: 4px solid rgb(var(--v-theme-primary));
  border: 1px solid rgb(var(--v-theme-outline-variant));
  box-shadow: 0 1px 3px rgba(var(--v-theme-shadow), 0.1);
}

.message-text :deep(pre code) {
  background: none;
  padding: 0;
  border: none;
  color: inherit;
  font-weight: 400;
}

.message-text :deep(strong) {
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
}

.message-text :deep(em) {
  font-style: italic;
  color: rgb(var(--v-theme-on-surface-variant));
}

/* 用户消息的代码样式 */
.user-message-bubble .message-text :deep(code) {
  background-color: rgba(var(--v-theme-on-primary-container), 0.12);
  color: rgb(var(--v-theme-on-primary-container));
  border-color: rgba(var(--v-theme-on-primary-container), 0.24);
}

.user-message-bubble .message-text :deep(pre) {
  background-color: rgba(var(--v-theme-on-primary-container), 0.08);
  color: rgb(var(--v-theme-on-primary-container));
  border-left-color: rgb(var(--v-theme-on-primary-container));
  border-color: rgba(var(--v-theme-on-primary-container), 0.24);
}

.user-message-bubble .message-text :deep(strong) {
  color: rgb(var(--v-theme-on-primary-container));
}

.user-message-bubble .message-text :deep(em) {
  color: rgba(var(--v-theme-on-primary-container), 0.8);
}

/* 输入区域 */
.input-area {
  padding: 24px;
  background-color: rgb(var(--v-theme-surface-container-low));
  border-radius: 0 0 12px 12px;
}

/* 加载指示器 */
.typing-indicator {
  display: flex;
  align-items: center;
  font-style: italic;
  color: rgb(var(--v-theme-on-surface-variant));
}

.send-btn {
  min-width: 56px !important;
  height: 56px !important;
}

/* 滚动条样式 */
.messages-container::-webkit-scrollbar {
  width: 8px;
}

.messages-container::-webkit-scrollbar-track {
  background: rgb(var(--v-theme-surface-variant));
  border-radius: 4px;
}

.messages-container::-webkit-scrollbar-thumb {
  background: rgb(var(--v-theme-outline));
  border-radius: 4px;
}

.messages-container::-webkit-scrollbar-thumb:hover {
  background: rgb(var(--v-theme-primary));
}

/* 响应式设计 */
@media (max-width: 960px) {
  .chat-container {
    padding: 16px;
  }

  .sidebar {
    padding-right: 0;
    padding-bottom: 12px;
  }

  .chat-main {
    padding-left: 0;
    padding-top: 12px;
  }

  .message-bubble {
    max-width: 90%;
  }

  .messages-container {
    padding: 16px;
  }

  .message-body {
    padding: 16px 20px;
  }

  .config-header,
  .chat-header {
    padding: 16px 20px 12px;
  }

  .config-content,
  .input-area {
    padding: 20px;
  }
}

@media (max-width: 600px) {
  .chat-container {
    padding: 12px;
  }

  .message-bubble {
    max-width: 95%;
  }

  .message-body {
    padding: 12px 16px;
  }

  .config-content,
  .input-area {
    padding: 16px;
  }
}

/* 确保在暗色主题下的额外优化 */
@media (prefers-color-scheme: dark) {
  .message-text :deep(code) {
    background-color: rgb(var(--v-theme-surface-container-highest));
    color: rgb(var(--v-theme-secondary));
  }

  .message-text :deep(pre) {
    background-color: rgb(var(--v-theme-surface-container));
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  }
}
</style>
