<template>
  <v-dialog v-model="dialog" :max-width="`min(90vw, ${internalWidth || 400}px)`">
    <v-card>
      <v-toolbar dark dense flat>
        <v-toolbar-title class="white--text">{{ internalTitle }}</v-toolbar-title>
      </v-toolbar>
      <v-card-text v-show="!!internalMessage" class="pa-4"><span v-html="internalMessage" /></v-card-text>

      <v-text-field v-model="input" />

      <v-card-actions class="pt-0">
        <v-spacer />
        <v-btn color="grey" text @click="emitCancel" v-if="!internalOkOnly">{{ internalCancelTitle }}</v-btn>
        <v-btn :disabled="!canContinue" :color="internalOkVariant" text @click="emitOk">{{ internalOkTitle }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
  import emitter from 'tiny-emitter/instance'
  import { useI18n } from 'vue-i18n'

  export type InputModalCallback = (value: string | undefined) => void

  const { t } = useI18n()

  const dialog = ref(false)
  const internalTitle = ref('')
  const internalMessage = ref('')
  const internalOkTitle = ref()
  const internalCancelTitle = ref()
  const internalCancelVariant = ref('secondary')
  const internalOkVariant = ref('primary')
  const internalOkOnly = ref(false)
  const internalWidth = ref(400)
  const callback = ref<InputModalCallback>()
  const input = ref<string>()

  const canContinue = computed(() => input.value !== undefined && input.value.trim().length > 0)

  function show (params: any) {
    internalTitle.value = params.title || ''
    internalMessage.value = params.message || ''
    internalOkTitle.value = params.okTitle || t('buttonOk')
    internalCancelTitle.value = params.cancelTitle || t('buttonCancel')
    internalOkVariant.value = params.okVariant || 'primary'
    internalCancelVariant.value = params.cancelVariant || 'secondary'
    internalOkOnly.value = params.okOnly || false
    callback.value = params.callback
    internalWidth.value = params.width || 400

    dialog.value = true
  }

  function hide () {
    dialog.value = false
  }

  function emitOk () {
    if (callback.value) {
      callback.value(input.value)
    }
    hide()
  }
  function emitCancel () {
    if (callback.value) {
      callback.value(undefined)
    }
    hide()
  }

  onBeforeMount(() => emitter.on('show-input', show))
  onBeforeUnmount(() => emitter.off('show-input', show))
</script>

<style>

</style>
