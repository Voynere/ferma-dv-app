export type Types = "fullName" | "dateBirth"

export interface State {
    formData: {
        fullName: string,
        dateBirth: string,
    }

    saveData: () => Promise<void>
    getProfileData: () => Promise<void>
    changeProfileData: (value: string, type: Types) => void
    checkBirthdayBonusOnLaunch: () => Promise<void>
}