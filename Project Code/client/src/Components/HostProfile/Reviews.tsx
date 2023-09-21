import React from "react";
import { getRootURL } from "../../utils/utils";
import { useQuery } from "react-query";
import ReviewCards from "./ReviewCards";

interface IProps {
    firstName?: string
    lastName?: string
    hostId?: number
}

function Reviews({ firstName, lastName, hostId }: IProps){

  const fetchReviews = async () => {
    const resp = await fetch(`${getRootURL()}review/gethostreviews?host_id=${hostId}`)
    return resp.json();
  }
  const {data, status } = useQuery("reviews", fetchReviews);
  
  return <>
    <div className="dashboard-container">
        <h4>{firstName[0].toUpperCase()+firstName.substring(1)} {lastName[0].toUpperCase()+lastName.substring(1)}'s Reviews</h4>
      
      {
        (status === "success") &&
        data.map((review: any, index: number) => {
          return (
            <ReviewCards key={index} id={review.id}/>
          )
        })
      }
    
    </div>
  </>
}

export default Reviews;