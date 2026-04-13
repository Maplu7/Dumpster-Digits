import "./PolaroidCard.css";

export default function PolaroidCard({
  image,
  title,
  subtitle,
  onClick,
}) {
  return (
    <div className="polaroid" onClick={onClick}>
      <div className="polaroid-stars">
        <span className="polaroid-star polaroid-star-1" />
        <span className="polaroid-star polaroid-star-2" />
        <span className="polaroid-star polaroid-star-3" />
        <span className="polaroid-star polaroid-star-4" />
        <span className="polaroid-star polaroid-star-5" />
        <span className="polaroid-star polaroid-star-6" />
        <span className="polaroid-star polaroid-star-7" />
        <span className="polaroid-star polaroid-star-8" />
      </div>

      <div className="polaroid-image">
        <img src={image} alt={title} />
      </div>

      <div className="polaroid-caption">
        <h3>{title}</h3>
        {subtitle && <p>{subtitle}</p>}
      </div>
    </div>
  );
}