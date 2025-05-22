import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { TextPlugin } from 'gsap/TextPlugin'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'
import { MotionPathPlugin } from 'gsap/MotionPathPlugin'

// 注册插件
gsap.registerPlugin(ScrollTrigger, TextPlugin, ScrollToPlugin, MotionPathPlugin)

/**
 * 创建元素进入动画
 * @param {string} selector - CSS选择器
 * @param {object} options - 动画配置
 */
export const createEntranceAnimation = (selector, options = {}) => {
  const defaults = {
    y: 50,
    opacity: 0,
    duration: 0.8,
    stagger: 0.1,
    ease: 'power3.out',
    start: 'top 80%',
  }

  const config = { ...defaults, ...options }
  const elements = document.querySelectorAll(selector)

  if (elements.length === 0) return

  gsap.set(elements, { opacity: 0, y: config.y })

  ScrollTrigger.create({
    trigger: elements[0].parentElement || elements[0],
    start: config.start,
    onEnter: () => {
      gsap.to(elements, {
        opacity: 1,
        y: 0,
        duration: config.duration,
        stagger: config.stagger,
        ease: config.ease,
      })
    },
  })
}

/**
 * 创建悬停动画
 * @param {string} selector - CSS选择器
 * @param {object} hoverEffect - 悬停效果配置
 */
export const createHoverAnimation = (selector, hoverEffect = {}) => {
  const defaults = {
    scale: 1.05,
    y: -5,
    duration: 0.3,
    ease: 'power2.out',
  }

  const config = { ...defaults, ...hoverEffect }
  const elements = document.querySelectorAll(selector)

  elements.forEach((element) => {
    element.addEventListener('mouseenter', () => {
      gsap.to(element, {
        scale: config.scale,
        y: config.y,
        duration: config.duration,
        ease: config.ease,
      })
    })

    element.addEventListener('mouseleave', () => {
      gsap.to(element, {
        scale: 1,
        y: 0,
        duration: config.duration,
        ease: config.ease,
      })
    })
  })
}

/**
 * 创建打字效果
 * @param {string} selector - CSS选择器
 * @param {object} options - 动画配置
 */
export const createTypingEffect = (selector, options = {}) => {
  const defaults = {
    duration: 2,
    ease: 'none',
    delay: 0.5,
  }

  const config = { ...defaults, ...options }
  const element = document.querySelector(selector)

  if (!element) return

  const originalText = element.innerHTML
  element.innerHTML = ''

  gsap.to(element, {
    duration: config.duration,
    text: {
      value: originalText,
      ease: config.ease,
    },
    delay: config.delay,
  })
}

/**
 * 创建视差滚动效果
 * @param {string} selector - CSS选择器
 * @param {object} options - 视差配置
 */
export const createParallaxEffect = (selector, options = {}) => {
  const defaults = {
    y: '30%',
    ease: 'none',
  }

  const config = { ...defaults, ...options }
  const elements = document.querySelectorAll(selector)

  elements.forEach((element) => {
    gsap.to(element, {
      y: config.y,
      ease: config.ease,
      scrollTrigger: {
        trigger: element.parentElement || element,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
    })
  })
}

/**
 * 创建元素淡出动画
 * @param {string} selector - CSS选择器
 * @param {object} options - 动画配置
 */
export const createFadeOutAnimation = (selector, options = {}) => {
  const defaults = {
    y: -50,
    opacity: 0,
    duration: 0.8,
    ease: 'power3.in',
    start: 'top top',
  }

  const config = { ...defaults, ...options }
  const elements = document.querySelectorAll(selector)

  elements.forEach((element) => {
    ScrollTrigger.create({
      trigger: element,
      start: config.start,
      onLeaveBack: () => {
        gsap.to(element, {
          opacity: config.opacity,
          y: config.y,
          duration: config.duration,
          ease: config.ease,
        })
      },
      onEnter: () => {
        gsap.to(element, {
          opacity: 1,
          y: 0,
          duration: config.duration,
          ease: 'power3.out',
        })
      },
    })
  })
}

/**
 * 创建3D卡片效果
 * @param {string} selector - CSS选择器
 */
export const create3DCardEffect = (selector) => {
  const cards = document.querySelectorAll(selector)

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

export default {
  createEntranceAnimation,
  createHoverAnimation,
  createTypingEffect,
  createParallaxEffect,
  createFadeOutAnimation,
  create3DCardEffect,
}
