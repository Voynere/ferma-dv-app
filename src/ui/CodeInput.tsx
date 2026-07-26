import React, { FC } from 'react'
import { StyleSheet, View, Text, Platform } from 'react-native'
import { CodeField, Cursor, useBlurOnFulfill, useClearByFocusCell } from 'react-native-confirmation-code-field'
import Txt from './Text'

interface Props {
    onChange: (value: string) => void
    value: string
}

const CodeInput: FC<Props> = ({ onChange, value }) => {
    const [props, getCellOnLayoutHandler] = useClearByFocusCell({ value, setValue: onChange })
    const ref = useBlurOnFulfill({ value, cellCount: 4 })

    return (
        <View style={styles.root}>
            <Txt size={20}>Введите код из СМС</Txt>
            
            <CodeField
                ref={ref}
                {...props}
                value={value}
                onChangeText={onChange}
                cellCount={4}
                rootStyle={styles.codeFieldRoot}
                keyboardType="number-pad"
                textContentType="oneTimeCode"
                autoComplete={Platform.OS === 'android' ? 'sms-otp' : 'one-time-code'}
                autoFocus={true}
                renderCell={({ index, symbol, isFocused }) => (
                    <View
                        key={index}
                        style={[styles.cell, isFocused && styles.focusCell]}
                        onLayout={getCellOnLayoutHandler(index)}
                    >
                        <Text style={styles.cellText}>
                            {symbol || (isFocused ? <Cursor /> : null)}
                        </Text>
                    </View>
                )}
            />
        </View>
    )
}

export default CodeInput

const styles = StyleSheet.create({
    root: { 
        alignItems: "center", 
        gap: 16, 
        paddingVertical: 20 
    },
    codeFieldRoot: { 
        justifyContent: 'center' 
    },
    cell: {
        width: 55,
        height: 65,
        borderWidth: 2,
        borderColor: '#ccc',
        textAlign: 'center',
        marginHorizontal: 6,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 12
    },
    cellText: {
        fontSize: 28,
        fontFamily: "RobotoCondensed-Bold",
        color: "#4D4D4D"
    },
    focusCell: {
        borderColor: '#4FBD01',
    },
})
