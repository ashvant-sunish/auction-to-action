import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import SlidingAnimation from "./Construction/SlidingAnimation";
import SlidingAnimationProduct from "./Construction/SlidingAnimationProduct";
import SubmitButton from "./Construction/SubmitButton";
import serverUrl from "./../../servercon";
import { AvailableMaterialsTable } from "./DashboardContent";
import { Box } from "@chakra-ui/react";

const EnterpriseConstruction = ({ gameState }) => {
  const [notification, setNotification] = useState("");
  const [activeTab, setActiveTab] = useState("enterprises");
  const [resources, setResources] = useState({});
  const slidingAnimationRef = useRef();
  const slidingAnimationProductRef = useRef();

  const fetchTeamInventory = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch(
        `${serverUrl}/api/construction/inventory`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.ok) {
        const inventoryData = await response.json();
        setResources(inventoryData.resources || {});
      }
    } catch (error) {
      console.error("Error fetching team inventory:", error);
    }
  };

  useEffect(() => {
    fetchTeamInventory();
  }, []);
  

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
      const token = localStorage.getItem("token");
      if (!token) {
        setNotification("Please log in to construct items.");
        setTimeout(() => setNotification(""), 5000);
        return;
      }

      const endpoint =
        activeTab === "enterprises"
          ? `${serverUrl}/api/construction/construct-enterprise`
          : `${serverUrl}/api/construction/purchase-product`;

      const requestData =
        activeTab === "enterprises"
          ? {
              enterpriseId: activeCard.id,
              title: activeCard.title,
              worth: activeCard.worth,
              requirements: activeCard.requirements,
            }
          : {
              productId: activeCard.id,
              title: activeCard.title,
              worth: activeCard.worth,
              requirements: activeCard.requirements,
              requiredEnterpriseId: activeCard.requiredEnterpriseId,
            };

      const response = await axios.post(endpoint, requestData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.data.success) {
        setNotification(response.data.message);

        if (activeRef.current?.refreshComponent) {
          activeRef.current.refreshComponent();
        }
        fetchTeamInventory();
      }
    } catch (error) {
      console.error("Construction error:", error);

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
      background: var(--surface);
      backdropFilter: blur(15px);
      border: 1px solid var(--outline);
      color: var(--text-primary);
      padding: 0.75rem 1.25rem;
      border-radius: 0.75rem;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
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
      gap: 8px;
      margin-bottom: 0.75rem;
      border-radius: 12px;
      overflow: hidden;
    }
    
    .tab-button {
      flex: 1;
      padding: 12px 24px;
      border: 1px solid var(--outline);
      background: var(--surface-container);
      backdropFilter: blur(10px);
      color: var(--text-secondary);
      font-weight: 600;
      font-size: 0.95rem;
      cursor: pointer;
      transition: all 0.3s ease;
      position: relative;
      border-radius: 8px;
    }
    
    .tab-button:hover {
      background: var(--surface-high);
      color: var(--text-primary);
      border-color: var(--outline);
      transform: translateY(-1px);
    }
    
    .tab-button.active {
      background: var(--primary-container);
      backdropFilter: blur(15px);
      color: var(--on-primary-container);
      border-color: var(--primary);
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(81, 36, 49, 0.5);
    }
    
    .tab-button.active::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: var(--primary);
      border-radius: 0 0 8px 8px;
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

        {/* Show product purchases during Round 3 (gameState === 5)
            Show enterprise construction only after Round 3 ends (gameState === 6) */}
        {/* Use roundCounter value to control availability: 
            products available when counter === 2 (round 3 started),
            enterprises available when counter >= 3 (round 3 ended) */}
        <SubmitButton
          gameState={gameState}
          onClick={handleConstruct}
          buttonText={
            activeTab === "enterprises"
              ? "Construct Enterprise"
              : "Purchase Product"
          }
          show={
            activeTab === "enterprises" ? gameState === 6 : gameState === 5
          }
        />
        
        <Box mt={8}>
          <AvailableMaterialsTable 
            resources={resources} 
            isFullScreen={false} 
            toggleFullScreen={() => {}} 
          />
        </Box>
      </div>
    </div>
  );
};

export default EnterpriseConstruction;
