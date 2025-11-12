import * as React from "react"
import Svg, { Path } from "react-native-svg"

function CreateSaleSVG(props) {
  return (
    <Svg
      width="25px"
      height="25px"
      viewBox="0 0 24 24"
      fill={'white'}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Path fill="none" d="M0 0H24V24H0z" />
      <Path d="M21 14v5a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h5v2H5v14h14v-5h2z" />
      <Path d="M21 7h-4V3h-2v4h-4v2h4v4h2V9h4" />
    </Svg>
  )
}

export default CreateSaleSVG
