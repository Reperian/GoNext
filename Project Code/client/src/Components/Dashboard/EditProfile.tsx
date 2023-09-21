import React from "react";
import "../../css/EditProfile.css";
import { Col, Row, Form, Button } from "react-bootstrap";
import restAPI from "../../http-common";
import { sha256 } from "js-sha256";
import { Link } from "react-router-dom";
import { useQuery } from "react-query";
import { getRootURL } from "../../utils/utils";
import { useNavigate } from "react-router-dom";

function EditProfile() {
  // states
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [dob, setDOB] = React.useState("");
  const [validated, setValidated] = React.useState(false);

  const errorDict: { [key: string]: string } = {}; // dictionary for custom error messages
  const [errors, setErrors] = React.useState(errorDict);

  const navigate = useNavigate();

  // calculates age of the user given their date of birth
  function calculate_age(dob: string) {
    if (dob.length === 0) {
      return 0;
    }

    const date = new Date(dob);

    var diff_ms = Date.now() - date.getTime();
    var age_dt = new Date(diff_ms);

    return Math.abs(age_dt.getUTCFullYear() - 1970);
  }

  // returns dictionary of custom error messages given a form
  function generateErrorMessages(form: any) {
    // dictionary of custom errors
    const newErrors: { [key: string]: string } = {};

    // checking name errors

    if (firstName.length === 0) {
      newErrors.firstName = "Please enter your first name";
    }

    if (lastName.length === 0) {
      newErrors.lastName = "Please enter your last name";
    }

    // checking password errors

    if (password.length > 0 && password.length < 8) {
      newErrors.password = "Password must contain at least 8 characters";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    // checking email errors

    if (email.includes("@") === false) {
      newErrors.email = "Please enter a valid email";
    }

    // checking age restrictions

    console.log(calculate_age(dob));

    if (calculate_age(dob) < 13) {
      newErrors.dob = "You must be older than 13 to register for GoNext!";
    }

    console.log(newErrors);

    return newErrors;
  }

  async function onSubmit(e: any) {
    e.preventDefault();
    const form = e.currentTarget;

    const formErrors = generateErrorMessages(form);

    // payload
    const data: { [key: string]: string } = {};

    data.user_firstname = firstName;
    data.user_lastname = lastName;
    data.user_dob = dob;
    data.user_email = email;
    data.token = localStorage.getItem("token");

    if (password.length > 0) {
      data.user_password = sha256(password); // hashes password using sha256 hash before sending to database
    }

    if (Object.keys(formErrors).length > 0) {
      e.preventDefault(); // prevents the default behaviour (submitting the form)
      e.stopPropagation();
      setErrors(formErrors);
    } else {
      try {
        const response = await restAPI.post("user/update/", data);

        if (response.data.results === true) {
        } else {
          setPassword("");
        }

        const errorDict: { [key: string]: string } = {};
        setErrors(errorDict);
        alert("Your details have been successfully updated!");
      } catch (err) {
        console.log(err);
      }

      setValidated(true);
    }
  }

  // get user details
  const getUserInfo = async () => {
    try {
      const response = await fetch(
        `${getRootURL()}user/details/?token=${localStorage.getItem("token")}`
      );
      return response.json();
    } catch (err) {
      console.log(err);
    }
  };

  const { data, status } = useQuery("userDetails", getUserInfo);

  React.useEffect(() => {
    try {
      if (status === "success") {
        setEmail(data.results.email);
        setFirstName(data.results.first_name);
        setLastName(data.results.last_name);
        setDOB(data.results.date_of_birth);
      }
    } catch {}
  }, [data]);

  return (
    <>
      <div className="dashboard-container">
        <h4>Your Details</h4>
        <Form
          noValidate
          validated={validated}
          onSubmit={onSubmit}
          className="mt-2"
        >
          <Row className="mb-4">
            <Form.Group as={Col} controlId="formGridFirstName">
              <Form.Label>First Name</Form.Label>
              <Form.Control
                required
                type="text"
                value={firstName}
                isInvalid={!!errors.firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
              <Form.Control.Feedback type="invalid">
                {errors.firstName}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group as={Col} controlId="formGridLastName">
              <Form.Label>Last Name</Form.Label>
              <Form.Control
                required
                type="text"
                value={lastName}
                isInvalid={!!errors.lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
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
              value={dob}
              isInvalid={!!errors.dob}
              onChange={(e) => setDOB(e.target.value)}
            />
            <Form.Control.Feedback type="invalid">
              {errors.dob}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-4" controlId="formGridEmail">
            <Form.Label>Email</Form.Label>
            <Form.Control
              disabled
              required
              type="email"
              value={email}
              isInvalid={!!errors.email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Form.Control.Feedback type="invalid">
              {errors.email}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-4" controlId="formGridPassword">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Password"
              isInvalid={!!errors.password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Form.Control.Feedback type="invalid">
              {errors.password}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-4" controlId="formGridPassword">
            <Form.Label>Confirm Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Password"
              isInvalid={!!errors.confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <Form.Control.Feedback type="invalid">
              {errors.confirmPassword}
            </Form.Control.Feedback>
          </Form.Group>

          <div className="d-grid gap-2 mb-4">
            <Button className="button" variant="" size="lg" type="submit">
              Save
            </Button>
          </div>
        </Form>
      </div>
    </>
  );
}

export default EditProfile;
