import * as React from "react"
import Svg, { Path } from "react-native-svg"

function LocationPin(props) {
  return (
    <Svg
      width="20px"
      height="20px"
      viewBox="0 0 24 24"
      fill="#3c99d6ff"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Path
        d="M12 21c3.5-3.6 7-6.824 7-10.8C19 6.224 15.866 3 12 3s-7 3.224-7 7.2 3.5 7.2 7 10.8z"
        stroke="#3c99d6ff"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M12 13a3 3 0 100-6 3 3 0 000 6z"
        stroke="#ffffffff"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  )
}

export default LocationPin
