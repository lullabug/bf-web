<script setup lang="ts">
import { NFlex, NDivider } from 'naive-ui'
</script>

<template>
    <n-flex vertical>
        <h1>Shenzhen BanG Dream! Club</h1>
        <h2>BY FANS, FOR FANS</h2>
        <n-divider />
        <h3>Contact Us</h3>
        <p>Have a question or suggestion? We're here to help!</p>
        <ul>
            <li>QQ Group: <a href="https://qm.qq.com/q/RUV7wfI5eQ">934594049</a></li>
            <li>
                Email: <a href="mailto:lullabug@bandoriee-fans.com">lullabug@bandoriee-fans.com</a>
            </li>
        </ul>
        <h3>Repository</h3>
        <n-flex align="center">
            <a href="https://github.com/lullabug/bf-web" class="repository-link"
                ><img
                    src="https://img.shields.io/badge/Repository-bf--web-4FC08D?style=flat&logo=github"
            /></a>
            <a href="https://github.com/lullabug/bf-web/blob/main/LICENSE" class="repository-link"
                ><img
                    src="https://img.shields.io/github/license/lullabug/bf-web.svg?style=flat&logo=github"
            /></a>
        </n-flex>
    </n-flex>
</template>

<style scoped>
.repository-link:hover {
    background-color: transparent;
}
</style>
