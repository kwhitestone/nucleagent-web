<script setup lang="ts">
import { SUB_APPS } from "@/config";
const app = SUB_APPS.auth;
</script>

<template>
  <micro-app :name="app.name" :url="app.url" inline disableScopecss></micro-app>
</template>
