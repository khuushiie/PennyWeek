import React, { useState } from "react";
import { Link } from "react-router-dom";

function Register() {
  const [validated, setValidated] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData({
      ...formData,
      [id]: value,
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const form = event.target;

    // Trigger Bootstrap validation styles
    setValidated(true);

    if (form.checkValidity() === false) {
      event.stopPropagation();
    } else {
      // Add your form submission logic here (e.g., send data to the server)
      alert("Form Submitted");
    }
  };

  return (
    <div className="container">
      <h2 className="mb-5 mt-5" style={{ color: "#16425b", fontWeight: "600" }}>
        Sign Up and Take Control of Your Finances
      </h2>

      <form
        className="needs-validation"
        noValidate
        onSubmit={handleSubmit}
        validated={validated}
      >
        <div className="mb-3">
          <label
            htmlFor="username"
            className="form-label fs-4 register-heading"
          >
            Enter your username
          </label>
          <input
            type="text"
            className={`form-control ${
              validated && !formData.username ? "is-invalid" : ""
            }`}
            id="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleInputChange}
            required
          />
          <div className="invalid-feedback">
            Please provide a valid username.
          </div>
        </div>

        <div className="mb-3">
          <label htmlFor="email" className="form-label fs-4 register-heading">
            Enter your email
          </label>
          <input
            type="email"
            className={`form-control ${
              validated && !formData.email ? "is-invalid" : ""
            }`}
            id="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
          <div className="invalid-feedback">
            Please provide a valid email address.
          </div>
        </div>

        <div className="mb-3">
          <label
            htmlFor="password"
            className="form-label fs-4 register-heading"
          >
            Enter your password
          </label>
          <input
            type="password"
            className={`form-control ${
              validated && !formData.password ? "is-invalid" : ""
            }`}
            id="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleInputChange}
            required
            minLength="6"
          />
          <div className="invalid-feedback">
            Password must be at least 6 characters.
          </div>
        </div>

        <div className="mb-3">
          <label
            htmlFor="confirmPassword"
            className="form-label fs-4 register-heading"
          >
            Confirm your password
          </label>
          <input
            type="password"
            className={`form-control ${
              validated && formData.confirmPassword !== formData.password
                ? "is-invalid"
                : ""
            }`}
            id="confirmPassword"
            placeholder="Confirm password"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            required
          />
          <div className="invalid-feedback">Passwords must match.</div>
        </div>

        <button type="submit" className="btn btn-primary mt-3">
          Register
        </button>
      </form>

      <div className="mt-3">
        Already have an account?{" "}
        <Link to="/login" style={{ textDecoration: "none" }}>
          Login here
        </Link>
      </div>
    </div>
  );
}

export default Register;
