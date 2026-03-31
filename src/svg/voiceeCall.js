import * as React from "react"
import { white } from "react-native-paper/lib/typescript/styles/themes/v2/colors"
import Svg, { Path } from "react-native-svg"
/* SVGR has dropped some elements not supported by react-native-svg: style */

function VoiceCallSVG(props) {
    return (
        <Svg
            height="30px"
            width="30px"
            id="_x32_"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 512 512"
            xmlSpace="preserve"
            fill='#002950ff'
            {...props}
        >
            <Path
                className="st0"
                d="M337.168 289.578c-5.129-5.133-13.457-5.133-18.598 0l-16.031 16.038c-4.68 4.68-12.122 5.149-17.352 1.102 0 0-15.332-10.109-40.402-35.179s-35.175-40.414-35.175-40.414c-4.055-5.226-3.578-12.656 1.102-17.343l16.031-16.031c5.141-5.134 5.141-13.462 0-18.594l-35.34-35.343c-5.133-5.133-13.453-5.133-18.594 0-.122.125-1.906 1.906-21.309 21.32-22.602 22.594 7.293 91.82 57.574 142.118 50.289 50.281 119.527 80.164 142.121 57.578 19.394-19.406 21.184-21.203 21.305-21.32 5.141-5.133 5.141-13.461 0-18.586l-35.332-35.346z"
            />
            <Path
                className="st0"
                d="M256 0C114.614 0 0 114.617 0 256s114.614 256 256 256 256-114.617 256-256S397.386 0 256 0zm0 472c-119.102 0-216-96.898-216-216S136.898 40 256 40s216 96.898 216 216-96.898 216-216 216z"
            />
        </Svg>
    )
}

export default VoiceCallSVG
