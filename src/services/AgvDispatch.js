import axios from 'axios'
import { availableHost as socket } from '@/utils/useSocket'

/**
 * 调用AGV调度算法服务
 *
 * ## 请求参数 (JSON格式)
 * ```json
 * {
 *     "num_agvs": 3,                    // 必需: AGV数量 (整数, >= 1)
 *     "agv_positions": [                // 必需: AGV起始位置数组
 *         [0, 2], [0, 3], [0, 4]        // 格式: [[x1,y1], [x2,y2], ...]
 *     ],
 *     "task_locations": {               // 必需: 任务位置字典
 *         "0": [[2, 17], [17, 19]],     // 格式: "task_id": [[pickup_x, pickup_y], [delivery_x, delivery_y]]
 *         "1": [[2, 16], [17, 18]],
 *         "2": [[2, 15], [17, 17]]
 *     },
 *     "grid_size": [20, 20],            // 可选: 地图大小 [width, height], 默认[20, 20]
 *     "obstacles": [                    // 可选: 障碍物坐标数组, 默认[]
 *         [0, 0], [0, 6], [6, 0], [6, 6]
 *     ],
 *     "optimization_config": {          // 可选: 优化算法参数
 *         "pop_size": 50,               // 种群大小, 默认50
 *         "n_gen": 20,                  // 迭代次数, 默认20
 *         "return_animation": true      // 是否返回动画数据, 默认true
 *     }
 * }
 * ```
 *
 * ## 返回数据格式 (成功时)
 * ```json
 * {
 *     "success": true,
 *     "message": "AGV调度优化完成",
 *     "data": {
 *         "optimization_results": {
 *             "total_solutions": 50,
 *             "computation_time": 12.5,
 *             "best_solution": {
 *                 "id": 0,
 *                 "makespan": 45.2,
 *                 "distance": 128.7,
 *                 "agv_assignments": { "0": [0, 3], "1": [1, 4], "2": [2] }
 *             }
 *         },
 *         "visualization_data": {
 *             "pareto_front": [ [45.2, 128.7], [48.1, 115.3] ],
 *             "all_solutions": [ { "id": 0, "makespan": 45.2, "distance": 128.7, "agv_assignments": {"0": [0,3], "1": [1,4], "2": [2]} } ],
 *             "animation_data": {
 *                 "grid_size": [20, 20],
 *                 "obstacles": [[0,0]],
 *                 "task_locations": {"0": [[2,17],[17,19]]},
 *                 "agv_start_positions": [[0,2]],
 *                 "agv_assignments": {"0": [0,3]},
 *                 "total_time": 45.2,
 *                 "total_distance": 128.7
 *             }
 *         },
 *         "frontend_charts": {
 *             "pareto_chart": {
 *                 "chart_type": "scatter",
 *                 "title": "AGV调度帕累托前沿",
 *                 "x_axis": {"label": "完工时间", "data": [45.2]},
 *                 "y_axis": {"label": "总距离", "data": [128.7]},
 *                 "series": [{"name": "帕累托解", "data": [[45.2,128.7]]}]
 *             },
 *             "task_distribution": {
 *                 "chart_type": "bar",
 *                 "title": "AGV任务分配统计",
 *                 "categories": ["AGV 0"],
 *                 "series": [{"name": "任务数量", "data": [2]}]
 *             }
 *         }
 *     }
 * }
 * ```
 *
 * ## 错误返回格式
 * ```json
 * {
 *     "success": false,
 *     "message": "错误描述",
 *     "error_code": "INVALID_PARAMS", // 或其他错误码如 'API_ERROR', 'NETWORK_ERROR'
 *     "details": "具体错误信息"
 * }
 * ```
 * @async
 * @function callAgvDispatchService
 * @param {object} params - 请求参数对象, 结构如上所示。
 * @returns {Promise<object>} - 一个Promise，解析为包含调度结果或错误信息的对象。
 *                              成功时，对象结构如“返回数据格式 (成功时)”所示。
 *                              失败时，对象结构如“错误返回格式”所示。
 */
export async function callAgvDispatchService(params) {
  const API_ENDPOINT = `${socket}/agv_schedule/` // 请替换为真实的API端点

  try {
    console.log('调用AGV调度服务，参数:', params)
    const response = await axios.post(API_ENDPOINT, params, {
      headers: {
        'Content-Type': 'application/json',
        // 如果需要，可以在此处添加其他头部信息，例如认证Token
        // 'Authorization': `Bearer YOUR_TOKEN_HERE`
      },
      // 可以设置超时时间 (毫秒)
      // timeout: 10000, // 10秒
    })

    // 假设后端API成功时总是返回HTTP 2xx状态码，并且响应体直接是成功数据格式
    // 如果后端在成功时也可能将 success: true/false 放在响应体中，则需要检查 response.data.success
    return response.data // 直接返回后端响应的数据
  } catch (error) {
    console.error('AGV Dispatch Service API call failed:', error)

    if (axios.isAxiosError(error)) {
      if (error.response) {
        // 请求已发出，服务器用状态码响应 (非2xx)
        // 尝试从 error.response.data 获取后端定义的错误结构
        const errorData = error.response.data
        return {
          success: false,
          message: errorData?.message || `API请求错误: ${error.response.status}`,
          error_code: errorData?.error_code || 'API_ERROR',
          details: errorData?.details || error.response.statusText || '服务器返回错误',
        }
      } else if (error.request) {
        // 请求已发出，但没有收到响应 (例如网络问题)
        return {
          success: false,
          message: '网络错误，未能连接到服务器',
          error_code: 'NETWORK_ERROR',
          details: '无法从服务器获取响应。请检查您的网络连接。',
        }
      }
    }
    // 其他类型的错误 (例如请求配置错误)
    return {
      success: false,
      message: '请求处理失败',
      error_code: 'CLIENT_REQUEST_ERROR',
      details: error.message || '在准备请求时发生未知错误。',
    }
  }
}

// 如果需要，可以导出其他与AGV调度相关的服务函数
// export async function getAgvTaskStatus(taskId) { ... }
// export async function cancelAgvTask(taskId) { ... }
