<script setup lang="ts">
import axios from 'axios'
import { NCard, NDescriptions, NDescriptionsItem, NButton, NFlex } from 'naive-ui'
import { useRouter } from 'vue-router'
interface Props {
    name: string
    email: string
    createdAt: string
    lastLoginAt: string
}

const props = defineProps<Props>()

const router = useRouter()

async function handleLogOut() {
    try {
        const response = await axios.get<{ status: string; redirectPath: string }>(
            '/api/user/logout',
        )
        router.push(response.data.redirectPath)
    } catch (error) {
        console.error('Logout error:', error)
    }
}
</script>

<template>
    <n-card class="profile-card">
        <template #header>
            {{ props.name }}
        </template>
        <n-flex vertical>
            <n-descriptions label-placement="left" :column="1">
                <n-descriptions-item label="Email">
                    {{ props.email }}
                </n-descriptions-item>
                <n-descriptions-item label="Created At">
                    {{ props.createdAt }}
                </n-descriptions-item>
                <n-descriptions-item label="Last Login At">
                    {{ props.lastLoginAt }}
                </n-descriptions-item>
            </n-descriptions>
            <n-button strong block type="error" @click="handleLogOut">Logout</n-button>
        </n-flex>
    </n-card>
</template>

<style lang="css" scoped></style>
