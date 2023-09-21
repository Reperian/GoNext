import React from 'react';
import NavBarGuest from '../Components/NavbarGuest';
import '../css/Login.css';
import restAPI from '../http-common'
import { Col, Row, Form, Button } from 'react-bootstrap';
import { sha256, sha224 } from 'js-sha256';
import { useNavigate, Link } from "react-router-dom";

function Login() {

  // states
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [validated, setValidated] = React.useState(false);

  const navigate = useNavigate();
  
  // handles submission of login form
  async function onSubmit(e: any) {
    e.preventDefault();
    const form = e.currentTarget;
 
    // if fields are not inputted
    if (form.checkValidity() === false) {
      e.preventDefault();
      e.stopPropagation();
    }

    setValidated(true);

    // payload
    const data = {
      user_email: email,
      user_password: sha256(password) // NEED TO HASH PASSWORD BEFORE I SEND IT :)
    };

    try {
      const response = await restAPI.post("login/", data)
      console.log(response);

      if (response.data.success === true) { // store JWT token, email and user_id in local storage for access later
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('email', email);
        localStorage.setItem('id', response.data.id);
        navigate("/");

      } else { // password is incorrect
        setPassword('')
      }

    } catch (errResponse: any) {
      console.log(typeof errResponse);
    }

    
  }
  
  return <>
    <NavBarGuest />
    <div className='background'>
      <div className='custom-container'>
        <h1>
          Login to GoNext!
        </h1>
        {/* login form */}
        <Form 
          className='mt-2 w-50'
          noValidate
          validated={validated}
          onSubmit={onSubmit}>
        
          <Form.Group className="mt-4 mb-4" controlId="formGroupEmail">
            <Form.Label>Email address</Form.Label>
            <Form.Control 
              required   
              type="email" 
              placeholder="Enter email" 
              onChange={e => setEmail(e.target.value)} />
            <Form.Control.Feedback type="invalid">
              Please enter a valid email
            </Form.Control.Feedback>
              
            
          </Form.Group>
          <Form.Group className="mb-4" controlId="formGroupPassword">
            <Form.Label>Password</Form.Label>
            <Form.Control
              required  
              type="password" 
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)} />
            <Form.Control.Feedback type="invalid">
              Your email/password is incorrect. Please try again.
            </Form.Control.Feedback>
          </Form.Group>

          <div className="signin-link">
            <Link to="/ResetPassword"> Forgot your password? </Link>
          </div>

          <div className="d-grid gap-2">
            <Button className="button" variant="" size="lg" type="submit">
              Login
            </Button>
          </div>

        </Form>

        </div>
    </div>
  </>
}

export default Login;