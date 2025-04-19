<template>
  <div :class="{ 'tw-dark': isDarkMode }">
    <div class="tw-min-h-screen tw-bg-gray-50 dark:tw-bg-gray-900 tw-flex tw-flex-col">
      <!-- 顶部导航栏 -->
      <header class="tw-bg-white dark:tw-bg-gray-800 tw-shadow-sm tw-sticky tw-top-0 tw-z-10">
        <div
          class="tw-max-w-7xl tw-mx-auto tw-px-4 tw-py-3 tw-flex tw-items-center tw-justify-between"
        >
          <h1 class="tw-text-xl tw-font-medium tw-text-indigo-600 dark:tw-text-indigo-400">
            购物平台
          </h1>

          <!-- 购物车按钮 -->
          <button
            @click="isCartOpen = true"
            class="tw-relative tw-p-2 tw-rounded-full tw-text-gray-600 dark:tw-text-gray-300 hover:tw-text-indigo-600 dark:hover:tw-text-indigo-400 tw-transition-colors tw-duration-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="tw-h-6 tw-w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <span
              v-if="cartItemCount > 0"
              class="tw-absolute tw-top-0 tw-right-0 tw-inline-flex tw-items-center tw-justify-center tw-w-5 tw-h-5 tw-text-xs tw-font-bold tw-text-white tw-bg-indigo-600 dark:tw-bg-indigo-500 tw-rounded-full tw-transform tw-translate-x-1 -tw-translate-y-1"
            >
              {{ cartItemCount }}
            </span>
          </button>
        </div>
      </header>

      <main class="tw-flex-grow tw-max-w-7xl tw-mx-auto tw-px-4 tw-py-8 tw-w-full">
        <h2 class="tw-text-2xl tw-font-bold tw-text-gray-900 dark:tw-text-gray-100 tw-mb-8">
          精选商品
        </h2>

        <!-- 商品列表 -->
        <div
          class="tw-grid tw-grid-cols-1 sm:tw-grid-cols-2 md:tw-grid-cols-3 lg:tw-grid-cols-4 tw-gap-6"
        >
          <div
            v-for="product in products"
            :key="product.id"
            class="tw-bg-white dark:tw-bg-gray-800 tw-rounded-lg tw-shadow-md tw-overflow-hidden tw-transition-all tw-duration-300 hover:tw-shadow-lg tw-transform hover:tw-scale-[1.02]"
          >
            <div
              class="tw-aspect-w-1 tw-aspect-h-1 tw-w-full tw-overflow-hidden tw-bg-gray-200 dark:tw-bg-gray-700"
            >
              <img
                :src="product.image"
                :alt="product.name"
                class="tw-w-full tw-h-full tw-object-cover"
              />
            </div>
            <div class="tw-p-4">
              <h3 class="tw-font-medium tw-text-gray-900 dark:tw-text-gray-100">
                {{ product.name }}
              </h3>
              <p
                class="tw-mt-1 tw-text-lg tw-font-semibold tw-text-indigo-600 dark:tw-text-indigo-400"
              >
                ¥{{ product.price.toFixed(2) }}
              </p>
              <div class="tw-flex tw-items-center tw-mt-4 tw-space-x-2">
                <label :for="`quantity-${product.id}`" class="tw-sr-only">数量</label>
                <div class="tw-relative tw-flex tw-items-center">
                  <button
                    @click="decreaseQuantity(product)"
                    class="tw-w-8 tw-h-8 tw-flex tw-items-center tw-justify-center tw-rounded-full tw-bg-gray-100 dark:tw-bg-gray-700 hover:tw-bg-indigo-100 dark:hover:tw-bg-indigo-900 tw-text-gray-600 dark:tw-text-gray-300 hover:tw-text-indigo-600 dark:hover:tw-text-indigo-400 tw-transition-colors"
                    :disabled="productQuantities[product.id] <= 1"
                    :class="{
                      'tw-opacity-50 tw-cursor-not-allowed': productQuantities[product.id] <= 1,
                    }"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="tw-h-4 tw-w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M20 12H4"
                      />
                    </svg>
                  </button>
                  <input
                    type="number"
                    :id="`quantity-${product.id}`"
                    v-model.number="productQuantities[product.id]"
                    min="1"
                    max="100"
                    class="tw-w-14 tw-text-center tw-mx-2 tw-border-0 tw-focus:tw-ring-0 tw-bg-white dark:tw-bg-gray-800 tw-text-gray-900 dark:tw-text-gray-100"
                    @change="validateQuantity(product.id)"
                  />
                  <button
                    @click="increaseQuantity(product)"
                    class="tw-w-8 tw-h-8 tw-flex tw-items-center tw-justify-center tw-rounded-full tw-bg-gray-100 dark:tw-bg-gray-700 hover:tw-bg-indigo-100 dark:hover:tw-bg-indigo-900 tw-text-gray-600 dark:tw-text-gray-300 hover:tw-text-indigo-600 dark:hover:tw-text-indigo-400 tw-transition-colors"
                    :disabled="productQuantities[product.id] >= 100"
                    :class="{
                      'tw-opacity-50 tw-cursor-not-allowed': productQuantities[product.id] >= 100,
                    }"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="tw-h-4 tw-w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                  </button>
                </div>
                <button
                  @click="addToCart(product)"
                  class="tw-flex-grow tw-flex tw-items-center tw-justify-center tw-py-2 tw-px-4 tw-rounded-md tw-bg-indigo-600 dark:tw-bg-indigo-700 hover:tw-bg-indigo-700 dark:hover:tw-bg-indigo-600 tw-text-white tw-font-medium tw-transition-colors tw-duration-200"
                >
                  加入购物车
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <!-- 购物车侧边栏 -->
      <Transition
        enter-active-class="tw-transition tw-ease-out tw-duration-300"
        enter-from-class="tw-transform tw-translate-x-full"
        enter-to-class="tw-transform tw-translate-x-0"
        leave-active-class="tw-transition tw-ease-in tw-duration-200"
        leave-from-class="tw-transform tw-translate-x-0"
        leave-to-class="tw-transform tw-translate-x-full"
      >
        <div v-if="isCartOpen" class="tw-fixed tw-inset-0 tw-overflow-hidden tw-z-20">
          <div class="tw-absolute tw-inset-0 tw-overflow-hidden">
            <div
              class="tw-absolute tw-inset-0 tw-bg-gray-500 tw-bg-opacity-75 tw-transition-opacity"
              @click="isCartOpen = false"
            ></div>

            <div class="tw-absolute tw-inset-y-0 tw-right-0 tw-max-w-full tw-flex">
              <div class="tw-relative tw-w-screen tw-max-w-md">
                <div
                  class="tw-h-full tw-flex tw-flex-col tw-bg-white dark:tw-bg-gray-800 tw-shadow-xl tw-overflow-y-auto"
                >
                  <div class="tw-p-4 tw-flex tw-items-center tw-justify-between">
                    <h2 class="tw-text-lg tw-font-medium tw-text-gray-900 dark:tw-text-gray-100">
                      购物车
                    </h2>
                    <button
                      @click="isCartOpen = false"
                      class="tw-rounded-md tw-text-gray-400 dark:tw-text-gray-500 hover:tw-text-gray-500 dark:hover:tw-text-gray-400 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-indigo-500"
                    >
                      <svg
                        class="tw-h-6 tw-w-6"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>

                  <div class="tw-flex-1 tw-px-4 tw-py-6">
                    <div v-if="cartItems.length === 0" class="tw-text-center tw-py-12">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="tw-mx-auto tw-h-12 tw-w-12 tw-text-gray-400 dark:tw-text-gray-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                      <p class="tw-mt-4 tw-text-gray-500 dark:tw-text-gray-400">购物车暂无商品</p>
                    </div>

                    <ul v-else class="tw-divide-y tw-divide-gray-200 dark:tw-divide-gray-700">
                      <li v-for="item in cartItems" :key="item.id" class="tw-py-6 tw-flex">
                        <div
                          class="tw-flex-shrink-0 tw-w-24 tw-h-24 tw-rounded-md tw-overflow-hidden"
                        >
                          <img
                            :src="item.image"
                            :alt="item.name"
                            class="tw-w-full tw-h-full tw-object-cover"
                          />
                        </div>

                        <div class="tw-ml-4 tw-flex-1 tw-flex tw-flex-col">
                          <div
                            class="tw-flex tw-justify-between tw-text-base tw-font-medium tw-text-gray-900 dark:tw-text-gray-100"
                          >
                            <h3>{{ item.name }}</h3>
                            <p class="tw-ml-4">¥{{ (item.price * item.quantity).toFixed(2) }}</p>
                          </div>
                          <p class="tw-mt-1 tw-text-sm tw-text-gray-500 dark:tw-text-gray-400">
                            单价: ¥{{ item.price.toFixed(2) }}
                          </p>

                          <div class="tw-flex-1 tw-flex tw-items-end tw-justify-between">
                            <div class="tw-flex tw-items-center">
                              <button
                                @click="decreaseCartItemQuantity(item)"
                                class="tw-p-1 tw-rounded-full tw-text-gray-400 dark:tw-text-gray-500 hover:tw-text-gray-500 dark:hover:tw-text-gray-400"
                                :disabled="item.quantity <= 1"
                                :class="{
                                  'tw-opacity-50 tw-cursor-not-allowed': item.quantity <= 1,
                                }"
                              >
                                <svg
                                  class="tw-h-5 tw-w-5"
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path
                                    fill-rule="evenodd"
                                    d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z"
                                    clip-rule="evenodd"
                                  />
                                </svg>
                              </button>
                              <span class="tw-mx-2 tw-text-gray-900 dark:tw-text-gray-100">{{
                                item.quantity
                              }}</span>
                              <button
                                @click="increaseCartItemQuantity(item)"
                                class="tw-p-1 tw-rounded-full tw-text-gray-400 dark:tw-text-gray-500 hover:tw-text-gray-500 dark:hover:tw-text-gray-400"
                                :disabled="item.quantity >= 100"
                                :class="{
                                  'tw-opacity-50 tw-cursor-not-allowed': item.quantity >= 100,
                                }"
                              >
                                <svg
                                  class="tw-h-5 tw-w-5"
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path
                                    fill-rule="evenodd"
                                    d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                                    clip-rule="evenodd"
                                  />
                                </svg>
                              </button>
                            </div>

                            <button
                              @click="removeFromCart(item.id)"
                              class="tw-text-sm tw-font-medium tw-text-indigo-600 dark:tw-text-indigo-400 hover:tw-text-indigo-500 dark:hover:tw-text-indigo-300"
                            >
                              删除
                            </button>
                          </div>
                        </div>
                      </li>
                    </ul>
                  </div>

                  <div
                    v-if="cartItems.length > 0"
                    class="tw-border-t tw-border-gray-200 dark:tw-border-gray-700 tw-p-4"
                  >
                    <div
                      class="tw-flex tw-justify-between tw-text-base tw-font-medium tw-text-gray-900 dark:tw-text-gray-100 tw-mb-4"
                    >
                      <p>合计</p>
                      <p>¥{{ cartTotal.toFixed(2) }}</p>
                    </div>
                    <button
                      @click="checkout"
                      class="tw-w-full tw-flex tw-justify-center tw-py-3 tw-px-4 tw-rounded-md tw-shadow-sm tw-text-white tw-bg-indigo-600 dark:tw-bg-indigo-700 hover:tw-bg-indigo-700 dark:hover:tw-bg-indigo-600 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-offset-2 focus:tw-ring-indigo-500 tw-transition-colors tw-duration-200"
                    >
                      确认付款
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Transition>

      <!-- 成功提示 -->
      <Transition
        enter-active-class="tw-transform tw-ease-out tw-duration-300 tw-transition"
        enter-from-class="tw-translate-y-2 tw-opacity-0 sm:tw-translate-y-0 sm:tw-translate-x-2"
        enter-to-class="tw-translate-y-0 tw-opacity-100 sm:tw-translate-x-0"
        leave-active-class="tw-transition tw-ease-in tw-duration-200"
        leave-from-class="tw-opacity-100"
        leave-to-class="tw-opacity-0"
      >
        <div
          v-if="showSuccessMessage"
          class="tw-fixed tw-bottom-0 tw-right-0 tw-mb-4 tw-mr-4 tw-max-w-sm tw-w-full tw-bg-white dark:tw-bg-gray-800 tw-shadow-lg tw-rounded-lg tw-pointer-events-auto tw-overflow-hidden tw-z-50"
        >
          <div class="tw-p-4">
            <div class="tw-flex tw-items-start">
              <div class="tw-flex-shrink-0">
                <svg
                  class="tw-h-6 tw-w-6 tw-text-green-400 dark:tw-text-green-500"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div class="tw-ml-3 tw-w-0 tw-flex-1 tw-pt-0.5">
                <p class="tw-text-sm tw-font-medium tw-text-gray-900 dark:tw-text-gray-100">
                  {{ successMessage }}
                </p>
              </div>
              <div class="tw-ml-4 tw-flex-shrink-0 tw-flex">
                <button
                  @click="showSuccessMessage = false"
                  class="tw-inline-flex tw-text-gray-400 dark:tw-text-gray-500 hover:tw-text-gray-500 dark:hover:tw-text-gray-400"
                >
                  <svg
                    class="tw-h-5 tw-w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </div>
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
  setTimeout(() => {
    showSuccessMessage.value = false
  }, 3000)

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
    setTimeout(() => {
      showSuccessMessage.value = false
    }, 3000)
  }
}

// 结账函数 - 这里是一个预留的接口，用于将购物车数据存储到数据库
const checkout = () => {
  cartItems.value.forEach((order) => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0') // 月份从0开始，需+1
    const day = String(now.getDate()).padStart(2, '0')
    OrderManagement.add_order({
      order_id: 1, // 输入一个非法的id，系统会自动添加到最后一项
      product_type: order.name.slice(-1),
      order_quantity: order.quantity,
      order_date: `${year}-${month}-${day}`,
      priority: Math.floor(Math.random() * 10) + 1,
    })
  })

  // 显示结账成功消息  // 您可以在这里添加您的数据库存储逻辑
  // saveCartToDatabase(cartItems.value);

  successMessage.value = '订单已提交，感谢您的购买！'
  showSuccessMessage.value = true
  setTimeout(() => {
    showSuccessMessage.value = false
  }, 3000)

  // 清空购物车
  cartItems.value = []

  // 关闭购物车侧边栏
  isCartOpen.value = false
}
</script>

<style>
/* 可以添加额外的自定义样式 */
/* 暗色模式的基础样式覆盖 */
.tw-dark {
  color-scheme: dark;
}

/* 暗色模式下输入框样式调整 */
.tw-dark input[type='number'] {
  color: #f3f4f6;
  background-color: #1f2937;
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
</style>
