<template>
  <div class="demo-container">
    <v-app>
      <v-app-bar color="primary" dark>
        <v-toolbar-title>DeepSeek ChatAI 演示</v-toolbar-title>
        <v-spacer />
        <v-btn @click="openSettings" icon>
          <v-icon>mdi-cog</v-icon>
        </v-btn>
      </v-app-bar>

      <v-main>
        <enhanced-chat-a-i />
      </v-main>
    </v-app>

    <!-- 设置对话框 -->
    <v-dialog v-model="settingsDialog" max-width="500">
      <v-card>
        <v-card-title>使用说明</v-card-title>
        <v-card-text>
          <h4>如何使用 DeepSeek ChatAI：</h4>
          <v-list density="compact">
            <v-list-item>
              <v-list-item-title>1. 获取 API Key</v-list-item-title>
              <v-list-item-subtitle>
                访问
                <a href="https://platform.deepseek.com" target="_blank">DeepSeek 官网</a>
                注册账号并获取 API Key
              </v-list-item-subtitle>
            </v-list-item>

            <v-list-item>
              <v-list-item-title>2. 配置 API</v-list-item-title>
              <v-list-item-subtitle>
                在左侧配置面板输入您的 API Key 和其他设置
              </v-list-item-subtitle>
            </v-list-item>

            <v-list-item>
              <v-list-item-title>3. 开始聊天</v-list-item-title>
              <v-list-item-subtitle> 配置完成后即可开始与 DeepSeek AI 对话 </v-list-item-subtitle>
            </v-list-item>

            <v-list-item>
              <v-list-item-title>4. 功能特色</v-list-item-title>
              <v-list-item-subtitle>
                支持 Markdown 格式、代码高亮、流式响应等功能
              </v-list-item-subtitle>
            </v-list-item>
          </v-list>

          <v-alert type="info" class="mt-4">
            <strong>提示：</strong> 首次使用需要配置 API Key，配置信息会保存在本地存储中。
          </v-alert>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="settingsDialog = false" color="primary"> 了解了 </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import EnhancedChatAI from './EnhancedChatAI.vue'

const settingsDialog = ref(false)

const openSettings = () => {
  settingsDialog.value = true
}
</script>

<style scoped>
.demo-container {
  height: 100vh;
}
</style>
