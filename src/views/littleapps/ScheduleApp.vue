<script setup>
import { ref, computed, onMounted, reactive, watch } from 'vue'
import { useDisplay } from 'vuetify'
import {
  format,
  startOfWeek,
  endOfWeek,
  addDays,
  startOfDay,
  endOfDay,
  isWithinInterval,
  addWeeks,
  subWeeks,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  parseISO,
  isSameDay,
  isSameMonth,
  isToday,
  getHours,
  getMinutes,
  setHours,
  setMinutes,
} from 'date-fns'
import { zhCN } from 'date-fns/locale'
// 导入主题存储
import { useThemeStore } from '@/stores'

// 响应式状态
const events = ref([])
const loading = ref(true)
const currentView = ref('week') // 'day', 'week', 'month'
const selectedDate = ref(new Date())
const showEventDialog = ref(false)
const editingEvent = ref(null)
const newEvent = ref({
  id: '',
  title: '',
  description: '',
  start: null,
  end: null,
  color: '#1976D2',
  allDay: false,
  category: 'default',
})
const searchQuery = ref('')
const selectedCategory = ref('all')
const snackbar = reactive({
  show: false,
  text: '',
  color: 'success',
})
const confirmDialog = reactive({
  show: false,
  title: '',
  text: '',
  callback: null,
})
const categories = ref([
  { value: 'default', text: '默认', color: '#1976D2' },
  { value: 'work', text: '工作', color: '#F44336' },
  { value: 'personal', text: '个人', color: '#4CAF50' },
  { value: 'important', text: '重要', color: '#FF9800' },
  { value: 'other', text: '其他', color: '#9C27B0' },
])

// 使用Vuetify响应式布局
const { mobile, xs, sm, md, lg } = useDisplay()

// 获取主题存储
const themeStore = useThemeStore()

// 计算属性
const viewTitle = computed(() => {
  let formatStr = ''

  switch (currentView.value) {
    case 'day':
      formatStr = 'yyyy年MM月dd日 EEEE'
      break
    case 'week':
      const weekStart = startOfWeek(selectedDate.value, { weekStartsOn: 1 })
      const weekEnd = endOfWeek(selectedDate.value, { weekStartsOn: 1 })
      return `${format(weekStart, 'yyyy年MM月dd日', { locale: zhCN })} - ${format(weekEnd, 'MM月dd日', { locale: zhCN })}`
    case 'month':
      formatStr = 'yyyy年MM月'
      break
  }

  return format(selectedDate.value, formatStr, { locale: zhCN })
})

const visibleEvents = computed(() => {
  let filtered = [...events.value]

  // 搜索过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(
      (event) =>
        event.title.toLowerCase().includes(query) ||
        event.description.toLowerCase().includes(query),
    )
  }

  // 分类过滤
  if (selectedCategory.value !== 'all') {
    filtered = filtered.filter((event) => event.category === selectedCategory.value)
  }

  // 根据视图日期过滤
  let start, end

  switch (currentView.value) {
    case 'day':
      start = startOfDay(selectedDate.value)
      end = endOfDay(selectedDate.value)
      break
    case 'week':
      start = startOfWeek(selectedDate.value, { weekStartsOn: 1 })
      end = endOfWeek(selectedDate.value, { weekStartsOn: 1 })
      break
    case 'month':
      start = startOfMonth(selectedDate.value)
      end = endOfMonth(selectedDate.value)
      break
  }

  return filtered.filter((event) => {
    const eventStart = parseISO(event.start)
    const eventEnd = parseISO(event.end)

    return (
      isWithinInterval(eventStart, { start, end }) ||
      isWithinInterval(eventEnd, { start, end }) ||
      (eventStart <= start && eventEnd >= end)
    )
  })
})

const weekDays = computed(() => {
  const start = startOfWeek(selectedDate.value, { weekStartsOn: 1 })
  return Array.from({ length: 7 }, (_, i) => addDays(start, i))
})

const monthDays = computed(() => {
  const start = startOfMonth(selectedDate.value)
  const end = endOfMonth(selectedDate.value)

  // 获取当月的所有日期
  const daysInMonth = eachDayOfInterval({ start, end })

  // 获取显示的第一天（可能是上个月的日期）
  const firstDayOfGrid = startOfWeek(start, { weekStartsOn: 1 })

  // 获取显示的最后一天（可能是下个月的日期）
  const lastDayOfMonth = endOfMonth(selectedDate.value)
  const lastDayOfGrid = endOfWeek(lastDayOfMonth, { weekStartsOn: 1 })

  // 生成日历网格的所有日期
  return eachDayOfInterval({ start: firstDayOfGrid, end: lastDayOfGrid })
})

const hours = computed(() => {
  return Array.from({ length: 24 }, (_, i) => i)
})

// 当前正在编辑的事件（编辑模式或新建模式）
const currentEvent = computed(() => {
  return editingEvent.value || newEvent.value
})

// 更新事件字段的方法
const updateEventField = (field, value) => {
  if (editingEvent.value) {
    editingEvent.value[field] = value
  } else {
    newEvent.value[field] = value
  }
}

// 方法
const initDb = async () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('scheduleApp', 1)

    request.onupgradeneeded = (event) => {
      const db = event.target.result

      if (!db.objectStoreNames.contains('events')) {
        const eventsStore = db.createObjectStore('events', { keyPath: 'id' })
        eventsStore.createIndex('start', 'start', { unique: false })
        eventsStore.createIndex('category', 'category', { unique: false })
      }
    }

    request.onsuccess = (event) => {
      const db = event.target.result
      resolve(db)
    }

    request.onerror = (event) => {
      reject('数据库打开失败: ' + event.target.errorCode)
    }
  })
}

const loadEvents = async () => {
  try {
    loading.value = true
    const db = await initDb()

    const transaction = db.transaction(['events'], 'readonly')
    const store = transaction.objectStore('events')
    const request = store.getAll()

    request.onsuccess = () => {
      events.value = request.result
      loading.value = false
    }

    request.onerror = () => {
      showSnackbar('加载日程失败', 'error')
      loading.value = false
    }
  } catch (error) {
    console.error('加载日程出错:', error)
    showSnackbar('加载日程失败', 'error')
    loading.value = false
  }
}

const saveEvent = async () => {
  try {
    const isEditing = !!editingEvent.value
    const eventToSave = isEditing
      ? { ...editingEvent.value }
      : {
          ...newEvent.value,
          id: Date.now().toString(),
        }

    const db = await initDb()
    const transaction = db.transaction(['events'], 'readwrite')
    const store = transaction.objectStore('events')

    const request = store.put(eventToSave)

    request.onsuccess = () => {
      if (isEditing) {
        // 更新现有日程
        const index = events.value.findIndex((e) => e.id === eventToSave.id)
        if (index !== -1) {
          events.value[index] = eventToSave
        }
        showSnackbar('日程已更新', 'success')
      } else {
        // 添加新日程
        events.value.push(eventToSave)
        showSnackbar('新日程已添加', 'success')
      }

      closeEventDialog()
    }

    request.onerror = () => {
      showSnackbar('保存日程失败', 'error')
    }
  } catch (error) {
    console.error('保存日程出错:', error)
    showSnackbar('保存日程失败', 'error')
  }
}

const deleteEvent = async (id) => {
  try {
    const db = await initDb()
    const transaction = db.transaction(['events'], 'readwrite')
    const store = transaction.objectStore('events')

    const request = store.delete(id)

    request.onsuccess = () => {
      events.value = events.value.filter((e) => e.id !== id)
      showSnackbar('日程已删除', 'success')
      closeConfirmDialog()
    }

    request.onerror = () => {
      showSnackbar('删除日程失败', 'error')
    }
  } catch (error) {
    console.error('删除日程出错:', error)
    showSnackbar('删除日程失败', 'error')
  }
}

const openNewEventDialog = (date = new Date(), hour = new Date().getHours()) => {
  const start = setHours(setMinutes(date, 0), hour)
  const end = setHours(setMinutes(date, 0), hour + 1)

  newEvent.value = {
    id: '',
    title: '',
    description: '',
    start: format(start, "yyyy-MM-dd'T'HH:mm"),
    end: format(end, "yyyy-MM-dd'T'HH:mm"),
    color: '#1976D2',
    allDay: false,
    category: 'default',
  }

  editingEvent.value = null
  showEventDialog.value = true
}

const openEditEventDialog = (event) => {
  editingEvent.value = { ...event }
  showEventDialog.value = true
}

const closeEventDialog = () => {
  showEventDialog.value = false
  setTimeout(() => {
    editingEvent.value = null
    newEvent.value = {
      id: '',
      title: '',
      description: '',
      start: null,
      end: null,
      color: '#1976D2',
      allDay: false,
      category: 'default',
    }
  }, 300)
}

const confirmDelete = (event) => {
  confirmDialog.title = '删除日程'
  confirmDialog.text = `确定要删除 "${event.title}" 吗？此操作无法撤销。`
  confirmDialog.callback = () => deleteEvent(event.id)
  confirmDialog.show = true
}

const closeConfirmDialog = () => {
  confirmDialog.show = false
  confirmDialog.callback = null
}

const showSnackbar = (text, color = 'success') => {
  snackbar.text = text
  snackbar.color = color
  snackbar.show = true
}

const navigateDate = (direction) => {
  switch (currentView.value) {
    case 'day':
      selectedDate.value =
        direction === 'next' ? addDays(selectedDate.value, 1) : addDays(selectedDate.value, -1)
      break
    case 'week':
      selectedDate.value =
        direction === 'next' ? addWeeks(selectedDate.value, 1) : subWeeks(selectedDate.value, 1)
      break
    case 'month':
      selectedDate.value =
        direction === 'next' ? addMonths(selectedDate.value, 1) : subMonths(selectedDate.value, 1)
      break
  }
}

const goToday = () => {
  selectedDate.value = new Date()
}

const changeView = (view) => {
  currentView.value = view
}

const getEventPosition = (event) => {
  if (currentView.value === 'month') return {}

  const startTime = parseISO(event.start)
  const endTime = parseISO(event.end)

  const startHour = getHours(startTime) + getMinutes(startTime) / 60
  const endHour = getHours(endTime) + getMinutes(endTime) / 60
  const duration = endHour - startHour

  return {
    top: `${startHour * 60}px`,
    height: `${duration * 60}px`,
  }
}

const getEventForDay = (day) => {
  return visibleEvents.value.filter((event) => {
    const eventStart = parseISO(event.start)
    const eventEnd = parseISO(event.end)
    return (
      isSameDay(day, eventStart) || isSameDay(day, eventEnd) || (eventStart < day && eventEnd > day)
    )
  })
}

const getDayClasses = (day) => {
  return {
    'current-month': isSameMonth(day, selectedDate.value),
    'other-month': !isSameMonth(day, selectedDate.value),
    today: isToday(day),
  }
}

// 生命周期钩子
onMounted(() => {
  loadEvents()
})
</script>

<template>
  <!-- 修改主题类绑定，使用themeStore.theme替代theme -->
  <v-container fluid :class="['schedule-app', themeStore.theme]" pa-0>
    <v-row no-gutters>
      <!-- 应用头部 -->
      <v-col cols="12">
        <!-- 修改主题类绑定 -->
        <v-card class="schedule-header" elevation="2" :class="themeStore.theme">
          <v-card-title class="d-flex align-center">
            <v-icon size="large" color="primary" class="me-2">mdi-calendar</v-icon>
            <span class="text-h5">日程管理</span>
            <v-spacer></v-spacer>

            <!-- 移动端折叠菜单 -->
            <v-menu v-if="mobile" offset-y>
              <template v-slot:activator="{ props }">
                <v-btn icon v-bind="props">
                  <v-icon>mdi-dots-vertical</v-icon>
                </v-btn>
              </template>

              <v-list>
                <v-list-item prepend-icon="mdi-calendar-today" @click="changeView('day')">
                  <v-list-item-title>日视图</v-list-item-title>
                </v-list-item>
                <v-list-item prepend-icon="mdi-calendar-week" @click="changeView('week')">
                  <v-list-item-title>周视图</v-list-item-title>
                </v-list-item>
                <v-list-item prepend-icon="mdi-calendar-month" @click="changeView('month')">
                  <v-list-item-title>月视图</v-list-item-title>
                </v-list-item>
                <v-list-item prepend-icon="mdi-calendar-today" @click="goToday">
                  <v-list-item-title>今天</v-list-item-title>
                </v-list-item>
                <v-list-item prepend-icon="mdi-brightness-6" @click="toggleTheme">
                  <v-list-item-title>切换主题</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>

            <!-- 桌面端工具栏 -->
            <template v-else>
              <v-btn-group class="mx-2">
                <v-btn
                  variant="text"
                  :color="currentView === 'day' ? 'primary' : ''"
                  @click="changeView('day')"
                >
                  日
                </v-btn>
                <v-btn
                  variant="text"
                  :color="currentView === 'week' ? 'primary' : ''"
                  @click="changeView('week')"
                >
                  周
                </v-btn>
                <v-btn
                  variant="text"
                  :color="currentView === 'month' ? 'primary' : ''"
                  @click="changeView('month')"
                >
                  月
                </v-btn>
              </v-btn-group>

              <v-btn @click="goToday" variant="outlined" color="primary" class="mx-2"> 今天 </v-btn>
            </template>
          </v-card-title>

          <v-card-text>
            <v-row align="center">
              <v-col cols="12" sm="4">
                <div class="d-flex align-center">
                  <v-btn icon @click="navigateDate('prev')">
                    <v-icon>mdi-chevron-left</v-icon>
                  </v-btn>
                  <span class="text-h6 mx-2">{{ viewTitle }}</span>
                  <v-btn icon @click="navigateDate('next')">
                    <v-icon>mdi-chevron-right</v-icon>
                  </v-btn>
                </div>
              </v-col>

              <v-col cols="12" sm="4">
                <v-text-field
                  v-model="searchQuery"
                  density="compact"
                  variant="outlined"
                  label="搜索日程"
                  prepend-inner-icon="mdi-magnify"
                  hide-details
                  clearable
                  class="search-field"
                ></v-text-field>
              </v-col>

              <v-col cols="12" sm="4">
                <v-select
                  v-model="selectedCategory"
                  density="compact"
                  label="分类"
                  variant="outlined"
                  hide-details
                  :items="[{ value: 'all', text: '全部' }, ...categories]"
                ></v-select>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- 日程主体 -->
      <v-col cols="12">
        <!-- 修改主题类绑定 -->
        <v-card class="schedule-content" elevation="1" :class="themeStore.theme">
          <v-card-text class="pa-0">
            <!-- 加载状态 -->
            <div v-if="loading" class="d-flex justify-center align-center" style="height: 300px">
              <v-progress-circular indeterminate color="primary" size="60"></v-progress-circular>
            </div>

            <!-- 日视图 -->
            <div v-else-if="currentView === 'day'" class="day-view">
              <div class="time-grid">
                <div v-for="hour in hours" :key="`hour-${hour}`" class="hour-slot">
                  <div class="hour-label">{{ hour }}:00</div>
                  <div class="hour-content" @click="openNewEventDialog(selectedDate, hour)"></div>
                </div>
              </div>

              <div class="events-container">
                <div
                  v-for="event in visibleEvents"
                  :key="event.id"
                  class="event-item"
                  :style="{
                    ...getEventPosition(event),
                    backgroundColor: event.color + '99',
                  }"
                  @click.stop="openEditEventDialog(event)"
                >
                  <div class="event-time">
                    {{ format(parseISO(event.start), 'HH:mm') }} -
                    {{ format(parseISO(event.end), 'HH:mm') }}
                  </div>
                  <div class="event-title">{{ event.title }}</div>
                </div>
              </div>
            </div>

            <!-- 周视图 -->
            <div v-else-if="currentView === 'week'" class="week-view">
              <div class="week-header">
                <div class="time-column-header"></div>
                <div
                  v-for="day in weekDays"
                  :key="`header-${day}`"
                  class="day-column-header"
                  :class="{ today: isToday(day) }"
                >
                  <div class="day-name">{{ format(day, 'E', { locale: zhCN }) }}</div>
                  <div class="day-number">{{ format(day, 'd') }}</div>
                </div>
              </div>

              <div class="week-body">
                <div class="time-column">
                  <div v-for="hour in hours" :key="`time-${hour}`" class="time-cell">
                    {{ hour }}:00
                  </div>
                </div>

                <div class="days-grid">
                  <div v-for="day in weekDays" :key="`day-${day}`" class="day-column">
                    <div
                      v-for="hour in hours"
                      :key="`day-${day}-hour-${hour}`"
                      class="hour-cell"
                      @click="openNewEventDialog(day, hour)"
                    ></div>

                    <div class="events-wrapper">
                      <div
                        v-for="event in getEventForDay(day)"
                        :key="`event-${event.id}`"
                        class="event-item"
                        :style="{
                          ...getEventPosition(event),
                          backgroundColor: event.color + '99',
                        }"
                        @click.stop="openEditEventDialog(event)"
                      >
                        <div class="event-time">
                          {{ format(parseISO(event.start), 'HH:mm') }} -
                          {{ format(parseISO(event.end), 'HH:mm') }}
                        </div>
                        <div class="event-title">{{ event.title }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 月视图 -->
            <div v-else class="month-view">
              <div class="month-header">
                <div v-for="dayIndex in 7" :key="`weekday-${dayIndex}`" class="weekday-header">
                  {{
                    format(
                      addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), dayIndex - 1),
                      'E',
                      { locale: zhCN },
                    )
                  }}
                </div>
              </div>

              <div class="month-body">
                <div
                  v-for="(day, index) in monthDays"
                  :key="`month-day-${index}`"
                  class="month-day"
                  :class="getDayClasses(day)"
                  @click="openNewEventDialog(day)"
                >
                  <div class="day-number">{{ format(day, 'd') }}</div>

                  <div class="day-events">
                    <div
                      v-for="event in getEventForDay(day).slice(0, 3)"
                      :key="`event-${event.id}`"
                      class="month-event"
                      :style="{ backgroundColor: event.color + '99' }"
                      @click.stop="openEditEventDialog(event)"
                    >
                      <span class="month-event-title">{{ event.title }}</span>
                    </div>

                    <div v-if="getEventForDay(day).length > 3" class="more-events">
                      +{{ getEventForDay(day).length - 3 }} 项
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- 浮动按钮 -->
    <v-btn
      class="fab-button"
      color="primary"
      icon="mdi-plus"
      size="large"
      elevation="3"
      @click="openNewEventDialog()"
    ></v-btn>

    <!-- 日程对话框 -->
    <v-dialog v-model="showEventDialog" max-width="600px" transition="dialog-bottom-transition">
      <v-card>
        <v-card-title>
          <span>{{ editingEvent ? '编辑日程' : '新建日程' }}</span>
          <v-spacer></v-spacer>
          <v-btn icon @click="closeEventDialog">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12">
                <v-text-field
                  :model-value="currentEvent.title"
                  @update:model-value="updateEventField('title', $event)"
                  label="标题*"
                  required
                  variant="outlined"
                  density="comfortable"
                ></v-text-field>
              </v-col>

              <v-col cols="12">
                <v-textarea
                  :model-value="currentEvent.description"
                  @update:model-value="updateEventField('description', $event)"
                  label="描述"
                  variant="outlined"
                  auto-grow
                ></v-textarea>
              </v-col>

              <v-col cols="12" sm="6">
                <v-text-field
                  :model-value="currentEvent.start"
                  @update:model-value="updateEventField('start', $event)"
                  label="开始时间*"
                  type="datetime-local"
                  required
                  variant="outlined"
                ></v-text-field>
              </v-col>

              <v-col cols="12" sm="6">
                <v-text-field
                  :model-value="currentEvent.end"
                  @update:model-value="updateEventField('end', $event)"
                  label="结束时间*"
                  type="datetime-local"
                  required
                  variant="outlined"
                ></v-text-field>
              </v-col>

              <v-col cols="12" sm="6">
                <v-select
                  :model-value="currentEvent.category"
                  @update:model-value="updateEventField('category', $event)"
                  label="分类"
                  :items="categories"
                  variant="outlined"
                ></v-select>
              </v-col>

              <v-col cols="12" sm="6">
                <v-color-picker
                  :model-value="currentEvent.color"
                  @update:model-value="updateEventField('color', $event)"
                  hide-inputs
                  hide-canvas
                  show-swatches
                  swatches-max-height="120px"
                ></v-color-picker>
              </v-col>

              <v-col cols="12">
                <v-switch
                  :model-value="currentEvent.allDay"
                  @update:model-value="updateEventField('allDay', $event)"
                  label="全天事件"
                  color="primary"
                ></v-switch>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="error"
            variant="text"
            v-if="editingEvent"
            @click="confirmDelete(editingEvent)"
          >
            删除
          </v-btn>
          <v-btn color="primary" @click="saveEvent"> 保存 </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 确认对话框 -->
    <v-dialog v-model="confirmDialog.show" max-width="400">
      <v-card>
        <v-card-title>{{ confirmDialog.title }}</v-card-title>
        <v-card-text>{{ confirmDialog.text }}</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey" variant="text" @click="closeConfirmDialog">取消</v-btn>
          <v-btn color="error" @click="confirmDialog.callback">确认</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 通知提示 -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000" location="top">
      {{ snackbar.text }}
      <template v-slot:actions>
        <v-btn icon @click="snackbar.show = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<style scoped>
.schedule-app {
  min-height: 100vh;
  position: relative;
}

.schedule-app.dark {
  background-color: #121212;
  color: #e0e0e0;
}

.schedule-app.light {
  background-color: #f5f5f5;
  color: #333;
}

.schedule-header {
  position: sticky;
  top: 0;
  z-index: 10;
}

.schedule-header.light {
  background-color: white;
}

.schedule-header.dark {
  background-color: #1e1e1e;
}

.schedule-content {
  min-height: calc(100vh - 160px);
}

.schedule-content.light {
  background-color: white;
}

.schedule-content.dark {
  background-color: #1e1e1e;
}

/* 日视图样式 */
.day-view {
  display: flex;
  height: calc(100vh - 220px);
  position: relative;
  overflow-y: auto;
}

.time-grid {
  width: 100%;
}

.hour-slot {
  display: flex;
  border-bottom: 1px solid rgba(125, 125, 125, 0.1);
  height: 60px;
}

.hour-label {
  width: 60px;
  text-align: right;
  padding-right: 10px;
  font-size: 0.8rem;
  color: #666;
  border-right: 1px solid rgba(125, 125, 125, 0.2);
}

.dark .hour-label {
  color: #aaa;
}

.hour-content {
  flex-grow: 1;
  cursor: pointer;
  transition: background-color 0.2s;
}

.hour-content:hover {
  background-color: rgba(125, 125, 125, 0.05);
}

.dark .hour-content:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.events-container {
  position: absolute;
  top: 0;
  left: 60px;
  right: 0;
}

/* 周视图样式 */
.week-view {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 220px);
  overflow-y: auto;
}

.week-header {
  display: flex;
  border-bottom: 1px solid rgba(125, 125, 125, 0.2);
  min-height: 60px;
  position: sticky;
  top: 0;
  z-index: 5;
  background-color: inherit;
}

.time-column-header {
  min-width: 60px;
  border-right: 1px solid rgba(125, 125, 125, 0.2);
}

.day-column-header {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 8px;
  border-right: 1px solid rgba(125, 125, 125, 0.1);
  border-bottom: 2px solid transparent;
  transition: all 0.3s ease;
}

.day-column-header.today {
  border-bottom: 2px solid var(--v-theme-primary);
  background-color: rgba(var(--v-theme-primary), 0.05);
}

.day-name {
  font-weight: 500;
}

.day-number {
  font-size: 1.2rem;
  font-weight: 300;
}

.week-body {
  display: flex;
  flex: 1;
}

.time-column {
  min-width: 60px;
  border-right: 1px solid rgba(125, 125, 125, 0.2);
}

.time-cell {
  height: 60px;
  text-align: right;
  padding-right: 10px;
  font-size: 0.8rem;
  color: #666;
  border-bottom: 1px solid rgba(125, 125, 125, 0.1);
}

.dark .time-cell {
  color: #aaa;
}

.days-grid {
  display: flex;
  flex: 1;
}

.day-column {
  flex: 1;
  position: relative;
  border-right: 1px solid rgba(125, 125, 125, 0.1);
}

.hour-cell {
  height: 60px;
  border-bottom: 1px solid rgba(125, 125, 125, 0.1);
  cursor: pointer;
  transition: background-color 0.2s;
}

.hour-cell:hover {
  background-color: rgba(125, 125, 125, 0.05);
}

.dark .hour-cell:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.events-wrapper {
  position: absolute;
  top: 0;
  left: 5px;
  right: 5px;
  bottom: 0;
}

/* 月视图样式 */
.month-view {
  min-height: calc(100vh - 220px);
}

.month-header {
  display: flex;
  background-color: rgba(125, 125, 125, 0.05);
  border-bottom: 1px solid rgba(125, 125, 125, 0.2);
}

.weekday-header {
  flex: 1;
  text-align: center;
  padding: 10px;
  font-weight: 500;
}

.month-body {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-auto-rows: minmax(120px, 1fr);
}

.month-day {
  border-right: 1px solid rgba(125, 125, 125, 0.1);
  border-bottom: 1px solid rgba(125, 125, 125, 0.1);
  padding: 5px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.month-day:hover {
  background-color: rgba(125, 125, 125, 0.05);
}

.dark .month-day:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.month-day.current-month {
  color: inherit;
}

.month-day.other-month {
  color: #999;
  background-color: rgba(125, 125, 125, 0.03);
}

.dark .month-day.other-month {
  color: #666;
  background-color: rgba(0, 0, 0, 0.2);
}

.month-day.today {
  background-color: rgba(var(--v-theme-primary), 0.05);
}

.month-day.today .day-number {
  background-color: var(--v-theme-primary);
  color: white;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.day-events {
  margin-top: 5px;
}

.month-event {
  margin-bottom: 3px;
  padding: 2px 4px;
  border-radius: 3px;
  font-size: 0.8rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
  transition: transform 0.2s;
}

.month-event:hover {
  transform: translateX(2px);
}

.month-event-title {
  font-size: 0.8rem;
}

.more-events {
  font-size: 0.8rem;
  color: #666;
  text-align: center;
  margin-top: 2px;
}

.dark .more-events {
  color: #aaa;
}

/* 事件样式 */
.event-item {
  position: absolute;
  left: 5px;
  right: 5px;
  padding: 4px 8px;
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  transition:
    transform 0.2s,
    box-shadow 0.2s;
  z-index: 1;
}

.event-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 3px 5px rgba(0, 0, 0, 0.2);
  z-index: 2;
}

.event-time {
  font-size: 0.75rem;
  opacity: 0.8;
}

.event-title {
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 浮动按钮 */
.fab-button {
  position: fixed;
  bottom: 30px;
  right: 30px;
  z-index: 100;
}

/* 动画 */
.v-enter-active,
.v-leave-active {
  transition: opacity 0.3s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}

/* 响应式调整 */
@media (max-width: 600px) {
  .hour-label,
  .time-column-header,
  .time-column {
    min-width: 40px;
  }

  .event-item {
    left: 2px;
    right: 2px;
    padding: 2px 4px;
  }

  .event-time {
    font-size: 0.7rem;
  }

  .event-title {
    font-size: 0.8rem;
  }
}
</style>
