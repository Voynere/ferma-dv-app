import { StyleSheet, TextInput, View } from 'react-native';
import React, { FC, useState } from 'react';
import { MaskedTextInput } from 'react-native-mask-text';
import Txt from './Text';

interface Props {
    label?: string;
    placeholder?: string;
    value?: string;
    onChange: (value: string) => void;
    readonly?: boolean
}

const PhoneInput: FC<Props> = ({ onChange, label, placeholder, value = '', readonly }) => {
    return (
        <View style={styles.InputBox}>
            {label && <Txt size={16} weight="Bold">{label}</Txt>}
            <View style={styles.Input}>
                {/* Временное отключение жёсткой маски +7 для теста международных номеров (например, +995) */}
                <MaskedTextInput
                    mask="+7 (999) 999 99-99"
                    style={styles.InputElement}
                    value={value}
                    placeholder={placeholder}
                    onChangeText={onChange}
                    placeholderTextColor="rgba(77, 77, 77, 0.5)"
                    keyboardType="phone-pad"
                    readOnly={readonly}
                />
                {/* <TextInput
                    style={styles.InputElement}
                    value={value}
                    placeholder={placeholder || "+995 5XX XXX XXX"}
                    onChangeText={onChange}
                    placeholderTextColor="rgba(77, 77, 77, 0.5)"
                    keyboardType="phone-pad"
                    readOnly={readonly}
                    autoComplete="tel"
                /> */}
            </View>
        </View>
    );
};

export default PhoneInput;

const styles = StyleSheet.create({
    InputBox: {
        gap: 4,
    },
    Input: {
        height: 56,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: "rgba(77, 77, 77, 0.5)",
        borderRadius: 8,
        alignItems: "center",
        flexDirection: "row",
        gap: 8,
    },
    InputElement: {
        flex: 1,
        color: "#4D4D4D"
    },
});
