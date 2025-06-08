<template>
  <v-app>
    <!-- 背景视频 -->
    <div class="video-background">
      <video autoplay loop muted playsinline>
        <source :src="backgroundVideo" type="video/mp4" />
      </video>
      <div class="video-overlay"></div>
    </div>

    <!-- 主要内容区域 -->
    <v-main class="main-content">
      <v-container fluid>
        <v-row>
          <!-- 桌面端导航抽屉 -->
          <v-col cols="12" md="3" class="d-none d-md-block">
            <v-card class="side-nav-card" elevation="4" rounded="lg">
              <v-list class="side-nav-list" bg-color="transparent">
                <div
                  class="user-info-container d-flex flex-column align-center justify-center pa-4"
                >
                  <v-avatar size="100" class="ma-2 elevation-4 avatar-container">
                    <v-img :src="userAvatar" cover>
                      <template v-slot:placeholder>
                        <v-progress-circular indeterminate color="primary"></v-progress-circular>
                      </template>
                    </v-img>
                    <v-btn
                      density="comfortable"
                      icon
                      size="small"
                      class="avatar-edit-btn"
                      color="primary"
                      variant="tonal"
                      @click="openFileDialog"
                    >
                      <v-icon>mdi-camera</v-icon>
                    </v-btn>
                  </v-avatar>
                  <h2 class="text-h5 font-weight-medium mt-4 mb-1">{{ userData.displayName }}</h2>
                  <p class="text-body-2 text-medium-emphasis">{{ userData.email }}</p>
                  <v-btn
                    variant="tonal"
                    color="primary"
                    class="mt-2"
                    prepend-icon="mdi-account-edit"
                    @click="openEditProfileDialog"
                  >
                    编辑资料
                  </v-btn>
                </div>
                <v-divider class="my-2"></v-divider>
                <v-list-item
                  v-for="(item, i) in menuItems"
                  :key="i"
                  :prepend-icon="item.icon"
                  :title="item.title"
                  :value="item.value"
                  :active="activeMenuItem === item.value"
                  @click="activeMenuItem = item.value"
                  class="menu-item my-1"
                  rounded="lg"
                >
                </v-list-item>
              </v-list>
            </v-card>
          </v-col>

          <!-- 主要内容区域 -->
          <v-col cols="12" md="9">
            <!-- 顶部菜单栏（移动端） -->
            <v-card class="mb-4 d-md-none toolbar-card" elevation="1" rounded="lg">
              <v-toolbar flat color="transparent">
                <v-toolbar-title class="text-h6">个人设置</v-toolbar-title>
                <v-spacer></v-spacer>
                <v-menu>
                  <template v-slot:activator="{ props }">
                    <v-btn icon v-bind="props" variant="tonal">
                      <v-avatar size="36">
                        <v-img :src="userAvatar" alt="用户头像" cover></v-img>
                      </v-avatar>
                    </v-btn>
                  </template>
                  <v-list class="mobile-user-menu" density="compact">
                    <v-list-item
                      prepend-icon="mdi-account-edit"
                      title="编辑资料"
                      @click="openEditProfileDialog"
                    ></v-list-item>
                    <v-list-item
                      prepend-icon="mdi-camera"
                      title="更换头像"
                      @click="openFileDialog"
                    ></v-list-item>
                    <v-divider></v-divider>
                    <v-list-item
                      v-for="(item, i) in menuItems"
                      :key="i"
                      :prepend-icon="item.icon"
                      :title="item.title"
                      :value="item.value"
                      @click="activeMenuItem = item.value"
                    ></v-list-item>
                  </v-list>
                </v-menu>
              </v-toolbar>
            </v-card>

            <!-- 主要内容卡片 -->
            <v-card
              class="content-card"
              :class="{ 'active-card': true }"
              elevation="4"
              rounded="lg"
            >
              <!-- 个人信息设置 -->
              <v-window v-model="activeMenuItem">
                <v-window-item value="profile">
                  <div class="pa-6">
                    <h2 class="text-h4 font-weight-bold mb-6">个人信息设置</h2>
                    <v-alert
                      v-if="showSuccess"
                      type="success"
                      variant="tonal"
                      closable
                      class="mb-4 success-alert"
                      @click:close="showSuccess = false"
                    >
                      个人信息更新成功！
                    </v-alert>

                    <div class="d-flex flex-column flex-md-row align-start justify-space-between">
                      <div
                        class="profile-avatar-section d-flex flex-column align-center mb-6 mr-md-6"
                      >
                        <v-avatar size="180" class="profile-avatar elevation-5 mb-4">
                          <v-img :src="userAvatar" cover>
                            <template v-slot:placeholder>
                              <v-progress-circular
                                indeterminate
                                color="primary"
                              ></v-progress-circular>
                            </template>
                          </v-img>
                          <div class="avatar-overlay">
                            <v-btn
                              icon
                              size="large"
                              color="surface"
                              variant="flat"
                              @click="openFileDialog"
                              class="avatar-change-btn"
                            >
                              <v-icon size="32">mdi-camera</v-icon>
                            </v-btn>
                          </div>
                        </v-avatar>
                        <v-btn
                          variant="outlined"
                          color="primary"
                          prepend-icon="mdi-upload"
                          @click="openFileDialog"
                          class="mb-2 upload-btn"
                          :loading="uploading"
                        >
                          更换头像
                        </v-btn>
                        <p class="text-caption text-medium-emphasis text-center">
                          支持 JPG, PNG 格式文件<br />推荐尺寸 500x500
                        </p>
                      </div>

                      <div class="profile-form flex-grow-1">
                        <v-form ref="profileForm" v-model="formValid" @submit.prevent="saveProfile">
                          <v-text-field
                            v-model="userData.displayName"
                            label="显示名称"
                            variant="outlined"
                            placeholder="请输入您的显示名称"
                            prepend-inner-icon="mdi-account"
                            :rules="nameRules"
                            class="mb-4 with-label-animation"
                            required
                          ></v-text-field>

                          <v-text-field
                            v-model="userData.email"
                            label="电子邮箱"
                            variant="outlined"
                            placeholder="请输入您的电子邮箱"
                            prepend-inner-icon="mdi-email"
                            :rules="emailRules"
                            class="mb-4 with-label-animation"
                            required
                          ></v-text-field>

                          <v-text-field
                            v-model="userData.phone"
                            label="手机号码"
                            variant="outlined"
                            placeholder="请输入您的手机号码"
                            prepend-inner-icon="mdi-phone"
                            class="mb-4 with-label-animation"
                          ></v-text-field>

                          <v-textarea
                            v-model="userData.bio"
                            label="个人简介"
                            variant="outlined"
                            placeholder="请简单介绍一下您自己"
                            prepend-inner-icon="mdi-text-box"
                            auto-grow
                            rows="3"
                            row-height="20"
                            class="mb-4 with-label-animation"
                          ></v-textarea>

                          <v-select
                            v-model="userData.language"
                            :items="languageOptions"
                            label="界面语言"
                            variant="outlined"
                            prepend-inner-icon="mdi-translate"
                            class="mb-4 with-label-animation"
                          ></v-select>

                          <div class="d-flex justify-end mt-4">
                            <v-btn variant="text" color="primary" class="mr-4" @click="resetForm">
                              重置
                            </v-btn>
                            <v-btn
                              type="submit"
                              variant="elevated"
                              color="primary"
                              :disabled="!formValid"
                              :loading="saving"
                              class="save-btn"
                              @click="updateInformation"
                            >
                              保存修改
                            </v-btn>
                          </div>
                        </v-form>
                      </div>
                    </div>
                  </div>
                </v-window-item>

                <v-window-item value="security">
                  <div class="pa-6">
                    <h2 class="text-h4 font-weight-bold mb-6">安全设置</h2>
                    <v-card variant="outlined" class="mb-4">
                      <v-card-text>
                        <div class="d-flex align-center justify-space-between">
                          <div>
                            <h3 class="text-h6">密码</h3>
                            <p class="text-body-2 text-medium-emphasis">上次更新于: 30天前</p>
                          </div>
                          <v-btn variant="tonal" color="primary" prepend-icon="mdi-key"
                            >修改密码</v-btn
                          >
                        </div>
                      </v-card-text>
                    </v-card>

                    <v-card variant="outlined" class="mb-4">
                      <v-card-text>
                        <div class="d-flex align-center justify-space-between">
                          <div>
                            <h3 class="text-h6">两步验证</h3>
                            <p class="text-body-2 text-medium-emphasis">
                              提高账户安全性的额外保护层
                            </p>
                          </div>
                          <v-switch v-model="twoFactorEnabled" color="primary"></v-switch>
                        </div>
                      </v-card-text>
                    </v-card>

                    <v-card variant="outlined" class="mb-4">
                      <v-card-text>
                        <div class="d-flex align-center justify-space-between">
                          <div>
                            <h3 class="text-h6">设备管理</h3>
                            <p class="text-body-2 text-medium-emphasis">查看和管理已登录的设备</p>
                          </div>
                          <v-btn variant="tonal" color="primary" prepend-icon="mdi-devices"
                            >查看设备</v-btn
                          >
                        </div>
                      </v-card-text>
                    </v-card>

                    <v-card variant="outlined">
                      <v-card-text>
                        <div class="d-flex align-center justify-space-between">
                          <div>
                            <h3 class="text-h6">登录历史</h3>
                            <p class="text-body-2 text-medium-emphasis">查看近期的账户活动</p>
                          </div>
                          <v-btn variant="tonal" color="primary" prepend-icon="mdi-history"
                            >查看历史</v-btn
                          >
                        </div>
                      </v-card-text>
                    </v-card>
                  </div>
                </v-window-item>

                <v-window-item value="notifications">
                  <div class="pa-6">
                    <h2 class="text-h4 font-weight-bold mb-6">通知设置</h2>

                    <v-list class="tw:!glass">
                      <v-list-subheader class="pl-0 text-h6">电子邮件通知</v-list-subheader>
                      <v-list-item>
                        <template v-slot:prepend>
                          <v-checkbox
                            v-model="notifications.email.news"
                            color="primary"
                          ></v-checkbox>
                        </template>
                        <v-list-item-title>新闻与更新</v-list-item-title>
                        <v-list-item-subtitle
                          >接收有关产品更新和新功能的电子邮件</v-list-item-subtitle
                        >
                      </v-list-item>

                      <v-list-item>
                        <template v-slot:prepend>
                          <v-checkbox
                            v-model="notifications.email.activity"
                            color="primary"
                          ></v-checkbox>
                        </template>
                        <v-list-item-title>账户活动</v-list-item-title>
                        <v-list-item-subtitle
                          >接收有关账户活动和安全的电子邮件</v-list-item-subtitle
                        >
                      </v-list-item>

                      <v-list-item>
                        <template v-slot:prepend>
                          <v-checkbox
                            v-model="notifications.email.offers"
                            color="primary"
                          ></v-checkbox>
                        </template>
                        <v-list-item-title>促销与优惠</v-list-item-title>
                        <v-list-item-subtitle
                          >接收有关特别促销和折扣的电子邮件</v-list-item-subtitle
                        >
                      </v-list-item>

                      <v-divider class="my-3"></v-divider>

                      <v-list-subheader class="pl-0 text-h6">应用内通知</v-list-subheader>
                      <v-list-item>
                        <template v-slot:prepend>
                          <v-checkbox
                            v-model="notifications.app.updates"
                            color="primary"
                          ></v-checkbox>
                        </template>
                        <v-list-item-title>系统更新</v-list-item-title>
                        <v-list-item-subtitle>接收有关系统更新和维护的通知</v-list-item-subtitle>
                      </v-list-item>

                      <v-list-item>
                        <template v-slot:prepend>
                          <v-checkbox
                            v-model="notifications.app.newFeatures"
                            color="primary"
                          ></v-checkbox>
                        </template>
                        <v-list-item-title>新功能介绍</v-list-item-title>
                        <v-list-item-subtitle>接收有关新功能和改进的通知</v-list-item-subtitle>
                      </v-list-item>

                      <v-list-item>
                        <template v-slot:prepend>
                          <v-checkbox v-model="notifications.app.tips" color="primary"></v-checkbox>
                        </template>
                        <v-list-item-title>使用提示</v-list-item-title>
                        <v-list-item-subtitle>接收有关产品使用技巧的通知</v-list-item-subtitle>
                      </v-list-item>
                    </v-list>

                    <div class="d-flex justify-end mt-6">
                      <v-btn variant="text" color="primary" class="mr-4">重置默认</v-btn>
                      <v-btn
                        variant="elevated"
                        color="primary"
                        class="save-btn"
                        @click="saveNotifications"
                        >保存设置</v-btn
                      >
                    </div>
                  </div>
                </v-window-item>

                <v-window-item value="appearance">
                  <div class="pa-6">
                    <h2 class="text-h4 font-weight-bold mb-6">外观设置</h2>

                    <div class="theme-section mb-6">
                      <h3 class="text-h6 mb-4">主题模式</h3>
                      <v-btn-toggle
                        v-model="themeMode"
                        mandatory
                        color="primary"
                        variant="outlined"
                        class="theme-toggle-btn"
                      >
                        <v-btn value="light" prepend-icon="mdi-white-balance-sunny">浅色</v-btn>
                        <v-btn value="dark" prepend-icon="mdi-weather-night">深色</v-btn>
                        <v-btn value="system" prepend-icon="mdi-theme-light-dark">系统默认</v-btn>
                      </v-btn-toggle>
                    </div>

                    <div class="color-theme-section mb-6">
                      <h3 class="text-h6 mb-4">主题颜色</h3>
                      <div class="d-flex flex-wrap">
                        <v-chip
                          v-for="(color, index) in themeColors"
                          :key="index"
                          :color="color.value"
                          :class="{ 'selected-theme': themeColor === color.value }"
                          class="ma-2 theme-color-chip"
                          size="large"
                          @click="themeColor = color.value"
                        >
                          {{ color.name }}
                          <v-icon
                            v-if="themeColor === color.value"
                            end
                            icon="mdi-check"
                            class="ml-2"
                          ></v-icon>
                        </v-chip>
                      </div>
                    </div>

                    <div class="font-size-section mb-6">
                      <h3 class="text-h6 mb-4">字体大小</h3>
                      <v-slider
                        v-model="fontSize"
                        :min="80"
                        :max="120"
                        :step="5"
                        thumb-label
                        class="font-slider"
                        prepend-icon="mdi-format-font-size-decrease"
                        append-icon="mdi-format-font-size-increase"
                        color="primary"
                      >
                        <template v-slot:thumb-label="{ modelValue }"> {{ modelValue }}% </template>
                      </v-slider>
                      <div class="font-size-preview pa-4 mt-2" :style="`font-size: ${fontSize}%;`">
                        <p>字体大小预览</p>
                        <p class="text-body-2">这是一段示例文本，用于预览不同字体大小的效果。</p>
                      </div>
                    </div>

                    <div class="d-flex justify-end mt-6">
                      <v-btn variant="text" color="primary" class="mr-4">恢复默认</v-btn>
                      <v-btn
                        variant="elevated"
                        color="primary"
                        class="save-btn"
                        @click="saveAppearance"
                        >应用设置</v-btn
                      >
                    </div>
                  </div>
                </v-window-item>

                <v-window-item value="help">
                  <div class="pa-6">
                    <h2 class="text-h4 font-weight-bold mb-6">帮助与支持</h2>

                    <v-card class="mb-6" variant="outlined">
                      <v-card-title class="text-h5">常见问题</v-card-title>
                      <v-expansion-panels variant="accordion">
                        <v-expansion-panel
                          v-for="(faq, index) in faqs"
                          :key="index"
                          class="tw:!glass"
                        >
                          <v-expansion-panel-title class="text-body-1">{{
                            faq.question
                          }}</v-expansion-panel-title>
                          <v-expansion-panel-text>
                            <p class="text-body-2">{{ faq.answer }}</p>
                          </v-expansion-panel-text>
                        </v-expansion-panel>
                      </v-expansion-panels>
                    </v-card>

                    <v-card class="mb-6" variant="outlined">
                      <v-card-title class="text-h5">联系我们</v-card-title>
                      <v-card-text>
                        <p class="text-body-1 mb-4">
                          如果您有任何问题或需要帮助，请随时与我们联系。
                        </p>
                        <div class="contact-methods">
                          <div class="d-flex align-center mb-4">
                            <v-icon color="primary" class="mr-3">mdi-email</v-icon>
                            <div>
                              <h4 class="text-subtitle-1 font-weight-medium">电子邮件</h4>
                              <p class="text-body-2">support@example.com</p>
                            </div>
                          </div>

                          <div class="d-flex align-center mb-4">
                            <v-icon color="primary" class="mr-3">mdi-phone</v-icon>
                            <div>
                              <h4 class="text-subtitle-1 font-weight-medium">电话支持</h4>
                              <p class="text-body-2">+86 123 4567 8910</p>
                              <p class="text-caption text-medium-emphasis">周一至周五 9:00-18:00</p>
                            </div>
                          </div>

                          <div class="d-flex align-center">
                            <v-icon color="primary" class="mr-3">mdi-chat</v-icon>
                            <div>
                              <h4 class="text-subtitle-1 font-weight-medium">在线聊天</h4>
                              <p class="text-body-2">通过我们的网站启动实时聊天</p>
                            </div>
                          </div>
                        </div>
                      </v-card-text>
                      <v-card-actions>
                        <v-btn color="primary" variant="tonal" prepend-icon="mdi-chat" block
                          >立即开始聊天</v-btn
                        >
                      </v-card-actions>
                    </v-card>

                    <v-card variant="outlined">
                      <v-card-title class="text-h5">反馈意见</v-card-title>
                      <v-card-text>
                        <p class="text-body-1 mb-4">
                          我们重视您的反馈意见，请告诉我们如何改进我们的产品。
                        </p>
                        <v-form ref="feedbackForm">
                          <v-textarea
                            v-model="feedbackText"
                            label="您的反馈"
                            variant="outlined"
                            rows="4"
                            auto-grow
                            placeholder="请在此分享您的想法和建议..."
                            class="mb-3 with-label-animation"
                          ></v-textarea>
                          <v-btn
                            color="primary"
                            variant="elevated"
                            prepend-icon="mdi-send"
                            class="save-btn"
                            @click="submitFeedback"
                            >提交反馈</v-btn
                          >
                        </v-form>
                      </v-card-text>
                    </v-card>
                  </div>
                </v-window-item>
              </v-window>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>

    <!-- 编辑个人资料对话框 -->
    <v-dialog v-model="editProfileDialog" max-width="500">
      <v-card class="edit-profile-dialog">
        <v-card-title class="text-h5 pa-4">
          编辑个人资料
          <v-spacer></v-spacer>
          <v-btn icon variant="text" @click="editProfileDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text>
          <v-form ref="quickEditForm" v-model="quickEditValid">
            <v-text-field
              v-model="editedUserData.displayName"
              label="显示名称"
              variant="outlined"
              placeholder="请输入您的显示名称"
              :rules="nameRules"
              class="mb-4 with-label-animation"
              required
            ></v-text-field>

            <v-text-field
              v-model="editedUserData.email"
              label="电子邮箱"
              variant="outlined"
              placeholder="请输入您的电子邮箱"
              :rules="emailRules"
              class="mb-4 with-label-animation"
              required
            ></v-text-field>
          </v-form>
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn variant="text" color="primary" @click="editProfileDialog = false">取消</v-btn>
          <v-btn
            variant="elevated"
            color="primary"
            :disabled="!quickEditValid"
            @click="saveQuickEdit"
            :loading="saving"
            class="save-btn"
          >
            保存
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 文件上传隐藏输入 -->
    <input
      type="file"
      ref="fileInput"
      accept="image/png, image/jpeg, image/jpg"
      style="display: none"
      @change="handleFileUpload"
    />

    <!-- 加载动画覆盖层 -->
    <div class="overlay" v-if="loading">
      <v-progress-circular indeterminate size="64" color="primary"></v-progress-circular>
    </div>
  </v-app>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { userService } from '@/services'
import { availableHost } from '@/utils'
import axios from 'axios'
import { imageToBase64 } from '@/utils'

// 背景视频
const backgroundVideo = ref(
  'https://kstatic.googleusercontent.com/files/65da8f0326427a8e71bfa678348f3fa1a4bb1660e0b013591eb3bfd9df455bd5a3334249de61229029be7d2fd7cf18d4e143728b7e0702b6bde6251a9c64511a',
)

// 用户数据
const userData = reactive({
  displayName: '张三',
  email: 'zhangsan@example.com',
  phone: '13800138000',
  bio: '热爱生活，热爱编程，一个普通的开发者。',
  language: '简体中文',
})
const account = ref('') // 储存账号，用于修改username

// 菜单项
const menuItems = ref([
  { title: '个人信息', icon: 'mdi-account-outline', value: 'profile' },
  { title: '安全设置', icon: 'mdi-shield-outline', value: 'security' },
  { title: '通知设置', icon: 'mdi-bell-outline', value: 'notifications' },
  { title: '外观设置', icon: 'mdi-palette-outline', value: 'appearance' },
  { title: '帮助与支持', icon: 'mdi-help-circle-outline', value: 'help' },
])

// 激活的菜单项
const activeMenuItem = ref('profile')

// 头像数据
const userAvatar = ref('https://randomuser.me/api/portraits/men/85.jpg')

// 表单验证规则
const nameRules = [
  (v) => !!v || '显示名称不能为空',
  (v) => (v && v.length >= 2) || '显示名称至少需要2个字符',
]
const emailRules = [
  (v) => !!v || '电子邮箱不能为空',
  (v) => /.+@.+\..+/.test(v) || '电子邮箱格式不正确',
]

// 表单状态
const formValid = ref(true)
const quickEditValid = ref(true)
const profileForm = ref(null)
const quickEditForm = ref(null)
const fileInput = ref(null)
const feedbackForm = ref(null)

// 界面状态
const loading = ref(false)
const uploading = ref(false)
const saving = ref(false)
const showSuccess = ref(false)
const editProfileDialog = ref(false)
const editedUserData = reactive({
  displayName: '',
  email: '',
})

// 语言选项
const languageOptions = ref(['简体中文', 'English', '日本語', '한국어', 'Español', 'Français'])

// 安全设置
const twoFactorEnabled = ref(true)

// 通知设置
const notifications = reactive({
  email: {
    news: true,
    activity: true,
    offers: false,
  },
  app: {
    updates: true,
    newFeatures: true,
    tips: false,
  },
})

// 外观设置
const themeMode = ref('system')
const themeColor = ref('primary')
const fontSize = ref(100)
const themeColors = ref([
  { name: '默认蓝', value: 'primary' },
  { name: '翡翠绿', value: 'success' },
  { name: '深紫色', value: 'purple' },
  { name: '橙色', value: 'orange' },
  { name: '靛蓝色', value: 'indigo' },
  { name: '玫瑰红', value: 'pink' },
])

// 帮助与支持
const feedbackText = ref('')
const faqs = ref([
  {
    question: '如何更改我的密码？',
    answer:
      '您可以在"安全设置"页面中找到"密码"选项，点击"修改密码"按钮，然后按照提示操作即可完成密码更改。',
  },
  {
    question: '如何启用两步验证？',
    answer:
      '在"安全设置"页面中，找到"两步验证"选项，将开关切换到启用状态，然后按照系统提示完成设置即可。',
  },
  {
    question: '忘记密码怎么办？',
    answer: '在登录页面点击"忘记密码"链接，输入您的电子邮箱地址，我们将向您发送密码重置链接。',
  },
  {
    question: '如何更改我的电子邮箱？',
    answer:
      '在"个人信息设置"页面中，您可以编辑您的电子邮箱地址。更改后，系统会向新邮箱发送一封验证邮件，验证通过后即可完成更改。',
  },
  {
    question: '如何删除我的账户？',
    answer:
      '请联系我们的客户支持团队，他们将指导您完成账户删除流程。请注意，账户删除是不可逆的，所有数据将被永久删除。',
  },
])

// 生命周期钩子
onMounted(() => {
  const username = localStorage.getItem('username')
  axios.post(`${availableHost}find/`, { username }).then(({ data }) => {
    userData.displayName = data.username
    userData.email = data.email
    account.value = data.account
    if (data.image) {
      userAvatar.value = `data:image/jpeg;base64,${data.image}`
    }
  })
  // 初始化编辑数据
  resetEditedData()
})

// 方法
// 打开文件选择对话框
const openFileDialog = () => {
  fileInput.value.click()
}

// TODO:加上更新信息的逻辑代码
const updateInformation = async () => {
  userService.changePersonalMessage({
    account: account.value,
    image: await imageToBase64(userAvatar.value),
    username: userData.displayName,
    email: userData.email,
  })
}

// 处理文件上传
const handleFileUpload = (event) => {
  const file = event.target.files[0]
  if (!file) return

  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg']
  if (!allowedTypes.includes(file.type)) {
    alert('只支持 JPG 或 PNG 格式的图片！')
    return
  }

  uploading.value = true

  // 模拟上传过程
  setTimeout(() => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      userAvatar.value = reader.result
      uploading.value = false

      // 显示成功信息
      showSuccess.value = true
      setTimeout(() => {
        showSuccess.value = false
      }, 3000)
    }
  }, 1500)
}

// 保存个人资料
const saveProfile = () => {
  if (!formValid.value) return

  saving.value = true

  // 模拟保存过程
  setTimeout(() => {
    saving.value = false
    showSuccess.value = true

    // 自动隐藏成功提示
    setTimeout(() => {
      showSuccess.value = false
    }, 3000)
  }, 1500)
}

// 重置表单
const resetForm = () => {
  if (profileForm.value) {
    profileForm.value.reset()
  }
}

// 打开编辑个人资料对话框
const openEditProfileDialog = () => {
  resetEditedData()
  editProfileDialog.value = true
}

// 重置编辑数据
const resetEditedData = () => {
  editedUserData.displayName = userData.displayName
  editedUserData.email = userData.email
}

// 保存快速编辑
const saveQuickEdit = () => {
  if (!quickEditValid.value) return

  saving.value = true

  // 模拟保存过程
  setTimeout(() => {
    userData.displayName = editedUserData.displayName
    userData.email = editedUserData.email

    saving.value = false
    editProfileDialog.value = false
    showSuccess.value = true

    // 自动隐藏成功提示
    setTimeout(() => {
      showSuccess.value = false
    }, 3000)
  }, 1500)
}

// 保存通知设置
const saveNotifications = () => {
  saving.value = true

  // 模拟保存过程
  setTimeout(() => {
    saving.value = false
    showSuccess.value = true

    // 自动隐藏成功提示
    setTimeout(() => {
      showSuccess.value = false
    }, 3000)
  }, 1500)
}

// 保存外观设置
const saveAppearance = () => {
  saving.value = true

  // 模拟保存过程
  setTimeout(() => {
    saving.value = false
    showSuccess.value = true

    // 自动隐藏成功提示
    setTimeout(() => {
      showSuccess.value = false
    }, 3000)
  }, 1500)
}

// 提交反馈
const submitFeedback = () => {
  if (!feedbackText.value) return

  saving.value = true

  // 模拟提交过程
  setTimeout(() => {
    feedbackText.value = ''
    saving.value = false
    showSuccess.value = true

    // 自动隐藏成功提示
    setTimeout(() => {
      showSuccess.value = false
    }, 3000)
  }, 1500)
}
</script>

<style scoped>
/* 背景视频样式 */
.video-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  overflow: hidden;
}

.video-background video {
  position: absolute;
  top: 50%;
  left: 50%;
  min-width: 100%;
  min-height: 100%;
  width: auto;
  height: auto;
  transform: translateX(-50%) translateY(-50%);
  object-fit: cover;
}

.video-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(var(--v-theme-surface-rgb), 0.85);
  backdrop-filter: blur(20px);
}

/* 主内容区域样式 */
.main-content {
  position: relative;
  padding: 16px 0;
}

/* 侧边导航卡片样式 */
.side-nav-card {
  position: sticky;
  top: 16px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  background-color: rgba(var(--v-theme-surface-variant-rgb), 0.6) !important;
  backdrop-filter: blur(8px);
  border: 1px solid rgba(var(--v-theme-outline-variant-rgb), 0.1);
}

.side-nav-list {
  padding: 8px;
}

.user-info-container {
  position: relative;
  transition: all 0.3s ease;
}

.avatar-container {
  position: relative;
  overflow: hidden;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.avatar-container:hover {
  transform: scale(1.05);
}

.avatar-edit-btn {
  position: absolute;
  bottom: 0;
  right: 0;
  margin: 4px;
  opacity: 0;
  transform: scale(0.8);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.avatar-container:hover .avatar-edit-btn {
  opacity: 1;
  transform: scale(1);
}

.menu-item {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  margin: 4px 0;
}

.menu-item:hover {
  background-color: rgba(var(--v-theme-primary-rgb), 0.05);
  transform: translateX(4px);
}

/* 主要内容卡片样式 */
.content-card {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  background-color: rgba(var(--v-theme-surface-rgb), 0.8) !important;
  backdrop-filter: blur(12px);
  border: 1px solid rgba(var(--v-theme-outline-variant-rgb), 0.1);
  transform-origin: center;
}

.content-card.active-card {
  animation: cardEnter 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes cardEnter {
  0% {
    opacity: 0.5;
    transform: scale(0.98);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

/* 移动端工具栏样式 */
.toolbar-card {
  background-color: rgba(var(--v-theme-surface-rgb), 0.8) !important;
  backdrop-filter: blur(12px);
  border: 1px solid rgba(var(--v-theme-outline-variant-rgb), 0.1);
}

.mobile-user-menu {
  min-width: 200px;
}

/* 表单和输入样式 */
.with-label-animation :deep(.v-field__input) {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.with-label-animation:focus-within :deep(.v-field__input) {
  transform: translateY(2px);
}

.with-label-animation :deep(.v-field__outline) {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.with-label-animation:focus-within :deep(.v-field__outline) {
  border-width: 2px;
}

/* 头像上传区域样式 */
.profile-avatar {
  position: relative;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 3px solid rgba(var(--v-theme-primary-rgb), 0.2);
}

.profile-avatar:hover {
  transform: scale(1.02);
}

.avatar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.profile-avatar:hover .avatar-overlay {
  opacity: 1;
}

.avatar-change-btn {
  transform: scale(0.8);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.profile-avatar:hover .avatar-change-btn {
  transform: scale(1);
}

.upload-btn {
  position: relative;
  overflow: hidden;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.upload-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* 保存按钮样式 */
.save-btn {
  position: relative;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.save-btn:not(:disabled):hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.save-btn::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 5px;
  height: 5px;
  background: rgba(255, 255, 255, 0.5);
  opacity: 0;
  border-radius: 100%;
  transform: scale(1, 1) translate(-50%);
  transform-origin: 50% 50%;
}

.save-btn:hover::after {
  animation: ripple 1s ease-out;
}

@keyframes ripple {
  0% {
    transform: scale(0, 0);
    opacity: 0.5;
  }
  100% {
    transform: scale(20, 20);
    opacity: 0;
  }
}

/* 成功提示动画 */
.success-alert {
  animation: slideDown 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes slideDown {
  0% {
    opacity: 0;
    transform: translateY(-20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 主题颜色选择样式 */
.theme-color-chip {
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  border: 2px solid transparent;
}

.theme-color-chip:hover {
  transform: scale(1.05);
}

.theme-color-chip.selected-theme {
  border: 2px solid currentColor;
  transform: scale(1.05);
}

.theme-toggle-btn {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.font-size-preview {
  border: 1px solid rgba(var(--v-theme-outline-variant-rgb), 0.5);
  border-radius: 8px;
  transition: all 0.3s ease;
}

/* 编辑对话框样式 */
.edit-profile-dialog {
  background-color: rgba(var(--v-theme-surface-rgb), 0.95) !important;
  backdrop-filter: blur(12px);
  border: 1px solid rgba(var(--v-theme-outline-variant-rgb), 0.1);
  animation: dialogEnter 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes dialogEnter {
  0% {
    opacity: 0;
    transform: scale(0.9);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

/* 加载动画覆盖层 */
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(var(--v-theme-surface-rgb), 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(5px);
}

/* 响应式样式调整 */
@media (max-width: 960px) {
  .profile-avatar-section {
    width: 100%;
    align-items: center;
  }

  .profile-form {
    width: 100%;
  }
}

@media (min-width: 961px) {
  .profile-avatar-section {
    min-width: 250px;
  }
}
</style>

<style scoped>
/* 全局样式 */
body {
  overflow-x: hidden;
}

.v-application {
  background-color: transparent !important;
}

/* 滑动过渡效果 */
.v-window__container {
  transition: height 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.v-window-item {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 滚动条美化 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(var(--v-theme-surface-variant-rgb), 0.3);
}

::-webkit-scrollbar-thumb {
  background: rgba(var(--v-theme-primary-rgb), 0.5);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(var(--v-theme-primary-rgb), 0.7);
}
</style>
