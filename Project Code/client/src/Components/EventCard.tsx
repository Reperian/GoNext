import { Skeleton } from "@mui/material";
import useEvent from "../hooks/useEvent";
import { getRootURL } from "../utils/utils";

import "../css/EventCard.scss";
import { Button } from "react-bootstrap";
import dateFormat from "dateformat";
import { Link } from "react-router-dom";
import EventCardSkeleton from "./EventCardSkeleton";

interface IProps {
  id?: number;
}

export default function EventCard({ id }: IProps) {
  const {
    eventDataStatus,
    thumbnail,
    event_name,
    event_start,
    location,
    cost,
  } = useEvent(id);

  if (eventDataStatus !== "success") {
    return <EventCardSkeleton/>;
  }

  return (
    <Link
      style={{ textDecoration: "none", color: "black" }}
      to={`/Event/view?id=${id}`}
      className="card-container"
    >
      <img
        src={`${getRootURL()}images/get?id=${thumbnail}`}
        alt="thumbnail"
        className="card-img"
      />
      <div className="card-description">
        <h2 className={"card-title card-bold"}>{event_name}</h2>
        <p className={"card-time card-gen-desc"}>
          {dateFormat(event_start, "h:MM TT")},{" "}
          {dateFormat(event_start, "mmmm d yyyy")}
        </p>
        <p className={"card-location card-gen-desc"}>{location}</p>
        <div className="card-price-buy">
          <h2 className={"card-price card-bold"}>${cost}</h2>
          <Button className="card-buy-btn card-bold">Book</Button>
        </div>
      </div>
    </Link>
  );
}
