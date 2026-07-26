import { CustomSvgProps } from "@/types"
import Svg, { Path } from "react-native-svg"

const Star: React.FC<CustomSvgProps> = ({ color = "#4D4D4D", ...props }) => {
    return (
        <Svg
            width={16}
            height={15}
            viewBox="0 0 16 15"
            fill="none"
            {...props}
        >
            <Path
                d="M8 .5l1.796 5.528h5.813l-4.703 3.416 1.796 5.528L8 11.556l-4.702 3.416 1.796-5.528L.392 6.028h5.812L8 .5z"
                fill={color}
            />
        </Svg>
    )
}

export default Star