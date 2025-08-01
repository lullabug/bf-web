<script setup lang="ts">
import axios from 'axios'
import { NInput, NCard, NFlex, NButton, type FormValidationStatus, c } from 'naive-ui'
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const nameOrEmail = ref('')
const password = ref('')

const passwordInputStatus = ref<FormValidationStatus>('success')

const errorMessage = ref<string | null>(null)

const loginButtonDisabled = ref(true)

watch(password, (x) => {
    if (x.length < 8) {
        passwordInputStatus.value = 'warning'
        errorMessage.value = '* Password must be at least 8 characters long.'
    } else {
        passwordInputStatus.value = 'success'
        errorMessage.value = null
    }
})

watch([nameOrEmail, password], ([name, pass]) => {
    if (name.length > 0 && pass.length >= 8) {
        loginButtonDisabled.value = false
    } else {
        loginButtonDisabled.value = true
    }
})

const route = useRoute()
const router = useRouter()

async function handleLogin() {
    try {
        await axios.post('/api/user/verify', {
            nameOrEmail: nameOrEmail.value,
            password: password.value,
        })

        let redirectUrl = route.query.redirectUrl
        if (Array.isArray(redirectUrl)) {
            redirectUrl = redirectUrl[0]
        }
        const redirectPath = redirectUrl || '/'
        router.push(redirectPath)
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            errorMessage.value = error.response.data.message || 'An error occurred during Login.'
        } else {
            errorMessage.value = 'An unexpected error occurred.'
        }
    }
}

function handleSignUp() {
    router.push('/signup')
}
</script>

<template>
    <n-card class="login-card">
        <n-flex vertical align="center">
            <img src="../assets/logo.webp" alt="Logo" class="logo" />
            <n-input placeholder="Name/Email" class="custom-input" v-model:value="nameOrEmail" />
            <n-input
                type="password"
                placeholder="Password"
                show-password-on="click"
                class="custom-input"
                v-model:value="password"
                :status="passwordInputStatus"
            />
            <n-button
                type="primary"
                class="custom-button"
                @click="handleLogin"
                :disabled="loginButtonDisabled"
            >
                Login
            </n-button>
            <n-button type="info" class="custom-button" @click="handleSignUp"> Sign up </n-button>
            <div :v-if="errorMessage">
                <p class="error-message">{{ errorMessage }}</p>
            </div>
        </n-flex>
    </n-card>
</template>

<style lang="css" scoped>
.login-card {
    width: 50vw;
    min-width: 16rem;
    padding: 2rem;
    border-width: 0;
}

.logo {
    width: 50%;
    max-width: 10rem;
    height: auto;
    margin-bottom: 1rem;
}

.custom-input {
    width: 100%;
    min-width: 12rem;
    max-width: 20rem;
}

.custom-button {
    width: 100%;
    min-width: 12rem;
    max-width: 20rem;
}

.error-message {
    color: #e74c3c;
    font-size: 0.75rem;
}
</style>
