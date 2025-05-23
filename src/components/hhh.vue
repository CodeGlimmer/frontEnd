<template>
  <v-app>
    <!-- 顶部工具栏 -->
    <v-app-bar color="surface" elevation="1">
      <v-app-bar-title>
        <v-icon icon="mdi-robot" class="me-2"></v-icon>
        URDF Model Viewer
      </v-app-bar-title>

      <v-spacer></v-spacer>

      <!-- 文件选择 -->
      <v-file-input
        v-model="selectedFile"
        accept=".urdf"
        label="Load URDF File"
        prepend-icon="mdi-file-upload"
        variant="outlined"
        density="compact"
        hide-details
        style="max-width: 250px"
        @change="onFileSelect"
      ></v-file-input>

      <v-btn icon="mdi-refresh" variant="text" @click="resetView" :disabled="!robot"></v-btn>

      <v-btn icon="mdi-fullscreen" variant="text" @click="toggleFullscreen"></v-btn>
    </v-app-bar>

    <!-- 主要内容区域 -->
    <v-main>
      <v-container fluid class="pa-0 fill-height">
        <v-row no-gutters class="fill-height">
          <!-- 3D视图区域 -->
          <v-col cols="12" md="9" class="position-relative">
            <div ref="container" class="urdf-container fill-height"></div>

            <!-- 加载指示器 -->
            <v-overlay v-model="loading" class="d-flex align-center justify-center">
              <v-progress-circular indeterminate size="64" color="primary"></v-progress-circular>
              <div class="ml-4">
                <div class="text-h6">Loading Model...</div>
                <div class="text-body-2 text-medium-emphasis">{{ loadingMessage }}</div>
              </div>
            </v-overlay>

            <!-- 视图控制浮动按钮 -->
            <v-card
              class="position-absolute view-controls"
              style="top: 16px; right: 16px; z-index: 10"
              elevation="2"
            >
              <v-card-text class="pa-2">
                <v-btn-group variant="text" density="compact">
                  <v-btn @click="setView('front')" size="small">Front</v-btn>
                  <v-btn @click="setView('back')" size="small">Back</v-btn>
                  <v-btn @click="setView('left')" size="small">Left</v-btn>
                  <v-btn @click="setView('right')" size="small">Right</v-btn>
                  <v-btn @click="setView('top')" size="small">Top</v-btn>
                  <v-btn @click="setView('bottom')" size="small">Bottom</v-btn>
                </v-btn-group>
              </v-card-text>
            </v-card>

            <!-- 错误信息 -->
            <v-alert
              v-if="errorMessage"
              type="error"
              variant="tonal"
              class="position-absolute error-alert"
              style="bottom: 16px; left: 16px; right: 16px; z-index: 10"
              closable
              @click:close="errorMessage = ''"
            >
              {{ errorMessage }}
            </v-alert>
          </v-col>

          <!-- 控制面板 -->
          <v-col cols="12" md="3">
            <v-navigation-drawer permanent location="right" width="100%" class="border-s">
              <!-- 模型信息 -->
              <v-list>
                <v-list-subheader>Model Information</v-list-subheader>
                <v-list-item>
                  <v-list-item-title>Model Name</v-list-item-title>
                  <v-list-item-subtitle>{{ modelInfo.name || 'Unknown' }}</v-list-item-subtitle>
                </v-list-item>
                <v-list-item>
                  <v-list-item-title>Links Count</v-list-item-title>
                  <v-list-item-subtitle>{{ modelInfo.linksCount }}</v-list-item-subtitle>
                </v-list-item>
                <v-list-item>
                  <v-list-item-title>Joints Count</v-list-item-title>
                  <v-list-item-subtitle>{{ modelInfo.jointsCount }}</v-list-item-subtitle>
                </v-list-item>
              </v-list>

              <v-divider></v-divider>

              <!-- 渲染设置 -->
              <v-expansion-panels variant="accordion">
                <v-expansion-panel title="Rendering Settings">
                  <v-expansion-panel-text>
                    <v-switch
                      v-model="renderSettings.showGrid"
                      label="Show Grid"
                      color="primary"
                      hide-details
                      @change="toggleGrid"
                    ></v-switch>

                    <v-switch
                      v-model="renderSettings.showAxes"
                      label="Show Axes"
                      color="primary"
                      hide-details
                      @change="toggleAxes"
                    ></v-switch>

                    <v-switch
                      v-model="renderSettings.wireframe"
                      label="Wireframe Mode"
                      color="primary"
                      hide-details
                      @change="toggleWireframe"
                    ></v-switch>

                    <div class="mt-4">
                      <v-label>Background Color</v-label>
                      <v-color-picker
                        v-model="renderSettings.backgroundColor"
                        mode="hex"
                        hide-canvas
                        hide-inputs
                        @update:model-value="updateBackgroundColor"
                      ></v-color-picker>
                    </div>
                  </v-expansion-panel-text>
                </v-expansion-panel>

                <!-- 关节控制 -->
                <v-expansion-panel title="Joint Controls" v-if="joints.length > 0">
                  <v-expansion-panel-text>
                    <div v-for="joint in joints" :key="joint.name" class="mb-4">
                      <v-label class="mb-2">{{ joint.name }}</v-label>
                      <v-slider
                        v-model="joint.value"
                        :min="joint.min"
                        :max="joint.max"
                        :step="0.01"
                        thumb-label
                        hide-details
                        @update:model-value="updateJoint(joint)"
                      ></v-slider>
                      <div class="d-flex justify-space-between text-caption text-medium-emphasis">
                        <span>{{ joint.min.toFixed(2) }}</span>
                        <span>{{ joint.value.toFixed(2) }}</span>
                        <span>{{ joint.max.toFixed(2) }}</span>
                      </div>
                    </div>

                    <v-btn block variant="outlined" @click="resetJoints" class="mt-2">
                      Reset All Joints
                    </v-btn>
                  </v-expansion-panel-text>
                </v-expansion-panel>

                <!-- 动画控制 -->
                <v-expansion-panel title="Animation" v-if="joints.length > 0">
                  <v-expansion-panel-text>
                    <v-btn
                      :color="isAnimating ? 'error' : 'primary'"
                      block
                      @click="toggleAnimation"
                    >
                      {{ isAnimating ? 'Stop Animation' : 'Start Animation' }}
                    </v-btn>

                    <div class="mt-4">
                      <v-label>Animation Speed</v-label>
                      <v-slider
                        v-model="animationSpeed"
                        min="0.1"
                        max="3"
                        step="0.1"
                        hide-details
                      ></v-slider>
                    </div>
                  </v-expansion-panel-text>
                </v-expansion-panel>
              </v-expansion-panels>
            </v-navigation-drawer>
          </v-col>
        </v-row>
      </v-container>
    </v-main>

    <!-- 底部状态栏 -->
    <v-footer app>
      <v-row no-gutters align="center">
        <v-col>
          <span class="text-caption">
            Camera: {{ cameraInfo.position }} | Target: {{ cameraInfo.target }}
          </span>
        </v-col>
        <v-col cols="auto">
          <v-chip size="small" :color="robot ? 'success' : 'error'" variant="tonal">
            {{ robot ? 'Model Loaded' : 'No Model' }}
          </v-chip>
        </v-col>
      </v-row>
    </v-footer>
  </v-app>
</template>

<script>
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js'
import { URDFLoader } from 'urdf-loader'

export default {
  name: 'URDFViewer',
  data() {
    return {
      // Three.js objects
      scene: null,
      camera: null,
      renderer: null,
      controls: null,
      robot: null,
      loader: null,
      animationFrameId: null,

      // UI state
      loading: false,
      loadingMessage: '',
      errorMessage: '',
      selectedFile: null,

      // Model information
      modelInfo: {
        name: '',
        linksCount: 0,
        jointsCount: 0,
      },

      // Render settings
      renderSettings: {
        showGrid: true,
        showAxes: true,
        wireframe: false,
        backgroundColor: '#f5f5f5',
      },

      // Joint controls
      joints: [],

      // Animation
      isAnimating: false,
      animationSpeed: 1.0,
      animationTime: 0,

      // Camera info
      cameraInfo: {
        position: '0, 0, 0',
        target: '0, 0, 0',
      },

      // Helper objects
      gridHelper: null,
      axesHelper: null,
    }
  },
  mounted() {
    this.initScene()
    this.loadDefaultModel()
    window.addEventListener('resize', this.onResize)
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.onResize)
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId)
    }
    // 清理Three.js资源
    if (this.renderer) {
      this.renderer.dispose()
    }
  },
  methods: {
    initScene() {
      // 创建场景
      this.scene = new THREE.Scene()
      this.scene.background = new THREE.Color(0xf0f0f0)

      // 创建相机
      this.camera = new THREE.PerspectiveCamera(75, this.width / this.height, 0.1, 1000)
      this.camera.position.set(2, 2, 2)
      this.camera.lookAt(0, 0, 0)

      // 创建渲染器
      this.renderer = new THREE.WebGLRenderer({ antialias: true })
      this.renderer.setSize(this.width, this.height)
      this.renderer.setPixelRatio(window.devicePixelRatio)
      this.renderer.shadowMap.enabled = true
      this.$refs.container.appendChild(this.renderer.domElement)

      // 创建控制器
      this.controls = new OrbitControls(this.camera, this.renderer.domElement)
      this.controls.enableDamping = true
      this.controls.dampingFactor = 0.25
      this.controls.screenSpacePanning = false
      this.controls.maxPolarAngle = Math.PI / 2

      // 添加灯光
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
      this.scene.add(ambientLight)

      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
      directionalLight.position.set(10, 10, 10)
      directionalLight.castShadow = true
      this.scene.add(directionalLight)

      // 添加网格地面
      const gridHelper = new THREE.GridHelper(10, 10)
      this.scene.add(gridHelper)

      // 添加坐标轴辅助线
      const axesHelper = new THREE.AxesHelper(5)
      this.scene.add(axesHelper)

      // 开始动画循环
      this.animate()
    },

    addHelpers() {
      // 网格辅助线
      this.gridHelper = new THREE.GridHelper(10, 10)
      this.scene.add(this.gridHelper)

      // 坐标轴辅助线
      this.axesHelper = new THREE.AxesHelper(1)
      this.scene.add(this.axesHelper)
    },

    async loadDefaultModel() {
      this.loading = true
      this.loadingMessage = 'Loading default model...'

      try {
        await this.loadURDF('/models/robot.urdf')
      } catch (error) {
        this.errorMessage = 'Failed to load default model'
        console.error(error)
      } finally {
        this.loading = false
      }
    },

    async onFileSelect(event) {
      if (!event.target.files || event.target.files.length === 0) return

      const file = event.target.files[0]
      this.loading = true
      this.loadingMessage = `Loading ${file.name}...`

      try {
        const url = URL.createObjectURL(file)
        await this.loadURDF(url)
        URL.revokeObjectURL(url)
      } catch (error) {
        this.errorMessage = `Failed to load ${file.name}`
        console.error(error)
      } finally {
        this.loading = false
      }
    },

    loadURDF(path) {
      return new Promise((resolve, reject) => {
        this.loader = new URDFLoader()
        this.loader.loadMeshCb = this.loadMesh

        this.loader.load(
          path,
          (robot) => {
            // 清除之前的机器人模型
            if (this.robot) {
              this.scene.remove(this.robot)
            }

            this.robot = robot
            this.scene.add(robot)

            // 更新模型信息
            this.updateModelInfo(robot)

            // 设置关节
            this.setupJoints(robot)

            // 调整相机以便能完全看到机器人
            this.fitCameraToObject(robot)

            resolve(robot)
          },
          undefined,
          reject,
        )
      })
    },

    loadMesh(path, manager, onComplete) {
      // 处理相对路径
      if (path.indexOf('package://') === 0) {
        path = path.replace('package://', '/models/')
      }

      const loader = new STLLoader(manager)
      loader.load(
        path,
        (geometry) => {
          const material = new THREE.MeshPhongMaterial({
            color: 0x888888,
            specular: 0x111111,
            shininess: 200,
          })
          const mesh = new THREE.Mesh(geometry, material)
          mesh.castShadow = true
          mesh.receiveShadow = true

          onComplete(mesh)
        },
        undefined,
        (error) => {
          console.error('加载STL文件出错:', error)
          onComplete(null)
        },
      )
    },

    updateModelInfo(robot) {
      this.modelInfo = {
        name: robot.name || 'Unknown Robot',
        linksCount: Object.keys(robot.links).length,
        jointsCount: Object.keys(robot.joints).length,
      }
    },

    setupJoints(robot) {
      this.joints = []
      Object.values(robot.joints).forEach((joint) => {
        if (joint.isActuated) {
          this.joints.push({
            name: joint.name,
            joint: joint,
            value: 0,
            min: joint.limit ? joint.limit.lower : -Math.PI,
            max: joint.limit ? joint.limit.upper : Math.PI,
          })
        }
      })
    },

    updateJoint(jointData) {
      jointData.joint.setJointValue(jointData.value)
    },

    resetJoints() {
      this.joints.forEach((joint) => {
        joint.value = 0
        joint.joint.setJointValue(0)
      })
    },

    toggleAnimation() {
      this.isAnimating = !this.isAnimating
    },

    animate() {
      this.animationFrameId = requestAnimationFrame(this.animate)

      // 关节动画
      if (this.isAnimating && this.joints.length > 0) {
        this.animationTime += 0.016 * this.animationSpeed
        this.joints.forEach((joint, index) => {
          const angle = Math.sin(this.animationTime + index) * 0.5
          joint.value = angle
          joint.joint.setJointValue(angle)
        })
      }

      // 更新控制器
      if (this.controls) {
        this.controls.update()
      }

      // 渲染场景
      if (this.renderer && this.scene && this.camera) {
        this.renderer.render(this.scene, this.camera)
      }

      // 更新相机信息
      this.updateCameraInfo()
    },

    updateCameraInfo() {
      if (this.camera && this.controls) {
        this.cameraInfo.position = `${this.camera.position.x.toFixed(1)}, ${this.camera.position.y.toFixed(1)}, ${this.camera.position.z.toFixed(1)}`
        this.cameraInfo.target = `${this.controls.target.x.toFixed(1)}, ${this.controls.target.y.toFixed(1)}, ${this.controls.target.z.toFixed(1)}`
      }
    },

    setView(direction) {
      if (!this.robot || !this.camera || !this.controls) return

      const boundingBox = new THREE.Box3().setFromObject(this.robot)
      const center = boundingBox.getCenter(new THREE.Vector3())
      const size = boundingBox.getSize(new THREE.Vector3())
      const maxDim = Math.max(size.x, size.y, size.z)
      const distance = maxDim * 2

      const positions = {
        front: [center.x, center.y, center.z + distance],
        back: [center.x, center.y, center.z - distance],
        left: [center.x - distance, center.y, center.z],
        right: [center.x + distance, center.y, center.z],
        top: [center.x, center.y + distance, center.z],
        bottom: [center.x, center.y - distance, center.z],
      }

      const [x, y, z] = positions[direction]
      this.camera.position.set(x, y, z)
      this.camera.lookAt(center)
      this.controls.target.copy(center)
      this.controls.update()
    },

    resetView() {
      if (this.robot) {
        this.fitCameraToObject(this.robot)
      }
    },

    toggleGrid() {
      this.gridHelper.visible = this.renderSettings.showGrid
    },

    toggleAxes() {
      this.axesHelper.visible = this.renderSettings.showAxes
    },

    toggleWireframe() {
      if (this.robot) {
        this.robot.traverse((child) => {
          if (child.isMesh && child.material) {
            child.material.wireframe = this.renderSettings.wireframe
          }
        })
      }
    },

    updateBackgroundColor() {
      if (this.scene) {
        this.scene.background = new THREE.Color(this.renderSettings.backgroundColor)
      }
    },

    toggleFullscreen() {
      if (!document.fullscreenElement) {
        this.$refs.container.requestFullscreen()
      } else {
        document.exitFullscreen()
      }
    },

    fitCameraToObject(object) {
      // 计算包围盒
      const boundingBox = new THREE.Box3().setFromObject(object)
      const center = boundingBox.getCenter(new THREE.Vector3())
      const size = boundingBox.getSize(new THREE.Vector3())

      // 计算新的相机位置
      const maxDim = Math.max(size.x, size.y, size.z)
      const fov = this.camera.fov * (Math.PI / 180)
      let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2))
      cameraZ = Math.max(cameraZ, 1) // 确保相机不会太近

      // 设置相机位置
      this.camera.position.set(center.x + cameraZ, center.y + cameraZ, center.z + cameraZ)
      this.camera.lookAt(center)

      // 更新控制器的目标位置
      this.controls.target.set(center.x, center.y, center.z)
      this.controls.update()
    },

    onResize() {
      if (this.camera && this.renderer) {
        // 更新相机和渲染器
        this.camera.aspect = this.width / this.height
        this.camera.updateProjectionMatrix()
        this.renderer.setSize(this.width, this.height)
      }
    },
  },
}
</script>

<style scoped>
.urdf-container {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.view-controls {
  opacity: 0.9;
}

.view-controls:hover {
  opacity: 1;
}

.error-alert {
  max-width: 500px;
}
</style>
