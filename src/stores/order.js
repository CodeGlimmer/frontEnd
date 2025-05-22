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

  const HELP_DOC = `\n命令行系统使用说明：\n\n【基本命令】\n- help                显示本帮助文档\n- reset               重置为全部数据\n- sort <函数>         按函数排序，如 sort (a,b)=>a.order_id-b.order_id\n- desc <字段>         按字段降序排序，如 desc order_id\n- asc <字段>          按字段升序排序，如 asc order_date\n- find <函数>         过滤数据，如 find a=>a.priority>5\n- fields <字段,字段>  只显示指定字段，如 fields order_id,order_date\n- unique <字段>       按字段去重，如 unique product_type\n- groupby <字段>      按字段分组统计，如 groupby product_type\n- count               显示当前结果数量\n- sum <字段>          统计字段总和，如 sum order_quantity\n- avg <字段>          统计字段平均值，如 avg order_quantity\n- max <字段>          统计字段最大值，如 max order_quantity\n- min <字段>          统计字段最小值，如 min order_quantity\n- limit <N>           只显示前N条，如 limit 10\n- export              导出当前结果为CSV\n\n【链式命令】\n命令可用 | 连接，如：find a=>a.priority>5 | sort (a,b)=>b.order_quantity-a.order_quantity | limit 5\n\n【示例】\nfind a=>a.order_id<100 | sort (a,b)=>a.order_id-b.order_id\ngroupby product_type\nfields order_id,order_date\nunique product_type\ncount\n\n【注意】\n- find/sort 支持 JS 箭头函数表达式。\n- groupby 结果为分组统计对象。\n- export 命令会自动下载当前结果。\n- reset 恢复全部数据。\n- help 查看本说明。\n`

  const handle_command = async (command_list, showSnackbar, showHelpDoc) => {
    let temp = [...order_list.value]
    let lastResult = temp
    let exported = false
    // 支持 help 命令
    if (command_list.length === 1 && command_list[0][0] === 'help') {
      if (showHelpDoc) showHelpDoc(HELP_DOC)
      else showSnackbar('请升级前端以支持 help 弹窗', 'info', 'mdi-help-circle')
      return
    }
    // 支持 reset 命令
    if (
      command_list.length === 1 &&
      (command_list[0][0] === 'reset' ||
        (command_list[0][0] === '' && command_list[0].length === 1))
    ) {
      show_list.value = [...order_list.value]
      showSnackbar('重置成功', 'success', 'mdi-check-circle')
      return
    }
    for (let command of command_list) {
      const [cmd, ...args] = command.map((x) => x.trim())
      switch (cmd) {
        case 'sort':
          if (args.length === 1) {
            try {
              const fn = eval(args[0])
              if (typeof fn === 'function') lastResult = lastResult.sort(fn)
              else throw new Error('无效排序函数')
            } catch {
              showSnackbar('排序函数无效', 'error', 'mdi-alert-circle')
            }
          } else showSnackbar('sort 需1个函数参数', 'error', 'mdi-alert-circle')
          break
        case 'desc':
          if (args.length === 1) {
            const key = args[0]
            lastResult = lastResult.sort((a, b) => (b[key] > a[key] ? 1 : b[key] < a[key] ? -1 : 0))
          } else showSnackbar('desc 需1个字段', 'error', 'mdi-alert-circle')
          break
        case 'asc':
          if (args.length === 1) {
            const key = args[0]
            lastResult = lastResult.sort((a, b) => (a[key] > b[key] ? 1 : a[key] < b[key] ? -1 : 0))
          } else showSnackbar('asc 需1个字段', 'error', 'mdi-alert-circle')
          break
        case 'find':
          if (args.length === 1) {
            try {
              const fn = eval(args[0])
              if (typeof fn === 'function') lastResult = lastResult.filter(fn)
              else throw new Error('无效过滤函数')
            } catch {
              showSnackbar('find参数无效', 'error', 'mdi-alert-circle')
            }
          } else showSnackbar('find 需1个函数参数', 'error', 'mdi-alert-circle')
          break
        case 'fields':
          if (args.length === 1) {
            const fields = args[0].split(',').map((f) => f.trim())
            lastResult = lastResult.map((row) => {
              const obj = {}
              fields.forEach((f) => (obj[f] = row[f]))
              return obj
            })
          } else showSnackbar('fields 需字段列表', 'error', 'mdi-alert-circle')
          break
        case 'unique':
          if (args.length === 1) {
            const key = args[0]
            const seen = new Set()
            lastResult = lastResult.filter((item) => {
              if (seen.has(item[key])) return false
              seen.add(item[key])
              return true
            })
          } else showSnackbar('unique 需1个字段', 'error', 'mdi-alert-circle')
          break
        case 'groupby':
          if (args.length === 1) {
            const key = args[0]
            const group = {}
            lastResult.forEach((item) => {
              const k = item[key]
              if (!group[k]) group[k] = []
              group[k].push(item)
            })
            lastResult = Object.entries(group).map(([k, v]) => ({
              [key]: k,
              count: v.length,
              items: v,
            }))
          } else showSnackbar('groupby 需1个字段', 'error', 'mdi-alert-circle')
          break
        case 'count':
          showSnackbar(`当前结果数量: ${lastResult.length}`, 'info', 'mdi-counter')
          break
        case 'sum':
          if (args.length === 1) {
            const key = args[0]
            const sum = lastResult.reduce((acc, cur) => acc + Number(cur[key] || 0), 0)
            showSnackbar(`${key} 字段总和: ${sum}`, 'info', 'mdi-sigma')
          } else showSnackbar('sum 需1个字段', 'error', 'mdi-alert-circle')
          break
        case 'avg':
          if (args.length === 1) {
            const key = args[0]
            const sum = lastResult.reduce((acc, cur) => acc + Number(cur[key] || 0), 0)
            const avg = lastResult.length ? (sum / lastResult.length).toFixed(2) : 0
            showSnackbar(`${key} 字段平均值: ${avg}`, 'info', 'mdi-chart-bar')
          } else showSnackbar('avg 需1个字段', 'error', 'mdi-alert-circle')
          break
        case 'max':
          if (args.length === 1) {
            const key = args[0]
            const max = Math.max(...lastResult.map((x) => Number(x[key] || 0)))
            showSnackbar(`${key} 字段最大值: ${max}`, 'info', 'mdi-arrow-up-bold')
          } else showSnackbar('max 需1个字段', 'error', 'mdi-alert-circle')
          break
        case 'min':
          if (args.length === 1) {
            const key = args[0]
            const min = Math.min(...lastResult.map((x) => Number(x[key] || 0)))
            showSnackbar(`${key} 字段最小值: ${min}`, 'info', 'mdi-arrow-down-bold')
          } else showSnackbar('min 需1个字段', 'error', 'mdi-alert-circle')
          break
        case 'limit':
          if (args.length === 1) {
            const n = Number(args[0])
            if (!isNaN(n) && n > 0) lastResult = lastResult.slice(0, n)
            else showSnackbar('limit 需正整数', 'error', 'mdi-alert-circle')
          } else showSnackbar('limit 需1个数字', 'error', 'mdi-alert-circle')
          break
        case 'export':
          exported = true
          break
        default:
          showSnackbar(`未知命令: ${cmd}`, 'error', 'mdi-alert-circle')
          break
      }
    }
    show_list.value = lastResult
    if (exported) {
      // 导出CSV
      const headers = Object.keys(lastResult[0] || {})
      const csvContent = [
        headers.join(','),
        ...lastResult.map((item) => headers.map((h) => item[h]).join(',')),
      ].join('\n')
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.setAttribute('href', url)
      link.setAttribute('download', `orders_export_${new Date().toISOString().slice(0, 10)}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      showSnackbar('数据导出成功', 'success', 'mdi-check-circle')
    }
  }

  /**
   * 处理搜索的函数，将所有的property的value视为字符串，进行包含检查，如果通过被添加到temp_list当中，最后被赋值给show_list.value
   * @param {String} search 搜索框中的内容
   */
  const handleSearch = (search) => {
    if (!search || search.trim() === '') {
      // If search is empty, reset to original list
      show_list.value = [...order_list.value]
      return
    }

    const searchTerm = search.toLowerCase().trim()
    let temp_list = []

    show_list.value.forEach((order) => {
      // Convert all possible fields to lowercase strings for case-insensitive search
      const orderValues = Object.values(order)
        .filter((val) => val !== null && val !== undefined)
        .map((val) => String(val).toLowerCase())

      // Check if any field contains the search term
      if (orderValues.some((val) => val.includes(searchTerm))) {
        temp_list.push(order)
        return
      }

      // Special handling for dates
      if (order.order_date) {
        const date = new Date(order.order_date)
        if (!isNaN(date)) {
          // Check various date formats
          const dateFormats = [
            date.toLocaleDateString(), // Local date format
            date.toISOString(), // ISO format
            date.toISOString().split('T')[0], // YYYY-MM-DD
            `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`, // DD/MM/YYYY
            `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`, // MM/DD/YYYY
            date.toDateString(), // Human readable date
            date.toLocaleString(), // Date with time
          ]

          if (dateFormats.some((format) => format.toLowerCase().includes(searchTerm))) {
            temp_list.push(order)
          }
        }
      }
    })

    show_list.value = temp_list
  }
  update_data()
  return { show_list, update_data, default_sort, handle_command, handleSearch }
})
