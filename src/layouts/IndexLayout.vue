<template>
  <v-app :theme="theme" :class="{ dark: isDarkMode }">
    <v-layout class="layout-wrapper">
      <!-- 响应式App Bar -->
      <v-app-bar class="elevation-12" app fixed>
        <!-- 在移动端和桌面端都显示的菜单按钮 -->
        <v-btn
          ref="menuToggleBtn"
          icon="mdi-apps"
          @click="showNavigationDrawer = !showNavigationDrawer"
          @mouseenter="onButtonHover"
          @mouseleave="onButtonLeave"
          @mousedown="onButtonPress"
          @mouseup="onButtonRelease"
        >
        </v-btn>
        <v-spacer></v-spacer>

        <!-- 桌面端显示所有按钮，移动端隐藏并放入菜单中 -->
        <div class="d-none d-sm-flex">
          <v-btn
            ref="dashboardBtn"
            prepend-icon="mdi-view-dashboard-outline"
            variant="outlined"
            class="me-2"
            to="/index/"
            @mouseenter="onButtonHover"
            @mouseleave="onButtonLeave"
            @mousedown="onButtonPress"
            @mouseup="onButtonRelease"
            >DashBoard</v-btn
          >
          <v-btn
            ref="orderBtn"
            prepend-icon="mdi-database-outline"
            variant="outlined"
            class="me-2"
            to="/index/ordermanagement"
            @mouseenter="onButtonHover"
            @mouseleave="onButtonLeave"
            @mousedown="onButtonPress"
            @mouseup="onButtonRelease"
            >订单管理</v-btn
          >
          <v-btn
            ref="agvBtn"
            prepend-icon="mdi-eye-outline"
            variant="outlined"
            class="me-2"
            to="/index/agvmonitoring"
            @mouseenter="onButtonHover"
            @mouseleave="onButtonLeave"
            @mousedown="onButtonPress"
            @mouseup="onButtonRelease"
            >AGV监控</v-btn
          >
          <v-btn
            ref="schedulingBtn"
            prepend-icon="mdi-invoice-text-clock-outline"
            variant="outlined"
            class="me-2"
            to="/index/schedulingplanning"
            @mouseenter="onButtonHover"
            @mouseleave="onButtonLeave"
            @mousedown="onButtonPress"
            @mouseup="onButtonRelease"
            >调度规划</v-btn
          >
        </div>

        <!-- 移动端的应用选择菜单 -->
        <v-menu v-if="$vuetify.display.smAndDown" v-model="appMenuOpen">
          <template v-slot:activator="{ props }">
            <v-btn
              ref="mobileMenuBtn"
              v-bind="props"
              icon="mdi-dots-vertical"
              class="me-2"
              @mouseenter="onButtonHover"
              @mouseleave="onButtonLeave"
              @mousedown="onButtonPress"
              @mouseup="onButtonRelease"
            ></v-btn>
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
          ref="themeToggleBtn"
          :prepend-icon="theme === 'light' ? 'mdi-weather-sunny' : 'mdi-weather-night'"
          :text="$vuetify.display.smAndUp ? 'Toggle Theme' : ''"
          slim
          @click="handleThemeChange"
          @mouseenter="onButtonHover"
          @mouseleave="onButtonLeave"
          @mousedown="onButtonPress"
          @mouseup="onButtonRelease"
        ></v-btn>
      </v-app-bar>

      <!-- 响应式导航抽屉 -->
      <v-navigation-drawer
        v-model="showNavigationDrawer"
        :rail="rail && $vuetify.display.mdAndUp"
        :temporary="$vuetify.display.smAndDown"
        :permanent="$vuetify.display.mdAndUp"
        class="elevation-12 hyprland-drawer"
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
              ref="railToggleBtn"
              v-if="$vuetify.display.mdAndUp"
              variant="text"
              icon="mdi-chevron-left"
              @click.stop="rail = !rail"
              @mouseenter="onButtonHover"
              @mouseleave="onButtonLeave"
              @mousedown="onButtonPress"
              @mouseup="onButtonRelease"
            ></v-btn>
            <v-btn
              ref="drawerCloseBtn"
              v-else
              variant="text"
              icon="mdi-close"
              @click.stop="showNavigationDrawer = false"
              @mouseenter="onButtonHover"
              @mouseleave="onButtonLeave"
              @mousedown="onButtonPress"
              @mouseup="onButtonRelease"
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
              prepend-icon="mdi-code-json"
              title="JSON编辑器"
              value="shop"
              to="/index/editor"
              @click="$vuetify.display.smAndDown && (showNavigationDrawer = false)"
            ></v-list-item>

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
                      ref="settingBtn"
                      prepend-icon="mdi-cog"
                      size="small"
                      :block="$vuetify.display.xs"
                      to="/index/setting"
                      @mouseenter="onButtonHover"
                      @mouseleave="onButtonLeave"
                      @mousedown="onButtonPress"
                      @mouseup="onButtonRelease"
                      >setting</v-btn
                    >
                  </v-col>
                  <v-col cols="6">
                    <v-btn
                      ref="signOutBtn"
                      prepend-icon="mdi-logout"
                      color="error"
                      size="small"
                      :block="$vuetify.display.xs"
                      @click="signOut"
                      @mouseenter="onButtonHover"
                      @mouseleave="onButtonLeave"
                      @mousedown="onButtonPress"
                      @mouseup="onButtonRelease"
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
                  ref="optionsMenuBtn"
                  v-bind="props"
                  icon="mdi-dots-horizontal-circle"
                  color="primary"
                  size="large"
                  class="mb-2"
                  @mouseenter="onButtonHover"
                  @mouseleave="onButtonLeave"
                  @mousedown="onButtonPress"
                  @mouseup="onButtonRelease"
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
          <router-view v-slot="{ Component, route }" name="main">
            <transition name="page-transition" mode="out-in">
              <div :key="route.path" class="page-wrapper">
                <component :is="Component" />
              </div>
            </transition>
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
import { ref, toRefs, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useThemeTransition } from '@/utils'
import { useDisplay } from 'vuetify'
import { availableHost } from '@/utils'
import axios from 'axios'
import { computed, onUnmounted } from 'vue'
import { useFloatingOrb } from '@/composables/useFloatingOrb'
import FloatingOrb from '@/views/FloatingActionButton/FloatingOrb.vue'
import { gsap } from 'gsap'

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

// 移除复杂的路由动画状态，改用纯 CSS 实现

// 按钮 refs
const menuToggleBtn = ref(null)
const dashboardBtn = ref(null)
const orderBtn = ref(null)
const agvBtn = ref(null)
const schedulingBtn = ref(null)
const mobileMenuBtn = ref(null)
const railToggleBtn = ref(null)
const drawerCloseBtn = ref(null)
const settingBtn = ref(null)
const signOutBtn = ref(null)
const optionsMenuBtn = ref(null)

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

// 路由动画现在完全由 CSS 处理，无需 JavaScript 函数

// 按钮动画函数
const onButtonHover = (event) => {
  const button = event.currentTarget
  if (!button) return

  // 基础缩放动画
  gsap.to(button, {
    scale: 1.05,
    duration: 0.3,
    ease: 'power2.out',
    transformOrigin: 'center center',
  })

  // 添加发光效果
  gsap.to(button, {
    boxShadow: '0 0 20px rgba(var(--v-theme-primary), 0.4)',
    duration: 0.3,
    ease: 'power2.out',
  })

  // 图标动画 - 根据按钮类型使用不同动画
  const icon = button.querySelector('.v-icon')
  if (icon) {
    const buttonRef = button.getAttribute('ref') || ''

    if (buttonRef === 'themeToggleBtn') {
      // 主题切换按钮：太阳/月亮旋转动画
      gsap.to(icon, {
        rotation: 180,
        scale: 1.2,
        duration: 0.5,
        ease: 'back.out(1.7)',
      })
    } else if (buttonRef === 'menuToggleBtn') {
      // 菜单按钮：脉冲动画
      gsap.to(icon, {
        scale: 1.3,
        duration: 0.3,
        ease: 'power2.out',
        yoyo: true,
        repeat: 1,
      })
    } else if (buttonRef.includes('railToggle') || buttonRef.includes('drawerClose')) {
      // 抽屉控制按钮：左右摆动
      gsap.to(icon, {
        rotation: 15,
        duration: 0.2,
        ease: 'power2.out',
        yoyo: true,
        repeat: 3,
      })
    } else {
      // 其他按钮：标准旋转
      gsap.to(icon, {
        rotation: 360,
        duration: 0.6,
        ease: 'power2.out',
      })
    }
  }

  // 为特定按钮添加额外效果
  const buttonRef = button.getAttribute('ref') || ''
  if (buttonRef === 'signOutBtn') {
    // 登出按钮：红色发光效果
    gsap.to(button, {
      boxShadow: '0 0 20px rgba(244, 67, 54, 0.5)',
      duration: 0.3,
      ease: 'power2.out',
    })
  }
}

const onButtonLeave = (event) => {
  const button = event.currentTarget
  if (!button) return

  gsap.to(button, {
    scale: 1,
    duration: 0.3,
    ease: 'power2.out',
    transformOrigin: 'center center',
  })

  // 移除发光效果
  gsap.to(button, {
    boxShadow: 'none',
    duration: 0.3,
    ease: 'power2.out',
  })

  // 重置图标动画
  const icon = button.querySelector('.v-icon')
  if (icon) {
    const buttonRef = button.getAttribute('ref') || ''

    if (buttonRef === 'themeToggleBtn') {
      // 主题切换按钮：重置旋转和缩放
      gsap.to(icon, {
        rotation: 0,
        scale: 1,
        duration: 0.4,
        ease: 'power2.out',
      })
    } else {
      // 其他按钮：标准重置
      gsap.to(icon, {
        rotation: 0,
        scale: 1,
        duration: 0.3,
        ease: 'power2.out',
      })
    }
  }
}

const onButtonPress = (event) => {
  const button = event.currentTarget
  if (!button) return

  // 按下时的缩放动画
  gsap.to(button, {
    scale: 0.95,
    duration: 0.1,
    ease: 'power2.out',
    transformOrigin: 'center center',
  })

  // 添加涟漪效果
  createRippleEffect(button, event)

  // 为特定按钮添加特殊按下效果
  const buttonRef = button.getAttribute('ref') || ''
  if (buttonRef === 'themeToggleBtn') {
    // 主题切换按钮：快速闪烁效果
    gsap.to(button, {
      opacity: 0.7,
      duration: 0.1,
      yoyo: true,
      repeat: 1,
      ease: 'power2.inOut',
    })
  }
}

const onButtonRelease = (event) => {
  const button = event.currentTarget
  if (!button) return

  // 释放时恢复到悬停状态
  gsap.to(button, {
    scale: 1.05,
    duration: 0.2,
    ease: 'back.out(1.7)',
    transformOrigin: 'center center',
  })

  // 添加成功反馈动画
  const buttonRef = button.getAttribute('ref') || ''
  if (buttonRef === 'signOutBtn') {
    // 登出按钮：震动效果
    gsap.to(button, {
      x: -2,
      duration: 0.1,
      yoyo: true,
      repeat: 3,
      ease: 'power2.inOut',
    })
  } else if (buttonRef.includes('setting')) {
    // 设置按钮：齿轮旋转效果
    const icon = button.querySelector('.v-icon')
    if (icon) {
      gsap.to(icon, {
        rotation: 180,
        duration: 0.4,
        ease: 'power2.out',
      })
    }
  }
}

// 创建涟漪效果
const createRippleEffect = (button, event) => {
  const rect = button.getBoundingClientRect()
  const size = Math.max(rect.width, rect.height) * 2
  const x = event.clientX - rect.left - size / 2
  const y = event.clientY - rect.top - size / 2

  // 创建主涟漪
  const ripple = document.createElement('div')
  ripple.style.cssText = `
    position: absolute;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(var(--v-theme-primary), 0.4) 0%, rgba(var(--v-theme-primary), 0.1) 70%, transparent 100%);
    width: ${size}px;
    height: ${size}px;
    left: ${x}px;
    top: ${y}px;
    pointer-events: none;
    transform: scale(0);
    z-index: 1000;
  `

  // 创建第二层涟漪效果
  const ripple2 = document.createElement('div')
  ripple2.style.cssText = `
    position: absolute;
    border-radius: 50%;
    background: rgba(var(--v-theme-primary), 0.2);
    width: ${size * 0.6}px;
    height: ${size * 0.6}px;
    left: ${x + size * 0.2}px;
    top: ${y + size * 0.2}px;
    pointer-events: none;
    transform: scale(0);
    z-index: 1001;
  `

  button.style.position = 'relative'
  button.style.overflow = 'hidden'
  button.appendChild(ripple)
  button.appendChild(ripple2)

  // 主涟漪动画
  gsap.to(ripple, {
    scale: 1,
    opacity: 0,
    duration: 0.8,
    ease: 'power2.out',
    onComplete: () => {
      if (ripple.parentNode) {
        ripple.parentNode.removeChild(ripple)
      }
    },
  })

  // 第二层涟漪动画
  gsap.to(ripple2, {
    scale: 1.5,
    opacity: 0,
    duration: 0.6,
    delay: 0.1,
    ease: 'power2.out',
    onComplete: () => {
      if (ripple2.parentNode) {
        ripple2.parentNode.removeChild(ripple2)
      }
    },
  })
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

// 初始化按钮动画
const initButtonAnimations = () => {
  nextTick(() => {
    // 获取所有按钮元素
    const buttons = [
      menuToggleBtn.value,
      dashboardBtn.value,
      orderBtn.value,
      agvBtn.value,
      schedulingBtn.value,
      mobileMenuBtn.value,
      themeToggleBtn.value,
      railToggleBtn.value,
      drawerCloseBtn.value,
      settingBtn.value,
      signOutBtn.value,
      optionsMenuBtn.value,
    ].filter(Boolean)

    // 为每个按钮设置初始状态并添加入场动画
    buttons.forEach((button, index) => {
      if (button) {
        // 设置初始状态
        gsap.set(button, {
          scale: 0.8,
          opacity: 0,
          y: 20,
        })

        // 入场动画
        gsap.to(button, {
          scale: 1,
          opacity: 1,
          y: 0,
          duration: 0.6,
          delay: index * 0.1,
          ease: 'back.out(1.7)',
          onComplete: () => {
            // 添加轻微的浮动动画
            gsap.to(button, {
              y: -2,
              duration: 2,
              repeat: -1,
              yoyo: true,
              ease: 'power2.inOut',
              delay: Math.random() * 2,
            })
          },
        })
      }
    })
  })
}

onMounted(() => {
  // 初始化悬浮球
  initializeFloatingOrb()

  // 初始化按钮动画
  initButtonAnimations()

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
  top: 64px !important;
  height: calc(100vh - 64px) !important;
  overflow-y: auto;
  z-index: 99;

  /* Hyprland 风格的丝滑动画 */
  transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
  transform-origin: left center;

  /* 添加硬件加速 */
  will-change: transform, width;
  backface-visibility: hidden;

  /* 抽屉阴影效果 */
  box-shadow:
    0 0 0 1px rgba(var(--v-theme-surface-variant), 0.12),
    0 2px 8px rgba(0, 0, 0, 0.04),
    0 8px 24px rgba(0, 0, 0, 0.08),
    0 16px 32px rgba(0, 0, 0, 0.04);

  /* 毛玻璃效果 */
  backdrop-filter: blur(20px) saturate(1.2);
  background: rgba(var(--v-theme-surface), 0.95);
}

/* 抽屉展开/收缩时的平滑过渡 */
.fixed-drawer.v-navigation-drawer--rail {
  /* Rail 模式的特殊动画 */
  transition: all 0.5s cubic-bezier(0.25, 0.8, 0.25, 1);

  /* 收缩时的变换 */
  transform: translateX(0) scale(1);

  /* 收缩状态的阴影调整 */
  box-shadow:
    0 0 0 1px rgba(var(--v-theme-surface-variant), 0.08),
    0 1px 4px rgba(0, 0, 0, 0.02),
    0 4px 12px rgba(0, 0, 0, 0.04);
}

.main-content {
  padding-top: 64px !important;
  height: 100vh;
  overflow: hidden;

  /* 主内容区域的丝滑过渡 */
  transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
  will-change: margin-left, transform;

  /* 当抽屉状态改变时，主内容区域的响应 */
  transform: translateZ(0); /* 启用硬件加速 */
}

.scrollable-content {
  height: 100%;
  overflow-y: auto;
  padding: 16px;

  /* 内容区域的丝滑滚动 */
  scroll-behavior: smooth;

  /* 自定义滚动条样式 */
  &::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(var(--v-theme-surface-variant), 0.1);
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(var(--v-theme-primary), 0.3);
    border-radius: 4px;
    transition: all 0.3s ease;

    &:hover {
      background: rgba(var(--v-theme-primary), 0.5);
    }
  }

  &::-webkit-scrollbar-corner {
    background: transparent;
  }
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

/* 保持原有布局，只增强动画效果 */
.layout-wrapper {
  /* 保持原有的相对定位布局 */
  position: relative;
  height: 100vh;
  overflow: hidden;

  /* 添加微妙的背景纹理 */
  background:
    radial-gradient(circle at 20% 80%, rgba(var(--v-theme-primary), 0.01) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(var(--v-theme-secondary), 0.01) 0%, transparent 50%),
    linear-gradient(
      135deg,
      rgba(var(--v-theme-surface), 1) 0%,
      rgba(var(--v-theme-surface-variant), 0.02) 100%
    );

  /* 窗口级别的过渡 */
  transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
}

/* App Bar 的 Hyprland 风格增强 */
.v-app-bar {
  /* 动态边框效果 */
  border-bottom: 1px solid rgba(var(--v-theme-outline), 0.12);

  /* 背景模糊和透明度 */
  backdrop-filter: blur(24px) saturate(1.8);
  background: rgba(var(--v-theme-surface), 0.85) !important;

  /* 微妙的阴影层次 */
  box-shadow:
    0 1px 0 rgba(var(--v-theme-outline), 0.08),
    0 2px 8px rgba(0, 0, 0, 0.04),
    0 4px 16px rgba(0, 0, 0, 0.02);

  /* 悬停时的微妙变化 */
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);

  &:hover {
    backdrop-filter: blur(28px) saturate(2);
    box-shadow:
      0 1px 0 rgba(var(--v-theme-outline), 0.12),
      0 4px 12px rgba(0, 0, 0, 0.06),
      0 8px 24px rgba(0, 0, 0, 0.04);
  }
}

/* 导航抽屉的增强动画 */
.v-navigation-drawer {
  /* Hyprland 风格的窗口边框 */
  border-right: 1px solid rgba(var(--v-theme-outline), 0.12);

  /* 抽屉内容的动画 */
  .v-list-item {
    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    border-radius: 8px;
    margin: 2px 8px;

    &:hover {
      transform: translateX(4px);
      background: rgba(var(--v-theme-primary), 0.08);
      box-shadow: 0 2px 8px rgba(var(--v-theme-primary), 0.16);
    }

    &.v-list-item--active {
      background: rgba(var(--v-theme-primary), 0.12);
      transform: translateX(2px);

      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 3px;
        height: 24px;
        background: rgb(var(--v-theme-primary));
        border-radius: 0 2px 2px 0;
      }
    }
  }

  /* 抽屉标题的动画 */
  .v-list-subheader {
    transition: all 0.3s ease;
    opacity: 1;
    transform: translateX(0);
  }

  /* Rail 模式下隐藏文本 */
  &.v-navigation-drawer--rail {
    .v-list-subheader {
      opacity: 0;
      transform: translateX(-20px);
    }

    .v-list-item-title {
      opacity: 0;
      transform: translateX(-20px);
      transition: all 0.3s ease;
    }

    .v-list-item-subtitle {
      opacity: 0;
      transform: translateX(-20px);
      transition: all 0.3s ease;
    }
  }
}

/* 移动设备样式调整 */
@media (max-width: 600px) {
  .scrollable-content {
    padding: 8px;
  }
}

/* 内容淡入动画 */
@keyframes contentFadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Hyprland 风格的抽屉增强 */
.hyprland-drawer {
  /* 高级视觉效果 */
  backdrop-filter: blur(20px) saturate(1.2);
  background: rgba(var(--v-theme-surface), 0.95) !important;

  /* 边框和阴影 */
  border: 1px solid rgba(var(--v-theme-outline), 0.12);
  box-shadow:
    0 0 0 1px rgba(var(--v-theme-surface-variant), 0.12),
    0 4px 16px rgba(0, 0, 0, 0.08),
    0 8px 32px rgba(0, 0, 0, 0.04);
}

/* 抽屉内容的分层动画 */
.hyprland-drawer .v-list-item {
  /* 基础过渡 */
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  position: relative;
  overflow: hidden;

  /* 悬停时的 Hyprland 风格效果 */
  &:hover {
    transform: translateX(6px) scale(1.02);
    background: linear-gradient(
      90deg,
      rgba(var(--v-theme-primary), 0.08) 0%,
      rgba(var(--v-theme-primary), 0.04) 100%
    );

    /* 添加微妙的发光效果 */
    box-shadow:
      0 2px 8px rgba(var(--v-theme-primary), 0.16),
      inset 0 1px 0 rgba(var(--v-theme-primary), 0.2);

    /* 图标动画 */
    .v-icon {
      transform: scale(1.1) rotate(5deg);
      color: rgb(var(--v-theme-primary));
    }
  }

  /* 激活状态的增强效果 */
  &.v-list-item--active {
    background: linear-gradient(
      90deg,
      rgba(var(--v-theme-primary), 0.12) 0%,
      rgba(var(--v-theme-primary), 0.06) 100%
    );
    transform: translateX(4px);

    /* 左侧指示器 */
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 4px;
      height: 32px;
      background: linear-gradient(
        180deg,
        rgb(var(--v-theme-primary)) 0%,
        rgba(var(--v-theme-primary), 0.8) 100%
      );
      border-radius: 0 4px 4px 0;
      box-shadow: 0 0 8px rgba(var(--v-theme-primary), 0.4);
    }

    /* 激活状态的图标效果 */
    .v-icon {
      color: rgb(var(--v-theme-primary));
      filter: drop-shadow(0 0 4px rgba(var(--v-theme-primary), 0.4));
    }
  }

  /* 点击时的反馈动画 */
  &:active {
    transform: translateX(2px) scale(0.98);
    transition: all 0.1s ease;
  }
}

/* 路由容器样式 */
.page-wrapper {
  /* 确保路由容器占满可用空间 */
  width: 100%;
  min-height: 100%;

  transform: translateZ(0);
  backface-visibility: hidden;
}

/* 令人惊艳的页面切换动画 */
.page-transition-enter-active {
  transition: all 0.8s cubic-bezier(0.23, 1, 0.32, 1);
}

.page-transition-leave-active {
  transition: all 0.5s cubic-bezier(0.55, 0, 0.1, 1);
}

.page-transition-enter-from {
  opacity: 0;
  transform: translateY(30px) scale(0.95) rotateX(-5deg);
  filter: blur(8px);
}

.page-transition-leave-to {
  opacity: 0;
  transform: translateY(-20px) scale(0.98) rotateX(3deg);
  filter: blur(4px);
}

/* 页面内容的交错动画 */
.page-wrapper .v-card,
.page-wrapper .v-sheet:not(.v-navigation-drawer .v-sheet),
.page-wrapper .v-container > .v-row,
.page-wrapper .v-list:not(.v-navigation-drawer .v-list) {
  animation: pageContentFadeIn 0.8s cubic-bezier(0.23, 1, 0.32, 1) forwards;
  opacity: 0;
  transform: translateY(20px);
}

/* 为不同元素设置不同的延迟 */
.page-wrapper .v-card:nth-child(1) {
  animation-delay: 0.1s;
}
.page-wrapper .v-card:nth-child(2) {
  animation-delay: 0.2s;
}
.page-wrapper .v-card:nth-child(3) {
  animation-delay: 0.3s;
}
.page-wrapper .v-card:nth-child(4) {
  animation-delay: 0.4s;
}

.page-wrapper .v-sheet:nth-child(1) {
  animation-delay: 0.15s;
}
.page-wrapper .v-sheet:nth-child(2) {
  animation-delay: 0.25s;
}
.page-wrapper .v-sheet:nth-child(3) {
  animation-delay: 0.35s;
}

.page-wrapper .v-row:nth-child(1) {
  animation-delay: 0.1s;
}
.page-wrapper .v-row:nth-child(2) {
  animation-delay: 0.2s;
}
.page-wrapper .v-row:nth-child(3) {
  animation-delay: 0.3s;
}

/* 页面内容淡入动画 */
@keyframes pageContentFadeIn {
  0% {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  50% {
    opacity: 0.7;
    transform: translateY(5px) scale(0.98);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* 特殊元素的增强动画 */
.page-wrapper .v-btn {
  animation: buttonSlideIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  opacity: 0;
  transform: translateX(-20px);
  animation-delay: 0.4s;
}

@keyframes buttonSlideIn {
  0% {
    opacity: 0;
    transform: translateX(-20px) scale(0.9);
  }
  100% {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
}

/* 表单元素的特殊动画 */
.page-wrapper .v-text-field,
.page-wrapper .v-select,
.page-wrapper .v-textarea {
  animation: formFieldRise 0.7s cubic-bezier(0.25, 0.8, 0.25, 1) forwards;
  opacity: 0;
  transform: translateY(15px);
}

.page-wrapper .v-text-field:nth-child(1) {
  animation-delay: 0.2s;
}
.page-wrapper .v-text-field:nth-child(2) {
  animation-delay: 0.3s;
}
.page-wrapper .v-text-field:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes formFieldRise {
  0% {
    opacity: 0;
    transform: translateY(15px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 主内容区域的微妙动画增强 */
.main-content .scrollable-content {
  /* 为路由容器提供基础样式 */
  position: relative;

  /* 确保滚动在动画期间正常工作 */
  overflow-y: auto;
  overflow-x: hidden;
}

/* 响应式动画优化 */
@media (prefers-reduced-motion: reduce) {
  .page-wrapper,
  .page-transition-enter-active,
  .page-transition-leave-active {
    /* 为偏好减少动画的用户禁用页面动画 */
    animation: none !important;
    transition: none !important;
  }
}

/* 高性能设备的增强动画 */
@media (min-width: 1024px) and (min-height: 768px) {
  .page-wrapper {
    /* 在大屏设备上启用更丰富的动画效果 */
    perspective: 1000px;
  }

  .page-wrapper > * {
    /* 为大屏设备提供更好的 3D 动画支持 */
    transform-style: preserve-3d;
  }
}

/* 移动设备优化 */
@media (max-width: 768px) {
  .page-wrapper {
    /* 移动设备上简化动画以提高性能 */
    perspective: none;
  }

  .page-transition-enter-active {
    /* 移动设备上缩短动画时间 */
    transition: all 0.6s cubic-bezier(0.23, 1, 0.32, 1);
  }

  .page-transition-leave-active {
    /* 移动设备上更快的离开动画 */
    transition: all 0.3s cubic-bezier(0.55, 0, 0.1, 1);
  }

  .page-transition-enter-from {
    /* 移动设备上简化的进入效果 */
    transform: translateY(20px) scale(0.98);
    filter: blur(4px);
  }

  .page-transition-leave-to {
    /* 移动设备上简化的离开效果 */
    transform: translateY(-10px) scale(0.99);
    filter: blur(2px);
  }

  /* 移动设备上减少子元素动画延迟 */
  .page-wrapper .v-card,
  .page-wrapper .v-sheet,
  .page-wrapper .v-row {
    animation-duration: 0.6s;
  }

  .page-wrapper .v-card:nth-child(n) {
    animation-delay: 0.05s;
  }
  .page-wrapper .v-sheet:nth-child(n) {
    animation-delay: 0.08s;
  }
  .page-wrapper .v-row:nth-child(n) {
    animation-delay: 0.05s;
  }
}

/* App Bar 的 Hyprland 风格增强 */
.v-app-bar {
  /* 动态边框效果 */
  border-bottom: 1px solid rgba(var(--v-theme-outline), 0.12);

  /* 背景模糊和透明度 */
  backdrop-filter: blur(24px) saturate(1.8);
  background: rgba(var(--v-theme-surface), 0.85) !important;

  /* 微妙的阴影层次 */
  box-shadow:
    0 1px 0 rgba(var(--v-theme-outline), 0.08),
    0 2px 8px rgba(0, 0, 0, 0.04),
    0 4px 16px rgba(0, 0, 0, 0.02);

  /* 悬停时的微妙变化 */
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);

  &:hover {
    backdrop-filter: blur(28px) saturate(2);
    box-shadow:
      0 1px 0 rgba(var(--v-theme-outline), 0.12),
      0 4px 12px rgba(0, 0, 0, 0.06),
      0 8px 24px rgba(0, 0, 0, 0.04);
  }
}

/* 抽屉和主内容之间的分隔线动画 */
.hyprland-drawer::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 1px;
  height: 100%;
  background: linear-gradient(
    180deg,
    transparent 0%,
    rgba(var(--v-theme-outline), 0.12) 10%,
    rgba(var(--v-theme-outline), 0.12) 90%,
    transparent 100%
  );
  transition: all 0.3s ease;
}

.hyprland-drawer:hover::after {
  background: linear-gradient(
    180deg,
    transparent 0%,
    rgba(var(--v-theme-primary), 0.2) 10%,
    rgba(var(--v-theme-primary), 0.2) 90%,
    transparent 100%
  );
  box-shadow: 0 0 8px rgba(var(--v-theme-primary), 0.1);
}

/* 抽屉内容的分组动画 */
.hyprland-drawer .v-list-subheader {
  /* 标题的动画效果 */
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  position: relative;

  /* 添加微妙的下划线效果 */
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 16px;
    right: 16px;
    height: 1px;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(var(--v-theme-primary), 0.2) 50%,
      transparent 100%
    );
    transform: scaleX(0);
    transition: transform 0.3s ease;
  }

  &:hover::after {
    transform: scaleX(1);
  }
}

/* Rail 模式下的特殊效果 */
.hyprland-drawer.drawer-rail {
  /* 收缩时的特殊视觉效果 */
  .v-list-item {
    justify-content: center;

    .v-icon {
      transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    }

    &:hover .v-icon {
      transform: scale(1.2) rotate(10deg);
      filter: drop-shadow(0 0 8px rgba(var(--v-theme-primary), 0.4));
    }
  }

  /* Rail 模式的工具提示效果 */
  .v-list-item:hover {
    position: relative;

    &::before {
      content: attr(title);
      position: absolute;
      left: 100%;
      top: 50%;
      transform: translateY(-50%);
      margin-left: 12px;
      padding: 8px 12px;
      background: rgba(var(--v-theme-surface), 0.95);
      border: 1px solid rgba(var(--v-theme-outline), 0.12);
      border-radius: 8px;
      font-size: 12px;
      white-space: nowrap;
      z-index: 1000;
      opacity: 0;
      animation: tooltipFadeIn 0.3s ease forwards;
      backdrop-filter: blur(12px);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    }
  }
}

/* 工具提示淡入动画 */
@keyframes tooltipFadeIn {
  0% {
    opacity: 0;
    transform: translateY(-50%) translateX(-10px);
  }
  100% {
    opacity: 1;
    transform: translateY(-50%) translateX(0);
  }
}

/* 响应式动画优化 */
@media (prefers-reduced-motion: reduce) {
  .hyprland-drawer,
  .hyprland-main,
  .layout-wrapper,
  .v-app-bar {
    animation: none !important;
    transition: none !important;
  }
}

/* 高对比度模式支持 */
@media (prefers-contrast: high) {
  .hyprland-drawer {
    border: 2px solid rgb(var(--v-theme-outline));
    backdrop-filter: none;
    background: rgb(var(--v-theme-surface)) !important;
  }

  .v-app-bar {
    border-bottom: 2px solid rgb(var(--v-theme-outline));
    backdrop-filter: none;
    background: rgb(var(--v-theme-surface)) !important;
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
  position: relative;
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

/* 按钮动画增强样式 */
.v-btn {
  position: relative;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);

  /* 为按钮添加基础的3D效果 */
  transform-style: preserve-3d;

  &:hover {
    /* 悬停时的基础样式，GSAP会覆盖这些 */
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  &:active {
    /* 点击时的基础样式，GSAP会覆盖这些 */
    transform: translateY(0);
  }

  /* 图标动画增强 */
  .v-icon {
    transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    transform-origin: center;
  }

  /* 为outlined按钮添加特殊效果 */
  &.v-btn--variant-outlined {
    border: 2px solid;
    background: linear-gradient(
      45deg,
      transparent 30%,
      rgba(var(--v-theme-primary), 0.1) 50%,
      transparent 70%
    );
    background-size: 200% 200%;
    background-position: 100% 0;

    &:hover {
      background-position: 0 100%;
      border-color: rgb(var(--v-theme-primary));
    }
  }

  /* 为图标按钮添加特殊的脉冲效果 */
  &.v-btn--icon {
    &::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 0;
      height: 0;
      border-radius: 50%;
      background: rgba(var(--v-theme-primary), 0.2);
      transform: translate(-50%, -50%);
      transition: all 0.3s ease;
      z-index: -1;
    }

    &:hover::before {
      width: 100%;
      height: 100%;
    }
  }
}

/* App Bar 按钮特殊样式 */
.v-app-bar .v-btn {
  backdrop-filter: blur(10px);

  &:hover {
    background: rgba(var(--v-theme-primary), 0.1);
  }
}

/* 导航抽屉按钮特殊样式 */
.v-navigation-drawer .v-btn {
  &:hover {
    background: rgba(var(--v-theme-primary), 0.08);
    transform: translateX(4px);
  }
}

/* 主题切换按钮特殊动画 */
.v-btn[ref='themeToggleBtn'] {
  .v-icon {
    filter: drop-shadow(0 0 8px rgba(var(--v-theme-primary), 0.6));
  }

  &:hover .v-icon {
    filter: drop-shadow(0 0 12px rgba(var(--v-theme-primary), 0.8));
  }
}

/* 关键帧动画定义 */
@keyframes buttonPulse {
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(var(--v-theme-primary), 0.4);
  }
  50% {
    transform: scale(1.02);
    box-shadow: 0 0 0 8px rgba(var(--v-theme-primary), 0.1);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(var(--v-theme-primary), 0);
  }
}

@keyframes iconSpin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes buttonShake {
  0%,
  100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-2px);
  }
  75% {
    transform: translateX(2px);
  }
}

@keyframes buttonGlow {
  0%,
  100% {
    box-shadow: 0 0 5px rgba(var(--v-theme-primary), 0.3);
  }
  50% {
    box-shadow: 0 0 20px rgba(var(--v-theme-primary), 0.6);
  }
}

/* 特殊按钮动画类 */
.btn-pulse {
  animation: buttonPulse 2s infinite;
}

.btn-glow {
  animation: buttonGlow 2s ease-in-out infinite;
}

.btn-shake {
  animation: buttonShake 0.5s ease-in-out;
}

/* 登出按钮特殊样式 */
.v-btn[ref='signOutBtn'] {
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      45deg,
      transparent 30%,
      rgba(244, 67, 54, 0.1) 50%,
      transparent 70%
    );
    opacity: 0;
    transition: opacity 0.3s ease;
    border-radius: inherit;
  }

  &:hover::before {
    opacity: 1;
  }
}

/* 设置按钮特殊样式 */
.v-btn[ref='settingBtn'] {
  .v-icon {
    transition: transform 0.3s ease;
  }

  &:hover .v-icon {
    transform: rotate(90deg);
  }
}

/* 菜单切换按钮特殊样式 */
.v-btn[ref='menuToggleBtn'] {
  &:hover {
    animation: buttonPulse 1s ease-in-out;
  }
}

/* 抽屉控制按钮样式 */
.v-btn[ref='railToggleBtn'],
.v-btn[ref='drawerCloseBtn'] {
  .v-icon {
    transition: transform 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  }

  &:hover .v-icon {
    transform: scale(1.2) rotate(180deg);
  }
}

/* 响应式动画优化 */
@media (prefers-reduced-motion: reduce) {
  .v-btn,
  .v-btn .v-icon {
    animation: none !important;
    transition: none !important;
  }
}

/* 触摸设备优化 */
@media (hover: none) and (pointer: coarse) {
  .v-btn {
    &:hover {
      transform: none;
      box-shadow: none;
    }

    &:active {
      transform: scale(0.98);
      transition: transform 0.1s ease;
    }
  }
}
</style>
