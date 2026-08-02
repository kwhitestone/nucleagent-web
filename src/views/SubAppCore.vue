<script setup lang="ts">
import { SUB_APPS } from "@/config";
const app = SUB_APPS.core;
</script>

<template>
  <iframe :src="app.url" class="subapp-iframe" title="工作台" />
</template>

<style scoped>
.subapp-iframe {
  width: 100%;
  height: 100%;
  border: none;
  display: block;
}
</style>
