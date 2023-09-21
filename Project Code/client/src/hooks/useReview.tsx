import { useEffect } from "react";
import { useQuery } from "react-query";
import { getRootURL } from "../utils/utils";

interface IReviewResponse {
  first_name: string;
  last_name: string;
  id: number;
  event: number
  title: string;
  description: string;
  posted: string;
  reply: string;
  replied: string;
  rating: number;
  name: string;
  host_first_name: string;
  host_last_name: string;
}

export default function useReview(id: number) {
  // Fetch text data for event
  async function fetchReview() {
    const resp = await fetch(`${getRootURL()}review/getreview?review_id=${id}`).then(
      (response) => {
        if (response.ok) {
          return response.json();
        } else if (response.status === 404) {
          return Promise.reject(`Error 404: Event with id '${id}' does not exist`);
        } else {
          return Promise.reject("Uncaught critical error: " + response.status);
        }
      }
    );
      
    return resp;
  }

  const { data: reviewData, status: reviewDataStatus } = useQuery<IReviewResponse>(
    ["reviewDetails", id],
    fetchReview,
    {
      refetchOnWindowFocus: false
    });

    console.log("reviewData")
    console.log(reviewData)
    console.log(reviewDataStatus)
  return { reviewData, reviewDataStatus, ...reviewData };
}
