import React from "react";
import CommentForm from "../components/CommentForm/CommentForm.tsx";

const Login = () => {
  return (
    <>
      <div>
        <h1 className="text-center">
            Welcome To <br/> 
            <b>Possilives</b>
        </h1>
      </div>
      <div className="d-flex justify-content-center">
        <div className="w-50">
          <CommentForm />
        </div>
      </div>
    </>
  );
};

export default Login;
