<template>
  <v-card class="timeline-selector-card" elevation="2" rounded="lg" :theme="currentTheme">
    <v-card-title class="d-flex align-center py-4 px-6">
      <v-icon color="primary" class="mr-3" size="large">mdi-chart-timeline-variant</v-icon>
      <span class="text-h6 font-weight-medium">时间轴选择器</span>
      <v-spacer></v-spacer>
      <v-tooltip location="bottom">
        <template v-slot:activator="{ props }">
          <v-btn
            v-bind="props"
            variant="text"
            icon="mdi-information-outline"
            color="primary"
            size="small"
          ></v-btn>
        </template>
        <v-card class="pa-2" elevation="4" rounded="lg" :theme="currentTheme">
          <span>拖动滑块选择时间范围，蓝色区域为预测区间</span>
        </v-card>
      </v-tooltip>
    </v-card-title>

    <v-divider></v-divider>

    <v-card-text class="px-4 pt-6 pb-4">
      <!-- 图表容器 -->
      <div class="tw:flex tw:justify-center">
        <div ref="chartContainerRef" class="chart-container" :class="{ 'dark-mode': isDarkMode }">
          <div ref="chartRef" class="chart tw:flex tw:justify-center"></div>
        </div>
      </div>

      <!-- 时间范围展示 -->
      <div class="range-display mt-4 px-2 d-flex align-center flex-wrap">
        <v-chip color="info" variant="elevated" class="mr-3 mb-2 font-weight-medium" size="large">
          <v-icon start>mdi-calendar-range</v-icon>
          预测区间
        </v-chip>

        <v-chip-group class="range-chips">
          <v-chip color="primary" variant="elevated" class="mr-3 mb-2" size="large">
            {{ labels[leftIndex] || '' }}
          </v-chip>
          <span class="range-separator ma-1 mt-3 me-3">至</span>
          <v-chip color="secondary" variant="elevated" class="mb-2" size="large">
            {{ labels[rightIndex] || '' }}
          </v-chip>
        </v-chip-group>

        <v-spacer></v-spacer>

        <v-btn
          color="primary"
          variant="tonal"
          rounded="pill"
          class="confirm-btn mb-2"
          :disabled="!hasChanges"
          @click="confirmSelection"
        >
          <v-icon start>mdi-check</v-icon>
          确认选择
        </v-btn>
      </div>

      <!-- 合并的范围滑块 -->
      <div class="range-slider-container mt-6 px-2">
        <div class="range-label-container d-flex justify-space-between mb-2">
          <span class="text-body-2 text-primary font-weight-medium">{{ labels[0] || '' }}</span>
          <span class="text-body-2 text-secondary font-weight-medium">{{
            labels[labels.length - 1] || ''
          }}</span>
        </div>
        <v-range-slider
          v-model="rangeValue"
          :max="labels.length - 1"
          :min="0"
          :step="1"
          thumb-label="always"
          color="primary"
          track-color="grey-lighten-3"
          track-fill-color="primary-lighten-3"
          density="comfortable"
          :disabled="labels.length <= 1"
          :thumb-size="28"
          show-ticks="always"
          :ticks="generateTicks()"
          @update:model-value="handleRangeChange"
        >
          <template v-slot:thumb-label="{ modelValue, index }">
            <div class="slider-label" :class="index === 0 ? 'primary--text' : 'secondary--text'">
              {{
                modelValue >= 0 && labels[modelValue] ? formatThumbLabel(labels[modelValue]) : ''
              }}
            </div>
          </template>
        </v-range-slider>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
/**
 * @component TimelineSelector
 *
 * @description 交互式时间轴选择器组件，提供范围滑块用于选择日期范围，
 * 使用可视化区域突出显示预测区间，符合Material You设计风格。
 *
 * @props {string[]} labels - 日期标签数组，以字符串格式提供
 * @props {number[]} values - 对应的数值数组
 * @props {number} initialLeftIndex - 初始左侧索引（可选，默认为数据长度的25%位置）
 * @props {number} initialRightIndex - 初始右侧索引（可选，默认为数据长度的75%位置）
 *
 * @emits {Object} range-confirmed - 用户确认选择范围时触发
 *  - leftIndex {number} - 左侧时间点的索引值（从0开始）
 *  - rightIndex {number} - 右侧时间点的索引值（从0开始）
 */

import { ref, onMounted, watch, nextTick, onBeforeUnmount, computed } from 'vue'
import * as echarts from 'echarts/core'
import { LineChart } from 'echarts/charts'
import {
  GridComponent,
  TooltipComponent,
  DataZoomComponent,
  MarkAreaComponent,
  MarkLineComponent,
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { useThemeStore } from '@/stores'

// 注册ECharts组件
echarts.use([
  LineChart,
  GridComponent,
  TooltipComponent,
  DataZoomComponent,
  MarkAreaComponent,
  MarkLineComponent,
  CanvasRenderer,
])

const props = defineProps({
  labels: {
    type: Array,
    required: true,
    validator: (val) => val.every((item) => typeof item === 'string'),
  },
  values: {
    type: Array,
    required: true,
    validator: (val) => val.every((item) => typeof item === 'number'),
  },
  initialLeftIndex: {
    type: Number,
    default: null,
  },
  initialRightIndex: {
    type: Number,
    default: null,
  },
})

const emit = defineEmits(['range-confirmed'])

// 获取主题信息
const themeStore = useThemeStore()
const currentTheme = computed(() => themeStore.theme)
const isDarkMode = computed(() => currentTheme.value === 'dark')

const chartContainerRef = ref(null)
const chartRef = ref(null)
const chartInstance = ref(null)
let resizeObserver = null

// 反应式存储左右索引位置
const leftIndex = ref(0)
const rightIndex = ref(0)

// 已确认的索引位置（用于比较变化）
const confirmedLeftIndex = ref(0)
const confirmedRightIndex = ref(0)

// 范围滑块的值
const rangeValue = ref([0, 0])

// 优化的节流函数，用于滑块拖动
const throttleChart = (fn, delay) => {
  let timer = null
  let lastExecTime = 0

  return function (...args) {
    const currentTime = Date.now()

    if (currentTime - lastExecTime > delay) {
      lastExecTime = currentTime
      fn.apply(this, args)
    } else {
      clearTimeout(timer)
      timer = setTimeout(
        () => {
          lastExecTime = Date.now()
          fn.apply(this, args)
        },
        delay - (currentTime - lastExecTime),
      )
    }
  }
}

// 防抖函数用于resize
const debounce = (fn, delay) => {
  let timer = null
  return function (...args) {
    clearTimeout(timer)
    timer = setTimeout(() => fn.apply(this, args), delay)
  }
}

// 计算是否有未确认的变更
const hasChanges = computed(() => {
  return (
    leftIndex.value !== confirmedLeftIndex.value || rightIndex.value !== confirmedRightIndex.value
  )
})

// 检测是否为移动设备
const isMobile = ref(false)

// 滑动条thumb label格式化函数
const formatThumbLabel = (label) => {
  if (!label) return ''
  if (label.length > 8) {
    return label.substring(0, 8) + '...'
  }
  return label
}

// 生成刻度
const generateTicks = () => {
  if (props.labels.length <= 5) {
    return { 0: '', [props.labels.length - 1]: '' }
  }

  const ticks = {}
  const interval = Math.ceil(props.labels.length / 5)

  for (let i = 0; i < props.labels.length; i += interval) {
    if (i === 0 || i === props.labels.length - 1 || i % interval === 0) {
      ticks[i] = ''
    }
  }

  ticks[props.labels.length - 1] = ''
  return ticks
}

// 初始化默认索引位置
const initializeIndexPositions = () => {
  const dataLen = props.labels.length

  if (dataLen <= 1) {
    leftIndex.value = 0
    rightIndex.value = dataLen > 0 ? 0 : 0
  } else {
    if (props.initialLeftIndex !== null && props.initialRightIndex !== null) {
      leftIndex.value = Math.max(0, Math.min(props.initialLeftIndex, dataLen - 2))
      rightIndex.value = Math.max(
        leftIndex.value + 1,
        Math.min(props.initialRightIndex, dataLen - 1),
      )
    } else {
      leftIndex.value = Math.max(0, Math.floor(dataLen * 0.25))
      rightIndex.value = Math.min(dataLen - 1, Math.floor(dataLen * 0.75))
    }
  }

  rangeValue.value = [leftIndex.value, rightIndex.value]
  confirmedLeftIndex.value = leftIndex.value
  confirmedRightIndex.value = rightIndex.value
}

// 检测当前设备是否为移动设备
const checkMobileDevice = () => {
  isMobile.value = window.innerWidth < 768
}

// 更新图表大小
const updateChartSize = () => {
  if (!chartContainerRef.value) return

  checkMobileDevice()

  const containerWidth = chartContainerRef.value.clientWidth
  const containerHeight = isMobile.value
    ? Math.min(containerWidth * 0.8, 280)
    : Math.min(containerWidth * 0.6, 320)

  chartContainerRef.value.style.height = containerHeight + 'px'

  if (chartRef.value) {
    chartRef.value.style.width = '100%'
    chartRef.value.style.height = '100%'
  }
}

// 初始化图表
const initChart = () => {
  if (!chartRef.value) return

  updateChartSize()

  if (chartInstance.value) {
    chartInstance.value.dispose()
    chartInstance.value = null
  }

  try {
    chartInstance.value = echarts.init(chartRef.value, null, {
      renderer: 'canvas',
      useDirtyRect: true,
    })

    updateChart()

    if (window.ResizeObserver) {
      const debouncedResizeCallback = debounce(() => {
        if (chartContainerRef.value && chartInstance.value) {
          updateChartSize()
          chartInstance.value.resize()
          updateChart()
        }
      }, 150)

      resizeObserver = new ResizeObserver(debouncedResizeCallback)

      if (chartContainerRef.value) {
        resizeObserver.observe(chartContainerRef.value)
      }
    }
  } catch (error) {
    console.error('Chart initialization error:', error)
  }
}

// 确认选择
const confirmSelection = () => {
  confirmedLeftIndex.value = leftIndex.value
  confirmedRightIndex.value = rightIndex.value

  emit('range-confirmed', {
    leftIndex: leftIndex.value,
    rightIndex: rightIndex.value,
  })
}

// 优化的范围滑块变化处理器
const handleRangeChange = throttleChart((value) => {
  leftIndex.value = value[0]
  rightIndex.value = value[1]
  updateChart()
}, 100) // 提高节流时间到100ms，减少更新频率

// 获取基于当前主题的颜色配置
const getThemeColors = () => {
  if (isDarkMode.value) {
    return {
      backgroundColor: '#1C1B1F',
      textColor: '#E6E1E5',
      axisColor: 'rgba(255, 255, 255, 0.25)',
      splitLineColor: 'rgba(255, 255, 255, 0.08)',
      tooltipBackground: 'rgba(30, 30, 30, 0.95)',
      tooltipTextColor: '#E6E1E5',
      primaryColor: '#D0BCFF',
      secondaryColor: '#CCC2DC',
      markAreaColor: 'rgba(208, 188, 255, 0.15)',
    }
  } else {
    return {
      backgroundColor: '#FFFBFF',
      textColor: '#1C1B1F',
      axisColor: 'rgba(0, 0, 0, 0.25)',
      splitLineColor: 'rgba(0, 0, 0, 0.08)',
      tooltipBackground: 'rgba(255, 255, 255, 0.95)',
      tooltipTextColor: '#1C1B1F',
      primaryColor: '#6750A4',
      secondaryColor: '#B93E94',
      markAreaColor: 'rgba(103, 80, 164, 0.15)',
    }
  }
}

// 优化的更新图表函数
const updateChart = () => {
  if (!chartInstance.value) return

  try {
    const themeColors = getThemeColors()
    const labelRotation = isMobile.value ? 75 : props.labels.length > 12 ? 45 : 0
    const labelInterval = isMobile.value
      ? Math.max(0, Math.ceil(props.labels.length / 10) - 1)
      : Math.max(0, Math.ceil(props.labels.length / 20) - 1)

    const option = {
      animation: false, // 关闭动画提升性能
      backgroundColor: 'transparent',
      grid: {
        left: isMobile.value ? '15%' : '3%',
        right: isMobile.value ? '5%' : '4%',
        bottom: isMobile.value ? '15%' : '10%',
        top: '8%',
        containLabel: true,
      },
      tooltip: {
        trigger: 'axis',
        confine: true,
        formatter: (params) => {
          const dataIndex = params[0].dataIndex
          return `${props.labels[dataIndex]}: ${props.values[dataIndex]}`
        },
        backgroundColor: themeColors.tooltipBackground,
        borderColor: 'rgba(0, 0, 0, 0.1)',
        textStyle: {
          color: themeColors.tooltipTextColor,
        },
        extraCssText:
          'box-shadow: 0 2px 12px rgba(0, 0, 0, 0.12); border-radius: 16px; padding: 12px;',
      },
      xAxis: [
        {
          type: 'category',
          data: props.labels,
          axisLabel: {
            rotate: labelRotation,
            interval: labelInterval,
            formatter: (value) => {
              if (isMobile.value && value.length > 6) {
                return value.substring(0, 6) + '..'
              } else if (props.labels.length > 30 && value.length > 8) {
                return value.substring(0, 8) + '...'
              }
              return value
            },
            color: themeColors.textColor,
          },
          axisLine: {
            lineStyle: {
              color: themeColors.axisColor,
            },
          },
          axisTick: {
            alignWithLabel: true,
            lineStyle: {
              color: themeColors.axisColor,
            },
          },
        },
      ],
      yAxis: [
        {
          type: 'value',
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: { color: themeColors.textColor },
          splitLine: {
            lineStyle: {
              type: 'dashed',
              color: themeColors.splitLineColor,
            },
          },
        },
      ],
      dataZoom: [
        {
          type: 'inside',
          start: 0,
          end: 100,
          zoomLock: true,
          throttle: 200, // 增加节流时间
          zoomOnMouseWheel: false,
          moveOnMouseWheel: false,
          preventDefaultMouseMove: false,
        },
      ],
      series: [
        {
          data: props.values,
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: isMobile.value ? 10 : 8,
          showSymbol: props.values.length < 100,
          itemStyle: {
            color: themeColors.primaryColor,
            borderColor: isDarkMode.value ? '#1C1B1F' : '#fff',
            borderWidth: 2,
          },
          lineStyle: {
            width: isMobile.value ? 4 : 3,
            cap: 'round',
            join: 'round',
            color: themeColors.primaryColor,
          },
          markArea: {
            itemStyle: {
              color: themeColors.markAreaColor,
              borderColor: 'transparent',
              borderWidth: 0,
            },
            data: [[{ name: '预测区间', xAxis: leftIndex.value }, { xAxis: rightIndex.value }]],
            silent: true,
          },
          markLine: {
            silent: true,
            animation: false, // 关闭标记线动画
            data: [
              {
                silent: true,
                symbol: ['circle', 'none'],
                symbolSize: [8, 0],
                lineStyle: {
                  color: themeColors.primaryColor,
                  width: 2,
                  type: 'solid',
                  cap: 'round',
                },
                label: { show: false },
                xAxis: leftIndex.value,
              },
              {
                silent: true,
                symbol: ['circle', 'none'],
                symbolSize: [8, 0],
                lineStyle: {
                  color: themeColors.secondaryColor,
                  width: 2,
                  type: 'solid',
                  cap: 'round',
                },
                label: { show: false },
                xAxis: rightIndex.value,
              },
            ],
          },
        },
      ],
    }

    chartInstance.value.setOption(option, true)
  } catch (error) {
    console.error('Error updating chart:', error)
  }
}

// 监听主题变化
watch(
  () => isDarkMode.value,
  () => {
    nextTick(() => {
      updateChart()
    })
  },
)

// 监听props变化
watch(
  () => [props.labels, props.values],
  () => {
    nextTick(() => {
      initializeIndexPositions()
      if (chartInstance.value) {
        updateChart()
      } else {
        initChart()
      }
    })
  },
  { deep: true },
)

// 组件挂载时
onMounted(() => {
  initializeIndexPositions()
  nextTick(() => {
    setTimeout(() => {
      initChart()
    }, 100)
  })
})

// 组件卸载前清理
onBeforeUnmount(() => {
  if (resizeObserver) {
    resizeObserver.disconnect()
    resizeObserver = null
  }

  if (chartInstance.value) {
    chartInstance.value.dispose()
    chartInstance.value = null
  }
})
</script>

<style scoped>
.timeline-selector-card {
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.2, 0, 0, 1);
  border-radius: 28px !important;
}

.chart-container {
  width: 100%;
  position: relative;
  border-radius: 24px;
  overflow: hidden;
  background-color: #f7f2fa;
  transition: background-color 0.3s ease;
  contain: layout paint;
}

.chart-container.dark-mode {
  background-color: #2d2c33;
}

.chart {
  width: 100%;
  height: 100%;
  position: relative;
}

@media (max-width: 767px) {
  .chart-container {
    max-height: 280px;
  }
}

.range-display {
  position: relative;
}

.range-slider-container {
  padding: 0 12px;
  margin-top: 16px;
}

.range-label-container {
  padding: 0 12px;
}

.v-chip {
  font-weight: 500;
  letter-spacing: 0.1px;
}

.range-separator {
  font-weight: 500;
  color: var(--v-theme-on-surface-variant);
}

.range-chips {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.confirm-btn {
  letter-spacing: 0.25px;
  font-weight: 500;
}

/* 优化滑块性能的样式 */
:deep(.v-slider-thumb) {
  will-change: transform;
  touch-action: none;
}

:deep(.v-slider-thumb__surface) {
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2) !important;
  border: 3px solid var(--v-theme-surface) !important;
  transition: none; /* 移除过渡动画提升性能 */
}

:deep(.v-slider-track__background) {
  height: 8px !important;
  border-radius: 4px !important;
  opacity: 0.2;
}

:deep(.v-slider-track__fill) {
  height: 8px !important;
  border-radius: 4px !important;
}

:deep(.v-slider) {
  margin-top: 24px;
  margin-bottom: 24px;
  touch-action: none;
}

.slider-label {
  font-size: 13px;
  font-weight: 600;
  padding: 2px 4px;
  white-space: nowrap;
}

@media (max-width: 600px) {
  .confirm-btn {
    margin-top: 12px;
    width: 100%;
  }
}
</style>
