import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Button } from "devextreme-react/button";
import { useAuth } from "../Auth/AuthContext";
import { TextBox } from 'devextreme-react/text-box';

import "../App.css"

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async () => {
    setLoading(true);
    setError(null);

    try {
      const payload = {
        userId: username,
        password: password,
        appKey: 'f1810de6-0fa1-4d07-a3f1-90e5dc192e0e',
      };

      const response = await axios.post(
         "https://iamapi.accesshealthcare.co/api/IAM/GenerateUserAccessToken",
        payload
      );

      if (response.data && response.data.Data) {
        const authToken = response.data.Data.Token;

        // Save credentials and token in sessionStorage
        sessionStorage.setItem("authToken", authToken);
        sessionStorage.setItem("authData", JSON.stringify(response.data.Data));
        sessionStorage.setItem("username", username);
        sessionStorage.setItem("userID", response.data.Data.UserId);

        // Trigger login and navigate to dashboard
        login();
        navigate("/dashboard");
      } else {
        setError(response.data.Remarks || "Login failed.");
      }
    } catch (error) {
      console.error("Error during login:", error);
      setError("An error occurred during login. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="login-page"
      style={{
        padding: "10px",
        // maxWidth: 600,
        margin: "auto",
        borderRadius: "2px",
        boxShadow: "3px",
      }}
    >
      <div
        className="login-box"
        style={{
          padding: "10px 18px 30px",
          maxWidth: 600,
          margin: "auto",
          borderRadius: "2px",
          boxShadow: "3px",
        }}
      >
        <h2 variant="h5" sx={{ marginBottom: 2 }}>
          Login
        </h2>
        <div className="login-form">
          <TextBox
            id="username"
            value={username}
            placeholder="Username"
            stylingMode="outlined"
            onValueChanged={(e) => setUsername(e.value)}
            width="100%"
            height="auto"
          />
          {!!error && username.trim() === "" && (
            <div style={{ color: "red", textAlign: "left", fontSize: "14px", marginTop: "4px" }}>
              Username is required
            </div>
          )}

          <div style={{ marginTop: "20px" }}>
            <TextBox
              id="password"
              value={password}
              placeholder="Password"
              stylingMode="outlined"
              mode="password" // Enables password masking
              onValueChanged={(e) => setPassword(e.value)}
              width="100%"
              height="auto"
            />
            {!!error && password.trim() === "" && (
              <div style={{ color: "red",textAlign: "left", fontSize: "14px", marginTop: "4px" }}>
                Password is required
              </div>
            )}
          </div>

          {error && (
            <h1 variant="body2" style={{ marginBottom: '2px', color: "#d3302f" }}>
              {error}
            </h1>
          )}

          <Button
            onClick={handleLogin}
            text="Login"
            style={{ padding: '1.5px', marginTop: '22px', backgroundColor: "#1976d2", color: "white" }}
            disabled={loading}
            size="small" />
        </div>
      </div>
    </div>
  );
};

export default Login;
