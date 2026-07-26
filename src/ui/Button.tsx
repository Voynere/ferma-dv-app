import { StyleSheet, TouchableOpacity, ViewStyle } from 'react-native'
import React, { FC, useMemo, memo } from 'react'

interface Props {
    children: React.ReactNode
    onClick?: () => void
    padding?: number
    height?: number
    background?: string
    outline?: boolean
    disabled?: boolean
    style?: ViewStyle
}

const Button: FC<Props> = ({ 
    children, 
    onClick, 
    padding, 
    height = 40, 
    background = "#4FBD01", 
    outline, 
    disabled = false,
    style 
}) => {
    // Мемоизируем стили для предотвращения пересоздания
    const buttonStyle = useMemo(() => [
        styles.Button, 
        {
            paddingHorizontal: padding,
            height,
            backgroundColor: disabled ? '#ccc' : background
        }, 
        outline && styles.Outline,
        disabled && styles.Disabled,
        style
    ], [padding, height, disabled, background, outline, style])

    return (
        <TouchableOpacity
            onPress={disabled ? undefined : onClick}
            activeOpacity={disabled ? 1 : 0.5}
            style={buttonStyle}
            disabled={disabled}
        >
            {children}
        </TouchableOpacity>
    )
}

Button.displayName = 'Button'

// Мемоизируем для предотвращения лишних ре-рендеров
export default memo(Button, (prevProps, nextProps) => {
    return (
        prevProps.disabled === nextProps.disabled &&
        prevProps.background === nextProps.background &&
        prevProps.height === nextProps.height &&
        prevProps.padding === nextProps.padding &&
        prevProps.outline === nextProps.outline &&
        prevProps.children === nextProps.children &&
        prevProps.onClick === nextProps.onClick
    )
})

const styles = StyleSheet.create({
    Button: {
        width: "100%",
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 8
    },
    Outline: {
        backgroundColor: "transparent",
        borderWidth: 1,
        borderColor: "#4FBD01"
    },
    Disabled: {
        opacity: 0.5
    }
})