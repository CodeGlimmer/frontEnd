<!-- filepath: /home/codeglimmer/Desktop/frontEnd/src/views/SchedulePlan/agvDispatch/index.vue -->
<template>
  <v-container fluid class="pa-4">
    <v-row>
      <!-- 参数输入区域 -->
      <v-col cols="12" md="4">
        <v-card elevation="2" class="mb-4">
          <v-card-title class="primary white--text">
            <v-icon left color="white">mdi-robot</v-icon>
            AGV调度参数配置
          </v-card-title>

          <v-card-text class="pt-4">
            <v-form ref="form" v-model="formValid">
              <!-- AGV数量 -->
              <v-text-field
                v-model.number="params.num_agvs"
                label="AGV数量"
                type="number"
                :rules="[(v) => v > 0 || 'AGV数量必须大于0']"
                prepend-icon="mdi-numeric"
                outlined
                dense
              />

              <!-- 地图大小 -->
              <v-row>
                <v-col cols="6">
                  <v-text-field
                    v-model.number="params.grid_size[0]"
                    label="地图宽度"
                    type="number"
                    :rules="[(v) => v > 0 || '必须大于0']"
                    outlined
                    dense
                  />
                </v-col>
                <v-col cols="6">
                  <v-text-field
                    v-model.number="params.grid_size[1]"
                    label="地图高度"
                    type="number"
                    :rules="[(v) => v > 0 || '必须大于0']"
                    outlined
                    dense
                  />
                </v-col>
              </v-row>

              <!-- AGV起始位置 -->
              <v-subheader class="px-0">AGV起始位置</v-subheader>
              <div v-for="(pos, index) in params.agv_positions" :key="index" class="mb-2">
                <v-row align="center">
                  <v-col cols="4">
                    <v-text-field
                      v-model.number="pos[0]"
                      :label="`AGV${index + 1} X`"
                      type="number"
                      outlined
                      dense
                      hide-details
                    />
                  </v-col>
                  <v-col cols="4">
                    <v-text-field
                      v-model.number="pos[1]"
                      :label="`AGV${index + 1} Y`"
                      type="number"
                      outlined
                      dense
                      hide-details
                    />
                  </v-col>
                  <v-col cols="4">
                    <v-btn
                      icon
                      small
                      color="error"
                      @click="removeAgvPosition(index)"
                      :disabled="params.agv_positions.length <= 1"
                    >
                      <v-icon>mdi-delete</v-icon>
                    </v-btn>
                  </v-col>
                </v-row>
              </div>
              <v-btn
                small
                color="primary"
                @click="addAgvPosition"
                :disabled="params.agv_positions.length >= params.num_agvs"
              >
                <v-icon left>mdi-plus</v-icon>
                添加AGV位置
              </v-btn>

              <!-- 任务位置 -->
              <v-subheader class="px-0 mt-4">任务位置配置</v-subheader>
              <div v-for="taskId in Object.keys(params.task_locations)" :key="taskId" class="mb-3">
                <v-card outlined>
                  <v-card-subtitle>任务 {{ taskId }}</v-card-subtitle>
                  <v-card-text>
                    <v-row>
                      <v-col cols="3">
                        <v-text-field
                          v-model.number="params.task_locations[taskId][0][0]"
                          label="取货X"
                          type="number"
                          outlined
                          dense
                          hide-details
                        />
                      </v-col>
                      <v-col cols="3">
                        <v-text-field
                          v-model.number="params.task_locations[taskId][0][1]"
                          label="取货Y"
                          type="number"
                          outlined
                          dense
                          hide-details
                        />
                      </v-col>
                      <v-col cols="3">
                        <v-text-field
                          v-model.number="params.task_locations[taskId][1][0]"
                          label="送达X"
                          type="number"
                          outlined
                          dense
                          hide-details
                        />
                      </v-col>
                      <v-col cols="3">
                        <v-text-field
                          v-model.number="params.task_locations[taskId][1][1]"
                          label="送达Y"
                          type="number"
                          outlined
                          dense
                          hide-details
                        />
                      </v-col>
                    </v-row>
                    <v-btn icon small color="error" class="mt-2" @click="removeTask(taskId)">
                      <v-icon>mdi-delete</v-icon>
                    </v-btn>
                  </v-card-text>
                </v-card>
              </div>
              <v-btn small color="primary" @click="addTask">
                <v-icon left>mdi-plus</v-icon>
                添加任务
              </v-btn>

              <!-- 障碍物配置 -->
              <v-subheader class="px-0 mt-4">障碍物配置</v-subheader>
              <v-card outlined class="mb-3">
                <v-card-subtitle>
                  <v-icon left>mdi-wall</v-icon>
                  障碍物位置 ({{ params.obstacles.length }} 个)
                </v-card-subtitle>
                <v-card-text>
                  <div
                    v-if="params.obstacles.length === 0"
                    class="text-center text--secondary py-4"
                  >
                    暂无障碍物，点击下方按钮添加
                  </div>
                  <div v-else>
                    <v-row
                      v-for="(obstacle, index) in params.obstacles"
                      :key="`obstacle-${index}`"
                      align="center"
                      class="mb-2"
                    >
                      <v-col cols="4">
                        <v-text-field
                          v-model.number="obstacle[0]"
                          :label="`障碍物${index + 1} X`"
                          type="number"
                          :rules="[
                            (v) => v >= 0 || 'X坐标不能为负数',
                            (v) =>
                              v < params.grid_size[0] || `X坐标不能超过${params.grid_size[0] - 1}`,
                          ]"
                          outlined
                          dense
                          hide-details="auto"
                          @input="validateObstacle(index)"
                        />
                      </v-col>
                      <v-col cols="4">
                        <v-text-field
                          v-model.number="obstacle[1]"
                          :label="`障碍物${index + 1} Y`"
                          type="number"
                          :rules="[
                            (v) => v >= 0 || 'Y坐标不能为负数',
                            (v) =>
                              v < params.grid_size[1] || `Y坐标不能超过${params.grid_size[1] - 1}`,
                          ]"
                          outlined
                          dense
                          hide-details="auto"
                          @input="validateObstacle(index)"
                        />
                      </v-col>
                      <v-col cols="4">
                        <v-btn
                          icon
                          small
                          color="error"
                          @click="removeObstacle(index)"
                          :disabled="loading"
                        >
                          <v-icon>mdi-delete</v-icon>
                        </v-btn>
                        <v-tooltip bottom>
                          <template v-slot:activator="{ on, attrs }">
                            <v-icon
                              v-if="isObstacleConflict(obstacle)"
                              v-bind="attrs"
                              v-on="on"
                              color="warning"
                              small
                              class="ml-1"
                            >
                              mdi-alert
                            </v-icon>
                          </template>
                          <span>该位置与AGV起始位置或任务点冲突</span>
                        </v-tooltip>
                      </v-col>
                    </v-row>
                  </div>

                  <v-divider class="my-3" />

                  <v-row>
                    <v-col cols="12">
                      <v-btn
                        small
                        color="primary"
                        @click="addObstacle"
                        :disabled="loading"
                        class="mr-2"
                      >
                        <v-icon left>mdi-plus</v-icon>
                        添加障碍物
                      </v-btn>
                      <v-btn
                        small
                        color="warning"
                        outlined
                        @click="clearObstacles"
                        :disabled="loading || params.obstacles.length === 0"
                      >
                        <v-icon left>mdi-delete-sweep</v-icon>
                        清空所有
                      </v-btn>
                    </v-col>
                  </v-row>

                  <!-- 快速添加预设 -->
                  <v-expansion-panels class="mt-3">
                    <v-expansion-panel>
                      <v-expansion-panel-header>
                        <span>
                          <v-icon left>mdi-creation</v-icon>
                          快速添加预设障碍物
                        </span>
                      </v-expansion-panel-header>
                      <v-expansion-panel-content>
                        <v-row>
                          <v-col cols="6">
                            <v-btn
                              small
                              block
                              color="info"
                              outlined
                              @click="addWallObstacles('horizontal')"
                              :disabled="loading"
                            >
                              添加水平墙
                            </v-btn>
                          </v-col>
                          <v-col cols="6">
                            <v-btn
                              small
                              block
                              color="info"
                              outlined
                              @click="addWallObstacles('vertical')"
                              :disabled="loading"
                            >
                              添加垂直墙
                            </v-btn>
                          </v-col>
                          <v-col cols="6">
                            <v-btn
                              small
                              block
                              color="info"
                              outlined
                              @click="addRandomObstacles"
                              :disabled="loading"
                            >
                              随机添加5个
                            </v-btn>
                          </v-col>
                          <v-col cols="6">
                            <v-btn
                              small
                              block
                              color="info"
                              outlined
                              @click="addCornerObstacles"
                              :disabled="loading"
                            >
                              添加角落障碍
                            </v-btn>
                          </v-col>
                        </v-row>
                      </v-expansion-panel-content>
                    </v-expansion-panel>
                  </v-expansion-panels>
                </v-card-text>
              </v-card>

              <!-- 优化参数 -->
              <v-expansion-panels class="mt-4">
                <v-expansion-panel>
                  <v-expansion-panel-header>高级优化参数</v-expansion-panel-header>
                  <v-expansion-panel-content>
                    <v-text-field
                      v-model.number="params.optimization_config.pop_size"
                      label="种群大小"
                      type="number"
                      outlined
                      dense
                    />
                    <v-text-field
                      v-model.number="params.optimization_config.n_gen"
                      label="迭代次数"
                      type="number"
                      outlined
                      dense
                    />
                  </v-expansion-panel-content>
                </v-expansion-panel>
              </v-expansion-panels>
            </v-form>
          </v-card-text>

          <v-card-actions>
            <v-btn
              color="primary"
              block
              large
              :loading="loading"
              :disabled="!formValid"
              @click="runOptimization"
            >
              <v-icon left>mdi-play</v-icon>
              开始优化调度
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>

      <!-- 结果展示区域 -->
      <v-col cols="12" md="8">
        <!-- 动画展示 -->
        <v-card elevation="2" class="mb-4">
          <v-card-title class="success white--text">
            <v-icon left color="white">mdi-animation-play</v-icon>
            AGV调度动画
            <v-spacer />
            <v-btn v-if="animationData" icon color="white" @click="toggleAnimation">
              <v-icon>{{ isAnimating ? 'mdi-pause' : 'mdi-play' }}</v-icon>
            </v-btn>
            <v-btn v-if="animationData" icon color="white" @click="resetAnimation">
              <v-icon>mdi-restart</v-icon>
            </v-btn>
          </v-card-title>

          <v-card-text>
            <div class="d-flex justify-center">
              <canvas
                ref="animationCanvas"
                :width="canvasSize"
                :height="canvasSize"
                style="border: 2px solid #e0e0e0; border-radius: 4px"
              />
            </div>

            <v-row v-if="animationData" class="mt-3">
              <v-col cols="6">
                <v-card outlined>
                  <v-card-text class="text-center">
                    <div class="text-h6 primary--text">{{ Math.round(currentTime * 10) / 10 }}</div>
                    <div class="text-caption">当前时间</div>
                  </v-card-text>
                </v-card>
              </v-col>
              <v-col cols="6">
                <v-card outlined>
                  <v-card-text class="text-center">
                    <div class="text-h6 success--text">
                      {{ Math.round(totalDistance * 10) / 10 }}
                    </div>
                    <div class="text-caption">总距离</div>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>

            <v-slider
              v-if="animationData"
              v-model="currentTime"
              :max="animationData.total_time"
              :step="0.1"
              class="mt-4"
              thumb-label
              @input="updateAnimationFrame"
            />
          </v-card-text>
        </v-card>

        <!-- 帕累托前沿图表 -->
        <v-card v-if="results" elevation="2" class="mb-4">
          <v-card-title class="info white--text">
            <v-icon left color="white">mdi-chart-scatter-plot</v-icon>
            帕累托前沿分析
          </v-card-title>
          <v-card-text>
            <canvas ref="paretoChart" width="400" height="300"></canvas>
          </v-card-text>
        </v-card>

        <!-- 优化结果统计 -->
        <v-card v-if="results" elevation="2">
          <v-card-title class="warning white--text">
            <v-icon left color="white">mdi-chart-bar</v-icon>
            优化结果统计
          </v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="6" md="3">
                <v-card outlined>
                  <v-card-text class="text-center">
                    <div class="text-h5 primary--text">
                      {{ results.optimization_results.total_solutions }}
                    </div>
                    <div class="text-caption">总解数量</div>
                  </v-card-text>
                </v-card>
              </v-col>
              <v-col cols="6" md="3">
                <v-card outlined>
                  <v-card-text class="text-center">
                    <div class="text-h5 success--text">
                      {{ Math.round(results.optimization_results.computation_time * 100) / 100 }}s
                    </div>
                    <div class="text-caption">计算时间</div>
                  </v-card-text>
                </v-card>
              </v-col>
              <v-col cols="6" md="3">
                <v-card outlined>
                  <v-card-text class="text-center">
                    <div class="text-h5 info--text">
                      {{
                        Math.round(results.optimization_results.best_solution.makespan * 10) / 10
                      }}
                    </div>
                    <div class="text-caption">最优完工时间</div>
                  </v-card-text>
                </v-card>
              </v-col>
              <v-col cols="6" md="3">
                <v-card outlined>
                  <v-card-text class="text-center">
                    <div class="text-h5 warning--text">
                      {{
                        Math.round(results.optimization_results.best_solution.distance * 10) / 10
                      }}
                    </div>
                    <div class="text-caption">最优总距离</div>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>

            <!-- 任务分配显示 -->
            <v-card outlined class="mt-4">
              <v-card-subtitle>AGV任务分配</v-card-subtitle>
              <v-card-text>
                <div
                  v-for="(tasks, agvId) in results.optimization_results.best_solution
                    .agv_assignments"
                  :key="agvId"
                >
                  <v-chip class="ma-1" color="primary" small>
                    AGV {{ agvId }}: 任务 {{ tasks.join(', ') }}
                  </v-chip>
                </div>
              </v-card-text>
            </v-card>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- 错误提示 -->
    <v-snackbar v-model="errorSnackbar" color="error" timeout="5000">
      {{ errorMessage }}
      <template v-slot:action="{ attrs }">
        <v-btn text v-bind="attrs" @click="errorSnackbar = false">关闭</v-btn>
      </template>
    </v-snackbar>

    <!-- 成功提示 -->
    <v-snackbar v-model="successSnackbar" color="success" timeout="3000">
      优化计算完成！
      <template v-slot:action="{ attrs }">
        <v-btn text v-bind="attrs" @click="successSnackbar = false">关闭</v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script>
import { callAgvDispatchService } from '@/services/AgvDispatch.js'
import Chart from 'chart.js/auto'

export default {
  name: 'AgvDispatchPage',
  data() {
    return {
      formValid: false,
      loading: false,
      errorSnackbar: false,
      successSnackbar: false,
      errorMessage: '',
      canvasSize: 500,
      currentTime: 0,
      isAnimating: false,
      animationId: null,
      totalDistance: 0,

      // 新增动画相关属性
      currentFrame: 0,
      maxFrames: 0,
      agvPaths: {},
      frameRate: 30,
      frameInterval: 1000 / 30,
      lastFrameTime: 0,

      params: {
        num_agvs: 3,
        agv_positions: [
          [0, 2],
          [0, 3],
          [0, 4],
        ],
        task_locations: {
          0: [
            [2, 17],
            [17, 19],
          ],
          1: [
            [2, 16],
            [17, 18],
          ],
          2: [
            [2, 15],
            [17, 17],
          ],
        },
        grid_size: [20, 20],
        obstacles: [
          [0, 0],
          [0, 6],
          [6, 0],
          [6, 6],
        ],
        optimization_config: {
          pop_size: 50,
          n_gen: 20,
          return_animation: true,
        },
      },

      results: null,
      animationData: null,
      paretoChart: null,
      agvColors: ['#FF5722', '#2196F3', '#4CAF50', '#FF9800', '#9C27B0', '#00BCD4'],
    }
  },

  mounted() {
    this.updateAgvPositions()
  },

  methods: {
    updateAgvPositions() {
      const currentLen = this.params.agv_positions.length
      const targetLen = this.params.num_agvs

      if (currentLen < targetLen) {
        for (let i = currentLen; i < targetLen; i++) {
          this.params.agv_positions.push([0, i + 2])
        }
      } else if (currentLen > targetLen) {
        this.params.agv_positions.splice(targetLen)
      }
    },

    addAgvPosition() {
      this.params.agv_positions.push([0, this.params.agv_positions.length + 2])
    },

    removeAgvPosition(index) {
      this.params.agv_positions.splice(index, 1)
    },

    addTask() {
      const taskIds = Object.keys(this.params.task_locations).map((id) => parseInt(id))
      const newTaskId = taskIds.length > 0 ? Math.max(...taskIds) + 1 : 0
      this.params.task_locations[newTaskId.toString()] = [
        [2, 2],
        [18, 18],
      ]
    },

    removeTask(taskId) {
      delete this.params.task_locations[taskId]
    },

    async runOptimization() {
      if (!this.formValid) return

      this.loading = true
      this.results = null
      this.animationData = null
      this.currentTime = 0

      try {
        const response = await callAgvDispatchService(this.params)

        if (response.success) {
          this.results = response.data
          this.animationData = response.data.visualization_data.animation_data
          this.totalDistance = this.animationData.total_distance
          this.successSnackbar = true

          this.$nextTick(() => {
            this.initializeVisualization()
          })
        } else {
          this.showError(response.message || '优化计算失败')
        }
      } catch (error) {
        this.showError('请求失败: ' + error.message)
      } finally {
        this.loading = false
      }
    },

    showError(message) {
      this.errorMessage = message
      this.errorSnackbar = true
    },

    initializeVisualization() {
      this.generateAGVPaths()
      this.drawAnimationFrame()
      this.drawParetoChart()
    },

    // 生成AGV路径数据
    generateAGVPaths() {
      if (!this.animationData) return

      this.agvPaths = {}
      const assignments = this.animationData.agv_assignments
      const tasks = this.animationData.task_locations
      const starts = this.animationData.agv_start_positions

      for (const [agvId, taskList] of Object.entries(assignments)) {
        const path = [starts[parseInt(agvId)]]
        let currentPos = starts[parseInt(agvId)]

        for (const taskId of taskList) {
          const [pickup, delivery] = tasks[taskId.toString()]

          // 添加到取货点的路径
          path.push(...this.calculatePath(currentPos, pickup))
          // 添加到送货点的路径
          path.push(...this.calculatePath(pickup, delivery))
          currentPos = delivery
        }

        this.agvPaths[agvId] = path
      }

      this.maxFrames = Math.max(...Object.values(this.agvPaths).map((p) => p.length))
      this.currentTime = this.maxFrames * 0.3 // 假设每帧0.3秒
    },

    // A*路径算法 (简化版L型路径)
    calculatePath(start, end) {
      const path = []
      let [x, y] = start
      const [targetX, targetY] = end

      // 先水平移动
      while (x !== targetX) {
        x += x < targetX ? 1 : -1
        if (!this.isObstacle(x, y)) {
          path.push([x, y])
        }
      }
      // 再垂直移动
      while (y !== targetY) {
        y += y < targetY ? 1 : -1
        if (!this.isObstacle(x, y)) {
          path.push([x, y])
        }
      }

      return path
    },

    // 检查是否为障碍物
    isObstacle(x, y) {
      return this.animationData.obstacles.some((obs) => obs[0] === x && obs[1] === y)
    },

    drawAnimationFrame() {
      if (!this.animationData || !this.$refs.animationCanvas) return

      const canvas = this.$refs.animationCanvas
      const ctx = canvas.getContext('2d')
      const { grid_size, obstacles, task_locations } = this.animationData

      // 清空画布
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // 计算缩放比例
      const scale = (this.canvasSize - 40) / Math.max(grid_size[0], grid_size[1])
      const offsetX = 20
      const offsetY = 20

      // 绘制网格
      ctx.strokeStyle = '#e9ecef'
      ctx.lineWidth = 1
      for (let i = 0; i <= grid_size[0]; i++) {
        ctx.beginPath()
        ctx.moveTo(offsetX + i * scale, offsetY)
        ctx.lineTo(offsetX + i * scale, offsetY + grid_size[1] * scale)
        ctx.stroke()
      }
      for (let i = 0; i <= grid_size[1]; i++) {
        ctx.beginPath()
        ctx.moveTo(offsetX, offsetY + i * scale)
        ctx.lineTo(offsetX + grid_size[0] * scale, offsetY + i * scale)
        ctx.stroke()
      }

      // 绘制障碍物
      ctx.fillStyle = '#343a40'
      obstacles.forEach(([x, y]) => {
        ctx.fillRect(offsetX + x * scale, offsetY + (grid_size[1] - 1 - y) * scale, scale, scale)
      })

      // 绘制任务位置
      const taskColors = ['#e74c3c', '#2ecc71', '#3498db', '#f39c12', '#9b59b6']
      Object.entries(task_locations).forEach(([taskId, [pickup, delivery]]) => {
        const color = taskColors[parseInt(taskId) % taskColors.length]

        // 取货点 (圆形)
        ctx.fillStyle = color
        ctx.beginPath()
        ctx.arc(
          offsetX + pickup[0] * scale + scale / 2,
          offsetY + (grid_size[1] - 1 - pickup[1]) * scale + scale / 2,
          scale / 3,
          0,
          2 * Math.PI,
        )
        ctx.fill()

        // 标签
        ctx.fillStyle = '#000'
        ctx.font = '10px Arial'
        ctx.textAlign = 'center'
        ctx.fillText(
          `P${taskId}`,
          offsetX + pickup[0] * scale + scale / 2,
          offsetY + (grid_size[1] - 1 - pickup[1]) * scale + scale / 2 + 3,
        )

        // 送货点 (方形)
        ctx.fillStyle = color
        ctx.fillRect(
          offsetX + delivery[0] * scale + scale / 6,
          offsetY + (grid_size[1] - 1 - delivery[1]) * scale + scale / 6,
          (scale * 2) / 3,
          (scale * 2) / 3,
        )

        ctx.fillStyle = '#000'
        ctx.fillText(
          `D${taskId}`,
          offsetX + delivery[0] * scale + scale / 2,
          offsetY + (grid_size[1] - 1 - delivery[1]) * scale + scale / 2 + 3,
        )
      })

      // 绘制AGV轨迹和当前位置
      Object.entries(this.agvPaths).forEach(([agvId, path], index) => {
        if (path.length === 0) return

        // 绘制轨迹
        this.drawTrail(
          ctx,
          path.slice(0, this.currentFrame + 1),
          index,
          scale,
          offsetX,
          offsetY,
          grid_size,
        )

        // 绘制AGV当前位置
        if (this.currentFrame < path.length) {
          const pos = path[this.currentFrame]
          this.drawAGV(
            ctx,
            offsetX + pos[0] * scale + scale / 2,
            offsetY + (grid_size[1] - 1 - pos[1]) * scale + scale / 2,
            this.agvColors[index % this.agvColors.length],
            scale / 3,
            parseInt(agvId),
          )
        }
      })
    },

    // 绘制轨迹
    drawTrail(ctx, trail, agvIndex, scale, offsetX, offsetY, gridSize) {
      if (trail.length < 2) return

      const color = this.agvColors[agvIndex % this.agvColors.length]

      ctx.strokeStyle = color + '80' // 半透明
      ctx.lineWidth = 3
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.beginPath()

      const firstPos = trail[0]
      ctx.moveTo(
        offsetX + firstPos[0] * scale + scale / 2,
        offsetY + (gridSize[1] - 1 - firstPos[1]) * scale + scale / 2,
      )

      for (let i = 1; i < trail.length; i++) {
        const pos = trail[i]
        ctx.lineTo(
          offsetX + pos[0] * scale + scale / 2,
          offsetY + (gridSize[1] - 1 - pos[1]) * scale + scale / 2,
        )
      }
      ctx.stroke()
    },

    // 绘制AGV
    drawAGV(ctx, x, y, color, size, agvId) {
      // AGV主体 (三角形)
      ctx.fillStyle = color
      ctx.strokeStyle = '#000'
      ctx.lineWidth = 2

      ctx.beginPath()
      ctx.moveTo(x, y - size)
      ctx.lineTo(x - size, y + size)
      ctx.lineTo(x + size, y + size)
      ctx.closePath()
      ctx.fill()
      ctx.stroke()

      // AGV标签
      ctx.fillStyle = 'white'
      ctx.font = 'bold 12px Arial'
      ctx.textAlign = 'center'
      ctx.fillText(`${agvId}`, x, y + 4)
    },

    // 根据时间计算当前帧
    calculateCurrentFrame() {
      if (!this.animationData || this.maxFrames === 0) return 0
      const progress = this.currentTime / this.animationData.total_time
      return Math.floor(progress * this.maxFrames)
    },

    startAnimation() {
      if (!this.animationData) return

      this.isAnimating = true
      this.lastFrameTime = performance.now()

      const animate = (timestamp) => {
        if (!this.isAnimating) return

        if (timestamp - this.lastFrameTime >= this.frameInterval) {
          this.currentFrame++
          if (this.currentFrame >= this.maxFrames) {
            this.currentFrame = this.maxFrames - 1
            this.isAnimating = false
          }

          // 更新时间显示
          this.currentTime = (this.currentFrame / this.maxFrames) * this.animationData.total_time

          this.drawAnimationFrame()
          this.lastFrameTime = timestamp
        }

        if (this.isAnimating) {
          this.animationId = requestAnimationFrame(animate)
        }
      }

      this.animationId = requestAnimationFrame(animate)
    },

    pauseAnimation() {
      this.isAnimating = false
      if (this.animationId) {
        cancelAnimationFrame(this.animationId)
        this.animationId = null
      }
    },

    resetAnimation() {
      this.pauseAnimation()
      this.currentFrame = 0
      this.currentTime = 0
      this.drawAnimationFrame()
    },

    toggleAnimation() {
      if (this.isAnimating) {
        this.pauseAnimation()
      } else {
        this.startAnimation()
      }
    },

    updateAnimationFrame() {
      if (!this.animationData) return

      // 根据滑块位置计算帧数
      this.currentFrame = this.calculateCurrentFrame()
      this.drawAnimationFrame()
    },

    drawParetoChart() {
      if (!this.results || !this.$refs.paretoChart) return

      const ctx = this.$refs.paretoChart.getContext('2d')

      if (this.paretoChart) {
        this.paretoChart.destroy()
      }

      const paretoData = this.results.visualization_data.pareto_front

      this.paretoChart = new Chart(ctx, {
        type: 'scatter',
        data: {
          datasets: [
            {
              label: '帕累托前沿',
              data: paretoData.map(([makespan, distance]) => ({ x: makespan, y: distance })),
              backgroundColor: '#2196F3',
              borderColor: '#1976D2',
              borderWidth: 2,
              pointRadius: 6,
            },
          ],
        },
        options: {
          responsive: true,
          scales: {
            x: {
              title: {
                display: true,
                text: '完工时间',
              },
            },
            y: {
              title: {
                display: true,
                text: '总距离',
              },
            },
          },
          plugins: {
            legend: {
              display: true,
            },
            title: {
              display: true,
              text: 'AGV调度帕累托前沿分析',
            },
          },
        },
      })
    },

    // 障碍物管理方法
    addObstacle() {
      // 添加到地图中心位置，避免与边界冲突
      const centerX = Math.floor(this.params.grid_size[0] / 2)
      const centerY = Math.floor(this.params.grid_size[1] / 2)

      // 确保不与现有障碍物重复
      let newObstacle = [centerX, centerY]
      let attempts = 0

      while (this.isObstacleExists(newObstacle) && attempts < 10) {
        newObstacle = [
          Math.floor(Math.random() * this.params.grid_size[0]),
          Math.floor(Math.random() * this.params.grid_size[1]),
        ]
        attempts++
      }

      this.params.obstacles.push(newObstacle)
    },

    removeObstacle(index) {
      if (index >= 0 && index < this.params.obstacles.length) {
        this.params.obstacles.splice(index, 1)
      }
    },

    clearObstacles() {
      this.$confirm('确定要清空所有障碍物吗？', '确认操作', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          this.params.obstacles = []
        })
        .catch(() => {
          // 用户取消操作
        })
    },

    // 验证障碍物位置
    validateObstacle(index) {
      if (index < 0 || index >= this.params.obstacles.length) return

      const obstacle = this.params.obstacles[index]

      // 确保坐标在有效范围内
      obstacle[0] = Math.max(0, Math.min(obstacle[0], this.params.grid_size[0] - 1))
      obstacle[1] = Math.max(0, Math.min(obstacle[1], this.params.grid_size[1] - 1))

      // 检查是否与其他障碍物重复
      const duplicateIndex = this.params.obstacles.findIndex(
        (obs, i) => i !== index && obs[0] === obstacle[0] && obs[1] === obstacle[1],
      )

      if (duplicateIndex !== -1) {
        // 找一个附近的空位置
        this.findNearbyEmptyPosition(obstacle)
      }
    },

    // 检查障碍物是否已存在
    isObstacleExists(position) {
      return this.params.obstacles.some((obs) => obs[0] === position[0] && obs[1] === position[1])
    },

    // 检查障碍物是否与AGV起始位置或任务点冲突
    isObstacleConflict(obstacle) {
      // 检查是否与AGV起始位置冲突
      const agvConflict = this.params.agv_positions.some(
        (pos) => pos[0] === obstacle[0] && pos[1] === obstacle[1],
      )

      if (agvConflict) return true

      // 检查是否与任务位置冲突
      const taskConflict = Object.values(this.params.task_locations).some(
        ([pickup, delivery]) =>
          (pickup[0] === obstacle[0] && pickup[1] === obstacle[1]) ||
          (delivery[0] === obstacle[0] && delivery[1] === obstacle[1]),
      )

      return taskConflict
    },

    // 寻找附近的空位置
    findNearbyEmptyPosition(obstacle) {
      const maxX = this.params.grid_size[0] - 1
      const maxY = this.params.grid_size[1] - 1

      // 在3x3范围内寻找空位
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          if (dx === 0 && dy === 0) continue

          const newX = Math.max(0, Math.min(obstacle[0] + dx, maxX))
          const newY = Math.max(0, Math.min(obstacle[1] + dy, maxY))
          const newPos = [newX, newY]

          if (!this.isObstacleExists(newPos) && !this.isObstacleConflict(newPos)) {
            obstacle[0] = newX
            obstacle[1] = newY
            return
          }
        }
      }
    },

    // 添加预设障碍物
    addWallObstacles(type) {
      const newObstacles = []
      const midX = Math.floor(this.params.grid_size[0] / 2)
      const midY = Math.floor(this.params.grid_size[1] / 2)

      if (type === 'horizontal') {
        // 添加水平墙
        for (let x = midX - 2; x <= midX + 2; x++) {
          if (x >= 0 && x < this.params.grid_size[0]) {
            const pos = [x, midY]
            if (!this.isObstacleExists(pos) && !this.isObstacleConflict(pos)) {
              newObstacles.push(pos)
            }
          }
        }
      } else if (type === 'vertical') {
        // 添加垂直墙
        for (let y = midY - 2; y <= midY + 2; y++) {
          if (y >= 0 && y < this.params.grid_size[1]) {
            const pos = [midX, y]
            if (!this.isObstacleExists(pos) && !this.isObstacleConflict(pos)) {
              newObstacles.push(pos)
            }
          }
        }
      }

      this.params.obstacles.push(...newObstacles)
    },

    addRandomObstacles() {
      const count = 5
      const newObstacles = []
      let attempts = 0

      while (newObstacles.length < count && attempts < 50) {
        const pos = [
          Math.floor(Math.random() * this.params.grid_size[0]),
          Math.floor(Math.random() * this.params.grid_size[1]),
        ]

        if (!this.isObstacleExists(pos) && !this.isObstacleConflict(pos)) {
          newObstacles.push(pos)
        }
        attempts++
      }

      this.params.obstacles.push(...newObstacles)
    },

    addCornerObstacles() {
      const corners = [
        [1, 1],
        [1, this.params.grid_size[1] - 2],
        [this.params.grid_size[0] - 2, 1],
        [this.params.grid_size[0] - 2, this.params.grid_size[1] - 2],
      ]

      const newObstacles = corners.filter(
        (pos) =>
          pos[0] >= 0 &&
          pos[0] < this.params.grid_size[0] &&
          pos[1] >= 0 &&
          pos[1] < this.params.grid_size[1] &&
          !this.isObstacleExists(pos) &&
          !this.isObstacleConflict(pos),
      )

      this.params.obstacles.push(...newObstacles)
    },
  },

  watch: {
    'params.num_agvs'(newVal) {
      this.updateAgvPositions()
    },

    // 监听地图大小变化，调整障碍物位置
    'params.grid_size': {
      handler(newSize, oldSize) {
        if (!oldSize) return

        // 移除超出边界的障碍物
        this.params.obstacles = this.params.obstacles.filter(
          (obs) => obs[0] < newSize[0] && obs[1] < newSize[1],
        )
      },
      deep: true,
    },
  },

  beforeUnmount() {
    this.pauseAnimation()
    if (this.paretoChart) {
      this.paretoChart.destroy()
    }
  },
}
</script>

<style scoped>
.v-card-title {
  font-weight: 600;
}

canvas {
  max-width: 100%;
  height: auto;
}

.v-expansion-panel-content {
  padding-top: 16px;
}
</style>
