<template>
  <v-container fluid class="order-management pa-0">
    <!-- 固定的顶部卡片 -->
    <div class="header-fixed tw:!bg-white/0 tw:!rounded-xl">
      <v-card class="mb-4 elevation-2">
        <v-card-title class="text-h4 d-flex align-center py-4">
          <v-icon icon="mdi-clipboard-text-outline" size="x-large" class="mr-2" />
          订单管理系统
          <v-spacer></v-spacer>
          <v-btn
            prepend-icon="mdi-refresh"
            color="primary"
            @click="refreshData"
            :loading="loading"
            variant="tonal"
            v-if="!$vuetify.display.smAndDown"
          >
            刷新数据
          </v-btn>
        </v-card-title>

        <v-card-text>
          <!-- 操作栏 -->
          <v-row>
            <!-- 搜索栏 -->
            <v-col cols="12" sm="6" md="4">
              <v-text-field
                v-model="search"
                label="搜索订单"
                prepend-inner-icon="mdi-magnify"
                variant="outlined"
                density="comfortable"
                hide-details
                clearable
                @keyup.enter="handleSearch"
              ></v-text-field>
            </v-col>

            <!-- 过滤器 -->
            <v-col cols="12" sm="6" md="3">
              <v-select
                v-model="selectedProductType"
                :items="productTypes"
                label="产品类型"
                prepend-inner-icon="mdi-filter-variant"
                variant="outlined"
                density="comfortable"
                hide-details
                clearable
              ></v-select>
            </v-col>

            <!-- 排序选择 -->
            <v-col cols="12" sm="6" md="3">
              <v-select
                v-model="sortOption"
                :items="sortOptions"
                label="排序方式"
                prepend-inner-icon="mdi-sort"
                variant="outlined"
                density="comfortable"
                hide-details
              ></v-select>
            </v-col>

            <!-- 添加按钮 -->
            <v-col cols="12" sm="6" md="2" class="d-flex justify-end">
              <v-btn
                prepend-icon="mdi-refresh"
                color="primary"
                @click="refreshData"
                :loading="loading"
                variant="tonal"
                class="tw:relative tw:top-1 border-md border-info pa-lg-5"
                size="large"
                v-if="$vuetify.display.smAndDown"
              >
                刷新数据
              </v-btn>
              <v-spacer></v-spacer>
              <v-btn
                color="success"
                prepend-icon="mdi-plus"
                @click="openAddDialog"
                class="mt-1"
                size="large"
              >
                添加订单
              </v-btn>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </div>

    <!-- 可滚动的表格数据 -->
    <div class="scroll-body">
      <v-card class="elevation-2">
        <v-card-text class="pa-0">
          <v-data-table-server
            v-model:items-per-page="itemsPerPage"
            :headers="headers"
            :items-length="filteredItems.length"
            :items="paginatedItems"
            :loading="loading"
            :search="search"
            class="elevation-0"
            item-value="order_id"
            hide-default-footer
          >
            <!-- 表头自定义 -->
            <template v-slot:headers="{ columns }">
              <tr>
                <th
                  v-for="column in columns"
                  :key="column.key"
                  :style="{
                    width: column.width,
                    minWidth: column.width,
                    maxWidth: column.maxWidth,
                  }"
                  class="text-primary font-weight-black"
                >
                  {{ column.title }}
                </th>
                <th class="text-primary font-weight-black text-center">操作</th>
              </tr>
            </template>

            <!-- 表格行自定义 -->
            <template v-slot:item="{ item }">
              <tr
                :class="getRowClass(item)"
                class="tw:hover:shadow-m-elevation-8 tw:hover:scale-[1.01] tw:ease-in tw:duration-300"
              >
                <td>{{ item.order_id }}</td>
                <td>
                  <v-chip
                    :color="getProductTypeColor(item.product_type)"
                    size="small"
                    variant="elevated"
                    class="font-weight-medium"
                  >
                    {{ item.product_type }}
                  </v-chip>
                </td>
                <td class="text-body-1">{{ item.order_quantity }}</td>
                <td class="text-body-1">{{ formatDate(item.order_date) }}</td>
                <td>
                  <v-chip
                    :color="getPriorityColor(item.priority)"
                    size="small"
                    variant="elevated"
                    class="font-weight-medium"
                  >
                    {{ getPriorityLabel(item.priority) }}
                  </v-chip>
                </td>
                <td class="text-center">
                  <v-btn
                    icon
                    variant="text"
                    color="info"
                    density="comfortable"
                    class="mr-1"
                    @click="viewOrderDetails(item)"
                  >
                    <v-icon>mdi-eye</v-icon>
                    <v-tooltip activator="parent" location="top">查看详情</v-tooltip>
                  </v-btn>
                  <v-btn
                    icon
                    variant="text"
                    color="warning"
                    density="comfortable"
                    class="mr-1"
                    @click="editOrder(item)"
                  >
                    <v-icon>mdi-pencil</v-icon>
                    <v-tooltip activator="parent" location="top">编辑订单</v-tooltip>
                  </v-btn>
                  <v-btn
                    icon
                    variant="text"
                    color="error"
                    density="comfortable"
                    @click="confirmDelete(item)"
                  >
                    <v-icon>mdi-delete</v-icon>
                    <v-tooltip activator="parent" location="top">删除订单</v-tooltip>
                  </v-btn>
                </td>
              </tr>
            </template>

            <!-- 无数据显示 -->
            <template v-slot:no-data>
              <div class="d-flex flex-column align-center py-6">
                <v-icon icon="mdi-database-off" size="64" color="grey" class="mb-4"></v-icon>
                <span class="text-subtitle-1">暂无订单数据</span>
                <v-btn
                  prepend-icon="mdi-plus"
                  color="primary"
                  class="mt-4"
                  variant="tonal"
                  @click="openAddDialog"
                >
                  添加第一个订单
                </v-btn>
              </div>
            </template>

            <!-- 加载中状态 -->
            <template v-slot:loading>
              <div class="d-flex flex-column align-center py-6">
                <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
                <span class="text-subtitle-1 mt-4">正在加载订单数据...</span>
              </div>
            </template>
          </v-data-table-server>

          <!-- 分页控制 -->
          <div class="d-flex justify-center align-center pa-4">
            <v-pagination
              v-model="page"
              :length="Math.ceil(filteredItems.length / itemsPerPage)"
              :total-visible="7"
              rounded="circle"
            ></v-pagination>
            <v-spacer></v-spacer>
            <v-select
              v-model="itemsPerPage"
              :items="[5, 10, 15, 20, 50]"
              label="每页显示"
              variant="outlined"
              density="compact"
              hide-details
              class="items-per-page-select"
              style="width: 120px"
            ></v-select>
          </div>
        </v-card-text>
      </v-card>

      <!-- 订单统计卡片 -->
      <v-row class="mt-4">
        <v-col cols="12" md="4" @click="$router.push('/index/ordermanagement/charts')" v-ripple>
          <v-card class="elevation-2">
            <v-card-title class="d-flex align-center">
              <v-icon icon="mdi-chart-box" size="large" color="primary" class="mr-2"></v-icon>
              订单统计
            </v-card-title>
            <v-card-text>
              <v-list>
                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon icon="mdi-clipboard-list" color="primary"></v-icon>
                  </template>
                  <v-list-item-title>总订单数: {{ show_list.length }}</v-list-item-title>
                </v-list-item>
                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon icon="mdi-alert" color="error"></v-icon>
                  </template>
                  <v-list-item-title>
                    紧急订单: {{ show_list.filter((order) => order.priority >= 8).length }}
                  </v-list-item-title>
                </v-list-item>
                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon icon="mdi-clipboard-check" color="success"></v-icon>
                  </template>
                  <v-list-item-title> 本月订单: {{ getMonthlyOrders().length }} </v-list-item-title>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" md="8">
          <v-card class="elevation-2">
            <v-card-title class="d-flex align-center">
              <v-icon icon="mdi-chart-pie" size="large" color="primary" class="mr-2"></v-icon>
              产品类型分布
            </v-card-title>
            <v-card-text>
              <div class="product-type-chips">
                <v-chip
                  v-for="(count, type) in productTypeCount"
                  :key="type"
                  :color="getProductTypeColor(type)"
                  class="ma-1"
                  variant="elevated"
                >
                  {{ type }}: {{ count }}
                </v-chip>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <!-- 添加订单对话框 -->
    <v-dialog v-model="addDialog" max-width="600px" persistent>
      <v-card>
        <v-card-title class="text-h5 d-flex align-center">
          <v-icon icon="mdi-plus-circle" color="success" class="mr-2"></v-icon>
          添加新订单
        </v-card-title>
        <v-card-text>
          <v-form ref="addForm">
            <v-row>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="newOrder.order_id"
                  label="订单ID"
                  variant="outlined"
                  type="number"
                  :rules="[rules.required]"
                  placeholder="请输入订单ID"
                  prepend-inner-icon="mdi-identifier"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-autocomplete
                  v-model="newOrder.product_type"
                  :items="
                    productTypes.length
                      ? productTypes
                      : ['电子产品', '家具', '食品', '服装', '图书']
                  "
                  label="产品类型"
                  variant="outlined"
                  :rules="[rules.required]"
                  placeholder="请选择产品类型"
                  prepend-inner-icon="mdi-tag"
                ></v-autocomplete>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="newOrder.order_quantity"
                  label="订单数量"
                  variant="outlined"
                  type="number"
                  :rules="[rules.required, rules.positiveNumber]"
                  placeholder="请输入订单数量"
                  prepend-inner-icon="mdi-numeric"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-menu
                  ref="orderDateMenu"
                  v-model="dateMenu"
                  :close-on-content-click="false"
                  transition="scale-transition"
                  offset-y
                >
                  <template v-slot:activator="{ props }">
                    <v-text-field
                      v-model="newOrder.order_date"
                      label="订单日期"
                      variant="outlined"
                      :rules="[rules.required]"
                      prepend-inner-icon="mdi-calendar"
                      v-bind="props"
                    ></v-text-field>
                  </template>
                  <!-- TODO：v-date-picker有点问题，点击会报错 -->
                  <!-- <v-date-picker
                        v-model="newOrder.order_date"
                        @update:model-value="dateMenu = false"
                      ></v-date-picker> -->
                </v-menu>
              </v-col>
              <v-col cols="12">
                <v-slider
                  v-model="newOrder.priority"
                  :min="1"
                  :max="10"
                  :step="1"
                  :ticks="priorityTicks"
                  thumb-label="always"
                  :track-color="getPrioritySliderColor"
                  :thumb-color="getPriorityThumbColor"
                  label="优先级"
                  color="success"
                  show-ticks="always"
                >
                  <template v-slot:prepend>
                    <v-icon color="success">mdi-flag-outline</v-icon>
                  </template>
                  <template v-slot:append>
                    <v-icon :color="getPriorityThumbColor">mdi-flag</v-icon>
                  </template>
                  <template v-slot:thumb-label="{ modelValue }">
                    {{ getPriorityLabel(modelValue) }}
                  </template>
                </v-slider>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="error" variant="text" @click="addDialog = false" prepend-icon="mdi-close">
            取消
          </v-btn>
          <v-btn
            color="success"
            variant="elevated"
            @click="submitAddOrder"
            prepend-icon="mdi-check"
          >
            确认添加
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 编辑订单对话框 -->
    <v-dialog v-model="editDialog" max-width="600px" persistent>
      <v-card>
        <v-card-title class="text-h5 d-flex align-center">
          <v-icon icon="mdi-pencil-circle" color="warning" class="mr-2"></v-icon>
          编辑订单信息
        </v-card-title>
        <v-card-text>
          <v-form ref="editForm">
            <v-row>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="editedOrder.order_id"
                  label="订单ID"
                  variant="outlined"
                  readonly
                  prepend-inner-icon="mdi-identifier"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-autocomplete
                  v-model="editedOrder.product_type"
                  :items="
                    productTypes.length
                      ? productTypes
                      : ['电子产品', '家具', '食品', '服装', '图书']
                  "
                  label="产品类型"
                  variant="outlined"
                  placeholder="请选择产品类型"
                  prepend-inner-icon="mdi-tag"
                ></v-autocomplete>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="editedOrder.order_quantity"
                  label="订单数量"
                  variant="outlined"
                  type="number"
                  :rules="[rules.positiveNumber]"
                  placeholder="请输入订单数量"
                  prepend-inner-icon="mdi-numeric"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-menu
                  v-model="editDateMenu"
                  :close-on-content-click="false"
                  transition="scale-transition"
                >
                  <template v-slot:activator="{ props }">
                    <v-text-field
                      v-model="editedOrder.order_date"
                      label="订单日期"
                      variant="outlined"
                      prepend-inner-icon="mdi-calendar"
                      v-bind="props"
                    ></v-text-field>
                  </template>
                  <!-- TODO：v-date-picker点击报错，这里直接禁用 -->
                  <!-- <v-date-picker
                        v-model="editedOrder.order_date"
                        @update:model-value="editDateMenu = false"
                      ></v-date-picker> -->
                </v-menu>
              </v-col>
              <v-col cols="12">
                <v-slider
                  v-model="editedOrder.priority"
                  :min="1"
                  :max="10"
                  :step="1"
                  :ticks="priorityTicks"
                  thumb-label="always"
                  :track-color="getEditPrioritySliderColor"
                  :thumb-color="getEditPriorityThumbColor"
                  label="优先级"
                  color="warning"
                  show-ticks="always"
                >
                  <template v-slot:prepend>
                    <v-icon color="warning">mdi-flag-outline</v-icon>
                  </template>
                  <template v-slot:append>
                    <v-icon :color="getEditPriorityThumbColor">mdi-flag</v-icon>
                  </template>
                  <template v-slot:thumb-label="{ modelValue }">
                    {{ getPriorityLabel(modelValue) }}
                  </template>
                </v-slider>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="error" variant="text" @click="editDialog = false" prepend-icon="mdi-close">
            取消
          </v-btn>
          <v-btn
            color="warning"
            variant="elevated"
            @click="submitEditOrder"
            prepend-icon="mdi-check"
          >
            保存修改
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 查看订单详情对话框 -->
    <v-dialog v-model="viewDialog" max-width="700px">
      <v-card>
        <v-card-title class="text-h5 d-flex align-center">
          <v-icon icon="mdi-clipboard-text" color="info" class="mr-2"></v-icon>
          订单详情
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pt-4">
          <v-row>
            <v-col cols="12" md="6">
              <v-list>
                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon color="primary">mdi-identifier</v-icon>
                  </template>
                  <v-list-item-title class="font-weight-bold">订单ID</v-list-item-title>
                  <v-list-item-subtitle>{{ viewedOrder.order_id }}</v-list-item-subtitle>
                </v-list-item>

                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon color="primary">mdi-tag</v-icon>
                  </template>
                  <v-list-item-title class="font-weight-bold">产品类型</v-list-item-title>
                  <v-list-item-subtitle>
                    <v-chip
                      :color="getProductTypeColor(viewedOrder.product_type)"
                      size="small"
                      variant="elevated"
                      class="font-weight-medium"
                    >
                      {{ viewedOrder.product_type }}
                    </v-chip>
                  </v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </v-col>

            <v-col cols="12" md="6">
              <v-list>
                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon color="primary">mdi-numeric</v-icon>
                  </template>
                  <v-list-item-title class="font-weight-bold">订单数量</v-list-item-title>
                  <v-list-item-subtitle>{{ viewedOrder.order_quantity }}</v-list-item-subtitle>
                </v-list-item>

                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon color="primary">mdi-calendar</v-icon>
                  </template>
                  <v-list-item-title class="font-weight-bold">订单日期</v-list-item-title>
                  <v-list-item-subtitle>{{
                    formatDate(viewedOrder.order_date)
                  }}</v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </v-col>
          </v-row>

          <v-row class="mt-2">
            <v-col cols="12">
              <div class="d-flex align-center">
                <v-icon color="primary" class="mr-2">mdi-flag</v-icon>
                <span class="font-weight-bold">优先级:</span>
                <v-chip
                  :color="getPriorityColor(viewedOrder.priority)"
                  size="small"
                  variant="elevated"
                  class="ml-2 font-weight-medium"
                >
                  {{ getPriorityLabel(viewedOrder.priority) }}
                </v-chip>
              </div>
              <v-progress-linear
                :model-value="viewedOrder.priority * 10"
                :color="getPriorityColor(viewedOrder.priority)"
                height="10"
                rounded
                class="mt-2"
              ></v-progress-linear>
            </v-col>
          </v-row>

          <v-row class="mt-4">
            <v-col cols="12">
              <v-card variant="outlined">
                <v-card-title class="d-flex align-center text-subtitle-1">
                  <v-icon icon="mdi-information-outline" color="info" class="mr-2"></v-icon>
                  系统信息
                </v-card-title>
                <v-card-text>
                  <p class="text-body-2 mb-1">
                    <span class="font-weight-medium">创建时间：</span>{{ getCurrentDateTime() }}
                  </p>
                  <p class="text-body-2">
                    <span class="font-weight-medium">最后更新：</span>{{ getCurrentDateTime() }}
                  </p>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="info"
            variant="text"
            @click="editOrder(viewedOrder)"
            prepend-icon="mdi-pencil"
          >
            编辑
          </v-btn>
          <v-btn
            color="error"
            variant="text"
            @click="confirmDelete(viewedOrder)"
            prepend-icon="mdi-delete"
          >
            删除
          </v-btn>
          <v-btn
            color="primary"
            variant="elevated"
            @click="viewDialog = false"
            prepend-icon="mdi-close"
          >
            关闭
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 删除确认对话框 -->
    <v-dialog v-model="deleteDialog" max-width="500px">
      <v-card>
        <v-card-title class="text-h5 d-flex align-center">
          <v-icon icon="mdi-alert-circle" color="error" class="mr-2"></v-icon>
          确认删除
        </v-card-title>
        <v-card-text>
          <p>您确定要删除以下订单吗？此操作无法撤销。</p>
          <v-divider class="my-3"></v-divider>
          <div class="d-flex align-center">
            <v-icon icon="mdi-identifier" color="primary" class="mr-2"></v-icon>
            <strong>订单ID：</strong>
            <span class="ml-2">{{ deleteItem?.order_id }}</span>
          </div>
          <div class="d-flex align-center mt-2">
            <v-icon icon="mdi-tag" color="primary" class="mr-2"></v-icon>
            <strong>产品类型：</strong>
            <v-chip
              :color="getProductTypeColor(deleteItem?.product_type)"
              size="small"
              variant="elevated"
              class="ml-2 font-weight-medium"
            >
              {{ deleteItem?.product_type }}
            </v-chip>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            variant="text"
            @click="deleteDialog = false"
            prepend-icon="mdi-close"
          >
            取消
          </v-btn>
          <v-btn
            color="error"
            variant="elevated"
            @click="deleteOrder"
            prepend-icon="mdi-delete"
            :loading="deleteLoading"
          >
            确认删除
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 操作结果提示消息 -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="snackbar.timeout"
      location="top"
    >
      <div class="d-flex align-center">
        <v-icon :icon="snackbar.icon" class="mr-2"></v-icon>
        {{ snackbar.text }}
      </div>
      <template v-slot:actions>
        <v-btn variant="text" @click="snackbar.show = false">关闭</v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useOrder } from '@/stores/order'
import { storeToRefs } from 'pinia'
import { OrderManagement } from '@/services'

// 获取订单存储
const orderStore = useOrder()
const { show_list } = storeToRefs(orderStore)

// 表格相关
const loading = ref(false)
const search = ref('')
const page = ref(1)
const itemsPerPage = ref(10)
const selectedProductType = ref(null)
const sortOption = ref('default')

// 对话框控制
const addDialog = ref(false)
const editDialog = ref(false)
const viewDialog = ref(false)
const deleteDialog = ref(false)
const dateMenu = ref(false)
const editDateMenu = ref(false)

// 订单操作相关
const newOrder = ref({
  order_id: '',
  product_type: '',
  order_quantity: '',
  order_date: new Date().toISOString().substr(0, 10),
  priority: 5,
})

const editedOrder = ref({
  order_id: '',
  product_type: '',
  order_quantity: '',
  order_date: '',
  priority: 5,
})

const viewedOrder = ref({
  order_id: '',
  product_type: '',
  order_quantity: '',
  order_date: '',
  priority: 5,
})

const deleteItem = ref(null)
const deleteLoading = ref(false)

// 消息提示
const snackbar = ref({
  show: false,
  text: '',
  color: 'success',
  timeout: 3000,
  icon: 'mdi-check-circle',
})

// 表单验证规则
const rules = {
  required: (value) => !!value || '此字段为必填项',
  positiveNumber: (value) => !value || Number(value) > 0 || '请输入大于0的数值',
}

// 优先级滑块配置
const priorityTicks = {
  1: '低',
  5: '中',
  10: '高',
}

// 表格头部配置
const headers = [
  {
    title: '订单ID',
    key: 'order_id',
    align: 'start',
    sortable: true,
    width: '15%',
  },
  {
    title: '产品类型',
    key: 'product_type',
    align: 'start',
    sortable: true,
    width: '20%',
  },
  {
    title: '订单数量',
    key: 'order_quantity',
    align: 'start',
    sortable: true,
    width: '15%',
  },
  {
    title: '订单日期',
    key: 'order_date',
    align: 'start',
    sortable: true,
    width: '25%',
  },
  {
    title: '优先级',
    key: 'priority',
    align: 'start',
    sortable: true,
    width: '10%',
  },
]

// 排序选项
const sortOptions = [
  { title: '默认排序', value: 'default' },
  { title: '订单ID (升序)', value: 'id_asc' },
  { title: '订单ID (降序)', value: 'id_desc' },
  { title: '日期 (最新优先)', value: 'date_desc' },
  { title: '日期 (最旧优先)', value: 'date_asc' },
  { title: '优先级 (高到低)', value: 'priority_desc' },
  { title: '优先级 (低到高)', value: 'priority_asc' },
]

// 获取产品类型列表
const productTypes = computed(() => {
  const types = new Set(show_list.value.map((order) => order.product_type))
  return Array.from(types)
})

// 计算产品类型分布
const productTypeCount = computed(() => {
  const counts = {}
  show_list.value.forEach((order) => {
    if (!counts[order.product_type]) {
      counts[order.product_type] = 0
    }
    counts[order.product_type]++
  })
  return counts
})

// 过滤和排序后的列表
const filteredItems = computed(() => {
  let result = [...show_list.value]

  // 产品类型过滤
  if (selectedProductType.value) {
    result = result.filter((order) => order.product_type === selectedProductType.value)
  }

  // 根据选择的排序方式排序
  switch (sortOption.value) {
    case 'id_asc':
      result.sort((a, b) =>
        String(a.order_id).localeCompare(String(b.order_id), undefined, { numeric: true }),
      )
      break
    case 'id_desc':
      result.sort((a, b) =>
        String(b.order_id).localeCompare(String(a.order_id), undefined, { numeric: true }),
      )
      break
    case 'date_desc':
      result.sort((a, b) => new Date(b.order_date) - new Date(a.order_date))
      break
    case 'date_asc':
      result.sort((a, b) => new Date(a.order_date) - new Date(b.order_date))
      break
    case 'priority_desc':
      result.sort((a, b) => b.priority - a.priority)
      break
    case 'priority_asc':
      result.sort((a, b) => a.priority - b.priority)
      break
    case 'default':
    default:
      // 使用默认排序
      break
  }

  return result
})

// 处理search
const handleSearch = async () => {
  // 处理空指令，所有的order均满足, 那么刷新一次
  if (search.value === '') {
    await orderStore.update_data()
  } else {
    //处理非空字段，对一个对象查询如果他有任何一项满足都会别添加到showlist中，需要结合store完成
    orderStore.handleSearch(search.value)
  }
}

// 分页后的数据
const paginatedItems = computed(() => {
  const start = (page.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredItems.value.slice(start, end)
})

// 监听页面或每页数量变化，重置到第一条
watch([selectedProductType, sortOption], () => {
  page.value = 1
})

// 获取优先级标签
function getPriorityLabel(priority) {
  if (priority >= 8) return '紧急'
  if (priority >= 5) return '中等'
  return '普通'
}

// 获取优先级颜色
function getPriorityColor(priority) {
  if (priority >= 8) return 'error'
  if (priority >= 5) return 'warning'
  return 'success'
}

// 获取产品类型颜色
function getProductTypeColor(type) {
  const types = {
    电子产品: 'blue',
    家具: 'brown',
    食品: 'green',
    服装: 'purple',
    图书: 'indigo',
  }

  return types[type] || 'primary'
}

// 获取行样式
function getRowClass(item) {
  if (item.priority >= 8) {
    return 'high-priority-row'
  }
  return ''
}

// 获取优先级滑块颜色
const getPrioritySliderColor = computed(() => {
  if (newOrder.value.priority >= 8) return 'error'
  if (newOrder.value.priority >= 5) return 'warning'
  return 'success'
})

// 获取优先级滑块按钮颜色
const getPriorityThumbColor = computed(() => {
  if (newOrder.value.priority >= 8) return 'error'
  if (newOrder.value.priority >= 5) return 'warning'
  return 'success'
})

// 获取编辑时的优先级滑块颜色
const getEditPrioritySliderColor = computed(() => {
  if (editedOrder.value.priority >= 8) return 'error'
  if (editedOrder.value.priority >= 5) return 'warning'
  return 'success'
})

// 获取编辑时的优先级滑块按钮颜色
const getEditPriorityThumbColor = computed(() => {
  if (editedOrder.value.priority >= 8) return 'error'
  if (editedOrder.value.priority >= 5) return 'warning'
  return 'success'
})

// 打开添加对话框
function openAddDialog() {
  // 重置新订单表单
  newOrder.value = {
    order_id: '',
    product_type: '',
    order_quantity: '',
    order_date: new Date().toISOString().substr(0, 10),
    priority: 5,
  }
  addDialog.value = true
}

// 提交添加订单
async function submitAddOrder() {
  try {
    loading.value = true

    // 转换数据类型，按照API要求处理
    await OrderManagement.add_order({
      order_id: +newOrder.value.order_id,
      product_type: newOrder.value.product_type,
      order_quantity: +newOrder.value.order_quantity,
      order_date: newOrder.value.order_date,
      priority: +newOrder.value.priority,
    })

    await orderStore.update_data()
    addDialog.value = false
    showSnackbar('订单添加成功！', 'success', 'mdi-check-circle')
  } catch (error) {
    console.error('添加订单失败', error)
    showSnackbar('添加订单失败: ' + error.message, 'error', 'mdi-alert-circle')
  } finally {
    loading.value = false
  }
}

// 查看订单详情
function viewOrderDetails(item) {
  viewedOrder.value = { ...item }
  viewDialog.value = true
}

// 编辑订单
// 编辑订单
function editOrder(item) {
  const itemCopy = { ...item }

  // 关键部分：确保日期格式正确
  if (itemCopy.order_date) {
    // 如果日期是字符串形式，保持原样
    // 如果不是字符串，尝试转换为YYYY-MM-DD格式
    if (typeof itemCopy.order_date !== 'string') {
      try {
        const date = new Date(itemCopy.order_date)
        if (!isNaN(date.getTime())) {
          itemCopy.order_date = date.toISOString().split('T')[0]
        }
      } catch (e) {
        console.error('日期转换失败', e)
        // 如果转换失败，提供一个默认日期
        itemCopy.order_date = new Date().toISOString().split('T')[0]
      }
    }
  } else {
    // 如果没有日期，也提供一个默认值
    itemCopy.order_date = new Date().toISOString().split('T')[0]
  }

  console.log('处理后的日期:', itemCopy.order_date)
  editedOrder.value = itemCopy
  viewDialog.value = false
  editDialog.value = true
}

// 提交编辑订单
// 提交编辑订单
async function submitEditOrder() {
  try {
    loading.value = true
    const id = editedOrder.value.order_id

    // 确保日期格式正确
    const formattedDate =
      typeof editedOrder.value.order_date === 'string'
        ? editedOrder.value.order_date
        : new Date(editedOrder.value.order_date).toISOString().substr(0, 10)

    // 创建数据对象
    const data = {
      product_type: editedOrder.value.product_type,
      order_quantity: +editedOrder.value.order_quantity,
      order_date: formattedDate,
      priority: +editedOrder.value.priority,
    }

    await OrderManagement.change_order(+id, data)
    await orderStore.update_data()
    editDialog.value = false // 确保这行代码执行
    showSnackbar('订单更新成功！', 'success', 'mdi-check-circle')
  } catch (error) {
    console.error('更新订单失败', error)
    showSnackbar('更新订单失败: ' + error.message, 'error', 'mdi-alert-circle')
  } finally {
    loading.value = false
  }
}

// 确认删除
function confirmDelete(item) {
  deleteItem.value = item
  viewDialog.value = false // 如果从查看详情打开，关闭详情对话框
  deleteDialog.value = true
}

// 删除订单
async function deleteOrder() {
  try {
    deleteLoading.value = true
    await OrderManagement.delete_id(deleteItem.value.order_id)
    await orderStore.update_data()
    deleteDialog.value = false
    showSnackbar('订单删除成功！', 'info', 'mdi-delete-circle')
  } catch (error) {
    console.error('删除订单失败', error)
    showSnackbar('删除订单失败: ' + error.message, 'error', 'mdi-alert-circle')
  } finally {
    deleteLoading.value = false
  }
}

// 刷新数据
async function refreshData() {
  try {
    loading.value = true
    await orderStore.update_data()
    showSnackbar('数据刷新成功！', 'info', 'mdi-refresh')
  } catch (error) {
    console.error('刷新数据失败', error)
    showSnackbar('刷新数据失败: ' + error.message, 'error', 'mdi-alert-circle')
  } finally {
    loading.value = false
  }
}

// 获取本月订单
function getMonthlyOrders() {
  const now = new Date()
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)

  return show_list.value.filter((order) => {
    const orderDate = new Date(order.order_date)
    return orderDate >= firstDay
  })
}

// 格式化日期
function formatDate(dateString) {
  if (!dateString) return ''

  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// 获取当前日期时间
function getCurrentDateTime() {
  return new Date().toLocaleString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

// 显示提示消息
function showSnackbar(text, color, icon) {
  snackbar.value = {
    show: true,
    text: text,
    color: color,
    timeout: 3000,
    icon: icon,
  }
}

// 组件挂载时获取数据
onMounted(async () => {
  try {
    loading.value = true
    await orderStore.update_data()
  } catch (error) {
    console.error('初始加载数据失败', error)
    showSnackbar('加载数据失败: ' + error.message, 'error', 'mdi-alert-circle')
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.order-management {
  min-height: 100vh;
  padding: 16px;
  display: flex;
  flex-direction: column;
}

.header-fixed {
  position: sticky;
  top: 0;
  z-index: 100;
  background-color: var(--v-theme-background);
  padding-bottom: 16px;
}

.scroll-body {
  flex-grow: 1;
  overflow-y: auto;
  padding-bottom: 16px;
}

.items-per-page-select {
  max-width: 120px;
}

.product-type-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

/* 高优先级行样式 */
:deep(.high-priority-row) {
  background-color: rgba(var(--v-theme-error), 0.05);
}

/* 美化滚动条 */
.scroll-body::-webkit-scrollbar {
  width: 8px;
}

.scroll-body::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.scroll-body::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

.scroll-body::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>
