<script setup lang="ts">
import {
    createPoint,
    createRandomPropsWithEntropy,
    omegaWithEntropy,
    randomTheta0,
    vWithEntropy,
} from '@/components/mobius/Mobius'
import Mobius from '@/components/mobius/Mobius.vue'
import type { MobiusProps } from '@/types/components/Mobius'
import axios from 'axios'
import {
    NCard,
    NCollapse,
    NCollapseItem,
    NCountdown,
    NDivider,
    NFlex,
    NNumberAnimation,
    type CountdownTimeInfo,
} from 'naive-ui'
import { h, onMounted, ref } from 'vue'

const countdownValue = new Date('2025-08-31T18:00:01+08:00').getTime() - new Date().getTime()

const isCountdownFinish = ref(false)
const invitationCode = ref<string>('')
async function handleCountdownFinish() {
    isCountdownFinish.value = true
    invitationCode.value = (
        await axios.get<{ status: string; result: string }>(
            '/api/entropy-pool/entropy-pool-20250809/result',
        )
    ).data.result
}

function renderCountdown(v: CountdownTimeInfo) {
    const days = Math.floor(v.hours / 24)
    const hours = v.hours % 24
    return h(
        'div',
        {
            style: { textAlign: 'center' },
        },
        [
            h('div', { style: { color: 'var(--color-heading)' } }, `距开奖还有`),
            h(
                'div',
                { style: { color: 'var(--color-heading)' } },
                `😋 ${days} 天 ${hours} 小时 ${v.minutes} 分钟 ${v.seconds} 秒 😋`,
            ),
        ],
    )
}

const showMobius = ref(false)
const entropy = ref<number>(0)
const pointNum = 10
const s0 = 200
const pointH = 0.02
const pointV = 0.1
const color = '#FF3377'
const maxRandomH = 0.0
const maxRandomV = 0.1
const maxOmega = 6
const minOmega = 4
const randomListLength = 100
const mobiusProps = ref<MobiusProps>({
    phi0: 0,
    points: [],
    frameColor: '#e74c3c',
    trail: {
        lifetime: 0.1, // in seconds
        emissionRate: 600, // points per second
    },
})

onMounted(async () => {
    try {
        const { data } = await axios.get<{ status: string; entropy: number }>(
            '/api/entropy-pool/entropy-pool-20250809/entropy',
        )
        entropy.value = data.entropy
        const s = entropy.value - 500

        for (let ii = 0; ii < pointNum; ii++) {
            const tempRandomProp = createRandomPropsWithEntropy(
                s,
                s0,
                maxRandomV,
                maxRandomH,
                randomListLength,
            )
            const tempV = vWithEntropy(s, s0, pointV, 0)
            const tempH = pointH * (Math.random() * 2 - 1)
            const tempPoint = createPoint(
                tempV,
                tempH,
                color,
                randomTheta0(),
                omegaWithEntropy(s, s0, maxOmega, minOmega, 1),
                tempRandomProp,
            )
            mobiusProps.value.points.push(tempPoint)
        }
        showMobius.value = true
    } catch (error) {
        console.error('Failed to fetch entropy data:', error)
    }
})
</script>

<template>
    <n-flex vertical align="center" :style="{ width: '80vw', paddingBottom: '10vh' }">
        <div v-if="!isCountdownFinish">
            <n-countdown
                :duration="countdownValue"
                :active="true"
                :render="renderCountdown"
                @finish="handleCountdownFinish"
            />
        </div>
        <div v-else>
            <n-card
                align="center"
                :content-style="{ fontSize: '1.2rem', fontWeight: 'bold' }"
                :segmented="{ content: true }"
            >
                <template #header>抽奖结果</template>
                <p style="font-size: 1.5rem; color: var(--color-heading)">
                    {{ invitationCode }}
                </p>
            </n-card>
        </div>
        <div class="mobius">
            <Mobius
                :phi0="mobiusProps.phi0"
                :points="mobiusProps.points"
                :frame-color="mobiusProps.frameColor"
                :trail="mobiusProps.trail"
                :point-size="0.02"
                v-if="showMobius"
            />
        </div>
        <n-card
            align="center"
            :content-style="{ fontSize: '1.2rem', fontWeight: 'bold' }"
            :segmented="{ content: true }"
        >
            <template #header>熵池总熵值</template>
            <n-number-animation :from="0" :to="entropy" :precision="2"></n-number-animation>
            <p>bits</p>
        </n-card>
        <n-collapse default-expanded-names="rules">
            <n-collapse-item title="规则介绍" name="rules">
                <p>
                    此抽奖为深圳 BanG Dream! Only 2nd
                    抽奖活动。本次活动奖品由本人个人提供，并非商业推广。主要目的为测试与练习有可能应用于未来项目中的技术。
                </p>
                <n-divider />
                <p>参与截止时间/开奖时间： 2025 年 8 月 31 日 18:00:00</p>
                <n-divider />
                <p>奖品详情：</p>
                <ol>
                    <li>
                        若中奖者本人持有 BanG Dream! 上海公演 2025 Poppin'Party Global LIVE 2025
                        「Shiny High-Five!!」 票，凭票与场内证明（如照片）可得最高 680 CNY 的报销。
                    </li>
                    <li>或可选择直接折现 480 CNY.</li>
                </ol>
                中奖者奖品将于 2025.9.25-2025.9.30 间发放。解释权归本人所有，若有疑问请联系本人。
                <n-divider />
                <p>
                    参与方式：通过
                    <router-link to="/signup">注册页面</router-link> 进行注册即可，Invitation Code
                    为 Member Card 背面二维码扫描结果。
                </p>
                <p>注：此次注册信息仅本次抽奖使用。</p>
            </n-collapse-item>
            <n-collapse-item title="熵源" name="entropy-src">
                以下为技术性内容记录，非技术人员可忽略。
                <n-collapse>
                    <n-collapse-item title="主熵源">
                        <p>
                            主熵源熵来源于<a href="https://qrng.anu.edu.au/"
                                >澳国立量子随机数发生器(ANU QRNG)</a
                            >.
                        </p>
                        <p>
                            ANU QRNG 随机性来源于真空态 quadrature amplitude 的涨落。50:50
                            分束器一端口输入相干态强激光，另一端口不输入，即为真空态。分束器的场算符表示为量子光学基础内容，此处不过多展开，最后可得两个输出端口的差分光电流正比于真空态的
                            quadrature amplitude.
                            随机性来源安全性由物理基本定律保证，为真随机数发生器。具体细节可参考
                            <a href="https://doi.org/10.1063/1.3597793"
                                >Appl. Phys. Lett. 98, 231103 (2011)</a
                            >
                            与
                            <a href="https://doi.org/10.1103/PhysRevApplied.3.054004">
                                Phys. Rev. Applied 3, 054004 (2015)</a
                            >.
                        </p>
                        <p>
                            事实上 ANU QRNG
                            并非初始方案。初始方案基于超导量子比特进行，后续由于非技术性的原因弃用原方案，改为直接使用
                            ANU QRNG 获取真随机数。
                        </p>
                        <p>
                            使用经典随机数发生器不够吗？当然够，但是这样的话直接用第三方抽奖工具，又快又好。
                        </p>
                    </n-collapse-item>
                    <n-collapse-item title="次熵源">
                        次熵源熵来源于用户注册时的时间。取用户注册时间的亚秒部分时间戳，精度为微秒。熵来源于网络传输延迟与
                        Cloudflare Workers 调度延迟等。
                    </n-collapse-item>
                    <n-collapse-item title="熵混合">
                        <p>
                            通过 HMAC-SHA256 更新熵池状态。每次用户注册时，熵池状态作为 key,
                            时间戳作为 message 进行 HMAC-SHA256 计算，得到新的熵池状态。
                        </p>
                        <p>
                            考虑到 HMAC-SHA256 块大小为 64 bytes, 从 ANU QRNG
                            获取对应块大小的随机数作为熵池的初态。保守估计，最小熵设为 500 bits.
                            相对于最终的 256 bits 输出，熵池初态的熵值已经是足够的了。
                        </p>
                        <p>微秒精度时间戳，取熵值为 5.14 bits.</p>
                        <p>生成的随机数通过拒绝采样法，得到最终的结果。</p>
                    </n-collapse-item>
                </n-collapse>
            </n-collapse-item>
        </n-collapse>
    </n-flex>
</template>

<style scoped>
.mobius {
    width: 200px;
    height: 200px;
}
</style>
