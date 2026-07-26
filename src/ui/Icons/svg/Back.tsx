import React from 'react'
import { CustomSvgProps } from '@/types'
import Svg, { Path } from "react-native-svg"

const Back: React.FC<CustomSvgProps> = ({ color = "#4D4D4D", ...props }) => {
    return (
        <Svg
            width={16}
            height={10}
            viewBox="0 0 16 10"
            fill="none"
            {...props}
        >
            <Path
                d="M2.092 5.586l2.54 2.437s0 0 0 0a.598.598 0 01.185.425.58.58 0 01-.185.426m-2.54-3.288l1.66 3.288a.624.624 0 00.44.176.643.643 0 00.44-.176m-2.54-3.288h13.336a.634.634 0 00.44-.174.587.587 0 00.182-.424.587.587 0 00-.183-.424.634.634 0 00-.439-.175H2.103l2.53-2.42h0a.587.587 0 00.181-.423.587.587 0 00-.181-.423h0A.634.634 0 004.194.95a.634.634 0 00-.438.173h0L.121 4.611s0 0 0 0a.533.533 0 00-.171.385.516.516 0 00.171.385l3.63 3.493-1.66-3.288zm2.54 3.288s0 0 0 0l-.034-.036.034.036s0 0 0 0z"
                fill={color}
                stroke={color}
                strokeWidth={0.1}
            />
        </Svg>
    )
}

export default Back