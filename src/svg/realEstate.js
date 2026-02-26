import * as React from "react"
import Svg, { Path } from "react-native-svg"

function EstateSVG(props) {
  return (
    <Svg
      fill="#6f6a9cff"
      width="25"
      height="25"
      viewBox="0 0 50 50"
      baseProfile="tiny"
      xmlns="http://www.w3.org/2000/svg"
      overflow="inherit"
      {...props}
    >
      <Path d="M14.237 39.5H44.72V13.419H14.237V39.5zm15.489-23.485l10.99 9.598h-2.769v11.516h-6.436V29h-4.065v8.129H21.35V25.613h-2.84l11.216-9.598zM10.85 6.984V1.018H4.076V50h6.774V10.033h35.226V6.984z" />
    </Svg>
  )
}

export default EstateSVG
