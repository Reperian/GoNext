import React from "react";
import { getRootURL } from "../utils/utils";
import { useQuery } from "react-query";
import EventReviewCards from "./EventReviewCards";
import { useNavigate, useSearchParams } from "react-router-dom";
import ViewEventsCards from "../Components/HostProfile/ViewEventsCard";
import NavbarGuest from "../Components/NavbarGuest";
import "../css/EventReviews.scss"
import { Button } from "react-bootstrap";
import { Rating } from "@mui/material";

function Reviews() {

  let [params] = useSearchParams();
  const event_id = Number(params.get("event_id"));
  const navigate = useNavigate();

  const fetchReviews = async () => {
    const resp = await fetch(`${getRootURL()}review/geteventreviews?event_id=${event_id}`)
    return resp.json();
  }

  const fetchAvgRating = async () => {
    const resp = await fetch(`${getRootURL()}events/avgreview?event_id=${event_id}`)
    return resp.json();
  }

  const fetchReviewStatus = async () => {
    const resp = await fetch(`${getRootURL()}user/reviewstatus?token=${localStorage.getItem("token")}&event_id=${event_id}`)
    return resp.json();
  }

  const { data, status, refetch } = useQuery("reviews", fetchReviews);
  const { data: avgRatingData, status: avgRatingStatus, refetch: refetchAvgRating, error } = useQuery("avgRating", fetchAvgRating);
  const { data: reviewStatusData, status: reviewStatusStatus, refetch: refetchReviewStatusStatus } = useQuery("reviewStatus", fetchReviewStatus);

  console.log(reviewStatusData)
  function handleAddReview() {
    navigate(`/review/add?id=${event_id}`)
  }

  return <>
    <NavbarGuest />
    <div className="background">
      <div className="dashboard-container">
        <h1 style={{ textAlign: "center" }}> Reviews </h1>
        <div className='rating'>

          {avgRatingStatus === 'success' && avgRatingData > 0 ?
            <>
              <p style={{ fontWeight: "bold" }}> {avgRatingData.toFixed(1)} </p>
              <Rating size="large" name="read-only" value={avgRatingData} precision={0.1} readOnly />
            </>
            :
            <>
              <p> No reviews yet</p>
              <Rating size="large" name="read-only" value={0} precision={0.1} readOnly />
            </>
          }

        </div>
        <div className='eventcard-container'>
          <ViewEventsCards id={event_id} />
        </div>

        {(reviewStatusStatus === "success" && reviewStatusData === false) ?

          <Button className="button" variant="" size="lg" type="button" onClick={handleAddReview}>
            Add Review
          </Button>

          :

          <Button className="button" variant="" size="lg" type="button" onClick={handleAddReview} disabled>
            Already Reviewed
          </Button>
        }

        {
          (status === "success") &&
          data.map((review: any, index: number) => {
            return (
              <EventReviewCards key={index} id={review.id} />
            )
          })
        }
      </div>
    </div>
  </>
}

export default Reviews;