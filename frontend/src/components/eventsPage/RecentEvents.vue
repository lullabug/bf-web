<script setup lang="ts">
import { NCollapse, NCollapseItem, NFlex } from 'naive-ui'

import Filter from './Filter.vue'
import EventsTable from './EventsTable.vue'
import { onMounted, ref } from 'vue'
import axios from 'axios'
import { parse } from 'date-fns'

const filters = ref<{ tag: string; tagType: string }[]>([])

async function fetchChikaIdolEvents() {
    try {
        const response = await axios.get<{
            status: string
            events: { name: string; location: string; eventDate: string; series: string }[]
        }>('/api/events/chika_idol', {
            params: {
                limit: 100,
            },
        })
        const rs = response.data.events.map((event) => {
            const date = parse(event.eventDate, 'yyyy-MM-dd', new Date())
            return {
                label: event.name,
                date,
                location: event.location,
            }
        })
        return rs
    } catch (error) {
        return []
    }
}

const chikaIdolEvents = ref<
    {
        label: string
        date: Date
        location: string
    }[]
>([])

const testData = [
    {
        label: '惑星 VORTEX Oneman Tour 2025「LION HEART」Tour Final & 小船 Chiyori 生诞 special',
        date: new Date(2025, 6, 26),
        location: '上海',
    },
    {
        label: 'IDOL ALL STAR FESTIVAL Vol.1',
        date: new Date(2025, 7, 15),
        location: '澳门',
    },
    {
        label: 'IDOL ALL STAR FESTIVAL Vol.1',
        date: new Date(2025, 7, 16),
        location: '澳门',
    },
    {
        label: 'IDOL ALL STAR FESTIVAL Vol.1',
        date: new Date(2025, 7, 17),
        location: '澳门',
    },
]

function handleFilterChanged(newFilters: { tag: string; tagType: string }[]) {
    filters.value = newFilters
}

onMounted(async () => {
    chikaIdolEvents.value = await fetchChikaIdolEvents()
})
</script>

<template>
    <n-collapse
        :style="{ width: '80vw', maxWidth: '48rem' }"
        :default-expanded-names="['chikaIdol']"
    >
        <n-collapse-item title="偶活" name="chikaIdol">
            <n-flex vertical>
                <Filter @filter-changed="handleFilterChanged" />
                <EventsTable :events="chikaIdolEvents" :filters="filters" />
            </n-flex>
        </n-collapse-item>
    </n-collapse>
</template>

<style scoped></style>
