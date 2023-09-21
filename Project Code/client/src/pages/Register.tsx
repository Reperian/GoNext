import React from 'react';
import NavBarGuest from '../Components/NavbarGuest';
import '../css/Register.css';
import { Col, Row, Form, Button } from 'react-bootstrap';
import restAPI from '../http-common'
import { sha256 } from 'js-sha256';
import { Link } from 'react-router-dom';
import { useNavigate } from "react-router-dom";

function Register() {

  // states
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName] = React.useState('');
  const [dob, setDOB] = React.useState('');
  const [toc, setTOC] = React.useState(false);
  const [validated, setValidated] = React.useState(false);

  const errorDict: { [key: string]: string } = {}; // dictionary for storing custom error messages, used in form
  const [errors, setErrors] = React.useState(errorDict);

  const navigate = useNavigate();

  // calculates the age of a user given their date of birth as a string
  function calculate_age(dob: string) {

    if (dob.length === 0) {

      return 0
    }

    const date = new Date(dob)

    var diff_ms = Date.now() - date.getTime();
    var age_dt = new Date(diff_ms);

    return Math.abs(age_dt.getUTCFullYear() - 1970);

  }

  // generates error messages given a form, returns a dictionary with error messages
  function generateErrorMessages(form: any) {

    // dictionary of custom errors
    const newErrors: { [key: string]: string } = {}

    // checking name errors

    if (firstName.length === 0) {

      newErrors.firstName = 'Please enter your first name'
    }

    if (lastName.length === 0) {

      newErrors.lastName = 'Please enter your last name'

    }

    // checking password errors

    if (password.length < 8) {

      newErrors.password = 'Password must contain at least 8 characters';

    } else if (password !== confirmPassword) {

      newErrors.confirmPassword = 'Passwords do not match'

    }

    // checking email errors

    if (email.includes("@") === false) {

      newErrors.email = 'Please enter a valid email'
    }

    // checking age restrictions

    if (calculate_age(dob) < 13) {

      newErrors.dob = 'You must be older than 13 to register for GoNext!'

    } else if (calculate_age(dob) > 150) {

      newErrors.dob = "We're not ageist, but you're too old for GoNext! :("

    }

    return newErrors
  }

  // handles form submission
  async function onSubmit(e: any) {

    const form = e.currentTarget;
    e.preventDefault();

    // payload
    const data = {
      user_email: email,
      user_password: sha256(password), // hashes password using sha256 before sending to server
      user_firstName: firstName,
      user_lastName: lastName,
      user_dob: dob,
    };

    const formErrors = generateErrorMessages(form) // dictionary of error messages

    // if errors exist, form cannot be submitted
    if (Object.keys(formErrors).length > 0 || form.checkValidity() === false) {

      console.log("errors")
      e.preventDefault(); // prevents the default behaviour (submitting the form)
      e.stopPropagation();
      setErrors(formErrors)

    }
    else {
      try {
        const response = await restAPI.post("register/", data);
        alert("Account successfully registered!");
        navigate(`/PaymentDetails?email=${email}`);
      } catch (errResponse: any) {
        // Email already exists
        if (errResponse.response.status === 403) {
          alert(errResponse.response.data);
          setEmail("")
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
          Join GoNext!
        </h1>
        {/* registration form */}
        <Form
          noValidate
          validated={validated}
          onSubmit={onSubmit}
          className="mt-4 w-50">

          <Row className="mb-4">
            <Form.Group as={Col} controlId="formGridFirstName">
              <Form.Label>First Name</Form.Label>
              <Form.Control
                required
                type="text"
                placeholder="First Name"
                isInvalid={!!errors.firstName}
                onChange={e => setFirstName(e.target.value)} />
              <Form.Control.Feedback type="invalid">
                {errors.firstName}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group as={Col} controlId="formGridLastName">
              <Form.Label>Last Name</Form.Label>
              <Form.Control
                required
                type="text"
                placeholder="Last Name"
                isInvalid={!!errors.lastName}
                onChange={e => setLastName(e.target.value)} />
              <Form.Control.Feedback type="invalid">
                {errors.lastName}
              </Form.Control.Feedback>
            </Form.Group>
          </Row>

          <Form.Group className="mb-4" controlId="formGridDOB">
            <Form.Label>Date of Birth</Form.Label>
            <Form.Control
              required
              type="date"
              placeholder="Enter Date of Birth"
              isInvalid={!!errors.dob}
              onChange={e => setDOB(e.target.value)} />
            <Form.Control.Feedback type="invalid">
              {errors.dob}
            </Form.Control.Feedback>
          </Form.Group>


          <Form.Group className="mb-4" controlId="formGridEmail">
            <Form.Label>Email</Form.Label>
            <Form.Control
              required
              type="email"
              placeholder="Enter email"
              isInvalid={!!errors.email}
              value={email}
              onChange={e => setEmail(e.target.value)} />
            <Form.Control.Feedback type="invalid">
              {errors.email}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-4" controlId="formGridPassword">
            <Form.Label>Password</Form.Label>
            <Form.Control
              required
              type="password"
              placeholder="Password"
              isInvalid={!!errors.password}
              autoComplete='false'
              onChange={e => setPassword(e.target.value)} />
            <Form.Control.Feedback type="invalid">
              {errors.password}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-4m" controlId="formGridConfirmPassword">
            <Form.Label>Confirm Password</Form.Label>
            <Form.Control
              required
              type="password"
              placeholder="Password"
              isInvalid={!!errors.confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              autoComplete='false'
            />
            <Form.Control.Feedback type="invalid">
              {errors.confirmPassword}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="checkbox" id="formGridCheckbox">
            <Form.Check
              required
              type="checkbox"
              feedback="You must agree before submitting"
              feedbackType="invalid"
              label="You agree to the terms and conditions"
            />

          </Form.Group>

          <div className="">
            <Link to="/Login"> Already have an account? </Link>
          </div>

          <div className="d-grid gap-2">
            <Button className="button" variant="" size="lg" type="submit">
              Register!
            </Button>
          </div>

        </Form>

      </div>
    </div>
  </>
}

export default Register;