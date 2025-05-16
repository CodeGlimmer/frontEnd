/**
 * 提供平滑的主题切换动画功能
 * @param {Object} options - 配置选项
 * @param {Function} options.changeTheme - 切换主题的函数
 * @param {import('vue').Ref<string>} options.theme - 当前主题的ref
 * @param {number} [options.animationDuration=400] - 动画持续时间(毫秒)
 * @param {number} [options.themeChangeDelay=200] - 主题变更延迟时间(毫秒)
 * @param {number} [options.overlayOpacity=0.6] - 覆盖层透明度
 * @returns {Object} - 包含主题切换相关的ref和函数
 */
import { ref } from 'vue'

export function useThemeTransition({
  changeTheme,
  theme,
  animationDuration = 400,
  themeChangeDelay = 200,
  overlayOpacity = 0.6,
}) {
  const themeOverlay = ref(null)
  const themeToggleBtn = ref(null)

  /**
   * 处理主题切换并显示过渡动画
   * @param {MouseEvent} event - 鼠标事件对象
   */
  const handleThemeChange = (event) => {
    // 获取点击坐标
    const x = event.clientX
    const y = event.clientY

    // 计算从点击位置到最远角落的距离（作为圆形半径）
    const windowWidth = window.innerWidth
    const windowHeight = window.innerHeight
    const endRadius = Math.max(
      Math.hypot(x, y),
      Math.hypot(x - windowWidth, y),
      Math.hypot(x, y - windowHeight),
      Math.hypot(x - windowWidth, y - windowHeight),
    )

    // 设置覆盖层的颜色
    const newTheme = theme.value === 'light' ? 'dark' : 'light'
    const overlayColor = newTheme === 'dark' ? '#121212' : '#ffffff'

    // 应用动画效果
    if (themeOverlay.value) {
      const overlay = themeOverlay.value
      overlay.style.backgroundColor = overlayColor
      overlay.style.left = `${x}px`
      overlay.style.top = `${y}px`
      overlay.style.transform = 'scale(0)'
      overlay.style.opacity = overlayOpacity
      overlay.style.display = 'block'

      // 强制重绘
      overlay.offsetWidth

      // 开始动画
      overlay.style.transform = `scale(${endRadius / 10})`

      // 动画进行中途切换主题
      setTimeout(() => {
        changeTheme()
      }, themeChangeDelay)

      // 动画结束后隐藏覆盖层
      setTimeout(() => {
        overlay.style.display = 'none'
      }, animationDuration)
    } else {
      // 如果引用不可用，直接切换主题
      changeTheme()
    }
  }

  return {
    themeOverlay,
    themeToggleBtn,
    handleThemeChange,
  }
}
