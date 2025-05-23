import '@/assets/tailwind.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import vuetify from '@/plugins/vuetify'
import ArcoVue from '@arco-design/web-vue'

import App from '@/App.vue'
import router from '@/router'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(vuetify)
app.use(ArcoVue)

app.mount('#app')
