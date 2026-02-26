import * as React from "react"
import Svg, { G, Path, Defs, ClipPath } from "react-native-svg"

function ChatSVG ({ color, ...props }) {
  return (
    <Svg
      width="25px"
      height="25px"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <G clipPath="url(#clip0_8_53)" fill={color }>
        <Path d="M16 12a1 1 0 01-.38-.07 1.06 1.06 0 01-.33-.22c-.09-.092-.161-.2-.21-.32A1.09 1.09 0 0115 11a1 1 0 012 0 1.09 1.09 0 01-.08.39c-.049.12-.12.228-.21.32A1.002 1.002 0 0116 12zM12 12a1 1 0 01-.38-.07 1.06 1.06 0 01-.33-.22c-.09-.092-.161-.2-.21-.32A1.09 1.09 0 0111 11a1 1 0 012 0 1.09 1.09 0 01-.08.39c-.049.12-.12.228-.21.32A1.002 1.002 0 0112 12zM8 12a1 1 0 01-.38-.07 1.06 1.06 0 01-.33-.22 1 1 0 01-.21-.32A1.09 1.09 0 017 11a1 1 0 012 0 1.09 1.09 0 01-.08.39 1 1 0 01-.21.32A1.002 1.002 0 018 12z" />
      </G>
      <Path
        d="M5 16.55v3.35a2.1 2.1 0 003.54 1.53l2.61-2.46h.87c5.52 0 10-3.8 10-8.5s-4.48-8.5-10-8.5-10 3.81-10 8.5a7.93 7.93 0 003 6.06l-.02.02z"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Defs>
        <ClipPath id="clip0_8_53">
          <Path fill="#fff" transform="translate(7 10)" d="M0 0H10V2H0z" />
        </ClipPath>
      </Defs>
    </Svg>
  )
}

export default ChatSVG
