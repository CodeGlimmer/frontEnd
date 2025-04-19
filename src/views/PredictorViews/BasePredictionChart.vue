<template>
  <v-container fluid>
    <v-card elevation="2" class="pa-4">
      <v-card-title class="text-h5 font-weight-medium mb-2"> 销售数据预测 </v-card-title>
      <v-card-text>
        <div
          ref="chartContainer"
          class="chart-container"
          :style="{ height: isMobile ? '300px' : '400px' }"
        ></div>
        <v-chip v-if="error !== 0" color="error" class="mt-4" variant="elevated">
          预测误差值: {{ error.toFixed(2) }}
        </v-chip>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, computed, nextTick } from 'vue'
import { useDisplay } from 'vuetify'
import * as echarts from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DataZoomComponent,
} from 'echarts/components'

// 注册必要的组件
echarts.use([
  CanvasRenderer,
  LineChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DataZoomComponent,
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
})

const chartContainer = ref(null)
let chartInstance = null
const display = useDisplay()
const isMobile = computed(() => display.mobile.value)

// 创建和初始化图表
const initChart = () => {
  if (chartInstance) {
    chartInstance.dispose()
  }

  if (!chartContainer.value) return

  // 使用nextTick等待DOM更新
  nextTick(() => {
    chartInstance = echarts.init(chartContainer.value, null, {
      renderer: 'canvas',
    })

    // 如果数据量大，优化取样
    let displayDates = props.dates
    let displayActual = props.actualSales
    let displayPredicted = props.predictedSales

    // 超过100个数据点时做采样处理
    if (props.dates.length > 100) {
      const sampleInterval = Math.floor(props.dates.length / 100)
      displayDates = props.dates.filter((_, index) => index % sampleInterval === 0)
      displayActual = props.actualSales.filter((_, index) => index % sampleInterval === 0)
      displayPredicted = props.predictedSales.filter((_, index) => index % sampleInterval === 0)
    }

    const option = {
      title: {
        text: '销售数据预测分析',
        left: 'center',
        textStyle: {
          fontSize: isMobile.value ? 14 : 16,
        },
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          label: {
            backgroundColor: '#6a7985',
          },
        },
      },
      legend: {
        data: ['真实销售', '预测销售'],
        top: isMobile.value ? 30 : 25,
        itemWidth: 12,
        itemHeight: 12,
        textStyle: {
          fontSize: isMobile.value ? 10 : 12,
        },
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '12%',
        top: isMobile.value ? '20%' : '15%',
        containLabel: true,
      },
      dataZoom: [
        {
          type: 'inside',
          start: 0,
          end: 100,
        },
        {
          start: 0,
          end: 100,
        },
      ],
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: displayDates,
        axisLabel: {
          fontSize: isMobile.value ? 10 : 12,
          rotate: isMobile.value ? 45 : 0,
        },
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          fontSize: isMobile.value ? 10 : 12,
        },
      },
      series: [
        {
          name: '真实销售',
          type: 'line',
          data: displayActual,
          smooth: true,
          symbol: 'circle',
          symbolSize: 4,
          itemStyle: {
            color: '#4CAF50',
          },
          lineStyle: {
            width: 2,
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(76, 175, 80, 0.5)' },
              { offset: 1, color: 'rgba(76, 175, 80, 0.1)' },
            ]),
          },
        },
        {
          name: '预测销售',
          type: 'line',
          data: displayPredicted,
          smooth: true,
          symbol: 'circle',
          symbolSize: 4,
          itemStyle: {
            color: '#FF9800',
          },
          lineStyle: {
            width: 2,
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(255, 152, 0, 0.5)' },
              { offset: 1, color: 'rgba(255, 152, 0, 0.1)' },
            ]),
          },
        },
      ],
    }

    chartInstance.setOption(option)

    // 立即执行一次resize确保尺寸正确
    chartInstance.resize()
  })
}

// 监听窗口大小变化自适应调整
const handleResize = () => {
  if (chartInstance) {
    chartInstance.resize()
  }
}

// 当手风琴展开/关闭状态改变时调整图表大小
const resizeChartOnExpand = () => {
  // 使用setTimeout确保DOM已完全更新
  setTimeout(() => {
    if (chartInstance) {
      chartInstance.resize()
    }
  }, 300) // 添加一个短暂的延迟，等待过渡动画完成
}

onMounted(() => {
  initChart()
  window.addEventListener('resize', handleResize)

  // 监听父元素大小变化
  if (typeof ResizeObserver !== 'undefined') {
    const resizeObserver = new ResizeObserver(() => {
      if (chartInstance) {
        chartInstance.resize()
      }
    })

    if (chartContainer.value && chartContainer.value.parentElement) {
      resizeObserver.observe(chartContainer.value.parentElement)
    }
  }
})

onUnmounted(() => {
  if (chartInstance) {
    chartInstance.dispose()
    chartInstance = null
  }
  window.removeEventListener('resize', handleResize)
})

// 监听数据变化
watch(
  () => [props.actualSales, props.predictedSales, props.dates],
  () => {
    initChart()
  },
  { deep: true },
)

// 监听移动端状态变化
watch(isMobile, () => {
  initChart()
})

// 监听展开状态变化
watch(
  () => props.isExpanded,
  (newVal) => {
    if (newVal) {
      resizeChartOnExpand()
    }
  },
)
</script>

<style scoped>
.chart-container {
  width: 100%;
  min-height: 300px;
  background-color: #ffffff;
  border-radius: 8px;
  transition: height 0.3s;
}

.v-card {
  border-radius: 16px;
  overflow: hidden;
  width: 100%;
}

.v-container {
  width: 100%;
  padding: 16px;
}
</style>
