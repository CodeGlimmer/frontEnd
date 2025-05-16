//此store仅用于table展示，其它与order相关的业务逻辑在OperationBar的子页面当中

import { ref } from 'vue'
import { defineStore } from 'pinia'
import { OrderManagement } from '@/services'

export const useOrder = defineStore('order', () => {
  const order_list = ref([])
  const show_list = ref([])
  const update_data = async () => {
    order_list.value = await OrderManagement.get_all_orders()
    show_list.value = [...order_list.value]
  }
  const default_sort = async () => {
    show_list.value = await OrderManagement.default_order()
  }

  const handle_command = async (command_list, showSnackbar) => {
    let f
    // 空命令reset
    if (command_list.length === 1 && command_list[0].length === 1 && command_list[0][0] === '') {
      showSnackbar('重置成功', 'success', 'mdi-check-circle')
      return
    } else if (
      command_list.length === 1 &&
      command_list[0].length === 1 &&
      command_list[0][0] === 'sort'
    ) {
      await default_sort()
      showSnackbar('success', 'success', 'mdi-check-circle')
      return
    } else {
      command_list.forEach((command) => {
        switch (command[0]) {
          case 'sort':
            switch (command.length) {
              case 1:
                showSnackbar('sort不带参数使用时,只能是第一个命令', 'error', 'mdi-alert-circle')
                break
              case 2:
                f = eval(command[1])
                if (typeof f == 'function') {
                  show_list.value = show_list.value.sort(f)
                  showSnackbar('success', 'success', 'mdi-check-circle')
                  break
                } else {
                  showSnackbar('函数不合法', 'error', 'mdi-alert-circle')
                }
                break
              default:
                showSnackbar('非法参数', 'error', 'mdi-alert-circle')
                break
            }
            break
          case 'find':
            switch (command.length) {
              case 2:
                f = eval(command[1])
                if (typeof f == 'function') {
                  show_list.value = show_list.value.filter(eval(command[1]))
                } else {
                  showSnackbar('函数不合法', 'error', 'mdi-alert-circle')
                }
                break
              default:
                showSnackbar('find命令必须带一个js函数作为参数', 'error', 'mdi-alert-cicle')
                break
            }
            break
          default:
            showSnackbar('非法命令', 'error', 'mdi-alert-circle')
            break
        }
      })
    }
  }

  /**
   * 处理搜索的函数，将所有的property的value视为字符串，进行包含检查，如果通过被添加到temp_list当中，最后被赋值给show_list.value
   * @param {String} search 搜索框中的内容
   */
  const handleSearch = (search) => {
    let temp_list = []
    show_list.value.forEach((order) => {
      if (
        String(order.order_id).includes(search) ||
        order.product_type.includes(search) ||
        String(order.order_quantity).includes(search) ||
        order.order_date.includes(search) ||
        String(order.priority).includes(search)
      ) {
        temp_list.push(order)
      }
    })
    show_list.value = temp_list
  }
  update_data()
  return { show_list, update_data, default_sort, handle_command, handleSearch }
})
