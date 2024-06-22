<template>
  <el-dialog v-model="addVisible" width="90%" :title="$t(title)">
    <el-form label-position="top" label-width="50px">
      <el-form-item>
        <template #label>
          <span>{{ $t(aliasLabel) }}</span>
        </template>
        <el-input
          v-model="addAlias"
          clearable
          size="small"
          :placeholder="$t(aliasPlaceholder)"
        />
      </el-form-item>
      <el-form-item>
        <template #label>
          <span>{{ $t(promptLabel) }}</span>
        </template>
        <el-input
          v-model="addValue"
          clearable
          type="textarea"
          size="small"
          :placeholder="$t(promptPlaceholder)"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="addVisible = false">
        {{ $t('cancel') }}
      </el-button>
      <el-button type="primary" @click="handleAdd">
        {{ $t('confirm') }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
defineProps<{
  title: string
  aliasLabel: string
  aliasPlaceholder: string
  promptLabel: string
  promptPlaceholder: string
}>()

const addVisible = defineModel<boolean>('addVisible')
const addAlias = defineModel<string>('addAlias')
const addValue = defineModel<string>('addValue')

const emit = defineEmits(['add'])

const handleAdd = () => {
  emit('add')
}
</script>
