<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="flex justify-between p-1">
    <dt class="font-bold me-1">
      <slot name="label"></slot>
    </dt>

    <dd class="text-gray-900">
      <slot></slot>
    </dd>
  </div>
</template>
