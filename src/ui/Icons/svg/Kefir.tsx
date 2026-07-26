import { CustomSvgProps } from "@/types"
import Svg, { Path } from "react-native-svg"

const Kefir: React.FC<CustomSvgProps> = ({ color = "#4D4D4D", ...props }) => {
    return (
        <Svg
            width={24}
            height={24}
            viewBox="0 0 24 24"
            fill="none"
            {...props}
        >
            <Path d="M13.088 8.625h-.75V23.25h.75V8.625z" fill={color} />
            <Path d="M21 8.25H3V9h18v-.75z" fill={color} />
            <Path
                d="M16.579 3.144l-4.124 5.249.59.463 4.124-5.248-.59-.464zM15.75 3H7.875v.75h7.875V3z"
                fill={color}
            />
            <Path
                d="M15.134 5.65l-.279.696 3.76 1.504.28-.696-3.761-1.505z"
                fill={color}
            />
            <Path
                d="M20.25 23.625H3.75A1.105 1.105 0 012.625 22.5V8.512l4.125-5.25V1.126c0-.412.338-.75.75-.75h9c.413 0 .75.338.75.75v2.138l4.125 5.25V22.5c0 .637-.488 1.125-1.125 1.125zM3.375 8.738V22.5c0 .225.15.375.375.375h16.5c.225 0 .375-.15.375-.375V8.738L16.5 3.488V1.124h-9v2.362l-4.125 5.25z"
                fill={color}
            />
            <Path
                d="M11.625 13.5h-.75v.75h.75v-.75zM10.125 13.5h-.75v.75h.75v-.75zM8.625 13.5h-4.5v.75h4.5v-.75zM11.625 18.75h-7.5v.75h7.5v-.75z"
                fill={color}
            />
        </Svg>
    )
}

export default Kefir