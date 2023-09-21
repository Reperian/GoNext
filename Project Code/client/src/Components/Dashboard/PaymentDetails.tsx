import React from 'react';
import { Col, Row, Form, Button } from 'react-bootstrap';
import restAPI from '../../http-common'
import { useNavigate } from "react-router-dom";
import { getRootURL } from '../../utils/utils';
import { useQuery } from 'react-query';
import { IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import '../../css/PaymentDetails.scss';

function PaymentDetails() {

  // states
  const [name, setName] = React.useState('');
  const [cvc, setcvc] = React.useState('');
  const [cardNumber, setCardNumber] = React.useState('');
  const [month, setMonth] = React.useState('');
  const [year, setYear] = React.useState('');
  const [validated, setValidated] = React.useState(false);

  // dictionary of custom error messages
  const errorDict: { [key: string]: string } = {};
  const [errors, setErrors] = React.useState(errorDict);

  const navigate = useNavigate();

  // gets payment details if they exist
  const fetchPaymentDetails = async () => {
    const resp = await fetch(`${getRootURL()}user/getpaymentdigits?token=${localStorage.getItem("token")}`)
    return resp.json();
  }
  const { data, status, refetch } = useQuery("paymentDetails", fetchPaymentDetails);

  // deletes payment details from database
  const deletePaymentDetails = async () => {

    const res = await restAPI.delete(`/user/removepayment?token=${localStorage.getItem("token")}`, data)
    refetch()

  }

  // handles text input for month
  function handleMonthChange(e: any) {

    setMonth(e.slice(0, 2)) // month can only be 2 characters long

  }

  // handles text input for year
  function handleYearChange(e: any) {

    setYear(e.slice(0, 2)) // year can only be 2 characters long

  }

  // handles text input for CVC
  function handleCVCChange(e: any) {

    setcvc(e.slice(0, 3)) // CVC can only be 3 characters long

  }

  // handles text input for card number
  function handleCardNumberChange(e: any) {

    if (e.length === 4 || e.length === 9 || e.length === 14) {

      setCardNumber(e + ' ')

    } else if (e.length > 19) {
      setCardNumber(e.slice(0, 19))
    } else {
      setCardNumber(e)
    }

  }

  // returns a dictionary of error messages given a form
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

  async function onSubmit(e: any) {

    const form = e.currentTarget;
    e.preventDefault();

    // payload
    const data = {
      token: localStorage.getItem("token"),
      name: name,
      number: cardNumber,
      expiry_month: month,
      expiry_year: year,
      cvc: cvc
    };

    const formErrors = generateErrorMessages(form)

    if (Object.keys(formErrors).length > 0 || form.checkValidity() === false) {

      console.log("errors")
      e.preventDefault(); // prevents the default behaviour (submitting the form)
      e.stopPropagation();
      setErrors(formErrors)

    } else {

      try {
        const response = await restAPI.post("user/addpayment/", data);
        setValidated(true)
        alert("Payment details successfully updated!");
        refetch()
        setName("")
        setCardNumber("")
        setMonth("")
        setYear("")
        setcvc("")

        const errorDict: { [key: string]: string } = {}; // resets error messages
        setErrors(errorDict)

        setValidated(false)

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

    <div className='dashboard-container'>
      <h4>Payment Details</h4>
      <div className='existing-payment-details'>
        {status === "success" && data.result !== null ?

          <>
            <h5> Card ending in *{data.result} </h5>
            <IconButton
              className="dashboard-events-edit"
              onClick={() => deletePaymentDetails()}>
              <DeleteIcon />
            </IconButton>
          </>

          :

          <h5> No existing card</h5>
        }
      </div>

      <Form
        noValidate
        validated={validated}
        onSubmit={onSubmit}
        className="mt-2">

        <Form.Group className="mb-4" controlId="formCardholderName">
          <Form.Label>Cardholder Name</Form.Label>
          <Form.Control
            required
            type='text'
            placeholder="Cardholder Name"
            value={name}
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

        <div className="d-grid gap-2">
          <Button className="button" variant="" size="lg" type="submit">
            Save Payment Details!
          </Button>
        </div>

      </Form>

    </div>

  </>
}

export default PaymentDetails;