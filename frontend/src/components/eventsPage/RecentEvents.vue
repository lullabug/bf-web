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

function handleFilterChanged(newFilters: { tag: string; tagType: string }[]) {
    filters.value = newFilters
}

onMounted(async () => {
    chikaIdolEvents.value = await fetchChikaIdolEvents()
})
</script>

<template>
    <n-flex vertical>
        <Filter @filter-changed="handleFilterChanged" />
        <EventsTable :events="chikaIdolEvents" :filters="filters" />
    </n-flex>
</template>

<style scoped></style>
