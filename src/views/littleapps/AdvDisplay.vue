<script setup>
import { onMounted, onUnmounted } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { TextPlugin } from 'gsap/TextPlugin'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'
import { MotionPathPlugin } from 'gsap/MotionPathPlugin'

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger, TextPlugin, ScrollToPlugin, MotionPathPlugin)

// Load necessary external resources when the component is mounted
onMounted(() => {
  // Load Webflow styles
  if (!document.querySelector('link[href*="agvjian-kong-xi-tong.webflow.shared"]')) {
    const webflowStyle = document.createElement('link')
    webflowStyle.rel = 'stylesheet'
    webflowStyle.type = 'text/css'
    webflowStyle.href =
      'https://cdn.prod.website-files.com/682997c5e8ae5cdd36dbfb58/css/agvjian-kong-xi-tong.webflow.shared.be477684c.css'
    document.head.appendChild(webflowStyle)
  }

  // Load Google Fonts
  if (!document.querySelector('link[href="https://fonts.googleapis.com"]')) {
    const fontPreconnect1 = document.createElement('link')
    fontPreconnect1.rel = 'preconnect'
    fontPreconnect1.href = 'https://fonts.googleapis.com'
    document.head.appendChild(fontPreconnect1)

    const fontPreconnect2 = document.createElement('link')
    fontPreconnect2.rel = 'preconnect'
    fontPreconnect2.href = 'https://fonts.gstatic.com'
    fontPreconnect2.crossOrigin = 'anonymous'
    document.head.appendChild(fontPreconnect2)
  }

  // Load WebFont
  if (!window.WebFont) {
    const webfontScript = document.createElement('script')
    webfontScript.src = 'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js'
    webfontScript.onload = () => {
      window.WebFont.load({
        google: {
          families: ['Figtree:regular', 'Bricolage Grotesque:regular'],
        },
      })
    }
    document.body.appendChild(webfontScript)
  }

  // Initialize all animations
  initAnimations()
})

// Clean up animations when the page is left
onUnmounted(() => {
  ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
  gsap.killTweensOf('*')
})

// Initialize all animations
const initAnimations = () => {
  // Wait for DOM to be fully loaded and initial layout to settle
  setTimeout(() => {
    // Navbar animation
    animateNavbar()

    // Hero section animation
    animateHero()

    // Card animation
    animateCards()

    // Replace original stats animation with a more elaborate version
    createEpicStatsAnimation()

    // Features animation
    animateFeatures()

    // Blog posts animation
    animateBlogPosts()

    // Footer animation
    animateFooter()

    // Global scroll animations
    initScrollAnimations()

    // Mouse tracking effect
    initMouseTracking()

    // Particle effect
    createParticles()

    // Refresh ScrollTrigger instances after all animations are set up
    // and dynamic content is potentially added and styled.
    // This helps ensure correct start/end points.
    ScrollTrigger.refresh()
  }, 500) // Slightly increased timeout for better stability with external resources
}

// Navbar animation
const animateNavbar = () => {
  // Nav logo animation
  gsap.fromTo(
    '.nav-logo-icon',
    { rotate: -180, scale: 0 },
    { rotate: 0, scale: 1, duration: 1.5, ease: 'elastic.out(1, 0.3)' },
  )

  // Nav menu items appear sequentially
  gsap.from('.nav-menu-list-item', {
    opacity: 0,
    y: -50,
    stagger: 0.1,
    duration: 0.8,
    ease: 'back.out(1.7)',
  })

  // Create hover effect for nav links
  document.querySelectorAll('.nav-link').forEach((link) => {
    link.addEventListener('mouseenter', () => {
      gsap.to(link, { scale: 1.05, color: '#4caf50', duration: 0.3 })
    })
    link.addEventListener('mouseleave', () => {
      gsap.to(link, { scale: 1, color: '', duration: 0.3 })
    })
  })

  // Nav button glow effect
  gsap.to('.primary-button-on-inverse', {
    boxShadow: '0 0 15px 5px rgba(255,255,255,0.7)',
    repeat: -1,
    yoyo: true,
    duration: 1.5,
  })
}

// Hero section animation
const animateHero = () => {
  // Create main title display animation
  const heroTitle = document.querySelector('.h1-heading')
  if (heroTitle) {
    // Hide text first
    const originalText = heroTitle.innerHTML
    heroTitle.innerHTML = ''

    // Typewriter effect
    gsap.to(heroTitle, {
      duration: 2,
      text: originalText,
      ease: 'none',
      delay: 0.5,
    })
  }

  // Background image animation
  gsap.fromTo(
    '.ix-parallax-scale-out-hero img',
    { scale: 1.5, opacity: 0 },
    { scale: 1, opacity: 1, duration: 3, ease: 'power2.out' },
  )

  // Button animation
  gsap.from('.button-group.align-center .button', {
    scale: 0,
    opacity: 0,
    y: 50,
    stagger: 0.2,
    delay: 1.5,
    duration: 0.8,
    ease: 'back.out(1.7)',
    onComplete: () => {
      // Add pulse animation to the primary button
      gsap.to('.primary-button-on-inverse', {
        scale: 1.05,
        repeat: -1,
        yoyo: true,
        duration: 1,
        ease: 'power1.inOut',
      })
    },
  })

  // Create parallax scroll effect
  gsap.to('.ix-parallax-scale-out-hero img', {
    y: '30%',
    ease: 'none',
    scrollTrigger: {
      trigger: 'header',
      start: 'top top',
      end: 'bottom top',
      scrub: true,
    },
  })
}

// Card animation
const animateCards = () => {
  // Set scroll-triggered animation for each card
  gsap.utils.toArray('.ix-sticky-card').forEach((card, index) => {
    // Initial state
    gsap.set(card, { opacity: 0, x: index % 2 === 0 ? -100 : 100 })

    // Animation triggered on scroll
    ScrollTrigger.create({
      trigger: card,
      start: 'top 80%',
      onEnter: () => {
        gsap.to(card, {
          opacity: 1,
          x: 0,
          duration: 1.2,
          ease: 'power3.out',
          onComplete: () => {
            // Card inner elements animation
            const image = card.querySelector('img')
            const title = card.querySelector('h2')
            const text = card.querySelector('p')
            const button = card.querySelector('.button')

            const tl = gsap.timeline()
            tl.from(image, { scale: 0.8, opacity: 0.5, duration: 1, ease: 'power2.out' })
              .from(title, { y: 30, opacity: 0, duration: 0.8 }, '-=0.5')
              .from(text, { y: 30, opacity: 0, duration: 0.8 }, '-=0.6')
              .from(button, { scale: 0, opacity: 0, duration: 0.5, ease: 'back.out(1.7)' }, '-=0.4')

            // Add hover effect
            card.addEventListener('mouseenter', () => {
              gsap.to(card, { y: -10, boxShadow: '0 20px 30px rgba(0,0,0,0.2)', duration: 0.3 })
              gsap.to(image, { scale: 1.05, duration: 0.5 })
            })

            card.addEventListener('mouseleave', () => {
              gsap.to(card, { y: 0, boxShadow: '0 5px 15px rgba(0,0,0,0.1)', duration: 0.3 })
              gsap.to(image, { scale: 1, duration: 0.5 })
            })
          },
        })
      },
    })
  })

  // 3D tilt effect
  const cards = document.querySelectorAll('.card')
  cards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const centerX = rect.width / 2
      const centerY = rect.height / 2

      const rotateX = (y - centerY) / 20
      const rotateY = (centerX - x) / 20

      gsap.to(card, {
        rotateX: rotateX,
        rotateY: rotateY,
        duration: 0.5,
        ease: 'power1.out',
        transformPerspective: 1000,
      })
    })

    card.addEventListener('mouseleave', () => {
      gsap.to(card, {
        rotateX: 0,
        rotateY: 0,
        duration: 1,
        ease: 'elastic.out(1, 0.3)',
      })
    })
  })
}

// Replace original stats animation method
const createEpicStatsAnimation = () => {
  // Create Material Design style data visualization section
  const statsSection = document.createElement('section')
  statsSection.className = 'material-stats-section section'
  statsSection.innerHTML = `
    <div class="stats-backdrop">
      <div class="stats-grid-lines"></div>
      <div class="stats-glow"></div>
    </div>
    <div class="material-container">
      <div class="material-stats-header reveal-text">
        <h2 class="material-stats-title">Amazing Performance</h2>
        <div class="material-stats-subtitle">Explore Our Data & Achievements</div>
      </div>
      <div class="material-stats-cards">
        <div class="material-stat-card" data-value="98" data-unit="%" data-color="#6200ea">
          <div class="card-front">
            <div class="material-stat-number">0</div>
            <div class="material-stat-label">Customer Satisfaction</div>
            <svg class="material-stat-wave" viewBox="0 0 100 25">
              <path d="M0,25 C15,15 35,0 50,12 C65,22 75,15 100,0 L100,25 L0,25 Z" fill="url(#purple-gradient)"></path>
            </svg>
          </div>
          <div class="card-icon">
            <svg viewBox="0 0 24 24" class="material-icon">
              <path d="M12,17.5C14.33,17.5 16.3,16.04 17.11,14H6.89C7.69,16.04 9.67,17.5 12,17.5M8.5,11A1.5,1.5 0 0,0 10,9.5A1.5,1.5 0 0,0 8.5,8A1.5,1.5 0 0,0 7,9.5A1.5,1.5 0 0,0 8.5,11M15.5,11A1.5,1.5 0 0,0 17,9.5A1.5,1.5 0 0,0 15.5,8A1.5,1.5 0 0,0 14,9.5A1.5,1.5 0 0,0 15.5,11M12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20M12,2C6.47,2 2,6.5 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" />
            </svg>
          </div>
        </div>
        <div class="material-stat-card" data-value="15432" data-unit="" data-color="#2962ff">
          <div class="card-front">
            <div class="material-stat-number">0</div>
            <div class="material-stat-label">Orders Processed</div>
            <svg class="material-stat-wave" viewBox="0 0 100 25">
              <path d="M0,25 C20,5 40,20 60,10 C80,5 90,15 100,0 L100,25 L0,25 Z" fill="url(#blue-gradient)"></path>
            </svg>
          </div>
          <div class="card-icon">
            <svg viewBox="0 0 24 24" class="material-icon">
              <path d="M19,3H14.82C14.4,1.84 13.3,1 12,1C10.7,1 9.6,1.84 9.18,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3M12,3A1,1 0 0,1 13,4A1,1 0 0,1 12,5A1,1 0 0,1 11,4A1,1 0 0,1 12,3M7,7H17V5H19V19H5V5H7V7M12,17V15H17V17H12M12,13V11H17V13H12M8,9V7H10V9H8M8,13V11H10V13H8M8,17V15H10V17H8Z" />
            </svg>
          </div>
        </div>
        <div class="material-stat-card" data-value="127" data-unit="" data-color="#00b0ff">
          <div class="card-front">
            <div class="material-stat-number">0</div>
            <div class="material-stat-label">AGVs Deployed</div>
            <svg class="material-stat-wave" viewBox="0 0 100 25">
              <path d="M0,20 C10,10 30,30 50,15 C70,5 80,15 100,0 L100,25 L0,25 Z" fill="url(#cyan-gradient)"></path>
            </svg>
          </div>
          <div class="card-icon">
            <svg viewBox="0 0 24 24" class="material-icon">
              <path d="M22,17H18V10H22M22,20H18V19H22M6,13H2V10H6M6,20H2V16H6M16,10V20H8V10H16M16,7H8V8H16M16,20H8V21H16M14,12H10V14H14V12Z" />
            </svg>
          </div>
        </div>
        <div class="material-stat-card" data-value="24" data-unit="/7" data-color="#00c853">
          <div class="card-front">
            <div class="material-stat-number">0</div>
            <div class="material-stat-label">24/7 Service</div>
            <svg class="material-stat-wave" viewBox="0 0 100 25">
              <path d="M0,15 C20,25 30,5 50,15 C70,25 90,10 100,15 L100,25 L0,25 Z" fill="url(#green-gradient)"></path>
            </svg>
          </div>
          <div class="card-icon">
            <svg viewBox="0 0 24 24" class="material-icon">
              <path d="M12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22C6.47,22 2,17.5 2,12A10,10 0 0,1 12,2M12.5,7V12.25L17,14.92L16.25,16.15L11,13V7H12.5Z" />
            </svg>
          </div>
        </div>
      </div>
      <div class="material-stats-interactive-area">
        <div class="interactive-trigger"></div>
        <div class="interactive-elements">
          <div class="floating-circle circle-1"></div>
          <div class="floating-circle circle-2"></div>
          <div class="floating-circle circle-3"></div>
          <div class="animation-text">Swipe to Explore</div>
        </div>
      </div>
    </div>
    <svg width="0" height="0">
      <defs>
        <linearGradient id="purple-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#6200ea" stop-opacity="0.8" />
          <stop offset="100%" stop-color="#b388ff" stop-opacity="0.8" />
        </linearGradient>
        <linearGradient id="blue-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#2962ff" stop-opacity="0.8" />
          <stop offset="100%" stop-color="#82b1ff" stop-opacity="0.8" />
        </linearGradient>
        <linearGradient id="cyan-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#00b0ff" stop-opacity="0.8" />
          <stop offset="100%" stop-color="#80d8ff" stop-opacity="0.8" />
        </linearGradient>
        <linearGradient id="green-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#00c853" stop-opacity="0.8" />
          <stop offset="100%" stop-color="#69f0ae" stop-opacity="0.8" />
        </linearGradient>
      </defs>
    </svg>
  `

  // Insert after the first section
  const firstSection = document.querySelector('.section')
  // Ensure firstSection exists before trying to insert after it
  if (firstSection && firstSection.parentNode) {
    firstSection.parentNode.insertBefore(statsSection, firstSection.nextSibling)
  } else {
    // Fallback: append to body or a known container if firstSection is not found
    document.body.appendChild(statsSection)
    console.warn(
      "'.section' not found, appended statsSection to body. Consider a more robust insertion point.",
    )
  }

  // Add styles for the new elements
  const style = document.createElement('style')
  style.textContent = `
    .material-stats-section {
      position: relative;
      min-height: 100vh;
      overflow: hidden;
      background: linear-gradient(135deg, #121212, #1e1e1e);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1;
      padding: 80px 0;
      perspective: 1200px;
    }

    .stats-backdrop {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: -1;
      overflow: hidden;
    }

    .stats-grid-lines {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-size: 50px 50px;
      background-image:
        linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px);
      z-index: 1;
    }

    .stats-glow {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 60vw;
      height: 60vh;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(103,58,183,0.15) 0%, rgba(33,150,243,0.05) 40%, transparent 70%);
      filter: blur(60px);
      z-index: 0;
      opacity: 0.8;
    }

    .material-container {
      width: 90%;
      max-width: 1200px;
      position: relative;
      z-index: 2;
    }

    .material-stats-header {
      text-align: center;
      margin-bottom: 80px;
      position: relative;
    }

    .reveal-text {
      position: relative;
      overflow: hidden;
    }

    .material-stats-title {
      font-size: 3.5rem;
      font-weight: 900;
      margin-bottom: 1rem;
      background: linear-gradient(45deg, #6200ea, #00b0ff, #00c853);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-size: 300% 300%;
      position: relative;
    }

    .material-stats-subtitle {
      font-size: 1.5rem;
      color: rgba(255,255,255,0.7);
      font-weight: 300;
    }

    .material-stats-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 30px;
      margin-bottom: 60px;
    }

    .material-stat-card {
      position: relative;
      height: 200px;
      border-radius: 16px;
      background-color: rgba(30,30,30,0.7);
      box-shadow: 0 15px 35px rgba(0,0,0,0.2);
      overflow: hidden;
      transform-style: preserve-3d;
      transform: perspective(1000px);
      transition: transform 0.6s cubic-bezier(0.23, 1, 0.32, 1);
      backdrop-filter: blur(10px);
    }

    .material-stat-card:hover {
      transform: perspective(1000px) translateY(-10px) rotateX(10deg);
    }

    .card-front {
      position: relative;
      width: 100%;
      height: 100%;
      padding: 30px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      z-index: 2;
    }

    .card-icon {
      position: absolute;
      top: 20px;
      right: 20px;
      width: 40px;
      height: 40px;
      z-index: 1;
      opacity: 0.2;
    }

    .material-icon {
      fill: white;
      width: 100%;
      height: 100%;
    }

    .material-stat-number {
      font-size: 3.6rem;
      font-weight: 700;
      line-height: 1;
      color: #fff;
      margin-bottom: 0.5rem;
      position: relative;
      z-index: 2;
      transition: all 0.3s ease;
    }

    .material-stat-label {
      font-size: 1.1rem;
      font-weight: 400;
      color: rgba(255,255,255,0.7);
      position: relative;
      z-index: 2;
      margin-top: 10px;
    }

    .material-stat-wave {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 25%;
      z-index: 1;
      transform: translateY(60%);
      transition: transform 0.6s cubic-bezier(0.23, 1, 0.32, 1);
    }

    .material-stat-card:hover .material-stat-wave {
      transform: translateY(40%);
    }

    .material-stats-interactive-area {
      position: relative;
      height: 100px;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .interactive-trigger {
      width: 200px;
      height: 60px;
      position: relative;
      cursor: pointer;
    }

    .interactive-elements {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      pointer-events: none;
    }

    .floating-circle {
      position: absolute;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 70%);
      filter: blur(5px);
      opacity: 0.7;
    }

    .circle-1 {
      width: 20px;
      height: 20px;
      left: calc(50% - 80px);
    }

    .circle-2 {
      width: 30px;
      height: 30px;
      left: calc(50% - 30px);
      background: radial-gradient(circle, rgba(98,0,234,0.8) 0%, rgba(98,0,234,0) 70%);
    }

    .circle-3 {
      width: 15px;
      height: 15px;
      left: calc(50% + 40px);
      background: radial-gradient(circle, rgba(0,176,255,0.8) 0%, rgba(0,176,255,0) 70%);
    }

    .animation-text {
      position: absolute;
      width: 100%;
      text-align: center;
      color: rgba(255,255,255,0.5);
      font-size: 0.9rem;
      bottom: -30px;
      font-weight: 300;
      letter-spacing: 2px;
      text-transform: uppercase;
    }

    @media (max-width: 768px) {
      .material-stats-title {
        font-size: 2.5rem;
      }

      .material-stats-subtitle {
        font-size: 1.2rem;
      }

      .material-stats-cards {
        grid-template-columns: 1fr;
      }
    }

    /* Digital Counter Display */
    .digit-placeholder {
      display: inline-block;
      position: relative;
      width: 0.6em;
      text-align: center;
    }

    .digit-wrapper {
      position: absolute;
      top: 0;
      left: 0;
      display: flex;
      flex-direction: column;
      transition: transform 0.3s ease;
    }

    .digit {
      height: 1em;
      line-height: 1;
    }

    /* Reveal Animation Classes */
    .reveal-item {
      transform: translateY(100%);
      opacity: 0;
    }

    /* Ripple Effect */
    .ripple {
      position: absolute;
      border-radius: 50%;
      transform: scale(0);
      animation: ripple 1.5s ease-out;
      background: rgba(255, 255, 255, 0.2);
    }

    @keyframes ripple {
      to {
        transform: scale(2);
        opacity: 0;
      }
    }

    /* Gradients Animation */
    @keyframes gradient-shift {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
  `
  document.head.appendChild(style)

  // Initialize parallax effects and interactions
  initMaterialStats()

  function initMaterialStats() {
    // Animate the header
    const header = document.querySelector('.material-stats-header')
    const title = document.querySelector('.material-stats-title')
    const subtitle = document.querySelector('.material-stats-subtitle')

    gsap.set([title, subtitle], { opacity: 0, y: 50 })

    // Set up ScrollTrigger
    ScrollTrigger.create({
      trigger: '.material-stats-section',
      start: 'top 70%',
      once: true,
      onEnter: () => {
        // Create entrance animation for title and subtitle
        gsap.to(title, {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: 'power3.out',
          onComplete: () => {
            // Add gradient animation to title
            gsap.to(title, {
              backgroundPosition: '100% 50%',
              duration: 10,
              repeat: -1,
              yoyo: true,
              ease: 'sine.inOut',
            })
          },
        })

        gsap.to(subtitle, {
          opacity: 1,
          y: 0,
          duration: 1,
          delay: 0.3,
          ease: 'power3.out',
        })

        // Display cards
        animateMaterialCards() // Renamed to avoid conflict with the outer animateCards
      },
    })

    // Add interactive animations to cards
    function animateMaterialCards() {
      // Renamed
      const cards = document.querySelectorAll('.material-stat-card')

      gsap.from(cards, {
        y: 100,
        opacity: 0,
        duration: 1,
        stagger: 0.15,
        ease: 'power3.out',
        clearProps: 'opacity', // Changed from 'all' to be more specific
        onComplete: () => {
          animateStatNumbers()
          initCardInteractions()
        },
      })
    }

    // Mouse interaction effects
    function initCardInteractions() {
      document.querySelectorAll('.material-stat-card').forEach((card) => {
        // 3D tilt effect
        card.addEventListener('mousemove', (e) => {
          const rect = card.getBoundingClientRect()
          const x = e.clientX - rect.left
          const y = e.clientY - rect.top

          // Calculate tilt angles
          const centerX = rect.width / 2
          const centerY = rect.height / 2
          const rotateY = ((x - centerX) / centerX) * 8
          const rotateX = ((centerY - y) / centerY) * 8

          gsap.to(card, {
            rotateX: rotateX,
            rotateY: rotateY,
            duration: 0.4,
            ease: 'power2.out',
            transformPerspective: 1000,
            transformStyle: 'preserve-3d',
          })

          // Light tracking effect
          const color = card.dataset.color || '#673ab7'
          const glow = document.createElement('div')
          glow.className = 'card-glow'
          glow.style.cssText = `
            position: absolute;
            width: 150px;
            height: 150px;
            border-radius: 50%;
            background: radial-gradient(circle, ${color}30 0%, transparent 70%);
            pointer-events: none;
            top: ${y - 75}px;
            left: ${x - 75}px;
            opacity: 0;
          `

          card.appendChild(glow)
          gsap.to(glow, {
            opacity: 0.5,
            duration: 0.3,
            onComplete: () => {
              gsap.to(glow, {
                opacity: 0,
                duration: 0.5,
                onComplete: () => {
                  glow.remove()
                },
              })
            },
          })

          // Wave animation
          const wave = card.querySelector('.material-stat-wave')
          gsap.to(wave, {
            scaleX: 1.05,
            scaleY: 1.1,
            duration: 1,
            ease: 'sine.inOut',
            yoyo: true,
            repeat: 1,
          })
        })

        // Reset on mouse leave
        card.addEventListener('mouseleave', () => {
          gsap.to(card, {
            rotateX: 0,
            rotateY: 0,
            duration: 0.6,
            ease: 'elastic.out(1, 0.3)',
          })
        })

        // Click effect
        card.addEventListener('click', (e) => {
          const rect = card.getBoundingClientRect()
          const x = e.clientX - rect.left
          const y = e.clientY - rect.top

          // Add ripple effect
          const ripple = document.createElement('div')
          ripple.className = 'ripple'
          ripple.style.left = `${x}px`
          ripple.style.top = `${y}px`
          card.appendChild(ripple)

          // Scale effect
          gsap.fromTo(
            card,
            { scale: 0.95 },
            { scale: 1, duration: 0.6, ease: 'elastic.out(1, 0.3)' },
          )

          // Auto-remove ripple element
          setTimeout(() => {
            ripple.remove()
          }, 1500)

          // Re-trigger number animation
          const numberElement = card.querySelector('.material-stat-number')
          const finalValue = parseInt(card.dataset.value)
          const unit = card.dataset.unit || ''
          animateDigitalCounter(numberElement, finalValue, unit)
        })
      })

      // Interactive area animation
      const interactiveArea = document.querySelector('.material-stats-interactive-area')
      const circles = document.querySelectorAll('.floating-circle')
      const text = document.querySelector('.animation-text')

      // Initial animation
      gsap.set(circles, { scale: 0, opacity: 0 })
      gsap.set(text, { opacity: 0, y: 10 })

      gsap.to(circles, {
        scale: 1,
        opacity: 0.7,
        duration: 1,
        delay: 1,
        stagger: 0.2,
        ease: 'elastic.out(1, 0.3)',
      })

      gsap.to(text, {
        opacity: 1,
        y: 0,
        duration: 0.5,
        delay: 1.5,
      })

      // Floating animation
      circles.forEach((circle, i) => {
        const delay = i * 0.2
        gsap.to(circle, {
          y: '-=10',
          duration: 1.5,
          delay,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        })
      })

      // Mouse interaction
      if (interactiveArea) {
        // Check if element exists
        interactiveArea.addEventListener('mousemove', (e) => {
          const rect = interactiveArea.getBoundingClientRect()
          const x = e.clientX - rect.left
          const centerX = rect.width / 2
          const offsetPercent = (x - centerX) / centerX

          circles.forEach((circle, i) => {
            gsap.to(circle, {
              x: offsetPercent * (20 - i * 5),
              duration: 0.5,
            })
          })
        })

        interactiveArea.addEventListener('mouseleave', () => {
          circles.forEach((circle) => {
            gsap.to(circle, {
              x: 0,
              duration: 1,
              ease: 'elastic.out(1, 0.3)',
            })
          })
        })
      }
    }

    // Create modern digital scrolling effect for numbers
    function animateStatNumbers() {
      document.querySelectorAll('.material-stat-card').forEach((card) => {
        const numberElement = card.querySelector('.material-stat-number')
        const finalValue = parseInt(card.dataset.value)
        const unit = card.dataset.unit || ''

        animateDigitalCounter(numberElement, finalValue, unit)
      })
    }

    // Digital counter effect (Apple/Google style)
    function animateDigitalCounter(element, finalValue, unit) {
      // Clear current element content
      element.innerHTML = ''

      // Convert number to string and separate each digit
      const valueString = finalValue.toString()

      // Create wrapper elements for each digit
      for (let i = 0; i < valueString.length; i++) {
        const digitPlaceholder = document.createElement('span')
        digitPlaceholder.className = 'digit-placeholder'
        element.appendChild(digitPlaceholder)

        const digitWrapper = document.createElement('div')
        digitWrapper.className = 'digit-wrapper'
        digitPlaceholder.appendChild(digitWrapper)

        // Create all digits from 0-9
        for (let j = 0; j <= 9; j++) {
          const digit = document.createElement('div')
          digit.className = 'digit'
          digit.textContent = j
          digitWrapper.appendChild(digit)
        }

        // Set initial position (displaying 0)
        gsap.set(digitWrapper, { y: 0 })
      }

      // Add unit
      if (unit) {
        const unitSpan = document.createElement('span')
        unitSpan.textContent = unit
        element.appendChild(unitSpan)
      }

      // Animate each digit
      const digitWrappers = element.querySelectorAll('.digit-wrapper')

      digitWrappers.forEach((wrapper, i) => {
        const targetDigit = parseInt(valueString[i])
        const delay = i * 0.1 // Trigger animations sequentially

        gsap.to(wrapper, {
          y: -targetDigit + 'em',
          delay,
          duration: 1.2,
          ease: 'power4.out',
          onStart: () => {
            // Add flash effect
            const flash = document.createElement('div')
            flash.style.cssText = `
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              background: linear-gradient(135deg, rgba(255,255,255,0.3) 0%, transparent 100%);
              pointer-events: none;
              opacity: 0;
            `
            // Check if element is still part of the DOM
            if (element.isConnected) {
              element.appendChild(flash)
              gsap.to(flash, {
                opacity: 0.8,
                duration: 0.3,
                yoyo: true,
                repeat: 1,
                onComplete: () => {
                  if (flash.isConnected) flash.remove()
                },
              })
            }
          },
          onComplete: () => {
            // Effect when number reaches final value
            if (i === digitWrappers.length - 1) {
              gsap.fromTo(
                element,
                { scale: 1.1, textShadow: '0 0 10px rgba(255,255,255,0.8)' },
                { scale: 1, textShadow: 'none', duration: 0.5 },
              )

              // Add ripple effect to card
              const card = element.closest('.material-stat-card')
              if (card) {
                // Check if card exists
                const color = card.dataset.color || '#673ab7'
                gsap.fromTo(
                  card,
                  { boxShadow: `0 0 30px ${color}60` },
                  { boxShadow: 'none', duration: 1.5 }, // Original boxShadow might be '0 15px 35px rgba(0,0,0,0.2)'
                )
              }
            }
          },
        })
      })
    }
  }
}

// Features animation
const animateFeatures = () => {
  // Animate content blocks
  const richTextBlocks = document.querySelectorAll('.rich-text p')
  richTextBlocks.forEach((block, index) => {
    gsap.set(block, { opacity: 0, y: 50 })

    ScrollTrigger.create({
      trigger: block,
      start: 'top 85%',
      onEnter: () => {
        gsap.to(block, {
          opacity: 1,
          y: 0,
          duration: 0.8,
          delay: index * 0.2,
          ease: 'power3.out',
        })
      },
    })
  })

  // Tag cloud animation
  const tags = document.querySelectorAll('.tag')
  gsap.set(tags, { opacity: 0, scale: 0 })

  ScrollTrigger.create({
    trigger: '.flex-gap-xxs', // This selector might need to be more specific or use a ref in Vue
    start: 'top 80%',
    onEnter: () => {
      gsap.to(tags, {
        opacity: 1,
        scale: 1,
        stagger: 0.15,
        duration: 0.8,
        ease: 'back.out(1.7)',
        onComplete: () => {
          // Add floating animation
          tags.forEach((tag) => {
            gsap.to(tag, {
              y: gsap.utils.random(-5, 5),
              x: gsap.utils.random(-5, 5),
              duration: gsap.utils.random(1.5, 3),
              repeat: -1,
              yoyo: true,
              ease: 'sine.inOut',
            })
          })
        },
      })
    },
  })
}

// Blog posts animation
const animateBlogPosts = () => {
  const posts = document.querySelectorAll('.utility-link-content-block')

  posts.forEach((post, index) => {
    gsap.set(post, { opacity: 0, y: 100 })

    ScrollTrigger.create({
      trigger: post,
      start: 'top 85%',
      onEnter: () => {
        gsap.to(post, {
          opacity: 1,
          y: 0,
          duration: 1,
          delay: index * 0.3,
          ease: 'power3.out',
        })
      },
    })

    // Add hover effect
    post.addEventListener('mouseenter', () => {
      const image = post.querySelector('img')
      const title = post.querySelector('h3')

      gsap.to(post, {
        y: -20, // Adjusted from -10 to make effect more noticeable
        boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
        duration: 0.5, // Slightly longer for smoother transition
      })

      if (image) {
        gsap.to(image, {
          scale: 1.1,
          duration: 0.7,
          ease: 'power2.out',
        })
      }
      if (title) {
        gsap.to(title, {
          color: '#4CAF50', // Example accent color
          duration: 0.3,
        })
      }
    })

    post.addEventListener('mouseleave', () => {
      const image = post.querySelector('img')
      const title = post.querySelector('h3')

      gsap.to(post, {
        y: 0,
        boxShadow: 'none', // Or revert to original boxShadow if any
        duration: 0.5,
      })
      if (image) {
        gsap.to(image, {
          scale: 1,
          duration: 0.7,
          ease: 'power2.out',
        })
      }
      if (title) {
        gsap.to(title, {
          color: '', // Revert to original color
          duration: 0.3,
        })
      }
    })
  })
}

// Footer animation
const animateFooter = () => {
  // Footer icon entrance animation
  ScrollTrigger.create({
    trigger: '.footer', // This selector might need to be more specific
    start: 'top 90%', // Adjusted for earlier trigger
    onEnter: () => {
      gsap.from('.footer-icon-link', {
        scale: 0,
        opacity: 0,
        stagger: 0.1,
        duration: 0.6,
        ease: 'back.out(1.7)',
      })

      gsap.from('.footer-link', {
        x: -50,
        opacity: 0,
        stagger: 0.05, // Reduced stagger for faster appearance
        duration: 0.8,
      })

      // Special animation for logo in footer
      gsap.from('.footer .nav-logo-icon', {
        // More specific selector
        rotate: 360,
        scale: 0,
        opacity: 0,
        duration: 1.5,
        ease: 'elastic.out(1, 0.3)',
      })
    },
  })
}

// Global scroll animations
const initScrollAnimations = () => {
  // Scroll progress indicator
  const progressBar = document.createElement('div')
  progressBar.className = 'scroll-progress-bar'
  document.body.appendChild(progressBar)

  // Add styles
  const style = document.createElement('style')
  style.textContent = `
    .scroll-progress-bar {
      position: fixed;
      top: 0;
      left: 0;
      height: 5px;
      background: linear-gradient(90deg, #4CAF50, #2196F3);
      width: 0%;
      z-index: 10000; /* Ensure it's above most elements */
      box-shadow: 0 0 10px rgba(76, 175, 80, 0.7);
      transition: height 0.3s, background-color 0.3s; /* Added background transition */
    }
    .scroll-progress-bar:hover {
      height: 10px;
      /* background-color: #FF5722; Example hover color */
    }

    .particles-container {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: -1; /* Ensure particles are in the background */
    }

    .particle {
      position: absolute;
      border-radius: 50%;
      background: radial-gradient(circle at 30% 30%, white, rgba(76, 175, 80, 0.8));
      pointer-events: none;
      opacity: 0.7;
    }

    .mouse-follower {
      position: fixed;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: 2px solid #4CAF50;
      pointer-events: none;
      z-index: 9999;
      mix-blend-mode: difference; /* Consider if this is desired, can affect readability */
      transform: translate(-50%, -50%);
      transition: transform 0.1s ease-out, border-color 0.3s, background-color 0.3s, scale 0.3s; /* Smoother transitions */
    }

    .mouse-dot {
      position: fixed;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background-color: #4CAF50;
      pointer-events: none;
      z-index: 9999;
      mix-blend-mode: difference; /* Consider if this is desired */
      transform: translate(-50%, -50%);
      transition: transform 0.05s ease-out, background-color 0.3s, scale 0.3s; /* Smoother transitions */
    }

    .back-to-top {
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 50px;
      height: 50px;
      background: #4CAF50;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      cursor: pointer;
      opacity: 0;
      visibility: hidden; /* Use visibility for better accessibility and performance */
      z-index: 999; /* Ensure it's above content but below modals etc. */
      box-shadow: 0 5px 15px rgba(0,0,0,0.2);
      transition: all 0.3s ease; /* Use 'ease' for smoother transitions */
    }

    .back-to-top.visible { /* Class to control visibility */
        opacity: 1;
        visibility: visible;
    }

    .back-to-top:hover {
      background: #2E7D32;
      transform: translateY(-5px) scale(1.1); /* Added scale effect */
      box-shadow: 0 10px 20px rgba(0,0,0,0.3);
    }

    .back-to-top svg {
      width: 20px;
      height: 20px;
    }
  `
  document.head.appendChild(style)

  // Create back-to-top button
  const backToTopButton = document.createElement('div')
  backToTopButton.className = 'back-to-top'
  backToTopButton.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="18 15 12 9 6 15"></polyline>
    </svg>
  `
  document.body.appendChild(backToTopButton)

  backToTopButton.addEventListener('click', () => {
    gsap.to(window, {
      scrollTo: 0,
      duration: 1.5, // Increased duration for smoother scroll
      ease: 'power4.inOut', // Smoother ease
    })
  })

  // Scroll progress bar animation
  ScrollTrigger.create({
    trigger: 'body', // Or a specific main container for more accurate progress
    start: 'top top',
    end: 'bottom bottom',
    onUpdate: (self) => {
      gsap.to(progressBar, {
        width: `${self.progress * 100}%`,
        duration: 0.1, // Faster update for responsiveness
        ease: 'none', // Linear update is often best for progress bars
      })

      // Control back-to-top button visibility
      if (self.progress > 0.1) {
        // gsap.to(backToTopButton, { opacity: 1, duration: 0.3 })
        backToTopButton.classList.add('visible')
      } else {
        // gsap.to(backToTopButton, { opacity: 0, duration: 0.3 })
        backToTopButton.classList.remove('visible')
      }
    },
  })

  // Animate all headings on scroll
  // Consider performance implications if there are many headings.
  // Using a common class for animatable headings might be better.
  gsap.utils.toArray('h1, h2, h3').forEach((heading) => {
    ScrollTrigger.create({
      trigger: heading,
      start: 'top 85%', // Adjusted for slightly earlier trigger
      toggleClass: 'is-visible', // Example: use CSS for the animation if preferred
      once: true, // Animate only once
      onEnter: () => {
        gsap.fromTo(
          heading,
          { opacity: 0, x: -50 },
          { opacity: 1, x: 0, duration: 0.8, ease: 'power3.out' },
        )
      },
      // onLeaveBack: (self) => self.kill(), // Optional: kill trigger if it should only run once
    })
  })
}

// Mouse tracking effect
const initMouseTracking = () => {
  const mouseFollower = document.createElement('div')
  mouseFollower.className = 'mouse-follower'
  document.body.appendChild(mouseFollower)

  const mouseDot = document.createElement('div')
  mouseDot.className = 'mouse-dot'
  document.body.appendChild(mouseDot)

  let xTo = gsap.quickTo(mouseDot, 'x', { duration: 0.1, ease: 'power3' })
  let yTo = gsap.quickTo(mouseDot, 'y', { duration: 0.1, ease: 'power3' })
  let xFollowerTo = gsap.quickTo(mouseFollower, 'x', { duration: 0.5, ease: 'power2.out' })
  let yFollowerTo = gsap.quickTo(mouseFollower, 'y', { duration: 0.5, ease: 'power2.out' })

  document.addEventListener('mousemove', (e) => {
    xTo(e.clientX)
    yTo(e.clientY)
    xFollowerTo(e.clientX)
    yFollowerTo(e.clientY)
  })

  // Effect on hover over links/buttons
  // Using a more specific selector for interactive elements is recommended.
  document
    .querySelectorAll(
      'a, button, .button, [role="button"], input[type="submit"], input[type="button"]',
    )
    .forEach((item) => {
      item.addEventListener('mouseenter', () => {
        gsap.to(mouseFollower, { scale: 1.5, border: '2px solid #FF5722', duration: 0.3 })
        gsap.to(mouseDot, { backgroundColor: '#FF5722', scale: 1.5, duration: 0.3 })
      })

      item.addEventListener('mouseleave', () => {
        gsap.to(mouseFollower, { scale: 1, border: '2px solid #4CAF50', duration: 0.3 })
        gsap.to(mouseDot, { backgroundColor: '#4CAF50', scale: 1, duration: 0.3 })
      })
    })
}

// Create particle effect
const createParticles = () => {
  const particlesContainer = document.createElement('div')
  particlesContainer.className = 'particles-container'
  document.body.appendChild(particlesContainer)

  const numParticles = 20 // Control number of particles

  const createParticle = () => {
    if (!particlesContainer.isConnected) return // Stop if container is removed

    const particle = document.createElement('div')
    particle.className = 'particle'
    particlesContainer.appendChild(particle)

    const size = gsap.utils.random(3, 8) // Slightly smaller max size
    const duration = gsap.utils.random(10, 25) // Adjusted duration range
    const startX = gsap.utils.random(0, window.innerWidth)
    const startY = window.innerHeight + size // Start from just below the viewport

    gsap.set(particle, {
      x: startX,
      y: startY,
      width: size,
      height: size,
      opacity: gsap.utils.random(0.3, 0.8), // Random initial opacity
    })

    gsap.to(particle, {
      y: -size, // Animate until it's just above the viewport
      x: `+=${gsap.utils.random(-150, 150)}`, // Adjusted horizontal movement
      opacity: 0,
      duration: duration,
      ease: 'none',
      onComplete: () => {
        if (particle.isConnected) particle.remove()
        // Only create a new particle if the container is still there
        if (particlesContainer.isConnected) createParticle()
      },
    })
  }

  // Initialize particles
  for (let i = 0; i < numParticles; i++) {
    // Delay particle creation slightly for a staggered effect
    gsap.delayedCall(i * 0.2, createParticle)
  }
}
</script>

<template>
  <div class="agv-adv-container">
    <div class="nav inverse-nav">
      <div
        data-duration="400"
        data-animation="default"
        data-easing2="ease"
        data-easing="ease"
        data-collapse="medium"
        role="banner"
        data-no-scroll="1"
        class="nav-container w-nav"
      >
        <div class="nav-left">
          <a href="#" class="nav-logo w-inline-block">
            <div class="nav-logo-icon">
              <svg
                width="100%"
                height="100%"
                viewBox="0 0 33 33"
                preserveAspectRatio="xMidYMid meet"
              >
                <path
                  d="M28,0H5C2.24,0,0,2.24,0,5v23c0,2.76,2.24,5,5,5h23c2.76,0,5-2.24,5-5V5c0-2.76-2.24-5-5-5ZM29,17c-6.63,0-12,5.37-12,12h-1c0-6.63-5.37-12-12-12v-1c6.63,0,12-5.37,12-12h1c0,6.63,5.37,12,12,12v1Z"
                  fill="currentColor"
                ></path>
              </svg>
            </div>
            <div class="paragraph-lg utility-margin-bottom-0">AGV Monitoring System</div>
          </a>
        </div>
        <div class="nav-right">
          <nav role="navigation" class="nav-menu w-nav-menu">
            <ul role="list" class="nav-menu-list w-list-unstyled">
              <li class="nav-menu-list-item">
                <div
                  data-delay="0"
                  data-hover="false"
                  data-w-id="5b7c391a-8de6-0ef5-7bb4-2c37cca0857c"
                  class="nav-menu-dropdown w-dropdown"
                >
                  <div class="nav-link nav-link-on-inverse w-dropdown-toggle">
                    <div>Features</div>
                    <div class="nav-caret w-icon-dropdown-toggle"></div>
                  </div>
                  <nav class="nav-mega-menu-dropdown-list w-dropdown-list">
                    <div class="mega-nav-dropdown-list-wrapper">
                      <ul
                        role="list"
                        class="grid-layout desktop-3-column tablet-1-column grid-gap-sm utility-margin-bottom-0 w-list-unstyled"
                      >
                        <li
                          id="w-node-_016f5a0a-5b63-edde-82c5-e2b2ad6d2e6d-ad6d2e56"
                          class="w-node-_5b7c391a-8de6-0ef5-7bb4-2c37cca08584-cca0856f"
                        >
                          <div
                            class="w-layout-grid grid-layout desktop-3-column tablet-1-column grid-gap-sm"
                          >
                            <!-- Nav menu content - Real features section -->
                            <div>
                              <div class="eyebrow">Real-time Monitoring</div>
                              <ul role="list" class="nav-mega-menu-list w-list-unstyled">
                                <!-- Menu item 1 -->
                                <li class="utility-margin-bottom-0">
                                  <a href="#" class="mega-nav-link-item w-inline-block">
                                    <div class="icon-medium">
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="100%"
                                        height="100%"
                                        viewBox="0 0 32 32"
                                        fill="currentColor"
                                      >
                                        <path
                                          d="m25.7 9.3l-7-7A.9.9 0 0 0 18 2H8a2.006 2.006 0 0 0-2 2v24a2.006 2.006 0 0 0 2 2h16a2.006 2.006 0 0 0 2-2V10a.9.9 0 0 0-.3-.7M18 4.4l5.6 5.6H18ZM24 28H8V4h8v6a2.006 2.006 0 0 0 2 2h6Z"
                                          stroke-linejoin="round"
                                        ></path>
                                      </svg>
                                    </div>
                                    <div>
                                      <div><strong>Live Data</strong></div>
                                      <div class="paragraph-sm utility-text-secondary">
                                        Instant AGV tracking.
                                      </div>
                                    </div>
                                  </a>
                                </li>
                                <!-- Other menu items -->
                                <!-- ...more menu items... -->
                              </ul>
                            </div>
                            <!-- Other nav columns -->
                            <!-- ...more nav columns... -->
                          </div>
                        </li>
                        <!-- Marketing card area -->
                        <li
                          class="flex-horizontal w-node-_5b7c391a-8de6-0ef5-7bb4-2c37cca085f9-cca0856f"
                        >
                          <a
                            href="#"
                            class="card-link inverse-card-link flex-child-expand w-inline-block"
                          >
                            <div class="card-body">
                              <div class="h3-heading">Smart Solutions for Logistics</div>
                              <p class="paragraph-sm utility-text-inverse-secondary">
                                Transform AGV monitoring.
                              </p>
                              <div class="utility-margin-top-auto">
                                <div class="button-group">
                                  <div
                                    class="text-button secondary-text-button text-button-on-inverse"
                                  >
                                    <div>Discover</div>
                                    <div class="button-icon">
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="100%"
                                        height="100%"
                                        viewBox="0 0 16 16"
                                        fill="none"
                                      >
                                        <path
                                          d="M2 8H14.5M14.5 8L8.5 2M14.5 8L8.5 14"
                                          stroke="currentColor"
                                          stroke-width="2"
                                          stroke-linejoin="round"
                                        ></path>
                                      </svg>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </a>
                        </li>
                      </ul>
                    </div>
                  </nav>
                </div>
              </li>
              <li class="nav-menu-list-item">
                <a href="#" class="nav-link nav-link-on-inverse w-inline-block"><div>About</div></a>
              </li>
              <li class="nav-menu-list-item">
                <a href="#" class="nav-link nav-link-on-inverse w-inline-block"><div>News</div></a>
              </li>
              <li class="nav-menu-list-item">
                <div
                  data-delay="0"
                  data-hover="false"
                  data-w-id="5b7c391a-8de6-0ef5-7bb4-2c37cca08611"
                  class="nav-menu-dropdown w-dropdown"
                >
                  <div class="nav-link nav-link-on-inverse w-dropdown-toggle">
                    <div>Support</div>
                    <div class="nav-caret w-icon-dropdown-toggle"></div>
                  </div>
                  <div class="nav-menu-dropdown-list w-dropdown-list">
                    <div class="nav-menu-dropdown-list-wrapper">
                      <ul role="list" class="flex-vertical utility-margin-bottom-0 w-list-unstyled">
                        <li class="utility-margin-bottom-0">
                          <a href="#" class="nav-dropdown-link w-inline-block">
                            <div class="button-label">Contact</div>
                          </a>
                        </li>
                        <li class="utility-margin-bottom-0">
                          <a href="#" class="nav-dropdown-link w-inline-block">
                            <div class="button-label">FAQs</div>
                          </a>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </li>
            </ul>
          </nav>
          <div class="button-group utility-margin-top-0">
            <a href="#" class="button primary-button-on-inverse w-inline-block">
              <div class="button-label">Get Started</div>
            </a>
          </div>
        </div>
        <div class="nav-mobile-menu-button w-nav-button">
          <div class="icon icon-on-inverse">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
              <g
                class="nc-icon-wrapper"
                stroke-linecap="square"
                stroke-linejoin="miter"
                stroke-width="1.5"
                fill="none"
                stroke="currentColor"
                stroke-miterlimit="10"
              >
                <line x1="1" y1="12" x2="23" y2="12" stroke="currentColor"></line>
                <line x1="1" y1="5" x2="23" y2="5"></line>
                <line x1="1" y1="19" x2="23" y2="19"></line>
              </g>
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Main section - Hero area -->
    <header
      class="section utility-padding-all-0 utility-overflow-hidden utility-text-on-overlay inverse-section"
    >
      <div class="w-layout-grid grid-layout">
        <div
          class="utility-position-relative utility-min-height-100dvh w-node-e27ea654-f6c1-19f7-bd13-811b9397ece8-36dbfb72"
        >
          <div class="ix-parallax-scale-out-hero utility-radius-xl tw:!m-2">
            <img
              width="1227"
              height="922"
              alt=""
              src="https://cdn.prod.website-files.com/682997c5e8ae5cdd36dbfb58/682998522f64c4567a6f6fd2_21f727e2-456f-43e2-b276-4caf2f4bdea6.avif"
              loading="lazy"
              class="cover-image utility-position-absolute ix-parallax-speed--10"
            />
            <div class="overlay utility-mask-top"></div>
          </div>
        </div>
        <div
          class="container utility-z-index-2 w-node-e27ea654-f6c1-19f7-bd13-811b9397ecf3-36dbfb72"
        >
          <div class="utility-margin-bottom-6rem">
            <h1 class="h1-heading utility-text-align-center">
              Instant AGV data<br />right here, right now.
            </h1>
            <div class="button-group align-center">
              <a href="#" class="button primary-button-on-inverse">Dive in</a>
              <a href="#" class="button secondary-button secondary-button-on-inverse"
                >Discover more</a
              >
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- Features display section -->
    <section class="section">
      <div class="container">
        <div class="flex-horizontal flex-vertical flex-gap-lg">
          <!-- Feature card 1 -->
          <div class="ix-sticky-card is-card-1">
            <div class="card card-body utility-margin-top-5rem">
              <div
                class="w-layout-grid grid-layout tablet-1-column grid-gap-xxl utility-aspect-3x2"
              >
                <div>
                  <img
                    width="502"
                    height="733"
                    alt=""
                    src="https://cdn.prod.website-files.com/682997c5e8ae5cdd36dbfb58/68299852803880e0df98ccb4_18db8958-f850-40d6-b646-4b62b73898cf.avif"
                    loading="lazy"
                    class="image cover-image"
                  />
                </div>
                <div class="w-node-_67533f45-8263-6b41-6810-690f97b1cf62-36dbfb72">
                  <div class="eyebrow">Real-time AGV Monitoring</div>
                  <h2>Master Real-time Data, Stay Ahead</h2>
                  <p class="paragraph-lg">
                    Monitor your AGV fleet in real-time with our cutting-edge web app. Track,
                    analyze, and optimize operations effortlessly.
                  </p>
                  <div class="button-group">
                    <a href="#" class="button">Explore Now</a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Feature card 2 -->
          <div class="ix-sticky-card is-card-2">
            <div class="card card-body utility-margin-top-5rem utility-backdrop-filter-blur">
              <div
                class="w-layout-grid grid-layout tablet-1-column grid-gap-xxl utility-aspect-3x2"
              >
                <div>
                  <img
                    width="502"
                    height="733"
                    alt=""
                    src="https://cdn.prod.website-files.com/682997c5e8ae5cdd36dbfb58/68299852010ce568878d0d36_f6216b04-a7ae-48c5-ac8c-c5b26baa8dd9.avif"
                    loading="lazy"
                    class="image cover-image"
                  />
                </div>
                <div class="w-node-_67533f45-8263-6b41-6810-690f97b1cf71-36dbfb72">
                  <div class="eyebrow">Warehouse Data Access</div>
                  <h2>Unlock Warehouse Efficiency</h2>
                  <p class="paragraph-lg">
                    Access comprehensive warehouse data to streamline your logistics. Our app offers
                    intuitive data visualization and management tools.
                  </p>
                  <div class="button-group">
                    <a href="#" class="button">Learn More</a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Feature card 3 -->
          <div class="ix-sticky-card is-card-3">
            <div class="card card-body utility-margin-top-5rem utility-backdrop-filter-blur">
              <div
                class="w-layout-grid grid-layout tablet-1-column grid-gap-xxl utility-aspect-3x2"
              >
                <div>
                  <img
                    width="502"
                    height="733"
                    alt=""
                    src="https://cdn.prod.website-files.com/682997c5e8ae5cdd36dbfb58/6829985254277b39dc34cfbe_d0f458a4-5868-4295-abf8-9789b33a0966.avif"
                    loading="lazy"
                    class="image cover-image"
                  />
                </div>
                <div class="w-node-_67533f45-8263-6b41-6810-690f97b1cf80-36dbfb72">
                  <div class="eyebrow">Orders & Analytics</div>
                  <h2>Elevate Your Business Intelligence</h2>
                  <p class="paragraph-lg">
                    Dive into detailed order analytics to make informed decisions. Our platform
                    provides actionable insights for smarter operations.
                  </p>
                  <div class="button-group">
                    <a href="#" class="button">Get Started</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Introduction section -->
    <section class="section secondary-section">
      <div class="container">
        <div
          class="w-layout-grid grid-layout desktop-3-column mobile-landscape-1-column grid-gap-md"
        >
          <div class="w-node-c59aaa53-dbd1-1c03-a4c9-bd26a2626c38-36dbfb72">
            <h2 class="h1-heading">AGV Monitoring Made Easy</h2>
            <div class="rich-text paragraph-lg utility-margin-bottom-0">
              <p>
                Step into the future of AGV monitoring with our sleek web app. Enjoy real-time data
                tracking and analysis, designed to streamline your operations and empower
                decision-making.
              </p>
              <p>
                Discover unparalleled insights into warehouse data and order management. Our
                platform provides a holistic view, ensuring you have all the details you need at
                your fingertips.
              </p>
              <p>
                Leverage advanced analytics to unlock the full potential of your data. From
                performance metrics to trend analysis, gain the insights you need to propel your
                business forward.
              </p>
            </div>
          </div>
          <div class="w-node-c59aaa53-dbd1-1c03-a4c9-bd26a2626c45-36dbfb72">
            <h2 class="eyebrow utility-margin-bottom-2rem">Discover More</h2>
            <div class="flex-vertical x-left flex-gap-xxs">
              <div class="tag"><div>AGV Trends</div></div>
              <div class="tag"><div>Warehouse Insights</div></div>
              <div class="tag"><div>Order Tracking</div></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Blog/News display area -->
    <section class="section utility-padding-all-0">
      <div class="w-layout-grid grid-layout desktop-3-column tablet-1-column grid-gap-sm">
        <a
          href="#"
          class="utility-link-content-block w-node-cba138d3-ce4a-1a76-0016-94b097c2cf9f-36dbfb72"
        >
          <div class="utility-aspect-3x2">
            <img
              width="808"
              height="538"
              alt=""
              src="https://cdn.prod.website-files.com/682997c5e8ae5cdd36dbfb58/6829985249263c690868b846_fd477acf-fadc-4ed6-ad60-862e87bf48a4.avif"
              loading="lazy"
              class="cover-image"
            />
          </div>
          <div class="utility-padding-all-2rem">
            <div class="utility-margin-bottom-1rem">
              <div class="tag-group utility-margin-bottom-1rem">
                <div class="tag">Tech Buzz</div>
              </div>
            </div>
            <h3 class="h1-heading utility-margin-bottom-2rem">AGV Data: The Next Frontier</h3>
            <p>Uncover the future of AGV monitoring with our innovative web app.</p>
            <div class="flex-horizontal align-bottom justify-space-between">
              <div class="button">Discover</div>
            </div>
          </div>
        </a>

        <!-- Other blog posts -->
        <a href="#" class="utility-link-content-block">
          <div class="utility-aspect-3x2">
            <img
              width="388"
              height="259"
              alt=""
              src="https://cdn.prod.website-files.com/682997c5e8ae5cdd36dbfb58/68299852d8c30949b20bc925_a9005f43-543d-4b93-8490-85b377bde5c4.avif"
              loading="lazy"
              class="cover-image"
            />
          </div>
          <div class="utility-padding-all-2rem">
            <div class="tag-group utility-margin-bottom-1rem">
              <div class="tag">News Flash</div>
            </div>
            <h3 class="h3-heading utility-margin-bottom-0">Get the Latest Scoop</h3>
          </div>
        </a>

        <a href="#" class="utility-link-content-block">
          <div class="utility-aspect-3x2">
            <img
              width="388"
              height="259"
              alt=""
              src="https://cdn.prod.website-files.com/682997c5e8ae5cdd36dbfb58/6829985223cb528bf9852576_3a6f89b6-3151-4f4f-9ae8-8a092eaec68a.avif"
              loading="lazy"
              class="cover-image"
            />
          </div>
          <div class="utility-padding-all-2rem">
            <div class="tag-group utility-margin-bottom-1rem">
              <div class="tag">Trend Watch</div>
            </div>
            <h3 class="h3-heading utility-margin-bottom-0">Warehouse Tech Breakthroughs</h3>
          </div>
        </a>
      </div>
    </section>

    <!-- Call to action area -->
    <section class="section secondary-section">
      <div class="container">
        <div class="flex-vertical x-center">
          <div
            class="utility-text-align-center w-node-_5cb9bdc4-ae5c-c2a0-cdae-b04449892b17-36dbfb72"
          >
            <div class="eyebrow">Instant AGV data</div>
            <h2 class="h1-heading">Effortlessly track and enhance your fleet</h2>
            <div class="button-group align-center">
              <a href="#" class="button">Discover now</a>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="footer inverse-footer">
      <div class="container">
        <div
          class="w-layout-grid grid-layout desktop-4-column tablet-2-column mobile-landscape-1-column grid-gap-md"
        >
          <div
            class="flex-vertical flex-gap-sm x-left w-node-_3ae6c289-f673-389d-37da-d89446ee5702-46ee56ff"
          >
            <a href="#" class="logo">
              <div class="nav-logo-icon">
                <svg
                  width="100%"
                  height="100%"
                  viewBox="0 0 33 33"
                  preserveAspectRatio="xMidYMid meet"
                >
                  <path
                    d="M28,0H5C2.24,0,0,2.24,0,5v23c0,2.76,2.24,5,5,5h23c2.76,0,5-2.24,5-5V5c0-2.76-2.24-5-5-5ZM29,17c-6.63,0-12,5.37-12,12h-1c0-6.63-5.37-12-12-12v-1c6.63,0,12-5.37,12-12h1c0,6.63,5.37,12,12,12v1Z"
                    fill="currentColor"
                  ></path>
                </svg>
              </div>
              <div class="paragraph-xl utility-margin-bottom-0 utility-text-all-caps">
                AGV Monitoring System
              </div>
            </a>
            <ul
              role="list"
              aria-label="Social media links"
              class="footer-icons-group utility-margin-top-auto w-list-unstyled"
            >
              <!-- Social media icons -->
              <li class="utility-margin-bottom-0">
                <a href="#" class="footer-icon-link">
                  <div class="icon-small on-accent-icon">
                    <svg width="100%" height="100%" viewBox="0 0 16 16">
                      <path
                        d="M16,8.048a8,8,0,1,0-9.25,7.9V10.36H4.719V8.048H6.75V6.285A2.822,2.822,0,0,1,9.771,3.173a12.2,12.2,0,0,1,1.791.156V5.3H10.554a1.155,1.155,0,0,0-1.3,1.25v1.5h2.219l-.355,2.312H9.25v5.591A8,8,0,0,0,16,8.048Z"
                        fill="currentColor"
                      ></path>
                    </svg>
                  </div>
                  <div class="utility-screen-reader-visible-only">Follow us on Facebook</div>
                </a>
              </li>
              <!-- More social media icons -->
              <!-- ...other social media icons... -->
            </ul>
          </div>

          <!-- Footer nav links -->
          <ul role="list" class="utility-margin-bottom-0 w-list-unstyled">
            <li><h2 class="h6-heading utility-text-secondary">Explore</h2></li>
            <li>
              <a href="#" class="footer-link footer-link-on-inverse">
                <div>Dashboard</div>
              </a>
            </li>
            <!-- More footer links -->
            <!-- ...other footer links... -->
          </ul>

          <!-- Other footer columns -->
          <!-- ...other footer navigation... -->
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
/* Component-specific styles */
.agv-adv-container {
  width: 100%;
  overflow-x: hidden;
  position: relative;
}

/* Ensure button styles are correct */
.button {
  display: inline-flex;
  padding: 8px 24px; /* Adjusted padding for better appearance */
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  background-color: var(--v-primary-base, #1976d2); /* Use Vuetify primary color as fallback */
  color: white;
  text-decoration: none;
  font-weight: 500;
  transition:
    background-color 0.3s,
    transform 0.2s; /* Added transform transition */
  cursor: pointer;
  border: none; /* Ensure no default border */
}

.button:hover {
  background-color: var(--v-primary-darken1, #1565c0); /* Darken on hover */
  transform: translateY(-2px); /* Slight lift on hover */
}

/* Add additional responsive adjustments */
@media (max-width: 767px) {
  .h1-heading {
    font-size: 28px; /* Adjusted for smaller screens */
    line-height: 1.2;
  }

  .utility-margin-bottom-6rem {
    margin-bottom: 3rem; /* Reduced margin for smaller screens */
  }
}

/* Custom overrides for Webflow styles within this Vue component */
:deep(.card) {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); /* Softer shadow */
}

:deep(.cover-image) {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Ensure iframe content displays correctly */
:deep(iframe) {
  width: 100%;
  border: none;
}

/* Fix potential conflicts */
:deep(.container) {
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
  padding-left: 24px; /* Standard padding */
  padding-right: 24px; /* Standard padding */
}

:deep(.section) {
  padding: 80px 0;
}

@media (max-width: 767px) {
  :deep(.section) {
    padding: 40px 0; /* Reduced padding for smaller screens */
  }
}

/* Add additional particle animation styles */
@keyframes float {
  0%,
  100% {
    transform: translateY(0) rotate(0);
  }
  25% {
    transform: translateY(-5px) rotate(5deg);
  }
  50% {
    transform: translateY(0) rotate(0);
  }
  75% {
    transform: translateY(5px) rotate(-5deg);
  }
}

/* Add 3D explosion particle effect styles */
.explosion-container {
  transform-style: preserve-3d;
}

.explosion-particle {
  transform-style: preserve-3d;
  will-change: transform; /* Optimize for transform animations */
}

/* Add additional styles related to Material Design animations */
@keyframes spotlight {
  0%,
  100% {
    filter: brightness(1);
  }
  50% {
    filter: brightness(1.3);
  }
}

/* Digital counter animation styles */
.digit-placeholder,
.digit-wrapper,
.digit {
  will-change: transform; /* Optimize for transform animations */
}

/* Add scroll hint animation styles */
@keyframes scroll-hint {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

/* Optimize styles for mobile devices */
@media (max-width: 600px) {
  .material-stats-title {
    font-size: 2rem; /* Further reduce font size for small screens */
  }

  .material-stat-card {
    height: 170px; /* Adjust card height */
  }

  .material-stat-number {
    font-size: 2.8rem; /* Adjust number font size */
  }

  :deep(.button) {
    /* Adjust button padding for smaller screens */
    padding: 6px 18px;
  }
}
</style>
