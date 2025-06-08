<template>
  <v-container fluid class="pa-4">
    <v-row>
      <!-- 参数输入区域 -->
      <v-col cols="12" md="4" class="tw:!overflow-auto tw:!h-full">
        <v-card elevation="2" class="mb-4">
          <v-card-title class="primary white--text">
            <v-icon left color="white">mdi-robot</v-icon>
            AGV调度参数配置
          </v-card-title>

          <v-tabs-items v-model="activeTab">
            <!-- 基础配置 -->
            <v-tab-item>
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
                  <v-subheader class="px-0">AGV起始位置配置</v-subheader>
                  <v-expansion-panels accordion>
                    <v-expansion-panel>
                      <v-expansion-panel-header>
                        AGV位置设置 ({{ params.agv_positions.length }} 个)
                      </v-expansion-panel-header>
                      <v-expansion-panel-content>
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
                      </v-expansion-panel-content>
                    </v-expansion-panel>
                  </v-expansion-panels>
                </v-form>
              </v-card-text>
            </v-tab-item>

            <!-- 任务配置 -->
            <v-tab-item>
              <v-card-text class="pt-4">
                <v-subheader class="px-0">任务位置配置</v-subheader>
                <div class="task-config-container" style="max-height: 400px; overflow-y: auto">
                  <div
                    v-for="taskId in Object.keys(params.task_locations)"
                    :key="taskId"
                    class="mb-3"
                  >
                    <v-card outlined>
                      <v-card-subtitle>
                        <v-icon left small>mdi-package-variant</v-icon>
                        任务 {{ taskId }}
                        <v-spacer />
                        <v-btn icon small color="error" @click="removeTask(taskId)">
                          <v-icon>mdi-delete</v-icon>
                        </v-btn>
                      </v-card-subtitle>
                      <v-card-text>
                        <v-row>
                          <v-col cols="6">
                            <v-text-field
                              v-model.number="params.task_locations[taskId][0][0]"
                              label="取货X"
                              type="number"
                              outlined
                              dense
                              hide-details
                            />
                          </v-col>
                          <v-col cols="6">
                            <v-text-field
                              v-model.number="params.task_locations[taskId][0][1]"
                              label="取货Y"
                              type="number"
                              outlined
                              dense
                              hide-details
                            />
                          </v-col>
                          <v-col cols="6">
                            <v-text-field
                              v-model.number="params.task_locations[taskId][1][0]"
                              label="送达X"
                              type="number"
                              outlined
                              dense
                              hide-details
                            />
                          </v-col>
                          <v-col cols="6">
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
                      </v-card-text>
                    </v-card>
                  </div>
                </div>
                <v-btn small color="primary" @click="addTask" class="mt-2">
                  <v-icon left>mdi-plus</v-icon>
                  添加任务
                </v-btn>
              </v-card-text>
            </v-tab-item>

            <!-- 障碍物配置 -->
            <v-tab-item>
              <v-card-text class="pt-4">
                <v-subheader class="px-0">
                  <v-icon left>mdi-wall</v-icon>
                  障碍物配置 ({{ params.obstacles.length }} 个)
                </v-subheader>

                <div class="obstacle-config-container" style="max-height: 300px; overflow-y: auto">
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
                          :label="`${index + 1} X`"
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
                          :label="`${index + 1} Y`"
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
                </div>

                <v-divider class="my-3" />

                <v-row>
                  <v-col cols="6">
                    <v-btn small color="primary" @click="addObstacle" :disabled="loading" block>
                      <v-icon left>mdi-plus</v-icon>
                      添加
                    </v-btn>
                  </v-col>
                  <v-col cols="6">
                    <v-btn
                      small
                      color="warning"
                      outlined
                      @click="clearObstacles"
                      :disabled="loading || params.obstacles.length === 0"
                      block
                    >
                      <v-icon left>mdi-delete-sweep</v-icon>
                      清空
                    </v-btn>
                  </v-col>
                </v-row>

                <!-- 预设障碍物 -->
                <v-expansion-panels class="mt-3">
                  <v-expansion-panel>
                    <v-expansion-panel-header>
                      <span>
                        <v-icon left>mdi-creation</v-icon>
                        快速预设
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
                            水平墙
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
                            垂直墙
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
                            随机5个
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
                            角落障碍
                          </v-btn>
                        </v-col>
                      </v-row>
                    </v-expansion-panel-content>
                  </v-expansion-panel>
                </v-expansion-panels>
              </v-card-text>
            </v-tab-item>

            <!-- 高级配置 -->
            <v-tab-item>
              <v-card-text class="pt-4">
                <v-subheader class="px-0">优化算法参数</v-subheader>
                <v-text-field
                  v-model.number="params.optimization_config.pop_size"
                  label="种群大小"
                  type="number"
                  prepend-icon="mdi-account-group"
                  outlined
                  dense
                  hint="建议值: 50-100"
                  persistent-hint
                />
                <v-text-field
                  v-model.number="params.optimization_config.n_gen"
                  label="迭代次数"
                  type="number"
                  prepend-icon="mdi-refresh"
                  outlined
                  dense
                  hint="建议值: 20-50"
                  persistent-hint
                  class="mt-3"
                />

                <v-divider class="my-4" />

                <v-subheader class="px-0">快速预设配置</v-subheader>
                <v-row>
                  <v-col cols="6">
                    <v-btn small block color="success" outlined @click="applyQuickConfig('small')">
                      小规模测试
                    </v-btn>
                  </v-col>
                  <v-col cols="6">
                    <v-btn small block color="info" outlined @click="applyQuickConfig('medium')">
                      中等规模
                    </v-btn>
                  </v-col>
                  <v-col cols="6">
                    <v-btn small block color="warning" outlined @click="applyQuickConfig('large')">
                      大规模仓库
                    </v-btn>
                  </v-col>
                  <v-col cols="6">
                    <v-btn small block color="purple" outlined @click="resetToDefault">
                      重置默认
                    </v-btn>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-tab-item>
          </v-tabs-items>

          <!-- 固定操作按钮区域 -->
          <v-divider />
          <v-card-actions class="pa-4">
            <!-- 配置管理按钮组 -->
            <v-row class="mb-3">
              <v-col cols="12">
                <v-btn small block color="info" outlined @click="exportConfig" :disabled="loading">
                  <v-icon left small>mdi-download</v-icon>
                  导出配置
                </v-btn>
              </v-col>
              <v-col cols="12">
                <v-btn
                  small
                  block
                  color="success"
                  outlined
                  @click="triggerImportConfig"
                  :disabled="loading"
                >
                  <v-icon left small>mdi-upload</v-icon>
                  导入配置
                </v-btn>
                <!-- 隐藏的文件输入 -->
                <input
                  ref="configFileInput"
                  type="file"
                  accept=".json"
                  style="display: none"
                  @change="importConfig"
                />
              </v-col>
            </v-row>

            <!-- 主要操作按钮 -->
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

        <!-- 干特图展示 -->
        <v-card v-if="results" elevation="2" class="mb-4">
          <v-card-title class="deep-purple white--text">
            <v-icon left color="white">mdi-chart-gantt</v-icon>
            AGV任务甘特图
            <v-spacer />
            <v-btn-toggle v-model="ganttViewMode" mandatory dense>
              <v-btn small value="timeline" text color="white">
                <v-icon>mdi-timeline</v-icon>
                时间线
              </v-btn>
              <v-btn small value="resource" text color="white">
                <v-icon>mdi-account-multiple</v-icon>
                资源视图
              </v-btn>
            </v-btn-toggle>
          </v-card-title>

          <v-card-text>
            <div class="gantt-container">
              <canvas
                ref="ganttCanvas"
                :width="ganttCanvasWidth"
                :height="ganttCanvasHeight"
                style="border: 1px solid #e0e0e0; border-radius: 4px; cursor: crosshair"
                @mousemove="onGanttMouseMove"
                @mouseleave="onGanttMouseLeave"
                @click="onGanttClick"
              />
            </div>

            <!-- 干特图控制面板 -->
            <v-row class="mt-3">
              <v-col cols="6" md="3">
                <v-card outlined>
                  <v-card-text class="text-center">
                    <div class="text-h6 deep-purple--text">
                      {{ ganttData ? Object.keys(ganttData.agv_schedules).length : 0 }}
                    </div>
                    <div class="text-caption">AGV数量</div>
                  </v-card-text>
                </v-card>
              </v-col>
              <v-col cols="6" md="3">
                <v-card outlined>
                  <v-card-text class="text-center">
                    <div class="text-h6 success--text">
                      {{ ganttData ? ganttData.total_tasks : 0 }}
                    </div>
                    <div class="text-caption">总任务数</div>
                  </v-card-text>
                </v-card>
              </v-col>
              <v-col cols="6" md="3">
                <v-card outlined>
                  <v-card-text class="text-center">
                    <div class="text-h6 info--text">
                      {{ ganttData ? Math.round(ganttData.makespan * 10) / 10 : 0 }}
                    </div>
                    <div class="text-caption">总完工时间</div>
                  </v-card-text>
                </v-card>
              </v-col>
              <v-col cols="6" md="3">
                <v-card outlined>
                  <v-card-text class="text-center">
                    <div class="text-h6 warning--text">
                      {{ ganttData ? Math.round(ganttUtilization * 100) : 0 }}%
                    </div>
                    <div class="text-caption">平均利用率</div>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>

            <!-- 时间范围控制 -->
            <v-row class="mt-3">
              <v-col cols="12">
                <v-range-slider
                  v-model="ganttTimeRange"
                  :max="ganttData ? ganttData.makespan : 100"
                  :step="0.1"
                  label="时间范围"
                  thumb-label="always"
                  class="mt-4"
                  @input="updateGanttView"
                >
                  <template v-slot:prepend>
                    <v-text-field
                      :value="ganttTimeRange[0]"
                      type="number"
                      style="width: 60px"
                      dense
                      hide-details
                      @change="updateTimeRange(0, $event)"
                    />
                  </template>
                  <template v-slot:append>
                    <v-text-field
                      :value="ganttTimeRange[1]"
                      type="number"
                      style="width: 60px"
                      dense
                      hide-details
                      @change="updateTimeRange(1, $event)"
                    />
                  </template>
                </v-range-slider>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- 结果统计和图表 -->
        <v-row v-if="results">
          <!-- 帕累托前沿图表 -->
          <v-col cols="12" lg="6">
            <v-card elevation="2" class="mb-4">
              <v-card-title class="info white--text">
                <v-icon left color="white">mdi-chart-scatter-plot</v-icon>
                帕累托前沿分析
              </v-card-title>
              <v-card-text>
                <canvas ref="paretoChart" width="400" height="300"></canvas>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- 优化结果统计 -->
          <v-col cols="12" lg="6">
            <v-card elevation="2" class="mb-4">
              <v-card-title class="warning white--text">
                <v-icon left color="white">mdi-chart-bar</v-icon>
                优化结果统计
              </v-card-title>
              <v-card-text>
                <v-row>
                  <v-col cols="6">
                    <v-card outlined>
                      <v-card-text class="text-center">
                        <div class="text-h6 primary--text">
                          {{ results.optimization_results.total_solutions }}
                        </div>
                        <div class="text-caption">总解数量</div>
                      </v-card-text>
                    </v-card>
                  </v-col>
                  <v-col cols="6">
                    <v-card outlined>
                      <v-card-text class="text-center">
                        <div class="text-h6 success--text">
                          {{
                            Math.round(results.optimization_results.computation_time * 100) / 100
                          }}s
                        </div>
                        <div class="text-caption">计算时间</div>
                      </v-card-text>
                    </v-card>
                  </v-col>
                  <v-col cols="6">
                    <v-card outlined>
                      <v-card-text class="text-center">
                        <div class="text-h6 info--text">
                          {{
                            Math.round(results.optimization_results.best_solution.makespan * 10) /
                            10
                          }}
                        </div>
                        <div class="text-caption">最优完工时间</div>
                      </v-card-text>
                    </v-card>
                  </v-col>
                  <v-col cols="6">
                    <v-card outlined>
                      <v-card-text class="text-center">
                        <div class="text-h6 warning--text">
                          {{
                            Math.round(results.optimization_results.best_solution.distance * 10) /
                            10
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

    <!-- 干特图详情弹窗 -->
    <v-dialog v-model="ganttDetailDialog" max-width="600">
      <v-card>
        <v-card-title class="deep-purple white--text">
          <v-icon left color="white">mdi-information</v-icon>
          任务详情
        </v-card-title>
        <v-card-text v-if="selectedGanttItem" class="pt-4">
          <v-row>
            <v-col cols="6">
              <v-text-field
                :value="selectedGanttItem.agvId"
                label="AGV编号"
                readonly
                outlined
                dense
                persistent-placeholder
              />
            </v-col>
            <v-col cols="6">
              <v-text-field
                :value="selectedGanttItem.taskId"
                label="任务编号"
                readonly
                outlined
                dense
                persistent-placeholder
              />
            </v-col>
            <v-col cols="6">
              <v-text-field
                :value="selectedGanttItem.type"
                label="任务类型"
                readonly
                outlined
                dense
                persistent-placeholder
              />
            </v-col>
            <v-col cols="6">
              <v-text-field
                :value="`${Math.round(selectedGanttItem.duration * 10) / 10}s`"
                label="持续时间"
                readonly
                outlined
                dense
                persistent-placeholder
              />
            </v-col>
            <v-col cols="6">
              <v-text-field
                :value="`${Math.round(selectedGanttItem.start_time * 10) / 10}s`"
                label="开始时间"
                readonly
                outlined
                dense
                persistent-placeholder
              />
            </v-col>
            <v-col cols="6">
              <v-text-field
                :value="`${Math.round(selectedGanttItem.end_time * 10) / 10}s`"
                label="结束时间"
                readonly
                outlined
                dense
                persistent-placeholder
              />
            </v-col>
            <v-col cols="12">
              <v-text-field
                :value="`(${selectedGanttItem.location[0]}, ${selectedGanttItem.location[1]})`"
                label="位置坐标"
                readonly
                outlined
                dense
                persistent-placeholder
              />
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="ganttDetailDialog = false">关闭</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 配置导入确认弹窗 -->
    <v-dialog v-model="importConfirmDialog" max-width="500">
      <v-card>
        <v-card-title class="warning white--text">
          <v-icon left color="white">mdi-alert</v-icon>
          确认导入配置
        </v-card-title>
        <v-card-text class="pt-4">
          <v-alert type="warning" outlined class="mb-4">
            导入新配置将覆盖当前所有参数设置，此操作不可撤销。
          </v-alert>

          <div v-if="importPreview" class="config-preview">
            <v-card outlined>
              <v-card-subtitle>配置预览</v-card-subtitle>
              <v-card-text>
                <v-row>
                  <v-col cols="6">
                    <div class="text-caption">AGV数量</div>
                    <div class="text-body-2 font-weight-bold">{{ importPreview.num_agvs }}</div>
                  </v-col>
                  <v-col cols="6">
                    <div class="text-caption">地图大小</div>
                    <div class="text-body-2 font-weight-bold">
                      {{ importPreview.grid_size[0] }} × {{ importPreview.grid_size[1] }}
                    </div>
                  </v-col>
                  <v-col cols="6">
                    <div class="text-caption">任务数量</div>
                    <div class="text-body-2 font-weight-bold">
                      {{ Object.keys(importPreview.task_locations).length }}
                    </div>
                  </v-col>
                  <v-col cols="6">
                    <div class="text-caption">障碍物数量</div>
                    <div class="text-body-2 font-weight-bold">
                      {{ importPreview.obstacles.length }}
                    </div>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-btn text @click="cancelImport">取消</v-btn>
          <v-spacer />
          <v-btn color="warning" @click="confirmImport">确认导入</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 配置导出成功提示 -->
    <v-snackbar v-model="exportSuccessSnackbar" color="success" timeout="3000">
      配置文件已成功导出！
      <template v-slot:action="{ attrs }">
        <v-btn text v-bind="attrs" @click="exportSuccessSnackbar = false">关闭</v-btn>
      </template>
    </v-snackbar>

    <!-- 配置导入成功提示 -->
    <v-snackbar v-model="importSuccessSnackbar" color="success" timeout="3000">
      配置文件已成功导入！
      <template v-slot:action="{ attrs }">
        <v-btn text v-bind="attrs" @click="importSuccessSnackbar = false">关闭</v-btn>
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
      // 新增标签页状态
      activeTab: 0,

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

      // 新增干特图相关数据
      ganttData: null,
      ganttViewMode: 'timeline',
      ganttCanvasWidth: 800,
      ganttCanvasHeight: 400,
      ganttTimeRange: [0, 100],
      ganttUtilization: 0,
      selectedGanttItem: null,
      ganttDetailDialog: false,
      ganttTooltip: {
        show: false,
        x: 0,
        y: 0,
        content: '',
      },

      // 新增配置管理相关数据
      importConfirmDialog: false,
      importPreview: null,
      pendingConfigData: null,
      exportSuccessSnackbar: false,
      importSuccessSnackbar: false,

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

      // 默认配置预设
      defaultConfigs: {
        small: {
          num_agvs: 2,
          grid_size: [10, 10],
          agv_positions: [
            [0, 0],
            [0, 1],
          ],
          task_locations: {
            0: [
              [2, 8],
              [8, 2],
            ],
            1: [
              [1, 7],
              [7, 1],
            ],
          },
          obstacles: [[5, 5]],
          optimization_config: { pop_size: 20, n_gen: 10 },
        },
        medium: {
          num_agvs: 3,
          grid_size: [15, 15],
          agv_positions: [
            [0, 2],
            [0, 3],
            [0, 4],
          ],
          task_locations: {
            0: [
              [2, 12],
              [12, 13],
            ],
            1: [
              [3, 11],
              [11, 12],
            ],
            2: [
              [4, 10],
              [10, 11],
            ],
          },
          obstacles: [
            [7, 7],
            [7, 8],
            [8, 7],
            [8, 8],
          ],
          optimization_config: { pop_size: 50, n_gen: 20 },
        },
        large: {
          num_agvs: 5,
          grid_size: [25, 25],
          agv_positions: [
            [0, 2],
            [0, 3],
            [0, 4],
            [0, 5],
            [0, 6],
          ],
          task_locations: {
            0: [
              [2, 22],
              [22, 20],
            ],
            1: [
              [3, 21],
              [21, 19],
            ],
            2: [
              [4, 20],
              [20, 18],
            ],
            3: [
              [5, 19],
              [19, 17],
            ],
            4: [
              [6, 18],
              [18, 16],
            ],
          },
          obstacles: [],
          optimization_config: { pop_size: 100, n_gen: 50 },
        },
      },
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
      this.ganttData = null
      this.currentTime = 0

      try {
        const response = await callAgvDispatchService(this.params)

        if (response.success) {
          this.results = response.data
          this.animationData = response.data.visualization_data.animation_data
          this.totalDistance = this.animationData.total_distance

          // 生成干特图数据
          this.generateGanttData()

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
      this.drawGanttChart()
    },

    // 生成干特图数据
    generateGanttData() {
      if (!this.results || !this.animationData) return

      const assignments = this.animationData.agv_assignments
      const taskLocations = this.animationData.task_locations
      const agvStartPositions = this.animationData.agv_start_positions

      const agvSchedules = {}
      let totalTasks = 0
      let maxEndTime = 0

      Object.entries(assignments).forEach(([agvId, taskList]) => {
        const agvIdNum = parseInt(agvId)
        const schedule = []
        let currentTime = 0
        let currentPosition = agvStartPositions[agvIdNum]

        taskList.forEach((taskId) => {
          const [pickupPos, deliveryPos] = taskLocations[taskId.toString()]

          // 移动到取货点
          const moveToPickupTime = this.calculateTravelTime(currentPosition, pickupPos)
          if (moveToPickupTime > 0) {
            schedule.push({
              type: 'move',
              taskId: taskId,
              start_time: currentTime,
              end_time: currentTime + moveToPickupTime,
              duration: moveToPickupTime,
              location: pickupPos,
              description: `移动到取货点 ${taskId}`,
            })
            currentTime += moveToPickupTime
          }

          // 取货操作
          const pickupTime = 0.5 // 假设取货需要0.5秒
          schedule.push({
            type: 'pickup',
            taskId: taskId,
            start_time: currentTime,
            end_time: currentTime + pickupTime,
            duration: pickupTime,
            location: pickupPos,
            description: `取货任务 ${taskId}`,
          })
          currentTime += pickupTime

          // 移动到送货点
          const moveToDeliveryTime = this.calculateTravelTime(pickupPos, deliveryPos)
          if (moveToDeliveryTime > 0) {
            schedule.push({
              type: 'move',
              taskId: taskId,
              start_time: currentTime,
              end_time: currentTime + moveToDeliveryTime,
              duration: moveToDeliveryTime,
              location: deliveryPos,
              description: `移动到送货点 ${taskId}`,
            })
            currentTime += moveToDeliveryTime
          }

          // 送货操作
          const deliveryTime = 0.5 // 假设送货需要0.5秒
          schedule.push({
            type: 'delivery',
            taskId: taskId,
            start_time: currentTime,
            end_time: currentTime + deliveryTime,
            duration: deliveryTime,
            location: deliveryPos,
            description: `送货任务 ${taskId}`,
          })
          currentTime += deliveryTime
          currentPosition = deliveryPos
          totalTasks++
        })

        agvSchedules[agvId] = schedule
        maxEndTime = Math.max(maxEndTime, currentTime)
      })

      // 计算利用率
      const totalWorkTime = Object.values(agvSchedules).reduce((sum, schedule) => {
        return sum + schedule.reduce((scheduleSum, task) => scheduleSum + task.duration, 0)
      }, 0)

      const totalAvailableTime = Object.keys(agvSchedules).length * maxEndTime
      this.ganttUtilization =
        totalAvailableTime > 0 ? (totalWorkTime / totalAvailableTime) * 100 : 0

      this.ganttData = {
        agv_schedules: agvSchedules,
        makespan: maxEndTime,
        total_tasks: totalTasks,
      }

      this.ganttTimeRange = [0, maxEndTime]
    },

    // 计算移动时间（简化版，基于曼哈顿距离）
    calculateTravelTime(from, to) {
      const distance = Math.abs(from[0] - to[0]) + Math.abs(from[1] - to[1])
      return distance * 0.3 // 假设每个单位距离需要0.3秒
    },

    // 绘制干特图
    drawGanttChart() {
      if (!this.ganttData || !this.$refs.ganttCanvas) return

      const canvas = this.$refs.ganttCanvas
      const ctx = canvas.getContext('2d')

      // 清空画布
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const margin = { top: 50, right: 50, bottom: 50, left: 80 }
      const chartWidth = canvas.width - margin.left - margin.right
      const chartHeight = canvas.height - margin.top - margin.bottom

      const agvIds = Object.keys(this.ganttData.agv_schedules)
      const rowHeight = chartHeight / agvIds.length
      const timeScale = chartWidth / (this.ganttTimeRange[1] - this.ganttTimeRange[0])

      // 绘制背景网格
      this.drawGanttGrid(ctx, margin, chartWidth, chartHeight, rowHeight, timeScale)

      // 绘制时间轴
      this.drawGanttTimeAxis(ctx, margin, chartWidth, timeScale)

      // 绘制AGV标签
      this.drawGanttAgvLabels(ctx, margin, agvIds, rowHeight)

      // 绘制任务条
      this.drawGanttTasks(ctx, margin, rowHeight, timeScale, agvIds)
    },

    // 绘制网格
    drawGanttGrid(ctx, margin, chartWidth, chartHeight, rowHeight, timeScale) {
      ctx.strokeStyle = '#e0e0e0'
      ctx.lineWidth = 1

      // 垂直网格线（时间）
      const timeStep = this.calculateTimeStep()
      for (let t = this.ganttTimeRange[0]; t <= this.ganttTimeRange[1]; t += timeStep) {
        const x = margin.left + (t - this.ganttTimeRange[0]) * timeScale
        ctx.beginPath()
        ctx.moveTo(x, margin.top)
        ctx.lineTo(x, margin.top + chartHeight)
        ctx.stroke()
      }

      // 水平网格线（AGV）
      for (let i = 0; i <= Object.keys(this.ganttData.agv_schedules).length; i++) {
        const y = margin.top + i * rowHeight
        ctx.beginPath()
        ctx.moveTo(margin.left, y)
        ctx.lineTo(margin.left + chartWidth, y)
        ctx.stroke()
      }
    },

    // 计算时间轴步长
    calculateTimeStep() {
      const timeRange = this.ganttTimeRange[1] - this.ganttTimeRange[0]
      if (timeRange <= 10) return 1
      if (timeRange <= 50) return 5
      if (timeRange <= 100) return 10
      return Math.ceil(timeRange / 10)
    },

    // 绘制时间轴
    drawGanttTimeAxis(ctx, margin, chartWidth, timeScale) {
      ctx.fillStyle = '#333'
      ctx.font = '12px Arial'
      ctx.textAlign = 'center'

      const timeStep = this.calculateTimeStep()
      for (let t = this.ganttTimeRange[0]; t <= this.ganttTimeRange[1]; t += timeStep) {
        const x = margin.left + (t - this.ganttTimeRange[0]) * timeScale
        ctx.fillText(t.toFixed(1), x, margin.top - 10)
      }

      // 时间轴标题
      ctx.textAlign = 'center'
      ctx.font = 'bold 14px Arial'
      ctx.fillText('时间 (秒)', margin.left + chartWidth / 2, 20)
    },

    // 绘制AGV标签
    drawGanttAgvLabels(ctx, margin, agvIds, rowHeight) {
      ctx.fillStyle = '#333'
      ctx.font = '14px Arial'
      ctx.textAlign = 'right'

      agvIds.forEach((agvId, index) => {
        const y = margin.top + index * rowHeight + rowHeight / 2
        ctx.fillText(`AGV ${agvId}`, margin.left - 10, y + 5)
      })
    },

    // 绘制任务条
    drawGanttTasks(ctx, margin, rowHeight, timeScale, agvIds) {
      const taskColors = {
        move: '#FFC107',
        pickup: '#4CAF50',
        delivery: '#2196F3',
      }

      agvIds.forEach((agvId, agvIndex) => {
        const schedule = this.ganttData.agv_schedules[agvId]
        const y = margin.top + agvIndex * rowHeight + 5
        const barHeight = rowHeight - 10

        schedule.forEach((task) => {
          if (
            task.start_time >= this.ganttTimeRange[1] ||
            task.end_time <= this.ganttTimeRange[0]
          ) {
            return // 不在显示范围内
          }

          const startX =
            margin.left + Math.max(0, (task.start_time - this.ganttTimeRange[0]) * timeScale)
          const endX =
            margin.left +
            Math.min(
              (this.ganttTimeRange[1] - this.ganttTimeRange[0]) * timeScale,
              (task.end_time - this.ganttTimeRange[0]) * timeScale,
            )
          const width = endX - startX

          if (width > 0) {
            // 绘制任务条
            ctx.fillStyle = taskColors[task.type] || '#9E9E9E'
            ctx.fillRect(startX, y, width, barHeight)

            // 绘制边框
            ctx.strokeStyle = '#fff'
            ctx.lineWidth = 1
            ctx.strokeRect(startX, y, width, barHeight)

            // 绘制任务文本
            if (width > 40) {
              ctx.fillStyle = '#fff'
              ctx.font = '10px Arial'
              ctx.textAlign = 'center'
              const text = `T${task.taskId}-${task.type.charAt(0).toUpperCase()}`
              ctx.fillText(text, startX + width / 2, y + barHeight / 2 + 3)
            }

            // 保存任务位置信信息供点击检测使用
            task._renderInfo = {
              x: startX,
              y: y,
              width: width,
              height: barHeight,
              agvId: agvId,
            }
          }
        })
      })
    },

    // 干特图鼠标移动事件
    onGanttMouseMove(event) {
      if (!this.ganttData) return

      const rect = this.$refs.ganttCanvas.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top

      let hoveredTask = null

      // 查找鼠标悬停的任务
      Object.values(this.ganttData.agv_schedules).forEach((schedule) => {
        schedule.forEach((task) => {
          if (task._renderInfo) {
            const { x: taskX, y: taskY, width, height } = task._renderInfo
            if (x >= taskX && x <= taskX + width && y >= taskY && y <= taskY + height) {
              hoveredTask = task
            }
          }
        })
      })

      // 更新鼠标样式和提示
      this.$refs.ganttCanvas.style.cursor = hoveredTask ? 'pointer' : 'crosshair'

      if (hoveredTask) {
        this.ganttTooltip = {
          show: true,
          x: event.clientX,
          y: event.clientY,
          content: `${hoveredTask.description} (${hoveredTask.duration.toFixed(1)}s)`,
        }
      } else {
        this.ganttTooltip.show = false
      }
    },

    // 干特图鼠标离开事件
    onGanttMouseLeave() {
      this.ganttTooltip.show = false
      this.$refs.ganttCanvas.style.cursor = 'crosshair'
    },

    // 干特图点击事件
    onGanttClick(event) {
      if (!this.ganttData) return

      const rect = this.$refs.ganttCanvas.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top

      // 查找点击的任务
      Object.values(this.ganttData.agv_schedules).forEach((schedule) => {
        schedule.forEach((task) => {
          if (task._renderInfo) {
            const { x: taskX, y: taskY, width, height, agvId } = task._renderInfo
            if (x >= taskX && x <= taskX + width && y >= taskY && y <= taskY + height) {
              this.selectedGanttItem = {
                ...task,
                agvId,
              }
              this.ganttDetailDialog = true
            }
          }
        })
      })
    },

    // 更新时间范围
    updateTimeRange(index, value) {
      const newValue = parseFloat(value)
      if (!isNaN(newValue)) {
        this.$set(this.ganttTimeRange, index, newValue)
        this.updateGanttView()
      }
    },

    // 更新干特图视图
    updateGanttView() {
      this.$nextTick(() => {
        this.drawGanttChart()
      })
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

    // 新增快速配置方法
    applyQuickConfig(type) {
      if (this.defaultConfigs[type]) {
        const config = JSON.parse(JSON.stringify(this.defaultConfigs[type]))
        Object.assign(this.params, config)
        this.$nextTick(() => {
          this.activeTab = 0 // 切换到基础配置标签
        })
      }
    },

    resetToDefault() {
      this.applyQuickConfig('medium')
    },

    // 导出配置文件
    exportConfig() {
      try {
        // 创建配置对象，包含所有参数和元数据
        const configData = {
          version: '1.0.0',
          timestamp: new Date().toISOString(),
          description: 'AGV调度系统配置文件',
          config: {
            ...this.params,
            // 深拷贝确保数据完整性
            agv_positions: JSON.parse(JSON.stringify(this.params.agv_positions)),
            task_locations: JSON.parse(JSON.stringify(this.params.task_locations)),
            obstacles: JSON.parse(JSON.stringify(this.params.obstacles)),
            optimization_config: JSON.parse(JSON.stringify(this.params.optimization_config)),
          },
        }

        // 创建并下载文件
        const dataStr = JSON.stringify(configData, null, 2)
        const dataBlob = new Blob([dataStr], { type: 'application/json' })

        const link = document.createElement('a')
        link.href = URL.createObjectURL(dataBlob)
        link.download = `agv_config_${this.formatDateTime(new Date())}.json`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        // 清理URL对象
        URL.revokeObjectURL(link.href)

        this.exportSuccessSnackbar = true
      } catch (error) {
        this.showError('导出配置文件失败: ' + error.message)
      }
    },

    // 触发导入配置文件
    triggerImportConfig() {
      this.$refs.configFileInput.click()
    },

    // 导入配置文件
    async importConfig(event) {
      const file = event.target.files[0]
      if (!file) return

      // 验证文件类型
      if (!file.name.toLowerCase().endsWith('.json')) {
        this.showError('请选择JSON格式的配置文件')
        this.resetFileInput()
        return
      }

      try {
        const fileContent = await this.readFileAsText(file)
        const configData = JSON.parse(fileContent)

        // 验证配置文件格式
        if (!this.validateConfigFile(configData)) {
          this.showError('配置文件格式不正确或数据不完整')
          this.resetFileInput()
          return
        }

        // 显示预览并确认导入
        this.importPreview = configData.config || configData
        this.pendingConfigData = configData.config || configData
        this.importConfirmDialog = true
      } catch (error) {
        this.showError('读取配置文件失败: ' + error.message)
      } finally {
        this.resetFileInput()
      }
    },

    // 确认导入配置
    confirmImport() {
      if (!this.pendingConfigData) return

      try {
        // 应用配置
        this.applyImportedConfig(this.pendingConfigData)

        this.importConfirmDialog = false
        this.importPreview = null
        this.pendingConfigData = null
        this.importSuccessSnackbar = true

        // 切换到基础配置标签
        this.$nextTick(() => {
          this.activeTab = 0
        })
      } catch (error) {
        this.showError('应用配置失败: ' + error.message)
      }
    },

    // 取消导入
    cancelImport() {
      this.importConfirmDialog = false
      this.importPreview = null
      this.pendingConfigData = null
    },

    // 应用导入的配置
    applyImportedConfig(configData) {
      // 验证并应用基础参数
      this.params.num_agvs = this.validateNumber(configData.num_agvs, 1, 10, 3)

      // 验证并应用地图大小
      if (Array.isArray(configData.grid_size) && configData.grid_size.length === 2) {
        this.params.grid_size[0] = this.validateNumber(configData.grid_size[0], 5, 50, 20)
        this.params.grid_size[1] = this.validateNumber(configData.grid_size[1], 5, 50, 20)
      }

      // 验证并应用AGV位置
      if (Array.isArray(configData.agv_positions)) {
        this.params.agv_positions = configData.agv_positions
          .filter((pos) => Array.isArray(pos) && pos.length === 2)
          .map((pos) => [
            this.validateNumber(pos[0], 0, this.params.grid_size[0] - 1, 0),
            this.validateNumber(pos[1], 0, this.params.grid_size[1] - 1, 0),
          ])
          .slice(0, this.params.num_agvs)

        // 确保AGV位置数量匹配
        while (this.params.agv_positions.length < this.params.num_agvs) {
          this.params.agv_positions.push([0, this.params.agv_positions.length])
        }
      }

      // 验证并应用任务位置
      if (configData.task_locations && typeof configData.task_locations === 'object') {
        this.params.task_locations = {}
        Object.entries(configData.task_locations).forEach(([taskId, locations]) => {
          if (Array.isArray(locations) && locations.length === 2) {
            const [pickup, delivery] = locations
            if (
              Array.isArray(pickup) &&
              Array.isArray(delivery) &&
              pickup.length === 2 &&
              delivery.length === 2
            ) {
              this.params.task_locations[taskId] = [
                [
                  this.validateNumber(pickup[0], 0, this.params.grid_size[0] - 1, 0),
                  this.validateNumber(pickup[1], 0, this.params.grid_size[1] - 1, 0),
                ],
                [
                  this.validateNumber(delivery[0], 0, this.params.grid_size[0] - 1, 0),
                  this.validateNumber(delivery[1], 0, this.params.grid_size[1] - 1, 0),
                ],
              ]
            }
          }
        })
      }

      // 验证并应用障碍物
      if (Array.isArray(configData.obstacles)) {
        this.params.obstacles = configData.obstacles
          .filter((obs) => Array.isArray(obs) && obs.length === 2)
          .map((obs) => [
            this.validateNumber(obs[0], 0, this.params.grid_size[0] - 1, 0),
            this.validateNumber(obs[1], 0, this.params.grid_size[1] - 1, 0),
          ])
          .filter((obs) => !this.isObstacleConflict(obs))
      }

      // 验证并应用优化配置
      if (configData.optimization_config && typeof configData.optimization_config === 'object') {
        this.params.optimization_config = {
          pop_size: this.validateNumber(configData.optimization_config.pop_size, 10, 200, 50),
          n_gen: this.validateNumber(configData.optimization_config.n_gen, 5, 100, 20),
          return_animation: Boolean(configData.optimization_config.return_animation !== false),
        }
      }
    },

    // 验证配置文件格式
    validateConfigFile(configData) {
      try {
        // 检查是否有配置数据
        const config = configData.config || configData

        // 必需字段验证
        const requiredFields = ['num_agvs', 'grid_size', 'agv_positions', 'task_locations']
        const hasRequiredFields = requiredFields.every((field) => config.hasOwnProperty(field))

        if (!hasRequiredFields) {
          console.warn('配置文件缺少必需字段:', requiredFields)
          return false
        }

        // 数据类型验证
        if (typeof config.num_agvs !== 'number' || config.num_agvs <= 0) {
          console.warn('AGV数量格式不正确')
          return false
        }

        if (!Array.isArray(config.grid_size) || config.grid_size.length !== 2) {
          console.warn('地图大小格式不正确')
          return false
        }

        if (!Array.isArray(config.agv_positions)) {
          console.warn('AGV位置格式不正确')
          return false
        }

        if (typeof config.task_locations !== 'object' || config.task_locations === null) {
          console.warn('任务位置格式不正确')
          return false
        }

        return true
      } catch (error) {
        console.error('配置文件验证失败:', error)
        return false
      }
    },

    // 验证数值范围
    validateNumber(value, min, max, defaultValue) {
      const num = Number(value)
      if (isNaN(num) || num < min || num > max) {
        return defaultValue
      }
      return num
    },

    // 读取文件内容
    readFileAsText(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (e) => resolve(e.target.result)
        reader.onerror = (e) => reject(new Error('文件读取失败'))
        reader.readAsText(file, 'UTF-8')
      })
    },

    // 重置文件输入
    resetFileInput() {
      if (this.$refs.configFileInput) {
        this.$refs.configFileInput.value = ''
      }
    },

    // 格式化日期时间
    formatDateTime(date) {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      const seconds = String(date.getSeconds()).padStart(2, '0')

      return `${year}${month}${day}_${hours}${minutes}${seconds}`
    },

    // ...existing code...
  },

  // ...existing code...
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

/* 新增样式 */
.task-config-container::-webkit-scrollbar,
.obstacle-config-container::-webkit-scrollbar {
  width: 6px;
}

.task-config-container::-webkit-scrollbar-track,
.obstacle-config-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.task-config-container::-webkit-scrollbar-thumb,
.obstacle-config-container::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.task-config-container::-webkit-scrollbar-thumb:hover,
.obstacle-config-container::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.v-tabs {
  flex-shrink: 0;
}

.v-tab {
  font-size: 12px;
  min-width: 70px;
}

/* 新增干特图样式 */
.gantt-container {
  overflow-x: auto;
  overflow-y: hidden;
}

.gantt-container canvas {
  display: block;
  margin: 0 auto;
}

.v-btn-toggle .v-btn {
  min-width: 80px !important;
}

/* 干特图工具提示样式 */
.gantt-tooltip {
  position: fixed;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 12px;
  z-index: 1000;
  pointer-events: none;
  max-width: 200px;
  white-space: nowrap;
}

/* 新增配置管理样式 */
.config-preview {
  max-height: 300px;
  overflow-y: auto;
}

.config-preview .v-card {
  border-radius: 8px;
}

.config-preview .text-caption {
  color: #666;
  font-size: 0.75rem;
}

.config-preview .text-body-2 {
  color: #333;
  margin-top: 2px;
}

/* 文件输入隐藏样式 */
input[type='file'] {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

/* 按钮组样式优化 */
.v-card-actions .v-row {
  margin: 0;
}

.v-card-actions .v-col {
  padding: 0 6px;
}
</style>
