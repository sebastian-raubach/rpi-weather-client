<template>
  <v-card
    :title="title"
    :subtitle="subtitle"
  >
    <div>
      <v-card-text class="py-0">
        <v-row align="center" no-gutters>
          <v-col
            class="text-display-medium"
            cols="6"
          >
            {{ lastValue?.toFixed(toFixed) }}
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

      <v-card-subtitle v-if="additionalInfo" class="d-flex justify-space-between">
        <div
          v-for="(part, index) in additionalInfo"
          :key="`additional-info-${index}`"
        >
          {{ part }}
        </div>
      </v-card-subtitle>
    </div>

    <div class="d-flex py-0 justify-space-between" v-if="hasActualData">
      <v-list-item
        density="compact"
        :prepend-icon="mdiChevronDown"
      >
        <v-list-item-subtitle>{{ minValue.toFixed(toFixed) }}</v-list-item-subtitle>
      </v-list-item>

      <v-list-item
        density="compact"
        :append-icon="mdiChevronUp"
      >
        <v-list-item-subtitle>{{ maxValue.toFixed(toFixed) }}</v-list-item-subtitle>
      </v-list-item>
    </div>

    <v-card-text class="py-0 pb-3">
      <!-- @vue-ignore -->
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

  const compProps = withDefaults(defineProps<{
    title: string
    subtitle?: string
    additionalInfo?: string[]
    icon: string
    color: string
    toFixed?: number
    measurements?: MinimalMeasurement[]
  }>(), {
    toFixed: 1,
  })

  const theme = useTheme()
  const mutedColor = computed(() => theme.current.value.colors.muted)

  const hasActualData = computed(() => values.value.length > 1)
  const values = computed(() => (compProps.measurements || []).map(m => m.value))
  const lastValue = computed(() => values.value[values.value.length - 1])
  const minValue = computed(() => Math.min(...values.value))
  const maxValue = computed(() => Math.max(...values.value))
  const sparklineData = computed(() => values.value.slice(Math.max(values.value.length - 288, 0)))
  const gradient = computed(() => [compProps.color || '#000000', mutedColor.value || '#ffffff'])
</script>
