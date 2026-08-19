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
      background: rgba(15, 59, 61, 0.8);
      backdropFilter: blur(15px);
      border: 1px solid rgba(255, 255, 255, 0.3);
      color: white;
      padding: 12px 24px;
      border-radius: 12px;
      cursor: pointer;
      font-weight: 700;
      font-size: 1rem;
      box-shadow: 0 8px 32px rgba(15, 59, 61, 0.3);
      transition: all 0.3s ease;
    }
    .construct-btn:hover { 
      transform: translateY(-2px); 
      background: rgba(15, 59, 61, 0.9);
      border-color: rgba(255, 255, 255, 0.4);
      box-shadow: 0 12px 40px rgba(15, 59, 61, 0.4);
      color: white;
    }
    .construct-btn:active {
      transform: translateY(0px);
      box-shadow: 0 4px 16px rgba(15, 59, 61, 0.3);
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
