import axios from 'axios'
import { availableHost } from '@/utils'

/**
 * @typedef {Object} registerUserMessage
 * @property {string} username - unique
 * @property {string} password
 */

/**
 * loginMessage中username与password是必填项，多余的参数不起作用
 * @typedef {Object} loginUserMessage
 * @property {string} username
 * @property {string} password
 */

/**
 * 修改个人信息的必须要一个account，其它参数可选，并且会作为修改之后的值
 * @typedef {Object} changeUserMessage
 * @property {string} account
 */

export const userService = {
  urls: {
    register: availableHost + 'register/',
    login: availableHost + 'login/',
  },

  /**
   * 注册方法
   * @param {registerUserMessage} userMessage
   * @returns {Promise<string>} response - 如果创建成功string部分为'Added Successfully'
   */
  async register(userMessage) {
    // 由于注册时并不存在account与email，这里使用username的唯一性创建临时的account与email
    // 此外email有格式检查，这里用123456@123.com代替
    userMessage = {
      ...userMessage,
      account: userMessage.username,
      email: '123456@123.com',
    }
    const { data: response } = await axios.post(this.urls.register, userMessage)
    return response
  },

  /**
   * 登录方法
   * @param {loginUserMessage} userMessage
   * @returns {Promise<bool>} - 反映登录是否成功
   */
  async login(userMessage) {
    const { data: response } = await axios.post(this.urls.login, userMessage)
    return response.success
  },

  /**
   * 修改个人用户信息的方法
   * @param {changeUserMessage} userMessage
   * @returns {Promise<string>} - 修改成功返回User Updated Successfully，失败返回AxiosError
   */
  async changePersonalMessage(userMessage) {
    try {
      const { data: response } = axios.put(this.urls.register, userMessage)
      return response
    } catch (err) {
      return err.name
    }
  },
}
