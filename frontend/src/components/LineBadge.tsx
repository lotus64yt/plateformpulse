import { Line, LineType } from "@/types/line";

export default function LineBadge({ line }: { line?: Line }) {
  if (!line) return null;

  switch (line.Type) {
    case LineType.LineRer:
    case LineType.LineTrain:
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 116 116"
          width="40"
          height="40"
          role="img"
          aria-label="Line badge"
        >
          <rect
            x="18"
            y="18"
            width="80"
            height="80"
            rx="10"
            fill={`#${line.Color}`}
          />
          <text
            x="58"
            y="75"
            textAnchor="middle"
            fill="#fff"
            fontSize="52"
            fontWeight="700"
            fontFamily="sans-serif"
          >
            {line.Name}
          </text>
        </svg>
      );
    case LineType.LineMetro:
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 116 116"
          width="40"
          height="40"
          role="img"
          aria-label="Line badge"
        >
          <circle cx="58" cy="58" r="40" fill={`#${line.Color}`} />
          <text
            x="58"
            y="75"
            textAnchor="middle"
            fill="#fff"
            fontSize="52"
            fontWeight="700"
            fontFamily="sans-serif"
          >
            {line.Name}
          </text>
        </svg>
      );
    case LineType.LineTram:
    default:
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="60 -30 45 40"
          width="40"
          height="40"
          role="img"
          aria-label="Tram line badge"
        >
          <text
            x="82"
            y="-5"
            textAnchor="middle"
            fill="#fff"
            fontSize="15"
            fontWeight="700"
            fontFamily="sans-serif"
          >
            {line.Name}
          </text>
          <path
            d="M 95.70763,-21.606283 H 68.084509 c -0.84761,0 -1.5341,-0.68783 -1.5341,-1.5341 v -1.53679 c 0,-0.84627 0.68649,-1.5341 1.5341,-1.5341 H 95.70763 c 0.847608,0 1.534098,0.68783 1.534098,1.5341 v 1.53679 c 0,0.84627 -0.68649,1.5341 -1.534098,1.5341"
            style={{
              fill: `#${line.Color}`,
              fillOpacity: 1,
              fillRule: "nonzero",
              stroke: "none",
              strokeWidth: 1.354,
            }}
          />
          <path
            d="m 97.241998,2.9462973 v -1.53679 c 0,-0.84626984 -0.68649,-1.53271994 -1.534098,-1.53271994 H 68.084779 c -0.84761,0 -1.53406,0.6864501 -1.53406,1.53271994 v 1.53679 c 0,0.8462592 0.68645,1.534099 1.53406,1.534099 H 95.7079 c 0.847608,0 1.534098,-0.6878398 1.534098,-1.534099"
            style={{
              fill: `#${line.Color}`,
              fillOpacity: 1,
              fillRule: "nonzero",
              stroke: "none",
              strokeWidth: 1.354,
            }}
          />
        </svg>
      );
  }
}
