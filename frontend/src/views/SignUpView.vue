<script setup lang="ts">
import axios from 'axios'
import {
    NConfigProvider,
    NInput,
    NCard,
    NFlex,
    NButton,
    type GlobalThemeOverrides,
    type FormValidationStatus,
} from 'naive-ui'
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'

const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const invitationCode = ref('')

const themeOverride: GlobalThemeOverrides = {
    Input: {
        textColor: 'var(--color-heading)',
        color: 'var(--color-background-soft)',
        colorFocus: 'var(--color-background-soft)',
        border: '1px solid var(--color-border)',
        borderHover: '1px solid var(--color-border-hover)',
        borderFocus: '1px solid var(--color-heading)',
        placeholderColor: 'var(--color-text)',
        caretColor: 'var(--color-heading)',
        colorFocusWarning: 'var(--color-background-soft)',
        colorFocusError: 'var(--color-background-soft)',
    },
    Button: {
        color: 'var(--color-background-soft)',
        textColor: 'var(--color-text)',
        textColorHover: 'var(--color-heading)',
        border: '1px solid var(--color-border)',
        borderHover: '1px solid var(--color-border-hover)',
        borderFocus: '1px solid var(--color-heading)',
    },
    Card: {
        color: 'rgb(from var(--color-background-soft) r g b / 0.5)',
    },
}

const passwordInputStatus = ref<FormValidationStatus>('success')
const confirmPasswordInputStatus = ref<FormValidationStatus>('success')

const errorMessage = ref<string | null>(null)

watch([password, confirmPassword], ([password, confirm]) => {
    if (password.length >= 8) {
        passwordInputStatus.value = 'success'
        if (confirm === password) {
            confirmPasswordInputStatus.value = 'success'
            errorMessage.value = null
        } else {
            confirmPasswordInputStatus.value = 'warning'
            errorMessage.value = 'Confirm password does not match.'
        }
    } else {
        passwordInputStatus.value = 'warning'
        errorMessage.value = 'Password must be at least 8 characters long.'
    }
})

const router = useRouter()

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
                errorMessage.value = 'Email or username already exists.'
            } else if (error.response.status === 400) {
                errorMessage.value = 'Invitation code is invalid.'
            } else if (error.response.status === 500) {
                errorMessage.value = 'Internal server error. Please try again later.'
            } else {
                errorMessage.value =
                    error.response.data.message || 'An error occurred during sign up.'
            }
        } else {
            errorMessage.value = 'An unexpected error occurred.'
        }
    }
}

const signUpDisabled = ref(true)
watch([name, email, password, confirmPassword], () => {
    signUpDisabled.value =
        !name.value ||
        !email.value ||
        !password.value ||
        !confirmPassword.value ||
        password.value !== confirmPassword.value ||
        passwordInputStatus.value === 'warning'
})
</script>

<template>
    <n-config-provider :theme-overrides="themeOverride">
        <n-card class="login-card">
            <n-flex vertical align="center">
                <img src="../assets/logo.webp" alt="Logo" class="logo" />
                <n-input placeholder="Name" class="custom-input" v-model:value="name" />
                <n-input placeholder="Email" class="custom-input" v-model:value="email" />
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
                <div :v-if="errorMessage">
                    <p class="error-message">{{ errorMessage }}</p>
                </div>
            </n-flex>
        </n-card>
    </n-config-provider>
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
