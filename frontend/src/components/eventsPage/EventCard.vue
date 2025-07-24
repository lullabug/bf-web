<script setup lang="ts">
import { NCard, NFlex } from 'naive-ui'
import { useRouter } from 'vue-router'

interface Props {
    imgUrl: string
    targetPath: string
}
const props = defineProps<Props>()

const router = useRouter()
</script>

<template>
    <n-card class="event-card" hoverable @click="router.push(targetPath)">
        <n-flex vertical>
            <img :src="props.imgUrl" />
            <div class="event-card-title"><slot name="title"></slot></div> </n-flex
    ></n-card>
</template>

<style scoped>
.event-card {
    width: 100%;
    max-width: 24rem;
}

.event-card-title {
    font-size: 1.2rem;
    font-weight: bold;
    margin-top: 0.5rem;
    color: var(--color-heading);
}
</style>
