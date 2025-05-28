import { ref, computed } from 'vue'

// DeepSeek API 服务
export class DeepSeekService {
  constructor(config) {
    this.config = config
  }

  async sendMessage(messages) {
    const response = await fetch(this.config.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        model: this.config.model,
        messages: messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        temperature: this.config.temperature,
        max_tokens: this.config.maxTokens,
        stream: false,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`)
    }

    return await response.json()
  }

  async sendStreamMessage(messages, onChunk) {
    const response = await fetch(this.config.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        model: this.config.model,
        messages: messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        temperature: this.config.temperature,
        max_tokens: this.config.maxTokens,
        stream: true,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`)
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') return

            try {
              const parsed = JSON.parse(data)
              if (parsed.choices?.[0]?.delta?.content) {
                onChunk(parsed.choices[0].delta.content)
              }
            } catch (e) {
              console.warn('解析流数据失败:', e)
            }
          }
        }
      }
    } finally {
      reader.releaseLock()
    }
  }
}

// 聊天配置组合式函数
export function useChatConfig() {
  const config = ref({
    apiKey: '',
    apiUrl: 'https://api.deepseek.com/v1/chat/completions',
    model: 'deepseek-chat',
    temperature: 0.7,
    maxTokens: 2000,
  })

  const models = [
    { title: 'DeepSeek Chat', value: 'deepseek-chat' },
    { title: 'DeepSeek Coder', value: 'deepseek-coder' },
    { title: 'DeepSeek Reasoner', value: 'deepseek-reasoner' },
  ]

  const isConfigured = computed(() => {
    return config.value.apiKey && config.value.apiUrl
  })

  const loadConfig = () => {
    try {
      const saved = localStorage.getItem('deepseek-config')
      if (saved) {
        const savedConfig = JSON.parse(saved)
        config.value = { ...config.value, ...savedConfig }
      }
    } catch (err) {
      console.error('加载配置失败:', err)
    }
  }

  const saveConfig = () => {
    try {
      localStorage.setItem('deepseek-config', JSON.stringify(config.value))
      return true
    } catch (err) {
      console.error('保存配置失败:', err)
      return false
    }
  }

  return {
    config,
    models,
    isConfigured,
    loadConfig,
    saveConfig,
  }
}

// 聊天消息组合式函数
export function useChatMessages() {
  const messages = ref([])

  const addMessage = (role, content) => {
    const message = {
      id: Date.now() + Math.random(),
      role,
      content,
      timestamp: new Date(),
    }
    messages.value.push(message)
    saveMessages()
    return message
  }

  const updateLastMessage = (content) => {
    if (messages.value.length > 0) {
      const lastMessage = messages.value[messages.value.length - 1]
      lastMessage.content = content
      saveMessages()
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

  const clearMessages = () => {
    messages.value = []
    localStorage.removeItem('deepseek-messages')
  }

  return {
    messages,
    addMessage,
    updateLastMessage,
    loadMessages,
    saveMessages,
    clearMessages,
  }
}

// 消息格式化工具
export function formatMessage(content) {
  if (!content) return ''

  return (
    content
      // 代码块
      .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>')
      // 行内代码
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      // 粗体
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // 斜体
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // 链接
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>')
      // 换行
      .replace(/\n/g, '<br>')
  )
}

// 时间格式化工具
export function formatTime(timestamp) {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now - date

  if (diff < 60000) {
    // 1分钟内
    return '刚刚'
  } else if (diff < 3600000) {
    // 1小时内
    return `${Math.floor(diff / 60000)}分钟前`
  } else if (date.toDateString() === now.toDateString()) {
    // 今天
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  } else {
    return date.toLocaleString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }
}
