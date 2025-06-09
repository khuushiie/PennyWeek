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
    photo: null, // Changed to null to store File object
  });
  const [validated, setValidated] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        photo: null, // Reset photo to null
      });
    }
  }, [user]);

  useEffect(() => {
    if (!isLoggedIn) {
      console.log("ProfileSettings: User not logged in, redirecting to /login");
      navigate("/login");
    }
  }, [isLoggedIn, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    console.log('ProfileSettings: Photo upload attempted');
    if (!file) {
      setError("Please select an image file");
      console.log('ProfileSettings: No file selected');
      setTimeout(() => setError(null), 3000);
      return;
    }

    try {
      if (file.size > 5 * 1024 * 1024) {
        throw new Error("File size exceeds 5MB limit");
      }
      if (!file.type.startsWith('image/')) {
        throw new Error("Please select an image file");
      }

      setFormData((prev) => ({ ...prev, photo: file })); // Store File object
      setSuccess("Photo uploaded successfully");
      console.log('ProfileSettings: Photo upload success');
      setTimeout(() => setSuccess(null), 2000);
    } catch (err) {
      const errorMsg = err.message || "Photo upload failed";
      setError(errorMsg);
      console.error('ProfileSettings: Photo upload error', errorMsg);
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    setValidated(true);
    setError(null);
    setSuccess(null);
    console.log('ProfileSettings: Submitting', {
      name: formData.name,
      email: formData.email,
      photo: formData.photo ? '[File object]' : null
    });

    if (!form.checkValidity()) {
      setError("Please fill in all required fields");
      console.log('ProfileSettings: Invalid form');
      setTimeout(() => setError(null), 3000);
      return;
    }

    try {
      await updateUser({
        name: formData.name,
        email: formData.email,
        photo: formData.photo || undefined,
      });
      setSuccess("Profile updated successfully");
      setValidated(false);
      console.log('ProfileSettings: Update success');
      setTimeout(() => setSuccess(null), 2000);
    } catch (err) {
      const errorMsg = err.message || "Failed to update profile";
      setError(errorMsg);
      console.error('ProfileSettings: Update error', errorMsg);
      setTimeout(() => setError(null), 3000);
    }
  };

  if (!user) {
    console.log("ProfileSettings: User data is undefined");
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
            <motion.div
              className="alert alert-danger"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {error}
            </motion.div>
          )}
          {success && (
            <motion.div
              className="alert alert-success"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {success}
            </motion.div>
          )}
          <form className="needs-validation" noValidate onSubmit={handleSubmit}>
            <div className="row g-4">
              <div className="col-md-4 text-center text-md-start">
                <motion.img
                  src={formData.photo ? URL.createObjectURL(formData.photo) : user.photo || "https://ui-avatars.com/api/?name=User&size=150"} // Use object URL for preview
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
                  <label htmlFor="name" className="form-label">Name</label>
                  <input
                    type="text"
                    className={`form-control modern-input ${validated && !formData.name ? "is-invalid" : ""}`}
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                  <div className="invalid-feedback">Please enter your name.</div>
                </div>
                <div className="mb-4">
                  <label htmlFor="email" className="form-label">Email</label>
                  <input
                    type="email"
                    className={`form-control modern-input ${validated && !formData.email ? "is-invalid" : ""}`}
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                  <div className="invalid-feedback">Please enter a valid email.</div>
                </div>
              </div>
            </div>
            <div className="text-end mt-4">
              <Link to="/settings" className="btn btn-outline-modern me-2">Back</Link>
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
    </div>
  );
}

export default ProfileSettings;