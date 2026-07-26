import { CustomSvgProps } from "@/types"
import Svg, { Path } from "react-native-svg"

const Calendar: React.FC<CustomSvgProps> = ({ color = "#4D4D4D", ...props }) => {
    return (
        <Svg
            width={24}
            height={24}
            viewBox="0 0 24 24"
            fill="none"
            {...props}
        >
            <Path
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                stroke={color}
                strokeWidth={1}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </Svg>
    )
}

export default Calendar