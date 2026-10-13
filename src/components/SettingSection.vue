<template>
  <div class="h-full w-full rounded-lg bg-bg-secondary p-0">
    <div class="mb-2 flex items-start gap-2">
      <div
        v-if="icon"
        class="mb-2 flex h-7.5 w-7.5 shrink-0 items-center justify-center rounded-lg bg-accent text-white"
      >
        <slot name="icon">
          <component :is="icon" :size="iconSize" />
        </slot>
      </div>
      <div>
        <slot name="title"
          ><h2 class="text-lg font-semibold text-main">{{ title }}</h2></slot
        >
        <slot name="description">
          <p v-if="description !== ''" class="mb-6 text-sm text-secondary">
            {{ description }}
          </p>
        </slot>
      </div>
    </div>

    <div :class="onlyOneRow ? 'grid grid-cols-1 gap-2' : 'grid grid-cols-2 gap-2 max-md:grid-cols-1'">
      <slot />
    </div>
    <slot name="extra"></slot>
  </div>
</template>

<script setup lang="ts">
import type { Component } from 'vue'
const {
  title = '',
  description = '',
  icon = null,
  iconSize = 20,
  onlyOneRow = false,
} = defineProps<{
  title?: string
  description?: string
  icon?: Component | null
  iconSize?: number
  onlyOneRow?: boolean
}>()
</script>
