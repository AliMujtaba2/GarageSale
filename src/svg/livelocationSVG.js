import * as React from "react"
import Svg, { Path } from "react-native-svg"

function LiveLocationSVG(props) {
  return (
    <Svg
      width="25px"
      height="25px"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Path d="M8 10a2 2 0 100-4 2 2 0 000 4z" fill="#7c84ebff" />
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M2.083 7A6.005 6.005 0 017 2.083V0h2v2.083A6.005 6.005 0 0113.917 7H16v2h-2.083A6.005 6.005 0 019 13.917V16H7v-2.083A6.005 6.005 0 012.083 9H0V7h2.083zM4 8a4 4 0 118 0 4 4 0 01-8 0z"
        fill="#7c84ebff"
      />
    </Svg>
  )
}

export default LiveLocationSVG