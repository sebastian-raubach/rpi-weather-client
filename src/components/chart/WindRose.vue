<template>
  <div ref="windChart" />
</template>

<script>
import RangeMap from '@/plugin/rangemap'

export default {
  props: {
    data: {
      type: Array,
      default: () => []
    },
    windType: {
      type: String,
      default: 'windSpeed'
    }
  },
  data: function () {
    return {
      wd: ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'],
      windDirections: new RangeMap([
        { min: 337.5, max: 22.5, value: 'N', mode: 'invert' },
        { min: 22.5, max: 67.5, value: 'NE' },
        { min: 67.5, max: 112.5, value: 'E' },
        { min: 112.5, max: 157.5, value: 'SE' },
        { min: 157.5, max: 202.5, value: 'S' },
        { min: 202.5, max: 247.5, value: 'SW' },
        { min: 247.5, max: 292.5, value: 'W' },
        { min: 292.5, max: 337.5, value: 'NW' }
      ]),
      windCategories: new RangeMap([
        { min: 0, max: 1, value: { name: 'Calm', color: '#E3F2FD' } },
        { min: 1, max: 6, value: { name: 'Light Air', color: '#BBDEFB' } },
        { min: 6, max: 12, value: { name: 'Light Breeze', color: '#90CAF9' } },
        { min: 12, max: 20, value: { name: 'Gentle Breeze', color: '#64B5F6' } },
        { min: 20, max: 30, value: { name: 'Moderate Breeze', color: '#42A5F5' } },
        { min: 30, max: 40, value: { name: 'Fresh Breeze', color: '#2196F3' } },
        { min: 40, max: 50, value: { name: 'Strong Breeze', color: '#1E88E5' } },
        { min: 50, max: 62, value: { name: 'Near Gale', color: '#1976D2' } },
        { min: 62, max: 75, value: { name: 'Gale', color: '#1565C0' } },
        { min: 75, max: 89, value: { name: 'Strong Gale', color: '#0D47A1' } },
        { min: 89, max: 103, value: { name: 'Storm', color: '#D32F2F' } },
        { min: 103, max: 118, value: { name: 'Violent Storm', color: '#C62828' } },
        { min: 118, max: Number.MAX_SAFE_INTEGER, value: { name: 'Hurricane', color: '#B71C1C' } }
      ])
    }
  },
  watch: {
    data: function () {
      this.$nextTick(() => {
        this.update()
      })
    }
  },
  methods: {
    update: function () {
      const div = this.$refs.windChart

      if (div) {
        this.$plotly.purge(div)
      }

      if (this.data && this.data.length > 0) {
        const counts = this.windCategories.ranges.map(r => { return { name: r.value.name, color: r.value.color, counts: this.wd.map(_ => 0), total: 0 } })

        this.data.filter(d => d.windAverage !== undefined && d.windAverage !== null && d[this.windType] !== undefined && d[this.windType] !== null)
          .forEach(d => {
            const speed = d[this.windType]
            const direction = d.windAverage

            const speedCategory = this.windCategories.getValue(speed).name
            const directionCategory = this.windDirections.getValue(direction)

            const counter = counts.find(c => c.name === speedCategory)

            if (counter) {
              counter.counts[this.wd.indexOf(directionCategory)]++
              counter.total++
            }
          })

        const winds = this.data.filter(d => d.windAverage !== undefined && d.windAverage !== null && d[this.windType] !== undefined && d[this.windType] !== null)

        if (winds.length > 0) {
          this.$emit('current-wind-direction', this.windDirections.getValue(winds[winds.length - 1].windAverage))
        }

        const data = counts.filter(c => c.total > 0).map(c => {
          return {
            r: c.counts,
            theta: this.wd,
            name: c.name,
            marker: {
              color: c.color
            },
            type: 'barpolar'
          }
        })

        const layout = {
          height: 600,
          margin: { autoexpand: true },
          dragmode: false,
          autosize: true,
          paper_bgcolor: '#4e5d6c',
          plot_bgcolor: 'rgba(1.0, 1.0, 1.0, 0.1)',
          legend: { font: { color: 'white' }, orientation: 'h' },
          polar: {
            bgcolor: 'rgba(1.0, 1.0, 1.0, 0.1)',
            radialaxis: { visible: false },
            angularaxis: {
              direction: 'clockwise',
              tickfont: { color: 'white' }
            }
          },
          font: { size: 16 },
          orientation: 270
        }

        const config = {
          displayModeBar: false,
          responsive: true,
          displaylogo: false
        }

        this.$plotly.newPlot(div, data, layout, config)
      }
    }
  },
  mounted: function () {
    this.update()
  }
}
</script>

<style>

</style>
