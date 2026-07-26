import { CustomSvgProps } from "@/types"
import Svg, { Path } from "react-native-svg"

const Cake: React.FC<CustomSvgProps> = ({ color = "#4D4D4D", ...props }) => {
    return (
        <Svg
            width={26}
            height={26}
            viewBox="0 0 26 26"
            fill="none"
            {...props}
        >
            <Path
                d="M25 17c-4.444-2.667-7.556-2.667-12 0s-7.556 2.667-12 0m2.667-8h18.666A2.667 2.667 0 0125 11.667v12c0 .736-.597 1.333-1.333 1.333H2.333A1.333 1.333 0 011 23.667v-12A2.667 2.667 0 013.667 9zM13 9a3.333 3.333 0 01-3.333-3.333C9.667 4.439 10.777 2.884 13 1c2.222 1.884 3.333 3.44 3.333 4.667A3.333 3.333 0 0113 9z"
                stroke={color}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </Svg>
    )
}

export default Cake