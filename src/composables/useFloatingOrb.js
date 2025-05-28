import { ref, reactive } from 'vue'

// 全局状态
const orbState = reactive({
  isVisible: true,
  isEnabled: true,
  position: {
    // 默认位置 - 相对于视口固定定位
    bottom: 24, // 减少默认底部距离
    right: 24, // 减少默认右侧距离
    // 响应式位置配置
    mobile: { bottom: 20, right: 16 }, // 手机 - 更贴近边缘
    tablet: { bottom: 24, right: 20 }, // 平板 - 适中距离
    desktop: { bottom: 32, right: 32 }, // 桌面 - 更大间距
  },
  theme: 'auto', // auto | light | dark
})

const orbConfig = reactive({
  // DeepSeek API 配置
  deepseek: {
    apiKey: 'sk-774c95fcd68f4d1585b342c3bb58bbc9',
    apiUrl: 'https://api.deepseek.com/v1/chat/completions',
    model: 'deepseek-chat',
    temperature: 0.7,
    maxTokens: 1000,
  },

  // 语音识别配置
  speech: {
    language: 'zh-CN',
    continuous: false,
    interimResults: false,
  },

  // 菜单配置
  menu: {
    items: [],
    autoHide: true,
    animationSpeed: 0.3,
  },

  // 触控配置
  touch: {
    tapRadius: 48, // 触控区域半径（移动设备）
    longPressDuration: 600, // 长按触发时间（毫秒）
    hapticFeedback: true, // 是否启用触感反馈
  },

  // 对话框配置
  dialog: {
    position: 'left', // left | right | top | bottom | center
    offset: { x: -20, y: 0 }, // 相对于悬浮球的偏移量
    width: 380, // 对话框宽度
    maxWidth: '85vw', // 最大宽度（响应式）
    height: 'auto', // 对话框高度
    maxHeight: '70vh', // 最大高度
    spacing: 16, // 与悬浮球的间距
  },

  // 自适应配置
  responsive: {
    enableAutoPosition: true, // 是否启用自动位置调整
    avoidKeyboard: true, // 是否避开虚拟键盘
    safeAreaPadding: true, // 是否考虑安全区域
    zIndex: 9999, // z-index 层级
  },

  // 布局配置 - 确保不影响现有布局
  layout: {
    useFixedPosition: true, // 使用 fixed 定位
    respectLayoutPadding: true, // 尊重布局的padding
    avoidNavigation: true, // 避开导航栏
    minDistanceFromEdge: 16, // 距离边缘最小距离
  },
})

// 悬浮球控制
export function useFloatingOrb() {
  const showOrb = () => {
    orbState.isVisible = true
  }

  const hideOrb = () => {
    orbState.isVisible = false
  }

  const toggleOrb = () => {
    orbState.isVisible = !orbState.isVisible
  }

  const enableOrb = () => {
    orbState.isEnabled = true
  }

  const disableOrb = () => {
    orbState.isEnabled = false
  }

  const setOrbPosition = (position) => {
    Object.assign(orbState.position, position)
  }

  // 根据设备类型自动调整位置
  const adjustPositionForDevice = () => {
    const isMobile = window.innerWidth <= 768
    const isTablet = window.innerWidth > 768 && window.innerWidth <= 1024

    if (orbConfig.responsive.enableAutoPosition) {
      let targetPosition
      if (isMobile) {
        targetPosition = orbState.position.mobile
      } else if (isTablet) {
        targetPosition = orbState.position.tablet
      } else {
        targetPosition = orbState.position.desktop
      }

      // 只更新当前位置，不影响预设配置
      orbState.position.bottom = targetPosition.bottom
      orbState.position.right = targetPosition.right
    }
  }

  // 获取考虑安全区域的最终位置
  const getFinalPosition = () => {
    let position = { ...orbState.position }

    if (orbConfig.responsive.safeAreaPadding) {
      // 检测安全区域
      const computedStyle = getComputedStyle(document.documentElement)
      const safeAreaBottom = parseInt(
        computedStyle.getPropertyValue('--sat-inset-bottom') ||
          computedStyle.getPropertyValue('env(safe-area-inset-bottom)') ||
          '0',
      )
      const safeAreaRight = parseInt(
        computedStyle.getPropertyValue('--sat-inset-right') ||
          computedStyle.getPropertyValue('env(safe-area-inset-right)') ||
          '0',
      )

      position.bottom += safeAreaBottom
      position.right += safeAreaRight
    }

    // 确保最小距离
    position.bottom = Math.max(position.bottom, orbConfig.layout.minDistanceFromEdge)
    position.right = Math.max(position.right, orbConfig.layout.minDistanceFromEdge)

    return position
  }

  // 检查是否需要避开键盘
  const adjustForKeyboard = () => {
    if (!orbConfig.responsive.avoidKeyboard) return

    const viewportHeight = window.visualViewport?.height || window.innerHeight
    const windowHeight = window.innerHeight
    const keyboardHeight = windowHeight - viewportHeight

    if (keyboardHeight > 100) {
      // 键盘弹出
      const originalBottom = orbState.position.bottom
      orbState.position.bottom = Math.max(originalBottom, keyboardHeight + 20)
    }
  }

  const updateConfig = (newConfig) => {
    Object.assign(orbConfig, newConfig)
  }

  const setDeepSeekConfig = (config) => {
    Object.assign(orbConfig.deepseek, config)
  }

  const setSpeechConfig = (config) => {
    Object.assign(orbConfig.speech, config)
  }

  const setMenuItems = (items) => {
    orbConfig.menu.items = items
  }

  const setTouchConfig = (config) => {
    Object.assign(orbConfig.touch, config)
  }

  const setResponsiveConfig = (config) => {
    Object.assign(orbConfig.responsive, config)
  }

  const setLayoutConfig = (config) => {
    Object.assign(orbConfig.layout, config)
  }

  const setDialogConfig = (config) => {
    Object.assign(orbConfig.dialog, config)
  }

  return {
    // 状态
    orbState,
    orbConfig,

    // 方法
    showOrb,
    hideOrb,
    toggleOrb,
    enableOrb,
    disableOrb,
    setOrbPosition,
    adjustPositionForDevice,
    getFinalPosition,
    updateConfig,
    setDeepSeekConfig,
    setSpeechConfig,
    setMenuItems,
    setTouchConfig,
    setResponsiveConfig,
    setLayoutConfig,
    setDialogConfig,
    adjustForKeyboard,
  }
}

// DeepSeek API 服务
export class FloatingOrbDeepSeekService {
  constructor(config) {
    this.config = config
  }

  async sendMessage(message) {
    if (!this.config.apiKey) {
      throw new Error('DeepSeek API Key 未配置')
    }

    try {
      const response = await fetch(this.config.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: [
            {
              role: 'user',
              content: message,
            },
          ],
          temperature: this.config.temperature,
          max_tokens: this.config.maxTokens,
          stream: false,
        }),
      })

      if (!response.ok) {
        throw new Error(`API 请求失败: ${response.status}`)
      }

      const data = await response.json()

      if (data.choices && data.choices.length > 0) {
        return data.choices[0].message.content
      } else {
        throw new Error('API 返回数据格式错误')
      }
    } catch (error) {
      console.error('DeepSeek API 调用失败:', error)
      throw error
    }
  }

  async sendStreamMessage(message, onChunk) {
    if (!this.config.apiKey) {
      throw new Error('DeepSeek API Key 未配置')
    }

    try {
      const response = await fetch(this.config.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: [
            {
              role: 'user',
              content: message,
            },
          ],
          temperature: this.config.temperature,
          max_tokens: this.config.maxTokens,
          stream: true,
        }),
      })

      if (!response.ok) {
        throw new Error(`API 请求失败: ${response.status}`)
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n').filter((line) => line.trim() !== '')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') return

            try {
              const parsed = JSON.parse(data)
              if (
                parsed.choices &&
                parsed.choices[0] &&
                parsed.choices[0].delta &&
                parsed.choices[0].delta.content
              ) {
                onChunk(parsed.choices[0].delta.content)
              }
            } catch (e) {
              // 忽略解析错误
            }
          }
        }
      }
    } catch (error) {
      console.error('DeepSeek 流式 API 调用失败:', error)
      throw error
    }
  }
}
