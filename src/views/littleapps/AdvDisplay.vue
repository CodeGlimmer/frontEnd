<script setup>
import { onMounted } from 'vue'

// 在组件挂载时加载必要的外部资源
onMounted(() => {
  // 加载 Webflow 样式
  if (!document.querySelector('link[href*="agvjian-kong-xi-tong.webflow.shared"]')) {
    const webflowStyle = document.createElement('link')
    webflowStyle.rel = 'stylesheet'
    webflowStyle.type = 'text/css'
    webflowStyle.href =
      'https://cdn.prod.website-files.com/682997c5e8ae5cdd36dbfb58/css/agvjian-kong-xi-tong.webflow.shared.be477684c.css'
    document.head.appendChild(webflowStyle)
  }

  // 加载 Google Fonts
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

  // 加载 WebFont
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

  // 在组件卸载时可能需要清理，但这里暂时不处理
  // 因为在单页应用中切换页面时通常不会卸载这些共享资源
})
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
                            <!-- 导航菜单内容 - 真实功能部分 -->
                            <div>
                              <div class="eyebrow">Real-time Monitoring</div>
                              <ul role="list" class="nav-mega-menu-list w-list-unstyled">
                                <!-- 菜单项1 -->
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
                                <!-- 其他菜单项 -->
                                <!-- ...更多菜单项... -->
                              </ul>
                            </div>
                            <!-- 其他导航列 -->
                            <!-- ...更多导航列... -->
                          </div>
                        </li>
                        <!-- 营销卡片区域 -->
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

    <!-- 主题部分 - 英雄区域 -->
    <header
      class="section utility-padding-all-0 utility-overflow-hidden utility-text-on-overlay inverse-section"
    >
      <div class="w-layout-grid grid-layout">
        <div
          class="utility-position-relative utility-min-height-100dvh w-node-e27ea654-f6c1-19f7-bd13-811b9397ece8-36dbfb72"
        >
          <div class="ix-parallax-scale-out-hero utility-radius-xl">
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

    <!-- 特点展示部分 -->
    <section class="section">
      <div class="container">
        <div class="flex-horizontal flex-vertical flex-gap-lg">
          <!-- 特点卡片1 -->
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
                  <div class="eyebrow">AGV实时监控</div>
                  <h2>掌握实时数据，领先一步</h2>
                  <p class="paragraph-lg">
                    通过我们的尖端web应用实时监控AGV车队。轻松跟踪、分析和优化操作。
                  </p>
                  <div class="button-group">
                    <a href="#" class="button">立即探索</a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 特点卡片2 -->
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
                  <div class="eyebrow">仓库数据访问</div>
                  <h2>解锁仓库效率</h2>
                  <p class="paragraph-lg">
                    访问全面的仓库数据，简化您的物流。我们的应用提供直观的数据可视化和管理工具。
                  </p>
                  <div class="button-group">
                    <a href="#" class="button">了解更多</a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 特点卡片3 -->
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
                  <div class="eyebrow">订单与分析</div>
                  <h2>提升您的商业智能</h2>
                  <p class="paragraph-lg">
                    深入了解详细的订单分析，做出明智决策。我们的平台提供可操作的洞察力，助您更聪明地运营。
                  </p>
                  <div class="button-group">
                    <a href="#" class="button">开始使用</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 介绍部分 -->
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

    <!-- 博客/资讯展示区 -->
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

        <!-- 其他博客文章 -->
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

    <!-- 行动召唤区 -->
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

    <!-- 页脚 -->
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
                AGV监控系统
              </div>
            </a>
            <ul
              role="list"
              aria-label="Social media links"
              class="footer-icons-group utility-margin-top-auto w-list-unstyled"
            >
              <!-- 社交媒体图标 -->
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
                  <div class="utility-screen-reader-visible-only">在Facebook上关注我们</div>
                </a>
              </li>
              <!-- 更多社交媒体图标 -->
              <!-- ...其他社交媒体图标... -->
            </ul>
          </div>

          <!-- 页脚导航链接 -->
          <ul role="list" class="utility-margin-bottom-0 w-list-unstyled">
            <li><h2 class="h6-heading utility-text-secondary">探索</h2></li>
            <li>
              <a href="#" class="footer-link footer-link-on-inverse">
                <div>仪表盘</div>
              </a>
            </li>
            <!-- 更多页脚链接 -->
            <!-- ...其他页脚链接... -->
          </ul>

          <!-- 其他页脚列 -->
          <!-- ...其他页脚导航... -->
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
/* 组件特定样式 */
.agv-adv-container {
  width: 100%;
  overflow-x: hidden;
  position: relative;
}

/* 确保按钮样式正确 */
.button {
  display: inline-flex;
  padding: 8px 24px;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  background-color: var(--v-primary-base, #1976d2);
  color: white;
  text-decoration: none;
  font-weight: 500;
  transition: background-color 0.3s;
  cursor: pointer;
}

/* 添加额外的响应式调整 */
@media (max-width: 767px) {
  .h1-heading {
    font-size: 32px;
    line-height: 1.2;
  }

  .utility-margin-bottom-6rem {
    margin-bottom: 3rem;
  }
}

/* 自定义此Vue组件内的Webflow样式覆盖 */
:deep(.card) {
  border-radius: 12px;
  overflow: hidden;
}

:deep(.cover-image) {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 确保iframe嵌套内容正确显示 */
:deep(iframe) {
  width: 100%;
  border: none;
}

/* 修复可能的冲突 */
:deep(.container) {
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
  padding-left: 24px;
  padding-right: 24px;
}

:deep(.section) {
  padding: 80px 0;
}

@media (max-width: 767px) {
  :deep(.section) {
    padding: 40px 0;
  }
}
</style>
