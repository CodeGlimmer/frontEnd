<template>
  <div>
    <TimeSeriesForm :initial-store="1" :initial-item="1" @refresh-data="refreshData" />
    <BaseChart :labels="dateData" :values="originData" @range-change="handleRangeChange" />
    <div>
      <v-expansion-panels variant="popout">
        <v-expansion-panel title="Naive Prediction" @click="refreshData">
          <v-expansion-panel-text>
            <BasePredictionChart
              :actualSales="originData.slice(predictorModel.st, predictorModel.ed)"
              :predictedSales="naivePrediction.pred_data"
              :dates="dateData.slice(predictorModel.st, predictorModel.ed)"
              :error="naivePrediction.error"
            />
          </v-expansion-panel-text>
        </v-expansion-panel>
        <v-expansion-panel title="Exponential Forecasting Method" @click="refreshData">
          <v-expansion-panel-text>
            <AlphaSlider @update:alpha="changeAlpha" />
            <BasePredictionChart
              :actualSales="originData.slice(predictorModel.st, predictorModel.ed)"
              :predictedSales="expPrediction.pred_data"
              :dates="dateData.slice(predictorModel.st, predictorModel.ed)"
              :error="expPrediction.error"
            />
          </v-expansion-panel-text>
        </v-expansion-panel>
        <v-expansion-panel title="Exponential Forecasting Method" @click="refreshData">
          <v-expansion-panel-text>
            <updateArimaPrams @update-arima-params="handleArimaParamsUpdate" />
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
          </v-expansion-panel-text>
        </v-expansion-panel>
        <v-expansion-panel title="Exponential Forecasting Method" @click="refreshData">
          <v-expansion-panel-text>
            <BasePredictionChart
              :actualSales="originData.slice(predictorModel.st, predictorModel.ed)"
              :predictedSales="neuPrediction.pred_data"
              :dates="dateData.slice(predictorModel.st, predictorModel.ed)"
              :error="neuPrediction.error"
            />
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
import { ref, onMounted } from 'vue'

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
}) // 对象模型, 以及默认值
const dateData = ref([]) // 用于存储date
const originData = ref([]) // 取出一个(item, store)对应的全部数据
const naivePrediction = ref(null) // 预测对象
const expPrediction = ref(null)
const arimaPrediction = ref(null)
const neuPrediction = ref(null)
const testResult = ref(null)
const acfPacf = ref(null)
const resAcfPacf = ref(null)

const changeModelStatus = async () => {
  await predictor.changeModel(predictorModel.value)
  predictor.getAllData().then((allData) => {
    if (allData == undefined) return
    dateData.value = allData.all_data[0]
    originData.value = allData.all_data[1]
  })
  predictor.naivePredict().then((result) => {
    if (result == undefined) return
    naivePrediction.value = result
  })
  predictor.expPredict().then((result) => {
    if (result == undefined) return
    expPrediction.value = result
  })
  predictor.dickeyFullerTest().then((result) => {
    if (result == undefined) return
    testResult.value = result
  })
  predictor.getAcfPacf().then((result) => {
    if (result == undefined) return
    acfPacf.value = result
  })
  predictor.getResAcfPacf().then((result) => {
    if (result == undefined) return
    resAcfPacf.value = result
  })
  predictor.arimaPredict().then((result) => {
    if (result == undefined) return
    arimaPrediction.value = result
  })
}
const refreshData = ({ store, item }) => {
  predictorModel.value.store = store
  predictorModel.value.item = item
  changeModelStatus()
}

const handleRangeChange = ({ leftIndex, rightIndex }) => {
  predictorModel.value.st = leftIndex
  predictorModel.value.ed = rightIndex
}

const changeAlpha = async (alpha) => {
  predictorModel.value.alpha = alpha
  await predictor.changeModel(predictorModel.value)
  predictor.expPredict().then((result) => {
    if (result == undefined) return
    expPrediction.value = result
  })
}

const handleArimaParamsUpdate = async ({ p, d, q }) => {
  predictor.dickeyFullerTest().then((result) => {
    if (result == undefined) return
    testResult.value = result
  })
  predictor.getAcfPacf().then((result) => {
    if (result == undefined) return
    acfPacf.value = result
  })
  predictor.getResAcfPacf().then((result) => {
    if (result == undefined) return
    resAcfPacf.value = result
  })
  predictor.arimaPredict().then((result) => {
    if (result == undefined) return
    arimaPrediction.value = result
  })
  predictorModel.value.p = p
  predictorModel.value.d = d
  predictorModel.value.q = q
  predictor.dickeyFullerTest().then((result) => {
    if (result == undefined) return
    testResult.value = result
  })
  predictor.getAcfPacf().then((result) => {
    if (result == undefined) return
    acfPacf.value = result
  })
  predictor.getResAcfPacf().then((result) => {
    if (result == undefined) return
    resAcfPacf.value = result
  })
  predictor.arimaPredict().then((result) => {
    if (result == undefined) return
    arimaPrediction.value = result
  })
}

// 初始化所有对象，并获取所有初始模型对应的数据
onMounted(() => {
  changeModelStatus()
  predictor.neutralNetworkPredict().then((result) => {
    if (result == undefined) return
    neuPrediction.value = result
  })
})
</script>

<style lang="scss" scoped></style>
