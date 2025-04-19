<template>
  <div>
    <v-menu
      v-model="menu"
      :close-on-content-click="false"
      location="end"
      transition="scale-transition"
      offset="10"
    >
      <template v-slot:activator="{ props }">
        <v-btn icon v-bind="props" variant="text" size="small">
          <v-icon>mdi-cog</v-icon>
        </v-btn>
      </template>

      <v-card class="pa-4 rounded-lg" elevation="1" max-width="300">
        <v-form @submit.prevent="emitRefresh">
          <v-card-title class="px-0 text-subtitle-1 font-weight-medium">
            预测模型参数
          </v-card-title>

          <div class="mt-2">
            <v-text-field
              v-model="localStore"
              label="Store"
              type="number"
              variant="outlined"
              density="compact"
              hide-details
              class="mb-3"
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
              class="mb-3"
              :rules="[
                (v) => !!v || '请输入Item值',
                (v) => Number.isInteger(Number(v)) || 'Item必须是整数',
              ]"
            ></v-text-field>
          </div>

          <div class="d-flex justify-end">
            <v-btn
              color="primary"
              type="submit"
              size="small"
              variant="elevated"
              prepend-icon="mdi-refresh"
            >
              刷新
            </v-btn>
          </div>
        </v-form>
      </v-card>
    </v-menu>
  </div>
</template>

<script>
export default {
  name: 'TimeSeriesForm',

  props: {
    initialStore: {
      type: Number,
      default: 1,
    },
    initialItem: {
      type: Number,
      default: 1,
    },
  },

  data() {
    return {
      localStore: this.initialStore,
      localItem: this.initialItem,
      menu: false,
    }
  },

  methods: {
    emitRefresh() {
      //
      const store = parseInt(this.localStore, 10)
      const item = parseInt(this.localItem, 10)

      if (!isNaN(store) && !isNaN(item)) {
        // 触发事件，把参数发送给父组件
        this.$emit('refresh-data', { store, item })
        this.menu = false // 提交后关闭菜单
      }
    },
  },
}
</script>
