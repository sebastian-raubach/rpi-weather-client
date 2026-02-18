<template>
  <v-date-picker
    @update:month="calculateMonthlyMoonPhases"
    hide-header
    show-adjacent-months
  >
    <template #controls="{ disabled, nextMonth, prevMonth, monthYearText }">
      <v-btn :disabled="disabled.includes('prev-month')" color="primary" icon="$prev" @click="prevMonth " />
      <v-spacer />
      <div class="text-center">
        <div class="text-caption my-n1 text-primary">{{ monthYearText.split(' ')[1] }}</div>
        <div class="text-body-1">{{ monthYearText.split(' ')[0] }}</div>
      </div>
      <v-spacer />
      <v-btn :disabled="disabled.includes('next-month')" color="primary" icon="$next" @click="nextMonth" />
    </template>
    <template #day="{ item }">
      <v-btn
        :variant="item.isToday ? 'tonal' : 'text'"
        icon
        class="v-date-picker-month__day-btn"
      >
        <!-- @vue-ignore -->
        {{ (d = dateMoonPhases[item.date.toISOString().split('T')[0]], null) }}
        {{ item.date.getDate() }}
        <div class="v-date-picker-month__events">
          <!-- @vue-ignore -->
          <v-icon
            size="10px"
            class="mt-1"
            :color="gradient[d <= 3 ? d : 7 - d]"
            :icon="moonPhases[d]"
            v-if="d !== undefined"
          />
        </div>
      </v-btn>
    </template>
  </v-date-picker>
</template>

<script setup lang="ts">
  import { createColorGradient } from '@/plugins/color'
  import { mdiMoonFirstQuarter, mdiMoonFull, mdiMoonLastQuarter, mdiMoonNew, mdiMoonWaningCrescent, mdiMoonWaningGibbous, mdiMoonWaxingCrescent, mdiMoonWaxingGibbous, mdiRefresh, mdiSunAngle, mdiVectorSquareRemove } from '@mdi/js'

  const dateMoonPhases = ref<{ [index: string]: number }>({})
  const moonPhases = ref<string[]>([
    mdiMoonNew,
    mdiMoonWaxingCrescent,
    mdiMoonFirstQuarter,
    mdiMoonWaxingGibbous,
    mdiMoonFull,
    mdiMoonWaningGibbous,
    mdiMoonLastQuarter,
    mdiMoonWaningCrescent,
  ])

  const gradient = ref<string[]>(createColorGradient('#ffffff', '#FFC312', 4))

  function calculateMonthlyMoonPhases (month: number) {
    dateMoonPhases.value = {}

    const today = new Date()
    today.setMonth(month)
    today.setDate(1)

    while (today.getMonth() === month) {
      const day = today.getDate()
      let month = today.getMonth() + 1
      let year = today.getFullYear()

      if (month < 3) {
        year--
        month += 12
      }

      ++month

      const c = 365.25 * year
      const e = 30.6 * month
      // jd is total days elapsed
      let jd = c + e + day - 694_039.09
      // divide by the moon cycle
      jd /= 29.530_588_2
      // jd is total days elapsed
      let b = parseInt(`${jd}`)
      // subtract integer part to leave fractional part of original jd
      jd -= b
      // scale fraction from 0-8 and round
      b = Math.round(jd * 8)

      // 0 and 8 are the same so turn 8 into 0
      if (b >= 8) {
        b = 0
      }

      // @ts-ignore
      dateMoonPhases.value[today.toISOString().split('T')[0]] = b

      today.setDate(today.getDate() + 1)
    }
  }

  onMounted(() => {
    calculateMonthlyMoonPhases(new Date().getMonth())
  })
</script>
