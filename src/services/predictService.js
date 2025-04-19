import axios from 'axios'
import { availableHost } from '@/utils'

/**
 * @typedef {Object} modelMessage
 * @property {number} store
 * @property {number} item
 * @property {number} st
 * @property {number} ed
 * @property {number} alpha
 * @property {number} p
 * @property {number} q
 * @property {number} d
 * @property {number} l
 * @property {number} epochs
 */

/**
 * @typedef {Object} PredictResult
 * @property {number} error
 * @property {Array<Number>} pred_data
 */

export const predictor = {
  urls: {
    changeModel: 'a0/',
    naivePredict: 'a1/',
    expPredict: 'a2/',
    dickey_fuller_test: 'a3/',
    acfPacf: 'a4/',
    resAcfPacf: 'a5/',
    arimaPredict: 'a6/',
    neutralNetworkPred: 'a7/',
    getAllData: 'a8/',
  },

  /**
   * @param {ModelMessage} params
   */
  async changeModel(params) {
    axios.post(availableHost + this.urls.changeModel, params)
  },

  /**
   * @returns {PredictResult|undefined}
   */
  async naivePredict() {
    try {
      const { data: predictResult } = await axios.get(availableHost + this.urls.naivePredict)
      return predictResult
    } catch (err) {
      console.log(err)
      return undefined
    }
  },

  /**
   * @returns {PredictResult}
   */
  async expPredict() {
    try {
      const { data: predictResult } = await axios.get(availableHost + this.urls.expPredict)
      return predictResult
    } catch {
      return undefined
    }
  },

  async dickeyFullerTest() {
    try {
      const { data: testResult } = await axios.get(availableHost + this.urls.dickey_fuller_test)
      return testResult
    } catch {
      return undefined
    }
  },

  async getAcfPacf() {
    try {
      const { data: acfPacf } = await axios.get(availableHost + this.urls.acfPacf)
      return acfPacf
    } catch {
      return undefined
    }
  },

  async getResAcfPacf() {
    try {
      const { data: resAcfPacf } = await axios.get(availableHost + this.urls.resAcfPacf)
      return resAcfPacf
    } catch {
      return undefined
    }
  },

  /**
   * @returns {PredictResult}
   */
  async arimaPredict() {
    try {
      const { data: result } = await axios.get(availableHost + this.urls.arimaPredict)
      return result
    } catch (err) {
      console.log(err)
      return undefined
    }
  },

  /**
   * @returns {PredictResult}
   */
  async neutralNetworkPredict() {
    try {
      const { data: result } = await axios.get(availableHost + this.urls.neutralNetworkPred)
      return result
    } catch (err) {
      console.log(err)
      return undefined
    }
  },

  async getAllData() {
    try {
      const { data: allData } = await axios.get(availableHost + this.urls.getAllData)
      return allData
    } catch {
      return undefined
    }
  },
}
