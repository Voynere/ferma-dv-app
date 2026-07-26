import { CustomSvgProps } from '@/types'
import React from 'react'
import Svg, { Path } from "react-native-svg"

const Close: React.FC<CustomSvgProps> = ({ color = "#4D4D4D", ...props }) => {
    return (
        <Svg
            fill="none"
            viewBox="0 0 24 24"
            stroke={color}
            strokeWidth={2}
            {...props}
        >
            <Path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
            />
        </Svg>
    )
}

export default Close