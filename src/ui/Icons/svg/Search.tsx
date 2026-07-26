import { CustomSvgProps } from "@/types"
import Svg, { Path } from "react-native-svg"

const Search: React.FC<CustomSvgProps> = ({ color = "#4D4D4D", ...props }) => {
    return (
        <Svg
            width={24}
            height={24}
            viewBox="0 0 24 24"
            fill="none"
            {...props}
        >
            <Path
                d="M17.876 16.582l-.059.07.065.065 5.777 5.777a.822.822 0 01-.001 1.164h0a.82.82 0 01-1.163 0l-5.778-5.777-.064-.064-.07.058a10.002 10.002 0 01-6.429 2.333C4.61 20.208.1 15.698.1 10.154.1 4.61 4.61.1 10.154.1c5.544 0 10.054 4.51 10.054 10.054 0 2.443-.877 4.684-2.332 6.428zM10.154 1.746c-4.636 0-8.408 3.772-8.408 8.408 0 4.636 3.772 8.407 8.408 8.407 4.636 0 8.408-3.771 8.408-8.407s-3.772-8.408-8.408-8.408z"
                fill={color}
                strokeWidth={0.2}
            />
        </Svg>
    )
}

export default Search