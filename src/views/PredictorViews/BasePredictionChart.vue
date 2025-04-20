<template>
  <v-container fluid>
    <v-card elevation="2" class="pa-4" :class="isDarkMode ? 'dark-card' : ''">
      <v-card-title class="text-h5 font-weight-medium mb-2"> 销售数据预测 </v-card-title>
      <v-card-text>
        <template v-if="isDataReady">
          <div
            ref="chartContainer"
            class="chart-container"
            :class="{ 'dark-chart': isDarkMode }"
            :style="{ height: isMobile ? '300px' : '400px' }"
          ></div>
          <v-chip v-if="error !== 0" color="error" class="mt-4" variant="elevated">
            预测误差值: {{ error.toFixed(2) }}
          </v-chip>
        </template>
        <v-skeleton-loader
          v-else
          class="chart-skeleton"
          :class="{ 'dark-skeleton': isDarkMode }"
          :height="isMobile ? '300px' : '400px'"
          type="card"
          boilerplate
        ></v-skeleton-loader>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, computed, nextTick } from 'vue'
import { useDisplay } from 'vuetify'
import { useThemeStore } from '@/stores'
import { storeToRefs } from 'pinia'
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
  loading: {
    type: Boolean,
    default: false,
  },
})

const chartContainer = ref(null)
let chartInstance = null
let resizeObserverInstance = null
const display = useDisplay()
const themeStore = useThemeStore()
const { theme } = storeToRefs(themeStore)
const isMobile = computed(() => display.mobile.value)
const isDarkMode = computed(() => theme.value === 'dark')

// 计算数据是否就绪
const isDataReady = computed(() => {
  // 只检查loading状态，因为数据可能已经准备好了
  return !props.loading
})

// 创建和初始化图表
const initChart = () => {
  // 确保DOM元素已经存在
  if (!chartContainer.value) return

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

      // 深色模式颜色调整
      const textColor = isDarkMode.value ? '#e0e0e0' : '#333333'
      const axisLineColor = isDarkMode.value ? 'rgba(255, 255, 255, 0.2)' : '#ccc'
      const tooltipBackgroundColor = isDarkMode.value
        ? 'rgba(50, 50, 50, 0.9)'
        : 'rgba(50, 50, 50, 0.7)'

      // 颜色设置 - 深色模式下调整亮度
      const actualColor = isDarkMode.value ? '#5CDF6C' : '#4CAF50' // 真实销售线 - 深色模式下更亮
      const predictedColor = isDarkMode.value ? '#FFA726' : '#FF9800' // 预测销售线 - 深色模式下更亮

      // 实际销售面积渐变
      const actualAreaGradient = new echarts.graphic.LinearGradient(0, 0, 0, 1, [
        {
          offset: 0,
          color: isDarkMode.value ? 'rgba(92, 223, 108, 0.6)' : 'rgba(76, 175, 80, 0.5)',
        },
        {
          offset: 1,
          color: isDarkMode.value ? 'rgba(92, 223, 108, 0.1)' : 'rgba(76, 175, 80, 0.1)',
        },
      ])

      // 预测销售面积渐变
      const predictedAreaGradient = new echarts.graphic.LinearGradient(0, 0, 0, 1, [
        {
          offset: 0,
          color: isDarkMode.value ? 'rgba(255, 167, 38, 0.6)' : 'rgba(255, 152, 0, 0.5)',
        },
        {
          offset: 1,
          color: isDarkMode.value ? 'rgba(255, 167, 38, 0.1)' : 'rgba(255, 152, 0, 0.1)',
        },
      ])

      const option = {
        backgroundColor: isDarkMode.value ? 'transparent' : 'transparent',
        title: {
          text: '销售数据预测分析',
          left: 'center',
          textStyle: {
            fontSize: isMobile.value ? 14 : 16,
            color: textColor,
          },
        },
        tooltip: {
          trigger: 'axis',
          backgroundColor: tooltipBackgroundColor,
          borderWidth: 0,
          textStyle: {
            color: '#fff',
          },
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: isDarkMode.value ? '#555' : '#6a7985',
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
            color: textColor,
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
            textStyle: {
              color: textColor,
            },
          },
          {
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
            handleColor: isDarkMode.value ? '#aaa' : '#a7b7cc',
          },
        ],
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: displayDates,
          axisLabel: {
            fontSize: isMobile.value ? 10 : 12,
            rotate: isMobile.value ? 45 : 0,
            color: textColor,
          },
          axisLine: {
            lineStyle: {
              color: axisLineColor,
            },
          },
          splitLine: {
            lineStyle: {
              color: isDarkMode.value ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
            },
          },
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            fontSize: isMobile.value ? 10 : 12,
            color: textColor,
          },
          axisLine: {
            lineStyle: {
              color: axisLineColor,
            },
          },
          splitLine: {
            lineStyle: {
              color: isDarkMode.value ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
            },
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
              color: actualColor,
            },
            lineStyle: {
              width: 2,
              color: actualColor,
            },
            areaStyle: {
              color: actualAreaGradient,
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
              color: predictedColor,
            },
            lineStyle: {
              width: 2,
              color: predictedColor,
            },
            areaStyle: {
              color: predictedAreaGradient,
            },
          },
        ],
      }

      chartInstance.setOption(option)

      // 立即执行一次resize确保尺寸正确
      chartInstance.resize()
    } catch (error) {
      console.error('初始化图表时出错:', error)
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

// 当手风琴展开/关闭状态改变时调整图表大小
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
  }, 300) // 添加一个短暂的延迟，等待过渡动画完成
}

// 安全地设置图表
const safeSetupChart = () => {
  if (isDataReady.value && chartContainer.value) {
    initChart()
  }
}

onMounted(() => {
  // 在mounted后等待一帧再初始化图表，确保DOM已渲染
  nextTick(() => {
    safeSetupChart()
  })

  window.addEventListener('resize', handleResize)

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

  // 清理ResizeObserver
  if (resizeObserverInstance) {
    resizeObserverInstance.disconnect()
    resizeObserverInstance = null
  }

  // 安全销毁图表实例
  if (chartInstance) {
    try {
      chartInstance.dispose()
    } catch (e) {
      console.log('卸载时销毁实例出错:', e)
    }
    chartInstance = null
  }
})

// 监听数据加载状态变化，使用防抖避免频繁重建
watch(isDataReady, (newVal) => {
  if (newVal) {
    nextTick(() => {
      safeSetupChart()
    })
  }
})

// 使用一个合并的watcher来处理所有可能导致图表重绘的情况
const debouncedUpdateChart = (() => {
  let timeout = null
  return () => {
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      if (chartInstance && isDataReady.value) {
        safeSetupChart()
      }
    }, 100)
  }
})()

// 监听数据变化
watch(() => [props.actualSales, props.predictedSales, props.dates], debouncedUpdateChart, {
  deep: true,
})

// 监听移动端状态变化
watch(isMobile, debouncedUpdateChart)

// 监听深色模式变化
watch(isDarkMode, debouncedUpdateChart)

// 监听展开状态变化
watch(
  () => props.isExpanded,
  (newVal) => {
    if (newVal && isDataReady.value) {
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
  transition:
    height 0.3s,
    background-color 0.3s;
}

.dark-chart {
  background-color: #1e1e1e;
}

.chart-skeleton {
  width: 100%;
  background-color: #f5f5f5;
  border-radius: 8px;
  transition: background-color 0.3s;
}

.dark-skeleton {
  background-color: #2d2d2d;
}

.v-card {
  border-radius: 16px;
  overflow: hidden;
  width: 100%;
  transition: background-color 0.3s;
}

.dark-card {
  background-color: #1e1e1e;
}

.v-container {
  width: 100%;
  padding: 16px;
}
</style>
