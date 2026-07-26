import React from 'react'
import { CustomSvgProps } from '@/types'
import Svg, { Path } from "react-native-svg"

const Heard: React.FC<CustomSvgProps> = ({ color, isBold = false, ...props }) => {
    const fillColor = isBold ? (color || "#EF2D45") : (color || "#4D4D4D");
    
    return (
        <>
            {isBold
                ? <Svg
                    width={18}
                    height={18}
                    viewBox="0 0 18 18"
                    fill="none"
                    {...props}
                >
                    <Path
                        d="M2.376 2.393C4.191.489 7.06.358 9.002 2.104 10.967.358 13.86.49 15.676 2.445c1.91 2.06 1.936 5.409.05 7.494l-.002.001-6.63 7.145-.092.099-.092-.099L2.28 9.94h-.002C.368 7.826.416 4.451 2.376 2.392z"
                        fill={fillColor}
                        stroke={fillColor}
                        strokeWidth={0.25}
                    />
                </Svg>
                : <Svg
                    width={18}
                    height={18}
                    viewBox="0 0 18 18"
                    fill="none"
                    {...props}
                >
                    <Path
                        d="M8.91 17.085l.092.099.091-.099 6.631-7.144h0l.001-.002c1.887-2.085 1.862-5.434-.049-7.493C13.861.489 10.967.358 9.002 2.103 7.061.357 4.192.49 2.376 2.393h0C.416 4.452.367 7.827 2.278 9.939h0l.001.002 6.631 7.144zM3.061 9.306l-.009-.009-.01-.007-.071-.052-.007-.004-.007-.004-.029-.016c-1.523-1.708-1.516-4.459.06-6.107 1.579-1.65 4.104-1.65 5.658.05h0l.264.284.092.099.091-.099.263-.283s0 0 0 0c1.58-1.676 4.104-1.675 5.658 0 1.56 1.68 1.56 4.442 0 6.123l-5.988 6.452L3.06 9.306z"
                        fill={fillColor}
                        stroke={fillColor}
                        strokeWidth={0.25}
                    />
                </Svg>
            }
        </>
    )
}

export default Heard