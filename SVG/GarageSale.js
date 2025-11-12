import * as React from "react"
import Svg, { Path } from "react-native-svg"

function GarageSaleSVG(props) {
  return (
    <Svg
      fill="#6f6a9cff"
      width="25"
      height="25"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      xmlSpace="preserve"
      {...props}
    >
      <Path d="M141.594 323.626H370.406V349.18399999999997H141.594z" />
      <Path d="M141.594 265.31H370.406V292.279H141.594z" />
      <Path d="M141.594 380.531H370.406V406.1H141.594z" />
      <Path d="M256 17.617L1.066 112.598 1.066 170.454 16.739 170.454 44.784 170.454 467.216 170.454 495.261 170.454 510.934 170.454 510.934 112.598z" />
      <Path d="M467.216 463.036V200.944H44.784V463.036H0v31.347H512v-31.347h-44.784zm-65.463 0h-31.347v-25.59H141.594v25.59h-31.347V233.963h291.506v229.073z" />
    </Svg>
  )
}

export default GarageSaleSVG
