<script setup lang="ts">
import { SUB_APPS } from "@/config";
const app = SUB_APPS.core;
</script>

<template>
  <!-- micro-app 标签加载 core 子应用（工作台/对话），name 必须全局唯一 -->
  <micro-app :name="app.name" :url="app.url" inline disableScopecss></micro-app>
</template>
