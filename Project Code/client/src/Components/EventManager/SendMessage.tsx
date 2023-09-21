import React from 'react';
import { Form, Button } from 'react-bootstrap';
import "../../css/SendMessage.scss";
import restAPI from '../../http-common'
import { useSearchParams } from 'react-router-dom';

function SendMessage() {

  let [params] = useSearchParams();
  const id = Number(params.get("id"));
  const [message, setMessage] = React.useState("");

  const errorDict: { [key: string]: string} = {};
  const [errors, setErrors] = React.useState(errorDict);
 
  const [validated, setValidated] = React.useState(false);

  function handleMessageChange(e: any) {

    setMessage(e.slice(0, 2000))

  }

  function generateErrorMessages (form: any) {

    // dictionary of custom errors
    const newErrors: {[key: string]: string} = {}

    if (message.length < 1) {
      newErrors.message = "Please enter your message"
    }
    return newErrors
  }

  async function onSubmit(e: any) {

    const form = e.currentTarget;
    e.preventDefault();

    const data = {
      event_id: id,
      message: message,
    };

    const formErrors = generateErrorMessages(form)

    if (Object.keys(formErrors).length > 0) {
    
      console.log("errors")
      e.preventDefault(); // prevents the default behaviour (submitting the form)
      e.stopPropagation();
      setErrors(formErrors)
    
    } else {

      try {
        await restAPI.post("user/hostingevents/messageattendees", data);

        const errorDict: { [key: string]: string} = {};
        setErrors(errorDict);
        setValidated(true);

        alert("Message sent!");

        setMessage("")
        setValidated(false);


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

    
    
  }

  return <>

    <div className='background'>
        <div className='custom-container'>
        <h4>
          Send Message to All Attendees
        </h4>        
            
        <Form
          noValidate
          validated={validated}
          onSubmit={onSubmit}
          className="mt-4 w-50">

          <Form.Group className="mb-4" controlId="formGridDescription">
            <Form.Label>Message ({message.length}/2000)</Form.Label>
            <Form.Control
              as='textarea'
              required
              rows={10}
              type="text"
              placeholder="Message"
              isInvalid={!!errors.message}
              value={message}
              onChange={e => handleMessageChange(e.target.value)} />
              <Form.Control.Feedback type="invalid">
                {errors.message}
              </Form.Control.Feedback>
          </Form.Group>
          
          

          <div className="d-grid gap-2">
            <Button className="button" variant="" size="lg" type="submit">
              Send Message!
            </Button>
          </div>

        </Form>

      </div>
    </div>
  </>
}

export default SendMessage;