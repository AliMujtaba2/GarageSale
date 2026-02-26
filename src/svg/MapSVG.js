import * as React from "react"
import Svg, { Path, Circle } from "react-native-svg"

function MapSVG(props) {
  return (
    <Svg
      height="25px"
      width="25px"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      xmlSpace="preserve"
      {...props}
    >
      <Path d="M154.64 420.096L154.64 59.496 0 134 0 512z" />
      <Path
        d="M309.288 146.464L309.288 504.472 154.64 420.096 154.64 59.496z"
        fill="#333"
      />
      <Path d="M463.928 50.152L309.288 146.464 309.288 504.472 463.928 415.68z" />
      <Path
        d="M414.512 281.656l-11.92-15.744c-8.8-11.472-85.6-113.984-85.6-165.048C317.032 39.592 355.272 0 414.512 0S512 39.592 512 100.864c0 50.992-76.8 153.504-85.488 165.048l-12 15.744z"
        fill="#e21b1b"
      />
      <Circle cx={414.512} cy={101.536} r={31.568} fill="#fff" />
    </Svg>
  )
}

export default MapSVG
