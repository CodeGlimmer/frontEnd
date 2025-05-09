<template>
  <v-sheet
    class="status-dashboard rounded-xl ma-3 pa-4 overflow-hidden"
    elevation="12"
    :class="{ 'dark-mode': isDarkMode }"
    v-ripple
  >
    <v-container fluid class="px-0">
      <v-row class="status-cards">
        <v-col
          v-for="(item, index) in statusItems"
          :key="index"
          cols="12"
          sm="6"
          md="4"
          lg="4"
          class="status-col"
        >
          <v-card
            :class="[
              'status-card d-flex align-center justify-space-between',
              `status-card--${item.type}`,
              { 'dark-card': isDarkMode },
            ]"
            rounded="lg"
            elevation="6"
            v-ripple
          >
            <div class="status-card__title font-weight-medium">{{ item.title }}</div>
            <div class="status-card__content d-flex align-center">
              <v-icon size="24" :color="item.iconColor" class="status-card__icon">
                {{ item.icon }}
              </v-icon>
              <span class="status-card__value text-body-1 font-weight-medium ml-2">
                {{ item.value }}
              </span>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </v-sheet>
</template>

<script setup>
import { ref } from 'vue'
import { useThemeStore } from '@/stores'
import { storeToRefs } from 'pinia'

const themeStore = useThemeStore()
const { isDarkMode } = storeToRefs(themeStore)

const statusItems = ref([
  {
    title: 'AGV Status',
    value: '充电中',
    icon: 'mdi-robot',
    iconColor: '#4CAF50',
    type: 'agv',
  },
  {
    title: '电池状态',
    value: '10%',
    icon: 'mdi-battery-charging-10',
    iconColor: '#FF5252',
    type: 'battery',
  },
  {
    title: '区域位置',
    value: '工训楼',
    icon: 'mdi-factory',
    iconColor: '#2196F3',
    type: 'location',
  },
])
</script>

<style lang="scss" scoped>
.status-dashboard {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border: 1px solid rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;

  &.dark-mode {
    background: linear-gradient(135deg, #1e1e1e 0%, #2d2d2d 100%);
    border: 1px solid rgba(255, 255, 255, 0.05);
    color: rgba(255, 255, 255, 0.87);
  }
}

.status-cards {
  margin: 0 -12px;
}

.status-col {
  padding: 8px 12px;
  transition: all 0.3s ease;
}

.status-card {
  padding: 16px 20px;
  height: 80px;
  border-radius: 12px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e7ea 100%);
  color: rgba(0, 0, 0, 0.85);

  &.dark-card {
    background: linear-gradient(135deg, #2d2d2d 0%, #252525 100%);
    color: rgba(255, 255, 255, 0.95);
  }

  &:hover {
    transform: translateY(-3px);
    box-shadow:
      0 14px 28px rgba(0, 0, 0, 0.15),
      0 10px 10px rgba(0, 0, 0, 0.12) !important;
  }

  &--agv {
    border-left: 4px solid #4caf50;

    &::before {
      background-image: radial-gradient(
        circle,
        rgba(76, 175, 80, 0.2) 0%,
        rgba(76, 175, 80, 0) 70%
      );
    }
  }

  &--battery {
    border-left: 4px solid #ff5252;

    &::before {
      background-image: radial-gradient(
        circle,
        rgba(255, 82, 82, 0.2) 0%,
        rgba(255, 82, 82, 0) 70%
      );
    }
  }

  &--location {
    border-left: 4px solid #2196f3;

    &::before {
      background-image: radial-gradient(
        circle,
        rgba(33, 150, 243, 0.2) 0%,
        rgba(33, 150, 243, 0) 70%
      );
    }
  }

  &__title {
    font-size: 15px;
    letter-spacing: 0.5px;
  }

  &__content {
    position: relative;
    z-index: 1;
  }

  &__icon {
    transition: all 0.3s ease;
  }

  &__value {
    font-size: 16px;
  }
}

// 移动端优化
@media (max-width: 600px) {
  .status-dashboard {
    padding: 16px !important;
    margin: 12px !important;
  }

  .status-col {
    padding: 6px;
  }

  .status-card {
    padding: 12px 16px;
    height: 70px;

    &__title {
      font-size: 14px;
    }

    &__value {
      font-size: 14px;
    }

    &__icon {
      font-size: 20px !important;
    }
  }
}
</style>
