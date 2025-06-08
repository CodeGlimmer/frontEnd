import { createMemoryHistory, createRouter } from 'vue-router'

export default createRouter({
  history: createMemoryHistory(),
  routes: [
    {
      path: '/',
      name: 'root',
      children: [
        {
          path: '', // 默认登录界面
          name: 'login',
          component: () => import('@/views/LogIn/LoginView.vue'),
        },
        {
          path: 'signup',
          name: 'signup',
          component: () => import('@/views/LogIn/SignupView.vue'),
        },
        {
          path: 'index',
          name: 'index',
          component: () => import('@/layouts/IndexLayout.vue'),
          /**index的children，有几个一级路由就有几个child */
          children: [
            /**关于ordermanagement的路由 */
            {
              path: '',
              name: 'dashboard',
              components: {
                main: () => import('@/views/DashBoard/DashBoard.vue'),
              },
            },
            {
              path: 'ordermanagement',
              name: 'ordermanagement',
              /**有几个二级路由就有几个child */
              children: [
                {
                  path: '', // 默认子路由
                  name: 'orderoperation',
                  components: {
                    // 由于布局限制，无奈要用这种命名路由，使用keeplive提高性能
                    sidebar: () => import('@/views/OrderManagement/OrderManagementSideBar.vue'),
                    main: () => import('@/views/OrderManagement/OrderManagementView.vue'),
                  },
                },
                {
                  path: 'command',
                  name: 'command',
                  components: {
                    sidebar: () => import('@/views/OrderManagement/OrderManagementSideBar.vue'),
                    main: () => import('@/views/OrderManagement/CommandView.vue'),
                  },
                },
                {
                  path: 'charts',
                  name: 'charts',
                  components: {
                    sidebar: () => import('@/views/OrderManagement/OrderManagementSideBar.vue'),
                    main: () => import('@/views/OrderManagement/OrderCharts.vue'),
                  },
                },
              ],
            },
            {
              path: 'agvmonitoring',
              name: 'agvmonitoring',
              children: [
                {
                  path: '',
                  name: 'agv',
                  components: {
                    sidebar: () => import('@/views/AgvMonitoring/AgvMonitoringSideBar.vue'),
                    main: () => import('@/views/AgvMonitoring/AgvMonitoring.vue'),
                  },
                },
                {
                  path: 'velocity',
                  name: 'velocity',
                  components: {
                    sidebar: () => import('@/views/AgvMonitoring/AgvMonitoringSideBar.vue'),
                    main: () => import('@/views/AgvMonitoring/StatusView.vue'),
                  },
                },
                {
                  path: 'scan',
                  name: 'scan',
                  components: {
                    sidebar: () => import('@/views/AgvMonitoring/AgvMonitoringSideBar.vue'),
                    main: () => import('@/views/AgvMonitoring/ScanView.vue'),
                  },
                },
                {
                  path: 'map',
                  name: 'map',
                  components: {
                    sidebar: () => import('@/views/AgvMonitoring/AgvMonitoringSideBar.vue'),
                    main: () => import('@/views/AgvMonitoring/RosMap.vue'),
                  },
                },
                {
                  path: 'foxglove',
                  name: 'foxglove',
                  components: {
                    sidebar: () => import('@/views/AgvMonitoring/AgvMonitoringSideBar.vue'),
                    main: () => import('@/views/AgvMonitoring/FoxGlove.vue'),
                  },
                },
              ],
            },
            {
              path: 'schedulingplanning',
              name: 'schedulingplanning',
              children: [
                {
                  path: '',
                  name: 'predictor',
                  components: {
                    main: () => import('@/views/PredictorViews/AllPrediction.vue'),
                    sidebar: () => import('@/views/SchedulePlan/PlanSideBar.vue'),
                  },
                },
                {
                  path: 'agv-dispatch',
                  name: 'agv-dispatch',
                  components: {
                    main: () => import('@/views/SchedulePlan/agvDispatch/index.vue'),
                    sidebar: () => import('@/views/SchedulePlan/PlanSideBar.vue'),
                  },
                },
              ],
            },
            {
              path: 'memo',
              name: 'memo',
              components: {
                main: () => import('@/views/littleapps/MemoView.vue'),
              },
            },
            {
              path: 'setting',
              name: 'setting',
              components: {
                main: () => import('@/views/littleapps/PersonalSettring.vue'),
              },
            },
            {
              path: 'shop',
              name: 'shop',
              components: {
                main: () => import('@/views/littleapps/ShopView.vue'),
              },
            },
            {
              path: 'editor',
              name: 'editor',
              components: {
                main: () => import('@/views/littleapps/JsonEditor.vue'),
              },
            },
            {
              path: 'scheduleApp',
              name: 'scheduleApp',
              components: {
                main: () => import('@/views/littleapps/ScheduleApp.vue'),
              },
            },
            {
              path: 'adv-display',
              name: 'AdvDisplay',
              components: {
                main: () => import('@/views/littleapps/AdvDisplay.vue'),
              },
              meta: {
                title: 'AGV监控系统 - 广告展示',
              },
            },
            {
              path: 'chatai',
              name: 'chatai',
              components: {
                main: () => import('@/views/ChatAI/EnhancedChatAI.vue'),
              },
              meta: {
                title: 'AGV监控系统 - AI助手',
              },
            },
          ],
        },
      ],
    },
  ],
})
