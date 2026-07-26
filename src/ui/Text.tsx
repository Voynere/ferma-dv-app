import { StyleSheet, Text, TextStyle } from 'react-native'
import React, { FC, ReactNode, memo, useMemo } from 'react'

interface Props {
    children: ReactNode
    color?: string
    size?: number
    weight?: "RobotoCondensed-Regular" | "RobotoCondensed-Bold" | "Jingleberry",
    numberOfLines?: number
    lineHeight?: number
    style?: TextStyle
}

const Txt: FC<Props> = ({ 
    children, 
    color = "#4D4D4D", 
    size = 14, 
    lineHeight, 
    weight = "RobotoCondensed-Regular", 
    numberOfLines,
    style 
}) => {
    // Мемоизируем стиль для предотвращения пересоздания
    const textStyle = useMemo<TextStyle>(() => ({
        color,
        fontSize: size,
        fontFamily: weight,
        lineHeight: lineHeight,
    }), [color, size, weight, lineHeight])

    const combinedStyle = useMemo(() => 
        style ? [textStyle, style] : textStyle,
        [textStyle, style]
    )

    return (
        <Text
            style={combinedStyle}
            numberOfLines={numberOfLines}
            allowFontScaling={false}
        >
            {children}
        </Text>
    )
}

Txt.displayName = 'Txt'

// Мемоизируем для предотвращения лишних ре-рендеров
export default memo(Txt)