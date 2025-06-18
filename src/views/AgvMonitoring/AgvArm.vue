<template>
  <v-container fluid class="pa-6">
    <v-row>
      <v-col cols="12">
        <v-card class="elevation-4 rounded-lg">
          <v-card-title class="text-h4 font-weight-bold primary--text bg-info tw:glass">
            <v-icon large class="mr-3">mdi-robot-industrial</v-icon>
            AGV 机械臂控制
          </v-card-title>

          <!-- 在连接状态下方加入 URL 输入和重连按钮 -->
          <v-card-subtitle class="text-subtitle-1">
            实时控制机械臂运动 | 连接状态:
            <v-chip :color="rosConnected ? 'success' : 'error'" small>
              {{ rosConnected ? '已连接' : '未连接' }}
            </v-chip>

            <v-text-field
              v-model="rosUrl"
              label="ROS URL"
              dense
              outlined
              hide-details
              suffix-icon="mdi-refresh"
              @click:append="reconnectROS"
              class="mt-2"
            ></v-text-field>
          </v-card-subtitle>

          <v-card-text>
            <!-- 步进电机控制区域 -->
            <v-row class="mb-6">
              <v-col cols="12">
                <v-subheader class="text-h6 font-weight-medium">
                  <v-icon class="mr-2">mdi-engine</v-icon>
                  步进电机控制
                </v-subheader>
              </v-col>

              <!-- 步进电机 A -->
              <v-col cols="12" md="6">
                <v-card outlined class="pa-4 tw:hover:!shadow-m-elevation-6">
                  <v-card-title class="text-h6">电机 A</v-card-title>
                  <v-slider
                    v-model="armParams.A"
                    :min="stepperRange.A.min"
                    :max="stepperRange.A.max"
                    :step="stepperRange.A.step"
                    thumb-label="always"
                    color="primary"
                    track-color="grey lighten-2"
                    @change="onArmParamChange"
                  >
                    <template v-slot:prepend>
                      <v-btn icon @click="decrementA">
                        <v-icon>mdi-minus</v-icon>
                      </v-btn>
                    </template>
                    <template v-slot:append>
                      <v-btn icon @click="incrementA">
                        <v-icon>mdi-plus</v-icon>
                      </v-btn>
                    </template>
                  </v-slider>

                  <v-text-field
                    v-model.number="armParams.A"
                    type="number"
                    :min="stepperRange.A.min"
                    :max="stepperRange.A.max"
                    outlined
                    dense
                    label="精确数值"
                    suffix="步"
                    @change="onArmParamChange"
                  ></v-text-field>
                </v-card>
              </v-col>

              <!-- 步进电机 B -->
              <v-col cols="12" md="6">
                <v-card outlined class="pa-4 tw:hover:!shadow-m-elevation-6">
                  <v-card-title class="text-h6">电机 B</v-card-title>
                  <v-slider
                    v-model="armParams.B"
                    :min="stepperRange.B.min"
                    :max="stepperRange.B.max"
                    :step="stepperRange.B.step"
                    thumb-label="always"
                    color="primary"
                    track-color="grey lighten-2"
                    @change="onArmParamChange"
                  >
                    <template v-slot:prepend>
                      <v-btn icon @click="decrementB">
                        <v-icon>mdi-minus</v-icon>
                      </v-btn>
                    </template>
                    <template v-slot:append>
                      <v-btn icon @click="incrementB">
                        <v-icon>mdi-plus</v-icon>
                      </v-btn>
                    </template>
                  </v-slider>

                  <v-text-field
                    v-model.number="armParams.B"
                    type="number"
                    :min="stepperRange.B.min"
                    :max="stepperRange.B.max"
                    outlined
                    dense
                    label="精确数值"
                    suffix="步"
                    @change="onArmParamChange"
                  ></v-text-field>
                </v-card>
              </v-col>
            </v-row>

            <!-- 舵机控制区域 -->
            <v-row class="mb-6">
              <v-col cols="12">
                <v-subheader class="text-h6 font-weight-medium">
                  <v-icon class="mr-2">mdi-rotate-3d-variant</v-icon>
                  舵机控制
                </v-subheader>
              </v-col>

              <!-- 舵机 C -->
              <v-col cols="12" md="6">
                <v-card outlined class="pa-4 tw:hover:!shadow-m-elevation-6">
                  <v-card-title class="text-h6">舵机 C</v-card-title>
                  <v-slider
                    v-model="armParams.C"
                    :min="servoRange.C.min"
                    :max="servoRange.C.max"
                    :step="servoRange.C.step"
                    thumb-label="always"
                    color="secondary"
                    track-color="grey lighten-2"
                    @change="onArmParamChange"
                  >
                    <template v-slot:prepend>
                      <v-btn icon @click="decrementC">
                        <v-icon>mdi-minus</v-icon>
                      </v-btn>
                    </template>
                    <template v-slot:append>
                      <v-btn icon @click="incrementC">
                        <v-icon>mdi-plus</v-icon>
                      </v-btn>
                    </template>
                  </v-slider>

                  <v-text-field
                    v-model.number="armParams.C"
                    type="number"
                    :min="servoRange.C.min"
                    :max="servoRange.C.max"
                    step="0.1"
                    outlined
                    dense
                    label="精确数值"
                    suffix="°"
                    @change="onArmParamChange"
                  ></v-text-field>
                </v-card>
              </v-col>

              <!-- 舵机 D -->
              <v-col cols="12" md="6">
                <v-card outlined class="pa-4 tw:hover:!shadow-m-elevation-6">
                  <v-card-title class="text-h6">舵机 D</v-card-title>
                  <v-slider
                    v-model="armParams.D"
                    :min="servoRange.D.min"
                    :max="servoRange.D.max"
                    :step="servoRange.D.step"
                    thumb-label="always"
                    color="secondary"
                    track-color="grey lighten-2"
                    @change="onArmParamChange"
                  >
                    <template v-slot:prepend>
                      <v-btn icon @click="decrementD">
                        <v-icon>mdi-minus</v-icon>
                      </v-btn>
                    </template>
                    <template v-slot:append>
                      <v-btn icon @click="incrementD">
                        <v-icon>mdi-plus</v-icon>
                      </v-btn>
                    </template>
                  </v-slider>

                  <v-text-field
                    v-model.number="armParams.D"
                    type="number"
                    :min="servoRange.D.min"
                    :max="servoRange.D.max"
                    step="0.1"
                    outlined
                    dense
                    label="精确数值"
                    suffix="°"
                    @change="onArmParamChange"
                  ></v-text-field>
                </v-card>
              </v-col>
            </v-row>

            <!-- 预设位置 -->
            <v-row class="mb-4">
              <v-col cols="12">
                <v-subheader class="text-h6 font-weight-medium">
                  <v-icon class="mr-2">mdi-bookmark</v-icon>
                  预设位置
                </v-subheader>
              </v-col>
              <v-col cols="12">
                <v-chip-group>
                  <v-chip
                    v-for="preset in presetPositions"
                    :key="preset.name"
                    @click="applyPreset(preset)"
                    color="accent"
                    outlined
                    large
                  >
                    <v-icon left>{{ preset.icon }}</v-icon>
                    {{ preset.name }}
                  </v-chip>
                </v-chip-group>
              </v-col>
            </v-row>

            <!-- 控制按钮 -->
            <v-row class="mt-6">
              <v-col cols="12" class="text-center">
                <v-btn
                  @click="sendArmCommand"
                  :disabled="!rosConnected"
                  color="primary"
                  large
                  elevation="2"
                  class="mr-4"
                >
                  <v-icon left>mdi-send</v-icon>
                  发送指令
                </v-btn>

                <v-btn @click="resetToDefault" color="warning" large elevation="2" outlined>
                  <v-icon left>mdi-restore</v-icon>
                  复位
                </v-btn>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- 状态显示卡片 -->
    <v-row class="mt-4">
      <v-col cols="12">
        <v-card class="elevation-2">
          <v-card-title class="text-h6">
            <v-icon class="mr-2">mdi-information</v-icon>
            当前状态
          </v-card-title>
          <v-card-text>
            <v-simple-table>
              <template v-slot:default>
                <thead>
                  <tr>
                    <th>参数</th>
                    <th>当前值</th>
                    <th>类型</th>
                    <th>范围</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>电机 A</td>
                    <td>{{ armParams.A }}</td>
                    <td>步进电机</td>
                    <td>{{ stepperRange.A.min }} ~ {{ stepperRange.A.max }}</td>
                  </tr>
                  <tr>
                    <td>电机 B</td>
                    <td>{{ armParams.B }}</td>
                    <td>步进电机</td>
                    <td>{{ stepperRange.B.min }} ~ {{ stepperRange.B.max }}</td>
                  </tr>
                  <tr>
                    <td>舵机 C</td>
                    <td>{{ armParams.C }}°</td>
                    <td>舵机</td>
                    <td>{{ servoRange.C.min }}° ~ {{ servoRange.C.max }}°</td>
                  </tr>
                  <tr>
                    <td>舵机 D</td>
                    <td>{{ armParams.D }}°</td>
                    <td>舵机</td>
                    <td>{{ servoRange.D.min }}° ~ {{ servoRange.D.max }}°</td>
                  </tr>
                </tbody>
              </template>
            </v-simple-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- 消息提示 -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="3000">
      {{ snackbar.message }}
      <template v-slot:action="{ attrs }">
        <v-btn text v-bind="attrs" @click="snackbar.show = false"> 关闭 </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import ROSLIB from 'roslib'

// 组件名称定义
defineOptions({
  name: 'AgvArm',
})

// 响应式数据
const ros = ref(null)
const armTopic = ref(null)
const rosConnected = ref(false)

// 机械臂参数
const armParams = reactive({
  A: 100,
  B: 200,
  C: 2,
  D: -2,
})

// 步进电机范围配置
const stepperRange = reactive({
  A: { min: -1000, max: 1000, step: 10 },
  B: { min: -1000, max: 1000, step: 10 },
})

// 舵机范围配置
const servoRange = reactive({
  C: { min: -180, max: 180, step: 0.5 },
  D: { min: -180, max: 180, step: 0.5 },
})

// 预设位置
const presetPositions = ref([
  {
    name: '初始位置',
    icon: 'mdi-home',
    params: { A: 0, B: 0, C: 0, D: 0 },
  },
  {
    name: '工作位置',
    icon: 'mdi-wrench',
    params: { A: 100, B: 200, C: 45, D: -45 },
  },
  {
    name: '收纳位置',
    icon: 'mdi-package-down',
    params: { A: -100, B: -100, C: -90, D: 90 },
  },
])

// 消息提示
const snackbar = reactive({
  show: false,
  message: '',
  color: 'success',
})

// 新增：可编辑的 ROS 地址
const rosUrl = ref('ws://localhost:9090')

// 新增：重连方法
const reconnectROS = () => {
  if (ros.value) {
    ros.value.close()
  }
  initROS()
}

// 初始化ROS连接
const initROS = () => {
  ros.value = new ROSLIB.Ros({
    url: rosUrl.value,
  })

  ros.value.on('connection', () => {
    rosConnected.value = true
    showMessage('ROS连接成功', 'success')
    initArmTopic()
  })

  ros.value.on('error', (error) => {
    rosConnected.value = false
    showMessage('ROS连接错误: ' + error, 'error')
  })

  ros.value.on('close', () => {
    rosConnected.value = false
    showMessage('ROS连接已断开', 'warning')
  })
}

// 初始化机械臂话题
const initArmTopic = () => {
  armTopic.value = new ROSLIB.Topic({
    ros: ros.value,
    name: '/arm_command',
    messageType: 'std_msgs/String',
  })
}

// 发送机械臂控制指令
const sendArmCommand = () => {
  if (!armTopic.value) return

  const armMessage = new ROSLIB.Message({
    data: JSON.stringify({
      A: armParams.A,
      B: armParams.B,
      C: armParams.C,
      D: armParams.D,
    }),
  })

  armTopic.value.publish(armMessage)
  showMessage('指令已发送', 'success')
}

// 参数变化时的处理
const onArmParamChange = () => {
  // 可以在这里添加实时发送逻辑
  // sendArmCommand()
}

// 应用预设位置
const applyPreset = (preset) => {
  Object.assign(armParams, preset.params)
  showMessage(`已应用预设: ${preset.name}`, 'info')
}

// 复位到默认值
const resetToDefault = () => {
  Object.assign(armParams, {
    A: 100,
    B: 200,
    C: 2,
    D: -2,
  })
  showMessage('已复位到默认值', 'info')
}

// 步进控制方法
const incrementA = () => {
  armParams.A = Math.min(armParams.A + stepperRange.A.step, stepperRange.A.max)
  onArmParamChange()
}

const decrementA = () => {
  armParams.A = Math.max(armParams.A - stepperRange.A.step, stepperRange.A.min)
  onArmParamChange()
}

const incrementB = () => {
  armParams.B = Math.min(armParams.B + stepperRange.B.step, stepperRange.B.max)
  onArmParamChange()
}

const decrementB = () => {
  armParams.B = Math.max(armParams.B - stepperRange.B.step, stepperRange.B.min)
  onArmParamChange()
}

const incrementC = () => {
  armParams.C = Math.min(armParams.C + servoRange.C.step, servoRange.C.max)
  onArmParamChange()
}

const decrementC = () => {
  armParams.C = Math.max(armParams.C - servoRange.C.step, servoRange.C.min)
  onArmParamChange()
}

const incrementD = () => {
  armParams.D = Math.min(armParams.D + servoRange.D.step, servoRange.D.max)
  onArmParamChange()
}

const decrementD = () => {
  armParams.D = Math.max(armParams.D - servoRange.D.step, servoRange.D.min)
  onArmParamChange()
}

// 显示消息提示
const showMessage = (message, color = 'success') => {
  Object.assign(snackbar, {
    show: true,
    message,
    color,
  })
}

// 生命周期钩子
onMounted(() => {
  initROS()
})

onUnmounted(() => {
  if (ros.value) {
    ros.value.close()
  }
})
</script>

<style scoped>
.v-card {
  transition: all 0.3s ease;
}

.v-card:hover {
  transform: translateY(-2px);
}

.v-slider {
  margin: 16px 0;
}

.v-chip {
  margin: 4px;
}
</style>
