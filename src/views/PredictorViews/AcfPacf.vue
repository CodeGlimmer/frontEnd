<template>
  <v-container fluid>
    <v-card class="mb-4" elevation="2" rounded="lg">
      <v-card-title class="text-h5 pa-4">
        <v-icon icon="mdi-chart-line" class="mr-2"></v-icon>
        <slot> ARIMA预测相关性分析 </slot>
      </v-card-title>

      <v-card-text>
        <v-row>
          <v-col cols="12" md="6">
            <v-card variant="outlined" class="mb-2 mb-md-0">
              <v-card-title class="text-subtitle-1">自相关函数 (ACF)</v-card-title>
              <div ref="acfChart" class="chart-container" style="width: 100%; height: 400px"></div>
            </v-card>
          </v-col>
          <v-col cols="12" md="6">
            <v-card variant="outlined">
              <v-card-title class="text-subtitle-1">偏自相关函数 (PACF)</v-card-title>
              <div ref="pacfChart" class="chart-container" style="width: 100%; height: 400px"></div>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, onMounted, watch, onBeforeUnmount, nextTick } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
  chartData: {
    type: Object,
    required: true,
  },
})

const acfChart = ref(null)
const pacfChart = ref(null)
let acfChartInstance = null
let pacfChartInstance = null
let resizeObserver = null
let mutationObserver = null
let isVisible = false

function renderChart(chartRef, chartInstance, data, title) {
  if (!chartRef.value) return

  if (!chartInstance) {
    chartInstance = echarts.init(chartRef.value)
  }

  const option = {
    title: {
      text: title,
      textStyle: {
        fontWeight: 'normal',
      },
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
      formatter: function (params) {
        const dataIndex = params[0].dataIndex
        let result = `Lag: ${data.lags[dataIndex]}<br>`
        result += `Value: ${data.values[dataIndex].toFixed(4)}<br>`
        if (data.conf && data.conf[dataIndex]) {
          result += `Confidence Interval: [${data.conf[dataIndex][0].toFixed(4)}, ${data.conf[dataIndex][1].toFixed(4)}]`
        }
        return result
      },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: data.lags,
      name: 'Lag',
      axisLabel: {
        rotate: 45,
        margin: 10,
      },
    },
    yAxis: {
      type: 'value',
      name: 'Correlation',
      min: function (value) {
        return Math.min(-1, value.min)
      },
      max: function (value) {
        return Math.max(1, value.max)
      },
    },
    series: [
      {
        name: 'Correlation',
        type: 'bar',
        data: data.values,
        itemStyle: {
          color: '#6750A4', // Primary color in Material Design 3
        },
      },
      {
        name: 'Confidence Interval',
        type: 'custom',
        renderItem: function (params, api) {
          if (!data.conf) return

          const xValue = api.value(0)
          // const yValue = api.value(1)
          const confInterval = data.conf[params.dataIndex]

          const lowPoint = api.coord([xValue, confInterval[0]])
          const highPoint = api.coord([xValue, confInterval[1]])

          const rectShape = echarts.graphic.clipRectByRect(
            {
              x: lowPoint[0] - 4,
              y: lowPoint[1],
              width: 8,
              height: highPoint[1] - lowPoint[1],
            },
            {
              x: params.coordSys.x,
              y: params.coordSys.y,
              width: params.coordSys.width,
              height: params.coordSys.height,
            },
          )

          return (
            rectShape && {
              type: 'rect',
              shape: rectShape,
              style: {
                fill: 'rgba(180, 180, 180, 0.3)',
              },
            }
          )
        },
        data: data.values.map((val, idx) => [idx, val]),
        z: 100,
      },
      {
        name: 'Zero Line',
        type: 'line',
        markLine: {
          symbol: 'none',
          label: { show: false },
          data: [{ yAxis: 0 }],
          lineStyle: {
            color: '#CCC',
            type: 'dashed',
          },
        },
        z: 10,
      },
    ],
    dataZoom: [
      {
        type: 'inside',
        start: 0,
        end: 100,
      },
      {
        type: 'slider',
        show: true,
        start: 0,
        end: 100,
      },
    ],
    responsive: true,
    animation: true,
  }

  chartInstance.setOption(option)

  return chartInstance
}

function updateCharts() {
  nextTick(() => {
    if (props.chartData && props.chartData.acf) {
      acfChartInstance = renderChart(acfChart, acfChartInstance, props.chartData.acf, 'ACF')
    }

    if (props.chartData && props.chartData.pacf) {
      pacfChartInstance = renderChart(pacfChart, pacfChartInstance, props.chartData.pacf, 'PACF')
    }
  })
}

function handleResize() {
  if (acfChartInstance) acfChartInstance.resize()
  if (pacfChartInstance) pacfChartInstance.resize()
}

// 添加延迟重新渲染的函数
function forceResize() {
  // 给DOM足够的时间更新
  nextTick(() => {
    // 多次延迟执行以确保DOM已完全展开和渲染
    setTimeout(() => {
      handleResize()
      // 再次延迟以应对某些异步渲染场景
      setTimeout(() => {
        handleResize()
      }, 200)
    }, 100)
  })
}

// 检查元素是否可见
function checkVisibility() {
  if (!acfChart.value) return false

  const rect = acfChart.value.getBoundingClientRect()
  const wasVisible = isVisible

  // 检查元素是否有尺寸且在视窗内
  isVisible =
    rect.width > 0 &&
    rect.height > 0 &&
    rect.top <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.bottom >= 0

  // 如果从不可见变为可见，触发重绘
  if (!wasVisible && isVisible) {
    forceResize()
  }

  return isVisible
}

// 设置ResizeObserver来监听容器尺寸变化
function setupResizeObserver() {
  if (typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver((entries) => {
      // 当尺寸变化时，触发重绘
      if (checkVisibility()) {
        handleResize()
      }
    })

    // 观察图表容器
    if (acfChart.value) resizeObserver.observe(acfChart.value)
    if (pacfChart.value) resizeObserver.observe(pacfChart.value)

    // 观察父容器
    if (acfChart.value) {
      // 查找父级的expansion-panel元素
      let parent = acfChart.value.parentElement
      while (
        parent &&
        !parent.classList.contains('v-expansion-panel-text__wrapper') &&
        parent !== document.body
      ) {
        parent = parent.parentElement
      }

      if (parent && parent.classList.contains('v-expansion-panel-text__wrapper')) {
        resizeObserver.observe(parent)
      }
    }
  }
}

// 设置MutationObserver来监听DOM结构变化
function setupMutationObserver() {
  if (typeof MutationObserver !== 'undefined' && acfChart.value) {
    // 查找父级手风琴元素
    let panelElement = acfChart.value.closest('.v-expansion-panel')

    if (panelElement) {
      mutationObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          // 检查类变化，以监测expansion-panel的展开/收起
          if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
            // 检查是否包含--active类，表示手风琴已展开
            if (panelElement.classList.contains('v-expansion-panel--active')) {
              // 手风琴已展开，延迟执行resize
              forceResize()
            }
          }
        })
      })

      // 监听类名变化
      mutationObserver.observe(panelElement, {
        attributes: true,
        attributeFilter: ['class'],
      })
    }
  }
}

// 创建监听间隔
function setupVisibilityInterval() {
  // 每200ms检查一次可见性，适用于手风琴动画完成后
  const intervalId = setInterval(() => {
    checkVisibility()
  }, 200)

  // 60秒后清除定时器，避免长期占用资源
  setTimeout(() => {
    clearInterval(intervalId)
  }, 60000)

  return intervalId
}

onMounted(() => {
  updateCharts()
  window.addEventListener('resize', handleResize)

  // 设置各种观察器
  setupResizeObserver()
  setupMutationObserver()

  // 初始检查可见性
  nextTick(() => {
    checkVisibility()
    // 设置可见性监听
    const intervalId = setupVisibilityInterval()

    // 组件卸载时清除定时器
    onBeforeUnmount(() => {
      clearInterval(intervalId)
    })
  })
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)

  if (resizeObserver) {
    resizeObserver.disconnect()
  }

  if (mutationObserver) {
    mutationObserver.disconnect()
  }

  if (acfChartInstance) acfChartInstance.dispose()
  if (pacfChartInstance) pacfChartInstance.dispose()
})

watch(
  () => props.chartData,
  () => {
    updateCharts()
  },
  { deep: true },
)

// 添加一个特殊的处理函数，用于强制图表重绘
function initializeCharts() {
  nextTick(() => {
    updateCharts()
    forceResize()
  })
}

// 监视组件的可见性变化
const visibilityObserver = ref(null)
onMounted(() => {
  if (typeof IntersectionObserver !== 'undefined' && acfChart.value) {
    visibilityObserver.value = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            forceResize()
          }
        })
      },
      { threshold: 0.1 },
    ) // 当10%的元素可见时触发

    visibilityObserver.value.observe(acfChart.value)
  }
})

onBeforeUnmount(() => {
  if (visibilityObserver.value) {
    visibilityObserver.value.disconnect()
  }
})
</script>

<style scoped>
.v-card {
  transition: box-shadow 0.3s ease;
}

.v-card:hover {
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1) !important;
}

.chart-container {
  width: 100%;
  transition: height 0.3s ease;
  min-height: 300px;
}

@media (max-width: 600px) {
  .chart-container {
    height: 300px !important;
  }
}
</style>
