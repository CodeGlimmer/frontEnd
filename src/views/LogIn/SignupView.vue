<template>
  <v-container fluid class="register-container d-flex align-center justify-center">
    <div class="animated-background" :class="{ 'dark-theme': isDarkTheme }">
      <div class="floating-circles">
        <div class="circle" v-for="n in 20" :key="n"></div>
      </div>
    </div>
    <div class="blur-overlay"></div>

    <v-card
      class="register-card mx-auto"
      elevation="3"
      icon="mdi-weather-sunny"
      max-width="450"
      rounded="lg"
      :loading="loading"
      :disabled="loading"
      :class="{ 'dark-card': isDarkTheme }"
    >
      <div class="card-shine-effect"></div>
      <div class="theme-toggle-wrapper">
        <v-btn
          :icon="isDarkTheme ? 'mdi-weather-night' : 'mdi-weather-sunny'"
          density="comfortable"
          variant="text"
          @click="toggleTheme"
          class="theme-toggle-btn"
          :color="isDarkTheme ? 'amber' : 'indigo-darken-3'"
        >
          <v-icon :color="isDarkTheme ? 'amber' : 'indigo-darken-3'">{{
            isDarkTheme ? 'mdi-weather-night' : 'mdi-weather-sunny'
          }}</v-icon>
          <v-tooltip activator="parent" location="bottom">
            Toggle {{ isDarkTheme ? 'Light' : 'Dark' }} Mode
          </v-tooltip>
        </v-btn>
      </div>

      <v-card-item>
        <v-row justify="center" class="mt-4 mb-2">
          <v-avatar
            size="80"
            class="elevation-4 animate-bounce"
            :class="isDarkTheme ? 'dark-gradient' : 'primary-gradient'"
          >
            <v-icon size="x-large" color="white">mdi-account-plus</v-icon>
          </v-avatar>
        </v-row>
        <h1
          class="text-h4 text-center mt-4 font-weight-bold animate-title"
          :class="isDarkTheme ? 'text-amber' : 'text-primary'"
        >
          Create Account
        </h1>
        <p class="text-subtitle-1 text-center text-medium-emphasis">Join us today</p>
      </v-card-item>

      <v-card-text>
        <v-form @submit.prevent="handleSignup" ref="form">
          <v-text-field
            v-model="username"
            label="Username"
            prepend-inner-icon="mdi-account-outline"
            variant="outlined"
            :color="isDarkTheme ? 'amber' : 'primary'"
            class="mb-3 animate-slide-fade custom-field"
            :rules="[rules.required, rules.username]"
            :error-messages="errors.username"
            @focus="clearError('username')"
            :class="{ 'dark-field': isDarkTheme }"
          ></v-text-field>

          <v-text-field
            v-model="password"
            label="Password"
            prepend-inner-icon="mdi-lock-outline"
            :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
            @click:append-inner="showPassword = !showPassword"
            :type="showPassword ? 'text' : 'password'"
            variant="outlined"
            :color="isDarkTheme ? 'amber' : 'primary'"
            class="mb-3 animate-slide-fade custom-field"
            :rules="[rules.required, rules.password]"
            :error-messages="errors.password"
            @focus="clearError('password')"
            :class="{ 'dark-field': isDarkTheme }"
          ></v-text-field>

          <v-text-field
            v-model="confirmPassword"
            label="Confirm Password"
            prepend-inner-icon="mdi-lock-check-outline"
            :append-inner-icon="showConfirmPassword ? 'mdi-eye-off' : 'mdi-eye'"
            @click:append-inner="showConfirmPassword = !showConfirmPassword"
            :type="showConfirmPassword ? 'text' : 'password'"
            variant="outlined"
            :color="isDarkTheme ? 'amber' : 'primary'"
            class="mb-3 animate-slide-fade custom-field"
            :rules="[rules.required, rules.confirmPassword]"
            :error-messages="errors.confirmPassword"
            @focus="clearError('confirmPassword')"
            :class="{ 'dark-field': isDarkTheme }"
          ></v-text-field>

          <!-- label原话是这个：I agree to the Terms of Service and Privacy Policy -->
          <v-checkbox
            v-model="agreeTerms"
            label="I agree to the ToS & PP"
            :color="isDarkTheme ? 'amber' : 'primary'"
            hide-details
            class="mb-4 animate-fade"
            :rules="[rules.agreeTerms]"
            :error-messages="errors.agreeTerms"
            @change="clearError('agreeTerms')"
          >
          </v-checkbox>

          <v-btn
            :color="isDarkTheme ? 'amber' : 'primary'"
            block
            size="large"
            type="submit"
            class="mt-2 register-submit-btn"
            :class="isDarkTheme ? 'dark-gradient' : 'primary-gradient'"
            elevation="2"
            :loading="loading"
            rounded="lg"
          >
            <span class="btn-content">Create Account</span>
            <template v-slot:loader>
              <v-progress-circular indeterminate color="white"></v-progress-circular>
            </template>
          </v-btn>
        </v-form>
      </v-card-text>

      <v-divider class="mt-3"></v-divider>

      <v-card-actions class="d-flex justify-center pa-4">
        <p class="text-body-2 text-medium-emphasis me-2">Already have an account?</p>
        <v-btn
          variant="text"
          :color="isDarkTheme ? 'amber' : 'primary'"
          class="login-link-btn"
          @click="goToLogin"
        >
          Sign In
        </v-btn>
      </v-card-actions>

      <v-snackbar
        v-model="snackbar.show"
        :color="snackbar.color"
        timeout="3000"
        location="top"
        rounded="pill"
        elevation="4"
      >
        {{ snackbar.text }}
        <template v-slot:actions>
          <v-btn
            color="white"
            icon="mdi-close"
            @click="snackbar.show = false"
            variant="text"
            size="small"
          ></v-btn>
        </template>
      </v-snackbar>
    </v-card>
  </v-container>
</template>

<script>
import { useThemeStore } from '@/stores'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import { userService } from '@/services'

export default {
  name: 'RegisterComponent',
  setup() {
    const themeStore = useThemeStore()
    const { theme } = storeToRefs(themeStore)
    const { changeTheme } = themeStore

    // 计算属性，用于判断是否为深色主题
    const isDarkTheme = computed(() => theme.value === 'dark')

    // 切换主题方法
    const toggleTheme = () => {
      changeTheme()
      document.body.classList.toggle('dark-mode')
    }

    return { isDarkTheme, toggleTheme }
  },
  data() {
    return {
      username: '',
      password: '',
      confirmPassword: '',
      agreeTerms: false,
      showPassword: false,
      showConfirmPassword: false,
      loading: false,
      errors: {
        username: '',
        password: '',
        confirmPassword: '',
        agreeTerms: '',
      },
      rules: {
        required: (value) => !!value || 'This field is required',
        username: (value) => {
          if (!value) return true
          if (value.length < 3) return 'Username must be at least 3 characters'
          if (value.length > 20) return 'Username must be less than 20 characters'
          if (!/^[a-zA-Z0-9_]+$/.test(value))
            return 'Username can only contain letters, numbers and underscore'
          return true
        },
        password: (value) => {
          if (!value) return true
          if (value.length < 6) return 'Password must be at least 6 characters'
          if (value.length > 30) return 'Password must be less than 30 characters'
          if (!/\d/.test(value)) return 'Password must contain at least one number'
          if (!/[a-zA-Z]/.test(value)) return 'Password must contain at least one letter'
          return true
        },
        confirmPassword: (value) => {
          if (!value) return true
          return value === this.password || 'Passwords do not match'
        },
        agreeTerms: (value) => value || 'You must agree to the terms and conditions to continue',
      },
      snackbar: {
        show: false,
        text: '',
        color: 'success',
      },
    }
  },
  mounted() {
    // 页面加载时应用当前主题
    if (this.isDarkTheme) {
      document.body.classList.add('dark-mode')
    }

    // 添加键盘事件监听器 - 按Enter键提交
    document.addEventListener('keydown', this.handleKeyDown)

    // 修复确认密码验证规则
    this.rules.confirmPassword = (value) => {
      if (!value) return true
      return value === this.password || 'Passwords do not match'
    }
  },
  beforeUnmount() {
    // 清除事件监听器
    document.removeEventListener('keydown', this.handleKeyDown)
  },
  methods: {
    async handleSignup() {
      // 表单验证
      if (!this.$refs.form.validate()) return

      this.loading = true

      try {
        // 创建用户对象
        const user = {
          username: this.username,
          password: this.password,
        }

        // 调用注册API
        await userService.register(user)

        // 注册成功
        this.showSnackbar('Registration successful! Redirecting to login...', 'success')

        // 延迟后跳转到登录页面
        setTimeout(() => {
          this.$router.push('/')
        }, 2000)
      } catch (error) {
        console.error('Registration error:', error)

        if (error.response) {
          // 服务器返回错误响应
          const statusCode = error.response.status
          const errorData = error.response.data

          if (statusCode === 409) {
            // 用户名已存在
            if (errorData.field === 'username') {
              this.errors.username = 'Username already exists'
            }
            this.showSnackbar(
              errorData.message || 'Registration failed, please try with different details',
              'error',
            )
          } else {
            this.showSnackbar(errorData.message || 'Registration failed, please try again', 'error')
          }
        } else if (error.request) {
          // 请求发送但没有收到响应
          this.showSnackbar('Network error, please check your connection', 'error')
        } else {
          // 请求设置时出错
          this.showSnackbar('Registration failed, please try again', 'error')
        }
      } finally {
        this.loading = false
      }
    },
    clearError(field) {
      this.errors[field] = ''
    },
    goToLogin() {
      this.$router.push('/')
    },
    showSnackbar(text, color) {
      this.snackbar.text = text
      this.snackbar.color = color
      this.snackbar.show = true
    },
    handleKeyDown(e) {
      // 当用户按下Enter键时尝试注册
      if (e.key === 'Enter' && !this.loading) {
        this.handleSignup()
      }
    },
  },
}
</script>

<style scoped>
.register-container {
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  transition: background-color 0.5s ease;
}

.animated-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    130deg,
    #e8f5e9 0%,
    #e3f2fd 25%,
    #ede7f6 50%,
    #e1f5fe 75%,
    #e0f7fa 100%
  );
  background-size: 400% 400%;
  animation: gradientBG 15s ease infinite;
  z-index: -2;
  overflow: hidden;
  transition: all 0.8s ease;
}

.animated-background.dark-theme {
  background: linear-gradient(to left top, #212121, #212121);
}

.floating-circles {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  z-index: 1;
}

.circle {
  position: absolute;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.2) 100%);
  border-radius: 50%;
  opacity: 0.4;
  animation: float-up 15s infinite linear;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

.dark-theme .circle {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.1) 100%);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.circle:nth-child(1) {
  width: 30px;
  height: 30px;
  left: 10%;
  top: 100%;
  animation-delay: 0s;
  animation-duration: 20s;
}
.circle:nth-child(2) {
  width: 20px;
  height: 20px;
  left: 20%;
  top: 100%;
  animation-delay: 2s;
  animation-duration: 15s;
}
.circle:nth-child(3) {
  width: 50px;
  height: 50px;
  left: 30%;
  top: 100%;
  animation-delay: 4s;
  animation-duration: 25s;
}
.circle:nth-child(4) {
  width: 15px;
  height: 15px;
  left: 40%;
  top: 100%;
  animation-delay: 6s;
  animation-duration: 18s;
}
.circle:nth-child(5) {
  width: 35px;
  height: 35px;
  left: 50%;
  top: 100%;
  animation-delay: 8s;
  animation-duration: 22s;
}
.circle:nth-child(6) {
  width: 25px;
  height: 25px;
  left: 60%;
  top: 100%;
  animation-delay: 10s;
  animation-duration: 17s;
}
.circle:nth-child(7) {
  width: 40px;
  height: 40px;
  left: 70%;
  top: 100%;
  animation-delay: 12s;
  animation-duration: 23s;
}
.circle:nth-child(8) {
  width: 18px;
  height: 18px;
  left: 80%;
  top: 100%;
  animation-delay: 14s;
  animation-duration: 16s;
}
.circle:nth-child(9) {
  width: 32px;
  height: 32px;
  left: 90%;
  top: 100%;
  animation-delay: 16s;
  animation-duration: 21s;
}
.circle:nth-child(10) {
  width: 28px;
  height: 28px;
  left: 5%;
  top: 100%;
  animation-delay: 18s;
  animation-duration: 19s;
}
.circle:nth-child(11) {
  width: 22px;
  height: 22px;
  left: 15%;
  top: 100%;
  animation-delay: 20s;
  animation-duration: 14s;
}
.circle:nth-child(12) {
  width: 38px;
  height: 38px;
  left: 25%;
  top: 100%;
  animation-delay: 22s;
  animation-duration: 24s;
}
.circle:nth-child(13) {
  width: 16px;
  height: 16px;
  left: 35%;
  top: 100%;
  animation-delay: 24s;
  animation-duration: 13s;
}
.circle:nth-child(14) {
  width: 45px;
  height: 45px;
  left: 45%;
  top: 100%;
  animation-delay: 26s;
  animation-duration: 26s;
}
.circle:nth-child(15) {
  width: 27px;
  height: 27px;
  left: 55%;
  top: 100%;
  animation-delay: 28s;
  animation-duration: 20s;
}
.circle:nth-child(16) {
  width: 33px;
  height: 33px;
  left: 65%;
  top: 100%;
  animation-delay: 5s;
  animation-duration: 16s;
}
.circle:nth-child(17) {
  width: 19px;
  height: 19px;
  left: 75%;
  top: 100%;
  animation-delay: 9s;
  animation-duration: 21s;
}
.circle:nth-child(18) {
  width: 42px;
  height: 42px;
  left: 85%;
  top: 100%;
  animation-delay: 13s;
  animation-duration: 24s;
}
.circle:nth-child(19) {
  width: 23px;
  height: 23px;
  left: 95%;
  top: 100%;
  animation-delay: 17s;
  animation-duration: 18s;
}
.circle:nth-child(20) {
  width: 37px;
  height: 37px;
  left: 3%;
  top: 100%;
  animation-delay: 21s;
  animation-duration: 22s;
}

.blur-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: -1;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  background: rgba(255, 255, 255, 0.05);
  transition: background-color 0.6s ease;
}

.dark-mode .blur-overlay {
  background: rgba(0, 0, 0, 0.05);
}

@keyframes gradientBG {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

@keyframes float-up {
  0% {
    transform: translateY(0) rotate(0deg);
    opacity: 0;
  }
  10% {
    opacity: 0.4;
    transform: translateY(-5%) rotate(45deg);
  }
  80% {
    opacity: 0.3;
  }
  100% {
    transform: translateY(-1000%) rotate(360deg);
    opacity: 0;
  }
}

.register-card {
  overflow: hidden;
  transition:
    transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275),
    box-shadow 0.5s ease,
    background-color 0.6s ease;
  background-color: rgba(255, 255, 255, 0.85) !important;
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  position: relative;
  transform-style: preserve-3d;
  perspective: 1000px;
}

.register-card.dark-card {
  background-color: #282828 !important;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.register-card:hover {
  transform: translateY(-12px) scale(1.01);
  box-shadow: 0 22px 45px rgba(0, 0, 0, 0.15) !important;
}

.card-shine-effect {
  position: absolute;
  top: 0;
  left: -100%;
  width: 40%;
  height: 100%;
  background: linear-gradient(
    to right,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.3) 50%,
    rgba(255, 255, 255, 0) 100%
  );
  transform: skewX(-25deg);
  animation: shine 5s infinite;
}

.dark-card .card-shine-effect {
  background: linear-gradient(
    to right,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.15) 50%,
    rgba(255, 255, 255, 0) 100%
  );
}

@keyframes shine {
  0%,
  100% {
    left: -100%;
  }
  40% {
    left: 100%;
  }
}

.theme-toggle-wrapper {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 5;
}

.theme-toggle-btn {
  border-radius: 50%;
  transition: all 0.3s ease;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.2);
  opacity: 0.85;
  transform: rotate(0deg);
}

.theme-toggle-btn:hover {
  transform: rotate(45deg);
  opacity: 1;
  box-shadow: 0 5px 12px rgba(0, 0, 0, 0.3);
}

.primary-gradient {
  background: linear-gradient(135deg, #3f51b5, #2196f3);
}

.dark-gradient {
  background: linear-gradient(135deg, #ffa000, #ff6f00);
}

.register-submit-btn {
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  overflow: hidden;
  position: relative;
  letter-spacing: 1px;
  font-weight: 500;
  transform: translateZ(0);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.register-submit-btn:not(.v-btn--loading):hover {
  transform: translateY(-3px) scale(1.02);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
}

.btn-content {
  position: relative;
  z-index: 1;
}

.register-submit-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: all 0.4s ease;
}

.register-submit-btn:hover::before {
  left: 100%;
}

.register-submit-btn::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 5px;
  height: 5px;
  background: rgba(255, 255, 255, 0.6);
  opacity: 0;
  border-radius: 100%;
  transform: scale(1, 1) translate(-50%);
  transform-origin: 50% 50%;
}

.register-submit-btn:active::after {
  animation: ripple 0.8s ease-out;
}

.custom-field {
  transition: all 0.3s ease;
  border-radius: 8px;
}

.custom-field:focus-within {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
}

.dark-field.v-text-field .v-field__outline {
  --v-field-border-opacity: 0.3;
}

.dark-field:focus-within {
  box-shadow: 0 4px 12px rgba(255, 193, 7, 0.25);
}

.login-link-btn {
  position: relative;
  overflow: hidden;
  transition: all 0.4s ease;
}

.login-link-btn:hover {
  text-decoration: none;
  opacity: 0.9;
  transform: translateY(-2px);
  letter-spacing: 0.5px;
}

.login-link-btn::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background: currentColor;
  transform: scaleX(0);
  transform-origin: right;
  transition: transform 0.4s ease;
}

.login-link-btn:hover::after {
  transform: scaleX(1);
  transform-origin: left;
}

@keyframes ripple {
  0% {
    transform: scale(0, 0);
    opacity: 0.6;
  }
  100% {
    transform: scale(25, 25);
    opacity: 0;
  }
}

.animate-bounce {
  animation: bounce 1.2s cubic-bezier(0.28, 0.84, 0.42, 1);
}

@keyframes bounce {
  0%,
  20%,
  50%,
  80%,
  100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-25px);
  }
  60% {
    transform: translateY(-15px);
  }
}

.animate-title {
  animation: titleGradient 5s ease infinite alternate;
  transition: color 0.5s ease;
}

@keyframes titleGradient {
  0% {
    background-position: 0% 50%;
  }
  100% {
    background-position: 100% 50%;
  }
}

.animate-slide-fade {
  animation: slideFade 0.7s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.animate-fade {
  animation: fade 0.9s ease-out;
}

@keyframes slideFade {
  0% {
    opacity: 0;
    transform: translateY(25px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fade {
  0% {
    opacity: 0;
  }
  50% {
    opacity: 0.5;
  }
  100% {
    opacity: 1;
  }
}

/* 触摸设备优化 */
@media (hover: none) {
  .register-card:hover {
    transform: none;
    box-shadow: 0 16px 40px rgba(0, 0, 0, 0.12) !important;
  }

  .register-submit-btn:hover {
    transform: none;
  }

  .register-submit-btn::before {
    animation: shine 5s infinite;
  }
}

/* 响应式设计 */
@media (max-width: 600px) {
  .register-card {
    max-width: 90%;
    margin: 0 auto;
  }

  .wave {
    height: 70px;
  }
}

/* Material Design 3 风格的组件响应状态 */
.v-btn--active {
  transform: scale(0.95);
}

.v-btn:active {
  transition: transform 0.1s;
  transform: scale(0.95);
}

/* 动态背景色变换 - 与当前主题相关 */
@keyframes subtleColorShift {
  0% {
    filter: hue-rotate(0deg);
  }
  50% {
    filter: hue-rotate(10deg);
  }
  100% {
    filter: hue-rotate(0deg);
  }
}

.register-container {
  animation: subtleColorShift 30s infinite alternate;
}

/* 修改后的样式 */
.text-amber {
  color: #ffa000 !important;
  background: linear-gradient(to right, #ffa000, #ff6f00);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
</style>
