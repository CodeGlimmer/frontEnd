/**
 * IndexedDB 工具类
 */
class IndexedDBHelper {
  constructor(dbName, version = 1) {
    this.dbName = dbName
    this.version = version
    this.db = null
  }

  /**
   * 打开数据库连接
   * @param {Array} stores - 存储对象配置 [{name: 'storeName', keyPath: 'id', indexes: [{name: 'indexName', keyPath: 'path', options: {}}]}]
   * @returns {Promise} - 返回Promise对象
   */
  open(stores = []) {
    return new Promise((resolve, reject) => {
      if (this.db) {
        resolve(this.db)
        return
      }

      const request = indexedDB.open(this.dbName, this.version)

      request.onupgradeneeded = (event) => {
        const db = event.target.result

        // 创建存储对象
        stores.forEach((store) => {
          if (!db.objectStoreNames.contains(store.name)) {
            const objectStore = db.createObjectStore(store.name, { keyPath: store.keyPath })

            // 创建索引
            if (store.indexes && Array.isArray(store.indexes)) {
              store.indexes.forEach((index) => {
                objectStore.createIndex(index.name, index.keyPath, index.options || {})
              })
            }
          }
        })
      }

      request.onsuccess = (event) => {
        this.db = event.target.result
        resolve(this.db)
      }

      request.onerror = (event) => {
        reject(`数据库打开失败: ${event.target.errorCode}`)
      }
    })
  }

  /**
   * 关闭数据库连接
   */
  close() {
    if (this.db) {
      this.db.close()
      this.db = null
    }
  }

  /**
   * 添加数据
   * @param {string} storeName - 存储对象名称
   * @param {Object} data - 要添加的数据
   * @returns {Promise} - 返回Promise对象
   */
  add(storeName, data) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject('数据库未打开')
        return
      }

      const transaction = this.db.transaction([storeName], 'readwrite')
      const store = transaction.objectStore(storeName)
      const request = store.add(data)

      request.onsuccess = (event) => {
        resolve(event.target.result)
      }

      request.onerror = (event) => {
        reject(`添加数据失败: ${event.target.errorCode}`)
      }
    })
  }

  /**
   * 更新数据
   * @param {string} storeName - 存储对象名称
   * @param {Object} data - 要更新的数据
   * @returns {Promise} - 返回Promise对象
   */
  update(storeName, data) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject('数据库未打开')
        return
      }

      const transaction = this.db.transaction([storeName], 'readwrite')
      const store = transaction.objectStore(storeName)
      const request = store.put(data)

      request.onsuccess = (event) => {
        resolve(event.target.result)
      }

      request.onerror = (event) => {
        reject(`更新数据失败: ${event.target.errorCode}`)
      }
    })
  }

  /**
   * 删除数据
   * @param {string} storeName - 存储对象名称
   * @param {any} key - 要删除数据的键
   * @returns {Promise} - 返回Promise对象
   */
  delete(storeName, key) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject('数据库未打开')
        return
      }

      const transaction = this.db.transaction([storeName], 'readwrite')
      const store = transaction.objectStore(storeName)
      const request = store.delete(key)

      request.onsuccess = () => {
        resolve(true)
      }

      request.onerror = (event) => {
        reject(`删除数据失败: ${event.target.errorCode}`)
      }
    })
  }

  /**
   * 查询单条数据
   * @param {string} storeName - 存储对象名称
   * @param {any} key - 要查询数据的键
   * @returns {Promise} - 返回Promise对象
   */
  get(storeName, key) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject('数据库未打开')
        return
      }

      const transaction = this.db.transaction([storeName], 'readonly')
      const store = transaction.objectStore(storeName)
      const request = store.get(key)

      request.onsuccess = (event) => {
        resolve(event.target.result)
      }

      request.onerror = (event) => {
        reject(`查询数据失败: ${event.target.errorCode}`)
      }
    })
  }

  /**
   * 查询所有数据
   * @param {string} storeName - 存储对象名称
   * @returns {Promise} - 返回Promise对象
   */
  getAll(storeName) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject('数据库未打开')
        return
      }

      const transaction = this.db.transaction([storeName], 'readonly')
      const store = transaction.objectStore(storeName)
      const request = store.getAll()

      request.onsuccess = (event) => {
        resolve(event.target.result)
      }

      request.onerror = (event) => {
        reject(`查询所有数据失败: ${event.target.errorCode}`)
      }
    })
  }

  /**
   * 通过索引查询数据
   * @param {string} storeName - 存储对象名称
   * @param {string} indexName - 索引名称
   * @param {any} value - 索引值
   * @returns {Promise} - 返回Promise对象
   */
  getByIndex(storeName, indexName, value) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject('数据库未打开')
        return
      }

      const transaction = this.db.transaction([storeName], 'readonly')
      const store = transaction.objectStore(storeName)
      const index = store.index(indexName)
      const request = index.getAll(value)

      request.onsuccess = (event) => {
        resolve(event.target.result)
      }

      request.onerror = (event) => {
        reject(`通过索引查询数据失败: ${event.target.errorCode}`)
      }
    })
  }

  /**
   * 清空存储对象
   * @param {string} storeName - 存储对象名称
   * @returns {Promise} - 返回Promise对象
   */
  clear(storeName) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject('数据库未打开')
        return
      }

      const transaction = this.db.transaction([storeName], 'readwrite')
      const store = transaction.objectStore(storeName)
      const request = store.clear()

      request.onsuccess = () => {
        resolve(true)
      }

      request.onerror = (event) => {
        reject(`清空存储对象失败: ${event.target.errorCode}`)
      }
    })
  }
}

export default IndexedDBHelper
