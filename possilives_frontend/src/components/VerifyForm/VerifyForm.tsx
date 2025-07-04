import React from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/axiosConfig.ts";

const VerifyForm = () => {
  //getting data
  const [userId, setUserId] = useState("");
  const [code, setCode] = useState("");
  const [errors, setErrors] = useState<{
    code?: string;
  }>({});
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem("userData");
    if (!userData) {
      alert("Please Login to continue");
      return;
    }
    setUserId(JSON.parse(userData).user_id);
    alert("Verification Code is " + JSON.parse(userData).verification_code);
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault(); // Prevent default form submission

    let formErrors: {
      fullName?: string;
      code?: string;
      password?: string;
      phoneNumber?: string;
    } = {};
    // Simple form validation
    if (!code) formErrors.code = "code is required";

    // If there are no errors, proceed with form submission logic
    if (Object.keys(formErrors).length === 0) {
      const commentData = {
        code,
        createdDate: new Date().toISOString(), // Optional: Add createdDate
      };

      try {
        console.log("Submitting");
        const result = await api.post(
          `/api/users/verify?userId=${userId}&verificationCode=${code}`
        );

        if (result.status === 200) {
          // Reset form after successful submission
          setCode("");
          setErrors({});

          navigate("/createprofile");
        } else {
          alert("Invalid code, please try again");
        };
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
        <h2 className="text-secondary text-lg">Enter Verification Code:</h2>
        <form>
          <div className="form-group">
            <input
              type="code"
              className="form-control bg-light"
              onChange={(e) => setCode(e.target.value)}
              value={code}
            />
            {errors.code && (
              <small className="text-danger">{errors.code}</small>
            )}
            <label
              htmlFor="text"
              className="text-blue-700 w-100 text-start text-sm"
            >
              Didn’t receive code?
              <a href="#" className="text-blue-700">
                Resend
              </a>
            </label>
          </div>

          <button
            type="button"
            className="btn btn-primary my-2 w-100 bg-sky-500"
            onClick={(e) => handleSubmit(e)}
          >
            Verify
          </button>
        </form>
      </div>
    </div>
  );
};

export default VerifyForm;
