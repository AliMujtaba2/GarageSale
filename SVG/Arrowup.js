import * as React from "react"
import Svg, { Path } from "react-native-svg"

function ArrowupSVG(props) {
  return (
    <Svg
      width="35px"
      height="35px"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Path
        d="M18.293 15.29a1 1 0 000-1.415L13.4 8.988a2 2 0 00-2.828 0l-4.89 4.89a1 1 0 101.414 1.415l4.185-4.186a1 1 0 011.415 0l4.182 4.182a1 1 0 001.414 0z"
        fill="#0F0F0F"
      />
    </Svg>
  )
}

export default ArrowupSVG
