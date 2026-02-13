import { Variables } from '@/plugins/types/rpi-weather'
import { mdiChip, mdiGauge, mdiHomePercent, mdiHomeThermometer, mdiSunThermometer, mdiSunWireless, mdiThermometerChevronDown, mdiWaterPercent, mdiWeatherDust, mdiWeatherPouring, mdiWeatherWindy } from '@mdi/js'

export interface VariableConfig {
  title: string
  unit: string
  icon: string
  color: string
  heatmapGradient: (number | string)[][]
}

const VARIABLES: { [index: string]: VariableConfig } = {}
VARIABLES[Variables.ambientTemp] = {
  title: 'variableAmbientTemp',
  unit: 'axisTitleTemperature',
  icon: mdiSunThermometer,
  color: '#eb2f06',
  heatmapGradient: [[0, '#0652DD'], [0.5, 'white'], [1, '#EA2027']],
}
VARIABLES[Variables.groundTemp] = {
  title: 'variableGroundTemp',
  unit: 'axisTitleTemperature',
  icon: mdiThermometerChevronDown,
  color: '#e58e26',
  heatmapGradient: [[0, '#0652DD'], [0.5, 'white'], [1, '#EA2027']],
}
VARIABLES[Variables.rainfall] = {
  title: 'variableRainfall',
  unit: 'axisTitleRainfall',
  icon: mdiWeatherPouring,
  color: '#1e3799',
  heatmapGradient: [[0, 'rgba(255, 255, 255, .2)'], [0.0001, 'white'], [1, '#0652DD']],
}
VARIABLES[Variables.humidity] = {
  title: 'variableHumidity',
  unit: 'axisTitleHumidity',
  icon: mdiWaterPercent,
  color: '#60a3bc',
  heatmapGradient: [[0, 'rgba(255, 255, 255, .2)'], [0.0001, 'white'], [1, '#0652DD']],
}
VARIABLES[Variables.pressure] = {
  title: 'variablePressure',
  unit: 'axisTitlePressure',
  icon: mdiGauge,
  color: '#78e08f',
  heatmapGradient: [[0, 'rgba(255, 255, 255, .2)'], [0.0001, 'white'], [1, '#0652DD']],
}
VARIABLES[Variables.lux] = {
  title: 'variableLux',
  unit: 'axisTitleLux',
  icon: mdiSunWireless,
  color: '#f6b93b',
  heatmapGradient: [[0, 'rgba(255, 255, 255, .2)'], [0.0001, 'white'], [1, '#F79F1F']],
}
VARIABLES[Variables.piTemp] = {
  title: 'variablePiTemp',
  unit: 'axisTitleTemperature',
  icon: mdiChip,
  color: '#b71540',
  heatmapGradient: [[0, '#0652DD'], [0.5, 'white'], [1, '#EA2027']],
}
VARIABLES[Variables.windSpeed] = {
  title: 'variableWindSpeed',
  unit: 'axisTitleWindSpeed',
  icon: mdiWeatherWindy,
  color: '#38ada9',
  heatmapGradient: [[0, 'rgba(255, 255, 255, .2)'], [0.0001, 'white'], [1, '#B53471']],
}
VARIABLES[Variables.windGust] = {
  title: 'variableGustSpeed',
  unit: 'axisTitleWindSpeed',
  icon: mdiWeatherDust,
  color: '#079992',
  heatmapGradient: [[0, 'rgba(255, 255, 255, .2)'], [0.0001, 'white'], [1, '#B53471']],
}
VARIABLES[Variables.loftTemp] = {
  title: 'variableLoftTemp',
  unit: 'axisTitleTemperature',
  icon: mdiHomeThermometer,
  color: '#eb2f06',
  heatmapGradient: [[0, '#0652DD'], [0.5, 'white'], [1, '#EA2027']],
}
VARIABLES[Variables.loftHumidity] = {
  title: 'variableLoftHumidity',
  unit: 'axisTitleHumidity',
  icon: mdiHomePercent,
  color: '#60a3bc',
  heatmapGradient: [[0, 'rgba(255, 255, 255, .2)'], [0.0001, 'white'], [1, '#0652DD']],
}

const CHART_COLORS = ['#EA2027', '#EE5A24', '#F79F1F', '#FFC312', '#C4E538', '#A3CB38', '#009432', '#006266', '#1B1464', '#0652DD', '#1289A7', '#12CBC4']

export {
  VARIABLES,
  CHART_COLORS,
}
