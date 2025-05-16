<template>
  <v-container fluid class="command-line-system pa-0 ma-0" style="max-width: 100%">
    <!-- 顶部固定命令输入区域 -->
    <div class="command-input-section">
      <v-card
        class="command-card mb-2"
        :elevation="2"
        :border="true"
        :class="{ 'dark-card': isDarkMode }"
      >
        <v-card-item>
          <template v-slot:prepend>
            <v-icon icon="mdi-console-line" size="large" :color="primaryColor"></v-icon>
          </template>
          <v-card-title class="text-h5 font-weight-medium">命令行系统</v-card-title>
        </v-card-item>

        <v-card-text class="pt-0">
          <v-slide-y-transition>
            <v-text-field
              v-model="command"
              label="输入命令（例如：find a => a.order_id < 100）"
              @keyup.enter="executeCommand"
              clearable
              variant="outlined"
              placeholder="输入命令后按回车执行"
              :bg-color="isDarkMode ? 'grey-darken-3' : 'grey-lighten-4'"
              density="comfortable"
              hide-details="auto"
              :loading="loading"
              class="command-input"
            >
              <template v-slot:prepend-inner>
                <v-icon icon="mdi-code-greater-than" :color="secondaryColor"></v-icon>
              </template>
              <template v-slot:append>
                <v-fade-transition>
                  <v-btn
                    variant="tonal"
                    color="primary"
                    @click="executeCommand"
                    density="comfortable"
                    :loading="loading"
                    :disabled="!command.trim()"
                    class="ml-2 execute-btn"
                  >
                    执行
                    <template v-slot:append>
                      <v-icon end icon="mdi-send" size="small"></v-icon>
                    </template>
                  </v-btn>
                </v-fade-transition>
              </template>
            </v-text-field>
          </v-slide-y-transition>

          <v-expand-transition>
            <div v-if="commandHistory.length > 0" class="command-history mt-1">
              <div class="d-flex align-center">
                <v-icon
                  icon="mdi-history"
                  size="small"
                  class="mr-2"
                  :color="secondaryColor"
                ></v-icon>
                <span class="text-caption font-weight-medium">历史命令</span>
              </div>
              <v-chip-group>
                <v-chip
                  v-for="(cmd, i) in commandHistory.slice(-5)"
                  :key="i"
                  size="small"
                  variant="tonal"
                  :color="secondaryColor"
                  @click="command = cmd"
                  class="history-chip"
                >
                  {{ cmd }}
                </v-chip>
              </v-chip-group>
            </div>
          </v-expand-transition>
        </v-card-text>
      </v-card>
    </div>

    <!-- 结果表格区域 -->
    <v-card class="results-card" :elevation="2" :border="true" :class="{ 'dark-card': isDarkMode }">
      <v-card-item>
        <template v-slot:prepend>
          <v-icon icon="mdi-table" :color="primaryColor"></v-icon>
        </template>
        <v-card-title>结果</v-card-title>
        <template v-slot:append>
          <div class="d-flex align-center">
            <v-chip :color="primaryColor" variant="tonal" size="small" class="mr-2">
              {{ show_list.length }} 条记录
            </v-chip>
            <v-menu>
              <template v-slot:activator="{ props }">
                <v-btn
                  icon="mdi-dots-vertical"
                  variant="text"
                  density="comfortable"
                  v-bind="props"
                  :color="secondaryColor"
                ></v-btn>
              </template>
              <v-list density="compact">
                <v-list-item @click="downloadResults">
                  <template v-slot:prepend>
                    <v-icon icon="mdi-download"></v-icon>
                  </template>
                  <v-list-item-title>导出结果</v-list-item-title>
                </v-list-item>
                <v-list-item @click="clearResults">
                  <template v-slot:prepend>
                    <v-icon icon="mdi-refresh"></v-icon>
                  </template>
                  <v-list-item-title>清空结果</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </div>
        </template>
      </v-card-item>

      <v-card-text class="pa-0">
        <div class="table-container">
          <!-- 固定头部区域 -->
          <div class="header-fixed" :class="{ 'header-fixed-dark': isDarkMode }">
            <ul class="responsive-table" v-if="!$vuetify.display.smAndDown">
              <li class="table-header" :class="{ 'table-header-dark': isDarkMode }">
                <div class="col col-1">Order Id</div>
                <div class="col col-2">Product Type</div>
                <div class="col col-3">Order Quantity</div>
                <div class="col col-4">Order Date</div>
                <div class="col col-5">Priority</div>
              </li>
            </ul>
          </div>

          <!-- 可滚动内容 -->
          <div class="scroll-body" ref="scrollBody">
            <v-fade-transition>
              <div v-if="show_list.length === 0" class="empty-state">
                <v-icon
                  icon="mdi-database-search"
                  size="64"
                  :color="secondaryColor"
                  class="mb-3"
                ></v-icon>
                <div class="text-subtitle-1">暂无数据</div>
                <div class="text-caption">输入命令查询数据</div>
              </div>
            </v-fade-transition>

            <ul class="responsive-table" v-if="show_list.length > 0">
              <transition-group name="list">
                <li
                  class="table-row"
                  v-for="order in show_list"
                  :key="order.order_id"
                  :class="{ 'table-row-dark': isDarkMode }"
                >
                  <div class="col col-1" data-label="Order Id">{{ order['order_id'] }}</div>
                  <div class="col col-2" data-label="Product Type">{{ order.product_type }}</div>
                  <div class="col col-3" data-label="Order Quantity">
                    {{ order.order_quantity }}
                  </div>
                  <div class="col col-4" data-label="Order Date">{{ order.order_date }}</div>
                  <div class="col col-5" data-label="Priority">
                    <v-chip
                      :color="getPriorityColor(order.priority)"
                      size="small"
                      class="priority-chip"
                      variant="tonal"
                    >
                      {{ getPriorityLabel(order.priority) }}
                    </v-chip>
                  </div>
                </li>
              </transition-group>
            </ul>
          </div>
        </div>
      </v-card-text>
    </v-card>

    <!-- 返回顶部按钮 -->
    <v-fade-transition>
      <v-btn
        v-show="showScrollTop"
        fab
        fixed
        right
        bottom
        color="primary"
        variant="tonal"
        size="small"
        class="scroll-top-btn"
        @click="scrollToTop"
        icon="mdi-arrow-up"
      ></v-btn>
    </v-fade-transition>

    <!-- 提示消息 -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="snackbar.timeout"
      location="top"
      :rounded="true"
      class="custom-snackbar"
    >
      <div class="d-flex align-center">
        <v-icon :icon="snackbar.icon" class="mr-2"></v-icon>
        {{ snackbar.text }}
      </div>
      <template v-slot:actions>
        <v-btn variant="text" @click="snackbar.show = false" icon="mdi-close"></v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useOrder } from '@/stores'
import { useThemeStore } from '@/stores'
import { storeToRefs } from 'pinia'

const themeStore = useThemeStore()
const orderStore = useOrder()
const { show_list } = storeToRefs(orderStore)
const { handle_command } = orderStore
const command = ref('')
const loading = ref(false)
const commandHistory = ref([])
const scrollBody = ref(null)
const showScrollTop = ref(false)

// 主题控制 - 使用自定义ThemeStore
const isDarkMode = computed(() => themeStore.theme === 'dark')
const primaryColor = computed(() => (isDarkMode.value ? 'primary' : 'primary'))
const secondaryColor = computed(() => (isDarkMode.value ? 'secondary' : 'secondary'))

// 初始化主题
onMounted(() => {
  //   const savedTheme = localStorage.getItem('theme')
  //   if (savedTheme) {
  //     // 确保主题值与store中的值保持一致
  //     if (savedTheme !== themeStore.theme) {
  //       themeStore.theme = savedTheme
  //     }
  //   } else {
  //     // 如果没有保存的主题，将当前主题保存到localStorage
  //     localStorage.setItem('theme', themeStore.theme)
  //   }

  // 监听滚动事件
  if (scrollBody.value) {
    scrollBody.value.addEventListener('scroll', handleScroll)
  }

  // 添加进入动画效果
  setTimeout(() => {
    const tableHeader = document.querySelector('.table-header')
    if (tableHeader) {
      tableHeader.classList.add('animate-in')
    }
  }, 100)
})

// 处理滚动事件
function handleScroll() {
  if (scrollBody.value) {
    showScrollTop.value = scrollBody.value.scrollTop > 300
  }
}

// 返回顶部
function scrollToTop() {
  if (scrollBody.value) {
    scrollBody.value.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }
}

// 根据优先级返回颜色
function getPriorityColor(priority) {
  // 检查是否为数字或可以转换为数字
  const numPriority = Number(priority)

  if (!isNaN(numPriority)) {
    // 如果是数字1-10，根据数值范围返回不同颜色
    if (numPriority >= 1 && numPriority <= 3) {
      return 'success' // 低优先级 (1-3)
    } else if (numPriority >= 4 && numPriority <= 7) {
      return 'warning' // 中优先级 (4-7)
    } else if (numPriority >= 8 && numPriority <= 10) {
      return 'error' // 高优先级 (8-10)
    }
  }

  // 默认颜色或无效数值
  return 'grey'
}

// 导出结果
function downloadResults() {
  try {
    if (show_list.value.length === 0) {
      showSnackbar('没有可导出的数据', 'warning', 'mdi-alert-circle')
      return
    }

    const headers = ['order_id', 'product_type', 'order_quantity', 'order_date', 'priority']
    const csvContent = [
      headers.join(','),
      ...show_list.value.map((item) => headers.map((header) => item[header]).join(',')),
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)

    link.setAttribute('href', url)
    link.setAttribute('download', `orders_export_${new Date().toISOString().slice(0, 10)}.csv`)
    link.style.visibility = 'hidden'

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    showSnackbar('数据导出成功', 'success', 'mdi-check-circle')
  } catch (error) {
    showSnackbar('导出失败：' + error.message, 'error', 'mdi-alert')
  }
}

// 清空结果
function clearResults() {
  orderStore.reset_list()
  showSnackbar('结果已清空', 'info', 'mdi-refresh')
}

// 状态条对象
const snackbar = ref({
  show: false,
  text: '',
  color: 'success',
  timeout: 3000,
  icon: 'mdi-check-circle',
})

function showSnackbar(text, color, icon) {
  snackbar.value = {
    show: true,
    text: text,
    color: color,
    timeout: 3000,
    icon: icon,
  }
}

function parseCommand() {
  const cmdText = command.value.trim()
  if (!cmdText) return []

  let temp_list = cmdText.split('|')
  let command_list = []
  for (let subcommand of temp_list) {
    command_list.push(subcommand.split(' '))
  }

  // 添加到历史记录
  if (cmdText && !commandHistory.value.includes(cmdText)) {
    commandHistory.value.push(cmdText)
    if (commandHistory.value.length > 10) {
      commandHistory.value.shift()
    }
  }

  return command_list
}

// 执行命令
function executeCommand() {
  if (!command.value.trim()) return

  loading.value = true
  const cmdList = parseCommand()

  // 模拟异步操作
  setTimeout(() => {
    handle_command(cmdList, showSnackbar)
    loading.value = false
    command.value = ''

    // 滚动到结果表格顶部
    setTimeout(() => {
      if (scrollBody.value) {
        scrollBody.value.scrollTo({
          top: 0,
          behavior: 'smooth',
        })
      }
    }, 100)
  }, 300)
}

// 添加命令执行动画
watch(loading, (newVal) => {
  if (!newVal && show_list.value.length > 0) {
    // 添加表格行出现动画
    setTimeout(() => {
      const tableRows = document.querySelectorAll('.table-row')
      tableRows.forEach((row, index) => {
        setTimeout(() => {
          row.classList.add('animate-in')
        }, index * 50)
      })
    }, 100)
  }
})

// 在onMounted钩子函数中添加以下代码
watch(
  () => themeStore.theme,
  () => {
    // 强制刷新表头和命令行结构
    nextTick(() => {
      const tableHeader = document.querySelector('.table-header')
      if (tableHeader) {
        tableHeader.classList.remove('animate-in')
        // 触发重排
        void tableHeader.offsetWidth
        tableHeader.classList.add('animate-in')
      }

      // 刷新整个表格容器
      if (scrollBody.value) {
        scrollBody.value.style.display = 'none'
        // 触发重排
        void scrollBody.value.offsetWidth
        scrollBody.value.style.display = ''
      }
    })
  },
  { immediate: true },
)

function getPriorityLabel(priority) {
  const numPriority = Number(priority)

  if (!isNaN(numPriority)) {
    if (numPriority >= 1 && numPriority <= 3) {
      return `低 (${numPriority})`
    } else if (numPriority >= 4 && numPriority <= 7) {
      return `中 (${numPriority})`
    } else if (numPriority >= 8 && numPriority <= 10) {
      return `高 (${numPriority})`
    }
  }

  return `${priority}` // 返回原始值
}
</script>

<style>
:root {
  --primary-color: #6750a4;
  --primary-light: #eaddff;
  --primary-dark: #4f378b;
  --secondary-color: #9c27b0;
  --on-surface: #1c1b1f;
  --surface: #fffbfe;
  --surface-container: #f3edf7;
  --surface-variant: #e7e0ec;
  --error-color: #b3261e;
  --warning-color: #f57c00;
  --success-color: #2e7d32;

  /* Dark mode colors */
  --dark-primary: #d0bcff;
  --dark-secondary: #ccc2dc;
  --dark-surface: #1c1b1f;
  --dark-surface-container: #2a2930;
  --dark-surface-variant: #49454f;
  --dark-on-surface: #e6e1e5;

  --border-radius: 16px;
  --card-elevation: 0 4px 8px rgba(0, 0, 0, 0.08);
  --dark-card-elevation: 0 4px 8px rgba(0, 0, 0, 0.2);
  --transition-standard: 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Dark mode specific styles */
.v-theme--dark {
  --primary-color: var(--dark-primary);
  --secondary-color: var(--dark-secondary);
  --on-surface: var(--dark-on-surface);
  --surface: var(--dark-surface);
  --surface-container: var(--dark-surface-container);
  --surface-variant: var(--dark-surface-variant);
}

.dark-card {
  background-color: var(--dark-surface-container) !important;
}
</style>

<style scoped>
.command-line-system {
  min-height: 100vh;
  background-color: v-bind('isDarkMode ? "var(--dark-surface)" : "var(--surface)"');
  color: v-bind('isDarkMode ? "var(--dark-on-surface)" : "var(--on-surface)"');
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: relative;
  transition: background-color var(--transition-standard);
}

.command-input-section {
  position: sticky;
  top: 0;
  z-index: 10;
  background-color: v-bind('isDarkMode ? "var(--dark-surface)" : "var(--surface)"');
  padding: 16px 16px 0 16px;
  transition: background-color var(--transition-standard);
}

.command-card,
.results-card {
  border-radius: var(--border-radius);
  transition: all var(--transition-standard);
  box-shadow: v-bind('isDarkMode ? "var(--dark-card-elevation)" : "var(--card-elevation)"');
  overflow: hidden;
}

.command-card {
  backdrop-filter: blur(10px);
}

.command-input {
  transition: all var(--transition-standard);
}

.results-card {
  margin: 0 16px 16px 16px;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.table-container {
  position: relative;
  height: calc(100vh - 220px);
  display: flex;
  flex-direction: column;
}

.header-fixed {
  background-color: v-bind(
    'isDarkMode ? "var(--dark-surface-container)" : "var(--surface-container)"'
  );
  position: sticky;
  top: 0;
  z-index: 5;
  transition: background-color var(--transition-standard);
}

.header-fixed-dark {
  background-color: var(--dark-surface-container);
}

.responsive-table {
  padding: 0;
  margin: 0;
  list-style: none;
  width: 100%;
}

.responsive-table li {
  border-radius: 12px;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  transition: all var(--transition-standard);
}

.table-header {
  background-color: v-bind('isDarkMode ? "var(--dark-surface-variant)" : "var(--surface-variant)"');
  color: v-bind('isDarkMode ? "var(--dark-on-surface)" : "var(--on-surface)"');
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
  position: sticky;
  top: 0;
  z-index: 4;
  margin-bottom: 16px !important;
  opacity: 0;
  transform: translateY(-10px);
  transition: all var(--transition-standard);
}

.table-header.animate-in {
  opacity: 1;
  transform: translateY(0);
}

.table-header-dark {
  background-color: var(--dark-surface-variant);
  color: var(--dark-on-surface);
}

.table-row {
  background-color: v-bind('isDarkMode ? "var(--dark-surface-variant)" : "white"');
  color: v-bind('isDarkMode ? "var(--dark-on-surface)" : "var(--on-surface)"');
  box-shadow: v-bind(
    'isDarkMode ? "0 2px 6px rgba(0, 0, 0, 0.3)" : "0 2px 6px rgba(0, 0, 0, 0.1)"'
  );
  transition: all var(--transition-standard);
  position: relative;
  will-change: transform;
  opacity: 0;
  transform: translateY(10px);
}

.table-row.animate-in {
  opacity: 1;
  transform: translateY(0);
}

.table-row-dark {
  background-color: var(--dark-surface-container);
}

.table-row:hover {
  transform: translateY(-2px) scale(1.01);
  z-index: 2;
  box-shadow: v-bind(
    'isDarkMode ? "0 6px 12px rgba(0, 0, 0, 0.4)" : "0 6px 12px rgba(0, 0, 0, 0.15)"'
  );
}

.col {
  padding: 8px;
  display: flex;
  align-items: center;
}

.col-1 {
  flex-basis: 15%;
  font-weight: 600;
}

.col-2 {
  flex-basis: 25%;
}

.col-3 {
  flex-basis: 15%;
  text-align: center;
  justify-content: center;
}

.col-4 {
  flex-basis: 30%;
}

.col-5 {
  flex-basis: 15%;
  justify-content: center;
}

.scroll-body {
  flex-grow: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 0 16px 16px 16px;
  scroll-behavior: smooth;
  scrollbar-width: thin;
}

.scroll-body::-webkit-scrollbar {
  width: 6px;
}

.scroll-body::-webkit-scrollbar-track {
  background: v-bind('isDarkMode ? "var(--dark-surface-variant)" : "var(--surface-variant)"');
  border-radius: 3px;
}

.scroll-body::-webkit-scrollbar-thumb {
  background: v-bind('isDarkMode ? "var(--dark-primary)" : "var(--primary-color)"');
  border-radius: 3px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  text-align: center;
  color: v-bind('isDarkMode ? "var(--dark-on-surface)" : "var(--on-surface)"');
  opacity: 0.6;
}

.scroll-top-btn {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 6;
}

.priority-chip {
  min-width: 80px;
  justify-content: center;
}

.custom-snackbar {
  border-radius: 8px !important;
}

.execute-btn {
  transition: all var(--transition-standard);
}

.theme-toggle-btn {
  transition: all var(--transition-standard);
}

.history-chip {
  transition: all var(--transition-standard);
  cursor: pointer;
}

.history-chip:hover {
  transform: translateY(-2px);
}

/* 列表动画 */
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(30px);
}

/* 响应式调整 */
@media (max-width: 960px) {
  .table-container {
    height: calc(100vh - 240px);
  }

  .responsive-table li {
    padding: 12px;
    margin-bottom: 10px;
  }
}

@media (max-width: 768px) {
  .table-header {
    display: none;
  }

  .table-row {
    flex-direction: column;
  }

  .col {
    flex-basis: 100% !important;
    display: flex;
    padding: 8px 0;
    border-bottom: 1px solid
      v-bind('isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"');
  }

  .col:last-child {
    border-bottom: none;
  }

  .col:before {
    color: v-bind('isDarkMode ? "var(--dark-secondary)" : "var(--secondary-color)"');
    opacity: 0.7;
    padding-right: 10px;
    content: attr(data-label);
    flex-basis: 50%;
    text-align: right;
    font-weight: 600;
  }

  .table-container {
    height: calc(100vh - 260px);
  }

  .command-input-section {
    padding: 12px 12px 0 12px;
  }

  .results-card {
    margin: 0 12px 12px 12px;
  }
}

@media (max-width: 600px) {
  .command-card,
  .results-card {
    border-radius: 12px;
  }

  .scroll-top-btn {
    bottom: 16px;
    right: 16px;
  }
}
</style>
