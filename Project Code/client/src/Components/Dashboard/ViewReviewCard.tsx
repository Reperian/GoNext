import { IconButton, Rating } from "@mui/material";
import useEvent from "../../hooks/useEvent";
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { getRootURL } from "../../utils/utils";
import restAPI from '../../http-common';
import dateFormat from "dateformat";
import { Link, useNavigate } from "react-router-dom";
import { propTypes } from "react-bootstrap/esm/Image";
import useReview from "../../hooks/useReview";
import "../../css/ViewReviewCard.scss"
import { Button, Form } from "react-bootstrap";
import React from "react";

interface IProps {
  id?: number;
  onReply: Function;
}

function ReviewCards({ id, onReply}: IProps) {
  const navigate = useNavigate();

  // dictionary for custom errors
  const errorDict: { [key: string]: string} = {};
  const [errors, setErrors] = React.useState(errorDict);

  const [validated, setValidated] = React.useState(false)
  const [formReply, setFormReply] = React.useState("");
  const [replyOpen, setReplyOpen] = React.useState(false);

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

  // handles reply button state
  function handleReplyButtonChange() {

    replyOpen ? setReplyOpen(false) : setReplyOpen(true)

  }

  // reply must be shorter than 2000 characters
  function handleFormReplyChange(e: any) {

    setFormReply(e.slice(0, 2000))

  }

  // returns a dictionary of error messages given a form
  function generateErrorMessages (form: any) {

    // dictionary of custom errors
    const newErrors: {[key: string]: string} = {}

    if (formReply.length < 1) {
      newErrors.formReply = "Please enter your reply"
    }
    return newErrors
  }

  // handles reply form submission
  async function onSubmit(e: any) {

    const form = e.currentTarget;

    const data = {
      review_id: id,
      description: formReply,
    };

    const formErrors = generateErrorMessages(form)

    // if errors exist, form cannot be submitted
    if (Object.keys(formErrors).length > 0) {
    
      console.log("errors")
      e.preventDefault(); // prevents the default behaviour (submitting the form)
      e.stopPropagation();
      setErrors(formErrors)
    
    } else {
    
      try {
        const response = await restAPI.post("review/reply", data);
        onReply(); // refetches reviews
      } catch (errResponse: any) {
        if (errResponse.response.status === 403) {
          alert(errResponse.response.data);
        }
        // Unaccounted for error
        else {
          console.error("UNACCOUNTED ERROR HAS OCCURRED");
          console.error(errResponse);
        }
      }
    }

    setValidated(true);
    
  }

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
      
        <div className="reply-input">
          {reply === null &&

            <div className="reply-button">
            {replyOpen ?

              <Button className="button" variant="" size="sm" type="button" onClick={handleReplyButtonChange}>
                Close
              </Button>

            :

              <Button className="button" variant="" size="sm" type="button" onClick={handleReplyButtonChange}>
                Reply
              </Button>

            }

            </div>

          }
          
          {replyOpen && 
            <Form
              noValidate
              validated={validated}
              onSubmit={onSubmit}
              className="mt-4 w-50">

              <Form.Group className="mb-4" controlId="formGridReply">
                <Form.Label>Reply ({formReply.length}/2000)</Form.Label>
                <Form.Control
                  required
                  as='textarea'
                  rows={10}
                  type="text"
                  placeholder="Reply"
                  isInvalid={!!errors.formErrors}
                  value={formReply}
                  onChange={e => handleFormReplyChange(e.target.value)} />
                  <Form.Control.Feedback type="invalid">
                    {errors.formReply}
                  </Form.Control.Feedback>
              </Form.Group>

              <div className="d-grid gap-2">
                <Button className="button" variant="" size="lg" type="submit">
                  Post Reply!
                </Button>
              </div>

            </Form>
          }   
        </div>
        
      </div> 
    }
  </>
}
export default ReviewCards;