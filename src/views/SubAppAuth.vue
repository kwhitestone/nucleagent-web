<script setup lang="ts">
import { SUB_APPS } from "@/config";
const app = SUB_APPS.auth;
</script>

<template>
  <iframe :src="app.url" class="subapp-iframe" title="账户" />
</template>

<style scoped>
.subapp-iframe {
  width: 100%;
  height: 100%;
  border: none;
  display: block;
}
</style>
