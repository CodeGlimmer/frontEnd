import { VelControl } from './vel-control'
import { toValue } from 'vue'

export class KeyboardControl extends VelControl {
  /**
   * keys是一个Array<String>, 给出了前进，后退，左转，右转的键位
   */
  constructor({ ros, topic, linear, angular, keys }) {
    super({ ros, topic, linear, angular })
    // 记录初始值的大小
    this.l = toValue(linear)
    this.a = toValue(angular)
    this.linear.value = 0
    this.angular.value = 0
    this.keys = keys.map((key) => key.toLowerCase()) // 大小写统一
    document.addEventListener('keydown', this.onKeyDown.bind(this))
    document.addEventListener('keyup', this.onKeyUp.bind(this))
  }

  onKeyDown(event) {
    const eventKey = event.key.toLowerCase()
    this.keys.forEach((key, idx) => {
      if (eventKey === key) {
        switch (idx) {
          case 0:
            this.linear.value = this.l
            break
          case 1:
            this.linear.value = -this.l
            break
          case 2:
            this.linear.value = this.l
            this.angular.value = this.a
            break
          case 3:
            this.linear.value = this.l
            this.angular.value = -this.a
        }
      }
    })
  }

  onKeyUp() {
    this.linear.value = this.angular.value = 0
  }

  dispose() {
    super.dispose()
    document.removeEventListener('keydown', this.onKeyDown)
    document.removeEventListener('keyup', this.onKeyUp)
  }
}
