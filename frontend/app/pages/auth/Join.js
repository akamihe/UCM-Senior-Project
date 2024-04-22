import React, { useState } from "react";
import { Form, Button } from "react-bootstrap";
import AuthService from "./../../services/AuthService";

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

function Join() {
  const [error, setError] = useState("");
  const [user, setUser] = useState({ username: "", password: "" });

  const changeValue = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const submitUser = (e) => {
    e.preventDefault();

    AuthService.createUser(user.username, user.password)
      .then(() => {
        window.location.href = "/game/setup";
        setError("");
      })
      .catch(() => {
        setError("Error creating user, try a different username");
      });
  };

  return (
    <div className="flex h-[calc(100vh-56px)]">
      <div className="w-[50%]">
        <img className="h-[100%]" src="login.jpg" />
      </div>
      <div className="flex items-center justify-content-lg-center !h-[100%] p-5 w-[50%] ">
        <div
          className="!h-fit d-flex flex-column py-8 px-1 w-[75%]"
          style={{ boxShadow: "1px 1px 15px 1px #00000021" }}
        >
          <div className="text-center lg-3 mb-4">
            <h2 className="font-bold border-b-4 border-[#39b54a] w-fit mx-auto pb-2">
              Sign Up
            </h2>
          </div>
          <div
            className="d-flex flex-column justify-content-center align-items-center col-12"
            style={{ flex: 0.8 }}
          >
            <>
              <Form className="col-12" onSubmit={submitUser}>
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
                    variant="primary"
                    style={{
                      width: 100,
                      backgroundColor: "#39b54a",
                      border: "none",
                    }}
                    type="submit"
                  >
                    Join
                  </Button>
                </div>
              </Form>
              <ErrorForm error={error} />
            </>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Join;
