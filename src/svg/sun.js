import * as React from "react";
import Svg, { Circle, Path } from "react-native-svg";
const LightThemeSVG = ({ color, ...props }) => (
  <Svg
    width="20px"
    height="20px"
    viewBox="0 0 24 24"
    fill={color}
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Circle cx={12} cy={12} r={5} stroke={color} strokeWidth={1.5} />
    <Path
      d="M12 2V4"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
    />
    <Path
      d="M12 20V22"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
    />
    <Path
      d="M4 12L2 12"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
    />
    <Path
      d="M22 12L20 12"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
    />
    <Path
      opacity={0.5}
      d="M19.7778 4.22266L17.5558 6.25424"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
    />
    <Path
      opacity={0.5}
      d="M4.22217 4.22266L6.44418 6.25424"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
    />
    <Path
      opacity={0.5}
      d="M6.44434 17.5557L4.22211 19.7779"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
    />
    <Path
      opacity={0.5}
      d="M19.7778 19.7773L17.5558 17.5551"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
    />
  </Svg>
);
export default LightThemeSVG;
