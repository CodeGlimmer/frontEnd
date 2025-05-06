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

// 反应式存储左右索引位置
const leftIndex = ref(0)
const rightIndex = ref(0)

// 已确认的索引位置（用于比较变化）
const confirmedLeftIndex = ref(0)
const confirmedRightIndex = ref(0)

// 范围滑块的值
const rangeValue = ref([0, 0])

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
  // 如果标签太长，截断它
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

  // 确保最后一个刻度存在
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
    // 使用props中提供的初始索引，或者使用默认计算值
    if (props.initialLeftIndex !== null && props.initialRightIndex !== null) {
      // 确保提供的索引在有效范围内
      leftIndex.value = Math.max(0, Math.min(props.initialLeftIndex, dataLen - 2))
      rightIndex.value = Math.max(
        leftIndex.value + 1,
        Math.min(props.initialRightIndex, dataLen - 1),
      )
    } else {
      // 使用默认计算值
      leftIndex.value = Math.max(0, Math.floor(dataLen * 0.25))
      rightIndex.value = Math.min(dataLen - 1, Math.floor(dataLen * 0.75))
    }
  }

  // 同步范围滑块的值
  rangeValue.value = [leftIndex.value, rightIndex.value]

  // 保存确认的索引值
  confirmedLeftIndex.value = leftIndex.value
  confirmedRightIndex.value = rightIndex.value
}

// 检测当前设备是否为移动设备
const checkMobileDevice = () => {
  isMobile.value = window.innerWidth < 768
}

// 初始化图表
const initChart = () => {
  if (!chartRef.value) return

  checkMobileDevice()

  // 如果图表已存在，销毁它
  if (chartInstance.value) {
    chartInstance.value.dispose()
    chartInstance.value = null
  }

  // 在创建新图表实例前先确保容器尺寸已设置正确
  updateChartSize()

  try {
    // 创建新的图表实例
    chartInstance.value = echarts.init(chartRef.value, null, {
      renderer: 'canvas',
      useDirtyRect: true,
    })

    // 更新图表数据和配置
    updateChart()

    // 添加窗口大小变化的监听器
    // window.addEventListener('resize', handleResize)

    // 添加ResizeObserver来监听容器大小的变化
    if (window.ResizeObserver) {
      const resizeObserver = new ResizeObserver(
        debounce(() => {
          if (chartContainerRef.value && chartInstance.value) {
            updateChart()
          }
        }, 100),
      )

      if (chartContainerRef.value) {
        resizeObserver.observe(chartContainerRef.value)
      }

      // 在组件销毁时清理
      // onBeforeUnmount(() => {
      //   resizeObserver.disconnect()
      // })
    }
  } catch (error) {
    console.error('Chart initialization error:', error)
  }
}

// 防抖函数
const debounce = (fn, delay) => {
  let timer = null
  return function () {
    const context = this
    const args = arguments
    clearTimeout(timer)
    timer = setTimeout(() => {
      fn.apply(context, args)
    }, delay)
  }
}

// 更新图表大小
const updateChartSize = () => {
  if (!chartContainerRef.value) return

  // 检查设备类型
  checkMobileDevice()

  const containerWidth = chartContainerRef.value.clientWidth
  // 移动端调整高度，确保视图更舒适
  const containerHeight = isMobile.value
    ? Math.min(containerWidth * 0.8, 280)
    : Math.min(containerWidth * 0.6, 320)

  // 设置图表容器的明确高度
  chartContainerRef.value.style.height = containerHeight + 'px'

  // 设置图表的尺寸
  if (chartRef.value) {
    chartRef.value.style.width = '100%'
    chartRef.value.style.height = '100%'
  }
}

// 节流处理的resize函数
let resizeTimeout
const handleResize = () => {
  if (resizeTimeout) {
    clearTimeout(resizeTimeout)
  }

  resizeTimeout = setTimeout(() => {
    updateChartSize()
    if (chartInstance.value) {
      chartInstance.value.resize()
      updateChart()
    }
  }, 100)
}

// 确认选择
const confirmSelection = () => {
  // 更新已确认的索引
  confirmedLeftIndex.value = leftIndex.value
  confirmedRightIndex.value = rightIndex.value

  // 发送确认事件
  emit('range-confirmed', {
    leftIndex: leftIndex.value,
    rightIndex: rightIndex.value,
  })
}

// 范围滑块变化处理器
const handleRangeChange = (value) => {
  leftIndex.value = value[0]
  rightIndex.value = value[1]
  updateChart()
}

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
      areaColor: [
        { offset: 0, color: 'rgba(208, 188, 255, 0.4)' },
        { offset: 0.8, color: 'rgba(208, 188, 255, 0.1)' },
        { offset: 1, color: 'rgba(208, 188, 255, 0.02)' },
      ],
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
      areaColor: [
        { offset: 0, color: 'rgba(103, 80, 164, 0.4)' },
        { offset: 0.8, color: 'rgba(103, 80, 164, 0.1)' },
        { offset: 1, color: 'rgba(103, 80, 164, 0.02)' },
      ],
    }
  }
}

// 更新图表数据和配置
const updateChart = () => {
  if (!chartInstance.value) return

  try {
    // 获取当前主题颜色
    const themeColors = getThemeColors()

    // 根据设备类型调整配置
    const labelRotation = isMobile.value ? 75 : props.labels.length > 12 ? 45 : 0
    const labelInterval = isMobile.value
      ? Math.max(0, Math.ceil(props.labels.length / 10) - 1)
      : Math.max(0, Math.ceil(props.labels.length / 20) - 1)

    // 定义标记区域（预测区间）
    const markArea = {
      itemStyle: {
        color: themeColors.markAreaColor,
        borderColor: 'transparent',
        borderWidth: 0,
      },
      data: [
        [
          {
            name: '预测区间',
            xAxis: leftIndex.value,
          },
          {
            xAxis: rightIndex.value,
          },
        ],
      ],
      silent: true,
    }

    // 准备标记线数据 - 优化后的竖直线样式
    const markLines = [
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
        emphasis: {
          lineStyle: {
            width: 3,
            shadowBlur: 6,
            shadowColor: themeColors.primaryColor,
          },
        },
        label: {
          show: false,
        },
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
        emphasis: {
          lineStyle: {
            width: 3,
            shadowBlur: 6,
            shadowColor: themeColors.secondaryColor,
          },
        },
        label: {
          show: false,
        },
        xAxis: rightIndex.value,
      },
    ]

    const option = {
      animation: true,
      animationDuration: 800,
      animationEasing: 'cubicInOut',
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
              if (isMobile.value) {
                if (value.length > 6) {
                  return value.substring(0, 6) + '..'
                }
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
          axisLine: {
            show: false,
          },
          axisTick: {
            show: false,
          },
          axisLabel: {
            color: themeColors.textColor,
          },
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
          zoomLock: true, // 锁定缩放功能以避免出现 coordSys undefined 错误
          throttle: 100,
          zoomOnMouseWheel: false, // 禁用鼠标滚轮缩放
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
          emphasis: {
            scale: true,
            focus: 'series',
            itemStyle: {
              shadowBlur: 16,
              shadowColor: isDarkMode.value
                ? 'rgba(208, 188, 255, 0.4)'
                : 'rgba(103, 80, 164, 0.4)',
            },
          },
          itemStyle: {
            color: themeColors.primaryColor,
            borderColor: isDarkMode.value ? '#1C1B1F' : '#fff',
            borderWidth: 2,
          },
          lineStyle: {
            width: isMobile.value ? 4 : 3,
            cap: 'round',
            join: 'round',
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                {
                  offset: 0,
                  color: isDarkMode.value ? '#D0BCFF' : '#9A82DB',
                },
                {
                  offset: 1,
                  color: isDarkMode.value ? '#9A82DB' : '#6750A4',
                },
              ],
            },
            shadowColor: isDarkMode.value ? 'rgba(208, 188, 255, 0.2)' : 'rgba(103, 80, 164, 0.2)',
            shadowBlur: 10,
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: themeColors.areaColor,
            },
            opacity: 0.8,
          },
          markArea: markArea,
          markLine: {
            silent: true,
            data: markLines,
            animationDuration: 300,
          },
        },
      ],
    }

    // 设置图表选项
    chartInstance.value.setOption(option, true)
  } catch (error) {
    console.error('Error updating chart:', error)
  }
}

// 监听主题变化
watch(
  () => isDarkMode.value,
  () => {
    // 主题变化时更新图表
    nextTick(() => {
      updateChart()
    })
  },
)

// 监听props变化
watch(
  () => [props.labels, props.values],
  () => {
    // 当数据发生变化时重新初始化图表
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
  // 使用nextTick确保DOM已经渲染完成
  nextTick(() => {
    // 给DOM元素一些时间来设置布局
    setTimeout(() => {
      initChart()
    }, 100) // 增加延迟确保DOM完全准备好
  })
})

// 组件卸载前清理
onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  clearTimeout(resizeTimeout)

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
  will-change: transform, box-shadow;
  border-radius: 28px !important;
}

.timeline-selector-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.14) !important;
  transform: translateY(-2px);
}

.chart-container {
  width: 100%;
  /* display: flex;
  justify-content: center; */
  position: relative;
  border-radius: 24px;
  overflow: hidden;
  background-color: #f7f2fa; /* 浅色模式背景 */
  transition:
    background-color 0.3s ease,
    height 0.3s ease;
}

.chart-container.dark-mode {
  background-color: #2d2c33; /* 深色模式背景 */
}

.chart {
  width: 100%;
  height: 100%;
  position: relative;
  transition: all 0.3s ease;
}

@media (max-width: 767px) {
  .chart-container {
    max-height: 280px;
  }
}

.range-display {
  position: relative;
  transition: all 0.3s ease;
}

.range-slider-container {
  padding: 0 12px;
  margin-top: 16px;
}

.range-label-container {
  padding: 0 12px;
}

.v-chip {
  transition: all 0.3s cubic-bezier(0.2, 0, 0, 1);
  font-weight: 500;
  letter-spacing: 0.1px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
}

.v-chip:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
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
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  letter-spacing: 0.25px;
  font-weight: 500;
}

.confirm-btn:not(:disabled):hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

/* Material Design 3 样式优化 */
:deep(.v-slider-thumb__surface) {
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2) !important;
  border: 3px solid var(--v-theme-surface) !important;
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
}

.slider-label {
  font-size: 13px;
  font-weight: 600;
  padding: 2px 4px;
  white-space: nowrap;
}

:deep(.v-card-title) {
  letter-spacing: 0.15px;
  font-weight: 500;
}

:deep(.v-tooltip .v-overlay__content) {
  background: transparent;
  box-shadow: none;
}

@media (max-width: 600px) {
  .v-btn-group {
    flex-direction: column;
    width: 100%;
  }

  .confirm-btn {
    margin-top: 12px;
    width: 100%;
  }
}
</style>
