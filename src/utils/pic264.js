/**
 * 将图片转换为base64编码
 * @param {string} src - 图片地址
 * @returns {Promise<string|undefined>} - 成功返回base64字符串，失败返回undefined
 */
export function imageToBase64(src) {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'Anonymous' // 处理跨域问题

    img.onload = () => {
      try {
        // 创建canvas来转换图片
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height

        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0)

        // 转换为base64，默认为png格式
        const dataURL = canvas.toDataURL('image/png')
        resolve(dataURL) // 返回带有"data:image/png;base64,"前缀的字符串
      } catch (error) {
        console.error('图片转base64失败:', error)
        resolve(undefined)
      }
    }

    img.onerror = () => {
      console.error('图片加载失败:', src)
      resolve(undefined)
    }

    img.src = src
  })
}
