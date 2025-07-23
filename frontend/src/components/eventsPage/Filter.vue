<script setup lang="ts">
import { NButton, NCard, NFlex, NTag, useMessage, type MessageOptions } from 'naive-ui'
import { computed, ref, watch } from 'vue'
import { AddBoxRound as AddIcon } from '@vicons/material'

import AddFilter from './AddFilter.vue'

enum FilterType {
    Location = 'location',
}

interface FilterConfig {
    label: string
    color: string
}

const FILTER_CONFIG: ReadonlyMap<string, FilterConfig> = new Map([
    [
        FilterType.Location,
        {
            label: 'Location',
            color: '#16a085',
        },
    ],
])

interface TagMetadata {
    tagType: FilterType
}

const activeFilters = ref<Map<string, TagMetadata>>(new Map())

const options = computed(() => {
    return Array.from(FILTER_CONFIG.entries()).map(([key, config]) => ({
        label: config.label,
        value: key,
    }))
})

const showAddFilter = ref(false)
const addFilterButtonText = computed(() => {
    return showAddFilter.value ? 'Collapse' : 'Add Filter'
})

function toggleAddFilter() {
    showAddFilter.value = !showAddFilter.value
}

const message = useMessage()
const messageConfig: MessageOptions = {
    duration: 5000,
    closable: true,
}

function handleFilterSubmit(v: { type: string; value: string }) {
    if (activeFilters.value.has(v.value)) {
        message.warning(`Filter already exists: ${v.value}`, messageConfig)
        return
    }
    if (!FILTER_CONFIG.has(v.type)) {
        message.error(`Invalid filter type: ${v.type}`, messageConfig)
        return
    }
    activeFilters.value.set(v.value, {
        tagType: v.type as FilterType,
    })
}

const emit = defineEmits(['filterChanged'])

interface EmitResult {
    tag: string
    tagType: string
}

watch(
    activeFilters,
    (newTags) => {
        const rs: EmitResult[] = Array.from(newTags.entries()).map(([tag, metadata]) => ({
            tag,
            tagType: metadata.tagType,
        }))
        emit('filterChanged', rs)
    },
    { deep: true },
)
</script>

<template>
    <n-flex vertical justify="center">
        <n-card align="center">
            <n-flex :style="{ marginBottom: '1rem' }">
                <n-button size="large" ghost color="#1abc9c" @click="toggleAddFilter"
                    ><template #icon> <AddIcon /> </template>{{ addFilterButtonText }}</n-button
                >
            </n-flex>
            <n-flex>
                <n-tag
                    v-for="[key, metadata] in activeFilters"
                    :key="key"
                    closable
                    @close="activeFilters.delete(key)"
                    :color="{
                        color: 'var(--color-background)',
                        textColor:
                            FILTER_CONFIG.get(metadata.tagType)?.color || 'var(--color-text)',
                        borderColor:
                            FILTER_CONFIG.get(metadata.tagType)?.color || 'var(--color-text)',
                    }"
                    >{{ key }}</n-tag
                >
            </n-flex>
        </n-card>

        <AddFilter
            :show-add-filter="showAddFilter"
            :options="options"
            @submit="handleFilterSubmit"
        />
    </n-flex>
</template>
