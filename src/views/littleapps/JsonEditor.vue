<template>
  <v-container fluid class="pa-4">
    <v-row>
      <v-col cols="12">
        <!-- 主要内容卡片 -->
        <v-card elevation="2" class="main-card">
          <!-- 标题栏 -->
          <v-card-title class="primary white--text d-flex align-center pa-4">
            <v-icon color="white" class="mr-3">mdi-code-json</v-icon>
            <span class="text-h5 font-weight-medium">JSON Editor</span>
            <v-spacer></v-spacer>
            <!-- 状态指示器 -->
            <v-chip
              :color="isValidJson ? 'success' : 'error'"
              :class="{ pulse: !isValidJson }"
              small
              dark
              class="ml-2"
            >
              <v-icon small left>
                {{ isValidJson ? 'mdi-check-circle' : 'mdi-alert-circle' }}
              </v-icon>
              {{ isValidJson ? '格式正确' : '格式错误' }}
            </v-chip>
          </v-card-title>

          <v-card-text class="px-6 py-4">
            <!-- 文件操作区域 -->
            <v-card outlined class="mb-4 file-section">
              <v-card-subtitle class="pb-2 d-flex align-center">
                <v-icon small color="primary" class="mr-2">mdi-file-document-outline</v-icon>
                <span class="font-weight-medium">文件操作</span>
              </v-card-subtitle>
              <v-card-text class="pt-0">
                <v-row align="center">
                  <v-col cols="12" md="6">
                    <v-file-input
                      v-model="selectedFile"
                      label="选择JSON文件"
                      accept=".json,.txt"
                      prepend-icon="mdi-file-plus"
                      outlined
                      dense
                      hide-details
                      clearable
                    ></v-file-input>
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-chip-group class="text-caption">
                      <v-chip small outlined color="primary">
                        <v-icon small left>mdi-counter</v-icon>
                        {{ lineCount }} 行
                      </v-chip>
                      <v-chip small outlined color="primary">
                        <v-icon small left>mdi-format-size</v-icon>
                        {{ charCount }} 字符
                      </v-chip>
                      <v-chip small outlined color="success" v-if="currentFileName">
                        <v-icon small left>mdi-file-outline</v-icon>
                        {{ currentFileName }}
                      </v-chip>
                    </v-chip-group>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>

            <!-- 工具栏 -->
            <v-card outlined class="mb-4 toolbar-section">
              <v-card-subtitle class="pb-2 d-flex align-center">
                <v-icon small color="primary" class="mr-2">mdi-tools</v-icon>
                <span class="font-weight-medium">编辑工具</span>
              </v-card-subtitle>
              <v-card-text class="pt-0">
                <v-row>
                  <v-col cols="12" sm="6" md="8">
                    <div class="d-flex flex-wrap">
                      <v-btn
                        @click="saveFile"
                        :disabled="!hasContent"
                        color="primary"
                        outlined
                        class="ma-1"
                      >
                        <v-icon left>mdi-content-save</v-icon>
                        保存
                      </v-btn>

                      <v-btn
                        @click="formatJson"
                        :disabled="!hasContent"
                        color="secondary"
                        outlined
                        class="ma-1"
                      >
                        <v-icon left>mdi-code-braces</v-icon>
                        格式化
                      </v-btn>

                      <v-btn
                        @click="compressJson"
                        :disabled="!hasContent"
                        color="info"
                        outlined
                        class="ma-1"
                      >
                        <v-icon left>mdi-zip-box</v-icon>
                        压缩
                      </v-btn>
                    </div>
                  </v-col>

                  <v-col cols="12" sm="6" md="4">
                    <div class="d-flex flex-wrap">
                      <v-btn
                        @click="showSearchDialog = true"
                        :disabled="!hasContent"
                        color="orange"
                        outlined
                        class="ma-1"
                      >
                        <v-icon left>mdi-magnify</v-icon>
                        搜索
                      </v-btn>

                      <v-btn
                        @click="showHistoryDialog = true"
                        :disabled="history.length === 0"
                        color="purple"
                        outlined
                        class="ma-1"
                      >
                        <v-icon left>mdi-history</v-icon>
                        历史
                      </v-btn>

                      <v-btn
                        @click="clearEditor"
                        :disabled="!hasContent"
                        color="error"
                        outlined
                        class="ma-1"
                      >
                        <v-icon left>mdi-delete</v-icon>
                        清空
                      </v-btn>
                    </div>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>

            <!-- 编辑器区域 -->
            <v-card outlined class="editor-card">
              <v-card-subtitle class="pb-2 d-flex align-center">
                <v-icon small color="primary" class="mr-2">mdi-code-tags</v-icon>
                <span class="font-weight-medium">代码编辑器</span>
                <v-spacer></v-spacer>
                <v-chip v-if="lastSaved" small outlined color="success" class="ml-2">
                  <v-icon small left>mdi-clock-check</v-icon>
                  最后保存: {{ lastSaved }}
                </v-chip>
              </v-card-subtitle>

              <v-card-text class="pa-0">
                <div class="editor-container" :class="{ 'error-shake': hasError }">
                  <v-progress-linear
                    v-show="loading"
                    indeterminate
                    color="primary"
                    height="2"
                  ></v-progress-linear>
                  <div ref="editorContainer" class="code-editor"></div>
                </div>
              </v-card-text>
            </v-card>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- 搜索对话框 - 修复版 -->
    <v-dialog v-model="showSearchDialog" max-width="500" persistent>
      <v-card>
        <v-card-title class="primary white--text">
          <v-icon color="white" class="mr-3">mdi-magnify</v-icon>
          <span class="text-h6">搜索和替换</span>
          <v-spacer></v-spacer>
          <v-btn icon color="white" @click="showSearchDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text class="pt-6 pb-4">
          <v-text-field
            v-model="searchText"
            label="搜索内容"
            outlined
            dense
            prepend-inner-icon="mdi-magnify"
            @keyup.enter="findNext"
            class="mb-4"
            clearable
            hint="按 Enter 搜索"
            persistent-hint
          ></v-text-field>

          <v-text-field
            v-model="replaceText"
            label="替换为"
            outlined
            dense
            prepend-inner-icon="mdi-find-replace"
            clearable
            hint="可选：输入替换内容"
            persistent-hint
          ></v-text-field>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions class="pa-4">
          <v-row no-gutters>
            <v-col cols="12" class="d-flex flex-wrap">
              <v-btn
                @click="findNext"
                color="primary"
                outlined
                small
                class="mr-2 mb-2"
                :disabled="!searchText"
              >
                <v-icon left small>mdi-magnify</v-icon>
                查找下一个
              </v-btn>

              <v-btn
                @click="replaceNext"
                color="secondary"
                outlined
                small
                class="mr-2 mb-2"
                :disabled="!searchText || !replaceText"
              >
                <v-icon left small>mdi-swap-horizontal</v-icon>
                替换
              </v-btn>

              <v-btn
                @click="replaceAll"
                color="warning"
                outlined
                small
                class="mr-2 mb-2"
                :disabled="!searchText || !replaceText"
              >
                <v-icon left small>mdi-swap-horizontal-bold</v-icon>
                全部替换
              </v-btn>

              <v-spacer></v-spacer>

              <v-btn @click="showSearchDialog = false" text small class="mb-2"> 取消 </v-btn>
            </v-col>
          </v-row>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 历史记录对话框 - 修复版 -->
    <v-dialog v-model="showHistoryDialog" max-width="600" persistent scrollable>
      <v-card>
        <v-card-title class="purple white--text">
          <v-icon color="white" class="mr-3">mdi-history</v-icon>
          <span class="text-h6">编辑历史</span>
          <v-spacer></v-spacer>
          <v-btn icon color="white" @click="clearHistory" :disabled="history.length === 0">
            <v-icon>mdi-delete-sweep</v-icon>
          </v-btn>
          <v-btn icon color="white" @click="showHistoryDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text class="pa-0" style="height: 400px">
          <v-list v-if="history.length > 0" class="py-0">
            <template v-for="(item, index) in history" :key="index">
              <v-list-item @click="restoreFromHistory(index)" class="history-item px-4 py-3" ripple>
                <v-list-item-avatar class="mr-4">
                  <v-avatar color="purple lighten-4" size="40">
                    <v-icon color="purple">mdi-restore</v-icon>
                  </v-avatar>
                </v-list-item-avatar>

                <v-list-item-content>
                  <v-list-item-title class="text-body-1 font-weight-medium">
                    {{ item.description }}
                  </v-list-item-title>
                  <v-list-item-subtitle class="text-caption mt-1">
                    {{ item.timestamp }}
                  </v-list-item-subtitle>
                  <v-list-item-subtitle class="text-caption text--disabled mt-1">
                    预览: {{ getContentPreview(item.content) }}
                  </v-list-item-subtitle>
                </v-list-item-content>

                <v-list-item-action>
                  <v-btn icon small color="purple">
                    <v-icon>mdi-restore</v-icon>
                  </v-btn>
                </v-list-item-action>
              </v-list-item>

              <v-divider v-if="index < history.length - 1" :key="`divider-${index}`"></v-divider>
            </template>
          </v-list>

          <!-- 空状态 -->
          <v-container v-else class="text-center py-8">
            <v-icon size="64" color="grey lighten-2">mdi-history</v-icon>
            <p class="text-h6 grey--text mt-4">暂无历史记录</p>
            <p class="text-body-2 grey--text">开始编辑内容后，历史记录将显示在这里</p>
          </v-container>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions class="pa-4">
          <v-chip small outlined color="info" class="mr-2">
            <v-icon small left>mdi-information</v-icon>
            共 {{ history.length }} 条记录
          </v-chip>
          <v-spacer></v-spacer>
          <v-btn @click="showHistoryDialog = false" color="primary" text> 关闭 </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Material Design 风格的 Snackbar -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      timeout="4000"
      bottom
      right
      shaped
      class="elevation-6"
    >
      <v-row align="center" no-gutters>
        <v-col class="grow">
          <v-icon left color="white">{{ snackbar.icon }}</v-icon>
          {{ snackbar.message }}
        </v-col>
        <v-col class="shrink">
          <v-btn icon color="white" @click="snackbar.show = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-col>
      </v-row>
    </v-snackbar>
  </v-container>
</template>

<script>
import { EditorView, basicSetup } from 'codemirror'
import { json } from '@codemirror/lang-json'
import { oneDark } from '@codemirror/theme-one-dark'
import { keymap } from '@codemirror/view'

export default {
  name: 'JsonEditorPro',
  data() {
    return {
      editor: null,
      selectedFile: null,
      currentFileName: '',
      editorReady: false,
      loading: false,
      hasError: false,
      selectedTheme: 'dark',
      isValidJson: true,
      lineCount: 1,
      charCount: 0,
      lastSaved: null,

      // 搜索功能
      showSearchDialog: false,
      searchText: '',
      replaceText: '',

      // 历史记录
      showHistoryDialog: false,
      history: [],
      maxHistorySize: 20,

      snackbar: {
        show: false,
        message: '',
        color: 'success',
        icon: 'mdi-check-circle',
      },
    }
  },

  computed: {
    hasContent() {
      return this.editorReady && this.editor && this.editor.state.doc.toString().trim() !== ''
    },
  },

  watch: {
    selectedFile(newFile) {
      if (newFile) {
        this.loadFile(newFile)
      } else {
        this.currentFileName = ''
      }
    },

    selectedTheme(newTheme) {
      this.updateEditorTheme(newTheme)
    },
  },

  mounted() {
    this.$nextTick(() => {
      this.initEditor()
    })

    // 自动保存草稿
    setInterval(() => {
      this.autoSaveDraft()
    }, 30000)
  },

  beforeUnmount() {
    if (this.editor) {
      this.editor.destroy()
    }
  },

  methods: {
    initEditor() {
      if (!this.$refs.editorContainer) {
        console.error('编辑器容器未找到')
        return
      }

      this.loading = true

      try {
        // 简化的键盘映射
        const customKeymap = keymap.of([
          {
            key: 'Ctrl-s',
            mac: 'Cmd-s',
            run: () => {
              this.saveFile()
              return true
            },
          },
          {
            key: 'Ctrl-f',
            mac: 'Cmd-f',
            run: () => {
              this.showSearchDialog = true
              return true
            },
          },
        ])

        // 更新监听器
        const updateListener = EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            this.updateStats()
            this.validateJson()
            // 减少历史记录频率，避免性能问题
            this.throttledAddToHistory('内容修改')
          }
        })

        // 简化的主题配置
        const customTheme = EditorView.theme({
          '&': {
            height: '100%',
            fontSize: '14px',
          },
          '.cm-scroller': {
            fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
            lineHeight: '1.5',
          },
          '.cm-focused': {
            outline: '1px solid #1976d2',
          },
          '.cm-editor': {
            borderRadius: '4px',
          },
        })

        // 创建编辑器，使用更简单的扩展配置
        this.editor = new EditorView({
          doc: '{\n  "name": "JSON Editor Pro",\n  "version": "1.0.0",\n  "features": [\n    "文件加载",\n    "语法高亮",\n    "格式化",\n    "历史记录"\n  ]\n}',
          extensions: [basicSetup, json(), oneDark, customKeymap, updateListener, customTheme],
          parent: this.$refs.editorContainer,
        })

        this.editorReady = true
        this.loading = false
        this.updateStats()
        this.validateJson()
        this.showMessage('编辑器初始化成功', 'success', 'mdi-check-circle')
      } catch (error) {
        console.error('编辑器初始化失败:', error)
        this.loading = false
        this.showMessage('编辑器初始化失败: ' + error.message, 'error', 'mdi-alert-circle')
      }
    },

    async loadFile(file) {
      if (!file) {
        this.currentFileName = ''
        return
      }

      if (!this.editorReady || !this.editor) {
        this.showMessage('编辑器尚未就绪，请稍后再试', 'warning', 'mdi-clock-alert')
        return
      }

      this.loading = true

      try {
        const text = await this.readFileAsText(file)

        this.editor.dispatch({
          changes: {
            from: 0,
            to: this.editor.state.doc.length,
            insert: text,
          },
        })

        this.currentFileName = file.name || 'unknown.json'
        this.addToHistory(`加载文件: ${this.currentFileName}`)
        this.showMessage(`文件 "${this.currentFileName}" 加载成功`, 'success', 'mdi-file-check')
      } catch (error) {
        this.hasError = true
        setTimeout(() => {
          this.hasError = false
        }, 600)
        this.showMessage('文件加载失败: ' + error.message, 'error', 'mdi-file-alert')
      } finally {
        this.loading = false
      }
    },

    readFileAsText(file) {
      return new Promise((resolve, reject) => {
        console.log('readFileAsText received:', file, file?.constructor?.name)

        if (!file) {
          reject(new Error('文件为空'))
          return
        }

        // 检查文件对象是否有效
        if (!(file instanceof File) && !(file instanceof Blob)) {
          console.log('File object properties:', Object.keys(file))
          reject(
            new Error(
              `无效的文件对象类型: ${typeof file}, constructor: ${file?.constructor?.name}`,
            ),
          )
          return
        }

        const reader = new FileReader()

        reader.onload = (e) => {
          resolve(e.target.result)
        }

        reader.onerror = (e) => {
          console.error('FileReader error:', e)
          reject(new Error('文件读取失败'))
        }

        try {
          reader.readAsText(file, 'UTF-8')
        } catch (error) {
          console.error('readAsText failed:', error)
          reject(new Error('无法读取文件: ' + error.message))
        }
      })
    },

    saveFile() {
      if (!this.editorReady || !this.editor) {
        this.showMessage('编辑器尚未就绪', 'error', 'mdi-alert-circle')
        return
      }

      try {
        const content = this.editor.state.doc.toString()

        if (!content.trim()) {
          this.showMessage('内容为空，无法保存', 'warning', 'mdi-alert')
          return
        }

        // 验证JSON格式
        try {
          JSON.parse(content)
        } catch (jsonError) {
          this.showMessage(
            '保存失败: JSON格式错误 - ' + jsonError.message,
            'error',
            'mdi-alert-circle',
          )
          return
        }

        const blob = new Blob([content], { type: 'application/json;charset=utf-8' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = this.currentFileName || 'edited.json'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)

        this.lastSaved = new Date().toLocaleTimeString()
        this.addToHistory('文件保存')
        this.showMessage('文件保存成功', 'success', 'mdi-content-save')
      } catch (error) {
        this.showMessage('保存失败: ' + error.message, 'error', 'mdi-alert-circle')
      }
    },

    formatJson() {
      if (!this.editorReady || !this.editor) {
        this.showMessage('编辑器尚未就绪', 'error', 'mdi-alert-circle')
        return
      }

      try {
        const content = this.editor.state.doc.toString()

        if (!content.trim()) {
          this.showMessage('内容为空，无法格式化', 'warning', 'mdi-alert')
          return
        }

        const parsed = JSON.parse(content)
        const formatted = JSON.stringify(parsed, null, 2)

        this.editor.dispatch({
          changes: {
            from: 0,
            to: this.editor.state.doc.length,
            insert: formatted,
          },
        })

        this.addToHistory('JSON格式化')
        this.showMessage('JSON格式化成功', 'success', 'mdi-code-braces')
      } catch (error) {
        this.showMessage('格式化失败: ' + error.message, 'error', 'mdi-alert-circle')
      }
    },

    compressJson() {
      if (!this.editorReady || !this.editor) return

      try {
        const content = this.editor.state.doc.toString()
        const parsed = JSON.parse(content)
        const compressed = JSON.stringify(parsed)

        this.editor.dispatch({
          changes: {
            from: 0,
            to: this.editor.state.doc.length,
            insert: compressed,
          },
        })

        this.addToHistory('JSON压缩')
        this.showMessage('JSON压缩成功', 'success', 'mdi-compress')
      } catch (error) {
        this.showMessage('压缩失败: ' + error.message, 'error', 'mdi-alert-circle')
      }
    },

    updateEditorTheme(theme) {
      if (this.editor) {
        this.showMessage(`主题切换功能开发中`, 'info', 'mdi-palette')
        // 主题切换需要重新创建编辑器或使用动态主题扩展
        // 为了稳定性，暂时禁用动态主题切换
      }
    },

    updateStats() {
      if (this.editor) {
        const doc = this.editor.state.doc
        this.lineCount = doc.lines
        this.charCount = doc.length
      }
    },

    validateJson() {
      if (!this.editor) return

      try {
        const content = this.editor.state.doc.toString()
        if (content.trim()) {
          JSON.parse(content)
          this.isValidJson = true
        } else {
          this.isValidJson = true // 空内容也算有效
        }
      } catch {
        this.isValidJson = false
      }
    },

    // 节流的历史记录添加，避免频繁更新
    throttledAddToHistory: (() => {
      let timeout = null
      return function (description) {
        if (timeout) clearTimeout(timeout)
        timeout = setTimeout(() => {
          this.addToHistory(description)
        }, 1000) // 1秒内只记录一次
      }
    })(),

    addToHistory(description) {
      if (!this.editor) return

      const timestamp = new Date().toLocaleString()
      const content = this.editor.state.doc.toString()

      // 避免重复的历史记录
      if (this.history.length > 0 && this.history[0].content === content) {
        return
      }

      this.history.unshift({
        timestamp,
        description,
        content: content.substring(0, 1000), // 限制内容长度，避免内存问题
      })

      if (this.history.length > this.maxHistorySize) {
        this.history = this.history.slice(0, this.maxHistorySize)
      }
    },

    restoreFromHistory(index) {
      const item = this.history[index]
      if (item && this.editor) {
        this.editor.dispatch({
          changes: {
            from: 0,
            to: this.editor.state.doc.length,
            insert: item.content,
          },
        })
        this.showHistoryDialog = false
        this.showMessage('已恢复历史版本', 'success', 'mdi-restore')
      }
    },

    clearHistory() {
      if (this.history.length === 0) {
        this.showMessage('历史记录已为空', 'info', 'mdi-information')
        return
      }

      this.history = []
      this.showMessage('历史记录已清空', 'success', 'mdi-delete-sweep')
    },

    autoSaveDraft() {
      if (this.hasContent) {
        try {
          const content = this.editor.state.doc.toString()
          localStorage.setItem('jsonEditor_draft', content)
          localStorage.setItem('jsonEditor_draft_time', new Date().toISOString())
        } catch (error) {
          console.warn('自动保存草稿失败:', error)
        }
      }
    },

    findNext() {
      if (!this.searchText || !this.editor) {
        this.showMessage('请输入搜索内容', 'warning', 'mdi-alert')
        return
      }

      const content = this.editor.state.doc.toString()
      const searchLower = this.searchText.toLowerCase()
      const contentLower = content.toLowerCase()
      const index = contentLower.indexOf(searchLower)

      if (index !== -1) {
        // 高亮显示找到的内容（简单实现）
        this.showMessage(`在位置 ${index} 找到匹配项`, 'info', 'mdi-magnify')
      } else {
        this.showMessage('未找到匹配项', 'warning', 'mdi-magnify-remove')
      }
    },

    replaceNext() {
      if (!this.searchText || !this.replaceText || !this.editor) {
        this.showMessage('请输入搜索和替换内容', 'warning', 'mdi-alert')
        return
      }

      const content = this.editor.state.doc.toString()
      const newContent = content.replace(this.searchText, this.replaceText)

      if (content !== newContent) {
        this.editor.dispatch({
          changes: {
            from: 0,
            to: this.editor.state.doc.length,
            insert: newContent,
          },
        })
        this.addToHistory('替换文本')
        this.showMessage('替换完成', 'success', 'mdi-find-replace')
      } else {
        this.showMessage('未找到可替换的内容', 'warning', 'mdi-find-replace')
      }
    },

    replaceAll() {
      if (!this.searchText || !this.replaceText || !this.editor) {
        this.showMessage('请输入搜索和替换内容', 'warning', 'mdi-alert')
        return
      }

      const content = this.editor.state.doc.toString()
      const newContent = content.replaceAll(this.searchText, this.replaceText)
      const count = (
        content.match(new RegExp(this.searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []
      ).length

      if (content !== newContent) {
        this.editor.dispatch({
          changes: {
            from: 0,
            to: this.editor.state.doc.length,
            insert: newContent,
          },
        })
        this.addToHistory(`全部替换 (${count}处)`)
        this.showMessage(`全部替换完成，共替换 ${count} 处`, 'success', 'mdi-find-replace')
      } else {
        this.showMessage('未找到可替换的内容', 'warning', 'mdi-find-replace')
      }
    },

    clearEditor() {
      if (!this.editorReady || !this.editor) return

      this.editor.dispatch({
        changes: {
          from: 0,
          to: this.editor.state.doc.length,
          insert: '',
        },
      })
      this.selectedFile = null
      this.currentFileName = ''
      this.lastSaved = null
      this.addToHistory('清空编辑器')
      this.showMessage('编辑器已清空', 'info', 'mdi-delete')
    },

    showMessage(message, color = 'success', icon = 'mdi-check-circle') {
      this.snackbar = {
        show: true,
        message,
        color,
        icon,
      }
    },

    getContentPreview(content) {
      if (!content) return '空内容'
      const preview = content.replace(/\s+/g, ' ').trim()
      return preview.length > 50 ? preview.substring(0, 50) + '...' : preview
    },
  },
}
</script>

<style scoped>
/* Material Design 配色和布局 */
.main-card {
  border-radius: 12px !important;
  overflow: hidden;
}

.file-section,
.toolbar-section,
.editor-card {
  border-radius: 8px !important;
  border: 1px solid rgba(0, 0, 0, 0.12) !important;
  transition: all 0.2s ease-in-out;
}

.file-section:hover,
.toolbar-section:hover {
  border-color: rgba(25, 118, 210, 0.5) !important;
  box-shadow: 0 2px 8px rgba(25, 118, 210, 0.1) !important;
}

/* 编辑器容器 Material Design 风格 */
.editor-container {
  min-height: 450px;
  border-radius: 0 0 8px 8px;
  overflow: hidden;
  position: relative;
  background: #fafafa;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.code-editor {
  height: 450px;
  min-height: 450px;
}

.editor-container:focus-within {
  background: #ffffff;
  box-shadow: inset 0 0 0 2px rgba(25, 118, 210, 0.2);
}

/* 脉冲动画 - Material Design */
.pulse {
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.05);
  }
}

/* 错误震动动画 */
.error-shake {
  animation: materialShake 0.4s ease-in-out;
}

@keyframes materialShake {
  0%,
  100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-4px);
  }
  75% {
    transform: translateX(4px);
  }
}

/* 移除按钮组样式，使用普通按钮样式 */
.v-btn {
  border-radius: 8px !important;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

.v-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15) !important;
}

/* 历史记录列表 Material Design */
.history-list {
  max-height: 400px;
  overflow-y: auto;
}

.history-item {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

.history-item:hover {
  background-color: rgba(103, 58, 183, 0.04) !important;
  transform: translateX(2px);
}

.history-item:last-child {
  border-bottom: none;
}

/* Material Design 卡片 */
.v-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

.v-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
}

/* Material Design 输入框 */
.v-text-field.v-text-field--outlined {
  border-radius: 8px;
}

.v-text-field.v-text-field--outlined .v-input__control .v-input__slot {
  border-radius: 8px !important;
}

/* 对话框样式改进 */
.v-dialog .v-card {
  border-radius: 12px !important;
}

.v-dialog .v-card-title {
  border-radius: 12px 12px 0 0 !important;
  padding: 16px 24px !important;
}

.v-dialog .v-card-text {
  padding: 16px 24px !important;
}

.v-dialog .v-card-actions {
  padding: 16px 24px !important;
}

/* 搜索对话框输入框样式 */
.v-text-field--outlined .v-input__slot {
  border-radius: 8px !important;
}

/* 空状态样式 */
.v-container .grey--text {
  color: rgba(0, 0, 0, 0.6) !important;
}

/* 按钮组响应式 */
@media (max-width: 599px) {
  .v-card-actions .v-btn {
    min-width: auto !important;
    padding: 0 12px !important;
  }

  .v-card-actions .flex-wrap {
    justify-content: center;
  }
}

/* 列表项间距优化 */
.v-list-item {
  min-height: 72px !important;
}

.v-list-item__avatar {
  margin-top: 8px !important;
  margin-bottom: 8px !important;
}

/* 滚动区域样式 */
.v-card-text {
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 0, 0, 0.2) transparent;
}

.v-card-text::-webkit-scrollbar {
  width: 6px;
}

.v-card-text::-webkit-scrollbar-track {
  background: transparent;
}

.v-card-text::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}
</style>
