<script setup lang="ts">
import { Channel } from '@foxglove/ws-protocol'
import { Eye, EyeOff } from 'lucide-vue-next'
import { useThemeStore } from '@/stores'

interface Props {
  show: boolean
  topics: Record<string, Channel>
  name: string
  modelValue: {
    color: string
    topic: string
    linewidth: number
  }
  index: number
}

const props = defineProps<Props>()

defineEmits<{
  (event: 'update:modelValue', value: any): void
  (event: 'update:show', value: boolean): void
}>()

// 主题状态管理
const themeStore = useThemeStore()
const { isDarkMode } = themeStore
</script>

<template>
  <a-collapse-item
    :header="name"
    :key="`path_${index}`"
    :class="{ 'dark-collapse-item': isDarkMode }"
  >
    <template #extra>
      <a-button
        type="text"
        size="mini"
        @click.stop="() => $emit('update:show', !show)"
        :class="{ 'dark-text-btn': isDarkMode }"
      >
        <template #icon>
          <Eye :size="16" v-if="show" />
          <EyeOff :size="16" v-else />
        </template>
      </a-button>
    </template>
    <a-form :model="modelValue" auto-label-width :class="{ 'dark-form': isDarkMode }">
      <a-form-item label="Topic">
        <a-select
          disabled
          :trigger-props="{ autoFitPopupMinWidth: true }"
          :model-value="modelValue.topic"
          @change="(v) => $emit('update:modelValue', { ...props.modelValue, topic: v })"
        >
          <template
            v-for="item in Object.values(topics).filter(
              (channel) =>
                channel.schemaName === 'nav_msgs/Path' ||
                channel.schemaName === 'nav_msgs/msg/Path',
            )"
          >
            <a-option :value="item.topic">{{ item.topic }}</a-option>
          </template>
        </a-select>
      </a-form-item>
      <a-form-item label="Color">
        <a-color-picker
          :model-value="modelValue.color"
          format="hex"
          disabled-alpha
          @change="(v) => $emit('update:modelValue', { ...props.modelValue, color: v })"
        />
      </a-form-item>
      <a-form-item label="Line Width">
        <a-input-number
          :model-value="modelValue.linewidth"
          :min="1"
          :step="1"
          :max="100"
          @change="
            (v) =>
              $emit('update:modelValue', {
                ...props.modelValue,
                linewidth: v,
              })
          "
        />
      </a-form-item>
    </a-form>
  </a-collapse-item>
</template>

<style scoped>
/* 暗色模式样式 */
.dark-collapse-item :deep(.arco-collapse-item-header) {
  background-color: #1f2937;
  color: #f9fafb;
  border-bottom: 1px solid #374151;
}

.dark-collapse-item :deep(.arco-collapse-item-content) {
  background-color: #1f2937;
  color: #f9fafb;
}

.dark-text-btn {
  color: #f9fafb !important;
}

.dark-text-btn:hover {
  background-color: #374151 !important;
}

.dark-form :deep(.arco-form-item-label) {
  color: #f9fafb;
}

.dark-form :deep(.arco-select-view-single) {
  background-color: #374151;
  border-color: #4b5563;
  color: #f9fafb;
}

.dark-form :deep(.arco-input-number) {
  background-color: #374151;
  border-color: #4b5563;
}

.dark-form :deep(.arco-input-number .arco-input) {
  background-color: transparent;
  color: #f9fafb;
}

.dark-form :deep(.arco-color-picker-trigger) {
  background-color: #374151;
  border-color: #4b5563;
}
</style>
