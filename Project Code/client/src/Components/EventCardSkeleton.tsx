import { Skeleton } from "@mui/material";
import "../css/EventCard.scss";

// Skeleton for cards in card grid container
export default function EventCardSkeleton() {
  return (
    <div className="card-container">
      <Skeleton variant="rounded" className="card-img" animation="wave" />
      <div className="card-description">
        <Skeleton
          variant="text"
          className={"card-title card-bold"}
          animation="wave"
        />
        <Skeleton
          variant="text"
          className={"card-time card-gen-desc"}
          animation="wave"
        />
        <Skeleton
          variant="text"
          className={"card-location card-gen-desc"}
          animation="wave"
        />
        <div className="card-price-buy">
          <Skeleton
            variant="text"
            className={"card-price card-bold"}
            animation="wave"
            sx={{ width: "15%" }}
          />
          <Skeleton
            variant="rounded"
            className="card-buy-btn card-bold"
            sx={{ width: "30%" }}
            animation="wave"
          />
        </div>
      </div>
    </div>
  );
}
