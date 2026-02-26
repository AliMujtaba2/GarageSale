import * as React from "react"
import Svg, { Path } from "react-native-svg"

function CarBootSVG(props) {
  return (
    <Svg
      
      width="23"
      height="23"
      viewBox="0 0 16 16"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M3 1L1.667 5H0v3h1v7h2v-2h10v2h2V8h1V5h-1.667L13 1H3zm1 8a1 1 0 100 2 1 1 0 000-2zm7.559-6H4.442L3.108 7h9.784l-1.333-4zM12 9a1 1 0 100 2 1 1 0 000-2z"
       fill="#6f6a9cff"
      />
    </Svg>
  )
}

export default CarBootSVG
