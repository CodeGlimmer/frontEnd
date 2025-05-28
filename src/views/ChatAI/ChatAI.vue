<template>
  <v-container fluid class="chat-container" :class="{ 'dark-theme': isDark }">
    <v-row no-gutters class="fill-height">
      <!-- API 配置侧边栏 -->
      <v-col cols="12" md="3" class="sidebar">
        <v-card class="sidebar-card" elevation="1" rounded="lg" :color="cardColor">
          <v-card-title class="config-title">
            <v-icon left>mdi-cog</v-icon>
            API 配置
            <v-spacer />
            <!-- 主题切换按钮 -->
            <v-btn
              @click="toggleTheme"
              :icon="isDark ? 'mdi-weather-sunny' : 'mdi-weather-night'"
              variant="text"
              size="small"
              :title="isDark ? '切换到亮色模式' : '切换到暗色模式'"
              class="theme-toggle"
            />
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
                :bg-color="inputBgColor"
              />

              <v-text-field
                v-model="config.apiUrl"
                label="API URL"
                variant="outlined"
                density="comfortable"
                :rules="[rules.required]"
                hide-details="auto"
                class="config-field"
                :bg-color="inputBgColor"
              />

              <v-select
                v-model="config.model"
                :items="models"
                label="模型"
                variant="outlined"
                density="comfortable"
                hide-details="auto"
                class="config-field"
                :bg-color="inputBgColor"
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
        <v-card class="chat-card" elevation="1" rounded="lg" :color="cardColor">
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
                  :class="[
                    { 'message-bubble--user': message.role === 'user' },
                    { 'message-bubble--dark': isDark },
                  ]"
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
                <div
                  class="message-bubble message-bubble--loading"
                  :class="{ 'message-bubble--dark': isDark }"
                >
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
          <v-card-actions class="input-section" :class="{ 'input-section--dark': isDark }">
            <!-- 调试信息 -->
            <div v-if="showDebugInfo" class="debug-info" :class="{ 'debug-info--dark': isDark }">
              <small
                >语音支持: {{ speechSupported ? '是' : '否' }} | 正在监听:
                {{ isListening ? '是' : '否' }}</small
              >
            </div>

            <!-- 语音不支持提示 -->
            <v-alert
              v-if="showSpeechWarning"
              type="warning"
              variant="tonal"
              density="compact"
              class="speech-warning"
              closable
              @click:close="dismissSpeechWarning"
            >
              <template v-slot:prepend>
                <v-icon>mdi-microphone-off</v-icon>
              </template>
              您的浏览器不支持语音输入功能。建议使用 Chrome、Edge 或 Safari 浏览器。
            </v-alert>

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
                :bg-color="inputBgColor"
                @keydown.ctrl.enter="sendMessage"
                @keydown.meta.enter="sendMessage"
              />

              <!-- 语音输入按钮 - 强制显示 -->
              <v-btn
                @click="handleSpeechClick"
                :color="getSpeechButtonColor()"
                size="large"
                rounded="lg"
                class="speech-button"
                :class="getSpeechButtonClass()"
                :disabled="loading"
                :title="getSpeechButtonTooltip()"
                variant="elevated"
              >
                <v-icon :class="{ pulse: isListening }" size="24">
                  {{ getSpeechButtonIcon() }}
                </v-icon>
              </v-btn>

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

            <!-- 语音识别状态指示器 -->
            <div
              v-if="isListening || speechRecognition.interimTranscript"
              class="speech-status"
              :class="{ 'speech-status--dark': isDark }"
            >
              <div class="speech-indicator">
                <v-icon color="error" class="pulse">mdi-microphone</v-icon>
                <span class="speech-text">正在监听...</span>
                <v-btn
                  @click="stopSpeechRecognition"
                  color="error"
                  variant="text"
                  size="small"
                  class="stop-button"
                >
                  停止
                </v-btn>
              </div>

              <!-- 实时转录文本 -->
              <div v-if="speechRecognition.interimTranscript" class="interim-transcript">
                <v-chip size="small" variant="outlined" class="transcript-chip">
                  {{ speechRecognition.interimTranscript }}
                </v-chip>
              </div>
            </div>

            <div class="input-hint" :class="{ 'input-hint--dark': isDark }">
              按 Ctrl+Enter 发送消息 | 点击麦克风图标进行语音输入
              <br />
              <small>语音功能状态: {{ speechSupported ? '已启用' : '不支持' }}</small>
            </div>
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
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue'
import { useTheme } from 'vuetify'

// Vuetify 主题
const theme = useTheme()

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

// 语音识别相关状态
const speechSupported = ref(false)
const isListening = ref(false)
const showSpeechWarning = ref(false)
const showDebugInfo = ref(true) // 添加调试信息显示
const speechRecognition = ref({
  instance: null,
  interimTranscript: '',
  finalTranscript: '',
})

// 主题相关状态
const isDark = ref(false)

// 表单验证规则
const rules = {
  required: (value) => !!value || '此字段为必填项',
}

// 计算属性
const isConfigured = computed(() => {
  return config.value.apiKey && config.value.apiUrl
})

// 主题相关计算属性
const cardColor = computed(() => {
  return isDark.value ? 'grey-darken-4' : 'white'
})

const inputBgColor = computed(() => {
  return isDark.value ? 'grey-darken-3' : 'white'
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

// 主题相关方法
const toggleTheme = () => {
  isDark.value = !isDark.value
  theme.global.name.value = isDark.value ? 'dark' : 'light'

  // 保存主题设置到本地存储
  try {
    localStorage.setItem('chat-theme', isDark.value ? 'dark' : 'light')
  } catch (err) {
    console.error('保存主题设置失败:', err)
  }

  showMessage(`已切换到${isDark.value ? '暗色' : '亮色'}模式`, 'success')
}

const loadTheme = () => {
  try {
    const savedTheme = localStorage.getItem('chat-theme')
    if (savedTheme) {
      isDark.value = savedTheme === 'dark'
      theme.global.name.value = isDark.value ? 'dark' : 'light'
    }
  } catch (err) {
    console.error('加载主题设置失败:', err)
  }
}

// 语音识别相关方法
const initSpeechRecognition = () => {
  console.log('开始初始化语音识别...')

  // 检测浏览器支持
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

  if (!SpeechRecognition) {
    speechSupported.value = false
    showSpeechWarning.value = true
    console.log('❌ 浏览器不支持语音识别')
    showMessage('浏览器不支持语音识别功能', 'warning')
    return
  }

  speechSupported.value = true
  console.log('✅ 浏览器支持语音识别，支持状态:', speechSupported.value)
  showMessage('语音识别功能已启用', 'success')

  const recognition = new SpeechRecognition()

  // 配置语音识别
  recognition.continuous = true
  recognition.interimResults = true
  recognition.lang = 'zh-CN'
  recognition.maxAlternatives = 1

  // 开始识别事件
  recognition.onstart = () => {
    isListening.value = true
    speechRecognition.value.interimTranscript = ''
    speechRecognition.value.finalTranscript = ''
    console.log('🎤 语音识别开始')
    showMessage('开始语音识别', 'info')
  }

  // 识别结果事件
  recognition.onresult = (event) => {
    let interimTranscript = ''
    let finalTranscript = ''

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript

      if (event.results[i].isFinal) {
        finalTranscript += transcript
      } else {
        interimTranscript += transcript
      }
    }

    speechRecognition.value.interimTranscript = interimTranscript

    if (finalTranscript) {
      speechRecognition.value.finalTranscript += finalTranscript
      // 将最终识别结果添加到输入框
      newMessage.value += (newMessage.value ? ' ' : '') + finalTranscript.trim()
      console.log('📝 识别到文字:', finalTranscript)
    }
  }

  // 识别结束事件
  recognition.onend = () => {
    isListening.value = false
    speechRecognition.value.interimTranscript = ''
    console.log('🔇 语音识别结束')

    // 如果有最终转录结果，清空临时状态
    if (speechRecognition.value.finalTranscript) {
      speechRecognition.value.finalTranscript = ''
    }
  }

  // 错误处理
  recognition.onerror = (event) => {
    console.error('❌ 语音识别错误:', event.error)
    isListening.value = false
    speechRecognition.value.interimTranscript = ''

    let errorMessage = '语音识别失败'

    switch (event.error) {
      case 'no-speech':
        errorMessage = '未检测到语音，请重试'
        break
      case 'audio-capture':
        errorMessage = '无法访问麦克风，请检查权限设置'
        break
      case 'not-allowed':
        errorMessage = '麦克风访问被拒绝，请允许麦克风权限'
        break
      case 'network':
        errorMessage = '网络错误，请检查网络连接'
        break
      case 'aborted':
        errorMessage = '语音识别被中断'
        break
      default:
        errorMessage = `语音识别错误: ${event.error}`
    }

    showMessage(errorMessage, 'error')
  }

  speechRecognition.value.instance = recognition
  console.log('🎯 语音识别实例创建完成')
}

const handleSpeechClick = () => {
  console.log('🖱️ 点击语音按钮, 支持状态:', speechSupported.value)

  if (!speechSupported.value) {
    showMessage('您的浏览器不支持语音输入功能，建议使用 Chrome、Edge 或 Safari 浏览器', 'warning')
    return
  }
  toggleSpeechRecognition()
}

const toggleSpeechRecognition = () => {
  console.log('🔄 切换语音识别状态, 当前监听:', isListening.value)

  if (!speechSupported.value || !speechRecognition.value.instance) {
    showMessage('语音识别不可用', 'error')
    return
  }

  if (isListening.value) {
    // 停止语音识别
    console.log('⏹️ 停止语音识别')
    speechRecognition.value.instance.stop()
  } else {
    // 开始语音识别
    console.log('▶️ 开始语音识别')
    try {
      speechRecognition.value.instance.start()
    } catch (error) {
      console.error('启动语音识别失败:', error)
      showMessage('启动语音识别失败，请重试', 'error')
    }
  }
}

const stopSpeechRecognition = () => {
  if (isListening.value && speechRecognition.value.instance) {
    speechRecognition.value.instance.stop()
  }
}

const dismissSpeechWarning = () => {
  showSpeechWarning.value = false
}

// 语音按钮样式和状态方法
const getSpeechButtonColor = () => {
  if (!speechSupported.value) return 'grey-darken-1'
  return isListening.value ? 'error' : 'secondary'
}

const getSpeechButtonIcon = () => {
  if (!speechSupported.value) return 'mdi-microphone-off'
  return isListening.value ? 'mdi-microphone' : 'mdi-microphone-outline'
}

const getSpeechButtonClass = () => {
  const classes = ['speech-btn-base']
  if (isListening.value) classes.push('speech-button--listening')
  if (!speechSupported.value) classes.push('speech-button--disabled')
  return classes.join(' ')
}

const getSpeechButtonTooltip = () => {
  if (!speechSupported.value) return '语音输入不支持'
  return isListening.value ? '停止语音输入' : '开始语音输入'
}

// 生命周期
onMounted(() => {
  console.log('🚀 组件挂载，开始初始化...')
  loadTheme() // 加载主题设置
  loadConfig()
  loadMessages()

  // 延迟初始化语音识别，确保DOM完全加载
  nextTick(() => {
    initSpeechRecognition()
  })
})

onUnmounted(() => {
  // 清理语音识别实例
  stopSpeechRecognition()
})
</script>

<style scoped>
/* 主容器 */
.chat-container {
  height: 100vh;
  padding: 24px;
  background-color: #fafafa;
  transition: all 0.3s ease;
}

.chat-container.dark-theme {
  background-color: #121212;
}

/* 主题切换按钮 */
.theme-toggle {
  opacity: 0.7;
  transition: opacity 0.2s ease;
}

.theme-toggle:hover {
  opacity: 1;
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
  display: flex;
  align-items: center;
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

.message-bubble--dark {
  background-color: #2d2d2d !important;
  border-color: rgba(255, 255, 255, 0.1) !important;
  color: #ffffff;
}

.message-bubble--user.message-bubble--dark {
  background-color: #1565c0 !important;
}

.message-bubble--loading.message-bubble--dark {
  background-color: #424242 !important;
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

.input-section--dark {
  background-color: #1e1e1e !important;
}

.input-wrapper {
  display: flex;
  align-items: flex-end;
  gap: 8px;
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
  line-height: 1.4;
}

/* 调试信息 */
.debug-info {
  width: 100%;
  padding: 8px;
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: 4px;
  margin-bottom: 12px;
  font-family: monospace;
}

.debug-info--dark {
  background-color: rgba(255, 255, 255, 0.1) !important;
  color: #ffffff;
}

/* 语音相关样式 */
.speech-warning {
  width: 100%;
  margin-bottom: 16px;
}

.speech-button {
  margin-right: 8px !important;
  position: relative;
  transition: all 0.3s ease;
  flex-shrink: 0;
  min-width: 56px !important;
  width: 56px !important;
  height: 56px !important;
}

.speech-btn-base {
  border: 2px solid transparent;
}

.speech-button--listening {
  animation: pulse-ring 1.5s infinite;
  border-color: #f44336 !important;
}

.speech-button--disabled {
  opacity: 0.6;
}

/* 确保按钮可见性 */
.input-wrapper {
  display: flex !important;
  align-items: flex-end !important;
  gap: 8px !important;
  width: 100% !important;
}

.message-input {
  flex-grow: 1 !important;
}

.send-button {
  flex-shrink: 0 !important;
  margin-bottom: 4px !important;
}

/* 脉冲动画 */
@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.7;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes pulse-ring {
  0% {
    box-shadow: 0 0 0 0 rgba(244, 67, 54, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(244, 67, 54, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(244, 67, 54, 0);
  }
}

.pulse {
  animation: pulse 1.5s infinite;
}

/* 响应式设计更新 */
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

  .speech-button {
    min-width: 48px !important;
    width: 48px !important;
    height: 48px !important;
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

.dark-theme .messages-container::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
}

.messages-container::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}

.dark-theme .messages-container::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* 强制显示语音按钮 */
.speech-button {
  display: flex !important;
  visibility: visible !important;
  opacity: 1 !important;
}
</style>
