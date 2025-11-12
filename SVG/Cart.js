import * as React from "react"
import Svg, { Path } from "react-native-svg"

function CartSVG(props) {
  return (
    <Svg
      width="25px"
      height="25px"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Path
        d="M7.3 5H22l-2 7H8.377M21 16H9L7 3H4m0 5H2m3 3H2m4 3H2m8 6a1 1 0 11-2 0 1 1 0 012 0zm11 0a1 1 0 11-2 0 1 1 0 012 0z"
        stroke="#547ac2ff"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  )
}

export default CartSVG
