import React from 'react'
import { CustomSvgProps } from '@/types'
import Svg, { Path } from "react-native-svg"

const Email: React.FC<CustomSvgProps> = ({ color = "#4D4D4D", ...props }) => {
    return (
        <Svg
            fill="none"
            viewBox="0 0 24 24"
            stroke={color}
            width={24}
            height={24}
            strokeWidth={2}
            {...props}
        >
            <Path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
        </Svg>
    )
}

export default Email