<template>
  <v-app :theme="isDarkMode ? 'dark' : 'light'">
    <v-navigation-drawer
      v-model="isCartOpen"
      location="bottom"
      temporary
      width="400"
      class="cart-drawer position-fixed"
      style="z-index: 1000"
    >
      <v-toolbar color="surface" flat class="cart-header">
        <v-toolbar-title class="font-weight-medium">购物车</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon @click="isCartOpen = false" class="close-cart-btn">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>

      <v-divider></v-divider>

      <div
        v-if="cartItems.length === 0"
        class="d-flex flex-column align-center justify-center fill-height py-16 empty-cart"
      >
        <v-icon
          icon="mdi-cart-outline"
          size="64"
          color="grey-lighten-1"
          class="mb-4 empty-cart-icon"
        ></v-icon>
        <span class="text-body-1 text-grey-darken-1 empty-cart-text">购物车暂无商品</span>
        <v-btn
          color="primary"
          variant="text"
          class="mt-4 continue-shopping-btn"
          @click="isCartOpen = false"
        >
          继续购物
        </v-btn>
      </div>

      <div v-else class="d-flex flex-column fill-height cart-content">
        <div class="flex-grow-1 overflow-y-auto cart-items-container">
          <v-list lines="two">
            <transition-group name="cart-item">
              <v-list-item
                v-for="(item, index) in cartItems"
                :key="item.id"
                class="cart-item"
                :style="`animation-delay: ${0.05 * index}s`"
              >
                <template v-slot:prepend>
                  <v-avatar rounded="lg" size="64" class="mr-3 cart-item-image">
                    <v-img :src="item.image" cover>
                      <template v-slot:placeholder>
                        <div class="d-flex align-center justify-center fill-height">
                          <v-progress-circular
                            indeterminate
                            color="grey-lighten-3"
                            size="30"
                          ></v-progress-circular>
                        </div>
                      </template>
                    </v-img>
                  </v-avatar>
                </template>

                <v-list-item-title class="font-weight-medium mb-1 cart-item-title">{{
                  item.name
                }}</v-list-item-title>
                <v-list-item-subtitle class="cart-item-price"
                  >单价: ¥{{ item.price.toFixed(2) }}</v-list-item-subtitle
                >

                <template v-slot:append>
                  <div class="d-flex flex-column align-end">
                    <div class="text-primary font-weight-medium cart-item-total">
                      ¥{{ (item.price * item.quantity).toFixed(2) }}
                    </div>

                    <div class="d-flex align-center mt-2 cart-item-controls">
                      <v-btn
                        icon="mdi-minus"
                        variant="text"
                        density="comfortable"
                        size="small"
                        @click="decreaseCartItemQuantity(item)"
                        :disabled="item.quantity <= 1"
                        class="cart-quantity-btn"
                      ></v-btn>

                      <span class="mx-2 cart-item-quantity">{{ item.quantity }}</span>

                      <v-btn
                        icon="mdi-plus"
                        variant="text"
                        density="comfortable"
                        size="small"
                        @click="increaseCartItemQuantity(item)"
                        :disabled="item.quantity >= 100"
                        class="cart-quantity-btn"
                      ></v-btn>

                      <v-btn
                        icon="mdi-delete-outline"
                        variant="text"
                        density="comfortable"
                        color="error"
                        size="small"
                        class="ml-2 remove-item-btn"
                        @click="removeFromCart(item.id)"
                      ></v-btn>
                    </div>
                  </div>
                </template>
              </v-list-item>
            </transition-group>
          </v-list>
        </div>

        <v-divider></v-divider>

        <div class="px-4 py-3 cart-footer">
          <div class="d-flex justify-space-between align-center mb-4">
            <span class="text-h6 font-weight-medium cart-total-label">合计</span>
            <span class="text-h6 text-primary font-weight-bold cart-total-amount"
              >¥{{ cartTotal.toFixed(2) }}</span
            >
          </div>

          <v-btn
            block
            color="primary"
            size="large"
            variant="elevated"
            @click="checkout"
            height="48"
            class="checkout-btn"
          >
            确认付款
          </v-btn>
        </div>
      </div>
    </v-navigation-drawer>

    <v-app-bar app elevation="1" color="surface">
      <v-app-bar-title class="text-primary font-weight-medium">
        <span class="app-title">购物平台</span>
      </v-app-bar-title>
      <v-spacer></v-spacer>

      <!-- 购物车按钮 -->
      <v-btn icon @click="isCartOpen = true" class="mr-2 cart-btn" variant="text">
        <v-badge
          :content="cartItemCount.toString()"
          :model-value="cartItemCount > 0"
          color="primary"
          offset-x="12"
          offset-y="12"
        >
          <v-icon>mdi-cart-outline</v-icon>
        </v-badge>
      </v-btn>
    </v-app-bar>

    <v-main>
      <v-container class="main-container">
        <h2 class="text-h4 font-weight-bold mb-6 page-title">精选商品</h2>

        <!-- 商品列表 -->
        <v-row>
          <v-col
            v-for="(product, index) in products"
            :key="product.id"
            cols="12"
            sm="6"
            md="4"
            lg="3"
            class="product-col"
          >
            <v-card class="mx-auto product-card" elevation="2" height="100%">
              <div class="card-image-container">
                <v-img
                  :src="product.image"
                  :alt="product.name"
                  height="200"
                  cover
                  class="bg-grey-lighten-2 product-image"
                >
                  <template v-slot:placeholder>
                    <div class="d-flex align-center justify-center fill-height">
                      <v-progress-circular indeterminate color="primary"></v-progress-circular>
                    </div>
                  </template>
                </v-img>
                <div class="product-overlay">
                  <v-btn
                    icon="mdi-heart-outline"
                    variant="text"
                    size="small"
                    class="favorite-btn"
                  ></v-btn>
                  <v-btn
                    icon="mdi-eye-outline"
                    variant="text"
                    size="small"
                    class="view-btn"
                  ></v-btn>
                </div>
              </div>

              <v-card-title class="product-title">{{ product.name }}</v-card-title>

              <v-card-text>
                <div class="text-primary text-h5 font-weight-bold mb-4 price-tag">
                  ¥{{ product.price.toFixed(2) }}
                </div>

                <div class="d-flex align-center quantity-control">
                  <v-btn
                    density="comfortable"
                    icon="mdi-minus"
                    variant="text"
                    @click="decreaseQuantity(product)"
                    :disabled="productQuantities[product.id] <= 1"
                    size="small"
                    class="quantity-btn"
                  ></v-btn>

                  <v-text-field
                    v-model.number="productQuantities[product.id]"
                    type="number"
                    density="compact"
                    hide-details
                    class="quantity-input mx-2"
                    min="1"
                    max="100"
                    @change="validateQuantity(product.id)"
                    variant="solo"
                    flat
                    style="width: 60px"
                  ></v-text-field>

                  <v-btn
                    density="comfortable"
                    icon="mdi-plus"
                    variant="text"
                    @click="increaseQuantity(product)"
                    :disabled="productQuantities[product.id] >= 100"
                    size="small"
                    class="quantity-btn"
                  ></v-btn>
                </div>
              </v-card-text>

              <v-card-actions>
                <v-btn
                  block
                  color="primary"
                  variant="elevated"
                  @click="addToCart(product)"
                  prepend-icon="mdi-cart-plus"
                  class="mb-2 add-to-cart-btn"
                  :style="`animation-delay: ${0.05 * index}s`"
                >
                  <span class="btn-text">加入购物车</span>
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>

    <!-- 购物车侧边栏 -->

    <!-- 成功提示消息 -->
    <v-snackbar
      v-model="showSuccessMessage"
      :timeout="3000"
      location="bottom right"
      rounded="pill"
      color="success"
      elevation="4"
      class="success-snackbar"
    >
      <div class="d-flex align-center">
        <v-icon icon="mdi-check-circle" class="mr-2 success-icon"></v-icon>
        {{ successMessage }}
      </div>

      <template v-slot:actions>
        <v-btn
          icon="mdi-close"
          variant="text"
          @click="showSuccessMessage = false"
          class="close-snackbar-btn"
        ></v-btn>
      </template>
    </v-snackbar>
  </v-app>
</template>

<script setup>
import { ref, computed, onMounted, reactive, toRefs } from 'vue'
import { useThemeStore } from '@/stores'
import { OrderManagement } from '@/services'

// 主题模式
const themeStore = useThemeStore()
const { theme } = toRefs(themeStore)
const isDarkMode = computed(() => {
  return theme.value == 'dark' ? true : false
})

// 商品数据
const products = ref([
  {
    id: 1,
    name: '商品 A',
    price: 15.99,
    image:
      'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDAgMjAwIiBmaWxsPSJub25lIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y1ZjVmNSIvPjxwYXRoIGQ9Ik04MCAxMDBoNDBsLTIwIDM1LTIwLTM1eiIgZmlsbD0iIzNiODJmNiIvPjxwYXRoIGQ9Ik04MCA5MGg0MGwtMjAtMzVMODAgOTB6IiBmaWxsPSIjMzdiMmZmIi8+PHRleHQgeD0iMTAwIiB5PSIxMDAiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjI0IiBmaWxsPSIjMDAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5BPC90ZXh0Pjwvc3ZnPg==',
  },
  {
    id: 2,
    name: '商品 B',
    price: 29.99,
    image:
      'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDAgMjAwIiBmaWxsPSJub25lIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y1ZjVmNSIvPjxyZWN0IHg9IjYwIiB5PSI2MCIgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjZWM0ODk5Ii8+PHRleHQgeD0iMTAwIiB5PSIxMTAiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjI0IiBmaWxsPSIjZmZmIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5CPC90ZXh0Pjwvc3ZnPg==',
  },
  {
    id: 3,
    name: '商品 C',
    price: 49.99,
    image:
      'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDAgMjAwIiBmaWxsPSJub25lIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y1ZjVmNSIvPjxjaXJjbGUgY3g9IjEwMCIgY3k9IjEwMCIgcj0iNDAiIGZpbGw9IiMxMGIxODEiLz48dGV4dCB4PSIxMDAiIHk9IjExMCIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiNmZmYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkM8L3RleHQ+PC9zdmc+',
  },
  {
    id: 4,
    name: '商品 D',
    price: 99.99,
    image:
      'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDAgMjAwIiBmaWxsPSJub25lIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y1ZjVmNSIvPjxwYXRoIGQ9Ik0xMDAgNjBsNDAgNjkuMjgyLTEwNS4yNzYtMzIuMzYxaDEzMC41NTJMMTY2IDEyOS4yODJMMTAwIDYweiIgZmlsbD0iI2YzOWMxMiIvPjx0ZXh0IHg9IjEwMCIgeT0iMTEwIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZmlsbD0iI2ZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+RDwvdGV4dD48L3N2Zz4=',
  },
  {
    id: 5,
    name: '商品 E',
    price: 39.99,
    image:
      'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDAgMjAwIiBmaWxsPSJub25lIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y1ZjVmNSIvPjxwYXRoIGQ9Ik02MCAxNDBoODBMNjAgNjB2ODB6IiBmaWxsPSIjOGIwMGZmIi8+PHBhdGggZD0iTTE0MCA2MEg2MGw4MCA4MFY2MHoiIGZpbGw9IiNhODU1ZmYiLz48dGV4dCB4PSIxMDAiIHk9IjEwMCIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiNmZmYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkU8L3RleHQ+PC9zdmc+',
  },
  {
    id: 6,
    name: '商品 F',
    price: 24.99,
    image:
      'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDAgMjAwIiBmaWxsPSJub25lIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y1ZjVmNSIvPjxlbGxpcHNlIGN4PSIxMDAiIGN5PSIxMDAiIHJ4PSI0MCIgcnk9IjMwIiBmaWxsPSIjZmM2ZDI2Ii8+PHRleHQgeD0iMTAwIiB5PSIxMTAiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjI0IiBmaWxsPSIjZmZmIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5GPC90ZXh0Pjwvc3ZnPg==',
  },
  {
    id: 7,
    name: '商品 G',
    price: 19.99,
    image:
      'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDAgMjAwIiBmaWxsPSJub25lIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y1ZjVmNSIvPjxyZWN0IHg9IjYwIiB5PSI2MCIgd2lkdGg9IjgwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjMDQ3ODU3Ii8+PHJlY3QgeD0iNjAiIHk9IjEwMCIgd2lkdGg9IjgwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjMDY5NjY5Ii8+PHRleHQgeD0iMTAwIiB5PSIxMTAiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjI0IiBmaWxsPSIjZmZmIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5HPC90ZXh0Pjwvc3ZnPg==',
  },
  {
    id: 8,
    name: '商品 H',
    price: 59.99,
    image:
      'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDAgMjAwIiBmaWxsPSJub25lIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y1ZjVmNSIvPjxwYXRoIGQ9Ik02MCA2MGg4MHY4MGgtODBWNjB6IiBzdHJva2U9IiMyNTYzZWIiIHN0cm9rZS13aWR0aD0iOCIgZmlsbD0ibm9uZSIvPjx0ZXh0IHg9IjEwMCIgeT0iMTEwIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzI1NjNlYiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+SDwvdGV4dD48L3N2Zz4=',
  },
  {
    id: 9,
    name: '商品 I',
    price: 12.99,
    image:
      'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDAgMjAwIiBmaWxsPSJub25lIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y1ZjVmNSIvPjxsaW5lIHgxPSI2MCIgeTE9IjEwMCIgeDI9IjE0MCIgeTI9IjEwMCIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utd2lkdGg9IjQiLz48bGluZSB4MT0iMTAwIiB5MT0iNjAiIHgyPSIxMDAiIHkyPSIxNDAiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLXdpZHRoPSI0Ii8+PHRleHQgeD0iMTAwIiB5PSIxMDAiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjI0IiBmaWxsPSIjMDAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5JPC90ZXh0Pjwvc3ZnPg==',
  },
  {
    id: 10,
    name: '商品 J',
    price: 79.99,
    image:
      'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDAgMjAwIiBmaWxsPSJub25lIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y1ZjVmNSIvPjxjaXJjbGUgY3g9IjgwIiBjeT0iODAiIHI9IjIwIiBmaWxsPSIjZGM0ODVjIi8+PGNpcmNsZSBjeD0iMTIwIiBjeT0iODAiIHI9IjIwIiBmaWxsPSIjODhlMGQ5Ii8+PGNpcmNsZSBjeD0iODAiIGN5PSIxMjAiIHI9IjIwIiBmaWxsPSIjZmZkZGIxIi8+PGNpcmNsZSBjeD0iMTIwIiBjeT0iMTIwIiByPSIyMCIgZmlsbD0iI2M3Y2VlYSIvPjx0ZXh0IHg9IjEwMCIgeT0iMTYwIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzAwMCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+SjwvdGV4dD48L3N2Zz4=',
  },
])

// 商品数量状态
const productQuantities = reactive({})

// 初始化每个商品的数量
onMounted(() => {
  products.value.forEach((product) => {
    productQuantities[product.id] = 1
  })
})

// 购物车状态
const cartItems = ref([])
const isCartOpen = ref(false)
const showSuccessMessage = ref(false)
const successMessage = ref('')

// 计算购物车总数量
const cartItemCount = computed(() => {
  return cartItems.value.reduce((total, item) => total + item.quantity, 0)
})

// 计算购物车总价
const cartTotal = computed(() => {
  return cartItems.value.reduce((total, item) => total + item.price * item.quantity, 0)
})

// 数量调整函数
const increaseQuantity = (product) => {
  if (productQuantities[product.id] < 100) {
    productQuantities[product.id]++
  }
}

const decreaseQuantity = (product) => {
  if (productQuantities[product.id] > 1) {
    productQuantities[product.id]--
  }
}

// 验证数量输入
const validateQuantity = (productId) => {
  let quantity = productQuantities[productId]

  if (isNaN(quantity) || quantity < 1) {
    productQuantities[productId] = 1
  } else if (quantity > 100) {
    productQuantities[productId] = 100
  } else {
    productQuantities[productId] = Math.floor(quantity)
  }
}

// 增加购物车商品数量
const increaseCartItemQuantity = (item) => {
  if (item.quantity < 100) {
    item.quantity++
  }
}

// 减少购物车商品数量
const decreaseCartItemQuantity = (item) => {
  if (item.quantity > 1) {
    item.quantity--
  }
}

// 添加商品到购物车
const addToCart = (product) => {
  const quantity = productQuantities[product.id]
  const existingItem = cartItems.value.find((item) => item.id === product.id)

  if (existingItem) {
    // 如果商品已在购物车中，更新数量
    const newQuantity = existingItem.quantity + quantity
    existingItem.quantity = Math.min(newQuantity, 100)
  } else {
    // 否则，添加新商品到购物车
    cartItems.value.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: quantity,
    })
  }

  // 重置商品数量为1
  productQuantities[product.id] = 1

  // 显示成功消息
  successMessage.value = `已将 ${product.name} ${quantity} 件加入购物车`
  showSuccessMessage.value = true

  // 打开购物车侧边栏
  isCartOpen.value = true
}

// 从购物车移除商品
const removeFromCart = (productId) => {
  const index = cartItems.value.findIndex((item) => item.id === productId)
  if (index !== -1) {
    const removedItem = cartItems.value[index]
    cartItems.value.splice(index, 1)

    // 显示移除成功消息
    successMessage.value = `已从购物车移除 ${removedItem.name}`
    showSuccessMessage.value = true
  }
}

// 结账函数
const checkout = () => {
  cartItems.value.forEach((order) => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    OrderManagement.add_order({
      order_id: 1,
      product_type: order.name.slice(-1),
      order_quantity: order.quantity,
      order_date: `${year}-${month}-${day}`,
      priority: Math.floor(Math.random() * 10) + 1,
    })
  })

  // 显示结账成功消息
  successMessage.value = '订单已提交，感谢您的购买！'
  showSuccessMessage.value = true

  // 清空购物车
  cartItems.value = []

  // 关闭购物车侧边栏
  isCartOpen.value = false
}
</script>

<style>
/* 基础样式 */
:root {
  --transition-standard: cubic-bezier(0.4, 0, 0.2, 1);
  --transition-decelerate: cubic-bezier(0, 0, 0.2, 1);
  --transition-accelerate: cubic-bezier(0.4, 0, 1, 1);
  --transition-emphasized: cubic-bezier(0.2, 0, 0, 1);
}

/* 页面标题动画 */
.page-title {
  position: relative;
  display: inline-block;
  overflow: hidden;
}

.page-title::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  width: 0;
  height: 3px;
  background-color: var(--v-theme-primary);
  transition: width 0.6s var(--transition-emphasized);
}

.main-container:hover .page-title::after {
  width: 100%;
}

.app-title {
  display: inline-block;
  position: relative;
  transition: transform 0.3s var(--transition-emphasized);
}

.app-title:hover {
  transform: translateY(-2px);
}

/* 商品卡片动画 */
.product-card {
  transition:
    transform 0.4s var(--transition-emphasized),
    box-shadow 0.4s var(--transition-emphasized);
  will-change: transform, box-shadow;
}

.product-card:hover {
  transform: translateY(-10px) scale(1.02);
  box-shadow:
    0 14px 28px rgba(0, 0, 0, 0.15),
    0 10px 10px rgba(0, 0, 0, 0.1) !important;
}

.product-col {
  transition: opacity 0.5s var(--transition-decelerate);
}

/* 商品图片容器 */
.card-image-container {
  position: relative;
  overflow: hidden;
  border-radius: 4px 4px 0 0;
}

.product-image {
  transition: transform 0.6s var(--transition-decelerate);
}

.product-card:hover .product-image {
  transform: scale(1.08);
}

/* 商品悬停覆盖层 */
.product-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.2));
  opacity: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  transition: opacity 0.4s var(--transition-standard);
}

.product-card:hover .product-overlay {
  opacity: 1;
}

.favorite-btn,
.view-btn {
  transform: translateY(20px);
  opacity: 0;
  transition:
    transform 0.5s var(--transition-decelerate),
    opacity 0.5s var(--transition-decelerate),
    background-color 0.3s var(--transition-standard);
  background-color: rgba(255, 255, 255, 0.8) !important;
}

.product-card:hover .favorite-btn,
.product-card:hover .view-btn {
  transform: translateY(0);
  opacity: 1;
}

.product-card:hover .favorite-btn {
  transition-delay: 0.05s;
}

.product-card:hover .view-btn {
  transition-delay: 0.1s;
}

.favorite-btn:hover,
.view-btn:hover {
  background-color: rgba(255, 255, 255, 1) !important;
}

/* 商品标题动画 */
.product-title {
  position: relative;
  transition: color 0.3s var(--transition-standard);
}

.product-title::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 2px;
  background-color: var(--v-theme-primary);
  transition: width 0.4s var(--transition-emphasized);
}

.product-card:hover .product-title::after {
  width: 40px;
}

/* 价格标签动画 */
.price-tag {
  display: inline-block;
  transition: transform 0.3s var(--transition-emphasized);
}

.product-card:hover .price-tag {
  transform: translateX(4px) scale(1.05);
}

/* 数量控制按钮 */
.quantity-btn {
  transition:
    transform 0.2s var(--transition-emphasized),
    background-color 0.3s var(--transition-standard);
  position: relative;
  overflow: hidden;
}

.quantity-btn::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  background-color: rgba(var(--v-theme-primary), 0.2);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  transition:
    width 0.5s var(--transition-decelerate),
    height 0.5s var(--transition-decelerate);
}

.quantity-btn:hover::after {
  width: 40px;
  height: 40px;
}

/* 加入购物车按钮动画 */
.add-to-cart-btn {
  position: relative;
  overflow: hidden;
  transition: all 0.3s var(--transition-emphasized);
  z-index: 1;
}

.add-to-cart-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 7px 14px rgba(var(--v-theme-primary), 0.2) !important;
}

.add-to-cart-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(to right, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0));
  transform: skewX(-25deg);
  transition: left 0.7s var(--transition-emphasized);
  z-index: -1;
}

.add-to-cart-btn:hover::before {
  left: 100%;
}

.btn-text {
  position: relative;
  z-index: 2;
}

/* 改进的数量输入框 */
.quantity-input {
  transition: box-shadow 0.3s var(--transition-standard);
}

.quantity-input:focus-within {
  box-shadow: 0 0 0 2px rgba(var(--v-theme-primary), 0.2);
}

/* 商品淡入动画 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.v-card {
  animation: fadeInUp 0.6s var(--transition-decelerate) forwards;
  animation-fill-mode: both;
  opacity: 0;
}

/* 购物车按钮动画 */
.cart-btn {
  position: relative;
}

.cart-btn::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  background-color: rgba(var(--v-theme-primary), 0.1);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  transition:
    width 0.4s var(--transition-decelerate),
    height 0.4s var(--transition-decelerate);
}

.cart-btn:hover::after {
  width: 45px;
  height: 45px;
}

/* 购物车侧边栏动画 */
.cart-drawer {
  box-shadow: 0 0 25px rgba(0, 0, 0, 0.2);
}

/* 购物车头部和尾部阴影 */
.cart-header {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  position: relative;
  z-index: 1;
}

.cart-footer {
  box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.05);
  position: relative;
  z-index: 1;
}

/* 购物车项目动画 */
.cart-item {
  transition:
    background-color 0.3s var(--transition-standard),
    transform 0.3s var(--transition-standard);
  animation: slideInRight 0.4s var(--transition-decelerate) forwards;
  position: relative;
  overflow: hidden;
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.cart-item:hover {
  background-color: rgba(var(--v-theme-primary), 0.05);
  transform: translateX(5px);
}

.cart-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 3px;
  background-color: var(--v-theme-primary);
  transform: scaleY(0);
  transition: transform 0.3s var(--transition-emphasized);
}

.cart-item:hover::before {
  transform: scaleY(1);
}

/* 购物车项目 transition-group 动画 */
.cart-item-enter-active {
  animation: slideInRight 0.4s var(--transition-decelerate);
}

.cart-item-leave-active {
  position: absolute;
  width: 100%;
  animation: slideOutRight 0.4s var(--transition-accelerate);
}

@keyframes slideOutRight {
  from {
    opacity: 1;
    transform: translateX(0);
  }
  to {
    opacity: 0;
    transform: translateX(30px);
  }
}

/* 购物车商品图片 */
.cart-item-image {
  transition: transform 0.3s var(--transition-standard);
  overflow: hidden;
}

.cart-item:hover .cart-item-image {
  transform: scale(1.05);
}

/* 购物车商品标题 */
.cart-item-title {
  transition: color 0.3s var(--transition-standard);
}

.cart-item:hover .cart-item-title {
  color: var(--v-theme-primary);
}

/* 购物车商品总价 */
.cart-item-total {
  transition: transform 0.3s var(--transition-emphasized);
}

.cart-item:hover .cart-item-total {
  transform: scale(1.08);
}

/* 购物车数量控制按钮 */
.cart-quantity-btn {
  transition:
    transform 0.2s var(--transition-emphasized),
    background-color 0.3s var(--transition-standard);
}

.cart-quantity-btn:hover:not(.v-btn--disabled) {
  background-color: rgba(var(--v-theme-primary), 0.1) !important;
}

.cart-quantity-btn:active:not(.v-btn--disabled) {
  transform: scale(0.9);
}

/* 删除按钮 */
.remove-item-btn {
  transition:
    transform 0.3s var(--transition-emphasized),
    color 0.3s var(--transition-standard),
    background-color 0.3s var(--transition-standard);
}

.remove-item-btn:hover {
  transform: rotate(8deg);
  background-color: rgba(var(--v-theme-error), 0.1) !important;
}

/* 结账按钮 */
.checkout-btn {
  transition:
    transform 0.3s var(--transition-emphasized),
    box-shadow 0.3s var(--transition-standard);
  position: relative;
  overflow: hidden;
}

.checkout-btn::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  transition:
    width 0.8s var(--transition-emphasized),
    height 0.8s var(--transition-emphasized);
  z-index: 0;
}

.checkout-btn:hover::after {
  width: 300px;
  height: 300px;
}

.checkout-btn:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(var(--v-theme-primary), 0.25) !important;
}

/* 空购物车 */
.empty-cart-icon {
  animation: float 3s infinite ease-in-out;
}

@keyframes float {
  0% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
  100% {
    transform: translateY(0px);
  }
}

.empty-cart-text {
  opacity: 0.8;
  transform: translateY(10px);
  animation: fadeIn 0.8s var(--transition-decelerate) forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 0.8;
    transform: translateY(0);
  }
}

.continue-shopping-btn {
  margin-top: 20px;
  transform: translateY(10px);
  opacity: 0;
  animation: fadeIn 0.8s var(--transition-decelerate) 0.2s forwards;
}

/* 禁用输入框的上下箭头 */
input[type='number']::-webkit-inner-spin-button,
input[type='number']::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type='number'] {
  -moz-appearance: textfield;
}

/* 成功消息动画 */
.success-snackbar {
  animation: slideInUp 0.4s var(--transition-decelerate);
}

@keyframes slideInUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.success-icon {
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}

/* 关闭按钮动画 */
.close-cart-btn,
.close-snackbar-btn {
  transition: transform 0.3s var(--transition-emphasized);
}

.close-cart-btn:hover,
.close-snackbar-btn:hover {
  transform: rotate(90deg);
}

/* 按钮涟漪效果 */
.v-btn {
  position: relative;
  overflow: hidden;
}

.v-btn::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 5px;
  height: 5px;
  background: rgba(255, 255, 255, 0.5);
  opacity: 0;
  border-radius: 100%;
  transform: translate(-50%, -50%);
  transition: all 0.9s var(--transition-standard);
}

.v-btn:focus:not(:active)::after {
  width: 300px;
  height: 300px;
  opacity: 0;
  transition: 0s;
}

.v-btn:active:not(.v-btn--disabled) {
  transform: scale(0.96);
}

/* 商品卡片焦点状态 */
.product-card:focus-within {
  box-shadow: 0 0 0 3px rgba(var(--v-theme-primary), 0.3) !important;
}

/* 购物车总价动画 */
.cart-total-amount {
  transition: transform 0.3s var(--transition-emphasized);
}

.cart-footer:hover .cart-total-amount {
  transform: scale(1.1);
}

/* 购物车商品数量 */
.cart-item-quantity {
  position: relative;
  padding: 0 6px;
  transition: background-color 0.3s var(--transition-standard);
}

.cart-item:hover .cart-item-quantity {
  background-color: rgba(var(--v-theme-primary), 0.1);
  border-radius: 4px;
}

/* 购物车进入/离开动画 */
.v-navigation-drawer-enter-active {
  transition: transform 0.3s var(--transition-decelerate) !important;
}

.v-navigation-drawer-leave-active {
  transition: transform 0.3s var(--transition-accelerate) !important;
}
</style>
