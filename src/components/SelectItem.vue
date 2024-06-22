<template>
  <el-form-item>
    <template #label>
      <span>
        {{ $t(label) }}
      </span>
    </template>
    <el-select
      v-model="value"
      size="small"
      :placeholder="$t(placeholder)"
      @change="handleSelectChange"
    >
      <el-option
        v-for="item in optionList"
        :key="item.value"
        :label="item.label"
        :value="item.value"
      >
      </el-option>
    </el-select>
  </el-form-item>
</template>

<script lang="ts" setup>
defineProps<{
  label: string
  placeholder: string
  optionList: Array<{ label: string; value: string }> | undefined
}>()

const value = defineModel<string>()

const emit = defineEmits(['change'])

const handleSelectChange = (value: string) => {
  emit('change', value)
}
</script>
