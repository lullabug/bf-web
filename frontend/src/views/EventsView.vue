<script setup lang="ts">
import RecentEvents from '@/components/eventsPage/RecentEvents.vue'
import { NCollapse, NCollapseItem, NFlex } from 'naive-ui'
import Szbo120250302 from './events/Szbo1-20250302.vue'
import EventCard from '@/components/eventsPage/EventCard.vue'
import { useRoute } from 'vue-router'

const baseUrl = import.meta.env.VITE_ASSETS_BASE_URL as string

const route = useRoute()

interface EventCardItem {
    imgUrl: string
    targetPath: string
    title: string
}

const pastEventCards: EventCardItem[] = [
    {
        imgUrl: baseUrl + '/events/szbo1-20250302/cover.webp',
        targetPath: '/events/szbo1-20250302',
        title: '深圳 BanG Dream Only Live 1st',
    },
]
</script>

<template>
    <n-collapse
        :style="{ width: '80vw', maxWidth: '48rem' }"
        :default-expanded-names="['clubFuture']"
        v-if="route.path === '/events'"
    >
        <n-collapse-item title="未来活动" name="clubFuture"> </n-collapse-item>
        <n-collapse-item title="往期活动" name="clubPast">
            <EventCard
                v-for="x in pastEventCards"
                :img-url="x.imgUrl"
                :target-path="x.targetPath"
                :key="x.targetPath"
            >
                <template #title>{{ x.title }}</template>
            </EventCard></n-collapse-item
        >
        <n-collapse-item title="偶活（自用）" name="chikaIdol"> <RecentEvents /> </n-collapse-item>
    </n-collapse>
    <RouterView v-else />
</template>

<style scoped></style>
