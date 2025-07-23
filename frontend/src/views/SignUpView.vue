<script setup lang="ts">
import axios from 'axios'
import { NInput, NAutoComplete, NCard, NFlex, NButton, type FormValidationStatus } from 'naive-ui'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import z from 'zod'

const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const invitationCode = ref('')

const emailSuggestions = computed(() => {
    return ['@gmail.com', '@qq.com', '@outlook.com', '@163.com', '@bandoriee-fans.com'].map(
        (suffix) => {
            const prefix = email.value.split('@')[0]
            return {
                label: prefix + suffix,
                value: prefix + suffix,
            }
        },
    )
})

const emailStatus = computed<FormValidationStatus>(() => {
    if (!email.value) return 'success'
    const rs = z.email().safeParse(email.value)
    return rs.success ? 'success' : 'warning'
})

const passwordInputStatus = computed<FormValidationStatus>(() => {
    if (password.value.length == 0 || password.value.length >= 8) {
        return 'success'
    }
    return 'warning'
})

const confirmPasswordInputStatus = computed<FormValidationStatus>(() => {
    if (confirmPassword.value.length == 0) {
        return 'success'
    }
    if (confirmPassword.value === password.value) {
        return 'success'
    }
    return 'warning'
})

const router = useRouter()

const apiError = ref<string | null>(null)

async function handleSignUp() {
    try {
        await axios.post('/api/user/register', {
            name: name.value,
            email: email.value,
            password: password.value,
            invitationCode: invitationCode.value,
        })
        router.push('/login')
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            if (error.response.status === 409) {
                apiError.value = 'Email or username already exists.'
            } else if (error.response.status === 400) {
                apiError.value = 'Invitation code is invalid.'
            } else if (error.response.status === 500) {
                apiError.value = 'Internal server error. Please try again later.'
            } else {
                apiError.value = error.response.data.message || 'An error occurred during sign up.'
            }
        } else {
            apiError.value = 'An unexpected error occurred.'
        }
    }
}

const signUpDisabled = computed(() => {
    return (
        !name.value ||
        !email.value ||
        emailStatus.value !== 'success' ||
        !password.value ||
        !confirmPassword.value ||
        passwordInputStatus.value !== 'success' ||
        confirmPasswordInputStatus.value !== 'success' ||
        invitationCode.value.trim() === ''
    )
})

const validationError = computed(() => {
    if (name.value) {
        if (name.value.length < 3 || name.value.length > 20) {
            return 'Name must be between 3 and 20 characters long.'
        }
        if (!allowUsernameChar(name.value)) {
            return 'Name can only contain lowercase letters, numbers, and underscores.'
        }
    }
    if (email.value && emailStatus.value !== 'success') {
        return 'Email is not valid.'
    }
    if (password.value && passwordInputStatus.value === 'warning') {
        return 'Password must be at least 8 characters long.'
    }
    if (confirmPassword.value && confirmPasswordInputStatus.value === 'warning') {
        return 'Confirm password does not match.'
    }
    return null
})

const displayError = computed(() => {
    return apiError.value || validationError.value
})

function allowUsernameChar(s: string) {
    if (s === '') return true
    return /^[a-z0-9_]*$/.test(s)
}

const nameStatus = computed(() => {
    if (
        name.value &&
        (!allowUsernameChar(name.value) || name.value.length < 3 || name.value.length > 20)
    ) {
        return 'warning'
    }
    return 'success'
})
</script>

<template>
    <n-card class="login-card">
        <n-flex vertical align="center">
            <img src="../assets/logo.webp" alt="Logo" class="logo" />
            <n-input
                placeholder="Name"
                class="custom-input"
                v-model:value="name"
                :allow-input="allowUsernameChar"
                :status="nameStatus"
            />
            <n-auto-complete
                v-model:value="email"
                :input-props="{
                    autocomplete: 'disabled',
                }"
                :options="emailSuggestions"
                class="custom-input"
                placeholder="Email"
                clearable
                :status="emailStatus"
            />
            <n-input
                type="password"
                placeholder="Password"
                show-password-on="click"
                class="custom-input"
                v-model:value="password"
                :status="passwordInputStatus"
            />
            <n-input
                type="password"
                placeholder="Confirm Password"
                show-password-on="click"
                class="custom-input"
                v-model:value="confirmPassword"
                :status="confirmPasswordInputStatus"
            />
            <n-input
                placeholder="Invitation Code"
                class="custom-input"
                v-model:value="invitationCode"
            />
            <n-button
                class="custom-button"
                @click="handleSignUp"
                type="primary"
                :disabled="signUpDisabled"
            >
                Sign Up
            </n-button>
            <div v-if="displayError">
                <p class="error-message">{{ displayError }}</p>
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
