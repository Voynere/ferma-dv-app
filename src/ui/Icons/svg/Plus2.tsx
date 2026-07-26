import { CustomSvgProps } from "@/types"
import Svg, { Path } from "react-native-svg"

const Plus2: React.FC<CustomSvgProps> = ({ color = "#4D4D4D", ...props }) => {
    return (
        <Svg
            width={16}
            height={17}
            viewBox="0 0 16 17"
            fill="none"
            {...props}
        >
            <Path
                d="M8 2v14m7-7H1"
                stroke={color}
                strokeWidth={1.6}
                strokeLinecap="round"
            />
        </Svg>
    )
}

export default Plus2