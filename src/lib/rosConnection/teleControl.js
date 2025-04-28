import ROSLIB from 'roslib'

export class KeyboardTeleop {
  constructor(options) {
    this.ros = options.ros
    this.topic = options.topic
    this.scale = 1.0

    // 创建ROS Topic
    this.cmdVel = new ROSLIB.Topic({
      ros: this.ros,
      name: this.topic,
      messageType: 'geometry_msgs/Twist',
    })

    // 键盘状态
    this.keys = {}
    this.linearVel = 0
    this.angularVel = 0

    // 按键映射
    this.keyMapping = {
      w: { linear: 0.5, angular: 0 },
      s: { linear: -0.5, angular: 0 },
      a: { linear: 0, angular: 0.5 },
      d: { linear: 0, angular: -0.5 },
    }

    // 绑定键盘事件
    document.addEventListener('keydown', this.onKeyDown.bind(this))
    document.addEventListener('keyup', this.onKeyUp.bind(this))

    // 启动更新循环
    this.timer = setInterval(this.updateVelocity.bind(this), 100)
  }

  onKeyDown(event) {
    const key = event.key.toLowerCase()
    if (this.keyMapping[key]) {
      this.keys[key] = true
    }
  }

  onKeyUp(event) {
    const key = event.key.toLowerCase()
    if (this.keyMapping[key]) {
      this.keys[key] = false
    }
  }

  updateVelocity() {
    let linear = 0
    let angular = 0

    // 计算速度
    for (const key in this.keys) {
      if (this.keys[key] && this.keyMapping[key]) {
        linear += this.keyMapping[key].linear
        angular += this.keyMapping[key].angular
      }
    }

    // 应用缩放
    linear *= this.scale
    angular *= this.scale

    // 创建并发布消息
    const twist = new ROSLIB.Message({
      linear: { x: linear, y: 0, z: 0 },
      angular: { x: 0, y: 0, z: angular },
    })

    this.cmdVel.publish(twist)
  }

  dispose() {
    clearInterval(this.timer)
    document.removeEventListener('keydown', this.onKeyDown)
    document.removeEventListener('keyup', this.onKeyUp)
  }
}
