import * as React from "react"
import Svg, { Path } from "react-native-svg"

function SignOutSVG({color, ...props}) {
  return (
    <Svg
      width="20px"
      height="20px"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Path
        d="M18 8l4 4m0 0l-4 4m4-4H9m6-7.796A8.383 8.383 0 0010.667 3C5.88 3 2 7.03 2 12s3.88 9 8.667 9A8.384 8.384 0 0015 19.796"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  )
}

export default SignOutSVG
