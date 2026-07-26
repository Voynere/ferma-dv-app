import { UserDataType } from "../../types"

export type DataTypes = "phone" | "code"

export interface State {
    phone: string,
    code: string,
    smsCode: string,
    isCode: boolean
    userData: UserDataType,
    timer: number

    changeData: (value: string, type: DataTypes) => void
    changeUserData: (data: UserDataType) => void
    sendCode: () => Promise<void>
    verifyCode: () => Promise<void>
    authorizeKilBil: () => Promise<void>
    logout: () => Promise<void>
    startTimer: () => void
    initializeAuth: () => Promise<void>
    changeIsCode: (value: boolean) => void
    autoFillCode: () => void
}