import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native'
import React, { forwardRef } from 'react'
import Txt from './Text'
import { CustomSvgProps } from '../types'

interface Props {
    label?: string
    placeholder?: string
    value?: string
    onChange: (value: string) => void
    withIcon?: { component: React.FC<CustomSvgProps>, onClick: () => void }
    readonly?: boolean
    maxLenght?: number
    isNumber?: boolean
    onFocus?: () => void
    autoFocus?: boolean
    multiline?: boolean
}

const Input = forwardRef<TextInput, Props>(({ onChange, label, placeholder, value, withIcon, readonly, maxLenght, isNumber, onFocus, autoFocus, multiline }, ref) => {
    return (
        <View style={styles.InputBox}>
            {label && <Txt size={16} weight='RobotoCondensed-Bold'>{label}</Txt>}

            <View style={styles.Input}>
                <TextInput
                    ref={ref}
                    style={styles.InputElement}
                    value={value}
                    placeholder={placeholder}
                    onChangeText={onChange}
                    placeholderTextColor="rgba(77, 77, 77, 0.5)"
                    readOnly={readonly}
                    maxLength={maxLenght}
                    keyboardType={isNumber ? "numeric" : "default"}
                    onFocus={onFocus}
                    autoFocus={autoFocus}
                    multiline={multiline}
                    showSoftInputOnFocus={true}
                    autoCorrect={false}
                    autoCapitalize="none"
                />
                {withIcon && (
                    <TouchableOpacity activeOpacity={0.5} onPress={withIcon.onClick}>
                        <withIcon.component width={24} height={24} />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    )
})

Input.displayName = 'Input'

export default Input

const styles = StyleSheet.create({
    InputBox: {
        gap: 4
    },
    Input: {
        height: 56,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: "rgba(77, 77, 77, 0.5)",
        borderRadius: 8,
        alignItems: "center",
        flexDirection: "row",
        gap: 8
    },
    InputElement: {
        flex: 1,
        color: "#4D4D4D"
    }
})
