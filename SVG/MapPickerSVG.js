import * as React from "react"
import Svg, { Path } from "react-native-svg"

function MapPickerSVG(props) {
  return (
    <Svg
      height="30px"
      width="30px"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      xmlSpace="preserve"
      {...props}
    >
      <Path
        d="M256 264.828c-12.359 0-23.834-1.766-34.428-4.414l16.772 233.931C239.228 504.055 246.29 512 256 512c9.71 0 16.772-7.945 17.655-17.655l16.772-233.931c-10.592 2.648-22.068 4.414-34.427 4.414"
        fill="#d8d8d8"
        stroke="black"
        strokeWidth={5}
      />
      <Path
        d="M388.414 132.414C388.414 59.145 329.269 0 256 0S123.586 59.145 123.586 132.414 182.731 264.828 256 264.828s132.414-59.145 132.414-132.414"
        fill="#dd342e"
        stroke="black"
        strokeWidth={5}
      />
      <Path
        d="M158.897 141.241c-5.297 0-8.828-3.531-8.828-8.828 0-58.262 47.669-105.931 105.931-105.931 5.297 0 8.828 3.531 8.828 8.828s-3.531 8.828-8.828 8.828c-48.552 0-88.276 39.724-88.276 88.276 0 5.296-3.531 8.827-8.827 8.827"
        fill="#f86363"
        stroke="black"
        strokeWidth={5}
      />
    </Svg>
  )
}

export default MapPickerSVG
