import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../AuthContext";
import "../styles/ProfileSettings.css";

function ProfileSettings() {
  const { isLoggedIn, user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    photo: "",
  });
  const [validated, setValidated] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [error, setError] = useState("");

  // Initialize formData when user is loaded
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        photo: user.photo || "",
      });
    }
  }, [user]);

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoggedIn) {
      console.log("User not logged in, redirecting to /login");
      navigate("/login");
    }
  }, [isLoggedIn, navigate]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle photo upload with error handling
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) {
      console.log("No file selected");
      setError("Please select an image file.");
      setShowToast(true);
      return;
    }

    try {
      if (file.size > 5 * 1024 * 1024) { // Limit to 5MB
        throw new Error("File size exceeds 5MB limit.");
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        console.log("File read successfully");
        setFormData((prev) => ({ ...prev, photo: reader.result }));
        setError("");
      };
      reader.onerror = () => {
        throw new Error("Failed to read file.");
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error("Photo upload error:", err);
      setError(err.message);
      setShowToast(true);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    setValidated(true);

    if (form.checkValidity()) {
      try {
        await updateUser({
          name: formData.name,
          email: formData.email,
          photo: formData.photo,
        });
        console.log("Profile updated successfully");
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
        setValidated(false);
        setError("");
      } catch (err) {
        console.error("Update user error:", err);
        setError(err.message || "Failed to update profile.");
        setShowToast(true);
      }
    }
  };

  if (!user) {
    console.log("User data is undefined");
    return <div>Loading...</div>;
  }

  return (
    <div className="profile-settings-page">
      <div className="container py-5">
        <motion.div
          className="settings-card p-5"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
              <li className="breadcrumb-item">
                <Link to="/settings">Settings</Link>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                Profile
              </li>
            </ol>
          </nav>
          <h2 className="section-heading mb-4">Profile Settings</h2>
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}
          <form
            className="needs-validation"
            noValidate
            onSubmit={handleSubmit}
          >
            <div className="row g-4">
              <div className="col-md-4 text-center text-md-start">
                <motion.img
                  src={
                    formData.photo ||
                    "https://ui-avatars.com/api/?name=User&size=150"
                  }
                  alt="Profile"
                  className="profile-photo rounded-circle mb-3"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                />
                <div>
                  <label htmlFor="photo" className="btn btn-outline-modern w-100">
                    Upload Photo
                    <input
                      type="file"
                      className="d-none"
                      id="photo"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      aria-label="Upload profile photo"
                    />
                  </label>
                </div>
              </div>
              <div className="col-md-8">
                <div className="mb-4">
                  <label htmlFor="name" className="form-label">
                    Name
                  </label>
                  <input
                    type="text"
                    className={`form-control modern-input ${
                      validated && !formData.name ? "is-invalid" : ""
                    }`}
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                  <div className="invalid-feedback">
                    Please enter your name.
                  </div>
                </div>
                <div className="mb-4">
                  <label htmlFor="email" className="form-label">
                    Email
                  </label>
                  <input
                    type="email"
                    className={`form-control modern-input ${
                      validated && !formData.email ? "is-invalid" : ""
                    }`}
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                  <div className="invalid-feedback">
                    Please enter a valid email.
                  </div>
                </div>
              </div>
            </div>
            <div className="text-end mt-4">
              <Link to="/settings" className="btn btn-outline-modern me-2">
                Back
              </Link>
              <motion.button
                type="submit"
                className="btn btn-primary-modern"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Save Changes
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>

      <div
        className={`toast align-items-center text-dark border-0 position-fixed top-0 end-0 m-3 ${
          showToast ? "show" : ""
        }`}
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
      >
        <div className="d-flex">
          <div className="toast-body">
            {error ? error : "Profile updated successfully!"}
          </div>
          <button
            type="button"
            className="btn-close me-2 m-auto"
            onClick={() => setShowToast(false)}
            aria-label="Close"
          ></button>
        </div>
      </div>
    </div>
  );
}

export default ProfileSettings;