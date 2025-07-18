<script setup lang="ts">
import { NButton, NFlex } from 'naive-ui'
</script>

<template>
    <n-flex align="center" justify="space-between" class="nav">
        <RouterLink to="/" custom v-slot="{ href, navigate }">
            <n-button quaternary class="nav-button" :herf="href" @click="navigate">HOME</n-button>
        </RouterLink>
        <RouterLink to="/events" custom v-slot="{ href, navigate }">
            <n-button quaternary class="nav-button" :herf="href" @click="navigate">EVENTS</n-button>
        </RouterLink>
        <RouterLink to="/about" custom v-slot="{ href, navigate }">
            <n-button quaternary class="nav-button" :herf="href" @click="navigate">ABOUT</n-button>
        </RouterLink>
        <RouterLink to="/profile" custom v-slot="{ href, navigate }">
            <n-button quaternary class="nav-button" :herf="href" @click="navigate"
                >PROFILE</n-button
            >
        </RouterLink>
    </n-flex>
</template>

<style lang="css" scoped>
.nav {
    margin-top: 1rem;
    padding: 1rem;
}

.nav-button * {
    color: var(--color-heading);
    font-size: 1rem;
    font-family: 'Fira Sans', sans-serif;
}

.nav-button:hover {
    color: var(--color-heading);
    background-color: var(--color-border-hover);
}
</style>
