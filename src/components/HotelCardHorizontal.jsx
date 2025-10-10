import "../styles/Hotels.css";

const HotelCardHorizontal = ({ hotel }) => {
  const { name, street, city, state, pin, rating, total_rooms, image } = hotel;
  const fullAddress = [street, city, state, pin].filter(Boolean).join(", ");    

  return (
    <article className="hotel-card-horizontal" role="article" aria-label={name}>
      <div className="hotel-card-horizontal-img">
        <img src={image || "/placeholder.svg"} alt={`${name} exterior`} />
      </div>
      <div className="hotel-card-horizontal-body">
        <header className="hotel-card-horizontal-header">
          <h3>{name}</h3>
          <div className="hotel-card-horizontal-stars" aria-label={`Rating ${rating} out of 5`}>
            <span className="stars-inline">
              {"★".repeat(Math.floor(rating || 0))}
              {"☆".repeat(5 - Math.floor(rating || 0))}
            </span>
            <span className="rating-pill">{(rating || 0).toFixed(1)}</span>
          </div>
        </header>
        <p className="hotel-card-horizontal-address">{fullAddress}</p>
        <div className="hotel-card-horizontal-meta">
          <span className="chip">Rooms: {total_rooms ?? "-"}</span>
        </div>
        <div className="hotel-card-horizontal-actions">
          <button className="btn-primary-sm" type="button">
            Book
          </button>
          <button className="btn-outline-sm" type="button">
            Details
          </button>
        </div>
      </div>
    </article>
  );
}

export default HotelCardHorizontal;
