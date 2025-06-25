import ROSLIB from 'roslib'

export class Controler {
  constructor({ linear, angular, rosUrl }) {
    this.linear = linear
    this.angular = angular
    this.keyState = [false, false, false, false]
    this.ros = new ROSLIB.Ros({
      url: rosUrl,
    })
    this.cmdVel = new ROSLIB.Topic({
      ros: this.ros,
      name: '/cmd_vel',
      messageType: 'geometry_msgs/Twist',
    })
    // 注册Interval
    this.timer = setInterval(this.sendMessage.bind(this), 100)
  }

  sendMessage() {
    const linear = (-this.keyState[1] + this.keyState[3]) * this.linear
    const angular = (this.keyState[0] - this.keyState[2]) * this.angular
    const twist = new ROSLIB.Message({
      linear: { x: linear, y: 0, z: 0 },
      angular: { x: 0, y: 0, z: angular },
    })
    this.cmdVel.publish(twist)
    console.log('已发送数据')
  }

  // 从vue事件中更新状态array
  updateKeyState(newKeyState) {
    console.log(newKeyState)
    this.keyState = newKeyState
  }

  dispose() {
    clearInterval(this.timer)
  }
}
