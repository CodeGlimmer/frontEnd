// check-django-ports.mjs
import axios from 'axios'

const socketList = ['http://127.0.0.1', 'http://192.168.73.88', 'http://192.168.122.88']
const DJANGO_PORT = 8000 // 默认 Django 开发端口
const TIMEOUT = 1000 // 检测超时时间（毫秒）

/**
 * 检测单个地址的端口可访问性
 * @param {string} host - 目标主机地址
 * @returns {Promise<boolean>} - 是否可访问
 */
const checkPort = async (host) => {
  try {
    const url = `${host}:${DJANGO_PORT}/admin/`
    await axios.get(url, { timeout: TIMEOUT })
    return true
  } catch {
    return false
  }
}

/**
 * 获取所有可访问的 Django 服务地址
 * @returns {Promise<string[]>} - 可用地址列表
 */
export const getAvailableDjangoHosts = async () => {
  // 并发检测所有地址
  const results = await Promise.allSettled(socketList.map((host) => checkPort(host)))

  // 过滤出可访问的地址
  return socketList.filter(
    (_, index) => results[index].status === 'fulfilled' && results[index].value,
  )
}

/**
 * 获取第一个可访问的地址（推荐多数场景使用）
 * @returns {Promise<string|null>} - 首个可用地址
 */
export const getFirstAvailableHost = async () => {
  for (const host of socketList) {
    if (await checkPort(host)) return host
  }
  return null
}
// 自动检测并导出常用地址（按需启用）
export const availableHost = (await getFirstAvailableHost()) + ':8000/'
