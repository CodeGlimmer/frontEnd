<template>
  <div class="time-series-toolbar">
    <v-card class="toolbar-card pa-3" elevation="1" rounded="lg">
      <div class="d-flex align-center flex-wrap tw-gap-6">
        <div class="text-subtitle-3 font-weight-medium mr-2">预测模型参数</div>

        <v-text-field
          v-model="localStore"
          label="Store"
          type="number"
          variant="outlined"
          density="compact"
          hide-details
          class="toolbar-field"
          bg-color="surface"
          :rules="[
            (v) => !!v || '请输入Store值',
            (v) => Number.isInteger(Number(v)) || 'Store必须是整数',
          ]"
        ></v-text-field>

        <v-text-field
          v-model="localItem"
          label="Item"
          type="number"
          variant="outlined"
          density="compact"
          hide-details
          class="toolbar-field"
          bg-color="surface"
          :rules="[
            (v) => !!v || '请输入Item值',
            (v) => Number.isInteger(Number(v)) || 'Item必须是整数',
          ]"
        ></v-text-field>
        <v-spacer></v-spacer>
        <v-btn
          color="primary"
          @click="emitRefresh"
          size="large"
          density="comfortable"
          variant="elevated"
          prepend-icon="mdi-refresh"
          class="refresh-btn ml-2"
          :loading="loading"
          :disabled="loading"
        >
          刷新
          <template v-slot:loader>
            <v-progress-circular indeterminate size="24"></v-progress-circular>
          </template>
        </v-btn>
      </div>
    </v-card>
  </div>
</template>

<script>
export default {
  name: 'TimeSeriesToolbar',

  props: {
    initialStore: {
      type: Number,
      default: 1,
    },
    initialItem: {
      type: Number,
      default: 1,
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      localStore: this.initialStore,
      localItem: this.initialItem,
    }
  },

  methods: {
    emitRefresh() {
      const store = parseInt(this.localStore, 10)
      const item = parseInt(this.localItem, 10)

      if (!isNaN(store) && !isNaN(item)) {
        console.log('刷新了')
        // 触发事件，把参数发送给父组件
        this.$emit('refresh-data', { store, item })
      }
    },
  },

  // watch: {
  //   // 同步外部属性变化
  //   initialStore(newVal) {
  //     this.localStore = newVal
  //   },
  //   initialItem(newVal) {
  //     this.localItem = newVal
  //   },
  // },
}
</script>

<style scoped>
.time-series-toolbar {
  margin-bottom: 16px;
}

.toolbar-card {
  transition: box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: thin solid rgba(var(--v-theme-on-surface), 0.08);
}

.toolbar-card:hover {
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.12);
}

.toolbar-field {
  min-width: 110px;
  max-width: 180px;
  flex-grow: 1;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.refresh-btn {
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.refresh-btn:hover {
  transform: scale(1.03);
}

@media (max-width: 600px) {
  .d-flex {
    flex-direction: column;
    align-items: stretch;
  }

  .toolbar-field {
    max-width: 100%;
    margin-bottom: 8px;
  }

  .refresh-btn {
    align-self: flex-end;
  }
}
</style>
