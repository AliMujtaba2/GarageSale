import * as React from "react"
import Svg, { Path } from "react-native-svg"

function Search({color, ...props}) {
  return (
    <Svg
      width="25"
      height="25"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Path
        d="M16.672 16.641L21 21m-2-10a8 8 0 11-16 0 8 8 0 0116 0z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  )
}

export default Search
