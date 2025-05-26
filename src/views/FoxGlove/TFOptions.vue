<script setup lang="ts">
import { Eye, EyeOff } from 'lucide-vue-next'
import { useThemeStore } from '@/stores'

type TFTreeNode = {
  key: string
  title: string
  value: string
  children: TFTreeNode[]
}

interface Props {
  name: string
  show: boolean
  modelValue: {
    lineColor: string
    showLines: boolean
    showLabels: boolean
    frameVisible?: Record<string, boolean>
  }
  index: number
  fixedFrames: string[]
  fixedFrame: string
  tfTree: TFTreeNode[]
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
    :key="`axes_${index}`"
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
      <a-form-item label="Line Color">
        <a-color-picker
          :model-value="modelValue.lineColor"
          format="hex"
          disabled-alpha
          @change="(v) => $emit('update:modelValue', { ...props.modelValue, lineColor: v })"
        />
      </a-form-item>
      <a-form-item label="Show Line">
        <a-switch
          :model-value="modelValue.showLines"
          @change="(v) => $emit('update:modelValue', { ...props.modelValue, showLines: v })"
        />
      </a-form-item>
      <a-form-item label="Show Label">
        <a-switch
          :model-value="modelValue.showLabels"
          @change="(v) => $emit('update:modelValue', { ...props.modelValue, showLabels: v })"
        />
      </a-form-item>

      <a-form-item :label="item" v-for="item in fixedFrames" :key="item">
        <a-switch
          :model-value="modelValue.frameVisible[item]"
          :default-checked="true"
          @change="
            (v) =>
              $emit('update:modelValue', {
                ...props.modelValue,
                frameVisible: {
                  ...props.modelValue.frameVisible,
                  [item]: v,
                },
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

.dark-form :deep(.arco-color-picker-trigger) {
  background-color: #374151;
  border-color: #4b5563;
}

.dark-form :deep(.arco-switch) {
  background-color: #4b5563;
}

.dark-form :deep(.arco-switch-checked) {
  background-color: #3b82f6;
}
</style>
