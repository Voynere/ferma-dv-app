import { StyleSheet, TouchableOpacity, View } from 'react-native'
import React, { FC } from 'react'

interface ContinueButtonProps {
    children: React.ReactNode
    onPress?: () => void
    isDisabled?: boolean
    buttonHeight?: number
}

const ContinueButton: FC<ContinueButtonProps> = ({ 
    children, 
    onPress, 
    isDisabled = false,
    buttonHeight = 56
}) => {
    return (
        <TouchableOpacity
            onPress={isDisabled ? undefined : onPress}
            activeOpacity={isDisabled ? 1 : 0.7}
            style={[
                continueButtonStyles.Wrapper,
                {
                    height: buttonHeight,
                    backgroundColor: isDisabled ? '#E0E0E0' : '#4FBD01'
                },
                isDisabled && continueButtonStyles.InactiveState
            ]}
            disabled={isDisabled}
        >
            <View style={continueButtonStyles.ContentWrapper}>
                {children}
            </View>
        </TouchableOpacity>
    )
}

export default ContinueButton

const continueButtonStyles = StyleSheet.create({
    Wrapper: {
        width: "100%",
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 16,
        paddingHorizontal: 24,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    ContentWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    InactiveState: {
        opacity: 0.6,
        shadowOpacity: 0,
        elevation: 0,
    }
})

