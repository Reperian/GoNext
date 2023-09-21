import React from 'react';
import NavBarGuest from '../Components/NavbarGuest';
import '../css/ResetPassword.css';
import { Form, Button } from 'react-bootstrap';
import restAPI from '../http-common'
import { sha256 } from 'js-sha256';
import { useNavigate } from "react-router-dom";

function ResetPassword() {

  const dictionary: { [key: string]: string } = {};

  const [email, setEmail] = React.useState('');
  const [resetCode, setResetCode] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');

  const [stage, setStage] = React.useState(1);

  const [validated, setValidated] = React.useState(false);
  const [errors, setErrors] = React.useState(dictionary);
  const navigate = useNavigate();

  function onSubmit(e: any) {

    if (stage === 1) {

      onSubmitStage1(e);

    } else if (stage === 2) {

      onSubmitStage2(e);

    } else if (stage === 3) {

      onSubmitStage3(e);

    } else {

      onSubmitStage4(e);
    }

  }

  // stage 1 of resetting password, inputting email
  async function onSubmitStage1(e: any) {
    const form = e.currentTarget;
    e.preventDefault();

    const newErrors: { [key: string]: string } = {}

    if (email.includes("@") === false) {

      newErrors.email = 'Please enter a valid email'

    }

    setErrors(newErrors)

    const data = {
      user_email: email,
    };

    if (Object.keys(errors).length > 0) {
      console.log("errors!!!!!!")
      e.preventDefault(); // prevents the default behaviour (submitting the form)
      e.stopPropagation();

    } else {

      try {
        console.log(data)
        const res = await restAPI.post('user/details/resetpassword/', data); // CHANGE THIS

        console.log(res)

        const result = {
          status: res.status + "-" + res.statusText,
          headers: res.headers,
          data: res.data,
        };

        setValidated(true);
        setStage(2);

        console.log(result);
      } catch (err) {
        console.log(err);
      }
    }



  }

  // stage 2 of resetting password, inputting reset code
  async function onSubmitStage2(e: any) {
    const form = e.currentTarget;
    e.preventDefault();

    try {

      const res = await restAPI.delete('user/details/checkresetcode', {
        data: {
          user_email: email,
          password_reset_code: resetCode
        }
      });

      console.log(res)

      const result = {
        status: res.status + "-" + res.statusText,
        headers: res.headers,
        data: res.data
      };

      console.log(result);

      if (res.data['isSuccess'] === true) {

        setStage(3)

      } else {

        e.preventDefault()
        e.stopPropagation()

        const newErrors: { [key: string]: string } = {}

        newErrors.resetCode = 'Reset Code is Incorrect'

        setErrors(newErrors)
        console.log("reset code error")
        console.log(errors)

      }

    } catch (err) {
      console.log(err);
    }

  }

  // stage 3 of resetting password, inputting new password
  async function onSubmitStage3(e: any) {
    const form = e.currentTarget;
    e.preventDefault();

    const newErrors: { [key: string]: string } = {}

    // checking password restrictions
    if (password.length < 8) {

      newErrors.password = 'Password must contain at least 8 characters';

    } else if (password !== confirmPassword) {

      newErrors.confirmPassword = 'Passwords do not match'

    }

    setErrors(newErrors)

    if (Object.keys(newErrors).length > 0) {

      e.preventDefault(); // prevents the default behaviour (submitting the form)
      e.stopPropagation();

    } else {

      try {

        const res = await restAPI.delete('user/details/updatepassword/', {
          data: {
            user_email: email,
            new_password: sha256(password)
          }
        });

        console.log(res)

        const result = {
          status: res.status + "-" + res.statusText,
          headers: res.headers,
          data: res.data,
        };

        setValidated(true);
        setStage(4);

        console.log(result);
      } catch (err) {
        console.log(err);
      }
    }

  }

  function onSubmitStage4(e: any) {

    navigate('/login')

  }

  return <>
    <NavBarGuest />
    <div className='background'>
      <div className='custom-container'>
        <h1>
          Reset Password
        </h1>

        <Form
          noValidate
          validated={validated}
          onSubmit={onSubmit}
          className="mt-4 w-50 mb-3">

          {stage === 1 &&
            <Form.Group className="mb-4" controlId="formGridEmail">
              <Form.Label>Email</Form.Label>
              <Form.Control
                required
                type="email"
                placeholder="Enter email"
                isInvalid={!!errors.email}
                onChange={e => setEmail(e.target.value)} />
              <Form.Control.Feedback type="invalid">
                {errors.email}
              </Form.Control.Feedback>
            </Form.Group>
          }

          {stage === 2 &&
            <Form.Group className="mb-4" controlId="formResetCode">
              <Form.Label>Reset Code</Form.Label>
              <Form.Control
                required
                type="text"
                placeholder="Enter Reset Code"
                isInvalid={!!errors.resetCode}
                onChange={e => setResetCode(e.target.value)} />
              <Form.Control.Feedback type="invalid">
                {errors.resetCode}
              </Form.Control.Feedback>
            </Form.Group>
          }

          {stage === 3 &&
            <><Form.Group className="mb-4" controlId="formGridPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control
                required
                type="password"
                placeholder="Password"
                isInvalid={!!errors.password}
                onChange={e => setPassword(e.target.value)} />
              <Form.Control.Feedback type="invalid">
                {errors.password}
              </Form.Control.Feedback>
            </Form.Group><Form.Group className="mb-4" controlId="formGridPassword">
                <Form.Label>Confirm Password</Form.Label>
                <Form.Control
                  required
                  type="password"
                  placeholder="Password"
                  isInvalid={!!errors.confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)} />
                <Form.Control.Feedback type="invalid">
                  {errors.confirmPassword}
                </Form.Control.Feedback>
              </Form.Group></>
          }

          {stage === 4 &&
            <h2 style={{ textAlign: 'center' }}> Password successfully reset </h2>
          }

          <div className="d-grid gap-2">
            <Button className="button" variant="" size="lg" type="submit">
              {stage === 1 && "Send Email"}
              {stage === 2 && "Submit Code"}
              {stage === 3 && "Change Password"}
              {stage === 4 && "Login"}
            </Button>
          </div>

        </Form>

      </div>
    </div>
  </>
}

export default ResetPassword;