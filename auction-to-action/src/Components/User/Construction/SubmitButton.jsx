import React from "react";

const SubmitButton = ({ gameState, onClick, buttonText = "Construct" }) => {
  const styles = `
    .construct-row { 
      width: 100%; 
      display:flex; 
      justify-content: center; 
      margin-top: 12px; 
    }
    .construct-btn {
      background: transparent;
      backdropFilter: blur(15px);
      border: 1px solid #e8ff00;
      color: #e8ff00;
      padding: 16px 32px;
      border-radius: 0;
      cursor: pointer;
      font-weight: 600;
      font-size: 1rem;
      letter-spacing: 2px;
      text-transform: uppercase;
      transition: all 0.3s ease;
    }
    .construct-btn:hover { 
      transform: translateY(-2px); 
      background: rgba(232, 255, 0, 0.1);
      box-shadow: 0 10px 20px rgba(232,255,0,0.15);
      color: #e8ff00;
    }
    .construct-btn:active {
      transform: translateY(0px);
      box-shadow: 0 4px 16px rgba(232, 255, 0, 0.3);
    }
  `;

  // Only show construct buttons in Round 3 (gameState === 5)
  if (gameState !== 5) {
    return null;
  }

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
