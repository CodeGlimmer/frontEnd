<template>
  <v-container fluid class="arm-control-container">
    <!-- Header Section -->
    <v-row>
      <v-col cols="12">
        <v-card
          class="header-card elevation-4"
          color="primary"
          :dark="!themeStore.isDarkMode"
          :light="themeStore.isDarkMode"
        >
          <v-card-title class="text-h4 font-weight-light d-flex align-center">
            <v-avatar size="56" class="mr-4" :color="themeStore.isDarkMode ? 'primary' : 'white'">
              <v-icon size="32" :color="themeStore.isDarkMode ? 'white' : 'primary'">
                mdi-robot-industrial
              </v-icon>
            </v-avatar>
            <div>
              <div class="text-h4 font-weight-light">AGV 机械臂控制</div>
              <div
                class="text-subtitle-1 font-weight-regular"
                :class="themeStore.isDarkMode ? 'white--text' : 'primary--text'"
              >
                实时控制机械臂运动系统
              </div>
            </div>
          </v-card-title>
        </v-card>
      </v-col>
    </v-row>

    <!-- Connection Status Section -->
    <v-row>
      <v-col cols="12" md="8">
        <v-card class="connection-card elevation-4">
          <v-card-title class="text-h6 pb-2">
            <v-icon class="mr-2">mdi-connection</v-icon>
            连接状态
          </v-card-title>
          <v-card-text>
            <div class="d-flex align-center mb-4">
              <v-chip
                :color="rosConnected ? 'success' : 'error'"
                :text-color="rosConnected ? 'white' : 'white'"
                class="mr-3"
                label
              >
                <v-icon left small>
                  {{ rosConnected ? 'mdi-check-circle' : 'mdi-close-circle' }}
                </v-icon>
                {{ rosConnected ? '已连接' : '未连接' }}
              </v-chip>
              <v-spacer></v-spacer>
              <v-btn @click="reconnectROS" color="primary" outlined small :loading="false">
                <v-icon left small>mdi-refresh</v-icon>
                重新连接
              </v-btn>
            </div>
            <v-text-field
              v-model="rosUrl"
              label="ROS WebSocket URL"
              outlined
              dense
              prepend-inner-icon="mdi-web"
              hint="例如: ws://localhost:9090"
              persistent-hint
            ></v-text-field>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card class="quick-actions-card elevation-4" height="100%">
          <v-card-title class="text-h6 pb-2">
            <v-icon class="mr-2">mdi-flash</v-icon>
            快速操作
          </v-card-title>
          <v-card-text class="d-flex flex-column justify-center">
            <v-btn @click="resetInputs" color="warning" outlined block class="mb-3">
              <v-icon left>mdi-restore</v-icon>
              清空输入
            </v-btn>
            <v-btn
              @click="sendAllCommands"
              :disabled="!rosConnected"
              color="success"
              block
              :loading="false"
            >
              <v-icon left>mdi-send-check</v-icon>
              发送所有指令
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Stepper Motors Control Section -->
    <v-row>
      <v-col cols="12">
        <v-card class="stepper-control-card elevation-4">
          <v-card-title class="text-h5 primary--text">
            <v-icon class="mr-3" color="primary">mdi-engine</v-icon>
            步进电机控制
            <v-spacer></v-spacer>
            <v-chip color="info" outlined small>
              <v-icon left small>mdi-information</v-icon>
              一次控制一个电机
            </v-chip>
          </v-card-title>
          <v-divider></v-divider>
          <v-card-text class="pa-6">
            <v-row>
              <!-- 步进电机 A -->
              <v-col cols="12" md="6">
                <v-card class="motor-card elevation-2" outlined>
                  <v-card-title class="text-h6 pb-2 primary--text">
                    <v-avatar size="32" color="primary" class="mr-3">
                      <span class="white--text font-weight-bold">A</span>
                    </v-avatar>
                    步进电机 A
                  </v-card-title>
                  <v-divider></v-divider>
                  <v-card-text class="pa-4">
                    <v-text-field
                      v-model.number="stepperInputs.A"
                      type="number"
                      :min="stepperRange.A.min"
                      :max="stepperRange.A.max"
                      outlined
                      label="移动步数"
                      suffix="步"
                      prepend-inner-icon="mdi-numeric"
                      hint="范围: -1000 ~ 1000 步"
                      persistent-hint
                      :rules="[
                        (v) => (v >= stepperRange.A.min && v <= stepperRange.A.max) || '超出范围',
                      ]"
                    ></v-text-field>
                    <v-btn
                      @click="sendStepperCommand('A')"
                      :disabled="!rosConnected || !stepperInputs.A"
                      color="primary"
                      block
                      large
                      class="mt-3"
                      elevation="2"
                    >
                      <v-icon left>mdi-send</v-icon>
                      发送指令
                    </v-btn>
                  </v-card-text>
                </v-card>
              </v-col>

              <!-- 步进电机 B -->
              <v-col cols="12" md="6">
                <v-card class="motor-card elevation-2" outlined>
                  <v-card-title class="text-h6 pb-2 primary--text">
                    <v-avatar size="32" color="primary" class="mr-3">
                      <span class="white--text font-weight-bold">B</span>
                    </v-avatar>
                    步进电机 B
                  </v-card-title>
                  <v-divider></v-divider>
                  <v-card-text class="pa-4">
                    <v-text-field
                      v-model.number="stepperInputs.B"
                      type="number"
                      :min="stepperRange.B.min"
                      :max="stepperRange.B.max"
                      outlined
                      label="移动步数"
                      suffix="步"
                      prepend-inner-icon="mdi-numeric"
                      hint="范围: -1000 ~ 1000 步"
                      persistent-hint
                      :rules="[
                        (v) => (v >= stepperRange.B.min && v <= stepperRange.B.max) || '超出范围',
                      ]"
                    ></v-text-field>
                    <v-btn
                      @click="sendStepperCommand('B')"
                      :disabled="!rosConnected || !stepperInputs.B"
                      color="primary"
                      block
                      large
                      class="mt-3"
                      elevation="2"
                    >
                      <v-icon left>mdi-send</v-icon>
                      发送指令
                    </v-btn>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Servo Motors Control Section -->
    <v-row>
      <v-col cols="12">
        <v-card class="servo-control-card elevation-4">
          <v-card-title class="text-h5 secondary--text">
            <v-icon class="mr-3" color="secondary">mdi-rotate-3d-variant</v-icon>
            舵机控制
            <v-spacer></v-spacer>
            <v-chip color="info" outlined small>
              <v-icon left small>mdi-information</v-icon>
              一次控制一个舵机
            </v-chip>
          </v-card-title>
          <v-divider></v-divider>
          <v-card-text class="pa-6">
            <v-row>
              <!-- 舵机 C -->
              <v-col cols="12" md="6">
                <v-card class="servo-card elevation-2" outlined>
                  <v-card-title class="text-h6 pb-2 secondary--text">
                    <v-avatar size="32" color="secondary" class="mr-3">
                      <span class="white--text font-weight-bold">C</span>
                    </v-avatar>
                    舵机 C
                  </v-card-title>
                  <v-divider></v-divider>
                  <v-card-text class="pa-4">
                    <v-text-field
                      v-model.number="servoInputs.C"
                      type="number"
                      :min="servoRange.C.min"
                      :max="servoRange.C.max"
                      step="0.1"
                      outlined
                      label="目标角度"
                      suffix="°"
                      prepend-inner-icon="mdi-rotate-right"
                      hint="范围: -180° ~ 180°"
                      persistent-hint
                      :rules="[
                        (v) => (v >= servoRange.C.min && v <= servoRange.C.max) || '超出范围',
                      ]"
                    ></v-text-field>
                    <v-btn
                      @click="sendServoCommand('C')"
                      :disabled="
                        !rosConnected || servoInputs.C === null || servoInputs.C === undefined
                      "
                      color="secondary"
                      block
                      large
                      class="mt-3"
                      elevation="2"
                    >
                      <v-icon left>mdi-send</v-icon>
                      发送指令
                    </v-btn>
                  </v-card-text>
                </v-card>
              </v-col>

              <!-- 舵机 D -->
              <v-col cols="12" md="6">
                <v-card class="servo-card elevation-2" outlined>
                  <v-card-title class="text-h6 pb-2 secondary--text">
                    <v-avatar size="32" color="secondary" class="mr-3">
                      <span class="white--text font-weight-bold">D</span>
                    </v-avatar>
                    舵机 D
                  </v-card-title>
                  <v-divider></v-divider>
                  <v-card-text class="pa-4">
                    <v-text-field
                      v-model.number="servoInputs.D"
                      type="number"
                      :min="servoRange.D.min"
                      :max="servoRange.D.max"
                      step="0.1"
                      outlined
                      label="目标角度"
                      suffix="°"
                      prepend-inner-icon="mdi-rotate-right"
                      hint="范围: -180° ~ 180°"
                      persistent-hint
                      :rules="[
                        (v) => (v >= servoRange.D.min && v <= servoRange.D.max) || '超出范围',
                      ]"
                    ></v-text-field>
                    <v-btn
                      @click="sendServoCommand('D')"
                      :disabled="
                        !rosConnected || servoInputs.D === null || servoInputs.D === undefined
                      "
                      color="secondary"
                      block
                      large
                      class="mt-3"
                      elevation="2"
                    >
                      <v-icon left>mdi-send</v-icon>
                      发送指令
                    </v-btn>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Status Display Section -->
    <v-row>
      <v-col cols="12">
        <v-card class="status-card elevation-4">
          <v-card-title class="text-h5 info--text">
            <v-icon class="mr-3" color="info">mdi-chart-line</v-icon>
            当前状态监控
          </v-card-title>
          <v-divider></v-divider>
          <v-card-text class="pa-6">
            <v-row>
              <!-- 步进电机状态 -->
              <v-col cols="12" md="6">
                <v-card class="status-item-card elevation-1" outlined>
                  <v-card-title class="text-h6 pb-2">
                    <v-icon class="mr-2" color="primary">mdi-engine</v-icon>
                    步进电机状态
                  </v-card-title>
                  <v-divider></v-divider>
                  <v-card-text class="pa-4">
                    <v-row>
                      <v-col cols="6">
                        <div class="text-center">
                          <v-avatar size="48" color="primary" class="mb-2">
                            <span class="white--text font-weight-bold text-h6">A</span>
                          </v-avatar>
                          <div class="text-h6 font-weight-bold">{{ stepperInputs.A || 0 }}</div>
                          <div class="text-caption grey--text">步</div>
                        </div>
                      </v-col>
                      <v-col cols="6">
                        <div class="text-center">
                          <v-avatar size="48" color="primary" class="mb-2">
                            <span class="white--text font-weight-bold text-h6">B</span>
                          </v-avatar>
                          <div class="text-h6 font-weight-bold">{{ stepperInputs.B || 0 }}</div>
                          <div class="text-caption grey--text">步</div>
                        </div>
                      </v-col>
                    </v-row>
                    <v-divider class="my-3"></v-divider>
                    <div class="text-caption grey--text text-center">
                      范围: {{ stepperRange.A.min }} ~ {{ stepperRange.A.max }} 步
                    </div>
                  </v-card-text>
                </v-card>
              </v-col>

              <!-- 舵机状态 -->
              <v-col cols="12" md="6">
                <v-card class="status-item-card elevation-1" outlined>
                  <v-card-title class="text-h6 pb-2">
                    <v-icon class="mr-2" color="secondary">mdi-rotate-3d-variant</v-icon>
                    舵机状态
                  </v-card-title>
                  <v-divider></v-divider>
                  <v-card-text class="pa-4">
                    <v-row>
                      <v-col cols="6">
                        <div class="text-center">
                          <v-avatar size="48" color="secondary" class="mb-2">
                            <span class="white--text font-weight-bold text-h6">C</span>
                          </v-avatar>
                          <div class="text-h6 font-weight-bold">{{ servoInputs.C || 0 }}</div>
                          <div class="text-caption grey--text">°</div>
                        </div>
                      </v-col>
                      <v-col cols="6">
                        <div class="text-center">
                          <v-avatar size="48" color="secondary" class="mb-2">
                            <span class="white--text font-weight-bold text-h6">D</span>
                          </v-avatar>
                          <div class="text-h6 font-weight-bold">{{ servoInputs.D || 0 }}</div>
                          <div class="text-caption grey--text">°</div>
                        </div>
                      </v-col>
                    </v-row>
                    <v-divider class="my-3"></v-divider>
                    <div class="text-caption grey--text text-center">
                      范围: {{ servoRange.C.min }}° ~ {{ servoRange.C.max }}°
                    </div>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
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
import { useThemeStore } from '@/stores/theme'

// 组件名称定义
defineOptions({
  name: 'AgvArm',
})

// 主题store
const themeStore = useThemeStore()

// 响应式数据
const ros = ref(null)
const armTopic = ref(null)
const rosConnected = ref(false)

// 步进电机输入值
const stepperInputs = reactive({
  A: 0,
  B: 0,
})

// 舵机输入值
const servoInputs = reactive({
  C: 0,
  D: 0,
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

// Send stepper motor command (format: "A 100")
const sendStepperCommand = (motor) => {
  if (!armTopic.value) return

  const steps = stepperInputs[motor]
  if (steps === null || steps === undefined) {
    showMessage(`请输入电机${motor}的步数`, 'warning')
    return
  }

  const commandString = `${motor} ${steps}`
  const armMessage = new ROSLIB.Message({
    data: commandString,
  })

  armTopic.value.publish(armMessage)
  showMessage(`电机${motor}指令已发送: ${commandString}`, 'success')
}

// Send servo command (format: "C 90.5")
const sendServoCommand = (servo) => {
  if (!armTopic.value) return

  const angle = servoInputs[servo]
  if (angle === null || angle === undefined) {
    showMessage(`请输入舵机${servo}的角度`, 'warning')
    return
  }

  const commandString = `${servo} ${angle}`
  const armMessage = new ROSLIB.Message({
    data: commandString,
  })

  armTopic.value.publish(armMessage)
  showMessage(`舵机${servo}指令已发送: ${commandString}`, 'success')
}

// Reset all inputs to zero
const resetInputs = () => {
  Object.assign(stepperInputs, { A: 0, B: 0 })
  Object.assign(servoInputs, { C: 0, D: 0 })
  showMessage('已清空所有输入', 'info')
}

// Send all commands sequentially
const sendAllCommands = async () => {
  if (!armTopic.value) return

  const commands = []

  // Add stepper commands if values are not zero
  if (stepperInputs.A !== 0) commands.push({ type: 'stepper', motor: 'A' })
  if (stepperInputs.B !== 0) commands.push({ type: 'stepper', motor: 'B' })
  if (servoInputs.C !== 0) commands.push({ type: 'servo', servo: 'C' })
  if (servoInputs.D !== 0) commands.push({ type: 'servo', servo: 'D' })

  if (commands.length === 0) {
    showMessage('没有需要发送的指令', 'warning')
    return
  }

  for (const command of commands) {
    if (command.type === 'stepper') {
      sendStepperCommand(command.motor)
    } else {
      sendServoCommand(command.servo)
    }
    // Add small delay between commands
    await new Promise((resolve) => setTimeout(resolve, 100))
  }

  showMessage(`已发送${commands.length}个指令`, 'success')
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
/* Container Styles */
.arm-control-container {
  min-height: 100vh;
  padding: 24px;
}

/* Header Card Styles */
.header-card {
  border-radius: 16px !important;
  margin-bottom: 24px;
}

.header-card .v-card-title {
  padding: 32px !important;
}

/* Connection Card Styles */
.connection-card {
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.connection-card:hover {
  transform: translateY(-4px);
}

/* Quick Actions Card */
.quick-actions-card {
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.quick-actions-card:hover {
  transform: translateY(-4px);
}

/* Control Cards */
.stepper-control-card,
.servo-control-card {
  border-radius: 16px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.stepper-control-card:hover,
.servo-control-card:hover {
  transform: translateY(-2px);
}

/* Motor and Servo Cards */
.motor-card,
.servo-card {
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 2px solid transparent;
}

.motor-card:hover,
.servo-card:hover {
  transform: translateY(-4px);
}

/* Status Card */
.status-card {
  border-radius: 16px;
}

.status-item-card {
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.status-item-card:hover {
  transform: translateY(-2px);
}

/* Button Styles */
.v-btn {
  border-radius: 8px !important;
  text-transform: none !important;
  font-weight: 500 !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

.v-btn:hover:not(.v-btn--disabled) {
  transform: translateY(-2px);
}

/* Text Field Styles */
.v-text-field {
  margin-bottom: 8px;
}

.v-text-field .v-input__control .v-input__slot {
  border-radius: 8px !important;
}

/* Chip Styles */
.v-chip {
  border-radius: 20px !important;
  font-weight: 500 !important;
}

/* Avatar Styles */
.v-avatar {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Divider Styles */
.v-divider {
  margin: 0 !important;
}

/* Card Title Spacing */
.v-card-title {
  padding-bottom: 16px !important;
}

/* Responsive Design */
@media (max-width: 960px) {
  .arm-control-container {
    padding: 16px;
  }

  .header-card .v-card-title {
    padding: 24px !important;
  }

  .motor-card,
  .servo-card {
    margin-bottom: 16px;
  }
}

/* Animation for connection status */
@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

.v-chip--label.success {
  animation: pulse 2s infinite;
}

/* Smooth transitions for all cards */
.v-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Theme-aware hover effects */
.theme--light .connection-card:hover,
.theme--light .quick-actions-card:hover {
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12) !important;
}

.theme--dark .connection-card:hover,
.theme--dark .quick-actions-card:hover {
  box-shadow: 0 8px 25px rgba(255, 255, 255, 0.1) !important;
}

.theme--light .stepper-control-card:hover,
.theme--light .servo-control-card:hover {
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15) !important;
}

.theme--dark .stepper-control-card:hover,
.theme--dark .servo-control-card:hover {
  box-shadow: 0 12px 40px rgba(255, 255, 255, 0.1) !important;
}

.theme--light .motor-card:hover,
.theme--light .servo-card:hover {
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12) !important;
}

.theme--dark .motor-card:hover,
.theme--dark .servo-card:hover {
  box-shadow: 0 8px 25px rgba(255, 255, 255, 0.1) !important;
}

.theme--light .status-item-card:hover {
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1) !important;
}

.theme--dark .status-item-card:hover {
  box-shadow: 0 6px 20px rgba(255, 255, 255, 0.1) !important;
}
</style>
