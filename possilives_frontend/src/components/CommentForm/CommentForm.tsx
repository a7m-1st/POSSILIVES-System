import React from "react";
import { useEffect, useState } from "react";
import { data, useNavigate } from "react-router-dom";
import { api } from "../../api/axiosConfig.ts";
import LoadingContext from "../../hooks/LoadingContext.tsx";

const CommentForm = ({ edit = false }) => {
  //Loading context
  const {loading, setLoading} = React.useContext(LoadingContext);

  //getting data
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{
    fullName?: string;
    email?: string;
    password?: string;
    phoneNumber?: string;
  }>({});
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault(); // Prevent default form submission

    let formErrors: {
      email?: string;
      password?: string;
    } = {};
    // Simple form validation
    if (!email) formErrors.email = "Email is required";
    if (!password) formErrors.password = "Password is required";

    // If there are no errors, proceed with form submission logic
    if (Object.keys(formErrors).length === 0) {
      const commentData = {
        email,
        password,
        createdDate: new Date().toISOString(), // Optional: Add createdDate
      };

      try {
        console.log("Submitting");
        if (edit) {
          // Update existing comment
          // const result = await api.put(`/api/comments/${comment.id}`, commentData);
        } else {
          const result = await api.post(`/api/users/createuser`, {
            email: email,
            password: password,
          });
          if (result.data !== null) {
            if(result.data.is_verified == true) {
              navigate("/home");
            }
            localStorage.setItem("userData", JSON.stringify(result.data));
            localStorage.setItem("userId", result.data.user_id);
          }

          // Reset form after successful submission
          setEmail("");
          setPassword("");
          setErrors({});

          navigate("/verify");
        }

        // navigate("/home");
      } catch (error) {
        console.error("Error submitting form:", error);
      }
    } else {
      setErrors(formErrors); // Update state with validation errors
    }
  };

  return (
    <div className="form-card rounded-2 bg-white p-2 min-width-[80%]">
      <div className="mx-2">
        <form>
          <div className="form-group">
            <label htmlFor="email" className="text-secondary w-100 text-start">
              Email
            </label>
            <input
              type="email"
              className="form-control bg-light"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
            />
            {errors.email && (
              <small className="text-danger">{errors.email}</small>
            )}
          </div>

          <div className="form-group">
            <label
              htmlFor="password"
              className="text-secondary w-100 text-start"
            >
              Password
            </label>
            <input
              type="password"
              className="form-control bg-light"
              onChange={(e) => setPassword(e.target.value)}
              value={password}
            />
            {errors.password && (
              <small className="text-danger">{errors.password}</small>
            )}
          </div>

          <button
            type="button"
            className="btn btn-primary my-2 w-100 bg-sky-500"
            onClick={(e) => handleSubmit(e)}
          >
            Log in
          </button>

          <button
            type="button"
            className="btn btn-secondary my-2 w-100"
            onClick={(e) => handleSubmit(e)}
          >
            Continue with Google
          </button>
        </form>
      </div>
    </div>
  );
};

export default CommentForm;
