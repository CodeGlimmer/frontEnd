<template>
  <v-list nav density="compact">
    <v-list-item
      prepend-icon="mdi-pencil-box-multiple"
      title="订单操作"
      value="operation"
      to="/index/ordermanagement"
    ></v-list-item>

    <v-list-item
      prepend-icon="mdi-console-line"
      title="命令操作"
      value="command"
      to="/index/ordermanagement/command"
    ></v-list-item>

    <!-- <v-list-group value="data-tools">
      <template v-slot:activator="{ props }">
        <v-list-item
          v-bind="props"
          prepend-icon="mdi-chart-box-outline"
          title="数据分析"
        ></v-list-item>
      </template>

      <v-list-item
        prepend-icon="mdi-chart-line"
        title="趋势图表"
        value="trends"
        to="/trends"
      ></v-list-item>

      <v-list-item
        prepend-icon="mdi-chart-timeline-variant"
        title="历史数据"
        value="history"
        to="/history"
      ></v-list-item>

      <v-list-item
        prepend-icon="mdi-file-export-outline"
        title="数据导出"
        value="export"
        to="/export"
      ></v-list-item>
    </v-list-group> -->
    <v-list-item
      prepend-icon="mdi-chart-box-outline"
      title="统计信息"
      value="charts"
      to="/index/ordermanagement/charts"
    ></v-list-item>
  </v-list>
</template>
