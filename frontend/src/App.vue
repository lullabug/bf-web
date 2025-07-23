<script setup lang="ts">
import { RouterView } from 'vue-router'

import {
    NConfigProvider,
    NDivider,
    NFlex,
    NMessageProvider,
    type GlobalThemeOverrides,
} from 'naive-ui'

import Nav from '@/components/NavBar.vue'

const themeOverride: GlobalThemeOverrides = {
    AutoComplete: {
        peers: {
            InternalSelectMenu: {
                color: 'var(--color-background-soft)',
                optionColorPending: '#34495e',
                optionTextColor: 'var(--color-text)',
            },
        },
    },
    Button: {
        color: 'var(--color-background-soft)',
        textColor: 'var(--color-text)',
        textColorHover: 'var(--color-heading)',
        border: '1px solid var(--color-border)',
        borderHover: '1px solid var(--color-border-hover)',
        borderFocus: '1px solid var(--color-heading)',
    },
    Collapse: {
        titleTextColor: 'var(--color-heading)',
        borderColor: 'var(--color-border)',
        textColor: 'var(--color-text)',
        arrowColor: 'var(--color-heading)',
    },
    Card: {
        color: 'var(--color-background-soft)',
        titleTextColor: 'var(--color-heading)',
        borderColor: 'var(--color-border)',
    },
    DataTable: {
        thColor: 'var(--color-background-soft)',
        thTextColor: 'var(--color-heading)',
        thColorHover: 'var(--color-background-mute)',
        thColorSorting: 'var(--color-background-mute)',
        thTextColorSorting: 'var(--color-heading)',

        tdColor: 'var(--color-background)',
        tdTextColor: 'var(--color-text)',
        tdColorHover: 'var(--color-background-mute)',
        tdColorSorting: 'var(--color-background-mute)',

        borderColor: 'var(--color-border)',
    },
    Descriptions: {
        tdTextColor: 'var(--color-heading)',
    },
    Input: {
        color: 'var(--color-background)',
        colorFocus: 'var(--color-background-mute)',
        textColor: 'var(--color-heading)',
        border: '1px solid var(--color-border)',
    },
    Pagination: {
        itemColor: 'var(--color-background-soft)',
        itemColorDisabled: 'var(--color-background)',

        itemTextColor: 'var(--color-text)',
        itemTextColorActive: 'var(--color-heading)',

        itemBorderDisabled: '1px solid var(--color-border)',
        itemBorderActive: '1px solid var(--color-heading)',
    },
    Result: {
        titleTextColor: 'var(--color-heading)',
    },
    Select: {
        peers: {
            InternalSelectMenu: {
                color: 'var(--color-background-soft)',
                optionTextColor: 'var(--color-text)',
                optionColorPending: '#34495e',
                optionColorActivePending: '#2c3e50',
            },
            InternalSelection: {
                color: 'var(--color-background)',
                textColor: 'var(--color-heading)',
                colorActive: 'var(--color-background-mute)',
                border: '1px solid var(--color-border)',
            },
        },
    },
    Tag: {
        textColor: 'var(--color-text)',
        color: 'var(--color-background-soft)',
        borderColor: 'var(--color-border)',
        borderRadius: '0.25rem',
    },
}
</script>

<template>
    <n-config-provider :theme-overrides="themeOverride">
        <n-message-provider>
            <n-flex justify="center">
                <Nav></Nav>
                <n-divider style="--n-color: var(--color-background-soft); width: 90vw" />
                <RouterView /> </n-flex></n-message-provider
    ></n-config-provider>
</template>

<style scoped></style>
