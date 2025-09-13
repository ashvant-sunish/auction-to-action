import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { socketServerUrl } from '../../../servercon';
import io from 'socket.io-client';

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
  initialSpeed = 0.03, // Increased for better visibility
  friction = 0.995,
  onBidSelected = null,
}) {
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

  // Fetch game items from public endpoint (no authentication required)
  const fetchGameItems = async () => {
    try {
      setLoading(true);
      
      // Use public endpoint that doesn't require authentication
      const response = await axios.get(
        `${socketServerUrl}/api/admin/public/game-items/round/${round}`
      );

      if (response.data && response.data.availableItems) {
        // Use the available items directly from the backend
        const items = response.data.availableItems.map((item) => ({
          id: item.id,
          itemCode: item.itemCode,
          bidNo: item.bidNo || item.bidNumber,
          title: item.title,
          details: item.details,
          category: item.category,
          basePrice: item.basePrice,
          resources: item.resources || {}
        }));
        
        setAvailableItems(items);
        console.log('📦 Fetched real available items:', items.length);
      } else {
        console.error('❌ Failed to fetch items: Invalid response structure');
        throw new Error('API response not successful');
      }
    } catch (error) {
      console.error('❌ Error fetching game items:', error);
      
      // Log more details about the error
      if (error.response) {
        console.error('Backend error:', error.response.status, error.response.data);
      } else if (error.request) {
        console.error('Network error: No response from server');
      } else {
        console.error('Request setup error:', error.message);
      }
      
      // Fallback to basic items based on typical round structure
      const fallbackItems = Array.from({ length: 75 }, (_, i) => ({
        id: `fallback_${i + 1}`,
        itemCode: `r1i${String(i + 1).padStart(3, '0')}`,
        bidNo: i + 1,
        title: `BID ${i + 1}`,
        details: `Base Price: ₹${7000 + Math.floor(Math.random() * 2500)}`,
        category: `Round ${round}`,
        basePrice: 7000 + Math.floor(Math.random() * 2500),
        resources: {
          'Technology': Math.floor(Math.random() * 7) + 1,
          'Property': Math.floor(Math.random() * 6) + 1
        }
      }));
      setAvailableItems(fallbackItems);
      console.log('📦 Using fallback items due to server error');
    } finally {
      setLoading(false);
    }
  };

  // Load initial data
  useEffect(() => {
    fetchGameItems();
  }, [round]);

  // Debug: Log state changes
  useEffect(() => {
    console.log('🎠 User wheel state changed:', {
      spinning,
      wheelStopped,
      isSelecting,
      availableItems: availableItems.length,
      socketConnected
    });
  }, [spinning, wheelStopped, isSelecting, availableItems.length, socketConnected]);

  // Ensure wheel starts spinning when data is loaded
  useEffect(() => {
    if (availableItems.length > 0 && !isSelecting && !wheelStopped) {
      setSpinning(true);
      console.log('🎠 User wheel started spinning with', availableItems.length, 'items');
    }
  }, [availableItems.length, isSelecting, wheelStopped]);

  // Socket.IO listener for real-time updates from admin
  useEffect(() => {
    const socket = io(socketServerUrl);
    
    socket.on('connect', () => {
      console.log('🔌 User wheel connected to socket:', socket.id);
      setSocketConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('🔌 User wheel disconnected from socket');
      setSocketConnected(false);
    });

    // Listen for admin wheel events
    socket.on('wheelRandomSelection', (data) => {
      console.log('📡 User received wheel random selection:', data);
      
      if (data.round === round && data.itemDetails) {
        triggerAdminSpin(data.itemDetails);
      }
    });

    socket.on('wheelConfirmation', (data) => {
      console.log('📡 User received wheel confirmation:', data);
      
      if (data.round === round) {
        fetchGameItems();
        resetWheel();
      }
    });

    socket.on('wheelSkip', (data) => {
      console.log('📡 User received wheel skip:', data);
      
      if (data.round === round) {
        resetWheel();
      }
    });

    // Legacy listeners for backward compatibility
    socket.on('wheelUpdate', (data) => {
      console.log('📡 User received wheel update (legacy):', data);
      
      if (data.round === round) {
        if (data.action === 'randomSelection' && data.selectedItem) {
          triggerAdminSpin(data.selectedItem);
        } else if (data.action === 'itemSelected') {
          fetchGameItems();
          resetWheel();
        } else if (data.action === 'skip') {
          resetWheel();
        }
      }
    });

    // Listen for round item updates
    socket.on('roundItemUpdate', (data) => {
      console.log('� User received round item update:', data);
      
      if (data.round === round) {
        fetchGameItems();
      }
    });
    
    return () => {
      socket.disconnect();
    };
  }, [round]);

  // Reset wheel state
  const resetWheel = () => {
    console.log('🔄 Resetting user wheel - resuming normal spinning');
    setCurrentSelectedBid(null);
    setIsSelecting(false);
    setWheelStopped(false);
    setSpinning(true);
    speedRef.current = initialSpeed;
  };

  // Trigger spin animation when admin clicks spin
  const triggerAdminSpin = async (itemDetails) => {
    if (availableItems.length === 0 || isSelecting) {
      return;
    }

    setIsSelecting(true);
    // Don't stop spinning immediately - let it continue while we find the target

    // Find the selected item in our current list
    const targetItem = availableItems.find(item => 
      item.itemCode === itemDetails?.itemCode || 
      item.id === itemDetails?.itemId ||
      item.bidNo === itemDetails?.bidNumber
    );

    if (!targetItem) {
      console.warn('⚠️ Selected item not found in available items:', itemDetails);
      resetWheel();
      return;
    }

    console.log("🎉 Admin Selected Bid for Users:", targetItem);
    setCurrentSelectedBid(targetItem);

    // Calculate target angle to position selected card in front
    const targetCardIndex = availableItems.findIndex(item => item.id === targetItem.id);
    const targetAngle = -(targetCardIndex / availableItems.length) * Math.PI * 2;

    // Animate to target position (this will temporarily stop spinning)
    setSpinning(false);
    await animateToPosition(targetAngle);

    // Show selected state briefly
    setWheelStopped(true);
    
    // Resume spinning after 3 seconds
    setTimeout(() => {
      resetWheel();
    }, 3000);

    if (onBidSelected) {
      onBidSelected(targetItem, availableItems);
    }
  };
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
    const dynamicWidth = baseCardWidth + (maxCardWidth - baseCardWidth) * widthIncrease;

    return Math.min(Math.max(dynamicWidth, baseCardWidth), maxCardWidth);
  };

  const currentCardWidth = getDynamicCardWidth();

  // This component is view-only - no manual controls for users

  // Animate wheel to specific position
  const animateToPosition = (targetAngle) => {
    return new Promise((resolve) => {
      const startAngle = angleRef.current;
      const angleDiff = targetAngle - startAngle;
      const duration = 2000;
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 3);
        
        angleRef.current = startAngle + (angleDiff * easeOut);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setWheelStopped(true);
          resolve();
        }
      };

      animate();
    });
  };

  // Inject component-scoped styles once
  useEffect(() => {
    const id = 'spin3d-cards-styles';
    const existingStyle = document.getElementById(id);
    
    // Ensure valid width values
    const safeCardWidth = isFinite(currentCardWidth) ? currentCardWidth : baseCardWidth;
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
      .spin3d-stage{ perspective:1200px; width:100%; height:600px; display:flex; align-items:center; justify-content:center; position:relative; }
      .spin3d-wrapper{ position:relative; width:100%; height:100%; max-width:1100px; }
      .carousel{ position:absolute; left:50%; top:50%; transform-style:preserve-3d; transform:translate(-50%, -50%) rotateX(-10deg); }
      .card{ position:absolute; width: ${safeCardWidth}px; height: ${safeCardHeight}px; left:50%; top:50%; transform-origin:center center; transform-style:preserve-3d; margin:-${safeCardHeight / 2}px 0 0 -${safeCardWidth / 2}px; cursor:pointer; transition: transform 300ms cubic-bezier(.2,.9,.2,1), box-shadow 300ms, opacity 300ms, z-index 0ms; overflow: hidden; }
      .card-inner{ width:100%; height:100%; border-radius:12px; overflow:hidden; backface-visibility:hidden; display:flex; align-items:flex-end; justify-content:center; font-family:Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; background: linear-gradient(180deg, rgba(255,255,255,0.1), rgba(0,0,0,0.15)); box-shadow: 0 8px 18px rgba(0,0,0,0.25); border:1px solid rgba(255,255,255,0.06); }
      .card .face{ width:100%; height:100%; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:22px; color:#fff; padding:16px; box-sizing:border-box; }
      .card.front{ transform: translateZ(${safeRadius + 40}px) scale(1.08); z-index:50; box-shadow: 0 18px 40px rgba(0,0,0,0.5); }
    `;
    if (existingStyle) {
      existingStyle.innerHTML = styleContent;
    } else {
      const style = document.createElement('style');
      style.id = id;
      style.innerHTML = styleContent;
      document.head.appendChild(style);
    }
  }, [currentCardWidth, cardHeight, radius]);

  // RAF loop - Main animation driver
  useEffect(() => {
    const wrapper = stageRef.current?.querySelector('.carousel');
    if (!wrapper) {
      console.log('⚠️ No carousel wrapper found');
      return;
    }

    console.log('🎠 Starting user animation loop, spinning:', spinning, 'wheelStopped:', wheelStopped);

    const update = () => {
      // Always rotate when spinning is true and not stopped
      if (spinning && !wheelStopped) {
        angleRef.current += speedRef.current;
        // Keep speed constant for continuous rotation
        if (speedRef.current < initialSpeed * 0.5) {
          speedRef.current = initialSpeed;
        }
      }
      
      const count = availableItems.length;
      if (count === 0) {
        rafRef.current = requestAnimationFrame(update);
        return;
      }
      
      for (let i = 0; i < count; i++) {
        const base = (i / count) * Math.PI * 2;
        const total = base + angleRef.current;
        const deg = total * (180 / Math.PI);
        const el = wrapper.children[i];
        if (el) {
          const norm = Math.cos(total);
          const scale = 0.75 + 0.5 * (norm > 0 ? norm : 0);
          const opacity = 0.5 + 0.5 * (norm > 0 ? norm : 0);
          
          el.style.transform = `rotateY(${deg}deg) translateZ(${radius}px) scale(${scale})`;
          el.style.opacity = opacity;
          el.style.zIndex = norm > 0 ? '50' : '10';
          
          // Highlight the front card
          if (norm > 0.98) {
            el.classList.add('front');
            if (wheelStopped && currentSelectedBid) {
              el.style.boxShadow = '0 0 30px rgba(34, 197, 94, 0.8)';
            }
          } else {
            el.classList.remove('front');
            if (!wheelStopped) {
              el.style.boxShadow = '';
            }
          }
        }
      }
      rafRef.current = requestAnimationFrame(update);
    };
    
    rafRef.current = requestAnimationFrame(update);
    
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [availableItems.length, radius, spinning, wheelStopped, currentSelectedBid, initialSpeed]);

  // No external controls exposed - this is a view-only component

  return (
    <div className="spin3d-stage" ref={stageRef}>
      {/* Selected Item Banner */}
      {currentSelectedBid && wheelStopped && (
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 200,
          background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
          color: '#1a1a1a',
          padding: '12px 24px',
          borderRadius: '30px',
          fontSize: '18px',
          fontWeight: 'bold',
          boxShadow: '0 8px 32px rgba(251, 191, 36, 0.4)',
          border: '2px solid rgba(255,255,255,0.3)',
          animation: 'pulse 2s infinite'
        }}>
          🎉 SELECTED: {currentSelectedBid.title} - ₹{currentSelectedBid.basePrice}
        </div>
      )}

      {/* Connection Status Indicator */}
      <div style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        zIndex: 100,
        padding: '8px 12px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: 'bold',
        background: socketConnected 
          ? 'linear-gradient(135deg, #22c55e, #16a34a)' 
          : 'linear-gradient(135deg, #ef4444, #dc2626)',
        color: 'white',
        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
        display: 'flex',
        alignItems: 'center',
        gap: '6px'
      }}>
        <div style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: 'white',
          animation: socketConnected ? 'pulse 2s infinite' : 'none'
        }}></div>
        {socketConnected ? 'LIVE' : 'DISCONNECTED'}
      </div>

      {/* Spinning Indicator */}
      {spinning && !wheelStopped && !loading && (
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 100,
          padding: '8px 16px',
          borderRadius: '20px',
          fontSize: '14px',
          fontWeight: 'bold',
          background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
          color: 'white',
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <div style={{
            width: '12px',
            height: '12px',
            border: '2px solid rgba(255,255,255,0.3)',
            borderTop: '2px solid white',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          Wheel Spinning...
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 200,
          background: 'rgba(0,0,0,0.8)',
          color: 'white',
          padding: '20px 40px',
          borderRadius: '12px',
          fontSize: '18px',
          fontWeight: 'bold',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          textAlign: 'center'
        }}>
          Loading Round {round} items...
        </div>
      )}

      {!loading && availableItems.length === 0 && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 200,
          background: 'rgba(255,255,255,0.1)',
          color: 'white',
          padding: '20px 40px',
          borderRadius: '12px',
          fontSize: '18px',
          fontWeight: 'bold',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          textAlign: 'center'
        }}>
          🎮 View Only - Admin Controls the Wheel
        </div>
      )}

      <div className="spin3d-wrapper">
        <div className="carousel" style={{ 
          width: isFinite(currentCardWidth) ? currentCardWidth * 2 : baseCardWidth * 2, 
          height: isFinite(cardHeight) ? cardHeight * 1.2 : 260 * 1.2 
        }}>
          {!loading && availableItems.map((item, i) => (
            <div
              key={item.id}
              className="card"
              style={{
                pointerEvents: 'none', // Disable all user interactions
                // Remove static transform - let RAF loop handle positioning
              }}
            >
              <div className="card-inner" style={{
                background: currentSelectedBid?.id === item.id && wheelStopped
                  ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)'
                  : `linear-gradient(180deg, hsl(${(i / availableItems.length) * 360} 60% 60% / 0.85), hsl(${(i / availableItems.length) * 360} 60% 35% / 0.9))`,
                border: currentSelectedBid?.id === item.id ? '3px solid gold' : '1px solid rgba(255,255,255,0.06)',
                padding: currentSelectedBid?.id === item.id ? '8px' : '0',
                boxShadow: currentSelectedBid?.id === item.id && wheelStopped
                  ? '0 0 30px rgba(255,215,0,0.5), 0 8px 32px rgba(0,0,0,0.4)'
                  : undefined
              }}>
                <div className="face">
                  {currentSelectedBid?.id === item.id && wheelStopped ? (
                    <div style={{
                      textAlign: 'center',
                      color: 'white',
                      fontSize: '14px',
                      lineHeight: '1.3',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      height: '100%'
                    }}>
                      <div style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>
                        #{item.bidNo}
                      </div>
                      <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>
                        {item.title}
                      </div>
                      <div style={{ fontSize: '12px', marginBottom: '6px', opacity: 0.9 }}>
                        {Object.entries(item.resources || {}).map(([key, value]) => (
                          `${key}: ${value}`
                        )).join(' | ')}
                      </div>
                      <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#10B981' }}>
                        ₹{item.basePrice?.toLocaleString()}
                      </div>
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '24px', fontWeight: 'bold' }}>#{item.bidNo}</div>
                      <div style={{ fontSize: '12px', opacity: 0.8 }}>{item.title}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}