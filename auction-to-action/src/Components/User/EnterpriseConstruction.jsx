import React, { useState, useRef } from "react";
import axios from 'axios';
import { socketServerUrl } from '../../servercon';
import SlidingAnimation from "./Construction/SlidingAnimation";
import SlidingAnimationProduct from "./Construction/SlidingAnimationProduct";
import SubmitButton from "./Construction/SubmitButton";

const EnterpriseConstruction = ({ gameState }) => {
  const [notification, setNotification] = useState("");
  const [activeTab, setActiveTab] = useState("enterprises");
  const slidingAnimationRef = useRef();
  const slidingAnimationProductRef = useRef();

  const handleConstruct = async () => {
    const activeRef =
      activeTab === "enterprises"
        ? slidingAnimationRef
        : slidingAnimationProductRef;
    const activeCard = activeRef.current?.getActiveCard();

    if (!activeCard) {
      setNotification(
        `Please select a ${
          activeTab === "enterprises" ? "enterprise" : "product"
        } first.`
      );
      setTimeout(() => setNotification(""), 5000);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setNotification("Please log in to construct items.");
        setTimeout(() => setNotification(""), 5000);
        return;
      }

      const endpoint = activeTab === "enterprises" 
        ? `${socketServerUrl}/api/construction/construct-enterprise`
        : `${socketServerUrl}/api/construction/purchase-product`;

      const requestData = activeTab === "enterprises" 
        ? {
            enterpriseId: activeCard.id,
            title: activeCard.title,
            worth: activeCard.worth,
            requirements: activeCard.requirements
          }
        : {
            productId: activeCard.id,
            title: activeCard.title,
            worth: activeCard.worth,
            requirements: activeCard.requirements,
            requiredEnterpriseId: activeCard.requiredEnterpriseId
          };

      const response = await axios.post(endpoint, requestData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        setNotification(response.data.message);
        
        if (activeRef.current?.refreshComponent) {
          activeRef.current.refreshComponent();
        }
      }

    } catch (error) {
      console.error('Construction error:', error);
      
      if (error.response?.data?.error) {
        setNotification(error.response.data.error);
      } else {
        setNotification("Failed to construct/purchase item. Please try again.");
      }
    }

    setTimeout(() => setNotification(""), 5000);
  };

  const styles = `
    .page-inner {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      box-sizing: border-box;
      width: 100%;
    }
    .notification {
      position: fixed;
      top: 1.25rem;
      right: 1.25rem;
      background-color: #0C969C;
      color: white;
      padding: 0.75rem 1.25rem;
      border-radius: 0.5rem;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      z-index: 50;
      animation: fadeInOut 5s ease-in-out forwards;
    }
    @keyframes fadeInOut {
      0% { opacity: 0; transform: translateY(-12px); }
      10% { opacity: 1; transform: translateY(0); }
      90% { opacity: 1; transform: translateY(0); }
      100% { opacity: 0; transform: translateY(-12px); }
    }
    
    .tab-navigation {
      display: flex;
      gap: 0;
      margin-bottom: 1.5rem;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .tab-button {
      flex: 1;
      padding: 12px 24px;
      border: none;
      background-color: #f7f9fc;
      color: #64748b;
      font-weight: 600;
      font-size: 0.95rem;
      cursor: pointer;
      transition: all 0.3s ease;
      position: relative;
    }
    
    .tab-button:hover {
      background-color: #e2e8f0;
      color: #475569;
    }
    
    .tab-button.active {
      background-color: #0C969C;
      color: white;
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(12, 150, 156, 0.2);
    }
    
    .tab-button.active::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 3px;
      background-color: #0a7c82;
    }
    
    .content-container {
      min-height: 500px;
      transition: opacity 0.3s ease;
    }
  `;

  return (
    <div style={{ width: "100%", boxSizing: "border-box" }}>
      {notification && (
        <div className="notification">
          <p style={{ margin: 0 }}>{notification}</p>
        </div>
      )}
      <style>{styles}</style>
      <div className="page-inner">
        <div className="tab-navigation">
          <button
            className={`tab-button ${
              activeTab === "enterprises" ? "active" : ""
            }`}
            onClick={() => setActiveTab("enterprises")}
          >
            Enterprise Construction
          </button>
          <button
            className={`tab-button ${activeTab === "products" ? "active" : ""}`}
            onClick={() => setActiveTab("products")}
          >
            Available Products
          </button>
        </div>

        <div className="content-container">
          {activeTab === "enterprises" && (
            <SlidingAnimation ref={slidingAnimationRef} />
          )}
          {activeTab === "products" && (
            <SlidingAnimationProduct ref={slidingAnimationProductRef} />
          )}
        </div>

        <SubmitButton
          gameState={gameState}
          onClick={handleConstruct}
          buttonText={
            activeTab === "enterprises"
              ? "Construct Enterprise"
              : "Purchase Product"
          }
        />
      </div>
    </div>
  );
};

export default EnterpriseConstruction;
