<template>
  <v-card class="mx-auto my-4 timeline-chart-card" elevation="2" rounded="lg">
    <v-card-title class="d-flex align-center flex-wrap py-4 px-6">
      <div class="d-flex align-center">
        <v-icon color="primary" class="mr-3" size="large">mdi-chart-timeline-variant</v-icon>
        <span class="text-h6 font-weight-medium">时间轴选择器</span>
      </div>
      <v-spacer></v-spacer>
      <v-tooltip location="bottom">
        <template v-slot:activator="{ props }">
          <v-btn
            v-bind="props"
            variant="text"
            icon="mdi-information-outline"
            color="primary"
            size="small"
            class="ml-2"
          ></v-btn>
        </template>
        <v-card class="pa-2" elevation="4" rounded="lg">
          <span>调整滑动条选择时间范围</span>
        </v-card>
      </v-tooltip>
    </v-card-title>

    <v-divider></v-divider>

    <v-card-text class="px-4 pt-6 pb-4">
      <div ref="chartContainerRef" class="chart-container">
        <div ref="chartRef" class="chart"></div>
      </div>

      <div class="sliders-container mt-4 px-2">
        <!-- 左侧时间点滑动条 -->
        <v-slider
          v-model="leftIndexSlider"
          :max="dataLength - 1"
          :min="0"
          :step="1"
          thumb-label="always"
          color="primary"
          track-color="primary-lighten-4"
          density="comfortable"
          class="mb-2"
          :disabled="dataLength <= 1"
          :thumb-size="28"
          @update:model-value="handleLeftSliderChange"
        >
          <template v-slot:thumb-label="{ modelValue }">
            <div class="slider-label">
              {{
                modelValue >= 0 && labels[modelValue] ? formatThumbLabel(labels[modelValue]) : ''
              }}
            </div>
          </template>
        </v-slider>

        <!-- 右侧时间点滑动条 -->
        <v-slider
          v-model="rightIndexSlider"
          :max="dataLength - 1"
          :min="0"
          :step="1"
          thumb-label="always"
          color="secondary"
          track-color="secondary-lighten-4"
          density="comfortable"
          :disabled="dataLength <= 1"
          :thumb-size="28"
          @update:model-value="handleRightSliderChange"
        >
          <template v-slot:thumb-label="{ modelValue }">
            <div class="slider-label">
              {{
                modelValue >= 0 && labels[modelValue] ? formatThumbLabel(labels[modelValue]) : ''
              }}
            </div>
          </template>
        </v-slider>
      </div>

      <div class="selection-info mt-4 px-2">
        <v-scale-transition>
          <v-chip color="info" variant="elevated" class="mr-3 mb-2 font-weight-medium" size="large">
            预测区间
          </v-chip>
        </v-scale-transition>

        <v-scale-transition>
          <v-chip
            v-if="leftIndex !== null"
            color="primary"
            variant="elevated"
            class="mr-3 mb-2"
            size="large"
          >
            <v-icon start size="small">mdi-arrow-left</v-icon>
            {{ labels[leftIndex] }}
          </v-chip>
        </v-scale-transition>
        <v-scale-transition>
          <v-chip
            v-if="rightIndex !== null"
            color="secondary"
            variant="elevated"
            class="mb-2"
            size="large"
          >
            <v-icon start size="small">mdi-arrow-right</v-icon>
            {{ labels[rightIndex] }}
          </v-chip>
        </v-scale-transition>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
/**
 * @component TimelineChart
 *
 * @description 交互式时间轴图表组件，提供两个滑动条用于选择日期范围。
 * 使用ECharts和Vuetify，遵循Material Design 3风格。
 * 支持动态更新数据，图表会自动重绘。
 *
 * @props {string[]} labels - 日期标签数组，以字符串格式提供
 * @props {number[]} values - 对应的数值数组
 *
 * @emits {Object} range-change - 选择范围变化时触发
 *  - leftIndex {number} - 左侧时间点的索引值（从0开始）
 *  - rightIndex {number} - 右侧时间点的索引值（从0开始）
 *
 * @example
 * <timeline-chart
 *   :labels="['2023-01-01', '2023-01-02', ...]"
 *   :values="[10, 20, ...]"
 *   @range-change="handleRangeChange"
 * />
 */

import { ref, onMounted, watch, nextTick, onBeforeUnmount, computed } from 'vue'
import * as echarts from 'echarts/core'
import { LineChart } from 'echarts/charts'
import {
  GridComponent,
  TooltipComponent,
  DataZoomComponent,
  MarkLineComponent,
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

// 注册ECharts组件
echarts.use([
  LineChart,
  GridComponent,
  TooltipComponent,
  DataZoomComponent,
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
})

const emit = defineEmits(['range-change'])

const chartContainerRef = ref(null)
const chartRef = ref(null)
const chartInstance = ref(null)

// 使用computed保存当前数据，以便于比较变化
const currentLabels = computed(() => props.labels)
// const currentValues = computed(() => props.values)

// 反应式存储左右索引位置
const leftIndex = ref(null)
const rightIndex = ref(null)

// 对应的滑动条值
const leftIndexSlider = ref(0)
const rightIndexSlider = ref(0)

// 数据长度的计算属性
const dataLength = computed(() => props.labels.length)

// 计算宽度和单位像素
const chartWidth = ref(0)
const chartHeight = ref(0)

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

// 初始化默认索引位置
const initializeIndexPositions = () => {
  const dataLen = dataLength.value
  if (dataLen > 0) {
    // 如果是首次初始化或数据长度有变化
    if (leftIndex.value === null || rightIndex.value === null) {
      // 先使用默认值，等数据加载完成后再设置固定值
      leftIndex.value = Math.max(0, Math.floor(dataLen * 0.25))
      rightIndex.value = Math.min(dataLen - 1, Math.floor(dataLen * 0.75))
    } else {
      // 如果已有选择，尝试维持相对位置
      const oldPercentLeft = leftIndex.value / (dataLen - (rightIndex.value - leftIndex.value))
      const oldPercentRight = rightIndex.value / (dataLen - (rightIndex.value - leftIndex.value))

      // 计算新的索引位置，保持相对百分比位置
      leftIndex.value = Math.min(Math.max(0, Math.floor(oldPercentLeft * dataLen)), dataLen - 2)
      rightIndex.value = Math.min(
        Math.max(leftIndex.value + 1, Math.floor(oldPercentRight * dataLen)),
        dataLen - 1,
      )
    }

    // 同步滑动条的值
    leftIndexSlider.value = leftIndex.value
    rightIndexSlider.value = rightIndex.value
  }
}

// 监听数据加载
watch(
  dataLength,
  (newLength) => {
    if (newLength > 700) {
      // 只有当数据长度足够时才设置固定的500和700
      leftIndex.value = 500
      rightIndex.value = 700

      // 同步滑动条的值
      leftIndexSlider.value = leftIndex.value
      rightIndexSlider.value = rightIndex.value

      // 更新图表
      updateChart()

      // 通知父组件新的选中范围
      emit('range-change', {
        leftIndex: leftIndex.value,
        rightIndex: rightIndex.value,
      })
    }
  },
  { immediate: true },
)
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
  }

  chartInstance.value = echarts.init(chartRef.value, null, {
    renderer: 'canvas',
    useDirtyRect: true,
  })

  updateChartSize()
  updateChart()

  window.addEventListener('resize', handleResize)
}

// 更新图表大小
const updateChartSize = () => {
  if (!chartContainerRef.value || !chartInstance.value) return

  // 检查设备类型
  checkMobileDevice()

  const containerWidth = chartContainerRef.value.clientWidth
  // 移动端调整高度，确保视图更舒适
  const containerHeight = isMobile.value
    ? Math.min(containerWidth * 0.8, 280)
    : Math.min(containerWidth * 0.6, 320)

  chartWidth.value = containerWidth
  chartHeight.value = containerHeight
  chartRef.value.style.width = containerWidth + 'px'
  chartRef.value.style.height = containerHeight + 'px'
  chartInstance.value.resize()
}

// 节流处理的resize函数
let resizeTimeout
const handleResize = () => {
  clearTimeout(resizeTimeout)
  resizeTimeout = setTimeout(() => {
    updateChartSize()
    checkMobileDevice()
    updateChart()
  }, 100)
}

// 左侧滑动条变化处理器
const handleLeftSliderChange = (value) => {
  // 确保左侧不超过右侧
  if (value >= rightIndexSlider.value) {
    leftIndexSlider.value = rightIndexSlider.value - 1
    return
  }

  leftIndex.value = value
  updateChart()

  emit('range-change', {
    leftIndex: leftIndex.value,
    rightIndex: rightIndex.value,
  })
}

// 右侧滑动条变化处理器
const handleRightSliderChange = (value) => {
  // 确保右侧不低于左侧
  if (value <= leftIndexSlider.value) {
    rightIndexSlider.value = leftIndexSlider.value + 1
    return
  }

  rightIndex.value = value
  updateChart()

  emit('range-change', {
    leftIndex: leftIndex.value,
    rightIndex: rightIndex.value,
  })
}

// 更新图表数据和配置
const updateChart = () => {
  if (!chartInstance.value) return

  // 根据设备类型调整配置
  const labelRotation = isMobile.value ? 75 : props.labels.length > 12 ? 45 : 0
  const labelInterval = isMobile.value
    ? Math.max(0, Math.ceil(props.labels.length / 10) - 1)
    : Math.max(0, Math.ceil(props.labels.length / 20) - 1)

  // 准备标记线数据
  const markLines = []

  // 只有当索引有效时才添加标记线
  if (leftIndex.value !== null && leftIndex.value >= 0 && leftIndex.value < props.labels.length) {
    markLines.push({
      symbol: ['none', 'none'],
      lineStyle: {
        color: '#6750A4', // MD3 主色调
        width: 2,
        type: 'solid',
      },
      label: {
        show: false,
      },
      xAxis: leftIndex.value,
    })
  }

  if (
    rightIndex.value !== null &&
    rightIndex.value >= 0 &&
    rightIndex.value < props.labels.length
  ) {
    markLines.push({
      symbol: ['none', 'none'],
      lineStyle: {
        color: '#B93E94', // MD3 次要色调
        width: 2,
        type: 'solid',
      },
      label: {
        show: false,
      },
      xAxis: rightIndex.value,
    })
  }

  const option = {
    animation: true,
    animationDuration: 800,
    animationEasing: 'cubicInOut',
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
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: 'rgba(0, 0, 0, 0.1)',
      textStyle: {
        color: '#1C1B1F', // MD3 文本色
      },
      extraCssText:
        'box-shadow: 0 2px 12px rgba(0, 0, 0, 0.12); border-radius: 16px; padding: 12px;',
    },
    xAxis: {
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
        color: '#79747E', // MD3 文本辅助色
      },
      axisLine: {
        lineStyle: {
          color: 'rgba(0, 0, 0, 0.25)',
        },
      },
      axisTick: {
        alignWithLabel: true,
        lineStyle: {
          color: 'rgba(0, 0, 0, 0.25)',
        },
      },
    },
    yAxis: {
      type: 'value',
      axisLine: {
        show: false,
      },
      axisTick: {
        show: false,
      },
      axisLabel: {
        color: '#79747E', // MD3 文本辅助色
      },
      splitLine: {
        lineStyle: {
          type: 'dashed',
          color: 'rgba(0, 0, 0, 0.08)',
        },
      },
    },
    dataZoom: [
      {
        type: 'inside',
        start: 0,
        end: 100,
        zoomLock: false,
        throttle: 100,
        zoomOnMouseWheel: true,
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
        symbolSize: isMobile.value ? 10 : 8, // 移动端增大点的大小
        showSymbol: props.values.length < 100,
        emphasis: {
          scale: true,
          focus: 'series',
          itemStyle: {
            shadowBlur: 16,
            shadowColor: 'rgba(103, 80, 164, 0.4)', // MD3 主色调阴影
          },
        },
        itemStyle: {
          color: '#6750A4', // MD3 主色调
          borderColor: '#fff',
          borderWidth: 2,
        },
        lineStyle: {
          width: isMobile.value ? 4 : 3, // 移动端增粗线条
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
                color: '#9A82DB', // MD3 浅色调
              },
              {
                offset: 1,
                color: '#6750A4', // MD3 主色调
              },
            ],
          },
          shadowColor: 'rgba(103, 80, 164, 0.2)', // MD3 主色调阴影
          shadowBlur: 10,
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              {
                offset: 0,
                color: 'rgba(103, 80, 164, 0.4)', // MD3 主色调
              },
              {
                offset: 0.8,
                color: 'rgba(103, 80, 164, 0.1)', // MD3 主色调
              },
              {
                offset: 1,
                color: 'rgba(103, 80, 164, 0.02)', // MD3 主色调
              },
            ],
          },
          opacity: 0.8,
        },
        markLine: {
          silent: true,
          data: markLines,
          animationDuration: 300,
        },
      },
    ],
  }

  chartInstance.value.setOption(option, true) // 设置true选项强制重绘
}

// 重绘整个图表
const rebuildChart = () => {
  // 保存当前选中的区间索引（相对位置）
  const oldLeftRatio =
    leftIndex.value !== null ? leftIndex.value / (currentLabels.value.length - 1 || 1) : 0.25
  const oldRightRatio =
    rightIndex.value !== null ? rightIndex.value / (currentLabels.value.length - 1 || 1) : 0.75

  // 根据新数据长度计算新的索引位置
  const newDataLength = props.labels.length
  if (newDataLength > 0) {
    leftIndex.value = Math.floor(oldLeftRatio * (newDataLength - 1))
    rightIndex.value = Math.max(
      leftIndex.value + 1,
      Math.floor(oldRightRatio * (newDataLength - 1)),
    )

    // 确保右索引不超过数组长度
    rightIndex.value = Math.min(rightIndex.value, newDataLength - 1)

    // 同步滑动条的值
    leftIndexSlider.value = leftIndex.value
    rightIndexSlider.value = rightIndex.value
  } else {
    // 如果没有数据，重置索引
    leftIndex.value = null
    rightIndex.value = null
    leftIndexSlider.value = 0
    rightIndexSlider.value = 0
  }

  // 完全重新初始化图表
  nextTick(() => {
    initChart()

    // 通知父组件新的选中范围
    if (leftIndex.value !== null && rightIndex.value !== null) {
      emit('range-change', {
        leftIndex: leftIndex.value,
        rightIndex: rightIndex.value,
      })
    }
  })
}

// 深度监听数据变化
watch(
  () => props.labels,
  (newLabels, oldLabels) => {
    if (JSON.stringify(newLabels) !== JSON.stringify(oldLabels)) {
      // 数据发生根本变化，需要重建图表
      rebuildChart()
    }
  },
  { deep: true },
)

watch(
  () => props.values,
  (newValues, oldValues) => {
    if (JSON.stringify(newValues) !== JSON.stringify(oldValues)) {
      // 数据发生根本变化，需要重建图表
      rebuildChart()
    }
  },
  { deep: true },
)

// 组件挂载时
onMounted(() => {
  initializeIndexPositions()
  nextTick(() => {
    initChart()
    nextTick(() => {
      emit('range-change', {
        leftIndex: leftIndex.value,
        rightIndex: rightIndex.value,
      })
    })
  })
})

// 组件卸载前清理
onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  if (chartInstance.value) {
    chartInstance.value.dispose()
    chartInstance.value = null
  }
})
</script>

<style scoped>
.timeline-chart-card {
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.2, 0, 0, 1);
  will-change: transform, box-shadow;
  border-radius: 28px !important;
  background-color: #fffbff !important; /* Material 3 背景色 */
}

.timeline-chart-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.14) !important;
  transform: translateY(-2px);
}

.chart-container {
  width: 100%;
  height: 320px;
  position: relative;
  border-radius: 24px;
  overflow: hidden;
  background-color: #f7f2fa; /* Material 3 背景色偏紫 */
}

@media (max-width: 767px) {
  .chart-container {
    height: 280px;
  }
}

.chart {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  transition: all 0.3s ease;
}

.selection-info {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  margin-top: 12px;
  padding: 8px 0;
}

.sliders-container {
  padding: 0 12px;
  margin-top: 16px;
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

/* Material Design 3 样式优化 */
:deep(.v-slider-thumb__surface) {
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2) !important;
  border: 3px solid white !important;
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
  font-size: 14px;
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
</style>
