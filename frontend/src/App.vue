<script setup lang="ts">
import { RouterView } from 'vue-router'

import { NDivider, NFlex } from 'naive-ui'

import Nav from '@/components/NavBar.vue'
</script>

<template>
    <n-flex justify="center">
        <Nav></Nav>
        <n-divider style="--n-color: var(--color-background-soft); width: 90vw" />
        <RouterView />
    </n-flex>
</template>

<style scoped></style>
