import React from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/axiosConfig.ts";

const CommentForm = ({ edit = false }) => {
  const [userId, setUserId] = useState("")
  const [age, setAge] = useState("");
  const [currentJob, setCurrentJob] = useState("");
  const [wantedCareer, setWantedCareer] = useState("");
  const [relationship, setRelationship] = useState("");
  const [socialCircle, setSocialCircle] = useState("");
  const [errors, setErrors] = useState<{
    username?: string;
    age?: string;
    currentJob?: string;
    wantedCareer?: string;
    relationship?: string;
    socialCircle?: string;
  }>({});
  const navigate = useNavigate();

  useEffect(() => {
    if (edit) {
      const userData = localStorage.getItem("userData");

      if (!userId || !userData) {
        alert("Data not found")
        return;
      }
      const data = JSON.parse(userData);
      setAge(data.age);
      setCurrentJob(data.currentJob);
      setWantedCareer(data.wantedCareer);
      setRelationship(data.relationship);
      setSocialCircle(data.socialCircle);
    } else {
      const userId_L = localStorage.getItem("userId");
      if(userId_L != null && userId_L != "")
        setUserId(userId_L)
    }
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    let formErrors: {
      username?: string;
      age?: string;
      currentJob?: string;
      wantedCareer?: string;
      relationship?: string;
      socialCircle?: string;
      email?: string;
      password?: string;
    } = {};

    if (!age || parseInt(age) < 18 || parseInt(age) > 60) formErrors.age = "Age is incorrect or incomplete (18 - 60)";
    if (!currentJob) formErrors.currentJob = "Current job is required";
    if (!wantedCareer) formErrors.wantedCareer = "Wanted career is required";
    if (!relationship)
      formErrors.relationship = "Relationship status is required";
    if (!socialCircle) formErrors.socialCircle = "Social circle is required";

    if (Object.keys(formErrors).length === 0) {
      const userData = {
        age,
        currentJob,
        wantedCareer,
        relationship,
        socialCircle,
        createdDate: new Date().toISOString(),
      };

      try {
        console.log("Submitting");
        if (edit) {
          const userData = localStorage.getItem("userData");
          if (!userData) {
            alert("User not found");
            return;
          }
        } else {          const result = await api.put(`/api/users/${userId}/profile`, {
            age: parseInt(age),
            current_career: currentJob,
            future_career: wantedCareer,
            relationship_status: relationship,
            social_circle: socialCircle,
          });

          console.log("Profile created successfully:", result.data);
          
          // Reset form after successful submission
          setAge("");
          setCurrentJob("");
          setWantedCareer("");
          setRelationship("");
          setSocialCircle("");
          setErrors({});

          navigate("/testbridge");
        }

        // navigate("/home");
      } catch (error) {
        console.error("Error submitting form:", error);
      }
    } else {
      setErrors(formErrors);
    }
  };

  return (
    <div className="form-card rounded-2 bg-white p-2 min-width-[80%]">
      <div className="mx-2">
        <form>
          <div className="form-group">
            <label htmlFor="age" className="text-secondary w-100 text-start">
              Age
            </label>
            <input
              type="number"
              className="form-control bg-light"
              onChange={(e) => setAge(e.target.value)}
              value={age}
            />
            {errors.age && <small className="text-danger">{errors.age}</small>}
          </div>

          <div className="form-group">
            <label
              htmlFor="currentJob"
              className="text-secondary w-100 text-start"
            >
              Current Job
            </label>
            <input
              type="text"
              className="form-control bg-light"
              onChange={(e) => setCurrentJob(e.target.value)}
              value={currentJob}
            />
            {errors.currentJob && (
              <small className="text-danger">{errors.currentJob}</small>
            )}
          </div>

          <div className="form-group">
            <label
              htmlFor="wantedCareer"
              className="text-secondary w-100 text-start"
            >
              Wanted Career
            </label>
            <input
              type="text"
              className="form-control bg-light"
              onChange={(e) => setWantedCareer(e.target.value)}
              value={wantedCareer}
            />
            {errors.wantedCareer && (
              <small className="text-danger">{errors.wantedCareer}</small>
            )}
          </div>

          <div className="form-group">
            <label
              htmlFor="relationship"
              className="text-secondary w-100 text-start"
            >
              Relationship Status
            </label>
            <input
              type="text"
              className="form-control bg-light"
              onChange={(e) => setRelationship(e.target.value)}
              value={relationship}
            />
            {errors.relationship && (
              <small className="text-danger">{errors.relationship}</small>
            )}
          </div>

          <div className="form-group">
            <label
              htmlFor="socialCircle"
              className="text-secondary w-100 text-start"
            >
              Social Circle
            </label>
            <input
              type="text"
              className="form-control bg-light"
              onChange={(e) => setSocialCircle(e.target.value)}
              value={socialCircle}
            />
            {errors.socialCircle && (
              <small className="text-danger">{errors.socialCircle}</small>
            )}
          </div>

          <button
            type="button"
            className="btn btn-primary my-2 w-100 bg-sky-500"
            onClick={(e) => handleSubmit(e)}
          >
            Proceed
          </button>
        </form>
      </div>
    </div>
  );
};

export default CommentForm;
