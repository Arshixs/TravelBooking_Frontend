import "../styles/Hotels.css"

const HotelCard = ({ hotel }) => {
  const { name, street, city, state, pin, rating, total_rooms, image } = hotel

  const fullAddress = [street, city, state, pin].filter(Boolean).join(", ")

  const renderStars = (value) => {
    const full = Math.floor(value || 0)
    const empty = 5 - full
    return (
      <span className="hotel-stars-inline" aria-label={`Rating ${value} out of 5`}>
        {"★".repeat(full)}
        {"☆".repeat(empty)}
        <span className="hotel-rating-badge">{(value || 0).toFixed(1)}</span>
      </span>
    )
  }

  return (
    <div className="destination-card" role="article" aria-label={name}>
      <img src={image || "/placeholder.svg"} alt={`${name} in ${city || ""}`} />
      <div className="destination-overlay">
        <h3>{name}</h3>
        <p>{fullAddress}</p>
        <div className="hotel-overlay-meta">
          <span className="chip">Rooms: {total_rooms ?? "-"}</span>
          {renderStars(Number(rating))}
        </div>
        <button className="explore-btn">View</button>
      </div>
    </div>
  )
}

export default HotelCard
