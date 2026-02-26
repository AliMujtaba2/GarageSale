import * as React from "react"
import Svg, { G, Path } from "react-native-svg"

function CategorySVG({ color, ...props }) {
  return (
    <Svg
      width="20px"
      height="20px"
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
      fill={color}
      {...props}
    >
      <G data-name="Layer 2">
        <Path d="M30 18h-6a1 1 0 00-1 1v1H9v-1a1 1 0 00-1-1H2a1 1 0 00-1 1v11a1 1 0 001 1h28a1 1 0 001-1V19a1 1 0 00-1-1zm-7 4v4H9v-4zM3 20h4v9H3zm6 8h14v1H9zm20 1h-4v-9h4zM28 17a1 1 0 001-1V4a1 1 0 00-1-1H4.13a1 1 0 00-1 1v12a1 1 0 001 1zM5.13 5H27v10H5.13z" />
        <Path d="M14 23H18V25H14z" />
      
      </G>
    </Svg>
  )
}

export default CategorySVG
