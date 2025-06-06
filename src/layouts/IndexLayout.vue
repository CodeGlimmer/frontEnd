<template>
  <v-app :theme="theme" :class="{ dark: isDarkMode }">
    <v-layout class="layout-wrapper">
      <!-- 响应式App Bar -->
      <v-app-bar class="elevation-12" app fixed>
        <!-- 在移动端和桌面端都显示的菜单按钮 -->
        <v-btn icon="mdi-apps" @click="showNavigationDrawer = !showNavigationDrawer"> </v-btn>
        <v-spacer></v-spacer>

        <!-- 桌面端显示所有按钮，移动端隐藏并放入菜单中 -->
        <div class="d-none d-sm-flex">
          <v-btn
            prepend-icon="mdi-view-dashboard-outline"
            variant="outlined"
            class="me-2"
            to="/index/"
            >DashBoard</v-btn
          >
          <v-btn
            prepend-icon="mdi-database-outline"
            variant="outlined"
            class="me-2"
            to="/index/ordermanagement"
            >订单管理</v-btn
          >
          <v-btn
            prepend-icon="mdi-eye-outline"
            variant="outlined"
            class="me-2"
            to="/index/agvmonitoring"
            >AGV监控</v-btn
          >
          <v-btn
            prepend-icon="mdi-invoice-text-clock-outline"
            variant="outlined"
            class="me-2"
            to="/index/schedulingplanning"
            >调度规划</v-btn
          >
        </div>

        <!-- 移动端的应用选择菜单 -->
        <v-menu v-if="$vuetify.display.smAndDown" v-model="appMenuOpen">
          <template v-slot:activator="{ props }">
            <v-btn v-bind="props" icon="mdi-dots-vertical" class="me-2"></v-btn>
          </template>
          <v-list>
            <v-list-item
              prepend-icon="mdi-view-dashboard-outline"
              title="DashBoard"
              to="/index/"
            ></v-list-item>
            <v-list-item
              prepend-icon="mdi-database-outline"
              title="订单管理"
              to="/index/ordermanagement"
            ></v-list-item>
            <v-list-item
              prepend-icon="mdi-eye-outline"
              title="AGV监控"
              to="/index/agvmonitoring"
            ></v-list-item>
            <v-list-item
              prepend-icon="mdi-invoice-text-clock-outline"
              title="调度规划"
              to="/index/schedulingplanning"
            ></v-list-item>
          </v-list>
        </v-menu>
        <!-- 主题切换按钮在所有尺寸下都保持显示 -->
        <v-btn
          :prepend-icon="theme === 'light' ? 'mdi-weather-sunny' : 'mdi-weather-night'"
          :text="$vuetify.display.smAndUp ? 'Toggle Theme' : ''"
          slim
          @click="handleThemeChange"
          ref="themeToggleBtn"
        ></v-btn>
      </v-app-bar>

      <!-- 响应式导航抽屉 -->
      <v-navigation-drawer
        v-model="showNavigationDrawer"
        :rail="rail && $vuetify.display.mdAndUp"
        :temporary="$vuetify.display.smAndDown"
        :permanent="$vuetify.display.mdAndUp"
        class="elevation-12"
        :class="{ 'fixed-drawer': $vuetify.display.mdAndUp }"
        rounded="lg"
        border
        app
        @click="handleDrawerClick"
      >
        <!-- 用户信息部分 -->
        <v-list-item
          :prepend-avatar="pic"
          :title="username"
          :subtitle="email"
          class="mt-2"
          @click="handleUserClick"
        >
          <template v-slot:append>
            <v-btn
              v-if="$vuetify.display.mdAndUp"
              variant="text"
              icon="mdi-chevron-left"
              @click.stop="rail = !rail"
            ></v-btn>
            <v-btn
              v-else
              variant="text"
              icon="mdi-close"
              @click.stop="showNavigationDrawer = false"
            ></v-btn>
          </template>
        </v-list-item>

        <v-divider class="my-2"></v-divider>

        <!-- Quick Access 部分 -->
        <v-list-subheader v-if="!rail || $vuetify.display.smAndDown">
          <v-icon>mdi-rocket-launch-outline</v-icon>
          QUICK ACCESS</v-list-subheader
        >
        <v-list nav density="compact">
          <v-list-item
            prepend-icon="mdi-view-dashboard-outline"
            title="订单概览"
            value="orderOperation"
            to="/index/ordermanagement"
            @click="$vuetify.display.smAndDown && (showNavigationDrawer = false)"
          ></v-list-item>

          <v-list-item
            prepend-icon="mdi-webcam"
            title="AGV实时监控"
            value="tasks"
            to="/index/agvmonitoring"
            @click="$vuetify.display.smAndDown && (showNavigationDrawer = false)"
          ></v-list-item>

          <v-list-item
            prepend-icon="mdi-chart-areaspline"
            title="订单预测"
            value="path"
            to="/index/schedulingplanning"
            @click="$vuetify.display.smAndDown && (showNavigationDrawer = false)"
          ></v-list-item>

          <v-list-group value="shortcuts">
            <template v-slot:activator="{ props }">
              <v-list-item
                v-bind="props"
                prepend-icon="mdi-dots-horizontal"
                title="更多"
              ></v-list-item>
            </template>

            <v-list-item
              prepend-icon="mdi-store"
              title="购物"
              value="shop"
              to="/index/shop"
              @click="$vuetify.display.smAndDown && (showNavigationDrawer = false)"
            ></v-list-item>

            <v-list-item
              prepend-icon="mdi-note-text-outline"
              title="便签"
              value="notes"
              to="/index/memo"
              @click="$vuetify.display.smAndDown && (showNavigationDrawer = false)"
            ></v-list-item>

            <v-list-item
              prepend-icon="mdi-calendar-clock"
              title="日程"
              value="calendar"
              to="/index/scheduleApp"
              @click="$vuetify.display.smAndDown && (showNavigationDrawer = false)"
            ></v-list-item>

            <v-list-item
              prepend-icon="mdi-advertisements"
              title="了解我们"
              value="calendar"
              to="/index/adv-display"
              @click="$vuetify.display.smAndDown && (showNavigationDrawer = false)"
            ></v-list-item>

            <v-list-item
              prepend-icon="mdi-chat"
              title="chatai"
              value="calendar"
              to="/index/chatai"
              @click="$vuetify.display.smAndDown && (showNavigationDrawer = false)"
            ></v-list-item>
          </v-list-group>
        </v-list>

        <v-divider class="my-2"></v-divider>

        <!-- Tools 部分 - 用于Router导航 -->
        <v-list-subheader v-if="!rail || $vuetify.display.smAndDown">
          <v-icon>mdi-tools</v-icon>
          TOOLS</v-list-subheader
        >
        <router-view v-slot="{ Component }" name="sidebar">
          <keep-alive>
            <component :is="Component" />
          </keep-alive>
        </router-view>

        <!-- 优化后的底部设置与登出部分 -->
        <template v-slot:append>
          <!-- 展开状态下显示卡片 -->
          <v-card
            v-if="(!rail && $vuetify.display.mdAndUp) || $vuetify.display.smAndDown"
            class="text-primary elevation-4 mx-2 mb-2 tw:!shadow-m-elevation-6"
            density="comfortable"
          >
            <v-card-title>General options</v-card-title>
            <v-card-subtitle>You can set it up, or opt out</v-card-subtitle>
            <v-card-actions>
              <v-container>
                <v-row>
                  <v-col cols="6">
                    <v-btn
                      prepend-icon="mdi-cog"
                      size="small"
                      :block="$vuetify.display.xs"
                      to="/index/setting"
                      >setting</v-btn
                    >
                  </v-col>
                  <v-col cols="6">
                    <v-btn
                      prepend-icon="mdi-logout"
                      color="error"
                      size="small"
                      :block="$vuetify.display.xs"
                      @click="signOut"
                      >sign out</v-btn
                    >
                  </v-col>
                </v-row>
              </v-container>
            </v-card-actions>
          </v-card>

          <!-- 折叠状态下显示悬浮按钮 (仅桌面折叠模式) -->
          <div v-else-if="rail && $vuetify.display.mdAndUp" class="d-flex justify-center mb-4">
            <v-menu v-model="optionsMenu" :close-on-content-click="false" location="end" offset="8">
              <template v-slot:activator="{ props }">
                <v-btn
                  v-bind="props"
                  icon="mdi-dots-horizontal-circle"
                  color="primary"
                  size="large"
                  class="mb-2"
                ></v-btn>
              </template>
              <v-card min-width="200" class="options-menu">
                <v-list>
                  <v-list-item
                    prepend-icon="mdi-cog"
                    title="Settings"
                    @click="openSettings"
                  ></v-list-item>
                  <v-divider></v-divider>
                  <v-list-item
                    prepend-icon="mdi-logout"
                    title="Sign out"
                    color="error"
                    @click="signOut"
                  ></v-list-item>
                </v-list>
              </v-card>
            </v-menu>
          </div>
        </template>
      </v-navigation-drawer>

      <!-- Router内容区域 -->
      <v-main class="main-content">
        <div class="scrollable-content">
          <router-view v-slot="{ Component }" name="main">
            <v-scroll-x-transition :duration="{ enter: 1000, leave: 500 }">
              <component :is="Component" />
            </v-scroll-x-transition>
          </router-view>
        </div>
      </v-main>

      <!-- 主题切换动画层 -->
      <div class="theme-transition-overlay" ref="themeOverlay"></div>

      <!-- 在原有布局的最后添加悬浮球 -->
      <teleport to="body">
        <FloatingOrb
          v-if="shouldShowFloatingOrb"
          class="layout-floating-orb"
          :style="floatingOrbStyles"
        />
      </teleport>
    </v-layout>
  </v-app>
</template>

<script setup>
import { useThemeStore } from '@/stores'
import { ref, toRefs, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useThemeTransition } from '@/utils'
import { useDisplay } from 'vuetify'
import { availableHost } from '@/utils'
import axios from 'axios'
import { computed, onUnmounted } from 'vue'
import { useFloatingOrb } from '@/composables/useFloatingOrb'
import FloatingOrb from '@/views/FloatingActionButton/FloatingOrb.vue'

const themeStore = useThemeStore()
const { theme } = toRefs(themeStore)
const { changeTheme } = themeStore
const { isDarkMode } = toRefs(themeStore)
const showNavigationDrawer = ref(true)
const rail = ref(false)
const router = useRouter()
const optionsMenu = ref(false)
const appMenuOpen = ref(false)
const display = useDisplay()
const pic = ref('https://randomuser.me/api/portraits/men/9.jpg')
const username = ref('')
const email = ref('')

// 自动处理移动端初始导航抽屉状态
showNavigationDrawer.value = !display.smAndDown.value

// 使用主题切换的组合式函数
const { themeOverlay, themeToggleBtn, handleThemeChange } = useThemeTransition({
  changeTheme,
  theme,
})

const signOut = () => {
  router.push('/')
  optionsMenu.value = false
  showNavigationDrawer.value = false
}

const openSettings = () => {
  // 打开设置页面的处理逻辑
  router.push('/index/setting')
}

// 处理侧边栏的点击事件
const handleDrawerClick = (event) => {
  // 仅在桌面模式下处理折叠逻辑
  if (
    display.mdAndUp.value &&
    rail.value &&
    !event.target.closest('.v-list-item') &&
    !event.target.closest('.v-btn')
  ) {
    rail.value = false
  }
}

// 处理用户头像区域的点击事件
const handleUserClick = (event) => {
  // 确保点击的不是折叠按钮
  if (!event.target.closest('.v-btn')) {
    if (display.mdAndUp.value && rail.value) {
      rail.value = false
    }
    // 在移动端不做额外处理
  }
}

// 悬浮球相关逻辑
const {
  orbState,
  orbConfig,
  adjustPositionForDevice,
  getFinalPosition,
  adjustForKeyboard,
  setMenuItems,
} = useFloatingOrb()

// 计算是否显示悬浮球
const shouldShowFloatingOrb = computed(() => {
  return orbState.isVisible && orbState.isEnabled
})

// 计算悬浮球的最终样式
const floatingOrbStyles = computed(() => {
  const position = getFinalPosition()
  return {
    position: 'fixed',
    bottom: `${position.bottom}px`,
    right: `${position.right}px`,
    zIndex: orbConfig.responsive.zIndex,
    pointerEvents: 'auto',
  }
})

// 设置默认菜单项（根据您的应用调整）
const initializeFloatingOrb = () => {
  const defaultMenuItems = [
    {
      id: 'chat',
      label: 'AI聊天',
      icon: 'mdi-chat',
      color: 'primary',
      route: '/chat',
    },
    {
      id: 'dashboard',
      label: '仪表板',
      icon: 'mdi-view-dashboard',
      color: 'success',
      route: '/dashboard',
    },
    {
      id: 'analytics',
      label: '分析',
      icon: 'mdi-chart-line',
      color: 'info',
      route: '/analytics',
    },
    {
      id: 'settings',
      label: '设置',
      icon: 'mdi-cog',
      color: 'warning',
      route: '/settings',
    },
  ]

  setMenuItems(defaultMenuItems)

  // 初始位置调整
  adjustPositionForDevice()
}

// 响应式处理函数
const handleResize = () => {
  adjustPositionForDevice()
}

const handleOrientationChange = () => {
  // 延迟处理，等待方向变化完成
  setTimeout(() => {
    adjustPositionForDevice()
  }, 300)
}

const handleVisualViewportChange = () => {
  adjustForKeyboard()
}

onMounted(() => {
  // 初始化悬浮球
  initializeFloatingOrb()

  // 添加事件监听器
  window.addEventListener('resize', handleResize)
  window.addEventListener('orientationchange', handleOrientationChange)

  // 监听虚拟键盘
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', handleVisualViewportChange)
  }

  // 设置CSS变量支持安全区域
  const setCSSSupport = () => {
    if (CSS.supports('padding: env(safe-area-inset-bottom)')) {
      document.documentElement.style.setProperty(
        '--sat-inset-bottom',
        'env(safe-area-inset-bottom)',
      )
      document.documentElement.style.setProperty('--sat-inset-right', 'env(safe-area-inset-right)')
    }
  }

  setCSSSupport()
})

onUnmounted(() => {
  // 清理事件监听器
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('orientationchange', handleOrientationChange)

  if (window.visualViewport) {
    window.visualViewport.removeEventListener('resize', handleVisualViewportChange)
  }
})

onMounted(() => {
  const usrname = localStorage.getItem('username')
  axios.post(`${availableHost}find/`, { username: usrname }).then(({ data }) => {
    if (data.image) {
      pic.value = `data:image/jpeg;base64,${data.image}`
    }
    username.value = data.username
    email.value = data.email
  })
})
</script>

<style lang="scss" scoped>
@import '@/assets/styles/themeTransition.css';

.layout-wrapper {
  position: relative;
  height: 100vh;
  overflow: hidden;
}

.v-app-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
}

.fixed-drawer {
  position: fixed !important;
  top: 64px !important; /* 与AppBar的高度一致，适应不同Vuetify主题可能需要调整 */
  height: calc(100vh - 64px) !important;
  overflow-y: auto;
  z-index: 99;
  transition: 0.2s ease-in-out;
}

.main-content {
  padding-top: 64px !important; /* 与AppBar的高度一致 */
  height: 100vh;
  overflow: hidden;
}

.scrollable-content {
  height: 100%;
  overflow-y: auto;
  padding: 16px;
}

.options-menu {
  overflow: visible;

  .v-list-item {
    min-height: 40px;
    cursor: pointer;

    &:hover {
      background-color: rgba(var(--v-theme-primary), 0.1);
    }
  }
}

/* 移动设备样式调整 */
@media (max-width: 600px) {
  .scrollable-content {
    padding: 8px;
  }
}

.theme-transition-overlay {
  position: fixed;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  transform: scale(0);
  display: none;
  z-index: 1;
  pointer-events: none; /* 确保点击可以穿透覆盖层 */
  opacity: 0.6; /* 透明度 */
  mix-blend-mode: difference; /* 使用不同的混合模式使效果更明显 */
  transition: transform 0.4s cubic-bezier(0.25, 1, 0.5, 1);
}

/* 悬浮球样式 - 不影响原有布局 */
.layout-floating-orb {
  /* 确保悬浮球在最顶层但不影响布局流 */
  position: fixed !important;
  pointer-events: auto;

  /* 针对不同设备的优化 */
  @media (max-width: 768px) {
    /* 移动设备：增加触控友好性 */
    &::before {
      content: '';
      position: absolute;
      top: -8px;
      left: -8px;
      right: -8px;
      bottom: -8px;
      pointer-events: auto;
      border-radius: 50%;
    }
  }

  @media (min-width: 769px) and (max-width: 1024px) {
    /* 平板设备：适中的交互区域 */
    &::before {
      content: '';
      position: absolute;
      top: -4px;
      left: -4px;
      right: -4px;
      bottom: -4px;
      pointer-events: auto;
      border-radius: 50%;
    }
  }

  /* 确保在各种主题下都可见 */
  filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.15));
}

/* 避免悬浮球影响页面内容的滚动 */
:deep(.v-main) {
  /* 保持原有样式，不添加额外的padding */
}

/* 响应式适配 */
@media (max-width: 480px) {
  .layout-floating-orb {
    /* 小屏设备：更贴近边缘 */
    transform: translateY(-4px) translateX(-4px);
  }
}

/* 横屏模式特殊处理 */
@media (orientation: landscape) and (max-height: 600px) {
  .layout-floating-orb {
    /* 横屏时降低位置，避免与顶部内容冲突 */
    transform: translateY(-8px);
  }
}

/* 安全区域适配 - 使用CSS变量 */
@supports (padding: env(safe-area-inset-bottom)) {
  .layout-floating-orb {
    /* 使用CSS变量来处理安全区域 */
    --safe-area-bottom: env(safe-area-inset-bottom, 0px);
    --safe-area-right: env(safe-area-inset-right, 0px);

    /* 通过margin来处理安全区域偏移 */
    margin-bottom: var(--safe-area-bottom);
    margin-right: var(--safe-area-right);
  }
}
</style>
