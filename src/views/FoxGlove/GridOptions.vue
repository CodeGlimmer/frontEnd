<script setup lang="ts">
import { Eye, EyeOff } from 'lucide-vue-next'
import { useThemeStore } from '@/stores'

interface Props {
  name: string
  show: boolean
  modelValue: {
    color: string
    cellSize: number
    numCells: number
    frameId?: string
  }
  index: number
  fixedFrames: string[]
  fixedFrame: string
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
    :key="`grid_${index}`"
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
      <a-form-item label="Reference Frame">
        <a-select
          :model-value="modelValue.frameId ?? fixedFrame"
          @change="(v) => $emit('update:modelValue', { ...props.modelValue, frameId: v })"
        >
          <a-option v-for="frame in fixedFrames" :key="frame" :value="frame">
            {{ frame }}
          </a-option>
        </a-select>
      </a-form-item>
      <a-form-item label="Plane Cell Count">
        <a-input-number
          :model-value="modelValue.numCells"
          :min="1"
          @change="(v) => $emit('update:modelValue', { ...props.modelValue, numCells: v })"
        />
      </a-form-item>
      <a-form-item label="Cell Size">
        <a-input-number
          :model-value="modelValue.cellSize"
          :min="1"
          @change="(v) => $emit('update:modelValue', { ...props.modelValue, cellSize: v })"
        />
      </a-form-item>
      <a-form-item label="Color">
        <a-color-picker
          :model-value="modelValue.color"
          format="hex"
          disabled-alpha
          @change="(v) => $emit('update:modelValue', { ...props.modelValue, color: v })"
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
