import { Rating } from "@mui/material";
import dateFormat from "dateformat";
import { Link } from "react-router-dom";
import useReview from "../../hooks/useReview";
import "../../css/ReviewCard.scss"

interface IProps {
  id?: number;
}

function ReviewCards({ id}: IProps) {

  const {
    reviewDataStatus,
    first_name,
    last_name,
    name,
    event,
    title,
    description,
    posted,
    reply,
    replied,
    rating,
    host_first_name,
    host_last_name
  } = useReview(id);

  return <>
    {
      reviewDataStatus === "success" &&
      <div className="review-card">
        <div className="review-text">
          <div className="review-card-top"> 
            
            <h5> {first_name[0].toUpperCase()+first_name.substring(1)} {last_name[0].toUpperCase()+last_name.substring(1)} </h5>
            <p style={{marginTop: '1.5px'}}> reviewed </p>
            <Link style={{textDecoration: "none"}} to={`/event/view?id=${event}`}>
              <h5 style={{color: "black"}}> {name} </h5>
            </Link>
          </div>
          <div className="review-card-bottom">
            <Rating sx={{marginTop: "10px", marginLeft: "-3px"}} name="read-only" value={rating} precision={1} readOnly/>
            <h5> {title} </h5>
            <p>{dateFormat(posted, "h:MM TT")},{" "}
            {dateFormat(posted, "mmmm d yyyy")}</p>
            <p className="description"> {description} </p>
          </div>
        </div>

        { reply !== null &&
        <div className="reply-text">
          <div className="reply-card-top"> 
            
            <h5> {host_first_name[0].toUpperCase()+host_first_name.substring(1)} {host_last_name[0].toUpperCase()+host_last_name.substring(1)} </h5>
            <p style={{marginTop: '1.5px'}}> replied </p>
          </div>
          <div className="reply-card-bottom">
            <p>{dateFormat(replied, "h:MM TT")},{" "}
            {dateFormat(replied, "mmmm d yyyy")}</p>
            <p className="reply"> {reply} </p>
          </div>
        </div>
        }   
      </div> 
    }
  </>
}

export default ReviewCards;