export interface MobiusProps {
    phi0: number
    points: PointProps[]
    frameColor: string // hex
    trail?: TrailProps
    pointSize?: number
}

export interface TrailProps {
    lifetime: number // in seconds
    emissionRate: number // points per second
}

export interface PointProps {
    v: number
    h: number
    theta0: number // initial angle
    omega: number // angular velocity
    color: string // hex
    randomProps?: RandomProps
}

export interface RandomProps {
    randomList: number[]
    hRandomIndex: number
    hRandomScale: number
    vRandomIndex: number
    vRandomScale: number
}

export interface Coor {
    x: number
    y: number
    z: number
}
