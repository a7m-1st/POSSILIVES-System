import React, { useEffect } from "react";
import BarGraph from "../components/BarGraph/BarGraph.tsx";
import ButtonCaption from "../components/ButtonCaption/ButtonCaption.tsx";
import { useNavigate } from "react-router-dom";

const Result = () => {
  const navigate = useNavigate();
  const navigateFunc = (dest:string) => {
    navigate(dest);
  };
  return (
    <div className="container min-h-screen d-flex justify-content-center align-items-center">
      <div className="row w-100">
        <div className="col-12 col-md-6 offset-md-3">
          <p className="text-secondary">Test Success here is your result:</p>
          <BarGraph />

          <ButtonCaption
            title="Retake Test"
            caption="Retake the test to get a more accurate result"
            onclick={() => navigateFunc("/smartpersonality")}
          />
          <ButtonCaption title="Proceed" onclick={() => navigateFunc("/newhabits")}/>
        </div>
      </div>
    </div>
  );
};

export default Result;
