import axios from 'axios'
import { availableHost as socket } from '@/utils/useSocket'
/**
 * 用于表示订单的Order对象
 * @typedef {Object} Order
 * @property {(String|Number)} order_id 订单号，数字之类的东西
 * @property {String} product_type 订单类别
 * @property {(String|Number)} order_quantity
 * @property {String} order_date
 * @property {(String|Number)} priority
 */

/**
 * 表示不完整订单的Order对象,修改订单时使用
 * @typedef {Object} PartOrder
 * @property {String} [product_type] 订单类别
 * @property {(String|Number)} [order_quantity]
 * @property {String} [order_date]
 * @property {(String|Number)} [priority]
 */

/**
 * 订单获取对象，并不存储任何订单，提供了获取任意想要信息的方法
 */
export const OrderManagement = {
  urls: {
    main: socket,
    all_orders: `${socket}/department`,
    order: `${socket}/orders/`, // 这个是请求顺序的url
  },

  /**
   * 获取全部订单
   * @async
   * @returns {Promise<Order[]>}
   */
  async get_all_orders() {
    let response = await axios.get(this.urls.all_orders)
    return response.data
  },

  /**
   * @async
   * @param {Number} id 想要删除的订单号，对应订单的order_list字段
   */
  async delete_id(id) {
    try {
      await axios.delete(this.urls.all_orders + '/' + id)
    } catch (error) {
      alert(error)
    }
  },

  /**
   * 向数据库中增加一个order
   * @async
   * @param {Order} order
   */
  async add_order(order) {
    try {
      await axios.post(this.urls.all_orders, order)
    } catch (error) {
      alert(error)
    }
  },

  /**
   * @async
   * @param {Number} id 想要修改的定单对应的order_id
   * @param {PartOrder} order
   */
  async change_order(id, order) {
    try {
      await axios.put(`${this.urls.all_orders}/${id}`, order)
    } catch (error) {
      console.log(error)
    }
  },

  /**
   * 按照默认顺序获取全部订单
   * @returns {Promise<Order[]>}
   */
  async default_order() {
    try {
      let response = await axios.get(this.urls.order)
      return response.data
    } catch (error) {
      alert(error)
    }
  },
}
