import { CustomSvgProps } from "@/types"
import Svg, { Path } from "react-native-svg"

const Plus: React.FC<CustomSvgProps> = ({ color = "#4D4D4D", ...props }) => {
    return (
        <Svg
            width={8}
            height={8}
            viewBox="0 0 8 8"
            fill="none"
            {...props}
        >
            <Path
                d="M8 2.943v1.963H0V2.943h8zM5.28 0v8H2.75V0h2.53z"
                fill={color}
            />
        </Svg>
    )
}

export default Plus