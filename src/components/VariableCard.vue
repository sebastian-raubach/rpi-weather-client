<template>
  <v-card
    :title="title"
    :subtitle="subtitle"
  >
    <div>
      <v-card-text class="py-0">
        <v-row align="center" no-gutters>
          <v-col
            class="text-h3"
            cols="6"
          >
            {{ lastValue?.toFixed(1) }}
          </v-col>

          <v-col class="text-right" cols="6">
            <v-icon
              :color="color"
              :icon="icon"
              size="60"
            />
          </v-col>
        </v-row>
      </v-card-text>

      <v-card-subtitle v-if="additionalInfo">{{ additionalInfo }}</v-card-subtitle>
    </div>

    <div class="d-flex py-0 justify-space-between" v-if="hasActualData">
      <v-list-item
        density="compact"
        :prepend-icon="mdiChevronDown"
      >
        <v-list-item-subtitle>{{ minValue.toFixed(1) }}</v-list-item-subtitle>
      </v-list-item>

      <v-list-item
        density="compact"
        :append-icon="mdiChevronUp"
      >
        <v-list-item-subtitle>{{ maxValue.toFixed(1) }}</v-list-item-subtitle>
      </v-list-item>
    </div>

    <v-card-text class="py-0 pb-3">
      <v-sparkline
        v-if="sparklineData && hasActualData"
        :model-value="sparklineData"
        color="rgba(255, 255, 255, .7)"
        height="50"
        line-width="2"
        stroke-linecap="round"
        :gradient="gradient"
        gradient-direction="top"
        auto-draw
      />
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
  import type { MinimalMeasurement } from '@/plugins/types/rpi-weather'
  import { mdiChevronDown, mdiChevronUp } from '@mdi/js'
  import { useTheme } from 'vuetify'

  const compProps = defineProps<{
    title: string
    subtitle?: string
    additionalInfo?: string
    icon: string
    color: string
    measurements?: MinimalMeasurement[]
  }>()

  const theme = useTheme()
  const mutedColor = computed(() => theme.current.value.colors.muted)

  const hasActualData = computed(() => values.value.length > 1)
  const values = computed(() => (compProps.measurements || []).map(m => m.value))
  const lastValue = computed(() => values.value[values.value.length - 1])
  const minValue = computed(() => Math.min(...values.value))
  const maxValue = computed(() => Math.max(...values.value))
  const sparklineData = computed(() => values.value.slice(Math.max(values.value.length - 288, 0)))
  const gradient = computed(() => [compProps.color, mutedColor.value])
</script>
