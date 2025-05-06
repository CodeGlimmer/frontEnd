<template>
  <div>
    <TimeSeriesForm :initial-store="1" :initial-item="1" @refresh-data="refreshData" />
    <BaseChart
      :labels="dateData"
      :values="originData"
      @range-confirmed="handleRangeChange"
      v-if="allDataLoaded"
    />
    <v-skeleton-loader type="card" v-else></v-skeleton-loader>
    <div class="tw:mt-4">
      <v-expansion-panels variant="popout">
        <v-expansion-panel title="Naive Prediction">
          <v-expansion-panel-text>
            <BasePredictionChart
              :actualSales="originData.slice(predictorModel.st, predictorModel.ed)"
              :predictedSales="naivePrediction.pred_data"
              :dates="dateData.slice(predictorModel.st, predictorModel.ed)"
              :error="naivePrediction.error"
              v-if="naiveLoaded"
            />
            <v-skeleton-loader type="card" v-else></v-skeleton-loader>
          </v-expansion-panel-text>
        </v-expansion-panel>
        <v-expansion-panel title="Exponential Forecasting Method">
          <v-expansion-panel-text>
            <AlphaSlider @update:alpha="changeAlpha" />
            <BasePredictionChart
              :actualSales="originData.slice(predictorModel.st, predictorModel.ed)"
              :predictedSales="expPrediction.pred_data"
              :dates="dateData.slice(predictorModel.st, predictorModel.ed)"
              :error="expPrediction.error"
              v-if="expLoaded"
            />
            <v-skeleton-loader type="card" v-else></v-skeleton-loader>
          </v-expansion-panel-text>
        </v-expansion-panel>
        <v-expansion-panel title="ARIMA Forecasting Method">
          <v-expansion-panel-text>
            <updateArimaPrams @update-arima-params="handleArimaParamsUpdate" />
            <div v-if="arimaLoaded">
              <DickeyFullerChart
                :testDataString="testResult.replace(new RegExp('NaN', 'g'), 'null')"
              />
              <AcfPacf :chartData="acfPacf" />
              <AcfPacf :chartData="resAcfPacf"> 残差分析</AcfPacf>
              <BasePredictionChart
                :actualSales="originData.slice(predictorModel.st, predictorModel.ed)"
                :predictedSales="arimaPrediction.pred_data"
                :dates="dateData.slice(predictorModel.st, predictorModel.ed)"
                :error="arimaPrediction.error"
              />
            </div>
            <div v-else>
              <v-skeleton-loader type="card"></v-skeleton-loader>
              <v-skeleton-loader type="card"></v-skeleton-loader>
              <v-skeleton-loader type="card"></v-skeleton-loader>
            </div>
          </v-expansion-panel-text>
        </v-expansion-panel>
        <v-expansion-panel title="Neural Network Forecasting Method">
          <v-expansion-panel-text>
            <BasePredictionChart
              :actualSales="originData.slice(predictorModel.st, predictorModel.ed)"
              :predictedSales="neuPrediction.pred_data"
              :dates="dateData.slice(predictorModel.st, predictorModel.ed)"
              :error="neuPrediction.error"
              v-if="neuLoaded"
            />
            <v-skeleton-loader type="card" v-else></v-skeleton-loader>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </div>
  </div>
</template>

<script setup>
import TimeSeriesForm from './TimeSeriesForm.vue'
import BaseChart from '@/views/PredictorViews/BaseChart.vue'
import BasePredictionChart from '@/views/PredictorViews/BasePredictionChart.vue'
import AlphaSlider from './AlphaSlider.vue'
import updateArimaPrams from './updateArimaPrams.vue'
import DickeyFullerChart from '@/views/PredictorViews/DickeyFullerChart.vue'
import AcfPacf from '@/views/PredictorViews/AcfPacf.vue'
import { predictor } from '@/services'
import { ref, onMounted, computed } from 'vue'

const predictorModel = ref({
  store: 1,
  item: 1,
  st: 500,
  ed: 700,
  alpha: 0.6,
  p: 7,
  q: 0,
  d: 1,
  l: 7,
  epochs: 5000,
}) // 对象模型, 以及它的默认参数

const dateData = ref([]) // 用于存储date
const originData = ref([]) // 取出一个(item, store)对应的全部数据
const naivePrediction = ref(null) // 预测对象
const expPrediction = ref(null)
const arimaPrediction = ref(null)
const neuPrediction = ref(null)
const testResult = ref(null)
const acfPacf = ref(null)
const resAcfPacf = ref(null)

// 遮罩控制开关
const allDataLoaded = ref(false)
const naiveLoaded = ref(false)
const expLoaded = ref(false)
const numOfLoaded = ref(0) // armia需要全部数据完成加载后才可以显示,counter
const arimaLoaded = computed(() => numOfLoaded.value === 4)
const neuLoaded = ref(false)

// 独立刷新控制函数
const refreshAllData = async () => {
  allDataLoaded.value = false
  predictor
    .getAllData()
    .then((allData) => {
      if (allData == undefined) throw new Error('数据未能正常加载')
      dateData.value = allData.all_data[0]
      originData.value = allData.all_data[1]
    })
    .then(() => {
      allDataLoaded.value = true
    })
    .catch((err) => {
      console.error(err.message)
    })
}

const refreshNaive = async () => {
  naiveLoaded.value = false
  predictor
    .naivePredict()
    .then((result) => {
      if (result == undefined) throw new Error('refreshNaive')
      naivePrediction.value = result
    })
    .then(() => {
      naiveLoaded.value = true
      console.log('数据长度：' + naivePrediction.value.pred_data.length)
    })
    .catch((err) => {
      console.error(err.message)
    })
}

const refreshExp = async () => {
  expLoaded.value = false
  predictor
    .expPredict()
    .then((result) => {
      if (result == undefined) throw new Error('refreshExp')
      expPrediction.value = result
    })
    .then(() => {
      expLoaded.value = true
    })
    .catch((err) => {
      console.error(err.message)
    })
}

// 分为四个子任务，全部完成之后才可以认为执行完毕
const refreshArima = async () => {
  numOfLoaded.value = 0
  predictor
    .dickeyFullerTest()
    .then((result) => {
      if (result == undefined) throw new Error('dickeyFullerTest')
      testResult.value = result
    })
    .then(() => {
      numOfLoaded.value++
    })
    .catch((err) => {
      console.error(err.message)
    })

  predictor
    .getAcfPacf()
    .then((result) => {
      if (result == undefined) throw new Error('getAcfPacf')
      acfPacf.value = result
    })
    .then(() => {
      numOfLoaded.value++
    })
    .catch((err) => {
      console.error(err.message)
    })

  predictor
    .getResAcfPacf()
    .then((result) => {
      if (result == undefined) throw new Error('getResAcfPacf')
      resAcfPacf.value = result
    })
    .then(() => {
      numOfLoaded.value++
    })
    .catch((err) => {
      console.error(err.message)
    })

  predictor
    .arimaPredict()
    .then((result) => {
      if (result == undefined) throw new Error('arimaPredict')
      arimaPrediction.value = result
    })
    .then(() => {
      numOfLoaded.value++
    })
    .catch((err) => {
      console.error(err.message)
    })
}

const refreshNeu = async () => {
  neuLoaded.value = false
  predictor
    .neutralNetworkPredict()
    .then((result) => {
      if (result == undefined) throw new Error('neutralNetworkPredict')
      neuPrediction.value = result
    })
    .then(() => {
      neuLoaded.value = true
    })
    .catch((err) => {
      console.error(err.message)
    })
}

// 改变模型同时修改所有数据
const changeModelStatus = async () => {
  await predictor.changeModel(predictorModel.value) // 改变模型必须await
  refreshAllData()
  refreshNaive()
  refreshExp()
  refreshArima()
  refreshNeu()
}

/**used for refresh the item and store */
const refreshData = async ({ store, item }) => {
  predictorModel.value.store = store
  predictorModel.value.item = item
  changeModelStatus()
}

const handleRangeChange = async ({ leftIndex, rightIndex }) => {
  predictorModel.value.st = leftIndex
  predictorModel.value.ed = rightIndex
  console.log(`预测数据长度: ${rightIndex - leftIndex}`)
  await predictor.changeModel(predictorModel.value) // 改变模型必须await
  refreshNaive()
  refreshExp()
  refreshArima()
  refreshNeu()
}

const changeAlpha = async (alpha) => {
  predictorModel.value.alpha = alpha
  await predictor.changeModel(predictorModel.value)
  refreshExp()
}

const handleArimaParamsUpdate = async ({ p, d, q }) => {
  predictorModel.value.p = p
  predictorModel.value.d = d
  predictorModel.value.q = q
  await predictor.changeModel(predictorModel.value)
  refreshArima()
}

// 生命周期，同步所有的localStorage
;(() => {
  let lastAlpha = localStorage.getItem('exponentialSmoothingAlpha')
  let arimaParam = localStorage.getItem('arimaParam')
  if (lastAlpha) {
    predictorModel.value.alpha = +lastAlpha
  }
  if (arimaParam) {
    Object.assign(predictorModel.value, JSON.parse(arimaParam))
  }
})()

// 初始化所有对象，并获取所有初始模型对应的数据
onMounted(() => {
  // 获取localStorage暂存数据，调整模型参数
  let lastAlpha = localStorage.getItem('exponentialSmoothingAlpha')
  if (lastAlpha) {
    predictorModel.value.alpha = lastAlpha
  }
  changeModelStatus()
})
</script>

<style lang="scss" scoped></style>
