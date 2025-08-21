import type { RandomProps, PointProps } from '@/types/components/Mobius'

export function createPoint(
    v: number,
    h: number,
    color: string,
    theta0: number,
    omega: number,
    randomProps?: RandomProps,
): PointProps {
    return {
        v,
        h,
        color,
        theta0,
        omega,
        randomProps: randomProps,
    }
}

export function randomTheta0(): number {
    return Math.random() * Math.PI * 4
}

export function omegaWithEntropy(
    s: number,
    s0: number,
    maxOmega: number,
    minOmega: number,
    omegaFluctuation: number,
): number {
    const ratio = 1 - Math.exp(-s / s0)
    return (
        maxOmega -
        ratio * (maxOmega - minOmega) +
        (Math.random() * 2 - 1) * omegaFluctuation * ratio
    )
}

export function vWithEntropy(s: number, s0: number, maxV: number, minV: number = 0): number {
    const ratio = 1 - Math.exp(-s / s0)
    return (maxV - ratio * (maxV - minV)) * (Math.random() * 2 - 1)
}

export function createRandomPropsWithEntropy(
    s: number,
    s0: number,
    maxRandomV: number,
    maxRandomH: number,
    randomListLength: number,
): RandomProps {
    const ratio = 1 - Math.exp(-s / s0)
    const randomList = Array.from({ length: randomListLength }, () => {
        return Math.random()
    })
    const hRandomIndex = Math.floor(Math.random() * randomListLength)
    const hRandomScale = ratio * maxRandomH
    const vRandomIndex = Math.floor(Math.random() * randomListLength)
    const vRandomScale = ratio * maxRandomV
    return {
        randomList,
        hRandomIndex,
        hRandomScale,
        vRandomIndex,
        vRandomScale,
    }
}
