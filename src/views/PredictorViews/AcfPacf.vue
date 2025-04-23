<template>
  <v-container fluid class="arima-correlation-analysis">
    <v-card
      class="main-card mb-4"
      elevation="2"
      rounded="lg"
      :class="{ 'card-enter': showComponent }"
    >
      <v-card-title class="text-h5 pa-4 card-title-wrapper">
        <div class="title-icon-container me-2">
          <v-icon
            icon="mdi-chart-line"
            class="title-icon"
            :class="{ 'icon-spin': isLoading }"
          ></v-icon>
        </div>
        <div class="title-text" :class="{ 'title-pulse': isLoading }">
          <slot>ARIMA预测相关性分析</slot>
        </div>
        <v-spacer></v-spacer>
        <v-tooltip location="bottom">
          <template v-slot:activator="{ props }">
            <v-btn
              v-bind="props"
              icon="mdi-information-outline"
              variant="text"
              density="comfortable"
              class="info-button"
              @click="showInfo = !showInfo"
            ></v-btn>
          </template>
          <span>查看相关信息</span>
        </v-tooltip>
      </v-card-title>

      <v-expand-transition>
        <div v-if="showInfo" class="px-4 pb-2">
          <v-card variant="outlined" class="info-card mb-3">
            <v-card-text>
              <p class="text-body-1 mb-2">
                <strong>自相关函数 (ACF)</strong>
                用于测量时间序列在不同时间点之间的相关性。它表示时间序列与其自身的滞后版本之间的相关性，有助于识别时间序列中的季节性和周期性模式。
              </p>
              <p class="text-body-1">
                <strong>偏自相关函数 (PACF)</strong>
                测量在考虑中间滞后的情况下，时间序列与其特定滞后版本的直接相关性。它有助于确定ARIMA模型中自回归项(AR)的最佳阶数。
              </p>
            </v-card-text>
          </v-card>
        </div>
      </v-expand-transition>

      <v-card-text class="chart-container-wrapper">
        <v-row class="chart-row">
          <v-col
            cols="12"
            md="6"
            class="chart-column"
            :class="{ 'chart-enter-left': showComponent }"
          >
            <v-card
              variant="outlined"
              class="sub-card mb-md-0 mb-4"
              :class="{ 'card-hover': isHovering === 'acf' }"
            >
              <v-hover v-slot="{ isHovering }">
                <div @mouseenter="isHovering = 'acf'" @mouseleave="isHovering = null">
                  <v-card-title class="text-subtitle-1 chart-title">
                    <span class="chart-title-text">自相关函数 (ACF)</span>
                    <v-slide-x-transition>
                      <v-chip
                        v-if="isHovering"
                        size="small"
                        class="ms-2 chart-info-chip"
                        color="primary"
                        variant="flat"
                        >滞后相关性</v-chip
                      >
                    </v-slide-x-transition>
                  </v-card-title>
                  <v-divider class="chart-divider"></v-divider>
                  <div
                    ref="acfChart"
                    class="chart-container"
                    :class="{ 'chart-active': isHovering === 'acf' }"
                    style="width: 100%; height: 400px"
                  ></div>
                  <v-expand-transition>
                    <div v-if="isHovering === 'acf'" class="chart-actions pa-2">
                      <v-btn
                        prepend-icon="mdi-download"
                        variant="text"
                        size="small"
                        class="chart-action-btn"
                        @click="downloadChart('acf')"
                      >
                        导出图表
                      </v-btn>
                      <v-btn
                        prepend-icon="mdi-refresh"
                        variant="text"
                        size="small"
                        class="chart-action-btn"
                        @click="refreshChart('acf')"
                      >
                        刷新图表
                      </v-btn>
                    </div>
                  </v-expand-transition>
                </div>
              </v-hover>
            </v-card>
          </v-col>
          <v-col
            cols="12"
            md="6"
            class="chart-column"
            :class="{ 'chart-enter-right': showComponent }"
          >
            <v-card
              variant="outlined"
              class="sub-card"
              :class="{ 'card-hover': isHovering === 'pacf' }"
            >
              <v-hover v-slot="{ isHovering }">
                <div @mouseenter="isHovering = 'pacf'" @mouseleave="isHovering = null">
                  <v-card-title class="text-subtitle-1 chart-title">
                    <span class="chart-title-text">偏自相关函数 (PACF)</span>
                    <v-slide-x-transition>
                      <v-chip
                        v-if="isHovering"
                        size="small"
                        class="ms-2 chart-info-chip"
                        color="secondary"
                        variant="flat"
                        >直接相关性</v-chip
                      >
                    </v-slide-x-transition>
                  </v-card-title>
                  <v-divider class="chart-divider"></v-divider>
                  <div
                    ref="pacfChart"
                    class="chart-container"
                    :class="{ 'chart-active': isHovering === 'pacf' }"
                    style="width: 100%; height: 400px"
                  ></div>
                  <v-expand-transition>
                    <div v-if="isHovering === 'pacf'" class="chart-actions pa-2">
                      <v-btn
                        prepend-icon="mdi-download"
                        variant="text"
                        size="small"
                        class="chart-action-btn"
                        @click="downloadChart('pacf')"
                      >
                        导出图表
                      </v-btn>
                      <v-btn
                        prepend-icon="mdi-refresh"
                        variant="text"
                        size="small"
                        class="chart-action-btn"
                        @click="refreshChart('pacf')"
                      >
                        刷新图表
                      </v-btn>
                    </div>
                  </v-expand-transition>
                </div>
              </v-hover>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>

      <v-card-actions class="chart-footnote px-4 pb-4">
        <v-btn
          variant="text"
          prepend-icon="mdi-help-circle-outline"
          size="small"
          color="primary"
          class="interpretation-btn"
          @click="showInterpretation = !showInterpretation"
        >
          图表解读指南
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn
          variant="text"
          prepend-icon="mdi-refresh"
          size="small"
          :loading="isRefreshing"
          @click="refreshAllCharts"
          class="refresh-all-btn"
        >
          刷新所有图表
        </v-btn>
      </v-card-actions>

      <v-expand-transition>
        <div v-if="showInterpretation" class="px-4 pb-4">
          <v-card variant="outlined" class="interpretation-card">
            <v-card-title class="text-subtitle-1">
              <v-icon icon="mdi-book-open-variant" class="me-2"></v-icon>
              图表解读指南
            </v-card-title>
            <v-card-text>
              <v-row>
                <v-col cols="12" md="6">
                  <div class="interpretation-section">
                    <h3 class="text-subtitle-2 mb-2">ACF图表解读:</h3>
                    <ul class="interpretation-list">
                      <li>如果ACF快速衰减为零，表示时间序列是平稳的</li>
                      <li>如果ACF缓慢衰减，则表示时间序列可能需要差分</li>
                      <li>如果ACF在特定滞后处显示峰值，则表示存在季节性模式</li>
                      <li>超出蓝色虚线（置信区间）的值表示统计显著性的相关性</li>
                    </ul>
                  </div>
                </v-col>
                <v-col cols="12" md="6">
                  <div class="interpretation-section">
                    <h3 class="text-subtitle-2 mb-2">PACF图表解读:</h3>
                    <ul class="interpretation-list">
                      <li>PACF中的显著值表示自回归过程的可能阶数（AR模型）</li>
                      <li>如果PACF在前p个滞后处显著，然后截断，则AR(p)模型可能合适</li>
                      <li>PACF可帮助确定ARIMA模型中的p值</li>
                      <li>对比ACF和PACF的模式可帮助选择合适的ARIMA模型</li>
                    </ul>
                  </div>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </div>
      </v-expand-transition>
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
  loading: {
    type: Boolean,
    default: false,
  },
})

// UI状态相关refs
const acfChart = ref(null)
const pacfChart = ref(null)
const isHovering = ref(null)
const showInfo = ref(false)
const showInterpretation = ref(false)
const showComponent = ref(false)
const isLoading = ref(false)
const isRefreshing = ref(false)

// 图表实例
let acfChartInstance = null
let pacfChartInstance = null

// 观察器
let resizeObserver = null
let mutationObserver = null
let visibilityObserver = ref(null)
let isVisible = false
let intervalId = null

// 主题配置
const themeColors = {
  primary: '#6750A4', // Material You主色调
  primaryLight: '#EADDFF', // 浅色版本
  secondary: '#9C27B0',
  secondaryLight: '#E8DEF8',
  tertiary: '#625B71',
  surface: '#FFFFFF',
  background: '#F8F9FA',
  error: '#B3261E',
  warning: '#FF8800',
  success: '#149E60',
  text: '#1C1B1F',
  subtle: '#CAC4D0',
  outline: '#79747E',
  shadow: 'rgba(0, 0, 0, 0.15)',
}

// 配置动态样式
const generateChartStyle = (type) => {
  const isPacf = type === 'pacf'
  const mainColor = isPacf ? themeColors.secondary : themeColors.primary
  const lightColor = isPacf ? themeColors.secondaryLight : themeColors.primaryLight

  return {
    mainColor,
    lightColor,
    barGradient: [
      { offset: 0, color: mainColor + 'CC' }, // 透明度80%
      { offset: 1, color: mainColor },
    ],
    confidenceColor: 'rgba(150, 150, 150, 0.3)',
    animation: {
      duration: 1500,
      easing: 'cubicOut',
    },
  }
}

// 渲染图表逻辑
function renderChart(chartRef, chartInstance, data, title, type = 'acf') {
  if (!chartRef.value) return

  if (!chartInstance) {
    chartInstance = echarts.init(chartRef.value)
  }

  const style = generateChartStyle(type)

  // 准备信息显示框的内容
  const tooltipFormatter = function (params) {
    const dataIndex = params[0].dataIndex
    let result = `<div style="padding: 8px; line-height: 1.5;">
                    <div style="font-weight: bold; margin-bottom: 5px;">滞后期: ${data.lags[dataIndex]}</div>
                    <div>相关值: <span style="color:${style.mainColor};font-weight:bold;">${data.values[dataIndex].toFixed(4)}</span></div>`

    if (data.conf && data.conf[dataIndex]) {
      result += `<div>置信区间: [${data.conf[dataIndex][0].toFixed(4)}, ${data.conf[dataIndex][1].toFixed(4)}]</div>`
    }

    result += `</div>`
    return result
  }

  const option = {
    title: {
      text: title,
      textStyle: {
        fontWeight: 'normal',
        color: themeColors.text,
        fontSize: 16,
      },
      left: 'center',
      top: 0,
      show: false,
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
        shadowStyle: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: style.mainColor,
      borderWidth: 1,
      textStyle: {
        color: themeColors.text,
      },
      formatter: tooltipFormatter,
      extraCssText: 'box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1); border-radius: 4px;',
    },
    grid: {
      left: '5%',
      right: '5%',
      bottom: '15%',
      top: '8%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: data.lags,
      name: '滞后期',
      nameLocation: 'middle',
      nameGap: 30,
      nameTextStyle: {
        color: themeColors.text,
        fontSize: 14,
      },
      axisLabel: {
        rotate: 45,
        margin: 10,
        color: themeColors.text,
        fontSize: 12,
      },
      axisLine: {
        lineStyle: {
          color: themeColors.outline,
        },
      },
      axisTick: {
        alignWithLabel: true,
        lineStyle: {
          color: themeColors.outline,
        },
      },
      splitLine: {
        show: false,
      },
    },
    yAxis: {
      type: 'value',
      name: '相关性',
      nameLocation: 'middle',
      nameGap: 40,
      nameTextStyle: {
        color: themeColors.text,
        fontSize: 14,
      },
      min: function (value) {
        return Math.min(-1, value.min * 1.1)
      },
      max: function (value) {
        return Math.max(1, value.max * 1.1)
      },
      axisLabel: {
        color: themeColors.text,
        fontSize: 12,
      },
      axisLine: {
        lineStyle: {
          color: themeColors.outline,
        },
      },
      splitLine: {
        lineStyle: {
          type: 'dashed',
          color: themeColors.subtle,
        },
      },
    },
    series: [
      {
        name: '相关性',
        type: 'bar',
        data: data.values,
        barWidth: '60%',
        itemStyle: {
          color: function (params) {
            // 根据值的正负设置不同颜色
            return params.value >= 0
              ? new echarts.graphic.LinearGradient(0, 0, 0, 1, style.barGradient)
              : new echarts.graphic.LinearGradient(0, 1, 0, 0, style.barGradient)
          },
          borderRadius: [3, 3, 0, 0],
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.3)',
          },
        },
        animation: true,
        animationDelay: function (idx) {
          return idx * 50
        },
        animationDuration: style.animation.duration,
        animationEasing: style.animation.easing,
      },
      {
        name: '置信区间',
        type: 'custom',
        renderItem: function (params, api) {
          if (!data.conf) return

          const xValue = api.value(0)
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
                fill: style.confidenceColor,
              },
            }
          )
        },
        data: data.values.map((val, idx) => [idx, val]),
        z: 100,
        animation: true,
        animationDuration: style.animation.duration,
        animationEasing: style.animation.easing,
      },
      {
        name: '零线',
        type: 'line',
        markLine: {
          symbol: 'none',
          label: { show: false },
          data: [{ yAxis: 0 }],
          lineStyle: {
            color: themeColors.outline,
            type: 'dashed',
            width: 1,
          },
          animation: false,
        },
        z: 10,
      },
      // 添加置信区间线
      {
        name: '置信区间线',
        type: 'line',
        markLine: {
          symbol: 'none',
          label: {
            show: true,
            position: 'start',
            formatter: '95% 置信区间',
            fontSize: 12,
            color: themeColors.tertiary,
          },
          data: [
            {
              yAxis: data.conf && data.conf.length > 0 ? data.conf[0][1] : 0.2,
              lineStyle: { color: themeColors.tertiary, type: 'dotted' },
            },
            {
              yAxis: data.conf && data.conf.length > 0 ? data.conf[0][0] : -0.2,
              lineStyle: { color: themeColors.tertiary, type: 'dotted' },
            },
          ],
          animation: true,
          animationDuration: style.animation.duration + 300,
          animationEasing: 'cubicOut',
        },
        z: 11,
      },
    ],
    dataZoom: [
      {
        type: 'inside',
        start: 0,
        end: 100,
        zoomLock: false,
        throttle: 100,
      },
      {
        type: 'slider',
        show: true,
        start: 0,
        end: 100,
        height: 20,
        bottom: 5,
        borderColor: 'transparent',
        fillerColor: style.lightColor,
        handleStyle: {
          color: style.mainColor,
          borderColor: style.mainColor,
        },
        moveHandleStyle: {
          color: style.mainColor,
        },
        emphasis: {
          handleStyle: {
            borderWidth: 2,
            color: style.mainColor,
          },
          moveHandleStyle: {
            color: style.mainColor,
          },
        },
        textStyle: {
          color: themeColors.text,
        },
        brushSelect: false,
      },
    ],
    responsive: true,
    animation: true,
    animationThreshold: 2000,
    animationDuration: style.animation.duration,
    animationEasing: style.animation.easing,
    animationDelay: function (idx) {
      return idx * 50
    },
  }

  // 应用修改过的选项
  chartInstance.setOption(option, true)

  // 添加点击事件以进行交互
  chartInstance.on('click', function (params) {
    // 点击柱状图时的交互
    if (params.componentType === 'series' && params.seriesName === '相关性') {
      const lagValue = data.lags[params.dataIndex]
      const correlationValue = data.values[params.dataIndex]

      // 显示交互反馈
      chartInstance.dispatchAction({
        type: 'highlight',
        seriesIndex: 0,
        dataIndex: params.dataIndex,
      })

      // 1秒后取消高亮
      setTimeout(() => {
        chartInstance.dispatchAction({
          type: 'downplay',
          seriesIndex: 0,
          dataIndex: params.dataIndex,
        })
      }, 1000)

      console.log(`选中的滞后期: ${lagValue}, 相关性值: ${correlationValue}`)
    }
  })

  return chartInstance
}

// 导出图表为图片
function downloadChart(type) {
  const chartInstance = type === 'acf' ? acfChartInstance : pacfChartInstance
  const chartTitle = type === 'acf' ? '自相关函数' : '偏自相关函数'

  if (chartInstance) {
    const url = chartInstance.getDataURL({
      type: 'png',
      pixelRatio: 2,
      backgroundColor: '#fff',
    })

    const link = document.createElement('a')
    link.download = `${chartTitle}_${new Date().toISOString().split('T')[0]}.png`
    link.href = url
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    // 添加下载动画反馈
    animateChartActivity(chartInstance)
  }
}

// 刷新单个图表
function refreshChart(type) {
  if (type === 'acf' && acfChartInstance) {
    animateChartRefresh(acfChartInstance, props.chartData.acf, '自相关函数', 'acf')
  } else if (type === 'pacf' && pacfChartInstance) {
    animateChartRefresh(pacfChartInstance, props.chartData.pacf, '偏自相关函数', 'pacf')
  }
}

// 刷新所有图表
function refreshAllCharts() {
  isRefreshing.value = true

  setTimeout(() => {
    if (acfChartInstance && props.chartData.acf) {
      animateChartRefresh(acfChartInstance, props.chartData.acf, '自相关函数', 'acf')
    }

    setTimeout(() => {
      if (pacfChartInstance && props.chartData.pacf) {
        animateChartRefresh(pacfChartInstance, props.chartData.pacf, '偏自相关函数', 'pacf')
      }

      setTimeout(() => {
        isRefreshing.value = false
      }, 300)
    }, 300)
  }, 300)
}

// 图表刷新动画
function animateChartRefresh(chartInstance, data, title, type) {
  // 先清空数据
  const emptyOption = {
    series: [
      {
        data: Array(data.values.length).fill(0),
      },
    ],
  }

  chartInstance.setOption(emptyOption)

  // 短暂延迟后重新渲染数据
  setTimeout(() => {
    renderChart(type === 'acf' ? acfChart : pacfChart, chartInstance, data, title, type)
  }, 300)
}

// 图表交互动画
function animateChartActivity(chartInstance) {
  // 创建闪光效果
  const options = chartInstance.getOption()

  // 存储原来的强调效果
  const originalEmphasis = JSON.parse(JSON.stringify(options.series[0].emphasis || {}))

  // 设置新的强调效果
  chartInstance.setOption({
    series: [
      {
        emphasis: {
          itemStyle: {
            shadowBlur: 20,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
      },
    ],
  })

  // 高亮所有柱子
  for (let i = 0; i < options.series[0].data.length; i++) {
    chartInstance.dispatchAction({
      type: 'highlight',
      seriesIndex: 0,
      dataIndex: i,
    })
  }

  // 恢复原样
  setTimeout(() => {
    for (let i = 0; i < options.series[0].data.length; i++) {
      chartInstance.dispatchAction({
        type: 'downplay',
        seriesIndex: 0,
        dataIndex: i,
      })
    }

    // 恢复原来的强调效果
    chartInstance.setOption({
      series: [
        {
          emphasis: originalEmphasis,
        },
      ],
    })
  }, 500)
}

function updateCharts() {
  nextTick(() => {
    isLoading.value = props.loading

    if (props.chartData && props.chartData.acf) {
      acfChartInstance = renderChart(
        acfChart,
        acfChartInstance,
        props.chartData.acf,
        '自相关函数',
        'acf',
      )
    }

    if (props.chartData && props.chartData.pacf) {
      pacfChartInstance = renderChart(
        pacfChart,
        pacfChartInstance,
        props.chartData.pacf,
        '偏自相关函数',
        'pacf',
      )
    }

    // 引入一些动画延迟
    setTimeout(() => {
      isLoading.value = false
    }, 600)
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
    resizeObserver = new ResizeObserver(() => {
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
  intervalId = setInterval(() => {
    checkVisibility()
  }, 200)

  // 60秒后清除定时器，避免长期占用资源
  setTimeout(() => {
    clearInterval(intervalId)
  }, 60000)
}

// 入场动画计时器
function setupEntryAnimation() {
  // 主组件入场动画
  setTimeout(() => {
    showComponent.value = true
  }, 100)
}

onMounted(() => {
  updateCharts()
  window.addEventListener('resize', handleResize)

  // 设置各种观察器
  setupResizeObserver()
  setupMutationObserver()
  setupEntryAnimation()

  // 初始检查可见性
  nextTick(() => {
    checkVisibility()
    // 设置可见性监听
    setupVisibilityInterval()
  })

  // 设置Intersection Observer
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
  window.removeEventListener('resize', handleResize)

  if (resizeObserver) {
    resizeObserver.disconnect()
  }

  if (mutationObserver) {
    mutationObserver.disconnect()
  }

  if (visibilityObserver.value) {
    visibilityObserver.value.disconnect()
  }

  if (intervalId) {
    clearInterval(intervalId)
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

// 监视加载状态
watch(
  () => props.loading,
  (newValue) => {
    isLoading.value = newValue
  },
)

// 动态适应暗色/亮色主题
function detectColorScheme() {
  const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches

  if (isDarkMode) {
    // 适应暗色主题的颜色设置
    themeColors.text = '#E6E1E5'
    themeColors.background = '#1C1B1F'
    themeColors.surface = '#2C2C2C'
    themeColors.outline = '#938F99'
    themeColors.subtle = '#49454F'

    // 更新图表如果已经存在
    if (acfChartInstance || pacfChartInstance) {
      updateCharts()
    }
  }
}

// 初始检测颜色方案
detectColorScheme()

// 创建媒体查询监听器
const colorSchemeQueryList = window.matchMedia('(prefers-color-scheme: dark)')
if (colorSchemeQueryList.addEventListener) {
  colorSchemeQueryList.addEventListener('change', detectColorScheme)
}

// 调用方法也可以定义为组件的方法供外部使用
defineExpose({
  refreshAllCharts,
  downloadChart,
})
</script>

<style scoped>
/* 基础样式 */
.arima-correlation-analysis {
  font-family:
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    Oxygen,
    Ubuntu,
    Cantarell,
    'Open Sans',
    'Helvetica Neue',
    sans-serif;
}

.main-card {
  position: relative;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 16px !important;
  background-color: var(--v-theme-surface) !important;
  border: 1px solid rgba(0, 0, 0, 0.05);
  transform-origin: center;
}

.card-enter {
  animation: cardEnterAnimation 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

.info-card {
  border-radius: 8px;
  background-color: rgba(103, 80, 164, 0.05);
  border: 1px solid rgba(103, 80, 164, 0.1);
}

.interpretation-card {
  border-radius: 8px;
  background-color: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(10px);
}

.sub-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 12px !important;
  overflow: hidden;
  height: 100%;
  position: relative;
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.card-hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12) !important;
  transform: translateY(-4px);
  border-color: rgba(103, 80, 164, 0.3);
}

/* 图表容器样式 */
.chart-container-wrapper {
  position: relative;
  padding: 16px;
}

.chart-row {
  position: relative;
}

.chart-column {
  transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
  opacity: 1;
  transform: translateY(0);
}

.chart-enter-left {
  animation: slideInLeft 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.chart-enter-right {
  animation: slideInRight 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.chart-container {
  width: 100%;
  transition: all 0.3s ease;
  min-height: 300px;
  position: relative;
  border-radius: 0 0 8px 8px;
  background-color: rgba(255, 255, 255, 0.5);
}

.chart-active {
  background-color: rgba(255, 255, 255, 0.8);
}

.chart-title {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background-color: rgba(103, 80, 164, 0.05);
  position: relative;
  z-index: 1;
}

.chart-title-text {
  font-weight: 500;
  transition: all 0.3s ease;
}

.chart-divider {
  margin: 0;
}

.chart-actions {
  display: flex;
  justify-content: flex-end;
  background-color: rgba(255, 255, 255, 0.8);
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

.chart-action-btn {
  margin-left: 8px;
  text-transform: none;
}

.chart-info-chip {
  font-size: 0.75rem;
  height: 22px;
}

.chart-footnote {
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

/* 标题样式 */
.card-title-wrapper {
  display: flex;
  align-items: center;
  position: relative;
  background: linear-gradient(90deg, rgba(103, 80, 164, 0.05) 0%, rgba(255, 255, 255, 0) 100%);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.title-icon-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: rgba(103, 80, 164, 0.1);
  transition: all 0.3s ease;
}

.title-icon {
  font-size: 20px;
  color: #6750a4;
  transition: all 0.3s ease;
}

.icon-spin {
  animation: spin 1.5s infinite linear;
}

.title-text {
  font-weight: 500;
  transition: all 0.3s ease;
}

.title-pulse {
  animation: pulse 1.5s infinite;
}

.info-button {
  transition: all 0.3s ease;
  opacity: 0.7;
}

.info-button:hover {
  opacity: 1;
  transform: scale(1.05);
}

/* 解释部分样式 */
.interpretation-section {
  background-color: rgba(255, 255, 255, 0.7);
  padding: 12px;
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.05);
  height: 100%;
}

.interpretation-list {
  padding-left: 20px;
  margin: 0;
}

.interpretation-list li {
  margin-bottom: 8px;
  line-height: 1.5;
}

.interpretation-list li:last-child {
  margin-bottom: 0;
}

/* 按钮样式 */
.interpretation-btn,
.refresh-all-btn {
  text-transform: none;
  font-weight: normal;
  transition: all 0.3s ease;
}

.interpretation-btn:hover,
.refresh-all-btn:hover {
  transform: translateY(-2px);
}

/* 动画定义 */
@keyframes cardEnterAnimation {
  0% {
    opacity: 0;
    transform: scale(0.95);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes slideInLeft {
  0% {
    opacity: 0;
    transform: translateX(-30px);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideInRight {
  0% {
    opacity: 0;
    transform: translateX(30px);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes pulse {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
  100% {
    opacity: 1;
  }
}

/* 响应式布局 */
@media (max-width: 960px) {
  .chart-column {
    padding: 8px;
  }

  .interpretation-section {
    margin-bottom: 16px;
  }
}

@media (max-width: 600px) {
  .chart-container {
    height: 300px !important;
  }

  .chart-title {
    padding: 8px 12px;
  }

  .card-title-wrapper {
    padding: 12px !important;
  }

  .chart-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .chart-action-btn {
    margin: 4px 0;
    width: 100%;
  }

  .interpretation-btn,
  .refresh-all-btn {
    font-size: 0.75rem;
  }
}

/* 卡片阴影悬停效果 */
.main-card:hover {
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08) !important;
}

/* 表面效果 */
.main-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0) 100%);
  pointer-events: none;
}

/* 滑块和其他交互元素的效果 */
.chart-container :deep(.echarts) {
  transition: all 0.3s ease;
}

.chart-container:hover :deep(.echarts) {
  filter: contrast(1.05);
}

/* 悬停时图表标题的效果 */
.sub-card:hover .chart-title-text {
  color: #6750a4;
  transform: translateX(4px);
}

/* 加载中的容器效果 */
.chart-container:empty {
  display: flex;
  align-items: center;
  justify-content: center;
}

.chart-container:empty::after {
  content: 'Loading chart...';
  color: rgba(0, 0, 0, 0.4);
  font-style: italic;
}

/* 跨浏览器兼容性优化 */
@supports (-webkit-backdrop-filter: blur(10px)) or (backdrop-filter: blur(10px)) {
  .interpretation-card {
    -webkit-backdrop-filter: blur(10px);
    backdrop-filter: blur(10px);
  }
}

/* Ripple effect for cards */
.sub-card::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  background: radial-gradient(circle, rgba(103, 80, 164, 0.2) 0%, rgba(255, 255, 255, 0) 70%);
  transition:
    width 0.6s ease-out,
    height 0.6s ease-out;
  border-radius: 50%;
  pointer-events: none;
  opacity: 0;
  transform: translate(-50%, -50%);
}

.sub-card:active::after {
  width: 150%;
  height: 150%;
  opacity: 1;
  transition:
    width 0.3s ease-out,
    height 0.3s ease-out,
    opacity 0.3s ease-out;
}

/* 增加一些额外的动画和投影效果 */
.chart-container:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.05);
}

/* 表格色彩编码 - 可选的高级视觉效果 */
.card-content-positive {
  border-left: 4px solid #149e60;
}

.card-content-negative {
  border-left: 4px solid #b3261e;
}

/* 使图表角落更圆滑 */
.chart-container {
  border-radius: 0 0 10px 10px;
  overflow: hidden;
}

/* 改善信息卡片的设计 */
.info-card,
.interpretation-card {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

/* 添加轻微的浮动动画效果 */
.sub-card {
  animation: floating 6s ease-in-out infinite;
}

@keyframes floating {
  0% {
    transform: translate(0, 0px);
  }
  50% {
    transform: translate(0, -4px);
  }
  100% {
    transform: translate(0, 0px);
  }
}

/* 为包含多个元素的容器添加交错动画延迟 */
.chart-column:nth-child(1) .sub-card {
  animation-delay: 0s;
}

.chart-column:nth-child(2) .sub-card {
  animation-delay: 1s;
}

/* 给按钮添加轻微的辉光效果 */
.chart-action-btn:hover,
.refresh-all-btn:hover,
.interpretation-btn:hover {
  box-shadow: 0 0 10px rgba(103, 80, 164, 0.3);
}

/* 添加卡片的角落装饰 */
.main-card::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, transparent 50%, rgba(103, 80, 164, 0.05) 50%);
  border-radius: 0 16px 0 0;
  pointer-events: none;
}
</style>
