<template>
  <v-app>
    <div class="system-bg-pattern"></div>

    <v-app-bar elevation="2" class="app-header" color="primary" rounded>
      <template v-slot:prepend>
        <v-icon icon="mdi-car-connected" class="header-icon mr-3" />
      </template>
      <v-app-bar-title class="text-h5 font-weight-bold app-title">
        ROS小车运动监控系统
      </v-app-bar-title>
      <v-spacer></v-spacer>
      <div class="connection-status">
        <transition name="fade" mode="out-in">
          <v-chip
            :color="isConnected ? 'success' : 'error'"
            :key="isConnected ? 'connected' : 'disconnected'"
            class="status-chip"
            variant="elevated"
          >
            <v-icon start :icon="isConnected ? 'mdi-check-circle' : 'mdi-alert-circle'"></v-icon>
            {{ isConnected ? '已连接' : '未连接' }}
          </v-chip>
        </transition>
      </div>
    </v-app-bar>

    <v-main>
      <v-container fluid class="main-container">
        <v-row>
          <!-- 连接设置面板 -->
          <v-col cols="12" md="6">
            <v-card class="mb-4 card-hover" variant="elevated" rounded="lg">
              <v-card-title class="card-title">
                <v-icon
                  start
                  icon="mdi-access-point-network"
                  color="primary"
                  class="icon-pulse"
                ></v-icon>
                ROS连接设置
              </v-card-title>
              <v-card-text>
                <v-row>
                  <v-col cols="12">
                    <v-text-field
                      v-model="rosUrl"
                      label="ROS WebSocket URL"
                      placeholder="ws://localhost:9090"
                      variant="outlined"
                      density="comfortable"
                      hide-details="auto"
                      class="mb-3 input-field"
                      color="primary"
                      bg-color="surface"
                      @change="initRosConnection"
                    >
                      <template v-slot:prepend-inner>
                        <v-icon icon="mdi-web" color="primary"></v-icon>
                      </template>
                    </v-text-field>
                  </v-col>
                  <v-col cols="12">
                    <v-text-field
                      v-model="topicName"
                      label="ROS话题名称"
                      placeholder="/cmd_vel"
                      variant="outlined"
                      density="comfortable"
                      hide-details="auto"
                      class="mb-3 input-field"
                      color="primary"
                      bg-color="surface"
                      @change="subscribeToTopic"
                    >
                      <template v-slot:prepend-inner>
                        <v-icon icon="mdi-message-text" color="primary"></v-icon>
                      </template>
                    </v-text-field>
                  </v-col>
                  <v-col cols="12" class="d-flex justify-end">
                    <v-btn
                      color="primary"
                      @click="initRosConnection"
                      prepend-icon="mdi-refresh"
                      variant="elevated"
                      class="connect-btn"
                      elevation="1"
                      rounded
                    >
                      {{ isConnected ? '重新连接' : '连接' }}
                      <template v-slot:loader>
                        <v-progress-circular indeterminate color="white"></v-progress-circular>
                      </template>
                    </v-btn>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- 图表设置面板 -->
          <v-col cols="12" md="6">
            <v-card class="mb-4 card-hover" variant="elevated" rounded="lg">
              <v-card-title class="card-title">
                <v-icon start icon="mdi-chart-line" color="secondary" class="icon-pulse"></v-icon>
                图表设置
              </v-card-title>
              <v-card-text>
                <v-row class="pt-2">
                  <v-col cols="12" md="6">
                    <span class="slider-label">最大数据点数</span>
                    <v-slider
                      v-model="maxDataPoints"
                      min="10"
                      max="500"
                      step="10"
                      color="secondary"
                      show-ticks="always"
                      thumb-label="always"
                      thumb-size="24"
                      track-size="4"
                      class="data-slider"
                    >
                      <template v-slot:thumb-label="{ modelValue }">
                        <span class="thumb-text">{{ modelValue }}</span>
                      </template>
                    </v-slider>
                  </v-col>
                  <v-col cols="12" md="6">
                    <span class="slider-label">更新间隔 (ms)</span>
                    <v-slider
                      v-model="updateInterval"
                      min="100"
                      max="2000"
                      step="100"
                      color="secondary"
                      show-ticks="always"
                      thumb-label="always"
                      thumb-size="24"
                      track-size="4"
                      class="data-slider"
                    >
                      <template v-slot:thumb-label="{ modelValue }">
                        <span class="thumb-text">{{ modelValue }}</span>
                      </template>
                    </v-slider>
                  </v-col>
                  <v-col cols="12" class="d-flex justify-end">
                    <v-btn
                      color="secondary"
                      @click="clearTrajectory"
                      prepend-icon="mdi-broom"
                      variant="elevated"
                      class="clear-btn"
                      elevation="1"
                      rounded
                    >
                      清除轨迹
                    </v-btn>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- 速度显示面板 -->
        <v-row>
          <v-col cols="12" md="6">
            <v-card class="mb-4 metric-card" variant="elevated" rounded="lg">
              <v-card-title class="card-title">
                <v-icon start icon="mdi-speedometer" color="error" class="icon-pulse"></v-icon>
                线速度 (m/s)
              </v-card-title>
              <v-card-text>
                <v-row>
                  <v-col cols="4">
                    <v-card
                      variant="tonal"
                      class="text-center pa-3 metric-value-card"
                      elevation="0"
                      rounded="lg"
                    >
                      <div class="text-subtitle-1 metric-label">X轴</div>
                      <div class="metric-value">
                        <div class="value-transition">
                          <transition name="value-change" mode="out-in">
                            <div :key="currentSpeed.linear.x">
                              {{ currentSpeed.linear.x.toFixed(3) }}
                            </div>
                          </transition>
                        </div>
                      </div>
                      <div class="metric-indicator">
                        <v-progress-linear
                          :model-value="Math.abs(currentSpeed.linear.x) * 20"
                          :color="currentSpeed.linear.x >= 0 ? 'error' : 'info'"
                          height="8"
                          rounded
                          striped
                        ></v-progress-linear>
                      </div>
                    </v-card>
                  </v-col>
                  <v-col cols="4">
                    <v-card
                      variant="tonal"
                      class="text-center pa-3 metric-value-card"
                      elevation="0"
                      rounded="lg"
                    >
                      <div class="text-subtitle-1 metric-label">Y轴</div>
                      <div class="metric-value">
                        <div class="value-transition">
                          <transition name="value-change" mode="out-in">
                            <div :key="currentSpeed.linear.y">
                              {{ currentSpeed.linear.y.toFixed(3) }}
                            </div>
                          </transition>
                        </div>
                      </div>
                      <div class="metric-indicator">
                        <v-progress-linear
                          :model-value="Math.abs(currentSpeed.linear.y) * 20"
                          :color="currentSpeed.linear.y >= 0 ? 'error' : 'info'"
                          height="8"
                          rounded
                          striped
                        ></v-progress-linear>
                      </div>
                    </v-card>
                  </v-col>
                  <v-col cols="4">
                    <v-card
                      variant="tonal"
                      class="text-center pa-3 metric-value-card"
                      elevation="0"
                      rounded="lg"
                    >
                      <div class="text-subtitle-1 metric-label">Z轴</div>
                      <div class="metric-value">
                        <div class="value-transition">
                          <transition name="value-change" mode="out-in">
                            <div :key="currentSpeed.linear.z">
                              {{ currentSpeed.linear.z.toFixed(3) }}
                            </div>
                          </transition>
                        </div>
                      </div>
                      <div class="metric-indicator">
                        <v-progress-linear
                          :model-value="Math.abs(currentSpeed.linear.z) * 20"
                          :color="currentSpeed.linear.z >= 0 ? 'error' : 'info'"
                          height="8"
                          rounded
                          striped
                        ></v-progress-linear>
                      </div>
                    </v-card>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12" md="6">
            <v-card class="mb-4 metric-card" variant="elevated" rounded="lg">
              <v-card-title class="card-title">
                <v-icon start icon="mdi-rotate-3d" color="secondary" class="icon-pulse"></v-icon>
                角速度 (rad/s)
              </v-card-title>
              <v-card-text>
                <v-row>
                  <v-col cols="4">
                    <v-card
                      variant="tonal"
                      class="text-center pa-3 metric-value-card"
                      elevation="0"
                      rounded="lg"
                    >
                      <div class="text-subtitle-1 metric-label">X轴</div>
                      <div class="metric-value">
                        <div class="value-transition">
                          <transition name="value-change" mode="out-in">
                            <div :key="currentSpeed.angular.x">
                              {{ currentSpeed.angular.x.toFixed(3) }}
                            </div>
                          </transition>
                        </div>
                      </div>
                      <div class="metric-indicator">
                        <v-progress-linear
                          :model-value="Math.abs(currentSpeed.angular.x) * 10"
                          :color="currentSpeed.angular.x >= 0 ? 'secondary' : 'info'"
                          height="8"
                          rounded
                          striped
                        ></v-progress-linear>
                      </div>
                    </v-card>
                  </v-col>
                  <v-col cols="4">
                    <v-card
                      variant="tonal"
                      class="text-center pa-3 metric-value-card"
                      elevation="0"
                      rounded="lg"
                    >
                      <div class="text-subtitle-1 metric-label">Y轴</div>
                      <div class="metric-value">
                        <div class="value-transition">
                          <transition name="value-change" mode="out-in">
                            <div :key="currentSpeed.angular.y">
                              {{ currentSpeed.angular.y.toFixed(3) }}
                            </div>
                          </transition>
                        </div>
                      </div>
                      <div class="metric-indicator">
                        <v-progress-linear
                          :model-value="Math.abs(currentSpeed.angular.y) * 10"
                          :color="currentSpeed.angular.y >= 0 ? 'secondary' : 'info'"
                          height="8"
                          rounded
                          striped
                        ></v-progress-linear>
                      </div>
                    </v-card>
                  </v-col>
                  <v-col cols="4">
                    <v-card
                      variant="tonal"
                      class="text-center pa-3 metric-value-card"
                      elevation="0"
                      rounded="lg"
                    >
                      <div class="text-subtitle-1 metric-label">Z轴</div>
                      <div class="metric-value">
                        <div class="value-transition">
                          <transition name="value-change" mode="out-in">
                            <div :key="currentSpeed.angular.z">
                              {{ currentSpeed.angular.z.toFixed(3) }}
                            </div>
                          </transition>
                        </div>
                      </div>
                      <div class="metric-indicator">
                        <v-progress-linear
                          :model-value="Math.abs(currentSpeed.angular.z) * 10"
                          :color="currentSpeed.angular.z >= 0 ? 'secondary' : 'info'"
                          height="8"
                          rounded
                          striped
                        ></v-progress-linear>
                      </div>
                    </v-card>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- 加速度显示面板 -->
        <v-row>
          <v-col cols="12" md="6">
            <v-card class="mb-4 metric-card" variant="elevated" rounded="lg">
              <v-card-title class="card-title">
                <v-icon start icon="mdi-gauge" color="success" class="icon-pulse"></v-icon>
                线加速度 (m/s²)
              </v-card-title>
              <v-card-text>
                <v-row>
                  <v-col cols="4">
                    <v-card
                      variant="tonal"
                      class="text-center pa-3 metric-value-card"
                      elevation="0"
                      rounded="lg"
                    >
                      <div class="text-subtitle-1 metric-label">X轴</div>
                      <div class="metric-value">
                        <div class="value-transition">
                          <transition name="value-change" mode="out-in">
                            <div :key="currentAccel.linear.x">
                              {{ currentAccel.linear.x.toFixed(3) }}
                            </div>
                          </transition>
                        </div>
                      </div>
                      <div class="metric-indicator">
                        <v-progress-linear
                          :model-value="Math.abs(currentAccel.linear.x) * 5"
                          :color="currentAccel.linear.x >= 0 ? 'success' : 'info'"
                          height="8"
                          rounded
                          striped
                        ></v-progress-linear>
                      </div>
                    </v-card>
                  </v-col>
                  <v-col cols="4">
                    <v-card
                      variant="tonal"
                      class="text-center pa-3 metric-value-card"
                      elevation="0"
                      rounded="lg"
                    >
                      <div class="text-subtitle-1 metric-label">Y轴</div>
                      <div class="metric-value">
                        <div class="value-transition">
                          <transition name="value-change" mode="out-in">
                            <div :key="currentAccel.linear.y">
                              {{ currentAccel.linear.y.toFixed(3) }}
                            </div>
                          </transition>
                        </div>
                      </div>
                      <div class="metric-indicator">
                        <v-progress-linear
                          :model-value="Math.abs(currentAccel.linear.y) * 5"
                          :color="currentAccel.linear.y >= 0 ? 'success' : 'info'"
                          height="8"
                          rounded
                          striped
                        ></v-progress-linear>
                      </div>
                    </v-card>
                  </v-col>
                  <v-col cols="4">
                    <v-card
                      variant="tonal"
                      class="text-center pa-3 metric-value-card"
                      elevation="0"
                      rounded="lg"
                    >
                      <div class="text-subtitle-1 metric-label">Z轴</div>
                      <div class="metric-value">
                        <div class="value-transition">
                          <transition name="value-change" mode="out-in">
                            <div :key="currentAccel.linear.z">
                              {{ currentAccel.linear.z.toFixed(3) }}
                            </div>
                          </transition>
                        </div>
                      </div>
                      <div class="metric-indicator">
                        <v-progress-linear
                          :model-value="Math.abs(currentAccel.linear.z) * 5"
                          :color="currentAccel.linear.z >= 0 ? 'success' : 'info'"
                          height="8"
                          rounded
                          striped
                        ></v-progress-linear>
                      </div>
                    </v-card>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12" md="6">
            <v-card class="mb-4 metric-card" variant="elevated" rounded="lg">
              <v-card-title class="card-title">
                <v-icon start icon="mdi-rotate-orbit" color="info" class="icon-pulse"></v-icon>
                角加速度 (rad/s²)
              </v-card-title>
              <v-card-text>
                <v-row>
                  <v-col cols="4">
                    <v-card
                      variant="tonal"
                      class="text-center pa-3 metric-value-card"
                      elevation="0"
                      rounded="lg"
                    >
                      <div class="text-subtitle-1 metric-label">X轴</div>
                      <div class="metric-value">
                        <div class="value-transition">
                          <transition name="value-change" mode="out-in">
                            <div :key="currentAccel.angular.x">
                              {{ currentAccel.angular.x.toFixed(3) }}
                            </div>
                          </transition>
                        </div>
                      </div>
                      <div class="metric-indicator">
                        <v-progress-linear
                          :model-value="Math.abs(currentAccel.angular.x) * 5"
                          :color="currentAccel.angular.x >= 0 ? 'info' : 'warning'"
                          height="8"
                          rounded
                          striped
                        ></v-progress-linear>
                      </div>
                    </v-card>
                  </v-col>
                  <v-col cols="4">
                    <v-card
                      variant="tonal"
                      class="text-center pa-3 metric-value-card"
                      elevation="0"
                      rounded="lg"
                    >
                      <div class="text-subtitle-1 metric-label">Y轴</div>
                      <div class="metric-value">
                        <div class="value-transition">
                          <transition name="value-change" mode="out-in">
                            <div :key="currentAccel.angular.y">
                              {{ currentAccel.angular.y.toFixed(3) }}
                            </div>
                          </transition>
                        </div>
                      </div>
                      <div class="metric-indicator">
                        <v-progress-linear
                          :model-value="Math.abs(currentAccel.angular.y) * 5"
                          :color="currentAccel.angular.y >= 0 ? 'info' : 'warning'"
                          height="8"
                          rounded
                          striped
                        ></v-progress-linear>
                      </div>
                    </v-card>
                  </v-col>
                  <v-col cols="4">
                    <v-card
                      variant="tonal"
                      class="text-center pa-3 metric-value-card"
                      elevation="0"
                      rounded="lg"
                    >
                      <div class="text-subtitle-1 metric-label">Z轴</div>
                      <div class="metric-value">
                        <div class="value-transition">
                          <transition name="value-change" mode="out-in">
                            <div :key="currentAccel.angular.z">
                              {{ currentAccel.angular.z.toFixed(3) }}
                            </div>
                          </transition>
                        </div>
                      </div>
                      <div class="metric-indicator">
                        <v-progress-linear
                          :model-value="Math.abs(currentAccel.angular.z) * 5"
                          :color="currentAccel.angular.z >= 0 ? 'info' : 'warning'"
                          height="8"
                          rounded
                          striped
                        ></v-progress-linear>
                      </div>
                    </v-card>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- 图表显示区域 -->
        <v-row>
          <v-col cols="12" md="6">
            <v-card class="mb-4 chart-card" variant="elevated" rounded="lg">
              <v-card-title class="chart-title">
                <div class="d-flex align-center">
                  <v-icon start icon="mdi-chart-line" color="primary"></v-icon>
                  <span class="ml-2">线速度图表</span>
                </div>
                <v-tooltip location="top" text="线速度变化趋势">
                  <template v-slot:activator="{ props }">
                    <v-icon
                      v-bind="props"
                      icon="mdi-information"
                      size="small"
                      color="grey"
                    ></v-icon>
                  </template>
                </v-tooltip>
              </v-card-title>
              <v-card-text class="chart-container">
                <div id="linearSpeedChart" class="chart chart-animated"></div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" md="6">
            <v-card class="mb-4 chart-card" variant="elevated" rounded="lg">
              <v-card-title class="chart-title">
                <div class="d-flex align-center">
                  <v-icon start icon="mdi-chart-line" color="secondary"></v-icon>
                  <span class="ml-2">角速度图表</span>
                </div>
                <v-tooltip location="top" text="角速度变化趋势">
                  <template v-slot:activator="{ props }">
                    <v-icon
                      v-bind="props"
                      icon="mdi-information"
                      size="small"
                      color="grey"
                    ></v-icon>
                  </template>
                </v-tooltip>
              </v-card-title>
              <v-card-text class="chart-container">
                <div id="angularSpeedChart" class="chart chart-animated"></div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="12" md="6">
            <v-card class="mb-4 chart-card" variant="elevated" rounded="lg">
              <v-card-title class="chart-title">
                <div class="d-flex align-center">
                  <v-icon start icon="mdi-chart-line" color="success"></v-icon>
                  <span class="ml-2">线加速度图表</span>
                </div>
                <v-tooltip location="top" text="线加速度变化趋势">
                  <template v-slot:activator="{ props }">
                    <v-icon
                      v-bind="props"
                      icon="mdi-information"
                      size="small"
                      color="grey"
                    ></v-icon>
                  </template>
                </v-tooltip>
              </v-card-title>
              <v-card-text class="chart-container">
                <div id="linearAccelChart" class="chart chart-animated"></div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" md="6">
            <v-card class="mb-4 chart-card" variant="elevated" rounded="lg">
              <v-card-title class="chart-title">
                <div class="d-flex align-center">
                  <v-icon start icon="mdi-chart-line" color="info"></v-icon>
                  <span class="ml-2">角加速度图表</span>
                </div>
                <v-tooltip location="top" text="角加速度变化趋势">
                  <template v-slot:activator="{ props }">
                    <v-icon
                      v-bind="props"
                      icon="mdi-information"
                      size="small"
                      color="grey"
                    ></v-icon>
                  </template>
                </v-tooltip>
              </v-card-title>
              <v-card-text class="chart-container">
                <div id="angularAccelChart" class="chart chart-animated"></div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="12" md="6">
            <v-card class="mb-4 chart-card" variant="elevated" rounded="lg">
              <v-card-title class="chart-title">
                <div class="d-flex align-center">
                  <v-icon start icon="mdi-map-marker-path" color="error"></v-icon>
                  <span class="ml-2">运行轨迹</span>
                </div>
                <v-tooltip location="top" text="小车二维运动轨迹">
                  <template v-slot:activator="{ props }">
                    <v-icon
                      v-bind="props"
                      icon="mdi-information"
                      size="small"
                      color="grey"
                    ></v-icon>
                  </template>
                </v-tooltip>
              </v-card-title>
              <v-card-text class="chart-container">
                <div id="trajectoryChart" class="chart chart-animated"></div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" md="6">
            <v-card class="mb-4 chart-card" variant="elevated" rounded="lg">
              <v-card-title class="chart-title">
                <div class="d-flex align-center">
                  <v-icon start icon="mdi-rotate-3d-variant" color="warning"></v-icon>
                  <span class="ml-2">3D姿态可视化</span>
                </div>
                <v-tooltip location="top" text="小车三维姿态">
                  <template v-slot:activator="{ props }">
                    <v-icon
                      v-bind="props"
                      icon="mdi-information"
                      size="small"
                      color="grey"
                    ></v-icon>
                  </template>
                </v-tooltip>
              </v-card-title>
              <v-card-text class="chart-container">
                <div :id="id3d" class="chart chart-animated"></div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>

    <v-footer
      app
      class="footer d-flex justify-center align-center py-3"
      color="primary"
      elevation="4"
    >
      <span class="text-caption text-center">
        ROS小车运动监控系统 &copy; {{ new Date().getFullYear() }}
        <v-icon icon="mdi-robot" size="small" class="ml-1 mr-1"></v-icon>
        版本 1.0.0
      </span>
    </v-footer>
  </v-app>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, watch, useId } from 'vue'
import * as echarts from 'echarts'
import ROSLIB from 'roslib'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

const id3d = useId()

// ROS连接设置
const rosUrl = ref('ws://localhost:9090')
const topicName = ref('/cmd_vel')
const isConnected = ref(false)
let ros = null
let speedTopic = null

// 当前速度数据
const currentSpeed = reactive({
  linear: { x: 0, y: 0, z: 0 },
  angular: { x: 0, y: 0, z: 0 },
})

// 当前加速度数据（根据速度变化计算）
const currentAccel = reactive({
  linear: { x: 0, y: 0, z: 0 },
  angular: { x: 0, y: 0, z: 0 },
})

// 前一次速度数据（用于计算加速度）
const previousSpeed = reactive({
  linear: { x: 0, y: 0, z: 0 },
  angular: { x: 0, y: 0, z: 0 },
  timestamp: Date.now(),
})

// 位置数据（通过速度积分计算）
const position = reactive({
  x: 0,
  y: 0,
  theta: 0, // 朝向角，用于计算旋转
})

// 图表数据
const speedData = reactive({
  timestamp: [],
  linear: { x: [], y: [], z: [] },
  angular: { x: [], y: [], z: [] },
})

const accelData = reactive({
  timestamp: [],
  linear: { x: [], y: [], z: [] },
  angular: { x: [], y: [], z: [] },
})

const trajectoryData = reactive({
  x: [0],
  y: [0],
})

// 图表设置
const maxDataPoints = ref(100)
const updateInterval = ref(500)

// 图表实例
let linearSpeedChart = null
let angularSpeedChart = null
let linearAccelChart = null
let angularAccelChart = null
let trajectoryChart = null
let chartUpdateTimer = null

// Three.js相关
let scene = null
let camera = null
let renderer = null
let controls = null
let carModel = null
let axesHelper = null

// 初始化ROS连接
const initRosConnection = () => {
  // 如果已经有连接，先关闭它
  if (ros) {
    ros.close()
    isConnected.value = false
  }

  // 创建新的ROS连接
  ros = new ROSLIB.Ros({
    url: rosUrl.value,
  })

  ros.on('connection', () => {
    console.log('已连接到ROS WebSocket服务器')
    isConnected.value = true
    subscribeToTopic()
  })

  ros.on('error', (error) => {
    console.error('ROS连接错误:', error)
    isConnected.value = false
  })

  ros.on('close', () => {
    console.log('ROS连接关闭')
    isConnected.value = false
  })
}

// 订阅ROS话题
const subscribeToTopic = () => {
  if (!ros || !isConnected.value) {
    console.error('ROS未连接，无法订阅话题')
    return
  }

  // 如果已经有订阅，先取消它
  if (speedTopic) {
    speedTopic.unsubscribe()
  }

  // 创建新的订阅
  speedTopic = new ROSLIB.Topic({
    ros: ros,
    name: topicName.value,
    messageType: 'geometry_msgs/Twist',
  })

  speedTopic.subscribe((message) => {
    const now = Date.now()
    const deltaTime = (now - previousSpeed.timestamp) / 1000 // 转换为秒

    // 保存前一次速度数据用于计算加速度
    previousSpeed.linear.x = currentSpeed.linear.x
    previousSpeed.linear.y = currentSpeed.linear.y
    previousSpeed.linear.z = currentSpeed.linear.z
    previousSpeed.angular.x = currentSpeed.angular.x
    previousSpeed.angular.y = currentSpeed.angular.y
    previousSpeed.angular.z = currentSpeed.angular.z
    previousSpeed.timestamp = now

    // 更新当前速度数据
    currentSpeed.linear.x = message.linear.x
    currentSpeed.linear.y = message.linear.y
    currentSpeed.linear.z = message.linear.z
    currentSpeed.angular.x = message.angular.x
    currentSpeed.angular.y = message.angular.y
    currentSpeed.angular.z = message.angular.z

    // 计算加速度 (a = Δv / Δt)
    if (deltaTime > 0) {
      currentAccel.linear.x = (currentSpeed.linear.x - previousSpeed.linear.x) / deltaTime
      currentAccel.linear.y = (currentSpeed.linear.y - previousSpeed.linear.y) / deltaTime
      currentAccel.linear.z = (currentSpeed.linear.z - previousSpeed.linear.z) / deltaTime
      currentAccel.angular.x = (currentSpeed.angular.x - previousSpeed.angular.x) / deltaTime
      currentAccel.angular.y = (currentSpeed.angular.y - previousSpeed.angular.y) / deltaTime
      currentAccel.angular.z = (currentSpeed.angular.z - previousSpeed.angular.z) / deltaTime
    }

    // 更新位置（简单积分）
    // 使用角速度z更新theta角度
    position.theta += currentSpeed.angular.z * deltaTime

    // 使用线速度和当前角度更新位置
    // 这里假设小车在xy平面上移动，且x方向是前进方向
    position.x +=
      (currentSpeed.linear.x * Math.cos(position.theta) -
        currentSpeed.linear.y * Math.sin(position.theta)) *
      deltaTime
    position.y +=
      (currentSpeed.linear.x * Math.sin(position.theta) +
        currentSpeed.linear.y * Math.cos(position.theta)) *
      deltaTime

    // 添加到轨迹数据
    trajectoryData.x.push(position.x)
    trajectoryData.y.push(position.y)

    // 添加到历史数据中
    const timestamp = new Date().toLocaleTimeString('zh-CN', { hour12: false })

    speedData.timestamp.push(timestamp)
    speedData.linear.x.push(currentSpeed.linear.x)
    speedData.linear.y.push(currentSpeed.linear.y)
    speedData.linear.z.push(currentSpeed.linear.z)
    speedData.angular.x.push(currentSpeed.angular.x)
    speedData.angular.y.push(currentSpeed.angular.y)
    speedData.angular.z.push(currentSpeed.angular.z)

    accelData.timestamp.push(timestamp)
    accelData.linear.x.push(currentAccel.linear.x)
    accelData.linear.y.push(currentAccel.linear.y)
    accelData.linear.z.push(currentAccel.linear.z)
    accelData.angular.x.push(currentAccel.angular.x)
    accelData.angular.y.push(currentAccel.angular.y)
    accelData.angular.z.push(currentAccel.angular.z)

    // 限制数据点数量
    if (speedData.timestamp.length > maxDataPoints.value) {
      speedData.timestamp.shift()
      speedData.linear.x.shift()
      speedData.linear.y.shift()
      speedData.linear.z.shift()
      speedData.angular.x.shift()
      speedData.angular.y.shift()
      speedData.angular.z.shift()

      accelData.timestamp.shift()
      accelData.linear.x.shift()
      accelData.linear.y.shift()
      accelData.linear.z.shift()
      accelData.angular.x.shift()
      accelData.angular.y.shift()
      accelData.angular.z.shift()
    }

    // 限制轨迹点
    if (trajectoryData.x.length > 1000) {
      trajectoryData.x.shift()
      trajectoryData.y.shift()
    }

    // 如果有3D场景，更新它
    updateThreeJsScene()
  })

  console.log(`已订阅ROS话题: ${topicName.value}`)
}

// 清除轨迹数据
const clearTrajectory = () => {
  trajectoryData.x = [position.x]
  trajectoryData.y = [position.y]
  updateCharts()
}

// 初始化ECharts图表
const initCharts = () => {
  // 设置全局ECharts主题
  const chartTheme = {
    color: ['#FF4500', '#32CD32', '#1E90FF', '#9370DB', '#FFD700'],
    backgroundColor: 'rgba(255, 255, 255, 0.0)',
    textStyle: {},
    title: {
      textStyle: {
        fontSize: 16,
        fontWeight: 'normal',
      },
      left: 'center',
    },
    legend: {
      textStyle: {
        fontSize: 12,
      },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
      top: '15%',
      containLabel: true,
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(50, 50, 50, 0.9)',
      borderColor: 'rgba(50, 50, 50, 0.9)',
      textStyle: {
        color: '#fff',
      },
      axisPointer: {
        type: 'line',
        lineStyle: {
          color: 'rgba(100, 100, 100, 0.5)',
          width: 1,
        },
      },
    },
  }

  // 线速度图表
  linearSpeedChart = echarts.init(document.getElementById('linearSpeedChart'))
  linearSpeedChart.setOption({
    ...chartTheme,
    title: {
      ...chartTheme.title,
      text: '线速度 (m/s)',
    },
    legend: {
      ...chartTheme.legend,
      data: ['X轴', 'Y轴', 'Z轴'],
      bottom: 0,
    },
    xAxis: {
      type: 'category',
      data: speedData.timestamp,
      boundaryGap: false,
      axisLine: {
        lineStyle: {
          color: '#999',
        },
      },
      axisLabel: {
        color: '#666',
        fontSize: 10,
        rotate: 45,
      },
    },
    yAxis: {
      type: 'value',
      name: '速度 (m/s)',
      nameTextStyle: {
        color: '#666',
      },
      splitLine: {
        lineStyle: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
      axisLine: {
        lineStyle: {
          color: '#999',
        },
      },
      axisLabel: {
        color: '#666',
      },
    },
    series: [
      {
        name: 'X轴',
        type: 'line',
        data: speedData.linear.x,
        smooth: true,
        showSymbol: false,
        lineStyle: { width: 3 },
        itemStyle: { color: '#FF4500' },
        emphasis: {
          lineStyle: { width: 5 },
        },
        animation: true,
        animationDuration: 1000,
        animationEasing: 'cubicOut',
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(255, 69, 0, 0.5)' },
            { offset: 1, color: 'rgba(255, 69, 0, 0.0)' },
          ]),
        },
      },
      {
        name: 'Y轴',
        type: 'line',
        data: speedData.linear.y,
        smooth: true,
        showSymbol: false,
        lineStyle: { width: 3 },
        itemStyle: { color: '#32CD32' },
        emphasis: {
          lineStyle: { width: 5 },
        },
        animation: true,
        animationDuration: 1000,
        animationEasing: 'cubicOut',
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(50, 205, 50, 0.5)' },
            { offset: 1, color: 'rgba(50, 205, 50, 0.0)' },
          ]),
        },
      },
      {
        name: 'Z轴',
        type: 'line',
        data: speedData.linear.z,
        smooth: true,
        showSymbol: false,
        lineStyle: { width: 3 },
        itemStyle: { color: '#1E90FF' },
        emphasis: {
          lineStyle: { width: 5 },
        },
        animation: true,
        animationDuration: 1000,
        animationEasing: 'cubicOut',
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(30, 144, 255, 0.5)' },
            { offset: 1, color: 'rgba(30, 144, 255, 0.0)' },
          ]),
        },
      },
    ],
  })

  // 角速度图表
  angularSpeedChart = echarts.init(document.getElementById('angularSpeedChart'))
  angularSpeedChart.setOption({
    ...chartTheme,
    title: {
      ...chartTheme.title,
      text: '角速度 (rad/s)',
    },
    legend: {
      ...chartTheme.legend,
      data: ['X轴', 'Y轴', 'Z轴'],
      bottom: 0,
    },
    xAxis: {
      type: 'category',
      data: speedData.timestamp,
      boundaryGap: false,
      axisLine: {
        lineStyle: {
          color: '#999',
        },
      },
      axisLabel: {
        color: '#666',
        fontSize: 10,
        rotate: 45,
      },
    },
    yAxis: {
      type: 'value',
      name: '速度 (rad/s)',
      nameTextStyle: {
        color: '#666',
      },
      splitLine: {
        lineStyle: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
      axisLine: {
        lineStyle: {
          color: '#999',
        },
      },
      axisLabel: {
        color: '#666',
      },
    },
    series: [
      {
        name: 'X轴',
        type: 'line',
        data: speedData.angular.x,
        smooth: true,
        showSymbol: false,
        lineStyle: { width: 3 },
        itemStyle: { color: '#FF4500' },
        emphasis: {
          lineStyle: { width: 5 },
        },
        animation: true,
        animationDuration: 1000,
        animationEasing: 'cubicOut',
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(255, 69, 0, 0.5)' },
            { offset: 1, color: 'rgba(255, 69, 0, 0.0)' },
          ]),
        },
      },
      {
        name: 'Y轴',
        type: 'line',
        data: speedData.angular.y,
        smooth: true,
        showSymbol: false,
        lineStyle: { width: 3 },
        itemStyle: { color: '#32CD32' },
        emphasis: {
          lineStyle: { width: 5 },
        },
        animation: true,
        animationDuration: 1000,
        animationEasing: 'cubicOut',
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(50, 205, 50, 0.5)' },
            { offset: 1, color: 'rgba(50, 205, 50, 0.0)' },
          ]),
        },
      },
      {
        name: 'Z轴',
        type: 'line',
        data: speedData.angular.z,
        smooth: true,
        showSymbol: false,
        lineStyle: { width: 3 },
        itemStyle: { color: '#1E90FF' },
        emphasis: {
          lineStyle: { width: 5 },
        },
        animation: true,
        animationDuration: 1000,
        animationEasing: 'cubicOut',
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(30, 144, 255, 0.5)' },
            { offset: 1, color: 'rgba(30, 144, 255, 0.0)' },
          ]),
        },
      },
    ],
  })

  // 线加速度图表
  linearAccelChart = echarts.init(document.getElementById('linearAccelChart'))
  linearAccelChart.setOption({
    ...chartTheme,
    title: {
      ...chartTheme.title,
      text: '线加速度 (m/s²)',
    },
    legend: {
      ...chartTheme.legend,
      data: ['X轴', 'Y轴', 'Z轴'],
      bottom: 0,
    },
    xAxis: {
      type: 'category',
      data: accelData.timestamp,
      boundaryGap: false,
      axisLine: {
        lineStyle: {
          color: '#999',
        },
      },
      axisLabel: {
        color: '#666',
        fontSize: 10,
        rotate: 45,
      },
    },
    yAxis: {
      type: 'value',
      name: '加速度 (m/s²)',
      nameTextStyle: {
        color: '#666',
      },
      splitLine: {
        lineStyle: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
      axisLine: {
        lineStyle: {
          color: '#999',
        },
      },
      axisLabel: {
        color: '#666',
      },
    },
    series: [
      {
        name: 'X轴',
        type: 'line',
        data: accelData.linear.x,
        smooth: true,
        showSymbol: false,
        lineStyle: { width: 3 },
        itemStyle: { color: '#FF4500' },
        emphasis: {
          lineStyle: { width: 5 },
        },
        animation: true,
        animationDuration: 1000,
        animationEasing: 'cubicOut',
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(255, 69, 0, 0.5)' },
            { offset: 1, color: 'rgba(255, 69, 0, 0.0)' },
          ]),
        },
      },
      {
        name: 'Y轴',
        type: 'line',
        data: accelData.linear.y,
        smooth: true,
        showSymbol: false,
        lineStyle: { width: 3 },
        itemStyle: { color: '#32CD32' },
        emphasis: {
          lineStyle: { width: 5 },
        },
        animation: true,
        animationDuration: 1000,
        animationEasing: 'cubicOut',
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(50, 205, 50, 0.5)' },
            { offset: 1, color: 'rgba(50, 205, 50, 0.0)' },
          ]),
        },
      },
      {
        name: 'Z轴',
        type: 'line',
        data: accelData.linear.z,
        smooth: true,
        showSymbol: false,
        lineStyle: { width: 3 },
        itemStyle: { color: '#1E90FF' },
        emphasis: {
          lineStyle: { width: 5 },
        },
        animation: true,
        animationDuration: 1000,
        animationEasing: 'cubicOut',
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(30, 144, 255, 0.5)' },
            { offset: 1, color: 'rgba(30, 144, 255, 0.0)' },
          ]),
        },
      },
    ],
  })

  // 角加速度图表
  angularAccelChart = echarts.init(document.getElementById('angularAccelChart'))
  angularAccelChart.setOption({
    ...chartTheme,
    title: {
      ...chartTheme.title,
      text: '角加速度 (rad/s²)',
    },
    legend: {
      ...chartTheme.legend,
      data: ['X轴', 'Y轴', 'Z轴'],
      bottom: 0,
    },
    xAxis: {
      type: 'category',
      data: accelData.timestamp,
      boundaryGap: false,
      axisLine: {
        lineStyle: {
          color: '#999',
        },
      },
      axisLabel: {
        color: '#666',
        fontSize: 10,
        rotate: 45,
      },
    },
    yAxis: {
      type: 'value',
      name: '加速度 (rad/s²)',
      nameTextStyle: {
        color: '#666',
      },
      splitLine: {
        lineStyle: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
      axisLine: {
        lineStyle: {
          color: '#999',
        },
      },
      axisLabel: {
        color: '#666',
      },
    },
    series: [
      {
        name: 'X轴',
        type: 'line',
        data: accelData.angular.x,
        smooth: true,
        showSymbol: false,
        lineStyle: { width: 3 },
        itemStyle: { color: '#FF4500' },
        emphasis: {
          lineStyle: { width: 5 },
        },
        animation: true,
        animationDuration: 1000,
        animationEasing: 'cubicOut',
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(255, 69, 0, 0.5)' },
            { offset: 1, color: 'rgba(255, 69, 0, 0.0)' },
          ]),
        },
      },
      {
        name: 'Y轴',
        type: 'line',
        data: accelData.angular.y,
        smooth: true,
        showSymbol: false,
        lineStyle: { width: 3 },
        itemStyle: { color: '#32CD32' },
        emphasis: {
          lineStyle: { width: 5 },
        },
        animation: true,
        animationDuration: 1000,
        animationEasing: 'cubicOut',
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(50, 205, 50, 0.5)' },
            { offset: 1, color: 'rgba(50, 205, 50, 0.0)' },
          ]),
        },
      },
      {
        name: 'Z轴',
        type: 'line',
        data: accelData.angular.z,
        smooth: true,
        showSymbol: false,
        lineStyle: { width: 3 },
        itemStyle: { color: '#1E90FF' },
        emphasis: {
          lineStyle: { width: 5 },
        },
        animation: true,
        animationDuration: 1000,
        animationEasing: 'cubicOut',
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(30, 144, 255, 0.5)' },
            { offset: 1, color: 'rgba(30, 144, 255, 0.0)' },
          ]),
        },
      },
    ],
  })

  // 轨迹图表
  trajectoryChart = echarts.init(document.getElementById('trajectoryChart'))
  trajectoryChart.setOption({
    ...chartTheme,
    title: {
      ...chartTheme.title,
      text: '小车运行轨迹',
    },
    tooltip: {
      ...chartTheme.tooltip,
      formatter: function (params) {
        return `位置: (${params.data[0].toFixed(2)}, ${params.data[1].toFixed(2)})`
      },
    },
    grid: {
      left: '5%',
      right: '5%',
      bottom: '5%',
      top: '15%',
      containLabel: true,
    },
    xAxis: {
      type: 'value',
      name: 'X (m)',
      nameTextStyle: {
        color: '#666',
      },
      scale: true,
      splitLine: {
        lineStyle: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
      axisLine: {
        lineStyle: {
          color: '#999',
        },
      },
      axisLabel: {
        color: '#666',
      },
    },
    yAxis: {
      type: 'value',
      name: 'Y (m)',
      nameTextStyle: {
        color: '#666',
      },
      scale: true,
      splitLine: {
        lineStyle: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
      axisLine: {
        lineStyle: {
          color: '#999',
        },
      },
      axisLabel: {
        color: '#666',
      },
    },
    series: [
      {
        type: 'scatter',
        symbolSize: 12,
        symbol: 'circle',
        itemStyle: {
          color: '#9c27b0',
          shadowBlur: 10,
          shadowColor: 'rgba(156, 39, 176, 0.5)',
        },
        data: [[0, 0]], // 初始位置
        animation: true,
        animationDuration: 500,
        animationEasing: 'elasticOut',
      },
      {
        type: 'line',
        symbol: 'none',
        lineStyle: {
          width: 4,
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 1,
            y2: 0,
            colorStops: [
              { offset: 0, color: '#8e24aa' },
              { offset: 0.5, color: '#03dac6' },
              { offset: 1, color: '#6200ee' },
            ],
          },
          shadowBlur: 6,
          shadowColor: 'rgba(0, 0, 0, 0.2)',
          shadowOffsetY: 2,
          cap: 'round',
        },
        data: trajectoryData.x.map((x, index) => [x, trajectoryData.y[index]]),
        animation: true,
        animationDuration: 1000,
        animationEasing: 'cubicOut',
      },
    ],
  })

  // 响应窗口大小变化
  window.addEventListener('resize', () => {
    linearSpeedChart && linearSpeedChart.resize()
    angularSpeedChart && angularSpeedChart.resize()
    linearAccelChart && linearAccelChart.resize()
    angularAccelChart && angularAccelChart.resize()
    trajectoryChart && trajectoryChart.resize()
    renderer &&
      renderer.setSize(
        document.getElementById(id3d).clientWidth,
        document.getElementById(id3d).clientHeight,
      )
  })
}

// 初始化Three.js场景
const initThreeJS = () => {
  const container = document.getElementById(id3d)

  // 创建场景
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0xf8f9fa)

  // 创建相机
  camera = new THREE.PerspectiveCamera(
    60,
    container.clientWidth / container.clientHeight,
    0.1,
    1000,
  )
  camera.position.set(5, 5, 5)
  camera.lookAt(0, 0, 0)

  // 创建渲染器
  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(container.clientWidth, container.clientHeight)
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  renderer.setPixelRatio(window.devicePixelRatio)
  container.appendChild(renderer.domElement)

  // 添加轨道控制
  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.25
  controls.autoRotate = false
  controls.autoRotateSpeed = 1.0
  controls.minDistance = 3
  controls.maxDistance = 20
  controls.enablePan = true

  // 添加网格地面
  const gridHelper = new THREE.GridHelper(20, 20, 0x666666, 0xcccccc)
  scene.add(gridHelper)

  // 添加地面平面
  const planeGeometry = new THREE.PlaneGeometry(20, 20)
  const planeMaterial = new THREE.MeshStandardMaterial({
    color: 0xf0f0f0,
    roughness: 0.8,
    metalness: 0.2,
    side: THREE.DoubleSide,
  })
  const plane = new THREE.Mesh(planeGeometry, planeMaterial)
  plane.rotation.x = -Math.PI / 2
  plane.position.y = -0.01
  plane.receiveShadow = true
  scene.add(plane)

  // 添加坐标轴
  axesHelper = new THREE.AxesHelper(2)
  scene.add(axesHelper)

  // 添加小车模型
  createCarModel()

  // 添加灯光
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
  scene.add(ambientLight)

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
  directionalLight.position.set(5, 10, 5)
  directionalLight.castShadow = true
  directionalLight.shadow.mapSize.width = 1024
  directionalLight.shadow.mapSize.height = 1024
  directionalLight.shadow.camera.near = 0.5
  directionalLight.shadow.camera.far = 50
  scene.add(directionalLight)

  // 添加辅助光源
  const fillLight = new THREE.DirectionalLight(0xaaaaff, 0.3)
  fillLight.position.set(-5, 3, -5)
  scene.add(fillLight)

  // 渲染循环
  const animate = () => {
    requestAnimationFrame(animate)
    controls.update()
    renderer.render(scene, camera)
  }

  animate()
}

// 创建小车模型
const createCarModel = () => {
  if (!scene) return

  // 创建小车底盘
  const bodyGeometry = new THREE.BoxGeometry(1.2, 0.3, 0.8)
  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: 0x6200ee,
    roughness: 0.3,
    metalness: 0.6,
  })
  carModel = new THREE.Mesh(bodyGeometry, bodyMaterial)
  carModel.position.y = 0.15
  carModel.castShadow = true
  carModel.receiveShadow = true

  // 添加车轮
  const wheelGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.1, 12)
  const wheelMaterial = new THREE.MeshStandardMaterial({
    color: 0x333333,
    roughness: 0.8,
    metalness: 0.5,
  })

  // 位置偏移量
  const wheelPositions = [
    { x: 0.4, y: 0, z: 0.45 }, // 前右
    { x: 0.4, y: 0, z: -0.45 }, // 前左
    { x: -0.4, y: 0, z: 0.45 }, // 后右
    { x: -0.4, y: 0, z: -0.45 }, // 后左
  ]

  // 创建并定位车轮
  wheelPositions.forEach((pos) => {
    const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial)
    wheel.position.set(pos.x, pos.y, pos.z)
    wheel.rotation.z = Math.PI / 2 // 使圆柱水平放置
    wheel.castShadow = true
    carModel.add(wheel)
  })

  // 添加传感器（摄像头）
  const cameraGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.1)
  const cameraMaterial = new THREE.MeshStandardMaterial({
    color: 0x03dac6,
    roughness: 0.2,
    metalness: 0.8,
  })
  const cameraMesh = new THREE.Mesh(cameraGeometry, cameraMaterial)
  cameraMesh.position.set(0.55, 0.2, 0)
  carModel.add(cameraMesh)

  // 添加LED指示灯
  const ledGeometry = new THREE.SphereGeometry(0.05, 16, 16)
  const ledMaterial = new THREE.MeshStandardMaterial({
    color: 0xff0000,
    emissive: 0xff0000,
    emissiveIntensity: 0.5,
  })
  const led = new THREE.Mesh(ledGeometry, ledMaterial)
  led.position.set(-0.55, 0.2, 0)
  carModel.add(led)

  // 添加天线
  const antennaGeometry = new THREE.CylinderGeometry(0.01, 0.01, 0.3, 8)
  const antennaMaterial = new THREE.MeshStandardMaterial({
    color: 0x999999,
    roughness: 0.5,
    metalness: 0.9,
  })
  const antenna = new THREE.Mesh(antennaGeometry, antennaMaterial)
  antenna.position.set(-0.4, 0.3, 0)
  carModel.add(antenna)

  // 添加小车到场景
  scene.add(carModel)
}

// 更新Three.js场景中的小车姿态
const updateThreeJsScene = () => {
  if (!scene || !carModel) return

  // 缓动动画更新小车位置和旋转
  const targetX = position.x
  const targetY = 0
  const targetZ = position.y // 注意：我们使用y作为Three.js中的z坐标
  const targetRotation = position.theta

  // 应用缓动动画
  carModel.position.x += (targetX - carModel.position.x) * 0.1
  carModel.position.y += (targetY - carModel.position.y) * 0.1
  carModel.position.z += (targetZ - carModel.position.z) * 0.1

  // 处理旋转角度差，确保最短路径旋转
  let rotationDiff = targetRotation - carModel.rotation.y
  if (Math.abs(rotationDiff) > Math.PI) {
    if (rotationDiff > 0) {
      rotationDiff -= Math.PI * 2
    } else {
      rotationDiff += Math.PI * 2
    }
  }

  carModel.rotation.y += rotationDiff * 0.1

  // 模拟速度导致的车身倾斜效果
  const pitchTilt = -currentSpeed.linear.x * 0.1 // 前进/后退导致的俯仰
  const rollTilt = currentSpeed.angular.z * 0.05 // 转向导致的侧倾

  carModel.rotation.x += (pitchTilt - carModel.rotation.x) * 0.1
  carModel.rotation.z += (rollTilt - carModel.rotation.z) * 0.1
}

// 更新图表
const updateCharts = () => {
  // 更新线速度图表
  if (linearSpeedChart) {
    linearSpeedChart.setOption({
      xAxis: { data: speedData.timestamp },
      series: [
        { data: speedData.linear.x },
        { data: speedData.linear.y },
        { data: speedData.linear.z },
      ],
    })
  }

  // 更新角速度图表
  if (angularSpeedChart) {
    angularSpeedChart.setOption({
      xAxis: { data: speedData.timestamp },
      series: [
        { data: speedData.angular.x },
        { data: speedData.angular.y },
        { data: speedData.angular.z },
      ],
    })
  }

  // 更新线加速度图表
  if (linearAccelChart) {
    linearAccelChart.setOption({
      xAxis: { data: accelData.timestamp },
      series: [
        { data: accelData.linear.x },
        { data: accelData.linear.y },
        { data: accelData.linear.z },
      ],
    })
  }

  // 更新角加速度图表
  if (angularAccelChart) {
    angularAccelChart.setOption({
      xAxis: { data: accelData.timestamp },
      series: [
        { data: accelData.angular.x },
        { data: accelData.angular.y },
        { data: accelData.angular.z },
      ],
    })
  }

  // 更新轨迹图表
  if (trajectoryChart) {
    const currentPos = [position.x, position.y]
    trajectoryChart.setOption({
      series: [
        {
          data: [currentPos],
        },
        {
          data: trajectoryData.x.map((x, index) => [x, trajectoryData.y[index]]),
        },
      ],
    })
  }
}

// 监听图表设置变化
watch([maxDataPoints, updateInterval], () => {
  // 重置更新计时器
  if (chartUpdateTimer) {
    clearInterval(chartUpdateTimer)
    chartUpdateTimer = setInterval(updateCharts, updateInterval.value)
  }
})

// 组件挂载时
onMounted(() => {
  // 初始化图表
  initCharts()

  // 初始化Three.js
  initThreeJS()

  // 初始化ROS连接
  initRosConnection()

  // 定时更新图表
  chartUpdateTimer = setInterval(updateCharts, updateInterval.value)

  // 添加图表入场动画
  setTimeout(() => {
    const charts = document.querySelectorAll('.chart-animated')
    charts.forEach((chart, index) => {
      setTimeout(() => {
        chart.classList.add('chart-visible')
      }, 100 * index)
    })
  }, 300)
})

// 组件卸载时
onUnmounted(() => {
  // 清除定时器
  if (chartUpdateTimer) {
    clearInterval(chartUpdateTimer)
  }

  // 取消ROS订阅
  if (speedTopic) {
    speedTopic.unsubscribe()
  }

  // 关闭ROS连接
  if (ros) {
    ros.close()
  }

  // 销毁图表
  linearSpeedChart && linearSpeedChart.dispose()
  angularSpeedChart && angularSpeedChart.dispose()
  linearAccelChart && linearAccelChart.dispose()
  angularAccelChart && angularAccelChart.dispose()
  trajectoryChart && trajectoryChart.dispose()

  // 清理Three.js场景
  if (renderer) {
    const container = document.getElementById(id3d)
    if (container && container.contains(renderer.domElement)) {
      container.removeChild(renderer.domElement)
    }
    renderer.dispose()
  }

  // 移除窗口大小调整事件监听器
  window.removeEventListener('resize', () => {})
})
</script>

<style>
:root {
  --primary-color: #6200ee;
  --primary-variant: #3700b3;
  --secondary-color: #03dac6;
  --secondary-variant: #018786;
  --background: #f8f9fa;
  --surface: #ffffff;
  --error: #b00020;
  --on-primary: #ffffff;
  --on-secondary: #000000;
  --on-background: #000000;
  --on-surface: #000000;
  --on-error: #ffffff;
}

.system-bg-pattern {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image:
    radial-gradient(circle at 20% 20%, rgba(98, 0, 238, 0.03) 0%, transparent 40%),
    radial-gradient(circle at 80% 80%, rgba(3, 218, 198, 0.03) 0%, transparent 40%);
  pointer-events: none;
  z-index: -1;
}

.main-container {
  max-width: 1600px;
  margin: 0 auto;
  padding: 16px;
}

/* 标题区域样式 */
.app-header {
  border-radius: 0 0 16px 16px !important;
  padding: 0 16px;
  margin-bottom: 8px;
}

.header-icon {
  font-size: 28px;
  animation: pulse 2s infinite;
}

.app-title {
  background: linear-gradient(90deg, var(--on-primary), rgba(255, 255, 255, 0.8));
  background-clip: text;
  -webkit-background-clip: text;
  letter-spacing: 0.5px;
}

.status-chip {
  transition: all 0.3s ease;
}

/* 卡片样式 */
.card-hover {
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
  will-change: transform, box-shadow;
  border-radius: 16px;
}

.card-hover:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1) !important;
}

.card-title {
  padding: 16px;
  font-weight: 500;
  letter-spacing: 0.5px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

/* 输入框样式 */
.input-field {
  border-radius: 8px;
  transition: all 0.3s ease;
}

.input-field:hover {
  transform: translateY(-2px);
}

/* 滑块样式 */
.slider-label {
  display: block;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.6);
  margin-bottom: 8px;
}

.data-slider {
  padding: 8px 0;
}

.thumb-text {
  font-size: 12px;
  font-weight: bold;
}

/* 按钮样式 */
.connect-btn,
.clear-btn {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  letter-spacing: 0.5px;
  min-width: 120px;
}

.connect-btn:hover,
.clear-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2) !important;
}

.connect-btn:active,
.clear-btn:active {
  transform: translateY(1px);
}

/* 数据展示卡片样式 */
.metric-card {
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.metric-value-card {
  transition: all 0.3s ease;
  border-radius: 12px !important;
  overflow: hidden;
}

.metric-value-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1) !important;
}

.metric-label {
  color: rgba(0, 0, 0, 0.6);
  font-weight: 500;
  margin-bottom: 4px;
}

.metric-value {
  font-size: 24px;
  font-weight: 700;
  margin: 8px 0;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.metric-indicator {
  margin-top: 6px;
}

/* 图表卡片样式 */
.chart-card {
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.chart-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.chart-container {
  padding: 16px;
}

.chart {
  width: 100%;
  height: 320px;
  opacity: 0;
  transform: translateY(20px);
  transition:
    opacity 0.5s ease,
    transform 0.5s ease;
}

.chart-visible {
  opacity: 1;
  transform: translateY(0);
}

/* 页脚样式 */
.footer {
  border-radius: 16px 16px 0 0;
  margin-top: 16px;
}

/* 动画效果 */
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

.icon-pulse {
  animation: pulse 3s infinite;
}

.value-transition {
  position: relative;
  width: 100%;
  height: 100%;
}

.value-change-enter-active,
.value-change-leave-active {
  transition: all 0.3s;
}

.value-change-enter-from {
  opacity: 0;
  transform: translateY(-10px) scale(0.9);
}

.value-change-leave-to {
  opacity: 0;
  transform: translateY(10px) scale(0.9);
  position: absolute;
  width: 100%;
}

.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.5s ease,
    transform 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateX(10px);
}

/* 响应式调整 */
@media (max-width: 960px) {
  .chart {
    height: 260px;
  }

  .metric-value {
    font-size: 20px;
    height: 30px;
  }
}

@media (max-width: 600px) {
  .app-title {
    font-size: 18px !important;
  }

  .chart {
    height: 220px;
  }

  .card-title {
    padding: 12px;
  }

  .metric-value {
    font-size: 18px;
    height: 26px;
  }
}
</style>
