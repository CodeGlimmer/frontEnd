<template>
  <div class="tw:w-full tw:h-full">
    <div
      class="header-title tw:flex tw:justify-center tw:shadow-m-elevation-8 tw:rounded-full tw:!mb-4 tw:!py-2 tw:bg-m-info tw:dark:bg-m-info-dark tw:!sticky tw:top-0"
      v-ripple
      ref="headerTitle"
    >
      <v-icon class="tw:mr-2 title-icon">mdi-map</v-icon>
      <div class="title-text" ref="titleText">AGV地图实时监控</div>
    </div>
    <!-- 组件显示： -->
    <div class="tw:w-full tw:h-full tw:grid tw:grid-cols-12 tw:gap-4 tw:dark:bg-m-grey-darken4">
      <div
        class="map-container tw:col-span-12 tw:md:col-span-8 tw:dark:bg-m-grey-darken4 tw:flex tw:justify-center tw:items-center tw:rounded-xl tw:shadow-m-elevation-8"
        v-motion
        :initial="{ opacity: 0, y: 100 }"
        :enter="{ opacity: 1, y: 0, transition: { duration: 500 } }"
        ref="mapContainer"
      >
        <!-- <MapView /> -->
      </div>
      <div
        class="instruction-panel tw:col-span-12 tw:md:col-span-4 tw:shadow-m-elevation-8 rounded-xl tw:p-4 tw:overflow-hidden"
        v-motion
        :initial="{ opacity: 0, x: 100 }"
        :enter="{ opacity: 1, x: 0, transition: { duration: 500, delay: 200 } }"
      >
        <div class="tw:!prose" ref="splitTextContainer">
          <h1 class="split-text">Simple Map Example</h1>
          <p class="split-text">
            Run the following commands in the terminal then refresh this page. This will load a map
            from the
            <tt>ros-groovy-rail-maps</tt>
            package.
          </p>
          <ol>
            <li class="instruction-item">
              <tt>roscore</tt>
            </li>
            <li class="instruction-item">
              <tt
                >rosrun map_server map_server /opt/ros/groovy/share/rail_maps/maps/ilab.pgm 0.05</tt
              >
            </li>
            <li class="instruction-item">
              <tt>roslaunch rosbridge_server rosbridge_websocket.launch</tt>
            </li>
          </ol>
        </div>
      </div>
      <div
        class="status-container tw:col-span-12 tw:md:col-span-4 tw:flex tw:justify-center tw:items-center rounded-xl tw:shadow-m-elevation-8 tw:overflow-hidden"
        v-motion
        :initial="{ opacity: 0, y: 50 }"
        :enter="{ opacity: 1, y: 0, transition: { duration: 500, delay: 400 } }"
      >
        <div class="status-wrapper tw:w-11/12" ref="statusWrapper">
          <WorkingStatus />
        </div>
      </div>
      <div
        class="operations-container tw:col-span-12 tw:md:col-span-4 tw:flex tw:justify-center tw:items-center tw:shadow-m-elevation-8 tw:rounded-xl tw:overflow-hidden"
        v-motion
        :initial="{ opacity: 0, y: 50 }"
        :enter="{ opacity: 1, y: 0, transition: { duration: 500, delay: 600 } }"
      >
        <div class="operations-wrapper tw:w-11/12" ref="operationsWrapper">
          <SendingOperations />
        </div>
      </div>
      <div
        class="quick-command tw:col-span-12 tw:md:col-span-4 tw:shadow-m-elevation-8 tw:rounded-xl tw:p-4 tw:overflow-hidden"
        v-motion
        :initial="{ opacity: 0, y: 50 }"
        :enter="{ opacity: 1, y: 0, transition: { duration: 500, delay: 800 } }"
      >
        <div class="command-title split-title" ref="commandTitle">快速指令</div>
      </div>
    </div>
  </div>
</template>

<script setup>
// import MapView from '@/components/common/MapViewer.vue'
import WorkingStatus from '@/views/DashBoard/WorkingStatus.vue'
import SendingOperations from '@/views/DashBoard/SendingOperations.vue'
import { onMounted, ref, nextTick } from 'vue'
import gsap from 'gsap'
import { SplitText } from 'gsap/SplitText'

// 注册必要的插件
gsap.registerPlugin(SplitText)

// 使用ref获取DOM元素
const splitTextContainer = ref(null)
const commandTitle = ref(null)
const titleText = ref(null)
const mapContainer = ref(null)
const statusWrapper = ref(null)
const operationsWrapper = ref(null)

onMounted(async () => {
  // 确保组件完全挂载后再执行动画
  await nextTick()

  // 设置标题动画
  if (titleText.value) {
    const titleSplit = new SplitText(titleText.value, { type: 'chars' })
    gsap.from(titleSplit.chars, {
      opacity: 0,
      y: 50,
      stagger: 0.05,
      duration: 0.8,
      ease: 'back.out(1.7)',
    })
  }

  // 设置说明文本动画
  if (splitTextContainer.value) {
    const splitTexts = splitTextContainer.value.querySelectorAll('.split-text')
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

  // 设置快速指令标题动画
  if (commandTitle.value) {
    const commandSplit = new SplitText(commandTitle.value, { type: 'chars' })
    gsap.from(commandSplit.chars, {
      opacity: 0,
      scale: 0,
      stagger: 0.05,
      duration: 0.6,
      ease: 'elastic.out(1, 0.3)',
      delay: 1,
    })
  }

  // 设置地图容器动画
  if (mapContainer.value) {
    gsap.from(mapContainer.value, {
      opacity: 0,
      y: 50,
      duration: 0.8,
      ease: 'power3.out',
    })
  }

  // 为指令项添加悬停效果
  document.querySelectorAll('.instruction-item').forEach((el) => {
    el.addEventListener('mouseenter', () => {
      gsap.to(el, {
        x: 8,
        duration: 0.3,
      })
    })

    el.addEventListener('mouseleave', () => {
      gsap.to(el, {
        x: 0,
        duration: 0.3,
      })
    })
  })

  // 为状态和操作包装器添加悬停效果
  const hoverableElements = [statusWrapper.value, operationsWrapper.value].filter(Boolean)

  hoverableElements.forEach((element) => {
    if (element) {
      element.addEventListener('mouseenter', () => {
        gsap.to(element, {
          y: -8,
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          duration: 0.3,
        })
      })

      element.addEventListener('mouseleave', () => {
        gsap.to(element, {
          y: 0,
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          duration: 0.3,
        })
      })
    }
  })

  // 配置ROS连接 - 使用try/catch来处理连接错误
  try {
    // 这里可以添加ROS连接的配置，如果需要的话
    console.log('ROS connection setup would go here')
    // 例如：
    // const ros = new ROSLIB.Ros({
    //   url: 'ws://localhost:9090' // 改用localhost或实际IP而不是0.0.0.0
    // })

    // ros.on('connection', () => {
    //   console.log('Connected to ROS bridge server')
    // })

    // ros.on('error', (error) => {
    //   console.error('Error connecting to ROS bridge server:', error)
    // })

    // ros.on('close', () => {
    //   console.log('Connection to ROS bridge server closed')
    // })
  } catch (error) {
    console.error('Failed to initialize ROS connection:', error)
  }
})
</script>

<style scoped>
.header-title {
  transition: all 0.3s ease;
  overflow: hidden;
  position: relative;
}

.header-title::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transform: translateX(-100%);
}

.header-title:hover::before {
  animation: shimmer 2s infinite;
}

.title-icon {
  transition: transform 0.3s ease;
}

.header-title:hover .title-icon {
  transform: rotate(360deg);
}

.command-title {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--v-primary-base);
  padding: 0.5rem;
  border-bottom: 2px solid var(--v-secondary-base);
  margin-bottom: 1rem;
}

.instruction-item {
  transition: transform 0.3s ease;
}

.status-wrapper,
.operations-wrapper {
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
  border-radius: 0.75rem;
  overflow: hidden;
}

@keyframes shimmer {
  100% {
    transform: translateX(100%);
  }
}
</style>
