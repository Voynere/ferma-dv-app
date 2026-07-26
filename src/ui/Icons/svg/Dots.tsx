import React from 'react'
import { CustomSvgProps } from '@/types'
import Svg, { Path } from "react-native-svg"

const Dots: React.FC<CustomSvgProps> = ({ color = "#4D4D4D", ...props }) => {
    return (
        <Svg
            width={16}
            height={4}
            viewBox="0 0 16 4"
            fill="none"
            {...props}
        >
            <Path
                d="M4 2a2 2 0 11-4 0 2 2 0 014 0zM10 2a2 2 0 11-4 0 2 2 0 014 0zM16 2a2 2 0 11-4 0 2 2 0 014 0z"
                fill={color}
            />
        </Svg>
    )
}

export default Dots