import React from 'react'
import { useNavigate } from 'react-router-dom';

const floatingCartStyle = {
  position: 'fixed',
  bottom: '2rem',
  right: '2rem',
  padding: '1rem',
  borderRadius: '50%',
  backgroundColor: '#007bff',
  color: 'white',
  border: 'none',
  cursor: 'pointer',
  boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
  zIndex: 1000
};

const FloatingAdd = () => {
  const navigator = useNavigate();
  const goToNew = () => {
    navigator('/generate');
  };

  return (
    <div>
      <button 
        style={floatingCartStyle}
        onClick={goToNew}
        aria-label="Go to cart"
      >
        <i className="fa fa-plus w-5"></i>
      </button>
    </div>
  )
}

export default FloatingAdd
