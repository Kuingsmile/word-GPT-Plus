<template>
  <el-form-item>
    <template #label>
      <span>
        {{ $t(label) }}
      </span>
    </template>
    <el-input-number
      v-if="stepStyle === 'temperature'"
      v-model="value"
      :min="0"
      :max="2"
      :step="0.1"
      size="small"
    />
    <el-input-number
      v-else-if="stepStyle === 'maxTokens'"
      v-model="value"
      :min="1"
      :step="1"
      size="small"
    />
  </el-form-item>
</template>

<script lang="ts" setup>
defineProps<{
  stepStyle: 'temperature' | 'maxTokens' | undefined
  label: string
}>()

const value = defineModel<number>()
</script>
