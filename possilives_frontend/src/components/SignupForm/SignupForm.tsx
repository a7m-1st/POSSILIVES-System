import React from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/axiosConfig.ts";

const CommentForm = ({ edit = false }) => {
  //getting data
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [passportNumber, setPassportNumber] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [errors, setErrors] = useState<{
    fullName?: string;
    email?: string;
    passportNumber?: string;
    phoneNumber?: string;
  }>({});
  const navigate = useNavigate();

  useEffect(() => {
    if (edit) {
      const userId = localStorage.getItem("userId");
      const userData = localStorage.getItem("userData");
      if (!userId || !userData) {
        alert("User not found");
        return;
      }
      const data = JSON.parse(userData);
      setFullName(data.fullName);
      setEmail(data.email);
      setPassportNumber(data.passportNumber);
      setPhoneNumber(data.phoneNumber);
    }
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault(); // Prevent default form submission

    let formErrors: {
      fullName?: string;
      email?: string;
      passportNumber?: string;
      phoneNumber?: string;
    } = {};
    // Simple form validation
    if (!fullName) formErrors.fullName = "First Name is required";
    if (!email) formErrors.email = "Email is required";
    if (!passportNumber)
      formErrors.passportNumber = "passportNumber is required";
    if (!phoneNumber) formErrors.phoneNumber = "phoneNumber is required";

    // If there are no errors, proceed with form submission logic
    if (Object.keys(formErrors).length === 0) {
      const commentData = {
        fullName,
        email,
        passportNumber,
        phoneNumber,
        createdDate: new Date().toISOString(), // Optional: Add createdDate
      };
      // Use URLSearchParams for proper parameter encoding
      const params = new URLSearchParams({
        fullName,
        phoneNumber,
        passportNumber,
        email,
      });

      try {
        console.log("Submitting");
        if (edit) {
          const userId = localStorage.getItem("userId");
          if (!userId) {
            alert("User not found");
            return;
          }
          await api.put(
            `/api/users/updateuser/${userId}`,
            { fullName, email, passportNumber, phoneNumber }
          );
          const data = { 
            fullName: fullName, 
            email: email, 
            passportNumber: passportNumber, 
            phoneNumber: phoneNumber };
          localStorage.setItem("userData", JSON.stringify(data));
          
          alert("User updated successfully");
          navigate("/booked");
        } else {
          const result = await api.post(
            `/api/users/createuser?${params.toString()}`
          );
          console.log("Form Submitted", {
            fullName,
            email,
            passportNumber,
            phoneNumber,
          });
          if (result.data !== "Not Found") {
            localStorage.setItem("userId", result.data);
            const data = { 
              fullName: fullName, 
              email: email, 
              passportNumber: passportNumber, 
              phoneNumber: phoneNumber };
            localStorage.setItem("userData", JSON.stringify(data));
          }

          // Reset form after successful submission
          setFullName("");
          setPhoneNumber("");
          setEmail("");
          setPassportNumber("");
          setErrors({});

          navigate("/home");
        }
      } catch (error) {
        console.error("Error submitting form:", error);
      }
    } else {
      setErrors(formErrors); // Update state with validation errors
    }
  };

  return (
    <div className="form-card rounded-2 bg-white p-2">
      <div className="d-flex">
        <div className="m-2 ">
          <form>
            <div className="form-group">
              <label htmlFor="text" className="text-secondary w-100 text-start">
                Full Name
              </label>
              <input
                type="text"
                className="form-control bg-light"
                onChange={(e) => setFullName(e.target.value)}
                value={fullName}
              />
              {errors.fullName && (
                <small className="text-danger">{errors.fullName}</small>
              )}
            </div>
          </form>
        </div>
      </div>

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
            <label htmlFor="email" className="text-secondary w-100 text-start">
              Passport Number
            </label>
            <input
              type="email"
              className="form-control bg-light"
              onChange={(e) => setPassportNumber(e.target.value)}
              value={passportNumber}
            />
            {errors.passportNumber && (
              <small className="text-danger">{errors.passportNumber}</small>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="email" className="text-secondary w-100 text-start">
              Phone Number
            </label>
            <input
              type="number"
              className="form-control bg-light"
              onChange={(e) => setPhoneNumber(e.target.value)}
              value={phoneNumber}
            />
            {errors.phoneNumber && (
              <small className="text-danger">{errors.phoneNumber}</small>
            )}
          </div>

          <button
            type="button"
            className="btn btn-primary my-2 w-100"
            onClick={(e) => handleSubmit(e)}
          >
            Submit
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
