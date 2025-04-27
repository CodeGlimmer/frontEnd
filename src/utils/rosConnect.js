import { computed, ref } from 'vue'
import ROSLIB from 'roslib'

export function useRosConnect() {
  const rosUrl = ref(null)
  const ros = computed(() => {
    return rosUrl.value ? new ROSLIB.Ros({ url: rosUrl.value }) : null
  })
  return { rosUrl, ros }
}
