<template>
  <v-container fluid class="fill-height pa-2">
    <v-row class="tw:sticky tw:top-0 tw:z-30">
      <v-col cols="12">
        <!-- 顶部标题栏 -->
        <v-card
          flat
          :color="primary"
          class="mb-2 mx-auto"
          max-width="600"
          rounded="pill"
          elevation="3"
          v-ripple
          ref="headerTitle"
        >
          <v-card-item class="py-2 px-6 tw:glass">
            <template v-slot:prepend>
              <v-icon icon="mdi-map" size="small" class="header-icon" />
            </template>
            <v-card-title class="text-subtitle-1 font-weight-medium" ref="titleText">
              AGV地图实时监控
            </v-card-title>
          </v-card-item>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="fill-height">
      <!-- 左侧地图区域 -->
      <v-col cols="12" md="8" class="d-flex flex-column">
        <!-- 地图源选择器 -->
        <v-card
          class="mb-2"
          v-motion
          :initial="motionConfig.mapSource.initial"
          :enter="motionConfig.mapSource.enter"
        >
          <v-card-item>
            <v-card-title class="text-subtitle-1">地图源选择</v-card-title>
          </v-card-item>
          <v-card-text class="pt-0">
            <v-btn-toggle v-model="mapSource" mandatory variant="outlined" divided class="w-100">
              <v-btn value="ros" class="flex-1">
                <v-icon start>mdi-robot</v-icon>
                ROS服务器
              </v-btn>
              <v-btn value="local" class="flex-1">
                <v-icon start>mdi-file-upload</v-icon>
                本地文件
              </v-btn>
            </v-btn-toggle>
          </v-card-text>
        </v-card>

        <!-- 地图显示区域 -->
        <v-card
          flat
          class="flex-grow-1 tw:flex tw:justify-center tw:items-center"
          v-motion
          :initial="motionConfig.map.initial"
          :enter="motionConfig.map.enter"
          ref="mapContainer"
        >
          <EnhancedMapViewer :map-source="mapSource" class="tw:!rounded-xl border-sm tw:mx-2" />
        </v-card>
      </v-col>

      <!-- 右侧控制面板 -->
      <v-col cols="12" md="4">
        <v-row dense>
          <!-- 指令面板 -->
          <v-col cols="12">
            <v-card
              v-motion
              :initial="motionConfig.instruction.initial"
              :enter="motionConfig.instruction.enter"
              class="mb-2"
            >
              <v-card-item>
                <v-card-title class="text-subtitle-1">地图加载说明</v-card-title>
                <v-card-subtitle class="text-body-2 split-text">
                  支持两种地图加载方式，请根据需要选择：
                </v-card-subtitle>
              </v-card-item>
              <v-card-text class="pt-0">
                <!-- ROS 服务器说明 -->
                <div v-if="mapSource === 'ros'" class="instruction-section">
                  <div class="text-subtitle-2 mb-2">
                    <v-icon size="small" class="mr-1">mdi-robot</v-icon>
                    ROS 服务器模式
                  </div>
                  <div class="text-body-2 mb-3">请在终端中执行以下命令：</div>
                  <v-list density="compact" class="bg-transparent">
                    <v-list-item
                      v-for="(cmd, index) in terminalCommands"
                      :key="index"
                      class="instruction-item"
                    >
                      <v-chip
                        variant="outlined"
                        color="primary"
                        size="small"
                        class="text-caption monospace"
                      >
                        {{ cmd }}
                      </v-chip>
                    </v-list-item>
                  </v-list>
                </div>

                <!-- 本地文件说明 -->
                <div v-else class="instruction-section">
                  <div class="text-subtitle-2 mb-2">
                    <v-icon size="small" class="mr-1">mdi-file-upload</v-icon>
                    本地文件模式
                  </div>
                  <div class="text-body-2 mb-3">支持加载本地 PGM 和 YAML 文件：</div>
                  <v-list density="compact" class="bg-transparent">
                    <v-list-item class="instruction-item">
                      <v-list-item-title class="text-body-2">
                        <v-icon size="small" class="mr-2">mdi-file-image</v-icon>
                        PGM 文件：包含地图的像素数据
                      </v-list-item-title>
                    </v-list-item>
                    <v-list-item class="instruction-item">
                      <v-list-item-title class="text-body-2">
                        <v-icon size="small" class="mr-2">mdi-file-cog</v-icon>
                        YAML 文件：包含地图的元数据配置
                      </v-list-item-title>
                    </v-list-item>
                  </v-list>
                </div>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- 状态面板 -->
          <v-col cols="12">
            <v-card
              v-motion
              :initial="motionConfig.status.initial"
              :enter="motionConfig.status.enter"
              class="mb-2"
              ref="statusWrapper"
            >
              <v-card-item>
                <v-card-title class="text-subtitle-1">工作状态</v-card-title>
              </v-card-item>
              <v-card-text class="pt-0">
                <WorkingStatus />
              </v-card-text>
            </v-card>
          </v-col>

          <!-- 操作面板 -->
          <v-col cols="12">
            <v-card
              v-motion
              :initial="motionConfig.operations.initial"
              :enter="motionConfig.operations.enter"
              class="mb-2"
              ref="operationsWrapper"
            >
              <v-card-item>
                <v-card-title class="text-subtitle-1">操作控制</v-card-title>
              </v-card-item>
              <v-card-text class="pt-0">
                <SendingOperations />
              </v-card-text>
            </v-card>
          </v-col>

          <!-- 快速指令 -->
          <v-col cols="12">
            <QuickCommands />
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { onMounted, ref, nextTick } from 'vue'
import gsap from 'gsap'
import { SplitText } from 'gsap/SplitText'
import EnhancedMapViewer from '@/components/common/EnhancedMapViewer.vue'
import WorkingStatus from '@/views/DashBoard/WorkingStatus.vue'
import SendingOperations from '@/views/DashBoard/SendingOperations.vue'
import QuickCommands from '@/views/DashBoard/QuickCommands.vue'

// 注册 GSAP 插件
gsap.registerPlugin(SplitText)

// 地图源状态管理
const mapSource = ref('ros')

// 终端命令配置
const terminalCommands = [
  'roscore',
  'rosrun map_server map_server /opt/ros/groovy/share/rail_maps/maps/ilab.pgm 0.05',
  'roslaunch rosbridge_server rosbridge_websocket.launch',
]

// 动画配置
const motionConfig = {
  mapSource: {
    initial: { opacity: 0, y: -50 },
    enter: { opacity: 1, y: 0, transition: { duration: 500, delay: 100 } },
  },
  map: {
    initial: { opacity: 0, y: 100 },
    enter: { opacity: 1, y: 0, transition: { duration: 500, delay: 200 } },
  },
  instruction: {
    initial: { opacity: 0, x: 100 },
    enter: { opacity: 1, x: 0, transition: { duration: 500, delay: 300 } },
  },
  status: {
    initial: { opacity: 0, y: 50 },
    enter: { opacity: 1, y: 0, transition: { duration: 500, delay: 500 } },
  },
  operations: {
    initial: { opacity: 0, y: 50 },
    enter: { opacity: 1, y: 0, transition: { duration: 500, delay: 700 } },
  },
}

// DOM 引用
const refs = {
  splitTextContainer: ref(null),
  commandTitle: ref(null),
  titleText: ref(null),
  mapContainer: ref(null),
  statusWrapper: ref(null),
  operationsWrapper: ref(null),
}

// 动画处理函数
const initializeAnimations = async () => {
  await nextTick()

  // 标题动画
  if (refs.titleText.value) {
    const titleSplit = new SplitText(refs.titleText.value, { type: 'chars' })
    gsap.from(titleSplit.chars, {
      opacity: 0,
      y: 50,
      stagger: 0.05,
      duration: 0.8,
      ease: 'back.out(1.7)',
    })
  }

  // 文本动画
  if (refs.splitTextContainer.value) {
    const splitTexts = refs.splitTextContainer.value.querySelectorAll('.split-text')
    splitTexts.forEach((element) => {
      const split = new SplitText(element, { type: 'chars, words' })
      gsap.from(split.chars, {
        opacity: 0,
        y: 20,
        stagger: 0.02,
        duration: 0.5,
        ease: 'power2.out',
        delay: 0.5,
      })
    })
  }
}

// 悬停效果
const setupHoverEffects = () => {
  const cards = [refs.statusWrapper.value, refs.operationsWrapper.value].filter(Boolean)

  cards.forEach((card) => {
    card?.addEventListener('mouseenter', () => {
      gsap.to(card, {
        y: -8,
        boxShadow: 'var(--v-shadow-elevated)',
        duration: 0.3,
      })
    })

    card?.addEventListener('mouseleave', () => {
      gsap.to(card, {
        y: 0,
        boxShadow: 'var(--v-shadow-default)',
        duration: 0.3,
      })
    })
  })
}

onMounted(() => {
  initializeAnimations()
  setupHoverEffects()
})

// 主题变量
const primary = 'primary'
</script>

<style lang="scss" scoped>
.header-icon {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.monospace {
  font-family: 'Roboto Mono', monospace;
}

.v-card {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    transform: translateY(-2px);
  }
}

.instruction-item {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    transform: translateX(4px);
  }
}
</style>
