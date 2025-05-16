<template>
  <div>
    <h1>Simple Map Example</h1>
    <p>
      Run the following commands in the terminal then refresh this page. This will load a map from
      the
      <code>ros-groovy-rail-maps</code>
      package.
    </p>
    <ol>
      <li><code>roscore</code></li>
      <li>
        <code>rosrun map_server map_server /opt/ros/groovy/share/rail_maps/maps/ilab.pgm 0.05</code>
      </li>
      <li><code>roslaunch rosbridge_server rosbridge_websocket.launch</code></li>
    </ol>
    <div id="map"></div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import * as ROSLIB from 'roslib'
import * as ROS2D from '@/lib/stdros/ros2d.js'

onMounted(() => {
  // Connect to ROS.
  const ros = new ROSLIB.Ros({
    url: 'ws://localhost:9091',
  })

  // Create the main viewer.
  const viewer = new ROS2D.Viewer({
    divID: 'map',
    height: 480,
  })

  // Setup the map client.
  const gridClient = new ROS2D.OccupancyGridClient({
    ros: ros,
    rootObject: viewer.scene,
  })

  // Scale the canvas to fit to the map
  gridClient.on('change', () => {
    viewer.scaleToDimensions(gridClient.currentGrid.width, gridClient.currentGrid.height)
    viewer.shift(gridClient.currentGrid.pose.position.x, gridClient.currentGrid.pose.position.y)
  })
})
</script>

<style scoped>
#map {
  width: 100%;
  height: 480px;
}
</style>
