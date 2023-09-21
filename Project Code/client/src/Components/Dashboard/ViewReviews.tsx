import React from "react";
import { getRootURL } from "../../utils/utils";
import { useQuery } from "react-query";
import ReviewCards from "./ViewReviewCard";
import useHostProfile from "../../hooks/useHostProfile";
import { Rating } from "@mui/material";

interface IProps {
    hostId?: number
}

function Reviews({ hostId }: IProps){

  const fetchReviews = async () => {
    const resp = await fetch(`${getRootURL()}review/gethostreviews?host_id=${hostId}`)
    return resp.json();
  }
  const {data, status, refetch } = useQuery("reviews", fetchReviews);

  return <>
    <div className="dashboard-container">
        <h4>Customer Reviews</h4>
      {
        (status === "success") &&
        data.map((review: any, index: number) => {
          return (
            <ReviewCards key={index} id={review.id} onReply={refetch}/>
          )
        })
      }
    
    </div>
  </>
}

export default Reviews;