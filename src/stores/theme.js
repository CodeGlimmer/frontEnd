import { defineStore } from 'pinia'
import { ref } from 'vue'

/**@typedef {import('vue').ref} ref */

export const useThemeStore = defineStore('themeStore', () => {
  /**
   * 表示主题的ref，默认为'dark'
   * @type {ref<string>}
   * */
  const theme = ref('dark')

  /**
   *用于切换主题
   */
  const changeTheme = () => {
    theme.value = theme.value == 'dark' ? 'light' : 'dark'
  }

  return { theme, changeTheme }
})
