<script setup lang="ts">
import { NCard } from 'naive-ui'
import EventDetail from '@/components/eventsPage/EventDetail.vue'

const baseUrl = import.meta.env.VITE_ASSETS_BASE_URL as string
const imgUrls = [
    baseUrl + '/events/szbo1-20250302/cover.webp',
    baseUrl + '/events/szbo1-20250302/0.webp',
    baseUrl + '/events/szbo1-20250302/1.webp',
    baseUrl + '/events/szbo1-20250302/2.webp',
    baseUrl + '/events/szbo1-20250302/3.webp',
    baseUrl + '/events/szbo1-20250302/4.webp',
    baseUrl + '/events/szbo1-20250302/5.webp',
    baseUrl + '/events/szbo1-20250302/6.webp',
    baseUrl + '/events/szbo1-20250302/7.webp',
    baseUrl + '/events/szbo1-20250302/8.webp',
    baseUrl + '/events/szbo1-20250302/10.webp',
]
</script>

<template>
    <EventDetail :img-urls="imgUrls">
        <template #title>深圳 BanG Dream Only Live 1st</template>
        <n-card>
            <p>感谢各位的参与😋</p>
        </n-card>
    </EventDetail>
</template>
