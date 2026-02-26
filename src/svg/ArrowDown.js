import * as React from "react"
import Svg, { Path } from "react-native-svg"

function ArrowDown({color , ...props}) {
  return (
    <Svg
      width="20px"
      height="20px"
      viewBox="0 -4.5 20 20"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Path
        d="M164.292 6524.366c-.39.405-.39 1.06 0 1.464l8.264 8.563c.78.81 2.047.81 2.827 0l8.325-8.625c.385-.4.39-1.048.01-1.454a.976.976 0 00-1.425-.011l-7.617 7.893a.975.975 0 01-1.414 0l-7.557-7.83a.974.974 0 00-1.413 0"
        transform="translate(-220 -6684) translate(56 160)"
        fill={color}
        stroke="none"
        strokeWidth={2}
        fillRule="evenodd"
      />
    </Svg>
  )
}

export default ArrowDown
