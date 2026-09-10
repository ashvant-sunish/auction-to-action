import React from "react";

const SubmitButton = ({ gameState, onClick, buttonText = "Construct", show }) => {
  const styles = `
    .construct-row { 
      width: 100%; 
      display:flex; 
      justify-content: center; 
      margin-top: 12px; 
    }
    .construct-btn {
      background: var(--primary);
      backdropFilter: blur(15px);
      border: 1px solid var(--primary);
      color: white;
      padding: 12px 24px;
      border-radius: 12px;
      cursor: pointer;
      font-weight: 700;
      font-size: 1rem;
      box-shadow: 0 8px 32px rgba(81, 36, 49, 0.4);
      transition: all 0.3s ease;
    }
    .construct-btn:hover { 
      transform: translateY(-2px); 
      background: #D46B84;
      border-color: #D46B84;
      box-shadow: 0 12px 40px rgba(81, 36, 49, 0.6);
      color: white;
    }
    .construct-btn:active {
      transform: translateY(0px);
      background: #B54761;
      box-shadow: 0 4px 16px rgba(81, 36, 49, 0.4);
    }
  `;

  // If an explicit `show` prop is provided, respect it (used by parent components).
  if (typeof show !== 'undefined') {
    if (!show) return null;
  } else {
    // Default behavior: only show in Round 3 (gameState === 5)
    if (gameState !== 5) return null;
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
