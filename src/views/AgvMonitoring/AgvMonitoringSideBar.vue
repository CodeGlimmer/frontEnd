<template>
  <v-list nav density="compact">
    <v-list-item
      prepend-icon="mdi-camera"
      title="摄像头画面监控"
      value="camera"
      to="/index/agvmonitoring"
    ></v-list-item>

    <v-list-item
      prepend-icon="mdi-monitor-dashboard"
      title="速度监测"
      value="velocity"
      to="/index/agvmonitoring/velocity"
    ></v-list-item>

    <v-list-item
      prepend-icon="mdi-wifi"
      title="雷达扫描"
      value="scan"
      to="/index/agvmonitoring/scan"
    ></v-list-item>

    <v-list-item
      prepend-icon="mdi-map"
      title="实时地图"
      value="map"
      to="/index/agvmonitoring/map"
    ></v-list-item>

    <v-list-item
      prepend-icon="mdi-reply-outline"
      title="fox glove"
      value="foxglove"
      to="/index/agvmonitoring/foxglove"
    ></v-list-item>

    <v-list-item
      prepend-icon="mdi-robot-industrial"
      title="AGV机械臂"
      value="arm"
      to="/index/agvmonitoring/agv-arm"
    ></v-list-item>
  </v-list>
</template>
