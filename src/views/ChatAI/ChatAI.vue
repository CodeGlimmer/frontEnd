<template>
  <v-container fluid class="chat-container">
    <v-row no-gutters class="fill-height">
      <!-- API 配置侧边栏 -->
      <v-col cols="12" md="3" class="sidebar">
        <v-card class="sidebar-card" elevation="1" rounded="lg">
          <v-card-title class="config-title">
            <v-icon left>mdi-cog</v-icon>
            API 配置
          </v-card-title>

          <v-card-text class="config-content">
            <v-form @submit.prevent="saveConfig">
              <v-text-field
                v-model="config.apiKey"
                label="DeepSeek API Key"
                type="password"
                variant="outlined"
                density="comfortable"
                :rules="[rules.required]"
                hide-details="auto"
                class="config-field"
              />

              <v-text-field
                v-model="config.apiUrl"
                label="API URL"
                variant="outlined"
                density="comfortable"
                :rules="[rules.required]"
                hide-details="auto"
                class="config-field"
              />

              <v-select
                v-model="config.model"
                :items="models"
                label="模型"
                variant="outlined"
                density="comfortable"
                hide-details="auto"
                class="config-field"
              />

              <div class="slider-section">
                <v-slider
                  v-model="config.temperature"
                  label="Temperature"
                  min="0"
                  max="2"
                  step="0.1"
                  thumb-label
                  hide-details="auto"
                  class="config-slider"
                />
              </div>

              <div class="slider-section">
                <v-slider
                  v-model="config.maxTokens"
                  label="Max Tokens"
                  min="100"
                  max="4000"
                  step="100"
                  thumb-label
                  hide-details="auto"
                  class="config-slider"
                />
              </div>

              <div class="action-buttons">
                <v-btn
                  type="submit"
                  color="primary"
                  block
                  :loading="loading"
                  size="large"
                  rounded="lg"
                  class="action-btn"
                >
                  保存配置
                </v-btn>

                <v-btn
                  @click="clearHistory"
                  color="error"
                  variant="outlined"
                  block
                  size="large"
                  rounded="lg"
                  class="action-btn"
                >
                  清空聊天记录
                </v-btn>
              </div>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- 聊天主区域 -->
      <v-col cols="12" md="9" class="chat-main">
        <v-card class="chat-card" elevation="1" rounded="lg">
          <v-card-title class="chat-header">
            <v-icon left>mdi-chat</v-icon>
            DeepSeek 聊天
            <v-spacer />
            <v-chip :color="isConfigured ? 'success' : 'warning'" size="small" rounded="lg">
              {{ isConfigured ? '已配置' : '未配置' }}
            </v-chip>
          </v-card-title>

          <!-- 聊天消息区域 -->
          <v-card-text class="messages-wrapper">
            <div ref="messagesContainer" class="messages-container">
              <div v-if="messages.length === 0" class="empty-state">
                <v-icon size="72" color="primary" class="empty-icon">mdi-chat-outline</v-icon>
                <h3 class="empty-title">开始与 DeepSeek 对话</h3>
                <p class="empty-subtitle">请先配置 API 密钥，然后输入消息开始聊天</p>
              </div>

              <div
                v-for="message in messages"
                :key="message.id"
                class="message-wrapper"
                :class="{ 'message-wrapper--user': message.role === 'user' }"
              >
                <div
                  class="message-bubble"
                  :class="{ 'message-bubble--user': message.role === 'user' }"
                >
                  <div class="message-header">
                    <v-avatar
                      size="32"
                      :color="message.role === 'user' ? 'primary' : 'secondary'"
                      class="message-avatar"
                    >
                      <v-icon color="white">
                        {{ message.role === 'user' ? 'mdi-account' : 'mdi-robot' }}
                      </v-icon>
                    </v-avatar>
                    <div class="message-meta">
                      <span class="message-role">
                        {{ message.role === 'user' ? '用户' : 'DeepSeek' }}
                      </span>
                      <span class="message-time">
                        {{ formatTime(message.timestamp) }}
                      </span>
                    </div>
                  </div>

                  <div class="message-content" v-html="formatMessage(message.content)"></div>
                </div>
              </div>

              <!-- 加载指示器 -->
              <div v-if="loading" class="message-wrapper">
                <div class="message-bubble message-bubble--loading">
                  <div class="message-header">
                    <v-avatar size="32" color="secondary" class="message-avatar">
                      <v-icon color="white">mdi-robot</v-icon>
                    </v-avatar>
                    <div class="message-meta">
                      <span class="message-role">DeepSeek</span>
                    </div>
                  </div>
                  <div class="typing-indicator">
                    <v-progress-circular indeterminate size="20" width="2" color="primary" />
                    <span class="typing-text">正在思考...</span>
                  </div>
                </div>
              </div>
            </div>
          </v-card-text>

          <!-- 消息输入区域 -->
          <v-divider />
          <v-card-actions class="input-section">
            <div class="input-wrapper">
              <v-textarea
                v-model="newMessage"
                placeholder="输入消息..."
                variant="outlined"
                density="comfortable"
                rows="2"
                auto-grow
                max-rows="6"
                hide-details
                rounded="lg"
                class="message-input"
                @keydown.ctrl.enter="sendMessage"
                @keydown.meta.enter="sendMessage"
              />
              <v-btn
                @click="sendMessage"
                color="primary"
                icon="mdi-send"
                size="large"
                rounded="lg"
                class="send-button"
                :disabled="!newMessage.trim() || !isConfigured || loading"
              />
            </div>
            <div class="input-hint">按 Ctrl+Enter 发送消息</div>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- 错误提示 -->
    <v-snackbar v-model="error.show" :color="error.type" timeout="5000" location="top">
      {{ error.message }}
      <template #actions>
        <v-btn color="white" variant="text" @click="error.show = false"> 关闭 </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, computed, nextTick, onMounted } from 'vue'

// 响应式数据
const config = ref({
  apiKey: '',
  apiUrl: 'https://api.deepseek.com/v1/chat/completions',
  model: 'deepseek-chat',
  temperature: 0.7,
  maxTokens: 2000,
})

const models = ['deepseek-chat', 'deepseek-coder', 'deepseek-reasoner']

const messages = ref([])
const newMessage = ref('')
const loading = ref(false)
const messagesContainer = ref(null)

const error = ref({
  show: false,
  message: '',
  type: 'error',
})

// 表单验证规则
const rules = {
  required: (value) => !!value || '此字段为必填项',
}

// 计算属性
const isConfigured = computed(() => {
  return config.value.apiKey && config.value.apiUrl
})

// 方法
const saveConfig = () => {
  try {
    localStorage.setItem('deepseek-config', JSON.stringify(config.value))
    showMessage('配置已保存', 'success')
  } catch {
    showMessage('保存配置失败', 'error')
  }
}

const loadConfig = () => {
  try {
    const saved = localStorage.getItem('deepseek-config')
    if (saved) {
      config.value = { ...config.value, ...JSON.parse(saved) }
    }
  } catch (err) {
    console.error('加载配置失败:', err)
  }
}

const loadMessages = () => {
  try {
    const saved = localStorage.getItem('deepseek-messages')
    if (saved) {
      messages.value = JSON.parse(saved)
    }
  } catch (err) {
    console.error('加载消息失败:', err)
  }
}

const saveMessages = () => {
  try {
    localStorage.setItem('deepseek-messages', JSON.stringify(messages.value))
  } catch (err) {
    console.error('保存消息失败:', err)
  }
}

const clearHistory = () => {
  messages.value = []
  localStorage.removeItem('deepseek-messages')
  showMessage('聊天记录已清空', 'success')
}

const sendMessage = async () => {
  if (!newMessage.value.trim() || !isConfigured.value || loading.value) {
    return
  }

  const userMessage = {
    id: Date.now(),
    role: 'user',
    content: newMessage.value.trim(),
    timestamp: new Date(),
  }

  messages.value.push(userMessage)
  newMessage.value = ''
  loading.value = true

  await nextTick()
  scrollToBottom()

  try {
    const response = await fetch(config.value.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.value.apiKey}`,
      },
      body: JSON.stringify({
        model: config.value.model,
        messages: messages.value.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        temperature: config.value.temperature,
        max_tokens: config.value.maxTokens,
      }),
    })

    if (!response.ok) {
      throw new Error(`API 请求失败: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    if (data.choices && data.choices.length > 0) {
      const assistantMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: data.choices[0].message.content,
        timestamp: new Date(),
      }

      messages.value.push(assistantMessage)
      saveMessages()

      await nextTick()
      scrollToBottom()
    } else {
      throw new Error('API 返回数据格式错误')
    }
  } catch (error) {
    console.error('发送消息失败:', error)
    showMessage(`发送消息失败: ${error.message}`, 'error')
  } finally {
    loading.value = false
  }
}

const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString()
}

const formatMessage = (content) => {
  // 简单的 Markdown 格式化
  return content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
    .replace(/\n/g, '<br>')
}

const showMessage = (message, type = 'info') => {
  error.value = {
    show: true,
    message,
    type,
  }
}

// 生命周期
onMounted(() => {
  loadConfig()
  loadMessages()
})
</script>

<style scoped>
/* 主容器 */
.chat-container {
  height: 100vh;
  padding: 24px;
  background-color: #fafafa;
}

/* 侧边栏 */
.sidebar {
  padding-right: 12px;
}

.sidebar-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.config-title {
  padding: 20px 24px 12px 24px;
  font-size: 1.25rem;
  font-weight: 500;
}

.config-content {
  flex-grow: 1;
  padding: 0 24px 24px 24px;
  display: flex;
  flex-direction: column;
}

.config-field {
  margin-bottom: 20px;
}

.slider-section {
  margin-bottom: 24px;
}

.config-slider {
  margin-top: 8px;
}

.action-buttons {
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.action-btn {
  height: 48px;
}

/* 聊天主区域 */
.chat-main {
  padding-left: 12px;
}

.chat-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.chat-header {
  padding: 20px 24px 12px 24px;
  font-size: 1.25rem;
  font-weight: 500;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.messages-wrapper {
  flex-grow: 1;
  padding: 0;
  overflow: hidden;
}

.messages-container {
  height: 100%;
  overflow-y: auto;
  padding: 24px;
  scroll-behavior: smooth;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
  gap: 16px;
}

.empty-icon {
  opacity: 0.6;
}

.empty-title {
  color: rgba(0, 0, 0, 0.87);
  font-weight: 500;
  margin: 0;
}

.empty-subtitle {
  color: rgba(0, 0, 0, 0.6);
  margin: 0;
}

/* 消息气泡 */
.message-wrapper {
  margin-bottom: 24px;
  display: flex;
  align-items: flex-start;
}

.message-wrapper--user {
  justify-content: flex-end;
}

.message-bubble {
  max-width: 70%;
  background-color: #ffffff;
  border-radius: 20px 20px 20px 4px;
  padding: 16px 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.message-bubble--user {
  background-color: #e3f2fd;
  border-radius: 20px 20px 4px 20px;
}

.message-bubble--loading {
  background-color: #f5f5f5;
}

.message-header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.message-avatar {
  flex-shrink: 0;
}

.message-meta {
  margin-left: 12px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.message-role {
  font-weight: 600;
  font-size: 0.875rem;
  color: rgba(0, 0, 0, 0.87);
}

.message-time {
  font-size: 0.75rem;
  color: rgba(0, 0, 0, 0.6);
}

.message-content {
  line-height: 1.6;
  word-wrap: break-word;
  color: rgba(0, 0, 0, 0.87);
}

.message-content :deep(code) {
  background-color: rgba(0, 0, 0, 0.08);
  padding: 4px 8px;
  border-radius: 8px;
  font-family: 'Roboto Mono', 'Courier New', monospace;
  font-size: 0.875rem;
}

.message-content :deep(strong) {
  font-weight: 600;
}

.message-content :deep(em) {
  font-style: italic;
}

/* 加载指示器 */
.typing-indicator {
  display: flex;
  align-items: center;
  gap: 12px;
}

.typing-text {
  color: rgba(0, 0, 0, 0.6);
  font-size: 0.875rem;
}

/* 输入区域 */
.input-section {
  padding: 20px 24px;
  background-color: #fafafa;
}

.input-wrapper {
  display: flex;
  align-items: flex-end;
  gap: 12px;
  width: 100%;
}

.message-input {
  flex-grow: 1;
}

.send-button {
  flex-shrink: 0;
  margin-bottom: 4px;
}

.input-hint {
  font-size: 0.75rem;
  color: rgba(0, 0, 0, 0.6);
  margin-top: 8px;
  text-align: center;
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
    max-width: 85%;
  }
}

@media (max-width: 600px) {
  .chat-container {
    padding: 12px;
  }

  .config-content,
  .messages-container,
  .input-section {
    padding: 16px;
  }

  .config-title,
  .chat-header {
    padding: 16px;
  }

  .message-bubble {
    max-width: 90%;
    padding: 12px 16px;
  }

  .message-wrapper {
    margin-bottom: 16px;
  }
}

/* 滚动条样式 */
.messages-container::-webkit-scrollbar {
  width: 6px;
}

.messages-container::-webkit-scrollbar-track {
  background: transparent;
}

.messages-container::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}

.messages-container::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}
</style>
