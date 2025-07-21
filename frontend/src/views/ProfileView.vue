<script setup lang="ts">
import { useRouter } from 'vue-router'
import ProfileCard from '../components/ProfileCard.vue'
import axios from 'axios'
import { onMounted, ref } from 'vue'

const router = useRouter()

interface UserInfo {
    name: string
    email: string
    createdAt: string
    lastLoginAt: string
}

const userInfo = ref<UserInfo | null>(null)

async function getUserInfo() {
    try {
        const response = await axios.get<{
            status: string
            userInfo: UserInfo
        }>('/api/user/info')
        userInfo.value = response.data.userInfo
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.status === 401) {
                router.push('/login')
                return
            }
        }
        console.error('Error fetching user info:', error)
    }
}

onMounted(async () => {
    await getUserInfo()
})
</script>

<template>
    <ProfileCard
        :name="userInfo.name"
        :email="userInfo.email"
        :created-at="userInfo.createdAt"
        :last-login-at="userInfo.lastLoginAt"
        v-if="userInfo"
    />
</template>
