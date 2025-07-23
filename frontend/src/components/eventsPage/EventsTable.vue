<script setup lang="ts">
import { computed } from 'vue'
import { NButton, NCard, NDataTable, NFlex, useMessage } from 'naive-ui'
import { format } from 'date-fns'

interface EventsMetadata {
    label: string
    date: Date
    location: string
}

function createRowKey(event: EventsMetadata): string {
    return `${event.label}-${event.location}-${event.date.toISOString()}`
}

interface Filter {
    tag: string
    tagType: string
}

interface Props {
    events: EventsMetadata[]
    filters: Filter[]
}

const props = defineProps<Props>()

const displayEvents = computed(() => {
    let rs = props.events
    if (props.filters.length > 0) {
        rs = rs.filter((event) => {
            return props.filters.every((filter) => {
                if (filter.tagType === 'label') {
                    return event.label.includes(filter.tag)
                } else if (filter.tagType === 'location') {
                    return event.location.includes(filter.tag)
                }
                return true
            })
        })
    }
    return rs.map((event) => {
        const key = createRowKey(event)
        return {
            ...event,
            key,
        }
    })
})

const todayDate = format(new Date(), 'yyyy-MM-dd')
const todayEvents = computed(() => {
    return displayEvents.value.filter((event) => format(event.date, 'yyyy-MM-dd') === todayDate)
})
const upcomingEvents = computed(() => {
    return displayEvents.value
        .filter((event) => format(event.date, 'yyyy-MM-dd') > todayDate)
        .sort((a, b) => a.date.getTime() - b.date.getTime())
})

const columns = [
    {
        title: 'Label',
        key: 'label',
        render(row: EventsMetadata) {
            return row.label
        },
        ellipsis: {
            tooltip: true,
        },
        minWidth: '20vw',
        maxWidth: '20rem',
    },
    {
        title: 'Date',
        key: 'date',
        minWidth: '10vw',
        render(row: EventsMetadata) {
            return format(row.date, 'yyyy-MM-dd')
        },
        sorter: (a: EventsMetadata, b: EventsMetadata) => b.date.getTime() - a.date.getTime(),
    },
    {
        title: 'Location',
        key: 'location',
        minWidth: '10vw',
        render(row: EventsMetadata) {
            return row.location
        },
    },
]

const turtleQuote = [
    '她不一样',
    '宝宝可爱捏',
    '我是强男',
    '我有一个朋友，不知道是不是性压抑了对着一张相纸喊老婆，聊天还要花钱，还幻想她金盆洗手了和自己结婚',
    '我一定是真心的，不会虚假，我明白你的真心，我爱你',
    '宝宝我失业金到账了终于可以切你了',
    '我不会再给任何一个女人花钱了',
    '但是她太可爱了',
    '我是最理智的',
    '没救了',
    '但话又说回来了',
    '她对我不一样',
    '我这次真的不一样',
]

function randomTurtleQuote() {
    return turtleQuote[Math.floor(Math.random() * turtleQuote.length)]
}

const message = useMessage()

function handleTodayButtonClick() {
    message.info(randomTurtleQuote(), {
        closable: true,
        keepAliveOnHover: true,
        duration: 3000,
    })
}
</script>

<template>
    <n-card title="Today's Events">
        <n-data-table
            :columns="columns"
            :data="todayEvents"
            :pagination="{ pageSize: 10 }"
            v-if="todayEvents.length > 0"
        />
        <div v-else>
            <n-flex vertical align="center"
                ><h1 class="today-event-empty-text">今日得个静字，乜嘢节目都冇</h1>
                <n-button type="primary" @click="handleTodayButtonClick">想了</n-button></n-flex
            >
        </div>
    </n-card>
    <n-data-table :columns="columns" :data="upcomingEvents" :pagination="{ pageSize: 10 }" />
</template>

<style lang="css" scoped>
.today-event-empty-text {
    color: var(--color-heading);
}
</style>
