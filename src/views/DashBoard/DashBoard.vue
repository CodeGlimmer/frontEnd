<template>
  <div class="tw:grid tw:grid-cols-12 tw:gap-2">
    <div
      class="tw:col-span-12 tw:motion-translate-x-in-[-85%] tw:motion-translate-y-in-[-65%] tw:motion-blur-in-[30px] tw:motion-ease-spring-bouncier"
    >
      <WorkingStatus />
    </div>
    <div
      class="tw:col-span-12 tw:md:col-span-8 tw:dark:bg-m-grey-darken4 tw:bg-white tw:rounded-xl tw:border-m-success-dark tw:border-l-4 tw:!ml-2.5 tw:flex tw:justify-center tw:items-center tw:motion-translate-x-in-[-85%] tw:motion-translate-y-in-[-65%] tw:motion-blur-in-[30px] tw:motion-ease-spring-bouncier tw:motion-delay-100 tw:shadow-m-elevation-12"
    >
      <RosViewCard
        class="tw:w-full tw:!mx-4 tw:hover:!shadow-m-elevation-24 tw:hover:-translate-y-2 tw:transition-transform tw:duration-200 tw:ease-in-out"
      />
    </div>
    <div
      class="tw:col-span-12 tw:md:col-span-4 tw:!mx-2.5 tw:!p-2 tw:!md:mx-1 tw:motion-translate-x-in-[-85%] tw:motion-translate-y-in-[-65%] tw:motion-blur-in-[30px] tw:motion-ease-spring-bouncier tw:motion-delay-200 tw:!flex tw:!items-center tw:!justify-center tw:shadow-m-elevation-8 tw:rounded-xl tw:dark:bg-m-grey-darken4"
    >
      <VelocityShow
        class="tw:hover:-translate-y-2 tw:hover:!shadow-m-elevation-12 tw:ease-in-out tw:!transition-all tw:duration-500 border-thin tw:hover:!bg-m-grey-lighten3 tw:dark:hover:!bg-m-grey-darken3 tw:!w-full"
      />
    </div>
    <div
      class="tw:col-span-12 tw:md:col-span-3 tw:motion-translate-x-in-[-85%] tw:motion-translate-y-in-[-65%] tw:motion-blur-in-[30px] tw:motion-ease-spring-bouncier tw:motion-delay-300 elevation-8 pa-2 tw:rounded-xl tw:!mx-2 tw:dark:!bg-m-grey-darken4"
    >
      <SendingOperations />
    </div>
    <div
      class="tw:col-span-12 tw:md:col-span-9 tw:md:!ml-2 tw:rounded-xl tw:!mr-2.5 tw:motion-translate-x-in-[-85%] tw:motion-translate-y-in-[-65%] tw:motion-blur-in-[30px] tw:motion-ease-spring-bouncier tw:motion-delay-500 tw:flex tw:justify-center tw:items-center"
    >
      <QuickCommands
        class="tw:!mx-2 tw:!my-2 tw:!p-2 tw:!md:mx-1 tw:w-full tw:motion-translate-x-in-[-85%] tw:motion-translate-y-in-[-65%] tw:motion-blur-in-[30px] tw:motion-ease-spring-bouncier tw:motion-delay-500"
      />
    </div>
  </div>
</template>

<script setup>
import QuickCommands from './QuickCommands.vue'
import SendingOperations from './SendingOperations.vue'
import VelocityShow from './VelocityShow.vue'
import WorkingStatus from './WorkingStatus.vue'
import RosViewCard from '../AgvMonitoring/RosViewCard.vue'
</script>

<style lang="scss" scoped></style>
