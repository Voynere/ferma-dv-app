import { StyleSheet, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import Input from '../../../ui/Input'
import Icons from '../../../ui/Icons'
import Txt from '../../../ui/Text'
import Button from '../../../ui/Button'
import useProfileStore from '../../../store/profile'
import { formatDate, formatDateInput } from '../../../functions'
import useAuthStore from '../../../store/auth'
import DateTimePicker from '@react-native-community/datetimepicker';
import PhoneInput from '../../../ui/PhoneInput'

const PersonalData = () => {
    const { formData, changeProfileData, saveData, getProfileData } = useProfileStore()
    const { logout, userData } = useAuthStore()
    const [showPicker, setShowPicker] = useState(false)

    useEffect(() => {
        getProfileData()
    }, [getProfileData])

    return (
        <View style={styles.Form}>
            <PhoneInput
                onChange={() => ({})}
                label="Номер телефона"
                value={userData.phoneNumber}
                readonly
            />

            <Input
                onChange={value => changeProfileData(value, "fullName")}
                label="ФИО"
                value={formData.fullName}
            />

            <TouchableOpacity activeOpacity={1} onPress={() => setShowPicker(true)}>
                <Input
                    onChange={() => {}}
                    label="Дата рождения"
                    value={formData.dateBirth}
                    withIcon={{ component: Icons.Calendar, onClick: () => setShowPicker(true) }}
                    readonly
                />
            </TouchableOpacity>

            <Button height={56} onClick={() => saveData()}>
                <Txt size={16} weight='Bold' color='#fff'>Сохранить</Txt>
            </Button>

            <Button outline height={56} onClick={() => logout()}>
                <Txt size={16} weight='Bold' color='#4FBD01'>Выйти из профиля</Txt>
            </Button>

            {showPicker && (
                <DateTimePicker
                    value={formData.dateBirth !== "" ? formatDate(formData.dateBirth) as Date : new Date()}
                    mode="date"
                    display={'spinner'}
                    onChange={(_, date) => {
                        setShowPicker(false)
                        const formatedDate: string = formatDate(date || new Date(), true) as string
                        changeProfileData(formatedDate, "dateBirth");
                    }}
                    maximumDate={new Date()}
                />
            )}
        </View>
    )
}

export default PersonalData

const styles = StyleSheet.create({
    Form: {
        gap: 16,
        paddingBottom: '5%'
    },
    Address: {
        flexDirection: "row",
        gap: 16,
    },
    List: {
        gap: 4,
        flex: 1
    },
    Button: {
        gap: 4,
        alignItems: "center",
        backgroundColor: "#EEEEEE",
        alignSelf: "flex-end",
        padding: 10,
        borderRadius: 10,
        marginTop: 15,
    },
})