<template>
  <el-form-item>
    <template #label>
      <span>
        {{ $t(label) }}
      </span>
    </template>
    <el-input v-model="value" size="small" :placeholder="$t(placeholder)" />
  </el-form-item>
</template>

<script lang="ts" setup>
defineProps<{
  label: string
  placeholder: string
}>()

const value = defineModel<string>()
</script>
