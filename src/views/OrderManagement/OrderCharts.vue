<template>
  <v-container fluid class="order-dashboard pa-0">
    <v-row>
      <v-col cols="12">
        <v-card class="mb-4 rounded-lg" elevation="2">
          <v-card-title class="text-h5 font-weight-bold primary-text">
            订单数据分析仪表盘
            <v-spacer></v-spacer>
            <v-btn
              color="primary"
              variant="tonal"
              prepend-icon="mdi-refresh"
              @click="refreshData"
              :loading="isLoading"
            >
              刷新数据
            </v-btn>
          </v-card-title>
          <v-card-subtitle class="secondary-text">
            数据更新时间: {{ formattedDate }}
          </v-card-subtitle>

          <v-divider></v-divider>

          <v-card-text>
            <v-row
              class="mb-4 tw:-motion-translate-x-in-50 tw:-motion-translate-y-in-50 tw:motion-duration-1000 tw:motion-blur-in-lg tw:motion-ease-out"
            >
              <v-col v-for="(stat, index) in keyStats" :key="index" cols="12" sm="6" md="3">
                <v-card class="stat-card pa-4 rounded-lg" elevation="1" :color="stat.color">
                  <div class="d-flex align-center">
                    <v-icon :icon="stat.icon" size="large" class="mr-3"></v-icon>
                    <div>
                      <div class="text-subtitle-2">{{ stat.title }}</div>
                      <div class="text-h5 font-weight-bold">{{ stat.value }}</div>
                    </div>
                  </div>
                </v-card>
              </v-col>
            </v-row>

            <v-row>
              <v-col
                cols="12"
                md="8"
                class="tw:motion-blur-in-lg tw:-motion-translate-x-in-50 tw:-motion-translate-y-in-50 tw:motion-duration-1000 tw:motion-ease-out tw:motion-delay-100"
              >
                <v-card
                  class="rounded-lg tw:hover:!shadow-m-elevation-8 tw:hover:-translate-y-2 tw:ease-in-out tw:duration-500 tw:!transition-all"
                  elevation="1"
                >
                  <v-card-title class="text-subtitle-1 font-weight-bold">
                    订单数量趋势分析
                    <v-spacer></v-spacer>
                    <v-btn-toggle
                      v-model="selectedTrendTimeframe"
                      mandatory
                      color="primary"
                      density="comfortable"
                    >
                      <v-btn value="week">周</v-btn>
                      <v-btn value="month">月</v-btn>
                      <v-btn value="year">年</v-btn>
                    </v-btn-toggle>
                  </v-card-title>
                  <v-card-text>
                    <div ref="trendChart" class="chart-container"></div>
                  </v-card-text>
                </v-card>
              </v-col>

              <v-col
                cols="12"
                md="4"
                class="tw:motion-blur-in-lg tw:-motion-translate-x-in-50 tw:-motion-translate-y-in-50 tw:motion-duration-1000 tw:motion-ease-out tw:motion-delay-200"
              >
                <v-card
                  class="rounded-lg tw:hover:!shadow-m-elevation-8 tw:hover:-translate-y-2 tw:ease-in-out tw:duration-500 tw:!transition-all"
                  elevation="1"
                >
                  <v-card-title class="text-subtitle-1 font-weight-bold">
                    订单类别分布
                  </v-card-title>
                  <v-card-text>
                    <div ref="categoryChart" class="chart-container"></div>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>

            <v-row
              class="mt-4 tw:-motion-translate-x-in-50 tw:-motion-translate-y-in-50 tw:motion-duration-1000 tw:motion-ease-out tw:motion-delay-300 tw:motion-blur-in-lg"
            >
              <v-col cols="12" md="6">
                <v-card
                  class="rounded-lg tw:hover:!shadow-m-elevation-8 tw:hover:-translate-y-2 tw:ease-in-out tw:duration-500 tw:!transition-all"
                  elevation="1"
                >
                  <v-card-title class="text-subtitle-1 font-weight-bold"> 优先级分布 </v-card-title>
                  <v-card-text>
                    <div ref="priorityChart" class="chart-container"></div>
                  </v-card-text>
                </v-card>
              </v-col>

              <v-col cols="12" md="6">
                <v-card
                  class="rounded-lg tw:hover:!shadow-m-elevation-8 tw:hover:-translate-y-2 tw:ease-in-out tw:duration-500 tw:!transition-all"
                  elevation="1"
                >
                  <v-card-title class="text-subtitle-1 font-weight-bold">
                    订单量与优先级关系
                  </v-card-title>
                  <v-card-text>
                    <div ref="quantityPriorityChart" class="chart-container"></div>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>

            <v-row class="mt-4">
              <v-col cols="12">
                <v-card
                  class="rounded-lg tw:hover:!shadow-m-elevation-8 tw:hover:-translate-y-2 tw:ease-in-out tw:duration-500 tw:!transition-all"
                  elevation="1"
                >
                  <v-card-title class="text-subtitle-1 font-weight-bold">
                    高级分析
                    <v-spacer></v-spacer>
                    <v-select
                      v-model="selectedAnalysisType"
                      :items="analysisTypes"
                      label="分析类型"
                      variant="outlined"
                      hide-details
                      density="comfortable"
                      class="analysis-select"
                    ></v-select>
                  </v-card-title>
                  <v-card-text>
                    <div ref="advancedAnalysisChart" class="chart-container advanced-chart"></div>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <v-card class="rounded-lg" elevation="2">
          <v-card-title class="text-h6 font-weight-bold primary-text">
            订单数据详情
            <v-spacer></v-spacer>
            <v-text-field
              v-model="search"
              label="搜索"
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              hide-details
              density="comfortable"
              class="search-field"
              @keyup.enter="handleSearch"
            ></v-text-field>
          </v-card-title>

          <v-data-table-server
            v-model:items-per-page="itemsPerPage"
            :headers="headers"
            :items="filteredOrders"
            :search="search"
            class="elevation-1 mt-2"
            item-value="order_id"
          >
            <template v-slot:item.priority="{ item }">
              <v-chip
                :color="getPriorityColor(item.priority)"
                :text-color="getPriorityTextColor(item.priority)"
                size="small"
              >
                {{ getPriorityLabel(item.priority) }}
              </v-chip>
            </template>

            <template v-slot:item.product_type="{ item }">
              <v-chip :color="getCategoryColor(item.product_type)" size="small" variant="tonal">
                {{ item.product_type }}
              </v-chip>
            </template>

            <template v-slot:item.order_quantity="{ item }">
              <v-progress-linear
                :model-value="item.order_quantity"
                :color="getQuantityColor(item.order_quantity)"
                height="8"
                rounded
                class="mt-2 mb-2"
              ></v-progress-linear>
              <span class="text-caption">{{ item.order_quantity }}</span>
            </template>
          </v-data-table-server>
        </v-card>
      </v-col>
    </v-row>

    <!-- Filter Dialog -->
    <v-dialog v-model="filterDialog" max-width="600">
      <v-card>
        <v-card-title class="text-h6">高级筛选</v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12" sm="6">
              <v-select
                v-model="filters.productTypes"
                :items="availableProductTypes"
                label="产品类型"
                multiple
                chips
                variant="outlined"
              ></v-select>
            </v-col>
            <v-col cols="12" sm="6">
              <v-range-slider
                v-model="filters.priorityRange"
                label="优先级范围"
                min="1"
                max="10"
                step="1"
                thumb-label="always"
              ></v-range-slider>
            </v-col>
            <v-col cols="12">
              <v-range-slider
                v-model="filters.quantityRange"
                label="数量范围"
                min="0"
                max="100"
                step="1"
                thumb-label="always"
              ></v-range-slider>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" variant="text" @click="resetFilters">重置</v-btn>
          <v-btn color="primary" @click="applyFilters">应用</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Insights Dialog -->
    <v-dialog v-model="insightsDialog" fullscreen>
      <v-card>
        <v-toolbar color="primary">
          <v-btn icon @click="insightsDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
          <v-toolbar-title>数据洞察</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn icon @click="exportInsights">
            <v-icon>mdi-export</v-icon>
          </v-btn>
        </v-toolbar>

        <v-card-text>
          <v-row>
            <v-col cols="12" md="6">
              <v-card class="mb-4">
                <v-card-title class="text-subtitle-1">关键见解</v-card-title>
                <v-card-text>
                  <v-list lines="two">
                    <v-list-item v-for="(insight, i) in keyInsights" :key="i">
                      <template v-slot:prepend>
                        <v-icon :color="insight.color" :icon="insight.icon"></v-icon>
                      </template>
                      <v-list-item-title>{{ insight.title }}</v-list-item-title>
                      <v-list-item-subtitle>{{ insight.description }}</v-list-item-subtitle>
                    </v-list-item>
                  </v-list>
                </v-card-text>
              </v-card>
            </v-col>

            <v-col cols="12" md="6">
              <v-card>
                <v-card-title class="text-subtitle-1">异常检测</v-card-title>
                <v-card-text>
                  <div ref="anomalyChart" style="height: 300px"></div>
                  <v-alert v-if="anomalies.length > 0" color="warning" variant="tonal" class="mt-4">
                    <div class="text-subtitle-2 mb-2">检测到 {{ anomalies.length }} 个潜在异常</div>
                    <v-list density="compact">
                      <v-list-item v-for="(anomaly, i) in anomalies" :key="i">
                        <v-list-item-title>{{ anomaly.description }}</v-list-item-title>
                        <v-list-item-subtitle>订单 #{{ anomaly.order_id }}</v-list-item-subtitle>
                      </v-list-item>
                    </v-list>
                  </v-alert>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>

          <v-row class="mt-4">
            <v-col cols="12">
              <v-card>
                <v-card-title class="text-subtitle-1">预测分析</v-card-title>
                <v-card-text>
                  <div ref="forecastChart" style="height: 400px"></div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import { defineComponent, ref, onMounted, watch, computed } from 'vue'
import { useOrder } from '@/stores/order'
import * as echarts from 'echarts'

export default defineComponent({
  name: 'OrderAnalyticsDashboard',

  setup() {
    const orderStore = useOrder()
    const trendChart = ref(null)
    const categoryChart = ref(null)
    const priorityChart = ref(null)
    const quantityPriorityChart = ref(null)
    const advancedAnalysisChart = ref(null)
    const anomalyChart = ref(null)
    const forecastChart = ref(null)
    const isLoading = ref(false)
    const search = ref('')
    const selectedTrendTimeframe = ref('month')
    const selectedAnalysisType = ref('产品类型与订单量相关性')
    const filterDialog = ref(false)
    const insightsDialog = ref(false)
    const itemsPerPage = ref(10)

    // 图表实例
    let trendChartInstance = null
    let categoryChartInstance = null
    let priorityChartInstance = null
    let quantityPriorityChartInstance = null
    let advancedAnalysisChartInstance = null
    let anomalyChartInstance = null
    let forecastChartInstance = null

    // 筛选器状态
    const filters = ref({
      productTypes: [],
      priorityRange: [1, 10],
      quantityRange: [0, 100],
    })

    // 表格头部定义
    const headers = ref([
      { title: '订单号', key: 'order_id', sortable: true },
      { title: '产品类型', key: 'product_type', sortable: true },
      { title: '数量', key: 'order_quantity', sortable: true },
      { title: '日期', key: 'order_date', sortable: true },
      { title: '优先级', key: 'priority', sortable: true },
    ])

    // 计算属性：过滤后的订单列表
    const filteredOrders = computed(() => {
      return orderStore.show_list
    })

    // 计算属性：可用的产品类型列表
    const availableProductTypes = computed(() => {
      const types = new Set()
      orderStore.show_list.forEach((order) => {
        types.add(order.product_type)
      })
      return Array.from(types)
    })

    // 计算属性：当前日期
    const formattedDate = computed(() => {
      const now = new Date()
      return now.toLocaleString('zh-CN')
    })

    // 计算属性：关键统计数据
    const keyStats = computed(() => {
      const orders = orderStore.show_list
      if (!orders.length) return []

      // 计算总订单数
      const totalOrders = orders.length

      // 计算总订单量
      const totalQuantity = orders.reduce((sum, order) => sum + parseInt(order.order_quantity), 0)

      // 计算平均优先级
      const avgPriority =
        orders.reduce((sum, order) => sum + parseInt(order.priority), 0) / totalOrders

      // 计算高优先级订单数（优先级 >= 8）
      const highPriorityOrders = orders.filter((order) => parseInt(order.priority) >= 8).length

      return [
        {
          title: '总订单数',
          value: totalOrders,
          icon: 'mdi-clipboard-list',
          color: 'bg-blue-lighten-5',
        },
        {
          title: '总订单量',
          value: totalQuantity,
          icon: 'mdi-package-variant',
          color: 'bg-green-lighten-5',
        },
        {
          title: '平均优先级',
          value: avgPriority.toFixed(1),
          icon: 'mdi-alert-circle',
          color: 'bg-orange-lighten-5',
        },
        {
          title: '高优先级订单',
          value: highPriorityOrders,
          icon: 'mdi-flag',
          color: 'bg-red-lighten-5',
        },
      ]
    })

    // 计算属性：分析类型选项
    const analysisTypes = computed(() => [
      '产品类型与订单量相关性',
      '优先级与日期分布',
      '订单量分布热力图',
      '订单组合分析',
    ])

    // 计算属性：洞察数据
    const keyInsights = computed(() => {
      const orders = orderStore.show_list
      if (!orders.length) return []

      // 找出最受欢迎的产品类型
      const productTypeCounts = {}
      orders.forEach((order) => {
        productTypeCounts[order.product_type] = (productTypeCounts[order.product_type] || 0) + 1
      })

      let popularType = ''
      let maxCount = 0
      Object.entries(productTypeCounts).forEach(([type, count]) => {
        if (count > maxCount) {
          maxCount = count
          popularType = type
        }
      })

      // 分析优先级趋势
      const priorityByMonth = {}
      orders.forEach((order) => {
        const month = order.order_date.substring(5, 7) // 假设格式是 "2025-XX-XX"
        if (!priorityByMonth[month]) {
          priorityByMonth[month] = { total: 0, count: 0 }
        }
        priorityByMonth[month].total += parseInt(order.priority)
        priorityByMonth[month].count += 1
      })

      let isRising = true
      let lastAvg = 0
      Object.values(priorityByMonth).forEach(({ total, count }, index) => {
        const avg = total / count
        if (index > 0 && avg < lastAvg) {
          isRising = false
        }
        lastAvg = avg
      })

      // 分析订单量变化
      const quantityByMonth = {}
      orders.forEach((order) => {
        const month = order.order_date.substring(5, 7)
        if (!quantityByMonth[month]) {
          quantityByMonth[month] = 0
        }
        quantityByMonth[month] += parseInt(order.order_quantity)
      })

      const months = Object.keys(quantityByMonth).sort()
      const isQuantityIncreasing =
        months.length >= 2 &&
        quantityByMonth[months[months.length - 1]] > quantityByMonth[months[0]]

      return [
        {
          title: `最受欢迎的产品类型是 ${popularType}`,
          description: `占总订单的 ${((maxCount / orders.length) * 100).toFixed(1)}%`,
          icon: 'mdi-trophy',
          color: 'amber',
        },
        {
          title: `订单优先级趋势${isRising ? '上升' : '下降'}`,
          description: `整体优先级${isRising ? '逐月增加，需加强资源投入' : '逐月下降，压力有所缓解'}`,
          icon: isRising ? 'mdi-trending-up' : 'mdi-trending-down',
          color: isRising ? 'red' : 'green',
        },
        {
          title: `订单量${isQuantityIncreasing ? '呈增长趋势' : '呈下降趋势'}`,
          description: isQuantityIncreasing
            ? '整体订单量增长，显示业务扩张'
            : '整体订单量下降，需要关注销售情况',
          icon: isQuantityIncreasing ? 'mdi-chart-line-variant' : 'mdi-chart-line-variant-decrease',
          color: isQuantityIncreasing ? 'blue' : 'deep-orange',
        },
      ]
    })

    // 计算属性：异常数据
    const anomalies = computed(() => {
      const orders = orderStore.show_list
      if (!orders.length) return []

      const result = []

      // 查找异常高订单量
      const quantities = orders.map((order) => parseInt(order.order_quantity))
      const avgQuantity = quantities.reduce((a, b) => a + b, 0) / quantities.length
      const stdDevQuantity = Math.sqrt(
        quantities.reduce((sum, q) => sum + Math.pow(q - avgQuantity, 2), 0) / quantities.length,
      )

      orders.forEach((order) => {
        const q = parseInt(order.order_quantity)
        // 超过3个标准差
        if (Math.abs(q - avgQuantity) > 3 * stdDevQuantity) {
          result.push({
            order_id: order.order_id,
            description: `订单量异常${q > avgQuantity ? '高' : '低'} (${q})`,
          })
        }

        // 优先级与订单量不匹配
        const priority = parseInt(order.priority)
        if (priority >= 9 && q < avgQuantity / 2) {
          result.push({
            order_id: order.order_id,
            description: `高优先级(${priority})但低订单量(${q})`,
          })
        }
      })

      return result
    })

    // 初始化图表
    const initCharts = () => {
      // 初始化各个图表实例
      trendChartInstance = echarts.init(trendChart.value)
      categoryChartInstance = echarts.init(categoryChart.value)
      priorityChartInstance = echarts.init(priorityChart.value)
      quantityPriorityChartInstance = echarts.init(quantityPriorityChart.value)
      advancedAnalysisChartInstance = echarts.init(advancedAnalysisChart.value)

      // 更新图表数据
      updateCharts()

      // 窗口大小改变时重置图表大小
      window.addEventListener('resize', () => {
        trendChartInstance.resize()
        categoryChartInstance.resize()
        priorityChartInstance.resize()
        quantityPriorityChartInstance.resize()
        advancedAnalysisChartInstance.resize()
        if (anomalyChartInstance) anomalyChartInstance.resize()
        if (forecastChartInstance) forecastChartInstance.resize()
      })
    }

    // 更新图表数据
    const updateCharts = () => {
      const orders = orderStore.show_list
      if (!orders.length) return

      // 更新趋势图
      updateTrendChart()

      // 更新类别分布图
      updateCategoryChart()

      // 更新优先级分布图
      updatePriorityChart()

      // 更新订单量与优先级关系图
      updateQuantityPriorityChart()

      // 更新高级分析图
      updateAdvancedAnalysisChart()
    }

    // 更新趋势图
    const updateTrendChart = () => {
      const orders = orderStore.show_list

      // 根据选择的时间范围分组订单
      let dateFormat, dateKey
      if (selectedTrendTimeframe.value === 'week') {
        dateFormat = (date) => {
          const d = new Date(date)
          const weekStart = new Date(d)
          weekStart.setDate(d.getDate() - d.getDay())
          return `第${Math.ceil(d.getDate() / 7)}周`
        }
        dateKey = (date) => {
          const d = new Date(date)
          return Math.ceil(d.getDate() / 7)
        }
      } else if (selectedTrendTimeframe.value === 'month') {
        dateFormat = (date) => date.substring(5, 7) + '月'
        dateKey = (date) => date.substring(5, 7)
      } else {
        dateFormat = (date) => date.substring(0, 4) + '年'
        dateKey = (date) => date.substring(0, 4)
      }

      // 按日期和产品类型分组统计订单数和数量
      const ordersByDate = {}
      const quantityByDate = {}
      const productTypesByDate = {}

      orders.forEach((order) => {
        const key = dateKey(order.order_date)

        if (!ordersByDate[key]) {
          ordersByDate[key] = 0
          quantityByDate[key] = 0
          productTypesByDate[key] = {}
        }

        ordersByDate[key]++
        quantityByDate[key] += parseInt(order.order_quantity)

        const typeKey = order.product_type
        productTypesByDate[key][typeKey] = (productTypesByDate[key][typeKey] || 0) + 1
      })

      // 确定所有产品类型
      const allProductTypes = new Set()
      orders.forEach((order) => allProductTypes.add(order.product_type))

      // 准备图表数据
      const dates = Object.keys(ordersByDate).sort((a, b) => a - b)

      const seriesData = [
        {
          name: '订单数',
          type: 'line',
          smooth: true,
          lineStyle: { width: 3 },
          symbolSize: 8,
          data: dates.map((date) => ordersByDate[date]),
          z: 3,
        },
        {
          name: '订单量',
          type: 'line',
          smooth: true,
          lineStyle: { width: 3, type: 'dashed' },
          symbolSize: 8,
          yAxisIndex: 1,
          data: dates.map((date) => quantityByDate[date]),
          z: 2,
        },
      ]

      // 堆叠柱状图：各类型订单数
      Array.from(allProductTypes).forEach((type) => {
        seriesData.push({
          name: `类型 ${type}`,
          type: 'bar',
          stack: '产品类型',
          emphasis: { focus: 'series' },
          data: dates.map((date) => productTypesByDate[date][type] || 0),
          z: 1,
        })
      })

      const option = {
        title: {
          text: '订单趋势分析',
          left: 'center',
          textStyle: {
            fontWeight: 'normal',
            fontSize: 16,
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
          data: ['订单数', '订单量', ...Array.from(allProductTypes).map((type) => `类型 ${type}`)],
          bottom: '0%',
          type: 'scroll',
        },
        toolbox: {
          feature: {
            saveAsImage: {},
            dataZoom: {},
            restore: {},
          },
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '15%',
          top: '15%',
          containLabel: true,
        },
        xAxis: {
          type: 'category',
          boundaryGap: true,
          data: dates.map((date) => dateFormat(date)),
        },
        yAxis: [
          {
            type: 'value',
            name: '订单数',
            position: 'left',
          },
          {
            type: 'value',
            name: '订单量',
            position: 'right',
          },
        ],
        series: seriesData,
        color: [
          '#3f51b5',
          '#4caf50',
          '#f44336',
          '#ff9800',
          '#9c27b0',
          '#00bcd4',
          '#ffeb3b',
          '#795548',
          '#607d8b',
          '#e91e63',
        ],
      }

      trendChartInstance.setOption(option)
    }

    // 更新类别分布图
    const updateCategoryChart = () => {
      const orders = orderStore.show_list

      // 按产品类型分组
      const categoryData = {}
      orders.forEach((order) => {
        const type = order.product_type
        if (!categoryData[type]) {
          categoryData[type] = {
            count: 0,
            quantity: 0,
          }
        }
        categoryData[type].count++
        categoryData[type].quantity += parseInt(order.order_quantity)
      })

      const categories = Object.keys(categoryData).sort()

      const option = {
        title: {
          text: '产品类型分布',
          left: 'center',
          textStyle: {
            fontWeight: 'normal',
            fontSize: 16,
          },
        },
        tooltip: {
          trigger: 'item',
          formatter: '{b}: {c} ({d}%)',
        },
        legend: {
          orient: 'vertical',
          left: 10,
          top: 'middle',
          type: 'scroll',
          formatter: (name) => {
            const percentage = ((categoryData[name].count / orders.length) * 100).toFixed(1)
            return `${name} (${percentage}%)`
          },
        },
        series: [
          {
            name: '产品类型',
            type: 'pie',
            radius: ['40%', '70%'],
            center: ['60%', '50%'],
            avoidLabelOverlap: false,
            itemStyle: {
              borderRadius: 10,
              borderColor: '#fff',
              borderWidth: 2,
            },
            label: {
              show: false,
              position: 'center',
            },
            emphasis: {
              label: {
                show: true,
                fontSize: '14',
                fontWeight: 'bold',
              },
            },
            labelLine: {
              show: false,
            },
            data: categories.map((category) => ({
              name: category,
              value: categoryData[category].count,
            })),
          },
        ],
        color: [
          '#f44336',
          '#e91e63',
          '#9c27b0',
          '#673ab7',
          '#3f51b5',
          '#2196f3',
          '#03a9f4',
          '#00bcd4',
          '#009688',
          '#4caf50',
        ],
      }

      categoryChartInstance.setOption(option)
    }

    // 更新优先级分布图
    const updatePriorityChart = () => {
      const orders = orderStore.show_list

      // 按优先级分组
      const priorityData = {}
      for (let i = 1; i <= 10; i++) {
        priorityData[i] = 0
      }

      orders.forEach((order) => {
        const priority = parseInt(order.priority)
        priorityData[priority]++
      })

      const option = {
        title: {
          text: '订单优先级分布',
          left: 'center',
          textStyle: {
            fontWeight: 'normal',
            fontSize: 16,
          },
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow',
          },
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          top: '15%',
          containLabel: true,
        },
        xAxis: {
          type: 'category',
          data: Object.keys(priorityData),
          axisTick: {
            alignWithLabel: true,
          },
          name: '优先级',
        },
        yAxis: {
          type: 'value',
          name: '订单数',
        },
        visualMap: {
          orient: 'horizontal',
          left: 'center',
          bottom: 0,
          min: 1,
          max: 10,
          text: ['高优先级', '低优先级'],
          dimension: 0,
          inRange: {
            color: ['#4caf50', '#ffeb3b', '#f44336'],
          },
          show: false,
        },
        series: [
          {
            name: '订单数',
            type: 'bar',
            barWidth: '60%',
            data: Object.entries(priorityData).map(([priority, count]) => ({
              value: count,
              itemStyle: {
                color: getPriorityColorForChart(priority),
              },
            })),
          },
        ],
      }

      priorityChartInstance.setOption(option)
    }

    // 更新订单量与优先级关系图
    const updateQuantityPriorityChart = () => {
      const orders = orderStore.show_list

      // 准备散点图数据
      const scatterData = orders.map((order) => [
        parseInt(order.order_quantity),
        parseInt(order.priority),
        order.product_type,
        order.order_id,
      ])

      // 计算订单量分布区间
      const quantities = orders.map((order) => parseInt(order.order_quantity))
      const minQuantity = Math.min(...quantities)
      const maxQuantity = Math.max(...quantities)

      const option = {
        title: {
          text: '订单量与优先级关系',
          left: 'center',
          textStyle: {
            fontWeight: 'normal',
            fontSize: 16,
          },
        },
        tooltip: {
          trigger: 'item',
          formatter: function (params) {
            const data = params.data
            return `订单号: ${data[3]}<br/>产品类型: ${data[2]}<br/>订单量: ${data[0]}<br/>优先级: ${data[1]}`
          },
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '10%',
          top: '15%',
          containLabel: true,
        },
        xAxis: {
          type: 'value',
          name: '订单量',
          min: minQuantity,
          max: maxQuantity,
        },
        yAxis: {
          type: 'value',
          name: '优先级',
          min: 1,
          max: 10,
        },
        toolbox: {
          feature: {
            dataZoom: {},
            restore: {},
          },
        },
        series: [
          {
            type: 'scatter',
            symbolSize: function (data) {
              return Math.sqrt(data[0]) * 1.5 + 5
            },
            itemStyle: {
              color: function (params) {
                // 使用订单类型为散点着色
                return getCategoryColor(params.data[2])
              },
              opacity: 0.8,
            },
            emphasis: {
              focus: 'series',
              itemStyle: {
                opacity: 1,
              },
            },
            data: scatterData,
          },
        ],
      }

      quantityPriorityChartInstance.setOption(option)
    }

    // 更新高级分析图
    const updateAdvancedAnalysisChart = () => {
      const orders = orderStore.show_list
      if (!orders.length) return

      let option = {}

      switch (selectedAnalysisType.value) {
        case '产品类型与订单量相关性':
          option = getProductTypeCorrelationOption(orders)
          break
        case '优先级与日期分布':
          option = getPriorityDateDistributionOption(orders)
          break
        case '订单量分布热力图':
          option = getQuantityHeatmapOption(orders)
          break
        case '订单组合分析':
          option = getOrderCompositionOption(orders)
          break
        default:
          option = getProductTypeCorrelationOption(orders)
      }

      advancedAnalysisChartInstance.setOption(option)
    }

    // 产品类型与订单量相关性分析图表
    const getProductTypeCorrelationOption = (orders) => {
      // 按产品类型分组并计算统计数据
      const typeData = {}
      orders.forEach((order) => {
        const type = order.product_type
        if (!typeData[type]) {
          typeData[type] = {
            orders: 0,
            totalQuantity: 0,
            totalPriority: 0,
            quantities: [],
          }
        }
        typeData[type].orders++
        const quantity = parseInt(order.order_quantity)
        const priority = parseInt(order.priority)
        typeData[type].totalQuantity += quantity
        typeData[type].totalPriority += priority
        typeData[type].quantities.push(quantity)
      })

      // 计算各类型的平均订单量和优先级
      const types = Object.keys(typeData).sort()
      const avgQuantities = types.map(
        (type) => typeData[type].totalQuantity / typeData[type].orders,
      )
      const avgPriorities = types.map(
        (type) => typeData[type].totalPriority / typeData[type].orders,
      )
      const orderCounts = types.map((type) => typeData[type].orders)

      // 计算各类型的订单量标准差
      const stdDevQuantities = types.map((type) => {
        const avg = typeData[type].totalQuantity / typeData[type].orders
        const quantities = typeData[type].quantities
        const variance =
          quantities.reduce((sum, q) => sum + Math.pow(q - avg, 2), 0) / quantities.length
        return Math.sqrt(variance)
      })

      return {
        title: {
          text: '产品类型分析',
          left: 'center',
          textStyle: {
            fontWeight: 'normal',
            fontSize: 16,
          },
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
          },
          formatter: function (params) {
            let tooltip = `${params[0].axisValue}<br/>`
            params.forEach((param) => {
              const colorSpan = `<span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:${param.color};"></span>`
              tooltip += `${colorSpan}${param.seriesName}: ${param.value.toFixed(2)}<br/>`
            })
            tooltip += `<span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:#ff9800;"></span>订单数: ${orderCounts[params[0].dataIndex]}<br/>`
            return tooltip
          },
        },
        toolbox: {
          feature: {
            saveAsImage: {},
            dataView: { readOnly: true },
          },
        },
        legend: {
          data: ['平均订单量', '平均优先级', '订单量标准差'],
          bottom: '0%',
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '10%',
          top: '15%',
          containLabel: true,
        },
        xAxis: {
          type: 'category',
          name: '产品类型',
          data: types,
          axisPointer: {
            type: 'shadow',
          },
        },
        yAxis: [
          {
            type: 'value',
            name: '平均订单量',
            position: 'left',
          },
          {
            type: 'value',
            name: '平均优先级',
            min: 1,
            max: 10,
            position: 'right',
            axisLine: {
              lineStyle: {
                color: '#ff5722',
              },
            },
          },
        ],
        series: [
          {
            name: '平均订单量',
            type: 'bar',
            data: avgQuantities,
          },
          {
            name: '平均优先级',
            type: 'line',
            yAxisIndex: 1,
            lineStyle: {
              width: 3,
            },
            symbolSize: 8,
            data: avgPriorities,
          },
          {
            name: '订单量标准差',
            type: 'line',
            lineStyle: {
              width: 3,
              type: 'dashed',
            },
            symbolSize: 8,
            data: stdDevQuantities,
          },
          {
            name: '订单数',
            type: 'bar',
            stack: '订单',
            emphasis: {
              focus: 'series',
            },
            data: orderCounts,
            z: -1,
            opacity: 0.3,
            tooltip: {
              show: false,
            },
          },
        ],
        color: ['#3f51b5', '#ff5722', '#4caf50', '#ff9800'],
      }
    }

    // 优先级与日期分布分析图表
    const getPriorityDateDistributionOption = (orders) => {
      // 提取月份和日数据
      const dayData = {}
      orders.forEach((order) => {
        const date = order.order_date
        const month = date.substring(5, 7)
        const day = date.substring(8, 10)
        const key = `${month}-${day}`

        if (!dayData[key]) {
          dayData[key] = {
            count: 0,
            totalPriority: 0,
            totalQuantity: 0,
          }
        }

        dayData[key].count++
        dayData[key].totalPriority += parseInt(order.priority)
        dayData[key].totalQuantity += parseInt(order.order_quantity)
      })

      // 转换为日历热力图数据
      const calendarData = Object.entries(dayData).map(([key, value]) => {
        const [month, day] = key.split('-')
        return [
          `2025-${month}-${day}`,
          value.totalPriority / value.count, // 平均优先级
        ]
      })

      return {
        title: {
          text: '订单优先级日历分布',
          left: 'center',
          textStyle: {
            fontWeight: 'normal',
            fontSize: 16,
          },
        },
        tooltip: {
          formatter: function (params) {
            const date = params.value[0]
            const value = params.value[1]
            const key = date.substring(5) // 去掉年份部分
            return `${date}<br/>平均优先级: ${value.toFixed(2)}<br/>订单数: ${dayData[key]?.count || 0}`
          },
        },
        visualMap: {
          min: 1,
          max: 10,
          calculable: true,
          orient: 'horizontal',
          left: 'center',
          bottom: 20,
          inRange: {
            color: ['#4caf50', '#ffeb3b', '#ff9800', '#f44336'],
          },
        },
        calendar: {
          top: 80,
          left: 50,
          right: 30,
          cellSize: ['auto', 20],
          range: '2025',
          itemStyle: {
            borderWidth: 0.5,
          },
          yearLabel: { show: false },
        },
        series: {
          type: 'heatmap',
          coordinateSystem: 'calendar',
          calendarIndex: 0,
          data: calendarData,
        },
      }
    }

    // 订单量分布热力图
    const getQuantityHeatmapOption = (orders) => {
      // 按产品类型和优先级分组
      const heatmapData = []
      const typeSet = new Set()
      const priorityCount = {}

      // 初始化优先级计数
      for (let i = 1; i <= 10; i++) {
        priorityCount[i] = { total: 0 }
      }

      orders.forEach((order) => {
        const type = order.product_type
        const priority = parseInt(order.priority)
        const quantity = parseInt(order.order_quantity)

        typeSet.add(type)

        // 增加特定类型和优先级的数量
        let found = false
        for (let i = 0; i < heatmapData.length; i++) {
          if (heatmapData[i][0] === type && heatmapData[i][1] === priority) {
            heatmapData[i][2] += quantity
            found = true
            break
          }
        }

        if (!found) {
          heatmapData.push([type, priority, quantity])
        }

        // 更新优先级统计
        if (!priorityCount[priority][type]) {
          priorityCount[priority][type] = 0
        }
        priorityCount[priority][type] += quantity
        priorityCount[priority].total += quantity
      })

      // 获取所有产品类型并排序
      const types = Array.from(typeSet).sort()

      // 准备右侧堆叠条形图数据
      const barSeriesData = []
      types.forEach((type) => {
        const data = []
        for (let i = 1; i <= 10; i++) {
          data.push(priorityCount[i][type] || 0)
        }

        barSeriesData.push({
          name: `类型 ${type}`,
          type: 'bar',
          stack: 'priority',
          emphasis: { focus: 'series' },
          data: data,
        })
      })

      return {
        title: {
          text: '产品类型-优先级-订单量分布',
          left: 'center',
          textStyle: {
            fontWeight: 'normal',
            fontSize: 16,
          },
        },
        tooltip: {
          position: 'top',
          formatter: function (params) {
            return `产品 ${params.data[0]}<br/>优先级 ${params.data[1]}<br/>订单量 ${params.data[2]}`
          },
        },
        animation: true,
        grid: [
          {
            left: '3%',
            right: '43%',
            bottom: '10%',
            top: '15%',
            containLabel: true,
          },
          {
            left: '62%',
            right: '3%',
            bottom: '10%',
            top: '15%',
            containLabel: true,
          },
        ],
        xAxis: [
          {
            type: 'category',
            data: types,
            splitArea: {
              show: true,
            },
            name: '产品类型',
            gridIndex: 0,
          },
          {
            type: 'value',
            gridIndex: 1,
            name: '订单量',
          },
        ],
        yAxis: [
          {
            type: 'category',
            data: Array.from({ length: 10 }, (_, i) => i + 1),
            splitArea: {
              show: true,
            },
            name: '优先级',
            gridIndex: 0,
          },
          {
            type: 'category',
            data: Array.from({ length: 10 }, (_, i) => i + 1),
            name: '优先级',
            gridIndex: 1,
          },
        ],
        visualMap: {
          min: 0,
          max: Math.max(...heatmapData.map((item) => item[2])),
          calculable: true,
          orient: 'horizontal',
          left: 'center',
          bottom: '0%',
          inRange: {
            color: [
              '#e8f5e9',
              '#c8e6c9',
              '#a5d6a7',
              '#81c784',
              '#66bb6a',
              '#4caf50',
              '#43a047',
              '#388e3c',
              '#2e7d32',
              '#1b5e20',
            ],
          },
        },
        series: [
          {
            name: '订单量',
            type: 'heatmap',
            data: heatmapData,
            label: {
              show: true,
            },
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowColor: 'rgba(0, 0, 0, 0.5)',
              },
            },
            xAxisIndex: 0,
            yAxisIndex: 0,
          },
          ...barSeriesData,
        ],
      }
    }

    // 订单组合分析
    const getOrderCompositionOption = (orders) => {
      // 桑基图数据准备
      const nodes = []
      const links = []

      // 创建产品类型节点
      const types = new Set()
      orders.forEach((order) => types.add(order.product_type))
      types.forEach((type) => {
        nodes.push({
          name: `类型${type}`,
          itemStyle: {
            color: getCategoryColor(type),
          },
        })
      })

      // 创建优先级节点
      for (let i = 1; i <= 10; i++) {
        nodes.push({
          name: `P${i}`,
          itemStyle: {
            color: getPriorityColorForChart(i),
          },
        })
      }

      // 创建月份节点
      const months = new Set()
      orders.forEach((order) => {
        const month = order.order_date.substring(5, 7)
        months.add(month)
      })
      months.forEach((month) => {
        nodes.push({
          name: `${month}月`,
        })
      })

      // 创建类型到优先级的链接
      const typeToPriority = {}
      orders.forEach((order) => {
        const type = order.product_type
        const priority = parseInt(order.priority)
        const key = `类型${type}-P${priority}`

        typeToPriority[key] = (typeToPriority[key] || 0) + parseInt(order.order_quantity)
      })

      Object.entries(typeToPriority).forEach(([key, value]) => {
        const [source, target] = key.split('-')
        links.push({
          source,
          target,
          value,
        })
      })

      // 创建优先级到月份的链接
      const priorityToMonth = {}
      orders.forEach((order) => {
        const priority = parseInt(order.priority)
        const month = order.order_date.substring(5, 7)
        const key = `P${priority}-${month}月`

        priorityToMonth[key] = (priorityToMonth[key] || 0) + parseInt(order.order_quantity)
      })

      Object.entries(priorityToMonth).forEach(([key, value]) => {
        const [source, target] = key.split('-')
        links.push({
          source,
          target,
          value,
        })
      })

      return {
        title: {
          text: '订单组合流向分析',
          left: 'center',
          textStyle: {
            fontWeight: 'normal',
            fontSize: 16,
          },
        },
        tooltip: {
          trigger: 'item',
          triggerOn: 'mousemove',
        },
        series: [
          {
            type: 'sankey',
            emphasis: {
              focus: 'adjacency',
            },
            nodeAlign: 'right',
            data: nodes,
            links: links,
            lineStyle: {
              color: 'source',
              curveness: 0.5,
            },
          },
        ],
      }
    }

    // 初始化洞察图表
    const initInsightCharts = () => {
      if (anomalyChart.value) {
        anomalyChartInstance = echarts.init(anomalyChart.value)
        updateAnomalyChart()
      }

      if (forecastChart.value) {
        forecastChartInstance = echarts.init(forecastChart.value)
        updateForecastChart()
      }
    }

    // 更新异常检测图表
    const updateAnomalyChart = () => {
      const orders = orderStore.show_list

      // 按日期排序订单
      const sortedOrders = [...orders].sort((a, b) => {
        return new Date(a.order_date) - new Date(b.order_date)
      })

      // 按日期分组计算订单量
      const dateQuantity = {}
      sortedOrders.forEach((order) => {
        if (!dateQuantity[order.order_date]) {
          dateQuantity[order.order_date] = 0
        }
        dateQuantity[order.order_date] += parseInt(order.order_quantity)
      })

      // 准备图表数据
      const dates = Object.keys(dateQuantity).sort()
      const quantities = dates.map((date) => dateQuantity[date])

      // 计算移动平均线
      const movingAvgWindow = 7
      const movingAvg = []

      for (let i = 0; i < quantities.length; i++) {
        let sum = 0
        let count = 0

        for (let j = Math.max(0, i - movingAvgWindow + 1); j <= i; j++) {
          sum += quantities[j]
          count++
        }

        movingAvg.push(sum / count)
      }

      // 标记异常点
      const anomalyPoints = []
      const anomalyIndices = []
      const threshold = 2 // 超过2个标准差算异常

      // 计算标准差
      const avg = quantities.reduce((a, b) => a + b, 0) / quantities.length
      const stdDev = Math.sqrt(
        quantities.reduce((sum, q) => sum + Math.pow(q - avg, 2), 0) / quantities.length,
      )

      quantities.forEach((q, i) => {
        if (Math.abs(q - movingAvg[i]) > threshold * stdDev) {
          anomalyPoints.push([i, q])
          anomalyIndices.push(i)
        }
      })

      const option = {
        title: {
          text: '订单量异常检测',
          left: 'center',
          textStyle: {
            fontWeight: 'normal',
            fontSize: 16,
          },
        },
        tooltip: {
          trigger: 'axis',
          formatter: function (params) {
            const dateIndex = params[0].dataIndex
            const date = dates[dateIndex]
            let tooltip = `${date}<br/>`

            params.forEach((param) => {
              tooltip += `${param.marker}${param.seriesName}: ${param.value}<br/>`
            })

            if (anomalyIndices.includes(dateIndex)) {
              tooltip += '<span style="color:#ff5722;font-weight:bold">⚠️ 异常</span>'
            }

            return tooltip
          },
        },
        xAxis: {
          type: 'category',
          data: dates,
          boundaryGap: false,
        },
        yAxis: {
          type: 'value',
          name: '订单量',
        },
        toolbox: {
          feature: {
            dataZoom: {},
            restore: {},
          },
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
        series: [
          {
            name: '实际订单量',
            type: 'line',
            data: quantities,
            lineStyle: {
              width: 2,
            },
            symbol: 'emptyCircle',
            symbolSize: 6,
          },
          {
            name: '移动平均',
            type: 'line',
            data: movingAvg,
            lineStyle: {
              width: 2,
              type: 'dashed',
            },
            symbol: 'none',
          },
          {
            name: '异常点',
            type: 'scatter',
            data: anomalyPoints,
            symbolSize: 16,
            itemStyle: {
              color: '#ff5722',
            },
          },
        ],
        color: ['#2196f3', '#4caf50', '#ff5722'],
      }

      anomalyChartInstance.setOption(option)
    }

    // 更新预测分析图表
    const updateForecastChart = () => {
      const orders = orderStore.show_list

      // 按日期排序并分组
      const monthlyData = {}
      orders.forEach((order) => {
        const month = order.order_date.substring(5, 7)
        if (!monthlyData[month]) {
          monthlyData[month] = {
            count: 0,
            quantity: 0,
          }
        }
        monthlyData[month].count++
        monthlyData[month].quantity += parseInt(order.order_quantity)
      })

      // 准备数据
      const months = Object.keys(monthlyData).sort()
      const orderCounts = months.map((month) => monthlyData[month].count)
      const quantities = months.map((month) => monthlyData[month].quantity)

      // 简单线性回归预测
      const predictNextMonths = (data) => {
        if (data.length < 2) return [...data, data[data.length - 1]] // 至少需要两个点

        const n = data.length
        const x = Array.from({ length: n }, (_, i) => i)

        // 计算平均值
        const meanX = x.reduce((a, b) => a + b, 0) / n
        const meanY = data.reduce((a, b) => a + b, 0) / n

        // 计算斜率和截距
        let numerator = 0
        let denominator = 0

        for (let i = 0; i < n; i++) {
          numerator += (x[i] - meanX) * (data[i] - meanY)
          denominator += Math.pow(x[i] - meanX, 2)
        }

        const slope = numerator / denominator
        const intercept = meanY - slope * meanX

        // 预测下两个月
        const forecast = [...data]
        for (let i = 1; i <= 2; i++) {
          forecast.push(slope * (n - 1 + i) + intercept)
        }

        return forecast
      }

      // 预测订单数和订单量
      const predictedOrderCounts = predictNextMonths(orderCounts)
      const predictedQuantities = predictNextMonths(quantities)

      // 预测月份标签
      const allMonths = [...months]
      const lastMonth = parseInt(months[months.length - 1])
      for (let i = 1; i <= 2; i++) {
        let nextMonth = lastMonth + i
        if (nextMonth > 12) nextMonth -= 12
        allMonths.push(nextMonth.toString().padStart(2, '0'))
      }

      const option = {
        title: {
          text: '订单趋势预测',
          left: 'center',
          textStyle: {
            fontWeight: 'normal',
            fontSize: 16,
          },
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
          },
        },
        legend: {
          data: ['订单数', '订单量', '预测订单数', '预测订单量'],
          bottom: '0%',
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '15%',
          top: '15%',
          containLabel: true,
        },
        xAxis: {
          type: 'category',
          data: allMonths.map((m) => `${m}月`),
          boundaryGap: false,
        },
        yAxis: [
          {
            type: 'value',
            name: '订单数',
            position: 'left',
          },
          {
            type: 'value',
            name: '订单量',
            position: 'right',
          },
        ],
        series: [
          {
            name: '订单数',
            type: 'line',
            data: orderCounts,
            lineStyle: {
              width: 3,
            },
            symbolSize: 8,
          },
          {
            name: '订单量',
            type: 'line',
            yAxisIndex: 1,
            data: quantities,
            lineStyle: {
              width: 3,
            },
            symbolSize: 8,
          },
          {
            name: '预测订单数',
            type: 'line',
            data: Array(months.length - 1)
              .fill('-')
              .concat(predictedOrderCounts.slice(months.length - 1)),
            lineStyle: {
              width: 3,
              type: 'dashed',
            },
            symbolSize: 8,
          },
          {
            name: '预测订单量',
            type: 'line',
            yAxisIndex: 1,
            data: Array(months.length - 1)
              .fill('-')
              .concat(predictedQuantities.slice(months.length - 1)),
            lineStyle: {
              width: 3,
              type: 'dashed',
            },
            symbolSize: 8,
          },
        ],
        color: ['#3f51b5', '#4caf50', '#9c27b0', '#ff9800'],
      }

      forecastChartInstance.setOption(option)
    }

    // 根据优先级获取颜色
    const getPriorityColor = (priority) => {
      priority = parseInt(priority)
      if (priority <= 3) return 'success'
      if (priority <= 6) return 'warning'
      if (priority <= 8) return 'orange'
      return 'error'
    }

    // 根据优先级获取文字颜色
    const getPriorityTextColor = (priority) => {
      priority = parseInt(priority)
      if (priority <= 3) return ''
      if (priority <= 6) return ''
      return 'white'
    }

    // 根据优先级获取标签文本
    const getPriorityLabel = (priority) => {
      priority = parseInt(priority)
      if (priority <= 3) return `低 (${priority})`
      if (priority <= 6) return `中 (${priority})`
      if (priority <= 8) return `高 (${priority})`
      return `紧急 (${priority})`
    }

    // 根据优先级获取图表颜色
    const getPriorityColorForChart = (priority) => {
      priority = parseInt(priority)
      if (priority <= 3) return '#4caf50'
      if (priority <= 6) return '#ffeb3b'
      if (priority <= 8) return '#ff9800'
      return '#f44336'
    }

    // 根据产品类型获取颜色
    const getCategoryColor = (type) => {
      const colors = {
        A: '#f44336',
        B: '#e91e63',
        C: '#9c27b0',
        D: '#673ab7',
        E: '#3f51b5',
        F: '#2196f3',
        G: '#03a9f4',
        H: '#00bcd4',
        I: '#009688',
        J: '#4caf50',
      }

      return colors[type] || '#607d8b'
    }

    // 根据订单量获取颜色
    const getQuantityColor = (quantity) => {
      quantity = parseInt(quantity)
      if (quantity < 20) return 'info'
      if (quantity < 50) return 'success'
      if (quantity < 80) return 'warning'
      return 'error'
    }

    // 刷新数据
    const refreshData = async () => {
      isLoading.value = true
      await orderStore.update_data()
      updateCharts()
      isLoading.value = false
    }

    // 重置筛选器
    const resetFilters = () => {
      filters.value = {
        productTypes: [],
        priorityRange: [1, 10],
        quantityRange: [0, 100],
      }
    }

    // 应用筛选器
    const applyFilters = () => {
      filterDialog.value = false
    }

    // 导出洞察
    const exportInsights = () => {
      console.log('导出洞察')
    }

    // 监听选择的时间范围变化
    watch(selectedTrendTimeframe, () => {
      updateTrendChart()
    })

    // 监听选择的分析类型变化
    watch(selectedAnalysisType, () => {
      updateAdvancedAnalysisChart()
    })

    // 在组件挂载后初始化
    onMounted(() => {
      // 初始化图表
      initCharts()

      // 监听对话框打开事件
      watch(insightsDialog, (newVal) => {
        if (newVal) {
          // 显示对话框后初始化洞察图表
          setTimeout(() => {
            initInsightCharts()
          }, 100)
        }
      })
    })

    const handleSearch = () => {
      orderStore.handleSearch(search.value)
    }

    // 返回响应式数据和方法
    return {
      orderStore,
      trendChart,
      categoryChart,
      priorityChart,
      quantityPriorityChart,
      advancedAnalysisChart,
      anomalyChart,
      forecastChart,
      isLoading,
      search,
      selectedTrendTimeframe,
      selectedAnalysisType,
      filterDialog,
      insightsDialog,
      itemsPerPage,
      filters,
      headers,
      formattedDate,
      filteredOrders,
      availableProductTypes,
      keyStats,
      analysisTypes,
      keyInsights,
      anomalies,
      refreshData,
      resetFilters,
      applyFilters,
      exportInsights,
      getPriorityColor,
      getPriorityTextColor,
      getPriorityLabel,
      getCategoryColor,
      getQuantityColor,
      handleSearch,
    }
  },
})
</script>

<style scoped>
.order-dashboard {
  background-color: #f9fafb;
}

.chart-container {
  height: 320px;
  width: 100%;
}

.advanced-chart {
  height: 450px;
}

.stat-card {
  transition:
    transform 0.3s,
    box-shadow 0.3s;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
}

.search-field {
  max-width: 250px;
}

.analysis-select {
  max-width: 250px;
}

.primary-text {
  color: rgb(var(--v-theme-primary));
}

.secondary-text {
  color: rgba(var(--v-theme-on-surface), 0.7);
}
</style>
