<script setup lang="ts">
import { NButton, NCard, NInput, NFlex, NSelect } from 'naive-ui'
import type { SelectMixedOption } from 'naive-ui/es/select/src/interface'
import { computed, ref } from 'vue'

interface Props {
    showAddFilter: boolean
    options: SelectMixedOption[]
}

defineProps<Props>()

const emit = defineEmits(['submit'])

const filterTypeValue = ref<string | null>(null)
const filterValue = ref('')

const submitDisable = computed(() => {
    return !filterTypeValue.value || !filterValue.value
})

function handleSubmit() {
    emit('submit', {
        type: filterTypeValue.value,
        value: filterValue.value,
    })
}
</script>

<template>
    <Transition name="add-filter-transition">
        <n-card class="add-filter-card" align="center" v-if="showAddFilter">
            <n-flex
                ><n-select
                    class="add-filter-select"
                    placeholder="Filter Type"
                    :options="options"
                    v-model:value="filterTypeValue"
                ></n-select
                ><n-input
                    class="add-filter-input"
                    placeholder="Filter Value"
                    v-model:value="filterValue"
                    clearable
                ></n-input>
                <n-button type="primary" :disabled="submitDisable" @click="handleSubmit"
                    >Submit</n-button
                ></n-flex
            ></n-card
        >
    </Transition>
</template>

<style lang="css" scoped>
.add-filter-select {
    width: 8rem;
}
.add-filter-input {
    width: 20rem;
}
.add-filter-transition-enter-active,
.add-filter-transition-leave-active {
    transition:
        max-height 0.5s ease-in-out,
        opacity 0.3s ease;
    overflow: hidden;
}

.add-filter-transition-enter-from,
.add-filter-transition-leave-to {
    max-height: 0;
    opacity: 0;
}

.add-filter-transition-enter-to,
.add-filter-transition-leave-from {
    max-height: 10vh;
    opacity: 1;
}
</style>
