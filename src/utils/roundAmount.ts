export function roundWeightAmount(value: number): number {
    return Math.round(value * 10) / 10
}

export function roundIntAmount(value: number): number {
    return Math.round(value)
}

export function roundAmount(value: number, isWeighted: boolean): number {
    return isWeighted ? roundWeightAmount(value) : roundIntAmount(value)
}

