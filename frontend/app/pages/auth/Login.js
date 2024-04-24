import React, { useState } from "react";
import { Form, Button } from "react-bootstrap";
import AuthService from "/app/services/AuthService";

const ErrorForm = (props) => {
  return (
    <div
      className="row pl-2 text-danger mt-5 text-center font-bold"
      style={{ height: 24 }}
    >
      <p>{props.error}</p>
    </div>
  );
};

function Login() {
  const [user, setUser] = useState({ username: "", password: "" });
  const [error, setError] = useState([]);

  const changeValue = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const submitUser = (e) => {
    e.preventDefault();
    AuthService.login(user.username, user.password).catch(() => {
      setError("Incorrect username or password");
    });
  };

  return (
    <div className="flex h-[calc(100vh-56px)]">
      <div className="w-[50%]">
        <img className="h-[100%]" src="sign.jpg" />
      </div>
      <div className="row flex items-center justify-content-lg-center !h-100 p-5 w-[50%]">
        <div
          className="w-[75%] !h-fit d-flex flex-column py-8 px-4 shadow-[1px_1pxpx_16px_1px_rgba(0,0,0,0.3)]"
          style={{ boxShadow: "1px 1px 15px 1px #00000021" }}
        >
          <div className="text-center lg-3 mb-4">
            <h2 className="font-bold border-b-4 border-[#39b54a] w-fit mx-auto pb-2">
              Login
            </h2>
          </div>
          <div
            className="d-flex flex-column justify-content-center align-items-center col-12"
            style={{ flex: 0.8 }}
          >
            <Form onSubmit={submitUser} style={{ width: "100%" }}>
              <Form.Group controlId="username" style={{ marginBottom: 16 }}>
                <Form.Label style={{ marginBottom: 4 }}>Username</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter Username"
                  onChange={changeValue}
                  name="username"
                  required
                />
              </Form.Group>
              <Form.Group controlId="password">
                <Form.Label style={{ marginBottom: 4 }}>Password</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="***********"
                  onChange={changeValue}
                  name="password"
                  required
                />
              </Form.Group>
              <div className="mt-4 text-center">
                <Button
                  style={{
                    width: 100,
                    backgroundColor: "#39b54a",
                    border: "none",
                  }}
                  type="submit"
                >
                  Log in
                </Button>
              </div>
            </Form>
            <ErrorForm error={error} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
