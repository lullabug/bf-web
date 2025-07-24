<script setup lang="ts">
import { getUnixTime, parse } from 'date-fns'
import { NCard, NCountdown, NFlex, type CountdownTimeInfo } from 'naive-ui'
import { h } from 'vue'

const countdownValue =
    (getUnixTime(parse('2025-08-09', 'yyyy-MM-dd', new Date())) - getUnixTime(new Date())) * 1000
console.log(countdownValue)

function renderCountdown(v: CountdownTimeInfo) {
    const days = Math.floor(v.hours / 24)
    const hours = v.hours % 24
    return h(
        'div',
        {
            style: { textAlign: 'center' },
        },
        [
            h('h1', '距离'),
            h('h1', { style: { color: 'var(--color-heading)' } }, '深圳 BanG Dream! Only 2nd'),
            h('h1', '还有'),
            h(
                'h1',
                { style: { color: 'var(--color-heading)' } },
                `😋 ${days} 天 ${hours} 小时 ${v.minutes} 分钟 ${v.seconds} 秒 😋`,
            ),
        ],
    )
}
</script>

<template>
    <n-flex vertical align="center">
        <n-card>
            <n-countdown :duration="countdownValue" :active="true" :render="renderCountdown" />
        </n-card>
    </n-flex>
</template>

<style scoped></style>
