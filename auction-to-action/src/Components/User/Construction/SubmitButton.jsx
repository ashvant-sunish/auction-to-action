import React from "react";

const SubmitButton = ({ gameState, onClick, buttonText = "Construct" }) => {
  const styles = `
    .construct-row { 
      width: 100%; 
      display:flex; 
      justify-content: center; 
      margin-top: 24px; 
    }
    .construct-btn {
      background-color: #0d9488;
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      border: none;
      cursor: pointer;
      font-weight: 700;
      font-size: 1rem;
      box-shadow: 0 4px 14px 0 rgba(0, 118, 112, 0.39);
      transition: transform 180ms ease, background-color 180ms ease, box-shadow 180ms ease;
    }
    .construct-btn:hover { 
      transform: translateY(-2px); 
      background-color: #11a396;
      box-shadow: 0 6px 20px 0 rgba(0, 118, 112, 0.45);
    }
  `;

  // Remove gameState restriction to always show the button
  // if (gameState !== 5) {
  //   return null;
  // }

  return (
    <>
      <style>{styles}</style>
      <div className="construct-row">
        <button className="construct-btn" onClick={onClick}>
          {buttonText}
        </button>
      </div>
    </>
  );
};

export default SubmitButton;
