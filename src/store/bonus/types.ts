export type DataTypes = "phone" | "code"

export interface State {
    bonuses: number,

    getBonuses: () => Promise<void>,
    changeBonus: () => Promise<void>,
    calculateBonus: (bonusType: number, express: boolean) => Promise<number>
}