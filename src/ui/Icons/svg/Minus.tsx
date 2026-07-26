import { CustomSvgProps } from "@/types"
import Svg, { Path } from "react-native-svg"

const Minus: React.FC<CustomSvgProps> = ({ color = "#4D4D4D", ...props }) => {
    return (
        <Svg
            width={8}
            height={2}
            viewBox="0 0 8 2"
            fill="none"
            {...props}
        >
            <Path d="M8 0v2H0V0h8z" fill={color} />
        </Svg>
    )
}

export default Minus