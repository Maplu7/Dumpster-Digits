import "./StarTwinkleOverlay.css";

const STAR_POSITIONS = [
  { left: "12%", top: "18%", size: "small", delay: "0s", duration: "5.2s" },
  { left: "24%", top: "34%", size: "tiny", delay: "1.2s", duration: "6.1s" },
  { left: "38%", top: "14%", size: "small", delay: "2.1s", duration: "5.6s" },
  { left: "57%", top: "29%", size: "tiny", delay: "0.7s", duration: "6.4s" },
  { left: "71%", top: "16%", size: "small", delay: "1.8s", duration: "5.3s" },
  { left: "83%", top: "40%", size: "tiny", delay: "2.8s", duration: "6.6s" },
  { left: "18%", top: "68%", size: "tiny", delay: "3.1s", duration: "7s" },
  { left: "49%", top: "74%", size: "small", delay: "1.5s", duration: "5.9s" },
  { left: "76%", top: "66%", size: "tiny", delay: "0.4s", duration: "6.8s" },
  { left: "8%", top: "50%", size: "tiny", delay: "2.6s", duration: "6.5s" },
  { left: "90%", top: "60%", size: "tiny", delay: "1.9s", duration: "7.2s" },
  { left: "44%", top: "6%", size: "tiny", delay: "3.4s", duration: "6.9s" },
];

export default function StarTwinkleOverlay({
  image,
  alt = "preview",
  problem = "1 + 5",
}) {
  return (
    <div className="star-preview-shell">
      <img src={image} alt={alt} className="star-preview-base" />

      <div className="random-star-layer">
        {STAR_POSITIONS.map((star, index) => (
          <span
            key={index}
            className={`random-star ${star.size}`}
            style={{
              left: star.left,
              top: star.top,
              animationDelay: star.delay,
              animationDuration: star.duration,
            }}
          />
        ))}
      </div>

      <div className="shooting-star shooting-star-1">
        <span className="trail-glow" />
      </div>

      <div className="shooting-star shooting-star-2">
        <span className="trail-glow" />
      </div>

      <div className="camp-math-overlay">
        <div className="camp-math-text">{problem}</div>
      </div>
    </div>
  );
}