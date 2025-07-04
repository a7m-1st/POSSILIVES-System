import React from 'react'
import VerifyForm from '../components/VerifyForm/VerifyForm.tsx'

const Verify = () => {
  return (
    <>
    <div className="">
      <div>
        <h1 className="text-center">
            Welcome To <br/> 
            <b>Possilives</b>
        </h1>
      </div>
      <div className="d-flex justify-content-center">
        <div className="w-50">
          <VerifyForm />
        </div>
      </div>

    </div>
    </>
  )
}

export default Verify
