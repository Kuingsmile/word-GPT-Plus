<template>
  <el-dialog v-model="removeVisible" width="90%" :title="$t(title)">
    <el-select
      v-model="removeValue"
      multiple
      filterable
      size="small"
      style="width: 100%"
      placeholder="Select"
    >
      <el-option
        v-for="item in optionList"
        :key="item.value"
        :label="item.key"
        :value="item.key"
      />
    </el-select>
    <template #footer>
      <el-button @click="removeVisible = false">
        {{ $t('cancel') }}
      </el-button>
      <el-button type="primary" @click="handleRemove">
        {{ $t('confirm') }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
defineProps<{
  title: string
  optionList: IStringKeyMap[]
}>()

const removeVisible = defineModel<boolean>('removeVisible')
const removeValue = defineModel<string[]>('removeValue')

const emit = defineEmits(['remove'])

const handleRemove = () => {
  emit('remove')
}
</script>
