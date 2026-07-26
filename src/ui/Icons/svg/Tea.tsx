import { CustomSvgProps } from "@/types"
import Svg, { Path } from "react-native-svg"

const Tea: React.FC<CustomSvgProps> = ({ color = "#4D4D4D", ...props }) => {
    return (
        <Svg
            width={25}
            height={26}
            viewBox="0 0 25 26"
            fill="none"
            {...props}
        >
            <Path
                d="M.5 25h24M8.5 6.143V1m4 0v5.143M16.5 1v5.143m-16 5.143h24c0 3.637-1.124 7.125-3.124 9.697-2 2.572-4.714 4.017-7.543 4.017h-2.666c-2.83 0-5.542-1.445-7.543-4.017-2-2.572-3.124-6.06-3.124-9.697z"
                stroke={color}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </Svg>
    )
}

export default Tea