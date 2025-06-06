<template>
  <v-container fluid class="agv-dispatch-container">
    <!-- 参数设置对话框 -->
    <v-dialog
      v-model="dialogVisible"
      max-width="500px"
      transition="dialog-transition"
      overlay-opacity="0.6"
    >
      <v-card class="dialog-card" elevation="24">
        <v-card-title class="dialog-title">
          <v-icon class="mr-3 title-icon" color="primary">mdi-cog</v-icon>
          <span class="text-h5 font-weight-medium">参数设置</span>
        </v-card-title>

        <v-divider class="divider-animated"></v-divider>

        <v-card-text class="dialog-content">
          <v-container>
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="AGVInput"
                  label="AGV数量"
                  type="number"
                  variant="outlined"
                  prepend-inner-icon="mdi-robot-industrial"
                  class="animated-input"
                  :rules="[(v) => v > 0 || 'AGV数量必须大于0']"
                  @focus="onInputFocus"
                  @blur="onInputBlur"
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="equipInput"
                  label="设备数量"
                  type="number"
                  variant="outlined"
                  prepend-inner-icon="mdi-factory"
                  class="animated-input"
                  :rules="[(v) => (v > 0 && v <= 9) || '设备数量必须在1-9之间']"
                  @focus="onInputFocus"
                  @blur="onInputBlur"
                ></v-text-field>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>

        <v-card-actions class="dialog-actions">
          <v-spacer></v-spacer>
          <v-btn
            variant="text"
            @click="cancel"
            class="action-btn cancel-btn"
            :ripple="{ class: 'grey--text' }"
          >
            <v-icon left>mdi-close</v-icon>
            取消
          </v-btn>
          <v-btn
            color="primary"
            variant="elevated"
            @click="submit"
            class="action-btn submit-btn"
            :loading="computing"
            :disabled="!isFormValid"
            elevation="4"
          >
            <v-icon left>mdi-check</v-icon>
            确定
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 主要内容区域 -->
    <v-fade-transition mode="out-in">
      <v-row v-if="!computing || tableData.length > 0">
        <!-- 表格部分 -->
        <v-col cols="12" lg="6">
          <v-card
            class="data-table-card elevation-hover"
            elevation="6"
            @mouseenter="onCardHover(true)"
            @mouseleave="onCardHover(false)"
          >
            <v-card-title class="card-title">
              <v-icon class="mr-3 title-icon" color="success">mdi-table</v-icon>
              <span class="text-h6 font-weight-medium">AGV调度表</span>
              <v-spacer></v-spacer>
              <v-chip
                :color="tableData.length > 0 ? 'success' : 'grey'"
                variant="elevated"
                size="small"
                class="status-chip"
              >
                <v-icon left size="small">mdi-database</v-icon>
                {{ tableData.length }} 条记录
              </v-chip>
            </v-card-title>

            <v-divider class="divider-animated"></v-divider>

            <v-slide-y-transition>
              <v-data-table
                v-if="tableData.length > 0"
                :headers="headers"
                :items="tableData"
                class="animated-table"
                height="500"
                fixed-header
                hover
                :loading="computing"
                loading-text="正在计算调度方案..."
              >
                <template v-slot:item.timeRange="{ item, index }">
                  <v-slide-x-transition :delay="index * 50">
                    <v-chip color="info" variant="tonal" size="small" class="time-chip">
                      {{ item.start }} - {{ item.end }}
                    </v-chip>
                  </v-slide-x-transition>
                </template>

                <template v-slot:item.job="{ item, index }">
                  <v-slide-x-transition :delay="index * 50 + 25">
                    <v-chip color="primary" variant="elevated" size="small" class="job-chip">
                      <v-icon left size="small">mdi-package-variant</v-icon>
                      {{ item.job }}
                    </v-chip>
                  </v-slide-x-transition>
                </template>

                <template v-slot:item.command="{ item, index }">
                  <v-slide-x-transition :delay="index * 50 + 50">
                    <span class="command-text">{{ item.command }}</span>
                  </v-slide-x-transition>
                </template>
              </v-data-table>

              <v-card-text v-else class="text-center empty-state">
                <v-icon size="64" color="grey-lighten-2">mdi-table-off</v-icon>
                <p class="text-h6 mt-4 text-grey">暂无调度数据</p>
              </v-card-text>
            </v-slide-y-transition>
          </v-card>
        </v-col>

        <!-- 图表部分 -->
        <v-col cols="12" lg="6">
          <v-card
            class="chart-card elevation-hover"
            elevation="6"
            @mouseenter="onCardHover(true)"
            @mouseleave="onCardHover(false)"
          >
            <v-card-title class="card-title">
              <v-icon class="mr-3 title-icon" color="info">mdi-chart-line</v-icon>
              <span class="text-h6 font-weight-medium">可视化分析</span>
              <v-spacer></v-spacer>

              <!-- 图表切换按钮 -->
              <v-btn-toggle
                v-model="activeChart"
                mandatory
                variant="outlined"
                divided
                class="chart-toggle"
              >
                <v-btn value="strategy" size="small" class="toggle-btn">
                  <v-icon>mdi-chart-line</v-icon>
                  <span class="ml-1">策略</span>
                </v-btn>
                <v-btn value="gantt" size="small" class="toggle-btn">
                  <v-icon>mdi-chart-gantt</v-icon>
                  <span class="ml-1">甘特图</span>
                </v-btn>
              </v-btn-toggle>
            </v-card-title>

            <v-divider class="divider-animated"></v-divider>

            <v-card-text class="chart-content">
              <!-- 计算进度显示 -->
              <v-expand-transition>
                <v-alert
                  v-if="computing"
                  type="info"
                  variant="tonal"
                  class="mb-4 computing-alert"
                  prominent
                >
                  <template v-slot:prepend>
                    <v-progress-circular
                      indeterminate
                      size="24"
                      width="3"
                      color="info"
                    ></v-progress-circular>
                  </template>

                  <div class="computing-content">
                    <div class="text-h6 mb-2">正在计算AGV调度方案</div>
                    <v-expand-transition>
                      <div v-if="computeProgress.generation >= 0" class="progress-details">
                        <div class="d-flex align-center mb-2">
                          <span class="text-body-2 mr-2">进化代数:</span>
                          <v-chip
                            color="info"
                            size="small"
                            variant="elevated"
                            class="generation-chip"
                          >
                            第 {{ computeProgress.generation }} 代
                          </v-chip>
                        </div>
                        <v-progress-linear
                          :model-value="computeProgress.progress"
                          color="info"
                          height="8"
                          rounded
                          class="progress-bar"
                        >
                          <template v-slot:default="{ value }">
                            <span class="progress-text">{{ Math.ceil(value) }}%</span>
                          </template>
                        </v-progress-linear>
                      </div>
                    </v-expand-transition>
                  </div>
                </v-alert>
              </v-expand-transition>

              <!-- 图表容器 -->
              <div class="charts-wrapper">
                <v-fade-transition mode="out-in">
                  <div
                    v-if="activeChart === 'strategy'"
                    key="strategy"
                    ref="echarts1Ref"
                    class="plot strategy-chart"
                  ></div>
                  <div v-else key="gantt" ref="echarts3Ref" class="plot gantt-chart"></div>
                </v-fade-transition>

                <!-- 收敛图 -->
                <v-slide-y-transition>
                  <div
                    v-if="echarts2Data.length > 0"
                    ref="echarts2Ref"
                    class="plot convergence-chart"
                  ></div>
                </v-slide-y-transition>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- 加载状态 -->
      <v-row v-else class="loading-container">
        <v-col cols="12" class="text-center">
          <div class="loading-content">
            <v-progress-circular
              indeterminate
              size="80"
              width="6"
              color="primary"
              class="mb-6"
            ></v-progress-circular>
            <v-card class="loading-card" elevation="8" max-width="400" mx-auto>
              <v-card-text class="text-center">
                <h3 class="text-h5 mb-4">初始化调度系统</h3>
                <p class="text-body-1 text-grey">正在启动智能算法引擎...</p>
              </v-card-text>
            </v-card>
          </div>
        </v-col>
      </v-row>
    </v-fade-transition>

    <!-- 浮动操作按钮 -->
    <v-fab-transition>
      <v-btn
        v-if="!computing"
        color="success"
        icon="mdi-cog"
        class="fab-button"
        size="large"
        elevation="8"
        @click="dialogVisible = true"
      >
        <v-icon size="24">mdi-cog</v-icon>
        <v-tooltip activator="parent" location="left"> 设置参数 </v-tooltip>
      </v-btn>
    </v-fab-transition>

    <!-- 快速状态栏 -->
    <v-slide-y-reverse-transition>
      <v-card v-if="tableData.length > 0" class="status-bar" elevation="12" rounded="pill">
        <v-card-text class="d-flex align-center px-6 py-3">
          <v-icon color="success" class="mr-3">mdi-check-circle</v-icon>
          <span class="text-body-2 font-weight-medium">
            调度完成 | AGV: {{ AGVNum }} 台 | 设备: {{ equipNum }} 台 | 任务:
            {{ tableData.length }} 个
          </span>
          <v-spacer></v-spacer>
          <v-btn
            icon="mdi-refresh"
            size="small"
            variant="text"
            @click="refreshData"
            class="refresh-btn"
          >
            <v-icon>mdi-refresh</v-icon>
          </v-btn>
        </v-card-text>
      </v-card>
    </v-slide-y-reverse-transition>
  </v-container>
</template>

<script setup>
import { ref, onMounted, nextTick, onUnmounted, computed, watch } from 'vue'
import * as echarts from 'echarts'

// 响应式数据
const tableData = ref([])
const echarts1Data = ref([])
const echarts2Data = ref([])
const echarts3Data = ref([])
const num = ref(0)
const AGVNum = ref(3)
const equipNum = ref(9)
const AGVInput = ref(null)
const equipInput = ref(null)
const dialogVisible = ref(false)
const showChart1 = ref(true)
const computing = ref(false)
const computeProgress = ref({ progress: 0, generation: -1 })

// DOM引用
const echarts1Ref = ref(null)
const echarts2Ref = ref(null)
const echarts3Ref = ref(null)

// 图表实例
let echarts1Instance = null
let echarts2Instance = null
let echarts3Instance = null

// Web Worker
let worker = null

// 表格头部配置
const headers = [
  { title: 'AGV序号', key: 'number', width: 100 },
  { title: '时间范围', key: 'timeRange', width: 200 },
  { title: '产品名称', key: 'job', width: 100 },
  { title: '运行指令', key: 'command' },
]

// 初始化 Web Worker
const initWorker = () => {
  try {
    worker = new Worker(new URL('./jfspWorker.js', import.meta.url))

    worker.onmessage = (e) => {
      const { type, data, error, progress, generation } = e.data

      if (type === 'result') {
        handleAlgorithmResult(data)
      } else if (type === 'error') {
        console.error('算法计算失败:', error)
        computing.value = false
        computeProgress.value = { progress: 0, generation: -1 }
      } else if (type === 'progress') {
        computeProgress.value = { progress, generation }
      }
    }

    worker.onerror = (error) => {
      console.error('Worker 错误:', error)
      computing.value = false
      computeProgress.value = { progress: 0, generation: -1 }
    }
  } catch (error) {
    console.error('Web Worker 不支持，使用同步计算')
    worker = null
  }
}

// 处理算法结果
const handleAlgorithmResult = (result) => {
  tableData.value = result.scheduleData
  echarts1Data.value = result.strategyData
  echarts2Data.value = result.convergenceData
  echarts3Data.value = result.ganttData
  num.value = result.productCount

  // 存储到localStorage
  const agvMonitorTable = tableData.value.map((item) => ({
    agv: item.number,
    product: item.job,
    command: item.command,
  }))
  localStorage.setItem('tabledata', JSON.stringify(agvMonitorTable))

  computing.value = false
  computeProgress.value = { progress: 100, generation: -1 }

  // 绘制图表
  nextTick(() => {
    setTimeout(() => {
      drawChart()
    }, 100)
  })
}

// AGV调度计算
const AGVPlan = async () => {
  try {
    computing.value = true
    computeProgress.value = { progress: 0, generation: 0 }

    if (worker) {
      // 使用 Web Worker 计算
      worker.postMessage({
        AGVNum: AGVNum.value,
        equipNum: equipNum.value,
      })
    } else {
      // 降级到同步计算（简化版本）
      setTimeout(() => {
        const result = generateMockData()
        handleAlgorithmResult(result)
      }, 1000)
    }
  } catch (error) {
    console.error('AGV调度计算失败:', error)
    computing.value = false
    computeProgress.value = { progress: 0, generation: -1 }
  }
}

// 生成模拟数据（当 Worker 不可用时）
const generateMockData = () => {
  const scheduleData = []
  const ganttData = []
  const strategyData = []
  const convergenceData = []

  // 生成模拟调度数据
  for (let i = 0; i < AGVNum.value; i++) {
    for (let j = 0; j < 3; j++) {
      scheduleData.push({
        number: i + 1,
        start: j * 10 + i * 2,
        end: (j + 1) * 10 + i * 2,
        job: `产品${j + 1}`,
        command: `工位${j + 1} -> 工位${j + 2}`,
      })
    }
  }

  // 生成模拟甘特图数据
  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 3; j++) {
      ganttData.push({
        workpiece: i,
        process: j,
        machine: j % equipNum.value,
        startTime: j * 15 + i * 3,
        endTime: (j + 1) * 15 + i * 3,
        duration: 15,
      })
    }
  }

  // 生成模拟策略数据
  for (let i = 0; i < 5; i++) {
    const data = []
    for (let j = 0; j < 3; j++) {
      data.push([j * 15 + i * 3, j % equipNum.value])
      data.push([(j + 1) * 15 + i * 3, j % equipNum.value])
    }
    strategyData.push(data)
  }

  // 生成模拟收敛数据
  for (let i = 0; i < 50; i++) {
    convergenceData.push([i, 100 - i * 0.5 + Math.random() * 5])
  }

  return {
    scheduleData,
    strategyData,
    convergenceData,
    ganttData,
    productCount: 5,
    machineCount: equipNum.value,
  }
}

// 绘制图表
const drawChart = () => {
  try {
    drawStrategyChart()
    drawConvergenceChart()
    drawGanttChart()
  } catch (error) {
    console.error('绘制图表失败:', error)
  }
}

// 绘制调度策略图
const drawStrategyChart = () => {
  try {
    if (!echarts1Ref.value) {
      console.error('echarts1Ref DOM元素不存在')
      return
    }

    if (echarts1Instance) {
      echarts1Instance.dispose()
    }

    echarts1Instance = echarts.init(echarts1Ref.value)

    const option = {
      legend: { show: true },
      title: { text: '调度策略' },
      tooltip: { trigger: 'axis' },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          formatter: (value) => `工位${value + 1}`,
        },
      },
      series: echarts1Data.value.map((dataSet, index) => ({
        name: `产品${index + 1}`,
        type: 'line',
        data: dataSet,
        connectNulls: true,
        smooth: false,
      })),
    }

    echarts1Instance.setOption(option)
  } catch (error) {
    console.error('绘制策略图失败:', error)
  }
}

// 绘制甘特图
const drawGanttChart = () => {
  try {
    if (!echarts3Ref.value) {
      console.error('echarts3Ref DOM元素不存在')
      return
    }

    if (echarts3Instance) {
      echarts3Instance.dispose()
    }

    echarts3Instance = echarts.init(echarts3Ref.value)

    const Colors = [
      '#5470c6',
      '#91cc75',
      '#fac858',
      '#ee6666',
      '#73c0de',
      '#3ba272',
      '#fc8452',
      '#9a60b4',
      '#ea7ccc',
      '#ff9f7f',
      '#ffdb5c',
      '#ff7c7c',
      '#9fe6b8',
      '#87ceeb',
      '#dda0dd',
    ]

    const dataSource = echarts3Data.value
    if (!dataSource || dataSource.length === 0) {
      return
    }

    // 按机器分组数据
    const machines = {}
    dataSource.forEach((item) => {
      if (!machines[item.machine]) {
        machines[item.machine] = []
      }
      machines[item.machine].push(item)
    })

    // 按工件分组以确定颜色
    const workpieces = {}
    dataSource.forEach((item) => {
      if (!workpieces[item.workpiece]) {
        workpieces[item.workpiece] = []
      }
      workpieces[item.workpiece].push(item)
    })

    // 生成甘特图数据
    const ganttSeries = []
    const machineNames = Object.keys(machines).sort((a, b) => parseInt(a) - parseInt(b))

    // 为每个工件创建一个系列
    Object.keys(workpieces).forEach((workpieceId, index) => {
      const workpieceOps = workpieces[workpieceId]
      const seriesData = []

      workpieceOps.forEach((op) => {
        const machineIndex = machineNames.indexOf(op.machine.toString())
        seriesData.push({
          name: `产品${parseInt(workpieceId) + 1}`,
          value: [machineIndex, op.startTime, op.endTime, op.duration || op.endTime - op.startTime],
          itemStyle: {
            color: Colors[index % Colors.length],
          },
        })
      })

      if (seriesData.length > 0) {
        ganttSeries.push({
          name: `产品${parseInt(workpieceId) + 1}`,
          type: 'custom',
          renderItem: renderGanttItem,
          encode: {
            x: [1, 2],
            y: 0,
          },
          data: seriesData,
        })
      }
    })

    function renderGanttItem(params, api) {
      const categoryIndex = api.value(0)
      const start = api.coord([api.value(1), categoryIndex])
      const end = api.coord([api.value(2), categoryIndex])
      const height = api.size([0, 1])[1] * 0.6

      const rectShape = echarts.graphic.clipRectByRect(
        {
          x: start[0],
          y: start[1] - height / 2,
          width: end[0] - start[0],
          height: height,
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
          style: api.style(),
          styleEmphasis: {
            stroke: '#333',
            strokeWidth: 2,
          },
        }
      )
    }

    const option = {
      tooltip: {
        formatter: function (params) {
          const data = params.data.value
          return `
            <div>
              <strong>${params.data.name}</strong><br/>
              机器: 工位${parseInt(machineNames[data[0]]) + 1}<br/>
              开始时间: ${data[1]}<br/>
              结束时间: ${data[2]}<br/>
              持续时间: ${data[3]}
            </div>
          `
        },
      },
      title: {
        text: '甘特图',
        left: 'center',
        textStyle: {
          fontSize: 16,
        },
      },
      legend: {
        type: 'scroll',
        orient: 'horizontal',
        top: 30,
        itemWidth: 12,
        itemHeight: 12,
      },
      grid: {
        left: 80,
        right: 20,
        top: 80,
        bottom: 40,
        containLabel: false,
      },
      xAxis: {
        type: 'value',
        scale: true,
        name: '时间',
        nameLocation: 'middle',
        nameGap: 25,
        axisLine: {
          show: true,
        },
        axisTick: {
          show: true,
        },
        splitLine: {
          show: true,
          lineStyle: {
            type: 'dashed',
            opacity: 0.5,
          },
        },
      },
      yAxis: {
        type: 'category',
        data: machineNames.map((m) => `工位${parseInt(m) + 1}`),
        axisLine: {
          show: true,
        },
        axisTick: {
          show: false,
        },
        axisLabel: {
          fontSize: 12,
        },
        splitLine: {
          show: true,
          lineStyle: {
            type: 'solid',
            opacity: 0.3,
          },
        },
      },
      series: ganttSeries,
    }

    echarts3Instance.setOption(option)

    // 添加窗口大小变化监听
    window.addEventListener('resize', () => {
      if (echarts3Instance) {
        echarts3Instance.resize()
      }
    })
  } catch (error) {
    console.error('绘制甘特图失败:', error)
  }
}

// 绘制收敛图
const drawConvergenceChart = () => {
  try {
    if (!echarts2Ref.value) {
      console.error('echarts2Ref DOM元素不存在')
      return
    }

    if (echarts2Instance) {
      echarts2Instance.dispose()
    }

    echarts2Instance = echarts.init(echarts2Ref.value)

    const option = {
      title: { text: '算法收敛情况' },
      tooltip: { trigger: 'axis' },
      grid: {
        left: '1%',
        right: '4%',
        top: '20%',
        bottom: '3%',
        containLabel: true,
      },
      xAxis: { type: 'value' },
      yAxis: {
        type: 'value',
        name: '时间/s',
      },
      series: [
        {
          name: '时间',
          type: 'line',
          smooth: true,
          data: echarts2Data.value,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#64CAFA' },
              { offset: 1, color: '#0078D7' },
            ]),
          },
          areaStyle: {},
        },
      ],
    }

    echarts2Instance.setOption(option)
  } catch (error) {
    console.error('绘制收敛图失败:', error)
  }
}

// 新增响应式数据
const activeChart = ref('strategy')
const isFormValid = computed(() => {
  return AGVInput.value > 0 && equipInput.value > 0 && equipInput.value <= 9
})

// 动画事件处理
const onInputFocus = (event) => {
  event.target.parentElement.classList.add('input-focused')
}

const onInputBlur = (event) => {
  event.target.parentElement.classList.remove('input-focused')
}

const onCardHover = (isHover) => {
  // 卡片悬停效果已通过CSS处理
}

const refreshData = () => {
  AGVPlan()
}

// 监听图表切换
watch(activeChart, (newChart) => {
  nextTick(() => {
    if (newChart === 'strategy') {
      setTimeout(() => drawStrategyChart(), 300)
    } else {
      setTimeout(() => drawGanttChart(), 300)
    }
  })
})

// 切换图表显示（保持兼容性）
const change = () => {
  activeChart.value = activeChart.value === 'strategy' ? 'gantt' : 'strategy'
}

// 关闭对话框
const handleClose = () => {
  dialogVisible.value = false
  AGVInput.value = null
  equipInput.value = null
}

const cancel = () => {
  handleClose()
}

// 提交参数
const submit = () => {
  AGVNum.value = AGVInput.value
  equipNum.value = equipInput.value
  handleClose()

  // 销毁现有图表实例
  if (echarts1Instance) {
    echarts1Instance.dispose()
    echarts1Instance = null
  }
  if (echarts2Instance) {
    echarts2Instance.dispose()
    echarts2Instance = null
  }
  if (echarts3Instance) {
    echarts3Instance.dispose()
    echarts3Instance = null
  }

  AGVPlan()
}

// 组件挂载时执行
onMounted(() => {
  initWorker()
  setTimeout(() => {
    AGVPlan()
  }, 300)
})

// 组件卸载时清理
onUnmounted(() => {
  if (worker) {
    worker.terminate()
  }
})
</script>

<style scoped>
.agv-dispatch-container {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  padding: 24px;
}

/* 对话框动画 */
.dialog-card {
  border-radius: 16px !important;
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.95) !important;
}

.dialog-title {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white !important;
  border-radius: 16px 16px 0 0;
  padding: 20px 24px;
}

.title-icon {
  animation: iconPulse 2s ease-in-out infinite;
}

@keyframes iconPulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

.divider-animated {
  background: linear-gradient(90deg, transparent, #667eea, transparent);
  height: 2px;
  animation: dividerGlow 3s ease-in-out infinite;
}

@keyframes dividerGlow {
  0%,
  100% {
    opacity: 0.3;
  }
  50% {
    opacity: 1;
  }
}

.dialog-content {
  padding: 24px !important;
}

.animated-input {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.animated-input:focus-within {
  transform: translateY(-2px);
}

.dialog-actions {
  padding: 16px 24px 24px;
}

.action-btn {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 12px;
  text-transform: none;
  font-weight: 500;
}

.action-btn:hover {
  transform: translateY(-2px);
}

.submit-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4);
}

.submit-btn:hover {
  box-shadow: 0 6px 25px rgba(102, 126, 234, 0.6);
}

/* 卡片样式 */
.data-table-card,
.chart-card {
  border-radius: 16px !important;
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.95) !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.elevation-hover:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15) !important;
}

.card-title {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white !important;
  padding: 20px 24px;
  border-radius: 16px 16px 0 0;
}

/* 表格动画 */
.animated-table {
  background: transparent !important;
}

.animated-table ::v-deep(.v-data-table__wrapper) {
  border-radius: 0 0 16px 16px;
}

.animated-table ::v-deep(tr) {
  transition: all 0.3s ease;
}

.animated-table ::v-deep(tr:hover) {
  background: rgba(102, 126, 234, 0.1) !important;
  transform: scale(1.01);
}

.time-chip,
.job-chip {
  animation: chipSlideIn 0.6s ease;
}

@keyframes chipSlideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.command-text {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.875rem;
  color: #424242;
  animation: textFadeIn 0.8s ease;
}

@keyframes textFadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* 图表区域 */
.chart-toggle {
  border-radius: 12px !important;
}

.toggle-btn {
  transition: all 0.3s ease;
  border-radius: 12px;
}

.chart-content {
  padding: 24px !important;
}

.computing-alert {
  border-radius: 12px !important;
  border-left: 4px solid #2196f3;
  animation: alertPulse 2s ease-in-out infinite;
}

@keyframes alertPulse {
  0%,
  100% {
    box-shadow: 0 2px 8px rgba(33, 150, 243, 0.3);
  }
  50% {
    box-shadow: 0 4px 16px rgba(33, 150, 243, 0.5);
  }
}

.generation-chip {
  animation: chipBounce 0.8s ease;
}

@keyframes chipBounce {
  0%,
  20%,
  50%,
  80%,
  100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
}

.progress-bar {
  border-radius: 8px;
  overflow: hidden;
}

.progress-text {
  font-size: 0.75rem;
  font-weight: 600;
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

/* 图表容器 */
.charts-wrapper {
  border-radius: 12px;
  overflow: hidden;
}

.plot {
  width: 100%;
  height: 300px;
  margin-bottom: 16px;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.plot:hover {
  transform: scale(1.02);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

/* 加载状态 */
.loading-container {
  min-height: 60vh;
  display: flex;
  align-items: center;
}

.loading-content {
  animation: loadingPulse 2s ease-in-out infinite;
}

@keyframes loadingPulse {
  0%,
  100% {
    opacity: 0.8;
  }
  50% {
    opacity: 1;
  }
}

.loading-card {
  border-radius: 16px !important;
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.9) !important;
}

/* 浮动按钮 */
.fab-button {
  position: fixed !important;
  bottom: 32px;
  right: 32px;
  z-index: 10;
  background: linear-gradient(135deg, #4caf50 0%, #45a049 100%) !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.fab-button:hover {
  transform: scale(1.1) rotate(90deg);
  box-shadow: 0 8px 30px rgba(76, 175, 80, 0.4);
}

/* 状态栏 */
.status-bar {
  position: fixed !important;
  bottom: 32px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9;
  backdrop-filter: blur(15px);
  background: rgba(255, 255, 255, 0.9) !important;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.refresh-btn {
  transition: transform 0.3s ease;
}

.refresh-btn:hover {
  transform: rotate(180deg);
}

/* 空状态 */
.empty-state {
  padding: 60px 24px;
  animation: emptyStateFade 1s ease;
}

@keyframes emptyStateFade {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 状态芯片 */
.status-chip {
  animation: chipSlideIn 0.8s ease;
}

/* 响应式设计 */
@media (max-width: 960px) {
  .fab-button {
    bottom: 16px;
    right: 16px;
  }

  .status-bar {
    bottom: 16px;
    left: 16px;
    right: 16px;
    transform: none;
  }

  .plot {
    height: 250px;
  }
}

/* 自定义滚动条 */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
}
</style>
