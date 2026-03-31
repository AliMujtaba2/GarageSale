import * as React from "react"
import Svg, { Path } from "react-native-svg"

function VideoCallSVG(props) {
    return (
        <Svg
            width="35px"
            height="35px"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            {...props}
        >
            <Path
                d="M14 11l3-1.5v5L14 13m7-1a9 9 0 11-18 0 9 9 0 0118 0zM8 15h5a1 1 0 001-1v-4a1 1 0 00-1-1H8a1 1 0 00-1 1v4a1 1 0 001 1z"
                stroke='#002950ff'
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </Svg>
    )
}

export default VideoCallSVG
