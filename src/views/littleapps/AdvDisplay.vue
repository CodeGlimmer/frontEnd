<script setup>
import { ref, onMounted, onUnmounted, nextTick, computed } from 'vue'
import { useTheme } from 'vuetify'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger)

// Vuetify theme
const theme = useTheme()

// Reactive state
const isLoading = ref(true)
const heroRef = ref(null)
const statsRef = ref(null)
const featuresRef = ref(null)

// Theme-aware computed properties
const isDark = computed(() => theme.global.current.value.dark)

// const themeColors = computed(() => {
//   const current = theme.global.current.value.colors
//   return {
//     primary: current.primary,
//     secondary: current.secondary,
//     surface: current.surface,
//     background: current.background,
//     onSurface: current['on-surface'],
//     onPrimary: current['on-primary'],
//     outline: current.outline || (isDark.value ? '#938F99' : '#79747E'),
//     surfaceVariant: current['surface-variant'] || (isDark.value ? '#49454F' : '#E7E0EC'),
//     inverseSurface: current['inverse-surface'] || (isDark.value ? '#E6E1E5' : '#313033'),
//     inverseOnSurface: current['inverse-on-surface'] || (isDark.value ? '#313033' : '#E6E1E5'),
//   }
// })

// Stats data with theme-aware colors
const stats = ref([
  { value: 98, unit: '%', label: 'Customer Satisfaction', color: '#6750A4', icon: '😊' },
  { value: 15432, unit: '', label: 'Orders Processed', color: '#0061A4', icon: '📦' },
  { value: 127, unit: '', label: 'AGVs Deployed', color: '#006A6B', icon: '🤖' },
  { value: 24, unit: '/7', label: '24/7 Service', color: '#6B5B95', icon: '🕒' },
])

// Features data
const features = ref([
  {
    id: 1,
    title: 'Real-time Monitoring',
    subtitle: 'Track AGV Fleet Instantly',
    description:
      'Monitor your AGV fleet in real-time with our cutting-edge dashboard. Get instant updates on location, status, and performance metrics.',
    image:
      'https://cdn.prod.website-files.com/682997c5e8ae5cdd36dbfb58/68299852803880e0df98ccb4_18db8958-f850-40d6-b646-4b62b73898cf.avif',
    color: '#6750A4',
  },
  {
    id: 2,
    title: 'Smart Analytics',
    subtitle: 'Data-Driven Insights',
    description:
      'Leverage powerful analytics to optimize warehouse operations. Transform raw data into actionable business intelligence.',
    image:
      'https://cdn.prod.website-files.com/682997c5e8ae5cdd36dbfb58/68299852010ce568878d0d36_f6216b04-a7ae-48c5-ac8c-c5b26baa8dd9.avif',
    color: '#0061A4',
  },
  {
    id: 3,
    title: 'Seamless Integration',
    subtitle: 'Connect Everything',
    description:
      'Integrate with existing warehouse management systems effortlessly. Our platform adapts to your current workflow.',
    image:
      'https://cdn.prod.website-files.com/682997c5e8ae5cdd36dbfb58/6829985254277b39dc34cfbe_d0f458a4-5868-4295-abf8-9789b33a0966.avif',
    color: '#006A6B',
  },
])

// Animation timeline
let tl = null

// Initialize animations
const initAnimations = async () => {
  await nextTick()

  try {
    // Create main timeline
    tl = gsap.timeline()

    // Hero animation
    if (heroRef.value) {
      tl.from('.hero-title', {
        opacity: 0,
        y: 50,
        duration: 1,
        ease: 'power2.out',
      })
        .from(
          '.hero-subtitle',
          {
            opacity: 0,
            y: 30,
            duration: 0.8,
            ease: 'power2.out',
          },
          '-=0.5',
        )
        .from(
          '.hero-buttons',
          {
            opacity: 0,
            y: 20,
            duration: 0.6,
            ease: 'power2.out',
          },
          '-=0.3',
        )
    }

    // Stats counter animation - 优化触发条件
    if (statsRef.value) {
      // 创建多个触发条件以确保动画能够执行
      ScrollTrigger.create({
        trigger: statsRef.value,
        start: 'top 90%', // 更早触发
        end: 'bottom 10%',
        onEnter: () => {
          console.log('Stats animation triggered via ScrollTrigger')
          animateStats()
        },
        onEnterBack: () => {
          console.log('Stats animation triggered on scroll back')
          animateStats()
        },
        once: false, // 允许多次触发以确保动画执行
        markers: false, // 设为 true 可以在开发时看到触发点
      })

      // 备用触发机制 - Intersection Observer
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && entry.intersectionRatio > 0.3) {
              console.log('Stats animation triggered via IntersectionObserver')
              animateStats()
              observer.unobserve(entry.target) // 触发后停止观察
            }
          })
        },
        {
          threshold: [0.1, 0.3, 0.5],
          rootMargin: '50px 0px',
        },
      )

      observer.observe(statsRef.value)

      // 延迟触发机制 - 作为最后的备用方案
      setTimeout(() => {
        const rect = statsRef.value.getBoundingClientRect()
        const viewportHeight = window.innerHeight
        if (rect.top < viewportHeight && rect.bottom > 0) {
          console.log('Stats animation triggered via timeout fallback')
          animateStats()
        }
      }, 2000)
    }

    // Features animation
    if (featuresRef.value) {
      const featureCards = featuresRef.value.querySelectorAll('.feature-card')
      featureCards.forEach((card, index) => {
        ScrollTrigger.create({
          trigger: card,
          start: 'top 90%', // 更早触发
          onEnter: () => {
            gsap.from(card, {
              opacity: 0,
              y: 50,
              duration: 0.8,
              delay: index * 0.2,
              ease: 'power2.out',
            })
          },
          once: true,
        })
      })
    }

    isLoading.value = false
  } catch (error) {
    console.warn('Animation initialization failed:', error)
    isLoading.value = false
  }
}

// Animate stats counters - 优化动画逻辑
const animateStats = () => {
  // 防止重复执行
  if (statsRef.value?.dataset.animated === 'true') {
    return
  }

  if (statsRef.value) {
    statsRef.value.dataset.animated = 'true'
  }

  stats.value.forEach((stat, index) => {
    const element = document.querySelector(`[data-stat-index="${index}"] .stat-number`)
    if (element && element.textContent === '0') {
      // 只在数字为0时执行动画
      // 立即显示一些数字以提供即时反馈
      element.textContent = '1'

      gsap.fromTo(
        { value: 0 },
        {
          value: stat.value,
          duration: 2.5,
          delay: index * 0.15,
          ease: 'power2.out',
          onUpdate: function () {
            const currentValue = Math.floor(this.targets()[0].value)
            element.textContent = currentValue.toLocaleString()
          },
          onComplete: function () {
            // 确保最终显示正确的值
            element.textContent = stat.value.toLocaleString()
          },
        },
      )

      // 添加卡片动画效果
      const card = element.closest('.stat-card')
      if (card) {
        gsap.from(card, {
          scale: 0.9,
          opacity: 0.7,
          duration: 0.6,
          delay: index * 0.1,
          ease: 'back.out(1.7)',
        })
      }
    }
  })
}

// Lifecycle hooks
onMounted(() => {
  initAnimations()
})

onUnmounted(() => {
  // Clean up animations
  if (tl) tl.kill()
  ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
  gsap.killTweensOf('*')
})
</script>

<template>
  <div class="agv-display" :class="{ 'theme-dark': isDark }">
    <!-- Loading overlay -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-spinner"></div>
    </div>

    <!-- Navigation -->
    <nav class="navbar">
      <div class="nav-container">
        <div class="nav-brand">
          <div class="brand-icon">🤖</div>
          <span class="brand-text">AGV Monitor</span>
        </div>
        <div class="nav-links">
          <router-link to="/index/agvmonitoring" class="nav-link">AGV监控</router-link>
          <router-link to="/index/schedulingplanning" class="nav-link">数据分析</router-link>
          <router-link to="/index/setting" class="nav-link">联系我们</router-link>
          <button class="cta-button" @click="navigateToStart">
            <router-link to="/index">开始使用</router-link>
          </button>
        </div>
      </div>
    </nav>

    <!-- Hero Section -->
    <section ref="heroRef" class="hero-section">
      <div class="hero-container">
        <div class="hero-content">
          <h1 class="hero-title">
            Smart AGV Monitoring
            <span class="title-accent">Made Simple</span>
          </h1>
          <p class="hero-subtitle">
            Real-time fleet tracking, intelligent analytics, and seamless warehouse integration -
            all in one powerful platform designed for the modern logistics industry.
          </p>
          <div class="hero-buttons">
            <button class="primary-button" @click="navigateToTrial">免费试用</button>
            <button class="secondary-button" @click="navigateToDemo">观看演示</button>
          </div>
        </div>
        <div class="hero-visual">
          <div class="hero-card">
            <div class="card-header">
              <div class="status-indicator active"></div>
              <span>Live Monitoring</span>
            </div>
            <div class="card-content">
              <div class="metric">
                <span class="metric-label">Active AGVs</span>
                <span class="metric-value">24</span>
              </div>
              <div class="metric">
                <span class="metric-label">Efficiency</span>
                <span class="metric-value">98%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Stats Section -->
    <section ref="statsRef" class="stats-section">
      <div class="stats-container">
        <h2 class="stats-title">Trusted by Industry Leaders</h2>
        <div class="stats-grid">
          <div
            v-for="(stat, index) in stats"
            :key="index"
            :data-stat-index="index"
            class="stat-card"
            :style="{ '--accent-color': stat.color }"
          >
            <div class="stat-icon">{{ stat.icon }}</div>
            <div class="stat-number">0</div>
            <div class="stat-unit">{{ stat.unit }}</div>
            <div class="stat-label">{{ stat.label }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section ref="featuresRef" class="features-section">
      <div class="features-container">
        <div class="section-header">
          <h2 class="section-title">Powerful Features</h2>
          <p class="section-subtitle">Everything you need to manage your AGV fleet efficiently</p>
        </div>

        <div class="features-grid">
          <div
            v-for="feature in features"
            :key="feature.id"
            class="feature-card"
            :style="{ '--feature-color': feature.color }"
          >
            <div class="feature-image">
              <img :src="feature.image" :alt="feature.title" loading="lazy" />
            </div>
            <div class="feature-content">
              <div class="feature-header">
                <h3 class="feature-title">{{ feature.title }}</h3>
                <p class="feature-subtitle">{{ feature.subtitle }}</p>
              </div>
              <p class="feature-description">{{ feature.description }}</p>
              <button class="feature-button" @click="navigateToFeature(feature)">
                <router-link to="/index/ordermanagement/charts">了解更多</router-link>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta-section">
      <div class="cta-container">
        <div class="cta-content">
          <h2 class="cta-title">Ready to Transform Your Warehouse?</h2>
          <p class="cta-subtitle">
            Join thousands of companies already using our AGV monitoring solution
          </p>
          <div class="cta-buttons">
            <button class="primary-button large">Start Your Journey</button>
            <button class="secondary-button large">Schedule Demo</button>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
      <div class="footer-container">
        <div class="footer-brand">
          <div class="brand-icon">🤖</div>
          <span class="brand-text">AGV Monitor</span>
        </div>
        <div class="footer-links">
          <div class="link-group">
            <h4>Product</h4>
            <a href="#">Features</a>
            <a href="#">Pricing</a>
            <a href="#">API</a>
          </div>
          <div class="link-group">
            <h4>Company</h4>
            <a href="#">About</a>
            <a href="#">Careers</a>
            <a href="#">Contact</a>
          </div>
          <div class="link-group">
            <h4>Support</h4>
            <a href="#">Documentation</a>
            <a href="#">Help Center</a>
            <a href="#">Status</a>
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <p>&copy; 2025 AGV Monitor. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
/* Global Styles */
.agv-display {
  font-family: 'Roboto', 'Arial', sans-serif;
  line-height: 1.6;
  color: rgb(var(--v-theme-on-surface));
  background: rgb(var(--v-theme-background));
  transition:
    background-color 0.3s ease,
    color 0.3s ease;
}

/* Loading */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(var(--v-theme-surface), 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(var(--v-theme-outline), 0.3);
  border-top: 4px solid rgb(var(--v-theme-primary));
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* Navigation */
.navbar {
  position: fixed;
  top: 0;
  width: 100%;
  background: rgba(var(--v-theme-surface), 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(var(--v-theme-outline), 0.5);
  z-index: 1000;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 600;
  font-size: 18px;
  color: rgb(var(--v-theme-on-surface));
}

.brand-icon {
  font-size: 24px;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 32px;
}

.nav-link {
  text-decoration: none;
  color: rgb(var(--v-theme-on-surface));
  font-weight: 500;
  transition: color 0.2s ease;
}

.nav-link:hover {
  color: rgb(var(--v-theme-primary));
}

/* Buttons */
.cta-button,
.primary-button,
.secondary-button,
.feature-button {
  border: none;
  border-radius: 20px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
}

.cta-button,
.primary-button {
  background: rgb(var(--v-theme-primary));
  color: rgb(var(--v-theme-on-primary));
  padding: 10px 24px;
}

.primary-button.large {
  padding: 16px 32px;
  font-size: 16px;
}

.secondary-button {
  background: transparent;
  color: rgb(var(--v-theme-primary));
  border: 2px solid rgb(var(--v-theme-primary));
  padding: 8px 22px;
}

.secondary-button.large {
  padding: 14px 30px;
  font-size: 16px;
}

.feature-button {
  background: var(--feature-color, rgb(var(--v-theme-primary)));
  color: white;
  padding: 8px 16px;
  font-size: 14px;
}

.primary-button:hover,
.cta-button:hover {
  box-shadow: 0 4px 12px rgba(var(--v-theme-primary), 0.3);
  transform: translateY(-2px);
}

.secondary-button:hover {
  background: rgb(var(--v-theme-primary));
  color: rgb(var(--v-theme-on-primary));
}

/* Hero Section */
.hero-section {
  padding: 120px 24px 80px;
  min-height: 100vh;
  display: flex;
  align-items: center;
  background: linear-gradient(
    135deg,
    rgba(var(--v-theme-primary), 0.05) 0%,
    rgba(var(--v-theme-secondary), 0.05) 100%
  );
}

.hero-container {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 80px;
  align-items: center;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 24px;
  color: rgb(var(--v-theme-on-surface));
}

.title-accent {
  background: linear-gradient(
    135deg,
    rgb(var(--v-theme-primary)) 0%,
    rgb(var(--v-theme-secondary)) 100%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: 1.25rem;
  color: rgba(var(--v-theme-on-surface), 0.7);
  margin-bottom: 32px;
  line-height: 1.5;
}

.hero-buttons {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.hero-visual {
  display: flex;
  justify-content: center;
}

.hero-card {
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgba(var(--v-theme-outline), 0.2);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 8px 24px rgba(var(--v-theme-on-surface), 0.1);
  min-width: 280px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  font-weight: 500;
  color: rgb(var(--v-theme-on-surface));
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #4caf50;
}

.status-indicator.active {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.metric {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.metric-label {
  color: rgba(var(--v-theme-on-surface), 0.6);
  font-size: 14px;
}

.metric-value {
  font-size: 24px;
  font-weight: 700;
  color: rgb(var(--v-theme-primary));
  line-height: 1;
}

/* Stats Section */
.stats-section {
  padding: 80px 24px;
  background: rgb(var(--v-theme-background));
}

.stats-container {
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
}

.stats-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 48px;
  color: rgb(var(--v-theme-on-surface));
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 32px;
}

.stat-card {
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgba(var(--v-theme-outline), 0.2);
  border-radius: 16px;
  padding: 32px 24px;
  box-shadow: 0 4px 12px rgba(var(--v-theme-on-surface), 0.1);
  text-align: center;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(var(--v-theme-on-surface), 0.15);
}

.stat-icon {
  font-size: 2.5rem;
  margin-bottom: 16px;
}

.stat-number {
  font-size: 3rem;
  font-weight: 700;
  color: var(--accent-color);
  line-height: 1;
}

.stat-unit {
  font-size: 1.5rem;
  color: var(--accent-color);
  font-weight: 600;
}

.stat-label {
  font-size: 1rem;
  color: rgba(var(--v-theme-on-surface), 0.7);
  margin-top: 8px;
}

/* Features Section */
.features-section {
  padding: 80px 24px;
  background: linear-gradient(
    135deg,
    rgba(var(--v-theme-surface-variant), 0.3) 0%,
    rgba(var(--v-theme-surface), 1) 100%
  );
}

.features-container {
  max-width: 1200px;
  margin: 0 auto;
}

.section-header {
  text-align: center;
  margin-bottom: 64px;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 16px;
  color: rgb(var(--v-theme-on-surface));
}

.section-subtitle {
  font-size: 1.25rem;
  color: rgba(var(--v-theme-on-surface), 0.7);
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 32px;
}

.feature-card {
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgba(var(--v-theme-outline), 0.2);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(var(--v-theme-on-surface), 0.1);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(var(--v-theme-on-surface), 0.15);
}

.feature-image {
  height: 200px;
  overflow: hidden;
}

.feature-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.feature-content {
  padding: 24px;
}

.feature-header {
  margin-bottom: 16px;
}

.feature-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 4px;
  color: rgb(var(--v-theme-on-surface));
}

.feature-subtitle {
  color: var(--feature-color);
  font-weight: 500;
  font-size: 14px;
}

.feature-description {
  color: rgba(var(--v-theme-on-surface), 0.7);
  margin-bottom: 24px;
  line-height: 1.6;
}

/* CTA Section */
.cta-section {
  padding: 80px 24px;
  background: linear-gradient(
    135deg,
    rgb(var(--v-theme-primary)) 0%,
    rgb(var(--v-theme-secondary)) 100%
  );
  color: rgb(var(--v-theme-on-primary));
}

.cta-container {
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
}

.cta-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 16px;
}

.cta-subtitle {
  font-size: 1.25rem;
  opacity: 0.9;
  margin-bottom: 32px;
}

.cta-buttons {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
}

.cta-section .primary-button {
  background: rgb(var(--v-theme-on-primary));
  color: rgb(var(--v-theme-primary));
}

.cta-section .secondary-button {
  border-color: rgb(var(--v-theme-on-primary));
  color: rgb(var(--v-theme-on-primary));
}

.cta-section .secondary-button:hover {
  background: rgb(var(--v-theme-on-primary));
  color: rgb(var(--v-theme-primary));
}

/* Footer */
.footer {
  background: rgb(var(--v-theme-surface));
  border-top: 1px solid rgba(var(--v-theme-outline), 0.2);
  color: rgb(var(--v-theme-on-surface));
  padding: 48px 24px 24px;
}

/* Dark theme specific adjustments */
.theme-dark .footer {
  background: rgba(var(--v-theme-surface), 0.95);
  border-top: 1px solid rgba(var(--v-theme-outline), 0.3);
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 48px;
  margin-bottom: 32px;
}

.footer-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 600;
  font-size: 18px;
  color: rgb(var(--v-theme-on-surface));
}

.footer-links {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 32px;
}

.link-group h4 {
  margin-bottom: 16px;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
}

.link-group a {
  display: block;
  color: rgba(var(--v-theme-on-surface), 0.7);
  text-decoration: none;
  margin-bottom: 8px;
  transition: color 0.2s ease;
}

.link-group a:hover {
  color: rgb(var(--v-theme-primary));
}

.footer-bottom {
  border-top: 1px solid rgba(var(--v-theme-outline), 0.2);
  padding-top: 24px;
  text-align: center;
  color: rgba(var(--v-theme-on-surface), 0.6);
}

/* Responsive Design */
@media (max-width: 768px) {
  .nav-links {
    display: none;
  }

  .hero-container {
    grid-template-columns: 1fr;
    gap: 48px;
    text-align: center;
  }

  .hero-title {
    font-size: 2.5rem;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 24px;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }

  .footer-container {
    grid-template-columns: 1fr;
    gap: 32px;
  }

  .footer-links {
    grid-template-columns: 1fr;
    gap: 24px;
  }

  .cta-buttons,
  .hero-buttons {
    flex-direction: column;
    align-items: center;
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .hero-title {
    font-size: 2rem;
  }

  .section-title,
  .stats-title,
  .cta-title {
    font-size: 2rem;
  }
}
</style>
