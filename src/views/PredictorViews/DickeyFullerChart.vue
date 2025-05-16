<template>
  <v-container>
    <v-card>
      <v-card-title class="text-center">ARIMA 模型 Dickey-Fuller 测试结果</v-card-title>

      <v-card-text>
        <v-row>
          <v-col cols="12" md="6">
            <v-card elevation="2" class="mb-4">
              <v-card-title class="text-subtitle-1">ADF 测试统计结果</v-card-title>
              <v-card-text>
                <v-list>
                  <v-list-item>
                    <template v-slot:prepend>
                      <v-icon
                        :color="getStatColor(testData.adf_statistic, testData.critical_values)"
                      >
                        {{ getStatIcon(testData.adf_statistic, testData.critical_values) }}
                      </v-icon>
                    </template>
                    <v-list-item-title
                      >ADF 统计量: {{ formatNumber(testData.adf_statistic) }}</v-list-item-title
                    >
                  </v-list-item>
                  <v-list-item>
                    <template v-slot:prepend>
                      <v-icon :color="getPValueColor(testData.p_value)">
                        {{ getPValueIcon(testData.p_value) }}
                      </v-icon>
                    </template>
                    <v-list-item-title
                      >P 值: {{ formatNumber(testData.p_value, true) }}</v-list-item-title
                    >
                  </v-list-item>
                </v-list>
              </v-card-text>
            </v-card>

            <v-card elevation="2">
              <v-card-title class="text-subtitle-1">临界值</v-card-title>
              <v-card-text>
                <v-chip-group>
                  <v-chip
                    v-for="(value, key) in testData.critical_values"
                    :key="key"
                    :color="getCriticalValueColor(testData.adf_statistic, value)"
                  >
                    {{ key }}: {{ formatNumber(value) }}
                  </v-chip>
                </v-chip-group>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12" md="6">
            <v-card elevation="2" class="h-100">
              <v-card-title class="text-subtitle-1">平稳性结论</v-card-title>
              <v-card-text>
                <v-alert
                  :type="isStationary ? 'success' : 'warning'"
                  :icon="isStationary ? 'mdi-check-circle' : 'mdi-alert'"
                  bordered="left"
                  class="mb-4"
                >
                  <strong>{{ isStationary ? '数据是平稳的' : '数据不是平稳的' }}</strong>
                  <p class="mb-0">{{ getStationaryExplanation() }}</p>
                </v-alert>

                <v-alert type="info" icon="mdi-information" bordered="left">
                  <strong>临界值解释:</strong>
                  <p class="mb-0">
                    ADF 统计量 ({{ formatNumber(testData.adf_statistic) }})
                    {{ isStationary ? '小于' : '大于' }}
                    5% 临界值 ({{ formatNumber(testData.critical_values['5%']) }}), 所以在 5%
                    的显著性水平上 {{ isStationary ? '拒绝' : '不能拒绝' }} 单位根假设。
                  </p>
                </v-alert>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="12">
            <v-card elevation="2">
              <v-card-title class="d-flex justify-space-between align-center">
                <span>时间序列数据图</span>
                <v-btn-toggle v-model="selectedChart" mandatory>
                  <v-btn value="original"> 原始数据 </v-btn>
                  <v-btn value="rolling"> 滚动均值/标准差 </v-btn>
                </v-btn-toggle>
              </v-card-title>
              <v-card-text>
                <div ref="chartContainer" class="chart-container"></div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, onMounted, watch, computed, nextTick, onUnmounted } from 'vue'
import * as echarts from 'echarts/core'
import { LineChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DataZoomComponent,
  ToolboxComponent,
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

echarts.use([
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DataZoomComponent,
  ToolboxComponent,
  LineChart,
  CanvasRenderer,
])

// 定义接收的属性
const props = defineProps({
  testDataString: {
    type: String,
    required: true,
  },
})

// 图表容器引用
const chartContainer = ref(null)
let chart = null
let resizeObserver = null

// 定义响应式数据
const selectedChart = ref('original')
const testData = ref({
  origin: [],
  rolling_mean: [],
  rolling_std: [],
  adf_statistic: 0,
  p_value: 0,
  critical_values: { '1%': 0, '5%': 0, '10%': 0 },
})

// 计算平稳性
const isStationary = computed(() => {
  return testData.value.adf_statistic < testData.value.critical_values['5%']
})

// 处理传入的字符串数据
const parseTestData = (dataString) => {
  try {
    const data = JSON.parse(dataString)
    return {
      origin: data.origin,
      rolling_mean: data.rolling_mean.map((v) => (v === 'NaN' ? null : v)),
      rolling_std: data.rolling_std.map((v) => (v === 'NaN' ? null : v)),
      adf_statistic: data.adf_statistic,
      p_value: data.p_value,
      critical_values: data.critical_values,
    }
  } catch (e) {
    console.error('解析数据时出错:', e)
    return {
      origin: [],
      rolling_mean: [],
      rolling_std: [],
      adf_statistic: 0,
      p_value: 0,
      critical_values: { '1%': 0, '5%': 0, '10%': 0 },
    }
  }
}

// 格式化数字
const formatNumber = (num, isScientific = false) => {
  if (num === undefined || num === null) return 'N/A'

  if (isScientific && Math.abs(num) < 0.0001) {
    return num.toExponential(6)
  }

  return parseFloat(num.toFixed(6))
}

// 获取ADF统计量的图标
const getStatIcon = (stat, criticalValues) => {
  return stat < criticalValues['5%'] ? 'mdi-check-circle' : 'mdi-alert'
}

// 获取ADF统计量的颜色
const getStatColor = (stat, criticalValues) => {
  return stat < criticalValues['5%'] ? 'success' : 'warning'
}

// 获取P值的图标
const getPValueIcon = (pValue) => {
  return pValue < 0.05 ? 'mdi-check-circle' : 'mdi-alert'
}

// 获取P值的颜色
const getPValueColor = (pValue) => {
  return pValue < 0.05 ? 'success' : 'warning'
}

// 获取临界值的颜色
const getCriticalValueColor = (stat, criticalValue) => {
  return stat < criticalValue ? 'success' : 'grey'
}

// 获取平稳性解释
const getStationaryExplanation = () => {
  if (isStationary.value) {
    return `ADF 统计量 (${formatNumber(testData.value.adf_statistic)}) 小于所有临界值,P值 (${formatNumber(testData.value.p_value, true)}) 非常小,因此我们可以拒绝原序列存在单位根的原假设,认为序列是平稳的。`
  } else {
    return `ADF 统计量 (${formatNumber(testData.value.adf_statistic)}) 大于部分或全部临界值,P值 (${formatNumber(testData.value.p_value, true)}) 较大,因此我们不能拒绝原序列存在单位根的原假设,序列可能不是平稳的。`
  }
}

// 手动重置图表大小
const resizeChart = () => {
  if (chart) {
    chart.resize()
  }
}

// 初始化图表
const initChart = () => {
  if (chartContainer.value) {
    // 如果已经存在图表实例,先销毁它
    if (chart) {
      chart.dispose()
    }

    chart = echarts.init(chartContainer.value)
    updateChart()

    // 使用ResizeObserver监听容器大小变化
    if (window.ResizeObserver) {
      resizeObserver = new ResizeObserver(
        debounce(() => {
          if (chart) {
            chart.resize()
          }
        }, 100),
      )

      resizeObserver.observe(chartContainer.value)
    }

    // 添加窗口大小变化监听,确保图表响应式
    window.addEventListener('resize', resizeChart)

    // 对可能的手风琴展开事件进行处理
    tryObserveAccordionParent()
  }
}

// 尝试观察父级手风琴组件
const tryObserveAccordionParent = () => {
  if (!chartContainer.value) return

  // 向上寻找可能的手风琴父元素
  let element = chartContainer.value
  let accordion = null

  // 查找10层父元素
  for (let i = 0; i < 10; i++) {
    element = element.parentElement
    if (!element) break

    // 检查是否有手风琴相关的类名
    if (
      element.classList.contains('v-expansion-panel-content') ||
      element.classList.contains('v-expansion-panel') ||
      element.classList.contains('v-accordion')
    ) {
      accordion = element
      break
    }
  }

  // 如果找到手风琴元素,为其添加过渡结束监听器
  if (accordion) {
    accordion.addEventListener('transitionend', () => {
      nextTick(() => {
        if (chart) {
          chart.resize()
        }
      })
    })
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

// 更新图表
const updateChart = () => {
  if (!chart) return

  const option = {
    title: {
      text: selectedChart.value === 'original' ? '原始时间序列' : '滚动统计量',
      left: 'center',
    },
    tooltip: {
      trigger: 'axis',
      formatter: function (params) {
        let tooltip = `索引: ${params[0].dataIndex}<br/>`
        params.forEach((param) => {
          tooltip += `${param.seriesName}: ${param.value === 'NaN' ? 'NaN' : formatNumber(param.value)}<br/>`
        })
        return tooltip
      },
    },
    legend: {
      data:
        selectedChart.value === 'original' ? ['原始数据'] : ['原始数据', '滚动均值', '滚动标准差'],
      bottom: 0,
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '60px',
      containLabel: true,
    },
    toolbox: {
      feature: {
        saveAsImage: { title: '保存为图片' },
      },
    },
    dataZoom: [
      {
        type: 'slider',
        start: 0,
        end: 100,
        bottom: 25,
      },
      {
        type: 'inside',
        start: 0,
        end: 100,
      },
    ],
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: Array.from({ length: testData.value.origin.length }, (_, i) => i),
      name: '观测索引',
    },
    yAxis: {
      type: 'value',
      name: '值',
    },
    series: getChartSeries(),
  }

  chart.setOption(option)
  // 强制执行一次resize,确保图表正确渲染
  setTimeout(() => {
    if (chart) {
      chart.resize()
    }
  }, 50)
}

// 获取图表系列数据
const getChartSeries = () => {
  if (selectedChart.value === 'original') {
    return [
      {
        name: '原始数据',
        type: 'line',
        data: testData.value.origin,
        showSymbol: false,
        lineStyle: {
          width: 2,
        },
      },
    ]
  } else {
    // 将NaN转换为null以便在图表中正确显示
    const processedMean = testData.value.rolling_mean.map((v) => (v === 'NaN' ? null : v))
    const processedStd = testData.value.rolling_std.map((v) => (v === 'NaN' ? null : v))

    return [
      {
        name: '原始数据',
        type: 'line',
        data: testData.value.origin,
        showSymbol: false,
        lineStyle: {
          width: 1,
          opacity: 0.5,
        },
      },
      {
        name: '滚动均值',
        type: 'line',
        data: processedMean,
        showSymbol: false,
        lineStyle: {
          width: 2,
        },
      },
      {
        name: '滚动标准差',
        type: 'line',
        data: processedStd,
        showSymbol: false,
        lineStyle: {
          width: 2,
          type: 'dashed',
        },
      },
    ]
  }
}

// 监听selectedChart变化更新图表
watch(selectedChart, () => {
  updateChart()
})

// 监听props.testDataString变化解析数据并更新图表
watch(
  () => props.testDataString,
  (newVal) => {
    const parsedData = parseTestData(newVal)
    testData.value = parsedData
    if (chart) {
      updateChart()
    }
  },
  { immediate: true },
)

// 组件挂载后初始化图表
onMounted(() => {
  const parsedData = parseTestData(props.testDataString)
  testData.value = parsedData
  nextTick(() => {
    initChart()
  })

  // 添加变通方法,定期尝试调整图表大小
  const checkInterval = setInterval(() => {
    if (chart && chartContainer.value && chartContainer.value.offsetHeight > 0) {
      chart.resize()
    }
  }, 500)

  // 30秒后清除定时器,此时组件应该已经完全渲染
  setTimeout(() => {
    clearInterval(checkInterval)
  }, 30000)
})

// 组件卸载前清理资源
onUnmounted(() => {
  window.removeEventListener('resize', resizeChart)

  if (resizeObserver) {
    resizeObserver.disconnect()
  }

  if (chart) {
    chart.dispose()
    chart = null
  }
})
</script>

<style scoped>
.v-card-title {
  word-break: break-word;
}

.chart-container {
  width: 100%;
  height: 400px;
  transition:
    height 0.3s,
    width 0.3s;
}
</style>
