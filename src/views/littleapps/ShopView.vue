<template>
  <v-app :theme="isDarkMode ? 'dark' : 'light'">
    <v-navigation-drawer
      v-model="isCartOpen"
      location="bottom"
      temporary
      width="400"
      class="cart-drawer position-fixed tw:!mx-2"
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

    <v-app-bar app elevation="4" color="surface" class="tw:!rounded-xl tw:!sticky" v-ripple>
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
            <v-card
              class="mx-auto product-card tw:hover:!shadow-m-elevation-8 tw:!translate-2 tw:!transition-transform tw:!ease-in tw:!duration-300 rounded-lg"
              elevation="2"
              height="100%"
            >
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

              <v-card-subtitle class="text-body-2">
                {{ product.description }}
              </v-card-subtitle>

              <v-card-text>
                <div class="d-flex align-center justify-space-between mb-3">
                  <span class="text-h6 text-primary font-weight-bold"> ¥{{ product.price }} </span>
                  <v-rating
                    :model-value="product.rating"
                    readonly
                    density="compact"
                    size="small"
                    color="amber"
                  ></v-rating>
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

// 商品数据 - 使用精美的商品图片
const products = ref([
  {
    id: 1,
    name: 'iPhone 15 Pro',
    description: '全新A17 Pro芯片，钛金属设计',
    price: 8999.0,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=500&h=400&fit=crop',
  },
  {
    id: 2,
    name: 'MacBook Air M3',
    description: '超薄便携，强悍性能',
    price: 9999.0,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=500&h=400&fit=crop',
  },
  {
    id: 3,
    name: 'AirPods Pro 2',
    description: '主动降噪，空间音频',
    price: 1899.0,
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=500&h=400&fit=crop',
  },
  {
    id: 4,
    name: 'Apple Watch Ultra 2',
    description: '专业运动，极限探险',
    price: 6299.0,
    rating: 4.8,
    image:
      'data:image/jpeg;base64,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',
  },
  {
    id: 5,
    name: 'iPad Pro 12.9"',
    description: 'M2芯片，专业创作',
    price: 8799.0,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500&h=400&fit=crop',
  },
  {
    id: 6,
    name: 'Sony WH-1000XM5',
    description: '行业领先降噪耳机',
    price: 2399.0,
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=500&h=400&fit=crop',
  },
  {
    id: 7,
    name: 'Nintendo Switch OLED',
    description: '便携游戏机，OLED屏幕',
    price: 2599.0,
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=500&h=400&fit=crop',
  },
  {
    id: 8,
    name: 'Canon EOS R6',
    description: '全画幅微单相机',
    price: 15999.0,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=500&h=400&fit=crop',
  },
  {
    id: 9,
    name: 'LG OLED C3 65"',
    description: '4K OLED智能电视',
    price: 12999.0,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=500&h=400&fit=crop',
  },
  {
    id: 10,
    name: 'Tesla Model Y',
    description: '纯电动SUV，智能驾驶',
    price: 299900.0,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=500&h=400&fit=crop',
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
