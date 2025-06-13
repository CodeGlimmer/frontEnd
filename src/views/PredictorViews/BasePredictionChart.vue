<template>
  <v-container fluid class="sales-forecast-container">
    <v-card
      elevation="2"
      class="sales-card pa-4"
      :class="[isDarkMode ? 'dark-card' : '', 'animate-in']"
      :style="cardStyles"
    >
      <div class="card-ripple-effect"></div>
      <v-card-title class="text-h5 font-weight-medium mb-2 d-flex align-center">
        <div class="title-container">
          <span class="title-text">销售数据预测</span>
          <div class="title-underline"></div>
        </div>
        <v-spacer></v-spacer>
        <v-tooltip location="top" :disabled="!isMobile">
          <template v-slot:activator="{ props }">
            <v-chip
              v-if="!loading && accuracyLevel !== ''"
              v-bind="props"
              :color="accuracyColor"
              class="ml-2 accuracy-chip"
              variant="elevated"
              size="small"
              label
            >
              <span class="accuracy-text">{{ accuracyLevel }}</span>
            </v-chip>
          </template>
          <span>预测精确度: {{ accuracyDescription }}</span>
        </v-tooltip>
      </v-card-title>

      <v-scale-transition>
        <v-card-text class="pb-0">
          <v-fade-transition>
            <div
              v-if="isDataReady"
              ref="chartContainer"
              class="chart-container"
              :class="{ 'dark-chart': isDarkMode, expanded: isExpanded }"
              :style="{ height: chartHeight }"
            >
              <div class="chart-loading-overlay" v-if="isChartLoading">
                <v-progress-circular indeterminate :color="loaderColor"></v-progress-circular>
              </div>
            </div>
            <v-skeleton-loader
              v-else
              class="chart-skeleton rounded-lg"
              :class="{ 'dark-skeleton': isDarkMode }"
              :height="chartHeight"
              type="card"
              :loading="loading"
            >
              <div class="skeleton-animation"></div>
            </v-skeleton-loader>
          </v-fade-transition>

          <v-expand-transition>
            <div v-if="isDataReady && !isChartLoading" class="chart-metrics mt-4">
              <v-row no-gutters>
                <v-col cols="12" sm="6" md="3" class="metric-col">
                  <v-card
                    class="metric-card mx-1 my-1"
                    :class="isDarkMode ? 'dark-metric-card' : ''"
                  >
                    <div class="metric-icon-container">
                      <v-icon :color="iconColors.average" size="24">mdi-chart-line</v-icon>
                    </div>
                    <div class="metric-content">
                      <div class="metric-title">平均销售额</div>
                      <div class="metric-value">
                        {{ formatNumber(metrics.averageSales) }}
                      </div>
                    </div>
                  </v-card>
                </v-col>
                <v-col cols="12" sm="6" md="3" class="metric-col">
                  <v-card
                    class="metric-card mx-1 my-1"
                    :class="isDarkMode ? 'dark-metric-card' : ''"
                  >
                    <div class="metric-icon-container">
                      <v-icon :color="iconColors.peak" size="24">mdi-arrow-up-bold</v-icon>
                    </div>
                    <div class="metric-content">
                      <div class="metric-title">最高销售额</div>
                      <div class="metric-value">
                        {{ formatNumber(metrics.peakSales) }}
                      </div>
                    </div>
                  </v-card>
                </v-col>
                <v-col cols="12" sm="6" md="3" class="metric-col">
                  <v-card
                    class="metric-card mx-1 my-1"
                    :class="isDarkMode ? 'dark-metric-card' : ''"
                  >
                    <div class="metric-icon-container">
                      <v-icon :color="iconColors.growth" size="24">mdi-trending-up</v-icon>
                    </div>
                    <div class="metric-content">
                      <div class="metric-title">预测增长率</div>
                      <div class="metric-value" :class="growthClass">
                        {{ formatPercentage(metrics.growthRate) }}
                      </div>
                    </div>
                  </v-card>
                </v-col>
                <v-col cols="12" sm="6" md="3" class="metric-col">
                  <v-card
                    class="metric-card mx-1 my-1"
                    :class="isDarkMode ? 'dark-metric-card' : ''"
                  >
                    <div class="metric-icon-container">
                      <v-icon :color="iconColors.error" size="24">mdi-percent</v-icon>
                    </div>
                    <div class="metric-content">
                      <div class="metric-title">预测误差</div>
                      <div class="metric-value" :class="errorValueClass">
                        {{ formatPercentage(Math.abs(error)) }}
                      </div>
                    </div>
                  </v-card>
                </v-col>
              </v-row>
            </div>
          </v-expand-transition>

          <v-slide-y-transition>
            <div v-if="isDataReady && !isChartLoading" class="time-period-selector mt-4">
              <v-chip-group
                v-model="selectedTimeRange"
                selected-class="selected-time-range"
                mandatory
                @update:model-value="handleTimeRangeChange"
              >
                <v-chip
                  v-for="(range, index) in timeRanges"
                  :key="index"
                  :value="index"
                  class="time-range-chip"
                  :class="index === selectedTimeRange ? 'active-time-range' : ''"
                  variant="elevated"
                  size="small"
                >
                  {{ range.label }}
                </v-chip>
              </v-chip-group>
            </div>
          </v-slide-y-transition>
        </v-card-text>
      </v-scale-transition>

      <v-card-actions v-if="isDataReady">
        <v-spacer></v-spacer>
        <v-tooltip location="top" content="导出数据">
          <template v-slot:activator="{ props }">
            <v-btn
              v-bind="props"
              icon="mdi-download"
              variant="text"
              size="small"
              class="action-btn"
              :ripple="false"
              @click="exportData"
            >
              <v-icon>mdi-download</v-icon>
            </v-btn>
          </template>
        </v-tooltip>
        <v-tooltip location="top" content="刷新数据">
          <template v-slot:activator="{ props }">
            <v-btn
              v-bind="props"
              icon="mdi-refresh"
              variant="text"
              size="small"
              class="action-btn"
              :class="{ 'spin-animation': isRefreshing }"
              :ripple="false"
              @click="refreshData"
            >
              <v-icon>mdi-refresh</v-icon>
            </v-btn>
          </template>
        </v-tooltip>
        <v-tooltip location="top" :content="isExpanded ? '收起详情' : '展开详情'">
          <template v-slot:activator="{ props }">
            <v-btn
              v-bind="props"
              :icon="isExpanded ? 'mdi-chevron-up' : 'mdi-chevron-down'"
              variant="text"
              size="small"
              class="action-btn toggle-btn"
              :ripple="false"
              @click="toggleExpanded"
            >
              <v-icon>{{ isExpanded ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
            </v-btn>
          </template>
        </v-tooltip>
      </v-card-actions>

      <v-expand-transition>
        <div v-if="isExpanded && isDataReady" class="details-panel pa-4">
          <v-divider class="mb-4"></v-divider>
          <v-row>
            <v-col cols="12" sm="6">
              <div class="details-section">
                <div class="details-title">
                  <v-icon size="small" :color="isDarkMode ? '#aaa' : '#666'" class="mr-2"
                    >mdi-calendar-range</v-icon
                  >
                  <span>时间区间分析</span>
                </div>
                <div class="details-content">
                  <v-list density="compact" :class="isDarkMode ? 'dark-list' : ''">
                    <v-list-item>
                      <template v-slot:prepend>
                        <v-icon size="small" color="info">mdi-calendar-start</v-icon>
                      </template>
                      <v-list-item-title>
                        开始日期: <strong>{{ formatDate(dates[0]) }}</strong>
                      </v-list-item-title>
                    </v-list-item>
                    <v-list-item>
                      <template v-slot:prepend>
                        <v-icon size="small" color="info">mdi-calendar-end</v-icon>
                      </template>
                      <v-list-item-title>
                        结束日期: <strong>{{ formatDate(dates[dates.length - 1]) }}</strong>
                      </v-list-item-title>
                    </v-list-item>
                    <v-list-item>
                      <template v-slot:prepend>
                        <v-icon size="small" color="info">mdi-calendar-clock</v-icon>
                      </template>
                      <v-list-item-title>
                        数据周期: <strong>{{ dates.length }}天</strong>
                      </v-list-item-title>
                    </v-list-item>
                  </v-list>
                </div>
              </div>
            </v-col>
            <v-col cols="12" sm="6">
              <div class="details-section">
                <div class="details-title">
                  <v-icon size="small" :color="isDarkMode ? '#aaa' : '#666'" class="mr-2"
                    >mdi-chart-bell-curve</v-icon
                  >
                  <span>预测精度指标</span>
                </div>
                <div class="details-content">
                  <v-list density="compact" :class="isDarkMode ? 'dark-list' : ''">
                    <v-list-item>
                      <template v-slot:prepend>
                        <v-icon size="small" color="primary">mdi-chart-scatter-plot</v-icon>
                      </template>
                      <v-list-item-title>
                        平均绝对误差 (MAE): <strong>{{ formatNumber(metrics.mae) }}</strong>
                      </v-list-item-title>
                    </v-list-item>
                    <v-list-item>
                      <template v-slot:prepend>
                        <v-icon size="small" color="primary">mdi-sigma</v-icon>
                      </template>
                      <v-list-item-title>
                        均方根误差 (RMSE): <strong>{{ formatNumber(metrics.rmse) }}</strong>
                      </v-list-item-title>
                    </v-list-item>
                    <v-list-item>
                      <template v-slot:prepend>
                        <v-icon size="small" color="primary">mdi-chart-timeline-variant</v-icon>
                      </template>
                      <v-list-item-title>
                        确定系数 (R²): <strong>{{ formatNumber(metrics.r2) }}</strong>
                      </v-list-item-title>
                    </v-list-item>
                  </v-list>
                </div>
              </div>
            </v-col>
            <v-col cols="12" class="mt-2">
              <div class="details-section">
                <div class="details-title">
                  <v-icon size="small" :color="isDarkMode ? '#aaa' : '#666'" class="mr-2"
                    >mdi-trending-up</v-icon
                  >
                  <span>趋势分析</span>
                </div>
                <div class="trend-content">
                  <div class="trend-indicator">
                    <div class="trend-arrow" :class="trendIndicatorClass">
                      <v-icon>{{ trendIcon }}</v-icon>
                    </div>
                    <div class="trend-text">
                      {{ trendDescription }}
                    </div>
                  </div>
                  <div class="trend-message">
                    {{ getTrendRecommendation() }}
                  </div>
                </div>
              </div>
            </v-col>
          </v-row>
        </div>
      </v-expand-transition>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, watch, computed, nextTick } from 'vue'
import { useDisplay } from 'vuetify'
import { useThemeStore } from '@/stores'
import { storeToRefs } from 'pinia'
import * as echarts from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart, BarChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DataZoomComponent,
  ToolboxComponent,
  MarkLineComponent,
  MarkPointComponent,
  MarkAreaComponent,
  GraphicComponent,
} from 'echarts/components'

// 注册必要的组件
echarts.use([
  CanvasRenderer,
  LineChart,
  BarChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DataZoomComponent,
  ToolboxComponent,
  MarkLineComponent,
  MarkPointComponent,
  MarkAreaComponent,
  GraphicComponent,
])

const props = defineProps({
  actualSales: {
    type: Array,
    required: true,
    default: () => [],
  },
  predictedSales: {
    type: Array,
    required: true,
    default: () => [],
  },
  dates: {
    type: Array,
    required: true,
    default: () => [],
  },
  error: {
    type: Number,
    default: 0,
  },
  isExpanded: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['refresh', 'export', 'time-range-change'])

// 基础数据和引用
const chartContainer = ref(null)
let chartInstance = null
let resizeObserverInstance = null
const display = useDisplay()
const themeStore = useThemeStore()
const { theme } = storeToRefs(themeStore)
const isMobile = computed(() => display.mobile.value)
const isTablet = computed(() => display.smAndDown.value && !display.mobile.value)
const isDarkMode = computed(() => theme.value === 'dark')
const isExpanded = ref(props.isExpanded)
const isChartLoading = ref(false)
const isRefreshing = ref(false)
const chartAnimationDuration = 1000
const selectedTimeRange = ref(0)
const cardElevation = ref(2)

// 计算数据是否就绪
const isDataReady = computed(() => {
  return !props.loading && props.actualSales.length > 0 && props.dates.length > 0
})

// 图表高度
const chartHeight = computed(() => {
  if (isMobile.value) {
    return isExpanded.value ? '380px' : '280px'
  } else if (isTablet.value) {
    return isExpanded.value ? '420px' : '340px'
  } else {
    return isExpanded.value ? '450px' : '380px'
  }
})

// 卡片样式随滚动变化
const cardStyles = computed(() => {
  return {
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: `0 ${cardElevation.value}px ${cardElevation.value * 2}px rgba(0, 0, 0, ${
      isDarkMode.value ? 0.3 : 0.1
    })`,
  }
})

// 精度指标和颜色
const accuracyLevel = computed(() => {
  const absError = Math.abs(props.error)
  if (absError < 5) return '高精度'
  if (absError < 10) return '中等精度'
  if (absError < 15) return '一般精度'
  return '低精度'
})

const accuracyDescription = computed(() => {
  const absError = Math.abs(props.error)
  if (absError < 5) return '预测误差低于5%，属于高精度预测'
  if (absError < 10) return '预测误差在5-10%之间，属于中等精度预测'
  if (absError < 15) return '预测误差在10-15%之间，属于一般精度预测'
  return '预测误差高于15%，属于低精度预测'
})

const accuracyColor = computed(() => {
  const absError = Math.abs(props.error)
  if (absError < 5) return 'success'
  if (absError < 10) return 'info'
  if (absError < 15) return 'warning'
  return 'error'
})

// 加载器颜色
const loaderColor = computed(() => {
  return isDarkMode.value ? '#64B5F6' : '#1976D2'
})

// 消息和图标类
const growthClass = computed(() => {
  if (metrics.growthRate > 0) return 'positive-value'
  if (metrics.growthRate < 0) return 'negative-value'
  return ''
})

const errorValueClass = computed(() => {
  const absError = Math.abs(props.error)
  if (absError < 5) return 'positive-value'
  if (absError < 10) return 'neutral-value'
  return 'negative-value'
})

const trendIndicatorClass = computed(() => {
  if (metrics.trend > 0.05) return 'trend-up'
  if (metrics.trend < -0.05) return 'trend-down'
  return 'trend-stable'
})

const trendIcon = computed(() => {
  if (metrics.trend > 0.05) return 'mdi-trending-up'
  if (metrics.trend < -0.05) return 'mdi-trending-down'
  return 'mdi-trending-neutral'
})

const trendDescription = computed(() => {
  if (metrics.trend > 0.1) return '强劲上升趋势'
  if (metrics.trend > 0.05) return '温和上升趋势'
  if (metrics.trend > -0.05 && metrics.trend < 0.05) return '稳定趋势'
  if (metrics.trend > -0.1) return '温和下降趋势'
  return '明显下降趋势'
})

// 图标颜色
const iconColors = reactive({
  average: computed(() => (isDarkMode.value ? '#64B5F6' : '#1976D2')),
  peak: computed(() => (isDarkMode.value ? '#81C784' : '#43A047')),
  growth: computed(() => {
    if (metrics.growthRate > 0) return isDarkMode.value ? '#81C784' : '#43A047'
    if (metrics.growthRate < 0) return isDarkMode.value ? '#E57373' : '#E53935'
    return isDarkMode.value ? '#FFB74D' : '#FB8C00'
  }),
  error: computed(() => {
    const absError = Math.abs(props.error)
    if (absError < 5) return isDarkMode.value ? '#81C784' : '#43A047'
    if (absError < 10) return isDarkMode.value ? '#FFB74D' : '#FB8C00'
    return isDarkMode.value ? '#E57373' : '#E53935'
  }),
})

// 时间区间选项
const timeRanges = [
  { label: '全部', value: 'all' },
  { label: '近30天', value: '30d' },
  { label: '近90天', value: '90d' },
  { label: '近半年', value: '180d' },
  { label: '近一年', value: '365d' },
]

// 度量指标
const metrics = reactive({
  averageSales: 0,
  peakSales: 0,
  growthRate: 0,
  mae: 0, // 平均绝对误差
  rmse: 0, // 均方根误差
  r2: 0, // 决定系数
  trend: 0, // 趋势指标
})

// 根据时间区间筛选数据
const filteredData = computed(() => {
  if (!isDataReady.value) return { dates: [], actual: [], predicted: [] }

  const range = timeRanges[selectedTimeRange.value].value
  if (range === 'all') {
    return {
      dates: props.dates,
      actual: props.actualSales,
      predicted: props.predictedSales,
    }
  }

  // 计算要显示的天数
  const daysToShow = parseInt(range)
  if (isNaN(daysToShow) || props.dates.length <= daysToShow) {
    return {
      dates: props.dates,
      actual: props.actualSales,
      predicted: props.predictedSales,
    }
  }

  // 仅显示最近N天
  const startIndex = props.dates.length - daysToShow
  return {
    dates: props.dates.slice(startIndex),
    actual: props.actualSales.slice(startIndex),
    predicted: props.predictedSales.slice(startIndex),
  }
})

// 更新度量指标
const updateMetrics = () => {
  // 只在数据就绪时计算
  if (!isDataReady.value) return

  const { actual, predicted } = filteredData.value

  // 简单度量计算
  const sum = actual.reduce((acc, val) => acc + val, 0)
  metrics.averageSales = actual.length > 0 ? sum / actual.length : 0
  metrics.peakSales = actual.length > 0 ? Math.max(...actual) : 0

  // 增长率
  if (actual.length > 0) {
    const lookback = Math.min(7, actual.length)
    const firstPeriodValues = actual.slice(0, lookback)
    const lastPeriodValues = actual.slice(-lookback)

    const firstPeriodSum = firstPeriodValues.reduce((acc, val) => acc + val, 0)
    const firstWeekAvg = lookback > 0 ? firstPeriodSum / lookback : 0

    const lastPeriodSum = lastPeriodValues.reduce((acc, val) => acc + val, 0)
    const lastWeekAvg = lookback > 0 ? lastPeriodSum / lookback : 0

    if (firstWeekAvg !== 0) {
      metrics.growthRate = lastWeekAvg / firstWeekAvg - 1
    } else {
      // 处理 firstWeekAvg 为 0 的情况
      if (lastWeekAvg > 0) {
        metrics.growthRate = 1 // 从0增长到正数，视为100%增长
      } else if (lastWeekAvg < 0) {
        metrics.growthRate = -1 // 从0降至负数（销售额通常不为负），视为-100%
      } else {
        metrics.growthRate = 0 // 两者都为0，无增长
      }
    }
  } else {
    metrics.growthRate = 0 // 没有实际数据，增长率为0
  }

  // 计算预测指标
  let sumSquaredError = 0
  let sumAbsError = 0
  let sumSquaredTotal = 0

  for (let i = 0; i < actual.length && i < predicted.length; i++) {
    if (predicted[i] !== null && !isNaN(predicted[i])) {
      const error = predicted[i] - actual[i]
      sumSquaredError += error * error
      sumAbsError += Math.abs(error)
      sumSquaredTotal += Math.pow(actual[i] - metrics.averageSales, 2)
    }
  }

  // 平均绝对误差
  metrics.mae = actual.length > 0 ? sumAbsError / actual.length : 0

  // 均方根误差
  metrics.rmse = actual.length > 0 ? Math.sqrt(sumSquaredError / actual.length) : 0

  // 确定系数 (R²)
  metrics.r2 =
    sumSquaredTotal === 0 ? (sumSquaredError === 0 ? 1 : 0) : 1 - sumSquaredError / sumSquaredTotal

  // 计算趋势指标
  if (actual.length >= 3) {
    // 简单线性回归斜率
    let sumX = 0
    let sumY = 0
    let sumXY = 0
    let sumXX = 0
    const n = actual.length

    for (let i = 0; i < n; i++) {
      sumX += i
      sumY += actual[i]
      sumXY += i * actual[i]
      sumXX += i * i
    }

    // 归一化趋势值
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
    metrics.trend = (slope * n) / (metrics.averageSales || 1) // 避免除以零
  } else {
    metrics.trend = 0
  }
}

// 获取趋势推荐信息
const getTrendRecommendation = () => {
  if (metrics.trend > 0.1) {
    return '销售呈现强劲增长趋势，建议增加备货量，扩大生产规模，并考虑开展更多促销活动以维持增长动力。'
  } else if (metrics.trend > 0.05) {
    return '销售呈现稳健上涨趋势，可以适当增加库存，重点关注热销产品线，优化供应链以满足增长需求。'
  } else if (metrics.trend >= -0.05 && metrics.trend <= 0.05) {
    return '销售趋势相对稳定，建议维持当前库存和生产水平，重点优化运营效率，提高单品盈利能力。'
  } else if (metrics.trend >= -0.1) {
    return '销售呈现轻微下滑趋势，建议谨慎控制库存，关注客户反馈，考虑推出新的促销策略以刺激销售。'
  } else {
    return '销售呈现明显下降趋势，建议减少库存，评估产品竞争力，分析市场变化，并制定新的营销策略以扭转下滑趋势。'
  }
}

// 格式化函数
const formatNumber = (num) => {
  if (num === undefined || num === null || isNaN(num)) return '0'
  return num >= 10000
    ? (num / 10000).toFixed(2) + '万'
    : num.toLocaleString('zh-CN', { maximumFractionDigits: 2 })
}

const formatPercentage = (num) => {
  if (num === undefined || num === null || isNaN(num)) return '0%'
  return (num * 100).toFixed(2) + '%'
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  try {
    // 根据实际日期格式调整解析方法
    const date = new Date(dateStr)
    return date.toLocaleDateString('zh-CN')
  } catch (e) {
    console.log(e)
    return dateStr
  }
}

// 创建和初始化图表
const initChart = () => {
  // 确保DOM元素已经存在
  if (!chartContainer.value) return

  // 设置加载状态
  isChartLoading.value = true

  // 安全销毁现有实例
  if (chartInstance) {
    try {
      chartInstance.dispose()
    } catch (e) {
      console.log('销毁实例出错:', e)
    }
    chartInstance = null
  }

  // 使用nextTick等待DOM更新
  nextTick(() => {
    try {
      // 再次检查DOM元素是否存在
      if (!chartContainer.value) return

      chartInstance = echarts.init(chartContainer.value, null, {
        renderer: 'canvas',
        useDirtyRect: true, // 启用脏矩形优化
      })

      // 添加被动事件监听器处理
      const chartDom = chartContainer.value
      if (chartDom) {
        // 移除默认的滚轮事件监听器并添加被动监听器
        const handlePassiveWheel = (e) => {
          // 只在图表容器内处理滚轮事件
          if (chartInstance && e.target.closest('.chart-container')) {
            // 使用ECharts API进行缩放
            const zr = chartInstance.getZr()
            if (zr) {
              const delta = e.deltaY > 0 ? -0.1 : 0.1
              chartInstance.dispatchAction({
                type: 'dataZoom',
                start: Math.max(
                  0,
                  (chartInstance.getOption().dataZoom?.[0]?.start || 0) - delta * 10,
                ),
                end: Math.min(
                  100,
                  (chartInstance.getOption().dataZoom?.[0]?.end || 100) - delta * 10,
                ),
              })
            }
          }
        }

        // 添加被动滚轮事件监听器
        chartDom.addEventListener('wheel', handlePassiveWheel, { passive: true })

        // 存储事件处理器引用以便后续清理
        chartInstance._passiveWheelHandler = handlePassiveWheel
        chartInstance._chartDom = chartDom
      }

      // 获取过滤后的数据
      const { dates, actual, predicted } = filteredData.value

      // 深色模式颜色调整
      const textColor = isDarkMode.value ? 'rgba(255, 255, 255, 0.85)' : 'rgba(0, 0, 0, 0.85)'
      const subTextColor = isDarkMode.value ? 'rgba(255, 255, 255, 0.65)' : 'rgba(0, 0, 0, 0.65)'
      const axisLineColor = isDarkMode.value ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.15)'
      const splitLineColor = isDarkMode.value ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'
      const tooltipBackgroundColor = isDarkMode.value
        ? 'rgba(50, 50, 50, 0.9)'
        : 'rgba(255, 255, 255, 0.9)'
      const tooltipBorderColor = isDarkMode.value
        ? 'rgba(70, 70, 70, 0.9)'
        : 'rgba(200, 200, 200, 0.9)'
      const tooltipTextColor = isDarkMode.value ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)'

      // 主题颜色
      const actualColor = isDarkMode.value ? '#5CDF6C' : '#4CAF50' // 真实销售线
      const predictedColor = isDarkMode.value ? '#FFA726' : '#FF9800' // 预测销售线
      // const diffAreaColor = isDarkMode.value ? 'rgba(244, 67, 54, 0.3)' : 'rgba(244, 67, 54, 0.2)' // 误差区域

      // 实际销售面积渐变
      const actualAreaGradient = new echarts.graphic.LinearGradient(0, 0, 0, 1, [
        {
          offset: 0,
          color: isDarkMode.value ? 'rgba(92, 223, 108, 0.6)' : 'rgba(76, 175, 80, 0.5)',
        },
        {
          offset: 0.8,
          color: isDarkMode.value ? 'rgba(92, 223, 108, 0.1)' : 'rgba(76, 175, 80, 0.05)',
        },
        {
          offset: 1,
          color: isDarkMode.value ? 'rgba(92, 223, 108, 0)' : 'rgba(76, 175, 80, 0)',
        },
      ])

      // 预测销售面积渐变
      const predictedAreaGradient = new echarts.graphic.LinearGradient(0, 0, 0, 1, [
        {
          offset: 0,
          color: isDarkMode.value ? 'rgba(255, 167, 38, 0.6)' : 'rgba(255, 152, 0, 0.5)',
        },
        {
          offset: 0.8,
          color: isDarkMode.value ? 'rgba(255, 167, 38, 0.1)' : 'rgba(255, 152, 0, 0.05)',
        },
        {
          offset: 1,
          color: isDarkMode.value ? 'rgba(255, 167, 38, 0)' : 'rgba(255, 152, 0, 0)',
        },
      ])

      // 计算最高销售额以确定Y轴上限
      // const maxSales = Math.max(...actual, ...predicted.filter((v) => v !== null))

      // 找到趋势线的起点和终点
      const trendStart = actual[0] || 0
      const trendEnd = trendStart * (1 + metrics.trend)

      // 图表配置
      const option = {
        backgroundColor: 'transparent',
        title: {
          text: '销售数据分析与预测',
          // subtext: `数据周期: ${dates.length}天 | 更新时间: ${new Date().toLocaleDateString('zh-CN')}`,
          left: 'center',
          top: 10,
          textStyle: {
            fontSize: isMobile.value ? 14 : 16,
            color: textColor,
            fontWeight: 500,
          },
          subtextStyle: {
            fontSize: isMobile.value ? 10 : 12,
            color: subTextColor,
          },
        },
        tooltip: {
          trigger: 'axis',
          backgroundColor: tooltipBackgroundColor,
          borderColor: tooltipBorderColor,
          borderWidth: 1,
          textStyle: {
            color: tooltipTextColor,
            fontSize: 12,
          },
          padding: [8, 12],
          formatter: function (params) {
            // Ensure params exist and have at least one item
            if (!params || params.length === 0) {
              return ''
            }
            const firstParam = params[0]
            const date = firstParam.axisValueLabel || firstParam.name || '' // Prefer axisValueLabel if available

            const actualSeries = params.find((p) => p.seriesName === '真实销售')
            const predictedSeries = params.find((p) => p.seriesName === '预测销售')

            const actualValue =
              actualSeries && actualSeries.value !== undefined && actualSeries.value !== null
                ? Number(actualSeries.value)
                : '无数据'
            const predictedValue =
              predictedSeries &&
              predictedSeries.value !== undefined &&
              predictedSeries.value !== null
                ? Number(predictedSeries.value)
                : '无数据'

            const formattedActualValue =
              typeof actualValue === 'number' ? actualValue.toFixed(2) : actualValue
            const formattedPredictedValue =
              typeof predictedValue === 'number' ? predictedValue.toFixed(2) : predictedValue

            let diffValueStr = '无数据'
            let diffPercentStr = '无数据'
            // Use a distinct color for the values in the difference section
            let valueDiffColor = textColor // Default to standard text color

            if (
              typeof actualValue === 'number' &&
              typeof predictedValue === 'number' &&
              !isNaN(actualValue) &&
              !isNaN(predictedValue)
            ) {
              const diff = predictedValue - actualValue
              diffValueStr = diff.toFixed(2)

              if (actualValue !== 0) {
                diffPercentStr = ((diff / actualValue) * 100).toFixed(2) + '%'
              } else if (predictedValue !== 0) {
                // Actual is 0, predicted is not
                diffPercentStr = predictedValue > 0 ? '∞%' : '-∞%' // Indicate infinite percentage change
              } else {
                // Both actual and predicted are 0
                diffPercentStr = '0.00%'
              }

              // Determine color for the difference values
              if (diff > 0) {
                valueDiffColor = isDarkMode.value ? '#81C784' : '#4CAF50' // Positive trend color
              } else if (diff < 0) {
                valueDiffColor = isDarkMode.value ? '#E57373' : '#F44336' // Negative trend color
              }
              // If diff is 0, valueDiffColor remains textColor (neutral)
            }

            const topBorderStyle = isDarkMode.value ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'

            // Using a single template literal for the HTML structure
            // Labels for "绝对误差" and "相对误差" use `textColor`
            // Their values use `valueDiffColor`
            return `
              <div style="font-weight:bold; margin-bottom:5px;">${date}</div>
              <div style="display:flex; justify-content:space-between; margin:3px 0;">
                <span style="color:${actualColor};">真实销售:</span>
                <span style="color:${textColor}; font-weight:bold;">${formattedActualValue}</span>
              </div>
              <div style="display:flex; justify-content:space-between; margin:3px 0;">
                <span style="color:${predictedColor};">预测销售:</span>
                <span style="color:${textColor}; font-weight:bold;">${formattedPredictedValue}</span>
              </div>
              ${
                diffValueStr !== '无数据'
                  ? `
              <div style="margin-top:5px; border-top:1px dashed ${topBorderStyle}; padding-top:5px;">
                <div style="display:flex; justify-content:space-between; margin:3px 0;">
                  <span style="color:${textColor};">绝对误差:</span>
                  <span style="color:${valueDiffColor}; font-weight:bold;">${diffValueStr}</span>
                </div>
                <div style="display:flex; justify-content:space-between; margin:3px 0;">
                  <span style="color:${textColor};">相对误差:</span>
                  <span style="color:${valueDiffColor}; font-weight:bold;">${diffPercentStr}</span>
                </div>
              </div>`
                  : ''
              }
            `
          },
          axisPointer: {
            type: 'cross',
            lineStyle: {
              type: 'dashed',
              width: 1,
              color: isDarkMode.value ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)',
            },
            crossStyle: {
              width: 1,
              color: isDarkMode.value ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)',
            },
            label: {
              backgroundColor: isDarkMode.value ? '#555' : '#6a7985',
            },
            shadowStyle: {
              color: 'rgba(150,150,150,0.1)',
            },
          },
          position: function (pos, params, el, elRect, size) {
            // 智能定位工具提示
            const obj = { top: 10 }
            if (pos[0] < size.viewSize[0] / 2) {
              obj.left = pos[0] + 10
            } else {
              obj.right = size.viewSize[0] - pos[0] + 10
            }
            return obj
          },
        },
        legend: {
          data: ['真实销售', '预测销售'],
          top: isMobile.value ? 40 : 35,
          itemWidth: isMobile.value ? 10 : 12,
          itemHeight: isMobile.value ? 10 : 12,
          icon: 'roundRect',
          textStyle: {
            fontSize: isMobile.value ? 10 : 12,
            color: textColor,
          },
          selectedMode: true,
          animation: true,
          itemGap: isMobile.value ? 10 : 20,
        },
        grid: {
          left: isMobile.value ? '3%' : '4%',
          right: isMobile.value ? '3%' : '4%',
          bottom: '16%',
          top: isMobile.value ? '22%' : '20%',
          containLabel: true,
        },
        dataZoom: [
          {
            type: 'inside',
            start: 0,
            end: 100,
            zoomLock: false,
            throttle: 100,
            rangeMode: ['value', 'value'],
            // 禁用默认的滚轮缩放，改用我们的被动事件处理
            disabled: false,
            zoomOnMouseWheel: false, // 禁用鼠标滚轮缩放
            moveOnMouseMove: true, // 允许鼠标拖拽移动
            moveOnMouseWheel: false, // 禁用滚轮移动
          },
          {
            type: 'slider',
            show: true,
            height: 20,
            bottom: 0,
            start: 0,
            end: 100,
            textStyle: {
              color: textColor,
            },
            borderColor: axisLineColor,
            backgroundColor: isDarkMode.value
              ? 'rgba(47, 69, 84, 0.3)'
              : 'rgba(247, 247, 247, 0.7)',
            fillerColor: isDarkMode.value ? 'rgba(167, 183, 204, 0.2)' : 'rgba(167, 183, 204, 0.4)',
            handleIcon:
              'path://M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
            handleSize: '80%',
            handleStyle: {
              color: '#fff',
              shadowBlur: 3,
              shadowColor: 'rgba(0, 0, 0, 0.6)',
              shadowOffsetX: 2,
              shadowOffsetY: 2,
            },
            emphasis: {
              handleStyle: {
                color: '#FFA500',
              },
            },
          },
        ],
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: dates,
          axisLabel: {
            fontSize: isMobile.value ? 10 : 11,
            color: textColor,
            rotate: isMobile.value ? 45 : 0,
            margin: isMobile.value ? 9 : 12,
            formatter: function (value) {
              // 简化日期显示
              if (dates.length > 30) {
                return value.slice(-5) // 只显示月-日
              }
              return value
            },
            rich: {
              bold: {
                fontWeight: 'bold',
                color: textColor,
              },
            },
          },
          axisLine: {
            lineStyle: {
              color: axisLineColor,
              width: 1,
            },
          },
          axisTick: {
            alignWithLabel: true,
            lineStyle: {
              color: axisLineColor,
            },
          },
          splitLine: {
            show: false,
            lineStyle: {
              color: splitLineColor,
              type: 'dashed',
            },
          },
        },
        yAxis: {
          type: 'value',
          name: '销售额',
          nameTextStyle: {
            fontSize: isMobile.value ? 10 : 12,
            color: textColor,
            padding: [0, 0, 0, 5],
          },
          min: 0,
          max: function (value) {
            return Math.ceil(value.max * 1.2)
          },
          axisLabel: {
            fontSize: isMobile.value ? 10 : 11,
            color: textColor,
            formatter: function (value) {
              if (value >= 10000) {
                return (value / 10000).toFixed(1) + '万'
              }
              return value
            },
          },
          axisLine: {
            show: true,
            lineStyle: {
              color: axisLineColor,
              width: 1,
            },
          },
          axisTick: {
            show: true,
            lineStyle: {
              color: axisLineColor,
            },
          },
          splitLine: {
            show: true,
            lineStyle: {
              color: splitLineColor,
              type: 'dashed',
              width: 1,
            },
          },
        },
        series: [
          {
            name: '真实销售',
            type: 'line',
            data: actual,
            smooth: true,
            symbol: 'circle',
            symbolSize: isMobile.value ? 3 : 4,
            sampling: 'average',
            itemStyle: {
              color: actualColor,
              borderWidth: 2,
              borderColor: isDarkMode.value ? 'rgba(92, 223, 108, 1)' : 'rgba(76, 175, 80, 1)',
              shadowColor: isDarkMode.value ? 'rgba(92, 223, 108, 0.5)' : 'rgba(76, 175, 80, 0.5)',
              shadowBlur: 5,
            },
            lineStyle: {
              width: 2,
              color: actualColor,
            },
            areaStyle: {
              color: actualAreaGradient,
              opacity: 0.8,
              shadowColor: isDarkMode.value ? 'rgba(92, 223, 108, 0.2)' : 'rgba(76, 175, 80, 0.2)',
              shadowBlur: 10,
            },
            emphasis: {
              itemStyle: {
                borderWidth: 3,
                shadowBlur: 10,
              },
              lineStyle: {
                width: 3,
              },
            },
            markPoint: {
              symbol: 'pin',
              symbolSize: 40,
              data: [
                { type: 'max', name: '最大值' },
                { type: 'min', name: '最小值' },
              ],
              label: {
                formatter: function (param) {
                  return param.data.value.toFixed(0)
                },
                position: 'inside', // 标签位置改为内部
                distance: 5, // 距离点的距离
                fontSize: 10, // 字体稍小一些
              },
            },
            z: 2,
            animationDuration: chartAnimationDuration,
            animationEasing: 'cubicOut',
          },
          {
            name: '预测销售',
            type: 'line',
            data: predicted,
            smooth: true,
            symbol: 'emptyCircle',
            symbolSize: isMobile.value ? 3 : 4,
            sampling: 'average',
            itemStyle: {
              color: predictedColor,
              borderWidth: 2,
              borderColor: isDarkMode.value ? 'rgba(255, 167, 38, 1)' : 'rgba(255, 152, 0, 1)',
              shadowColor: isDarkMode.value ? 'rgba(255, 167, 38, 0.5)' : 'rgba(255, 152, 0, 0.5)',
              shadowBlur: 5,
            },
            lineStyle: {
              width: 2,
              color: predictedColor,
              type: 'solid',
            },
            areaStyle: {
              color: predictedAreaGradient,
              opacity: 0.6,
              shadowColor: isDarkMode.value ? 'rgba(255, 167, 38, 0.2)' : 'rgba(255, 152, 0, 0.2)',
              shadowBlur: 10,
            },
            emphasis: {
              itemStyle: {
                borderWidth: 3,
                shadowBlur: 10,
              },
              lineStyle: {
                width: 3,
              },
            },
            z: 1,
            animationDuration: chartAnimationDuration,
            animationDelay: 300,
            animationEasing: 'cubicOut',
          },
          {
            name: '趋势线',
            type: 'line',
            data: [
              [0, trendStart],
              [actual.length - 1, trendEnd],
            ],
            showSymbol: false,
            symbol: 'none',
            lineStyle: {
              width: 1.5,
              color: metrics.trend > 0 ? '#4CAF50' : metrics.trend < 0 ? '#F44336' : '#FFB74D',
              type: 'dashed',
            },
            emphasis: {
              lineStyle: {
                width: 2.5,
              },
            },
            tooltip: {
              show: false,
            },
            z: 0,
            animation: false,
          },
        ],
        // 动画设置
        animation: true,
        animationThreshold: 2000,
        animationDuration: chartAnimationDuration,
        animationEasing: 'cubicInOut',
        animationDelay: function (idx) {
          return idx * 50
        },
        // 添加水印作为装饰
        graphic: [
          {
            type: 'group',
            rotation: Math.PI / 4,
            bounding: 'raw',
            right: '10%',
            bottom: '15%',
            z: -100,
            children: [
              {
                type: 'text',
                left: 'center',
                top: 'center',
                z: -100,
                style: {
                  text: '销售预测',
                  fontSize: 30,
                  fontFamily: 'sans-serif',
                  fontWeight: 'bold',
                  fill: isDarkMode.value ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
                },
              },
            ],
          },
        ],
      }

      chartInstance.setOption(option)

      // 立即执行一次resize确保尺寸正确
      chartInstance.resize()

      // 添加点击事件
      chartInstance.on('click', function (params) {
        if (params.componentType === 'series') {
          console.log('点击了数据点:', params.name, params.value)
        }
      })

      // 关闭加载状态
      setTimeout(() => {
        isChartLoading.value = false
      }, 500)
    } catch (error) {
      console.error('初始化图表时出错:', error)
      isChartLoading.value = false
    }
  })
}

// 监听窗口大小变化自适应调整
const handleResize = () => {
  if (chartInstance) {
    try {
      chartInstance.resize()
    } catch (e) {
      console.log('调整大小出错:', e)
    }
  }
}

// 重建图表
const rebuildChart = () => {
  if (isDataReady.value) {
    initChart()
  }
}

// 展开/收起详情
const toggleExpanded = () => {
  isExpanded.value = !isExpanded.value
  resizeChartOnExpand()
}

// 在手风琴展开/关闭时调整图表大小
const resizeChartOnExpand = () => {
  // 使用setTimeout确保DOM已完全更新
  setTimeout(() => {
    if (chartInstance) {
      try {
        chartInstance.resize()
      } catch (e) {
        console.log('调整大小出错:', e)
      }
    }
  }, 300) // 添加一个延迟，等待过渡动画完成
}

// 安全地设置图表
const safeSetupChart = () => {
  if (isDataReady.value && chartContainer.value) {
    initChart()
  }
}

// 刷新数据
const refreshData = () => {
  if (isRefreshing.value) return // 防止重复点击

  isRefreshing.value = true
  emit('refresh')

  // 模拟刷新动画
  setTimeout(() => {
    isRefreshing.value = false
    rebuildChart()
  }, 1000)
}

// 导出数据
const exportData = () => {
  emit('export')
}

// 处理时间范围变更
const handleTimeRangeChange = (index) => {
  emit('time-range-change', timeRanges[index].value)
  rebuildChart()
}

// 监听滚动更新卡片阴影高度
const handleScroll = () => {
  // 根据滚动位置动态调整卡片阴影
  const scrollY = window.scrollY || window.pageYOffset
  if (scrollY > 100) {
    cardElevation.value = 8
  } else {
    cardElevation.value = 2 + (scrollY / 100) * 6
  }
}

onMounted(() => {
  // 更新度量指标
  updateMetrics()

  // 在mounted后等待DOM渲染后再初始化图表
  nextTick(() => {
    safeSetupChart()
  })

  window.addEventListener('resize', handleResize)
  window.addEventListener('scroll', handleScroll)

  // 监听父元素大小变化
  if (typeof ResizeObserver !== 'undefined') {
    resizeObserverInstance = new ResizeObserver(() => {
      if (chartInstance) {
        try {
          chartInstance.resize()
        } catch (e) {
          console.log('ResizeObserver调整大小出错:', e)
        }
      }
    })

    if (chartContainer.value && chartContainer.value.parentElement) {
      resizeObserverInstance.observe(chartContainer.value.parentElement)
    }
  }
})

onUnmounted(() => {
  // 移除事件监听
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('scroll', handleScroll)

  // 清理ResizeObserver
  if (resizeObserverInstance) {
    resizeObserverInstance.disconnect()
    resizeObserverInstance = null
  }

  // 安全销毁图表实例和清理被动事件监听器
  if (chartInstance) {
    try {
      // 清理被动滚轮事件监听器
      if (chartInstance._passiveWheelHandler && chartInstance._chartDom) {
        chartInstance._chartDom.removeEventListener('wheel', chartInstance._passiveWheelHandler)
      }
      chartInstance.dispose()
    } catch (e) {
      console.log('卸载时销毁实例出错:', e)
    }
    chartInstance = null
  }
})

// 监听数据加载状态变化
watch(isDataReady, (newVal) => {
  if (newVal) {
    updateMetrics()
    nextTick(() => {
      safeSetupChart()
    })
  }
})

// 监听外部props变化
watch(
  () => [props.actualSales, props.predictedSales, props.dates, props.error, props.loading],
  () => {
    updateMetrics()
    if (isDataReady.value) {
      rebuildChart()
    }
  },
  { deep: true },
)

// 监听主题变化
watch(isDarkMode, () => {
  rebuildChart()
})

// 监听展开状态变化
watch(
  () => props.isExpanded,
  (newVal) => {
    isExpanded.value = newVal
    if (isDataReady.value) {
      resizeChartOnExpand()
    }
  },
)
</script>

<style scoped>
.sales-forecast-container {
  width: 100%;
  padding: 16px;
  max-width: 100%;
  position: relative;
}

.sales-card {
  border-radius: 16px;
  overflow: hidden;
  width: 100%;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  backdrop-filter: blur(5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform-origin: center center;
}

.dark-card {
  background-color: rgba(30, 30, 30, 0.95);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.card-ripple-effect {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.05) 0%, rgba(0, 0, 0, 0) 70%);
  opacity: 0;
  transition: opacity 1s ease;
  z-index: 0;
}

.sales-card:hover .card-ripple-effect {
  opacity: 1;
  animation: ripple 2s infinite;
}

@keyframes ripple {
  0% {
    transform: scale(0.95);
    opacity: 0;
  }
  50% {
    opacity: 0.1;
  }
  100% {
    transform: scale(1.05);
    opacity: 0;
  }
}

.chart-container {
  width: 100%;
  min-height: 280px;
  background-color: rgba(255, 255, 255, 0.6);
  border-radius: 12px;
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.dark-chart {
  background-color: rgba(30, 30, 30, 0.6);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.chart-container.expanded {
  animation: expandChart 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes expandChart {
  from {
    transform: scaleY(0.95);
    opacity: 0.8;
  }
  to {
    transform: scaleY(1);
    opacity: 1;
  }
}

.chart-skeleton {
  width: 100%;
  background-color: rgba(245, 245, 245, 0.7);
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.dark-skeleton {
  background-color: rgba(45, 45, 45, 0.7);
}

.skeleton-animation {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.1) 50%,
    transparent 100%
  );
  animation: skeletonAnimation 1.5s infinite;
}

@keyframes skeletonAnimation {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.chart-loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.7);
  border-radius: 12px;
  z-index: 10;
}

.dark-chart .chart-loading-overlay {
  background-color: rgba(30, 30, 30, 0.7);
}

.title-container {
  position: relative;
  display: inline-block;
  padding-bottom: 4px;
}

.title-text {
  position: relative;
  z-index: 1;
  font-weight: 500;
}

.title-underline {
  position: absolute;
  left: 0;
  bottom: 0;
  height: 2px;
  width: 40%;
  background-color: #1976d2;
  transition: width 0.3s ease;
}

.sales-card:hover .title-underline {
  width: 100%;
  animation: underlineExpand 1s ease forwards;
}

@keyframes underlineExpand {
  0% {
    width: 40%;
  }
  50% {
    width: 100%;
  }
  70% {
    width: 90%;
  }
  100% {
    width: 100%;
  }
}

.accuracy-chip {
  animation: fadeInUp 0.5s ease;
  transition: all 0.3s ease;
  transform-origin: right center;
}

.accuracy-text {
  font-size: 0.8rem;
  font-weight: 500;
}

.accuracy-chip:hover {
  transform: scale(1.05);
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.chart-metrics {
  animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.metric-card {
  padding: 12px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  overflow: hidden;
  position: relative;
  min-height: 80px;
}

.dark-metric-card {
  background-color: rgba(40, 40, 40, 0.95);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.metric-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.metric-icon-container {
  margin-right: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: rgba(25, 118, 210, 0.1);
}

.metric-content {
  flex: 1;
}

.metric-title {
  font-size: 0.8rem;
  color: rgba(0, 0, 0, 0.6);
  margin-bottom: 4px;
}

.dark-metric-card .metric-title {
  color: rgba(255, 255, 255, 0.6);
}

.metric-value {
  font-size: 1.1rem;
  font-weight: 600;
}

.positive-value {
  color: #4caf50;
}

.neutral-value {
  color: #ff9800;
}

.negative-value {
  color: #f44336;
}

.time-period-selector {
  display: flex;
  justify-content: center;
  padding: 8px 0;
}

.time-range-chip {
  transition: all 0.3s ease;
  font-size: 0.8rem;
  margin: 0 4px;
}

.time-range-chip:hover:not(.active-time-range) {
  transform: translateY(-2px);
}

.active-time-range {
  font-weight: 500;
  background-color: rgba(25, 118, 210, 0.12);
  border: 1px solid rgba(25, 118, 210, 0.3);
  color: rgba(0, 0, 0, 0.87) !important; /* 确保文字颜色始终清晰可见 */
}

.dark-card .active-time-range {
  color: rgba(255, 255, 255, 0.87) !important; /* 深色模式下的文字颜色 */
}

.action-btn {
  transition: all 0.3s ease;
  opacity: 0.7;
  margin: 0 4px;
}

.action-btn:hover {
  opacity: 1;
  transform: translateY(-2px);
}

.spin-animation {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.toggle-btn {
  transition: transform 0.3s ease;
}

.details-panel {
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.details-section {
  margin-bottom: 16px;
}

.details-title {
  display: flex;
  align-items: center;
  font-size: 0.9rem;
  font-weight: 500;
  margin-bottom: 8px;
  color: rgba(0, 0, 0, 0.7);
}

.dark-card .details-title {
  color: rgba(255, 255, 255, 0.7);
}

.details-content {
  background-color: rgba(0, 0, 0, 0.02);
  border-radius: 8px;
  overflow: hidden;
}

.dark-card .details-content {
  background-color: rgba(255, 255, 255, 0.05);
}

.dark-list {
  background-color: transparent !important;
  color: rgba(255, 255, 255, 0.85);
}

.trend-content {
  background-color: rgba(0, 0, 0, 0.02);
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.dark-card .trend-content {
  background-color: rgba(255, 255, 255, 0.05);
}

.trend-indicator {
  display: flex;
  align-items: center;
  gap: 12px;
}

.trend-arrow {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.dark-card .trend-arrow {
  background-color: rgba(255, 255, 255, 0.1);
}

.trend-up {
  color: #4caf50;
  animation: pulseUp 2s infinite;
}

.trend-down {
  color: #f44336;
  animation: pulseDown 2s infinite;
}

.trend-stable {
  color: #ff9800;
}

@keyframes pulseUp {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

@keyframes pulseDown {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(5px);
  }
}

.trend-text {
  font-size: 1rem;
  font-weight: 500;
}

.trend-message {
  font-size: 0.9rem;
  line-height: 1.5;
  color: rgba(0, 0, 0, 0.6);
  padding: 8px 0;
  border-top: 1px dashed rgba(0, 0, 0, 0.1);
}

.dark-card .trend-message {
  color: rgba(255, 255, 255, 0.6);
  border-top: 1px dashed rgba(255, 255, 255, 0.1);
}

/* 增加动画效果 */
.animate-in {
  animation: cardAppear 0.6s cubic-bezier(0.22, 1, 0.36, 1);
}

@keyframes cardAppear {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* 移动端优化 */
@media (max-width: 600px) {
  .sales-forecast-container {
    padding: 8px;
  }

  .metric-card {
    min-height: 70px;
    padding: 10px;
  }

  .metric-title {
    font-size: 0.7rem;
  }

  .metric-value {
    font-size: 0.95rem;
  }

  .metric-col {
    margin-bottom: 8px;
  }

  .details-title {
    font-size: 0.8rem;
  }

  .trend-text {
    font-size: 0.9rem;
  }

  .trend-message {
    font-size: 0.8rem;
  }

  .trend-arrow {
    width: 32px;
    height: 32px;
  }
}

/* 水墨效果 */
.sales-card::after {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, rgba(0, 0, 0, 0) 70%);
  transform: rotate(45deg);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.6s ease;
  z-index: -1;
}

.sales-card:hover::after {
  opacity: 0.3;
}

/* 夜间模式焦点指示器 */
.dark-card .v-btn:focus::before,
.dark-card .v-chip:focus::before {
  opacity: 0.12 !important;
}

.selected-time-range {
  background-color: rgba(25, 118, 210, 0.12) !important;
}
</style>
