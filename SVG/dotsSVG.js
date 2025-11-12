import * as React from "react"
import Svg, { Path } from "react-native-svg"

function DotSVG(props) {
  return (
    <Svg
      width="20px"
      height="20px"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Path
        d="M8 12a2 2 0 110 4 2 2 0 010-4zM8 6a2 2 0 110 4 2 2 0 010-4zM10 2a2 2 0 10-4 0 2 2 0 004 0z"
        fill="#000"
      />
    </Svg>
  )
}

export default DotSVG
