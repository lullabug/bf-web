<script setup lang="ts">
import { NCarousel, NDivider, NFlex } from 'naive-ui'

interface Props {
    imgUrls: string[]
}

const props = defineProps<Props>()
</script>

<template>
    <n-flex vertical align="center">
        <h1><slot name="title"></slot></h1>
        <n-divider />
        <n-carousel autoplay show-arrow class="event-carousel" trigger="hover" dot-type="line">
            <img v-for="url in props.imgUrls" :src="url" :key="url" class="event-img" />
        </n-carousel>
        <slot></slot>
    </n-flex>
</template>

<style lang="css" scoped>
.event-carousel {
    width: 50vw;
    height: auto;
}

.event-img {
    width: 100%;
    height: auto;
}
</style>
