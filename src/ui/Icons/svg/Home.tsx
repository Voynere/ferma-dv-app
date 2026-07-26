import { CustomSvgProps } from "@/types"
import Svg, { Path } from "react-native-svg"

const Home: React.FC<CustomSvgProps> = ({ color = "#4D4D4D", isBold = false, ...props }) => {
    return (
        <>
            {isBold
                ? <Svg
                    width={24}
                    height={24}
                    viewBox="0 0 24 24"
                    fill="none"
                    {...props}
                >
                    <Path
                        d="M1.5 9.031V22a.5.5 0 00.5.5h6.27a.5.5 0 00.5-.5v-7.885a.5.5 0 01.5-.5h5.46a.5.5 0 01.5.5V22a.5.5 0 00.5.5H22a.5.5 0 00.5-.5V9.031a.5.5 0 00-.215-.41l-10-6.924a.5.5 0 00-.57 0l-10 6.923a.5.5 0 00-.215.411z"
                        fill={color}
                        stroke={color}
                    />
                </Svg>
                : <Svg
                    width={24}
                    height={24}
                    viewBox="0 0 24 24"
                    fill="none"
                    {...props}
                >
                    <Path
                        d="M1.5 9.031V22a.5.5 0 00.5.5h6.27a.5.5 0 00.5-.5v-7.885a.5.5 0 01.5-.5h5.46a.5.5 0 01.5.5V22a.5.5 0 00.5.5H22a.5.5 0 00.5-.5V9.031a.5.5 0 00-.215-.41l-10-6.924a.5.5 0 00-.57 0l-10 6.923a.5.5 0 00-.215.411z"
                        stroke={color}
                        strokeWidth={1.4}
                    />
                </Svg>
            }
        </>
    )
}

export default Home