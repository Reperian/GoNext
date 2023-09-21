import React from 'react';
import NavBarGuest from '../Components/NavbarGuest';
import { Col, Row, Form, Button } from 'react-bootstrap';
import restAPI from '../http-common'
import { Link, useSearchParams } from 'react-router-dom';
import { useNavigate } from "react-router-dom";

function Payment() {

  let [params] = useSearchParams();
  const email = params.get("email");

  // states

  const [name, setName] = React.useState('');
  const [cvc, setcvc] = React.useState('');
  const [cardNumber, setCardNumber] = React.useState('');
  const [month, setMonth] = React.useState('');
  const [year, setYear] = React.useState('');
  const [validated, setValidated] = React.useState(false);

  const errorDict: { [key: string]: string } = {}; // dictionary of custom error messages
  const [errors, setErrors] = React.useState(errorDict);

  const navigate = useNavigate();

  // handles text input for month in form
  function handleMonthChange(e: any) {

    setMonth(e.slice(0, 2)) // month cannot be longer than 2 digits

  }

  // handles text input for year in form
  function handleYearChange(e: any) {

    setYear(e.slice(0, 2)) // year cannot be longer than 2 digits

  }

  // handles text input for cvc in form
  function handleCVCChange(e: any) {

    setcvc(e.slice(0, 3)) // cvc cannot be longer than 3 digits

  }

  // handles text input for card number in form
  function handleCardNumberChange(e: any) {

    // adds spaces in between every 4 characters for better visibility

    if (e.length === 4 || e.length === 9 || e.length === 14) {

      setCardNumber(e + ' ')

    } else if (e.length > 19) {
      setCardNumber(e.slice(0, 19))
    } else {
      setCardNumber(e)
    }

  }

  // returns custom error messages, given a form
  function generateErrorMessages(form: any) {

    // dictionary of custom errors
    const newErrors: { [key: string]: string } = {}

    const monthInt = parseInt(month) // converting month string to int
    const yearInt = parseInt(year) // converting year string to int

    // checking name errors

    if (name.length === 0) {

      newErrors.name = 'Please enter your name'
    }

    // checking expiry date restrictions
    if (monthInt <= 0 || monthInt > 12 || month === '') {

      newErrors.month = 'Please enter a valid expiry month'

    }

    if (yearInt < 22 || yearInt > 99 || year === '') {

      newErrors.year = 'Please enter a valid expiry year'

    }

    // checking card number is valid length

    if (cardNumber.length < 18) {

      newErrors.cardNumber = 'Please enter a valid card number'
    }

    // checking CVC is valid length

    if (cvc.length < 3) {
      newErrors.cvc = 'Please enter a valid CVC'
    }

    return newErrors
  }

  // handles payment details form submission
  async function onSubmit(e: any) {

    const form = e.currentTarget;
    e.preventDefault();

    // payload
    const data = {
      email: email,
      name: name,
      number: cardNumber,
      expiry_month: month,
      expiry_year: year,
      cvc: cvc
    };

    const formErrors = generateErrorMessages(form)

    // if errors exist, form cannot be submitted
    if (Object.keys(formErrors).length > 0 || form.checkValidity() === false) {

      console.log("errors")
      e.preventDefault(); // prevents the default behaviour (submitting the form)
      e.stopPropagation();
      setErrors(formErrors)

    } else {

      try {
        const response = await restAPI.post("register/addpayment/", data);
        alert("Payment details successfully saved!");
        navigate("/");
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
    <NavBarGuest />
    <div className='background'>
      <div className='custom-container'>
        <h1>
          Payment Details
        </h1>
        {/* form for payment details */}
        <Form
          noValidate
          validated={validated}
          onSubmit={onSubmit}
          className="mt-4 w-50">

          <Form.Group className="mb-4" controlId="formCardholderName">
            <Form.Label>Cardholder Name</Form.Label>
            <Form.Control
              required
              type='text'
              placeholder="Cardholder Name"
              isInvalid={!!errors.name}
              onChange={e => setName(e.target.value)} />
            <Form.Control.Feedback type="invalid">
              {errors.name}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-4" controlId="formCardNumber">
            <Form.Label>Card Number</Form.Label>
            <Form.Control
              required
              type='text'
              placeholder="Card Number"
              value={cardNumber}
              isInvalid={!!errors.cardNumber}
              onChange={e => handleCardNumberChange(e.target.value)} />
            <Form.Control.Feedback type="invalid">
              {errors.cardNumber}
            </Form.Control.Feedback>
          </Form.Group>

          <Row className="mb-4">
            <Form.Group as={Col} controlId="formGridExpiryMonth">
              <Form.Label>Expiry Month</Form.Label>
              <Form.Control
                required
                type="number"
                placeholder="Expiry Month"
                isInvalid={!!errors.month}
                value={month}
                onChange={e => handleMonthChange(e.target.value)} />
              <Form.Control.Feedback type="invalid">
                {errors.month}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group as={Col} controlId="formGridExpiryYear">
              <Form.Label>Expiry Year</Form.Label>
              <Form.Control
                required
                type="number"
                placeholder="Expiry Year"
                isInvalid={!!errors.year}
                value={year}
                onChange={e => handleYearChange(e.target.value)} />
              <Form.Control.Feedback type="invalid">
                {errors.year}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group as={Col} controlId="formGridCVC">
              <Form.Label>CVC</Form.Label>
              <Form.Control
                required
                type="number"
                placeholder="CVC"
                isInvalid={!!errors.cvc}
                value={cvc}
                onChange={e => handleCVCChange(e.target.value)} />
              <Form.Control.Feedback type="invalid">
                {errors.cvc}
              </Form.Control.Feedback>
            </Form.Group>
          </Row>

          <Link to={`/`}>
            I don't want to save my payment details right now
          </Link>


          <div className="d-grid gap-2">
            <Button className="button" variant="" size="lg" type="submit">
              Save Payment Details!
            </Button>
          </div>

        </Form>

      </div>
    </div>
  </>
}

export default Payment;