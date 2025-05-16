import ROSLIB from 'roslib'

export class VelControl {
  /**@type {ROSLIB.Ros} 已经实例化的ros对象*/
  #ros

  /**@type {String} */
  #topic

  /**
   * 为了便于对ros进行控制，此处的linear与angular都是响应式对象，构造时应该传进来一个ref
   * 其中：
   * - linear是响应式的ref，正数前进，负数后退
   * - angular是响应式的ref，整数左转，负数右转
   */
  constructor({ ros, topic, linear, angular }) {
    this.#ros = ros
    this.#topic = topic
    this.linear = linear
    this.angular = angular
    /** ROS topic*/
    this.cmdVel = new ROSLIB.Topic({
      ros: this.#ros,
      name: this.#topic,
      messageType: 'geometry_msgs/Twist',
    })
    this.timer = setInterval(this.move.bind(this), 100)
  }

  move() {
    const velMessage = new ROSLIB.Message({
      linear: { x: this.linear.value, y: 0, z: 0 },
      angular: { x: 0, y: 0, z: this.angular.value },
    })
    this.cmdVel.publish(velMessage)
  }

  dispose() {
    clearInterval(this.timer)
  }
}
