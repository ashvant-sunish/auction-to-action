import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import io from "socket.io-client";
import { FrameImages } from "../../../utils/spinthewheelimagepath";
import serverUrl from './../../../servercon';

// Bid management functions
function pickRandomBid(availableItems) {
  if (availableItems.length === 0) {
    return null; // no items left
  }
  const index = Math.floor(Math.random() * availableItems.length);
  const selectedItem = availableItems[index];
  return { item: selectedItem, index };
}

function removeBidFromArray(array, index) {
  return array.filter((_, i) => i !== index);
}

export default function Spin3DCards({
  round = 1, // Default to round 1
  radius = 550,
  baseCardWidth = 50,
  maxCardWidth = 120,
  cardHeight = 260,
  initialSpeed = 0.008, // Increased for better visibility
  friction = 0.995,
  onBidSelected = null,
}) {
  // Add new state for persisting wheel state
  const [wheelState, setWheelState] = useState(() => {
    // Try to load saved state from localStorage on mount
    const saved = localStorage.getItem(`wheel_state_round_${round}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Only use saved state if it's from the last 30 minutes
        if (Date.now() - parsed.timestamp < 30 * 60 * 1000) {
          return parsed;
        }
      } catch (e) {
        console.error("Failed to parse saved wheel state");
      }
    }
    return null;
  });

  // State management - User view only
  const [availableItems, setAvailableItems] = useState([]);
  const [currentSelectedBid, setCurrentSelectedBid] = useState(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [wheelStopped, setWheelStopped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [socketConnected, setSocketConnected] = useState(false);
  const [spinning, setSpinning] = useState(true);

  // Refs for animation
  const stageRef = useRef(null);
  const angleRef = useRef(0);
  const speedRef = useRef(initialSpeed);
  const rafRef = useRef(null);
  const animatingToPosition = useRef(false);

  // Fetch game items from public endpoint (no authentication required)
  const fetchGameItems = async () => {
    try {
      setLoading(true);

      // Use public endpoint that doesn't require authentication
      const response = await axios.get(
        `${serverUrl}/api/admin/public/game-items/round/${round}`
      );

      if (response.data && response.data.availableItems) {
        // Use the available items directly from the backend
        const items = response.data.availableItems.map((item) => ({
          id: item.id,
          itemCode: item.itemCode,
          bidNo: item.bidNo || item.bidNumber,
          bidNumber: item.bidNumber || item.bidNo, // Add both for compatibility
          title: item.title,
          details: item.details,
          category: item.category,
          basePrice: item.basePrice,
          resources: item.resources || {},
        }));

        setAvailableItems(items);
      } else {
        console.error("❌ Failed to fetch items: Invalid response structure");
        throw new Error("API response not successful");
      }
    } catch (error) {
      console.error("❌ Error fetching game items:", error);

      // Log more details about the error
      if (error.response) {
        console.error(
          "Backend error:",
          error.response.status,
          error.response.data
        );
      } else if (error.request) {
        console.error("Network error: No response from server");
      } else {
        console.error("Request setup error:", error.message);
      }

      // Fallback to basic items based on typical round structure
      const fallbackItems = Array.from({ length: 75 }, (_, i) => ({
        id: `fallback_${i + 1}`,
        itemCode: `r1i${String(i + 1).padStart(3, "0")}`,
        bidNo: i + 1,
        bidNumber: i + 1,
        title: `BID ${i + 1}`,
        details: `Base Price: ₹${7000 + Math.floor(Math.random() * 2500)}`,
        category: `Round ${round}`,
        basePrice: 7000 + Math.floor(Math.random() * 2500),
        resources: {
          Technology: Math.floor(Math.random() * 7) + 1,
          Property: Math.floor(Math.random() * 6) + 1,
        },
      }));
      setAvailableItems(fallbackItems);
    } finally {
      setLoading(false);
    }
  };

  // Load initial data with localStorage check
  useEffect(() => {
    const loadData = async () => {
      // First try to restore from localStorage
      if (wheelState) {
        setCurrentSelectedBid(wheelState.selectedBid);
        setWheelStopped(wheelState.stopped);
        setSpinning(!wheelState.stopped);
        if (wheelState.angle) {
          angleRef.current = wheelState.angle;
        }
      }

      // Then fetch from server
      await fetchGameItems();
    };

    loadData();
  }, [round]);

  // Save state changes to localStorage
  useEffect(() => {
    if (currentSelectedBid || wheelStopped) {
      const stateToSave = {
        timestamp: Date.now(),
        selectedBid: currentSelectedBid,
        stopped: wheelStopped,
        angle: angleRef.current,
        round,
      };
      localStorage.setItem(
        `wheel_state_round_${round}`,
        JSON.stringify(stateToSave)
      );
    }
  }, [currentSelectedBid, wheelStopped, round]);

  // Clear localStorage on explicit admin actions
  const clearSavedState = () => {
    localStorage.removeItem(`wheel_state_round_${round}`);
  };

  // Reset wheel state
  const resetWheel = () => {
    clearSavedState();
    setCurrentSelectedBid(null);
    setIsSelecting(false);
    setWheelStopped(false);
    setSpinning(true);
    speedRef.current = initialSpeed;
    animatingToPosition.current = false;
  };

  // Enhanced animateToPosition function with detailed logging
  const animateToPosition = (targetAngle) => {

    return new Promise((resolve) => {
      const startAngle = angleRef.current;
      let angleDiff = targetAngle - startAngle;

      // Normalize angleDiff to the shortest path (handle wrap-around)
      if (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
      if (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;

      const duration = 2000;
      const startTime = Date.now();

      animatingToPosition.current = true;

      function animate() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 3);

        angleRef.current = startAngle + angleDiff * easeOut;

        if (elapsed % 200 < 16) {
          // Log every ~200ms
          const progressPercent = (progress * 100).toFixed(1);
        }

        // Force a re-render of the carousel by updating state
        if (stageRef.current) {
          const wrapper = stageRef.current.querySelector(".carousel");
          if (wrapper) {
            wrapper.style.willChange = "transform";
          }
        }

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          console.log("🎬 Animation completed!");
          animatingToPosition.current = false;
          setWheelStopped(true);
          console.log(
            "🎬 Set wheelStopped to true and animatingToPosition to false"
          );
          resolve();
        }
      }

      animate();
    });
  };

  // Enhanced triggerAdminSpin with extensive debugging
  const triggerAdminSpin = async (itemDetails) => {
    console.log("🚀 triggerAdminSpin called with:", itemDetails);
    console.log("🚀 Current availableItems length:", availableItems.length);
    console.log("🚀 Current isSelecting:", isSelecting);
    console.log("🚀 Current wheelStopped:", wheelStopped);

    if (availableItems.length === 0 || isSelecting) {
      const reason =
        availableItems.length === 0
          ? "No items available"
          : "Already selecting";
      console.log("❌ Early return -", reason);
      return;
    }

    console.log("🎯 Triggering admin spin with item details:", itemDetails);
    setIsSelecting(true);

    // Enhanced item matching with detailed logging
    let targetItem = null;
    let matchStrategy = "none";

    console.log("🔍 Starting item matching...");
    console.log(
      "🔍 Available items sample:",
      availableItems.slice(0, 3).map((item) => ({
        id: item.id,
        itemCode: item.itemCode,
        bidNo: item.bidNo,
        bidNumber: item.bidNumber,
        title: item.title,
      }))
    );

    // Strategy 1: Match by ID
    if (itemDetails.itemId || itemDetails.id) {
      const searchId = itemDetails.itemId || itemDetails.id;
      console.log("🔍 Strategy 1: Matching by ID:", searchId);
      targetItem = availableItems.find((item) => item.id === searchId);
      if (targetItem) {
        matchStrategy = "id";
      }
      console.log("🔍 Strategy 1 result:", targetItem ? "FOUND" : "NOT FOUND");
    }

    // Strategy 2: Match by itemCode
    if (!targetItem && itemDetails.itemCode) {
      console.log("🔍 Strategy 2: Matching by itemCode:", itemDetails.itemCode);
      targetItem = availableItems.find(
        (item) => item.itemCode === itemDetails.itemCode
      );
      if (targetItem) {
        matchStrategy = "itemCode";
      }
      console.log("🔍 Strategy 2 result:", targetItem ? "FOUND" : "NOT FOUND");
    }

    // Strategy 3: Match by bidNumber/bidNo (enhanced with more logging)
    if (!targetItem && (itemDetails.bidNumber || itemDetails.bidNo)) {
      const bidNum = itemDetails.bidNumber || itemDetails.bidNo;
      console.log(
        "🔍 Strategy 3: Matching by bidNum:",
        bidNum,
        "(type:",
        typeof bidNum,
        ")"
      );

      // Try each comparison separately for better debugging
      targetItem = availableItems.find((item) => {
        const match1 = item.bidNo == bidNum;
        const match2 = item.bidNumber == bidNum;
        const match3 = String(item.bidNo) === String(bidNum);
        const match4 = String(item.bidNumber) === String(bidNum);

        if (match1 || match2 || match3 || match4) {
          console.log(`🔍 Strategy 3 MATCH found for item:`, {
            itemBidNo: item.bidNo,
            itemBidNumber: item.bidNumber,
            searchBidNum: bidNum,
            match1,
            match2,
            match3,
            match4,
          });
        }

        return match1 || match2 || match3 || match4;
      });

      if (targetItem) matchStrategy = "bidNumber";
      console.log("🔍 Strategy 3 result:", targetItem ? "FOUND" : "NOT FOUND");
    }

    // Strategy 4: Match by title (additional fallback)
    if (!targetItem && itemDetails.title) {
      console.log("🔍 Strategy 4: Matching by title:", itemDetails.title);
      targetItem = availableItems.find(
        (item) => item.title === itemDetails.title
      );
      if (targetItem) {
        matchStrategy = "title";
      }
      console.log("🔍 Strategy 4 result:", targetItem ? "FOUND" : "NOT FOUND");
    }

    // Enhanced error handling
    if (!targetItem) {
      console.error("❌ CRITICAL: Selected item not found in available items!");
      console.error(
        "❌ Item details received:",
        JSON.stringify(itemDetails, null, 2)
      );
      console.error(
        "❌ Available items sample:",
        availableItems.slice(0, 5).map((i) => ({
          id: i.id,
          itemCode: i.itemCode,
          bidNo: i.bidNo,
          bidNumber: i.bidNumber,
          title: i.title,
        }))
      );

      console.error("❌ Calling resetWheel due to no match");
      resetWheel();
      return;
    }

    console.log("✅ MATCH FOUND using strategy:", matchStrategy);
    console.log("✅ Target item:", targetItem);
    console.log("🎉 Admin Selected Bid for Users:", targetItem);

    setCurrentSelectedBid(targetItem);

    // Calculate target angle to position selected card in front
    const targetCardIndex = availableItems.findIndex(
      (item) => item.id === targetItem.id
    );
    const targetAngle =
      -(targetCardIndex / availableItems.length) * Math.PI * 2;
    setSpinning(false);

    try {
      await animateToPosition(targetAngle);
      // Animation done, just show selected state and wait for admin event
      setWheelStopped(true);

      if (onBidSelected) {
        onBidSelected(targetItem, availableItems);
      }
    } catch (error) {
      resetWheel();
    }
  };

  // Socket.IO listener for real-time updates from admin with enhanced debugging
  useEffect(() => {
    const socket = io(serverUrl);

    socket.on("connect", () => {
      console.log("🔌 User wheel connected to socket:", socket.id);
      setSocketConnected(true);
    });

    socket.on("disconnect", () => {
      console.log("🔌 User wheel disconnected from socket");
      setSocketConnected(false);
    });

    // Enhanced listeners with better debugging
    socket.on("wheelRandomSelection", (data) => {
      console.log(
        "📡 Raw wheelRandomSelection data received:",
        JSON.stringify(data, null, 2)
      );
      console.log("📡 Data round:", data.round, "Current round:", round);
      console.log("📡 Data itemDetails:", data.itemDetails);

      if (data.round === round && data.itemDetails) {
        console.log(
          "✅ Round matches and itemDetails exists, calling triggerAdminSpin"
        );

        // Add delay if items aren't loaded yet
        if (availableItems.length === 0) {
          console.log("⏳ Items not loaded yet, retrying in 500ms");
          setTimeout(() => {
            if (availableItems.length > 0) {
              triggerAdminSpin(data.itemDetails);
            } else {
              console.error("❌ Items still not loaded after 500ms delay");
            }
          }, 500);
          return;
        }

        triggerAdminSpin(data.itemDetails);
      } else {
        console.log("❌ Round mismatch or missing itemDetails");
        console.log("❌ Round match:", data.round === round);
        console.log("❌ ItemDetails exists:", !!data.itemDetails);
      }
    });

    // Add listener for different event name variations
    socket.on("RANDOM_SELECTED", (data) => {
      console.log(
        "📡 Raw RANDOM_SELECTED data received:",
        JSON.stringify(data, null, 2)
      );

      if (data.round === round && data.itemDetails) {
        console.log("✅ RANDOM_SELECTED: Round matches and itemDetails exists");

        if (availableItems.length === 0) {
          console.log(
            "⏳ RANDOM_SELECTED: Items not loaded yet, retrying in 500ms"
          );
          setTimeout(() => {
            if (availableItems.length > 0) {
              triggerAdminSpin(data.itemDetails);
            }
          }, 500);
          return;
        }

        triggerAdminSpin(data.itemDetails);
      }
    });

    socket.on("wheelConfirmation", (data) => {
      console.log("📡 User received wheel confirmation:", data);

      if (data.round == round) {
        clearSavedState(); // Clear on confirmation
        fetchGameItems();
        resetWheel();
      }
    });

    socket.on("wheelSkip", (data) => {
      console.log("📡 User received wheel skip:", data);

      if (data.round == round) {
        clearSavedState(); // Clear on skip
        resetWheel();
      }
    });

    // Legacy listeners for backward compatibility
    socket.on("wheelUpdate", (data) => {
      console.log("📡 User received wheel update (legacy):", data);

      if (data.round === round) {
        if (data.action === "randomSelection" && data.selectedItem) {
          triggerAdminSpin(data.selectedItem);
        } else if (data.action === "itemSelected") {
          fetchGameItems();
          resetWheel();
        } else if (data.action === "skip") {
          resetWheel();
        }
      }
    });

    // Listen for round item updates
    socket.on("roundItemUpdate", (data) => {
      console.log("📡 User received round item update:", data);

      if (data.round === round) {
        fetchGameItems();
      }
    });

    // Catch-all listener for debugging unknown events
    socket.onAny((eventName, data) => {
      if (
        ![
          "connect",
          "disconnect",
          "wheelRandomSelection",
          "wheelConfirmation",
          "wheelSkip",
          "wheelUpdate",
          "roundItemUpdate",
          "RANDOM_SELECTED",
        ].includes(eventName)
      ) {
        console.log("📡 Unknown socket event received:", eventName, data);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [round, availableItems.length]);

  // Calculate dynamic card width based on remaining items
  const getDynamicCardWidth = () => {
    const remainingCards = availableItems.length;

    // Avoid division by zero and infinity issues
    if (remainingCards === 0) {
      return maxCardWidth; // Use max width when no cards left
    }

    // Use remaining cards count to determine width (more cards = smaller width)
    const totalCards = 75; // Max possible cards for Round 1
    const widthIncrease = (totalCards - remainingCards) / totalCards;
    const dynamicWidth =
      baseCardWidth + (maxCardWidth - baseCardWidth) * widthIncrease;

    return Math.min(Math.max(dynamicWidth, baseCardWidth), maxCardWidth);
  };

  const currentCardWidth = getDynamicCardWidth();

  // Inject component-scoped styles once
  useEffect(() => {
    const id = "spin3d-cards-styles";
    const existingStyle = document.getElementById(id);

    // Ensure valid width values
    const safeCardWidth = isFinite(currentCardWidth)
      ? currentCardWidth
      : baseCardWidth;
    const safeCardHeight = isFinite(cardHeight) ? cardHeight : 260;
    const safeRadius = isFinite(radius) ? radius : 550;

    const styleContent = `
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      .spin3d-stage { 
        perspective: 1200px; 
        width: 100%; 
        height: calc(100vh - 100px); 
        display: flex; 
        align-items: center; 
        justify-content: center; 
        position: relative; 
        background: radial-gradient(circle at center, rgba(13, 17, 23, 0) 0%, rgba(8, 11, 15, 0.95) 100%), #080b0f;
        overflow: hidden;
      }
      .spin3d-wrapper{ position:relative; width:100%; height:100%; max-width:1100px; }
      .carousel{ position:absolute; left:50%; top:50%; transform-style:preserve-3d; transform:translate(-50%, -50%) rotateX(-10deg); }
      .card{ position:absolute; width: ${safeCardWidth}px; height: ${safeCardHeight}px; left:50%; top:50%; transform-origin:center center; transform-style:preserve-3d; margin:-${safeCardHeight / 2}px 0 0 -${safeCardWidth / 2}px; cursor:pointer; transition: transform 300ms cubic-bezier(.2,.9,.2,1), box-shadow 300ms, opacity 300ms, z-index 0ms; overflow: hidden; }
      .card-inner{ width:100%; height:100%; border-radius:12px; overflow:hidden; backface-visibility:hidden; display:flex; align-items:flex-end; justify-content:center; font-family:Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; background: linear-gradient(180deg, rgba(255,255,255,0.05), rgba(0,0,0,0.25)); box-shadow: 0 8px 18px rgba(0,0,0,0.25); border:1px solid rgba(255,255,255,0.06); }
      .card .face{ width:100%; height:100%; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:22px; color:#fff; padding:16px; box-sizing:border-box; }
      .card.front{ transform: translateZ(${safeRadius + 40}px) scale(1.08); z-index:50; box-shadow: 0 18px 40px rgba(0,0,0,0.5); }
    `;

    if (existingStyle) {
      existingStyle.innerHTML = styleContent;
    } else {
      const style = document.createElement("style");
      style.id = id;
      style.innerHTML = styleContent;
      document.head.appendChild(style);
    }
  }, [currentCardWidth, cardHeight, radius]);

  // RAF loop - Main animation driver
  useEffect(() => {
    const wrapper = stageRef.current?.querySelector(".carousel");
    if (!wrapper) {
      console.log("⚠️ No carousel wrapper found");
      return;
    }

    console.log(
      "🎪 Starting user animation loop, spinning:",
      spinning,
      "wheelStopped:",
      wheelStopped
    );

    const update = () => {
      // Only rotate when spinning and not stopped and not animating to position
      if (spinning && !wheelStopped && !animatingToPosition.current) {
        angleRef.current += speedRef.current;
        // Keep speed constant for continuous rotation
        if (speedRef.current < initialSpeed * 0.5) {
          speedRef.current = initialSpeed;
        }
      }

      // Debug logging for animation state (reduced frequency)
      if (animatingToPosition.current && Math.random() < 0.01) {
        // 1% of the time
        console.log(
          "🔄 RAF loop - animating to position, angle:",
          angleRef.current.toFixed(3)
        );
      }

      const count = availableItems.length;
      if (count === 0) {
        rafRef.current = requestAnimationFrame(update);
        return;
      }

      // Position cards using the same logic as admin side
      for (let i = 0; i < count; i++) {
        const base = (i / count) * Math.PI * 2;
        const total = base + angleRef.current;
        const deg = total * (180 / Math.PI);

        const el = wrapper.children[i];
        if (!el) continue;

        // Use the same transform pattern as admin: rotateY then translateZ
        const safeRadius = isFinite(radius) ? radius : 550;
        // norm and scale control depth/size
        const norm = Math.cos(total);
        const scale = 0.75 + 0.5 * (norm > 0 ? norm : 0);

        // Start transform with rotateY and translateZ (admin pattern)
        let transform = `rotateY(${deg}deg) translateZ(${safeRadius}px)`;

        // Apply selection / stopped variations
        const item = availableItems[i];
        const isSelectedItem =
          currentSelectedBid &&
          (currentSelectedBid.id === item.id ||
            String(currentSelectedBid.bidNo) === String(item.bidNo) ||
            String(currentSelectedBid.bidNumber) === String(item.bidNumber));

        if (wheelStopped && isSelectedItem) {
          // Selected card should pop forward and be larger
          const selectedScale = scale * 1.5;
          transform += ` scale(${selectedScale})`;
          el.style.opacity = "1";
          el.style.zIndex = "1000";
          el.style.boxShadow = "0 0 30px rgba(34, 197, 94, 0.8)";
        } else if (wheelStopped && currentSelectedBid) {
          // When some other card is selected, dim non-selected cards
          const dimScale = scale;
          el.style.opacity = norm > 0 ? "0.3" : "0.1";
          el.style.zIndex = norm > 0 ? "10" : "1";
          transform += ` scale(${dimScale})`;
          el.style.boxShadow = "";
        } else {
          // Normal spinning state
          transform += ` scale(${scale})`;
          const opacity = 0.5 + 0.5 * (norm > 0 ? norm : 0);
          el.style.opacity = String(opacity);
          el.style.zIndex = norm > 0 ? "50" : "10";
          el.style.boxShadow = "";
        }

        // Apply front class (frontal card)
        if (norm > 0.98) {
          el.classList.add("front");
        } else {
          el.classList.remove("front");
        }

        // Finally write computed transform
        el.style.transform = transform;
      }

      rafRef.current = requestAnimationFrame(update);
    };

    rafRef.current = requestAnimationFrame(update);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [
    availableItems.length,
    radius,
    spinning,
    wheelStopped,
    currentSelectedBid,
    initialSpeed,
  ]);

  return (
    <div className="spin3d-stage" ref={stageRef}>
      {/* Selected Item Presentation */}
      {currentSelectedBid && wheelStopped && (
        <div
          style={{
            position: "absolute",
            top: "40px",
            left: "40px",
            zIndex: 200,
            background: "rgba(13, 17, 23, 0.85)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(232, 255, 0, 0.3)",
            borderLeft: "4px solid #e8ff00",
            padding: "30px 40px",
            borderRadius: "0 16px 16px 0",
            boxShadow: "0 20px 40px rgba(0,0,0,0.5), 0 0 40px rgba(232, 255, 0, 0.1)",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            animation: "pulse 3s infinite",
            maxWidth: "350px",
          }}
        >
          <div style={{ fontSize: "14px", color: "gray", letterSpacing: "widest", textTransform: "uppercase" }}>
            Current Lot
          </div>
          <div style={{ fontSize: "64px", fontWeight: "300", color: "#e8ff00", lineHeight: "1", fontFamily: "'Inter', sans-serif" }}>
            {currentSelectedBid.bidNo || currentSelectedBid.bidNumber}
          </div>
          <div style={{ fontSize: "20px", fontWeight: "600", color: "white", marginTop: "10px", lineHeight: "1.2" }}>
            {currentSelectedBid.title}
          </div>
          <div style={{ fontSize: "24px", color: "#b8d000", fontWeight: "300", marginTop: "10px" }}>
            ₹{currentSelectedBid.basePrice?.toLocaleString()}
          </div>
        </div>
      )}

      {/* Connection Status Indicator */}
      <div
        style={{
          position: "absolute",
          top: "40px",
          right: "40px",
          zIndex: 100,
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <div style={{ fontSize: "12px", color: socketConnected ? "#e8ff00" : "gray", letterSpacing: "widest", fontWeight: "600" }}>
          {socketConnected ? "SYSTEM LIVE" : "OFFLINE"}
        </div>
        <div
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            background: socketConnected ? "#e8ff00" : "red",
            boxShadow: socketConnected ? "0 0 10px #e8ff00" : "none",
            animation: socketConnected ? "pulse 2s infinite" : "none",
          }}
        ></div>
      </div>

      {/* Spinning Indicator */}
      {spinning && !wheelStopped && !loading && (
        <div
          style={{
            position: "absolute",
            bottom: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 100,
            padding: "8px 16px",
            borderRadius: "20px",
            fontSize: "14px",
            fontWeight: "bold",
            background: "linear-gradient(135deg, rgba(232,255,0,0.2), rgba(200,224,0,0.15))",
            color: "#e8ff00",
            border: "1px solid rgba(232,255,0,0.4)",
            boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <div
            style={{
              width: "12px",
              height: "12px",
              border: "2px solid rgba(232,255,0,0.3)",
              borderTop: "2px solid #e8ff00",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
            }}
          ></div>
          Wheel Spinning...
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 200,
            background: "rgba(13,17,23,0.95)",
            border: "1px solid rgba(255,255,255,0.08)",
            color: "white",
            padding: "20px 40px",
            borderRadius: "12px",
            fontSize: "18px",
            fontWeight: "bold",
            boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
            textAlign: "center",
          }}
        >
          Loading Round {round} items...
        </div>
      )}

      {!loading && availableItems.length === 0 && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 200,
            background: "rgba(13,17,23,0.95)",
            border: "1px solid rgba(255,255,255,0.08)",
            color: "white",
            padding: "20px 40px",
            borderRadius: "12px",
            fontSize: "18px",
            fontWeight: "bold",
            boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
            textAlign: "center",
          }}
        >
          View Only - Admin Controls the Wheel
        </div>
      )}

      <div className="spin3d-wrapper">
        <div
          className="carousel"
          style={{
            width: isFinite(currentCardWidth)
              ? currentCardWidth * 2
              : baseCardWidth * 2,
            height: isFinite(cardHeight) ? cardHeight * 1.2 : 260 * 1.2,
          }}
        >
          {!loading &&
            availableItems.map((item, i) => {
              const isSelected =
                currentSelectedBid &&
                (currentSelectedBid.id === item.id ||
                  String(currentSelectedBid.bidNo) === String(item.bidNo) ||
                  String(currentSelectedBid.bidNumber) ===
                  String(item.bidNumber)) &&
                wheelStopped;

              // Use image if selected, else normal background
              const frameImg =
                (item.image && FrameImages[item.image]) || FrameImages.Frame14;

              return (
                <div
                  key={`${item.id}-${i}`}
                  className="card"
                  style={{
                    pointerEvents: "none",
                    width: isSelected ? "220px" : `${currentCardWidth}px`,
                    height: isSelected ? "280px" : `${cardHeight}px`,
                    margin: isSelected
                      ? "-140px 0 0 -110px"
                      : `-${cardHeight / 2}px 0 0 -${currentCardWidth / 2}px`,
                    zIndex: isSelected ? 2000 : undefined,
                    transition:
                      "width 0.2s, height 0.2s, margin 0.2s, z-index 0s",
                  }}
                >
                  <div
                    className="card-inner"
                    style={{
                      background: isSelected
                        ? `url(${frameImg}) center center / cover no-repeat`
                        : `linear-gradient(180deg, hsl(${(i / availableItems.length) * 360
                        } 60% 60% / 0.85), hsl(${(i / availableItems.length) * 360
                        } 60% 35% / 0.9))`,
                      border: isSelected
                        ? "3px solid gold"
                        : "1px solid rgba(255,255,255,0.06)",
                      padding: isSelected ? "8px" : "0",
                      boxShadow: isSelected
                        ? "0 0 30px rgba(255,215,0,0.5), 0 8px 32px rgba(0,0,0,0.4)"
                        : undefined,
                      width: "100%",
                      height: "100%",
                      transition: "all 0.2s",
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      className="face"
                      style={
                        isSelected
                          ? { background: "rgba(0,0,0,0.35)", borderRadius: 12 }
                          : {}
                      }
                    >
                      {isSelected ? (
                        <div
                          style={{
                            textAlign: "center",
                            color: "white",
                            fontSize: "15px",
                            lineHeight: "1.3",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                            alignItems: "center",
                            height: "100%",
                            width: "100%",
                            padding: "12px 0 0 0",
                          }}
                        >
                          <div
                            style={{
                              fontSize: "22px",
                              fontWeight: "bold",
                              marginBottom: "6px",
                              color: "#FFD700",
                            }}
                          >
                            {item.bidNo || item.bidNumber}
                          </div>
                          <div
                            style={{
                              fontSize: "15px",
                              fontWeight: "bold",
                              marginBottom: "6px",
                            }}
                          >
                            {item.title}
                          </div>
                          <div
                            style={{
                              fontSize: "11px",
                              marginBottom: "6px",
                              color: "#E5E7EB",
                            }}
                          >
                            {Object.entries(item.resources || {})
                              .map(([key, value]) => `${key}: ${value}`)
                              .join(" | ")}
                          </div>
                          <div
                            style={{
                              fontSize: "14px",
                              fontWeight: "bold",
                              color: "#10B981",
                            }}
                          >
                            ₹{item.basePrice?.toLocaleString()}
                          </div>
                        </div>
                      ) : (
                        <div style={{ textAlign: "center" }}>
                          <div style={{ fontSize: "18px", fontWeight: "bold" }}>
                            {item.bidNo || item.bidNumber}
                          </div>
                          <div style={{ fontSize: "11px", opacity: 0.8 }}>
                            {item.title}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
