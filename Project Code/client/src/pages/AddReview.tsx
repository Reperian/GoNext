import React from 'react';
import NavBarGuest from '../Components/NavbarGuest';
import { Form, Button } from 'react-bootstrap';
import "../css/AddReview.scss";
import restAPI from '../http-common'
import { useSearchParams } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import ViewEventsCards from '../Components/HostProfile/ViewEventsCard';
import { Rating } from '@mui/material';

function AddReview() {

  // get event_id from parameters
  let [params] = useSearchParams();
  const id = Number(params.get("id"));

  // states
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [rating, setRating] = React.useState(0)

  const [validated, setValidated] = React.useState(false);

  const navigate = useNavigate();
  
  // handles text input for title
  function handleTitleChange(e: any) {

    setTitle(e.slice(0, 65)) // title must be less than 65 characters long

  }

  // handles text input for description
  function handleDescriptionChange(e: any) {

    setDescription(e.slice(0, 2000)) // review description must be less than 2000 characters long

  }
  
  // handles form submission
  async function onSubmit(e: any) {

    const form = e.currentTarget;
    e.preventDefault();

    // payload
    const data = {
      token: localStorage.getItem("token"),
      event_id: id,
      title: title,
      description: description,
      rating: rating
    };

    // user must leave a rating
    if (rating < 1) {

      e.preventDefault(); // prevents the default behaviour (submitting the form)
      e.stopPropagation();

    }
    else {
      try {
        const response = await restAPI.post("review/add", data);
        navigate(`/event/reviews?event_id=${id}`);
      } catch (errResponse: any) {
        // Email already exists
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
    <NavBarGuest />
    <div className='background'>
      <div className='custom-container'>
        <h1>
          Post Review!
        </h1>

        <div className='eventcard-container'>
          <ViewEventsCards id={id} />
        </div>

        <div className='rating'>

          {rating < 1 ?

            <p style={{ color: "red" }}> Please add a rating</p>
            :

            <p> {rating}/5 </p>
          }

          <Rating
            name="simple-controlled"
            size="large"
            value={rating}
            onChange={(event, newValue) => {
              setRating(newValue)
            }}
          />

        </div>


        <Form
          noValidate
          validated={validated}
          onSubmit={onSubmit}
          className="mt-4 w-50">

          <Form.Group className="mb-4" controlId="formGridTitle">
            <Form.Label>Review Title ({title.length}/65)</Form.Label>
            <Form.Control
              type="text"
              placeholder="optional"
              value={title}
              onChange={e => handleTitleChange(e.target.value)} />
          </Form.Group>

          <Form.Group className="mb-4" controlId="formGridDescription">
            <Form.Label>Description ({description.length}/2000)</Form.Label>
            <Form.Control
              as='textarea'
              rows={10}
              type="text"
              placeholder="optional"
              value={description}
              onChange={e => handleDescriptionChange(e.target.value)} />
          </Form.Group>

          <div className="d-grid gap-2">
            <Button className="button" variant="" size="lg" type="submit">
              Post Review!
            </Button>
          </div>

        </Form>

      </div>
    </div>
  </>
}

export default AddReview;