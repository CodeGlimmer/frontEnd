<template>
  <div class="tw:grid tw:grid-cols-12 tw:gap-2">
    <!-- ROS URL 输入表单 -->
    <div
      class="tw:!col-span-12 tw:!motion-translate-x-in-[-85%] tw:!motion-translate-y-in-[-65%] tw:!motion-blur-in-[30px] tw:!motion-ease-spring-bouncier tw:!motion-delay-50"
    >
      <div
        class="ros-form-container tw:bg-white tw:dark:bg-m-grey-darken4 tw:rounded-xl tw:shadow-m-elevation-8 tw:mx-2.5 tw:overflow-hidden"
        :class="{ collapsed: !isFormExpanded }"
      >
        <!-- 折叠按钮 -->
        <div
          class="collapse-header tw:!px-6 tw:!py-2 tw:flex tw:items-center tw:justify-between tw:cursor-pointer"
          @click="toggleForm"
        >
          <div class="tw:flex tw:!items-center tw:gap-3">
            <div
              class="collapse-icon tw:!w-6 tw:!h-6 tw:flex tw:items-center tw:justify-center tw:rounded-full tw:bg-blue-100 tw:dark:bg-blue-900 tw:text-blue-600 tw:dark:text-blue-400"
            >
              <svg
                class="tw:w-4 tw:h-4 tw:transition-transform tw:duration-300"
                :class="{ 'tw:rotate-180': !isFormExpanded }"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 9l-7 7-7-7"
                ></path>
              </svg>
            </div>
            <span class="tw:text-base tw:font-medium tw:text-gray-700 tw:dark:text-gray-200">
              ROS 连接配置
            </span>
          </div>
        </div>

        <!-- 表单内容 -->
        <div class="form-content" :class="{ expanded: isFormExpanded }">
          <div class="tw:!px-6 tw:!pb-2">
            <div class="tw:flex tw:items-center tw:gap-6">
              <label
                class="form-label tw:text-base tw:font-medium tw:text-gray-700 tw:dark:text-gray-200 tw:whitespace-nowrap"
              >
                ROS URL:
              </label>
              <div class="tw:!flex-1 tw:!flex tw:!gap-4">
                <div class="input-wrapper tw:flex-1 tw:relative">
                  <input
                    v-model="inputUrl"
                    type="text"
                    placeholder="请输入ROS服务器地址"
                    class="ros-input tw:w-full tw:px-4 tw:py-3 tw:text-base tw:border tw:border-gray-300 tw:dark:border-gray-600 tw:rounded-lg tw:bg-white tw:dark:bg-gray-800 tw:text-gray-900 tw:dark:text-gray-100 tw:placeholder-gray-500 tw:dark:placeholder-gray-400"
                  />
                  <div class="input-ripple"></div>
                </div>
                <button
                  @click="connectRos"
                  :disabled="!inputUrl.trim()"
                  class="connect-button tw:px-6 tw:py-3 tw:text-base tw:font-medium tw:text-white tw:bg-blue-600 tw:rounded-lg tw:relative tw:overflow-hidden"
                >
                  <span class="button-text">连接</span>
                  <div class="button-ripple"></div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div
      class="tw:col-span-12 tw:motion-translate-x-in-[-85%] tw:motion-translate-y-in-[-65%] tw:motion-blur-in-[30px] tw:motion-ease-spring-bouncier"
    >
      <WorkingStatus />
    </div>
    <div
      class="tw:col-span-12 tw:md:col-span-8 tw:dark:bg-m-grey-darken4 tw:bg-white tw:rounded-xl tw:border-m-success-dark tw:border-l-4 tw:!ml-2.5 tw:flex tw:justify-center tw:items-center tw:motion-translate-x-in-[-85%] tw:motion-translate-y-in-[-65%] tw:motion-blur-in-[30px] tw:motion-ease-spring-bouncier tw:motion-delay-100 tw:shadow-m-elevation-12"
    >
      <RosViewCard
        class="tw:w-full tw:!mx-4 tw:hover:!shadow-m-elevation-24 tw:hover:-translate-y-2 tw:transition-transform tw:duration-200 tw:ease-in-out"
        :wsUrl="rosUrl"
      />
    </div>
    <div
      class="tw:col-span-12 tw:md:col-span-4 tw:!mx-2.5 tw:!p-2 tw:!md:mx-1 tw:motion-translate-x-in-[-85%] tw:motion-translate-y-in-[-65%] tw:motion-blur-in-[30px] tw:motion-ease-spring-bouncier tw:motion-delay-200 tw:!flex tw:!items-center tw:!justify-center tw:shadow-m-elevation-8 tw:rounded-xl tw:dark:bg-m-grey-darken4"
    >
      <VelocityShow
        class="tw:hover:-translate-y-2 tw:hover:!shadow-m-elevation-12 tw:ease-in-out tw:!transition-all tw:duration-500 border-thin tw:hover:!bg-m-grey-lighten3 tw:dark:hover:!bg-m-grey-darken3 tw:!w-full"
        :rosbridgeUrl="rosUrl"
      />
    </div>
    <div
      class="tw:col-span-12 tw:md:col-span-3 tw:motion-translate-x-in-[-85%] tw:motion-translate-y-in-[-65%] tw:motion-blur-in-[30px] tw:motion-ease-spring-bouncier tw:motion-delay-300 elevation-8 pa-2 tw:rounded-xl tw:!mx-2 tw:dark:!bg-m-grey-darken4"
    >
      <SendingOperations :rosUrl />
    </div>
    <div
      class="tw:col-span-12 tw:md:col-span-9 tw:md:!ml-2 tw:rounded-xl tw:!mr-2.5 tw:motion-translate-x-in-[-85%] tw:motion-translate-y-in-[-65%] tw:motion-blur-in-[30px] tw:motion-ease-spring-bouncier tw:motion-delay-500 tw:flex tw:justify-center tw:items-center"
    >
      <QuickCommands
        class="tw:!mx-2 tw:!my-2 tw:!p-2 tw:!md:mx-1 tw:w-full tw:motion-translate-x-in-[-85%] tw:motion-translate-y-in-[-65%] tw:motion-blur-in-[30px] tw:motion-ease-spring-bouncier tw:motion-delay-500 tw:hover:!shadow-m-elevation-12 tw:hover:!-translate-y-2 tw:!transition-transform tw:!duration-200 tw:!ease-in-out"
      />
    </div>

</template>

<script setup>
import { ref, onMounted } from 'vue'
import QuickCommands from './QuickCommands.vue'
import SendingOperations from './SendingOperations.vue'
import VelocityShow from './VelocityShow.vue'
import WorkingStatus from './WorkingStatus.vue'
import RosViewCard from '../AgvMonitoring/RosViewCard.vue'

// localStorage 键名
const ROS_URL_STORAGE_KEY = 'ros_url'

// ROS URL 相关变量
const inputUrl = ref('')
const rosUrl = ref('')
const isFormExpanded = ref(false)

// 从 localStorage 加载 ROS URL
const loadRosUrlFromStorage = () => {
  try {
    const savedUrl = localStorage.getItem(ROS_URL_STORAGE_KEY)
    if (savedUrl) {
      inputUrl.value = savedUrl
      rosUrl.value = savedUrl
      console.log('从本地存储加载 ROS URL:', savedUrl)
    }
  } catch (error) {
    console.error('加载 ROS URL 失败:', error)
  }
}

// 保存 ROS URL 到 localStorage
const saveRosUrlToStorage = (url) => {
  try {
    localStorage.setItem(ROS_URL_STORAGE_KEY, url)
    console.log('ROS URL 已保存到本地存储:', url)
  } catch (error) {
    console.error('保存 ROS URL 失败:', error)
  }
}

// 切换表单展开/收起
const toggleForm = () => {
  isFormExpanded.value = !isFormExpanded.value
}

// 连接ROS的方法
const connectRos = () => {
  const url = inputUrl.value.trim()
  if (url) {
    rosUrl.value = url
    saveRosUrlToStorage(url)
    console.log('连接ROS:', url)
  }
}

// 组件挂载时加载存储的 URL
onMounted(() => {
  loadRosUrlFromStorage()
})
</script>

<style lang="scss" scoped>
.ros-form-container {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.ros-form-container.collapsed {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.ros-form-container:not(.collapsed) {
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.collapse-header {
  position: relative;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-bottom: 1px solid transparent;
}

.ros-form-container:not(.collapsed) .collapse-header {
  border-bottom-color: rgba(0, 0, 0, 0.1);
}

.ros-form-container.collapsed .collapse-header:hover {
  background-color: rgba(0, 0, 0, 0.02);
}

.dark .ros-form-container.collapsed .collapse-header:hover {
  background-color: rgba(255, 255, 255, 0.02);
}

.dark .ros-form-container:not(.collapsed) .collapse-header {
  border-bottom-color: rgba(255, 255, 255, 0.1);
}

.collapse-icon {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.collapse-header:hover .collapse-icon {
  transform: scale(1.1);
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}

.status-indicator {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: 0.7;
}

.collapse-header:hover .status-indicator {
  opacity: 1;
}

.form-content {
  max-height: 0;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: 0;
  transform: translateY(-20px);
}

.form-content.expanded {
  max-height: 200px;
  opacity: 1;
  transform: translateY(0);
}

.form-label {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.form-label::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  width: 0;
  height: 2px;
  background: linear-gradient(90deg, #2196f3, #21cbf3);
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.form-content.expanded:hover .form-label::after {
  width: 100%;
}

.input-wrapper {
  position: relative;
}

.ros-input {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  z-index: 1;
}

.ros-input:focus {
  outline: none;
  border-color: #2196f3;
  box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.12);
  transform: scale(1.02);
}

.input-ripple {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(33, 150, 243, 0.3) 0%, rgba(33, 150, 243, 0) 70%);
  transform: translate(-50%, -50%);
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  pointer-events: none;
  z-index: 0;
}

.ros-input:focus + .input-ripple {
  width: 300px;
  height: 300px;
  animation: ripple-pulse 1.5s infinite;
}

@keyframes ripple-pulse {
  0%,
  100% {
    opacity: 0.3;
    transform: translate(-50%, -50%) scale(1);
  }
  50% {
    opacity: 0.1;
    transform: translate(-50%, -50%) scale(1.1);
  }
}

.connect-button {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.connect-button:not(:disabled):hover {
  background-color: #1976d2;
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 6px 20px rgba(25, 118, 210, 0.4);
}

.connect-button:not(:disabled):active {
  transform: translateY(0) scale(0.98);
  box-shadow: 0 2px 8px rgba(25, 118, 210, 0.3);
}

.connect-button:disabled {
  background-color: #9e9e9e;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.button-text {
  position: relative;
  z-index: 2;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.connect-button:not(:disabled):hover .button-text {
  transform: translateY(-1px);
}

.button-ripple {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transform: translate(-50%, -50%);
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1;
}

.connect-button:not(:disabled):active .button-ripple {
  width: 200px;
  height: 200px;
  opacity: 0;
}

/* 暗色模式适配 */
.dark .ros-form-container::before {
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.05), transparent);
}

.dark .ros-form-container:hover {
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
}

.dark .input-ripple {
  background: radial-gradient(circle, rgba(33, 150, 243, 0.2) 0%, rgba(33, 150, 243, 0) 70%);
}

/* 加载动画 */
@keyframes form-load {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.ros-form-container {
  animation: form-load 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 响应式适配 */
@media (max-width: 768px) {
  .form-content.expanded {
    max-height: 300px;
  }

  .collapse-header {
    padding: 1rem;
  }

  .form-content .tw\\:px-6 {
    padding-left: 1rem;
    padding-right: 1rem;
  }

  .form-content .tw\\:flex {
    flex-direction: column;
    gap: 1rem;
  }

  .form-label {
    text-align: center;
  }
}
</style>
