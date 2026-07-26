import { CustomSvgProps } from "@/types"
import Svg, { Mask, Rect } from "react-native-svg"

const Grid: React.FC<CustomSvgProps> = ({ color = "#4D4D4D", isBold = false, ...props }) => {
    return (
        <>
            {isBold
                ? <Svg
                    width={23}
                    height={23}
                    viewBox="0 0 23 23"
                    fill="none"
                    {...props}
                >
                    <Mask id="a" fill="#fff">
                        <Rect width={9.85699} height={9.85714} rx={1} />
                    </Mask>
                    <Rect
                        width={9.85699}
                        height={9.85714}
                        rx={1}
                        fill={color}
                        stroke={color}
                        strokeWidth={2.8}
                        mask="url(#a)"
                    />
                    <Mask id="b" fill="#fff">
                        <Rect x={13.143} width={9.85699} height={9.85714} rx={1} />
                    </Mask>
                    <Rect
                        x={13.143}
                        width={9.85699}
                        height={9.85714}
                        rx={1}
                        fill={color}
                        stroke={color}
                        strokeWidth={2.8}
                        mask="url(#b)"
                    />
                    <Mask id="c" fill="#fff">
                        <Rect x={13.143} y={13.1429} width={9.85699} height={9.85714} rx={1} />
                    </Mask>
                    <Rect
                        x={13.143}
                        y={13.1429}
                        width={9.85699}
                        height={9.85714}
                        rx={1}
                        fill={color}
                        stroke={color}
                        strokeWidth={2.8}
                        mask="url(#c)"
                    />
                    <Mask id="d" fill="#fff">
                        <Rect y={13.1429} width={9.85699} height={9.85714} rx={1} />
                    </Mask>
                    <Rect
                        y={13.1429}
                        width={9.85699}
                        height={9.85714}
                        rx={1}
                        fill={color}
                        stroke={color}
                        strokeWidth={2.8}
                        mask="url(#d)"
                    />
                </Svg>
                : <Svg
                    width={24}
                    height={24}
                    viewBox="0 0 24 24"
                    fill="none"
                    {...props}
                >
                    <Mask id="a" fill="#fff">
                        <Rect y={1} width={9.85699} height={9.85714} rx={1} />
                    </Mask>
                    <Rect
                        y={1}
                        width={9.85699}
                        height={9.85714}
                        rx={1}
                        stroke={color}
                        strokeWidth={2.8}
                        mask="url(#a)"
                    />
                    <Mask id="b" fill="#fff">
                        <Rect x={13.143} y={1} width={9.85699} height={9.85714} rx={1} />
                    </Mask>
                    <Rect
                        x={13.143}
                        y={1}
                        width={9.85699}
                        height={9.85714}
                        rx={1}
                        stroke={color}
                        strokeWidth={2.8}
                        mask="url(#b)"
                    />
                    <Mask id="c" fill="#fff">
                        <Rect x={13.143} y={14.1429} width={9.85699} height={9.85714} rx={1} />
                    </Mask>
                    <Rect
                        x={13.143}
                        y={14.1429}
                        width={9.85699}
                        height={9.85714}
                        rx={1}
                        stroke={color}
                        strokeWidth={2.8}
                        mask="url(#c)"
                    />
                    <Mask id="d" fill="#fff">
                        <Rect y={14.1429} width={9.85699} height={9.85714} rx={1} />
                    </Mask>
                    <Rect
                        y={14.1429}
                        width={9.85699}
                        height={9.85714}
                        rx={1}
                        stroke={color}
                        strokeWidth={2.8}
                        mask="url(#d)"
                    />
                </Svg>
            }
        </>
    )
}

export default Grid