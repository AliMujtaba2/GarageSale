import * as React from "react"
import Svg, { Path } from "react-native-svg"

function SendMessegeSVG(props) {
  return (
    <Svg
      width="30px"
      height="30px"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Path
        d="M10.3 13.695l9.802-9.798m-9.523 10.239l2.223 4.444c.537 1.075.806 1.612 1.144 1.756a1 1 0 00.903-.061c.316-.188.51-.757.898-1.893l4.2-12.298c.338-.99.506-1.485.39-1.813a1 1 0 00-.609-.61c-.328-.115-.823.054-1.813.392l-12.297 4.2c-1.137.387-1.705.581-1.893.897a1 1 0 00-.061.904c.144.338.681.607 1.755 1.143l4.445 2.223c.177.088.265.133.342.192a1 1 0 01.182.181c.059.077.103.166.191.343z"
        stroke="#000"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  )
}

export default SendMessegeSVG
