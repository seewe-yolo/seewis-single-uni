<script setup lang="ts">
import FgNavbar from '@/components/fg-navbar/fg-navbar.vue'
// 全局导航栏：所有页面经由此布局渲染。
// 扫码页（pages/material/index）自动隐藏；页面模板中自行渲染 <fg-navbar>（用左右插槽）时同路由自动隐藏。
</script>

<template>
  <FgNavbar global />
  <slot />
</template>
