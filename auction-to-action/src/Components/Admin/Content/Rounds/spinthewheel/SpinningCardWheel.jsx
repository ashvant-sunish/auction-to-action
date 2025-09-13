import React, { useEffect, useRef, useState } from 'react';
import { FrameImages } from './../../../../../utils/spinthewheelimagepath';
import axios from 'axios';
import { socketServerUrl } from '../../../../../servercon';
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
  baseCardWidth = 50, // Base width when all cards are present
  maxCardWidth = 120, // Maximum width when few cards remain
  cardHeight = 260,
  initialSpeed = 0.008, // Good spinning velocity
  friction = 0.995, // Smoother deceleration
  onBidSelected = null, // Callback function to handle selected bid

}) {
  // State management
  const [availableItems, setAvailableItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [currentSelectedBid, setCurrentSelectedBid] = useState(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [wheelStopped, setWheelStopped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [sessionId, setSessionId] = useState(null);

  // Generate session ID on component mount
  useEffect(() => {
    setSessionId(`wheel_${round}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  }, [round]);

  // Fetch game items from database
  const fetchGameItems = async () => {
    try {
      setLoading(true);
      const adminToken = localStorage.getItem('adminToken');
      
      const response = await axios.get(
        `${socketServerUrl}/api/admin/game-items/round/${round}`,
        {
          headers: {
            'Authorization': `Bearer ${adminToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data) {
        console.log('🎯 Fetched game items response:', response.data);
        console.log('📦 Available items sample:', response.data.availableItems?.slice(0, 3));
        console.log('✅ Selected items sample:', response.data.selectedItems?.slice(0, 3));
        
        setAvailableItems(response.data.availableItems);
        setSelectedItems(response.data.selectedItems);
        console.log('Loaded game items:', response.data);
      }
    } catch (error) {
      console.error('Error fetching game items:', error);
      alert('Failed to load game items from database');
    } finally {
      setLoading(false);
    }
  };

  // Load game items when component mounts
  useEffect(() => {
    fetchGameItems();
  }, [round]);

  // Socket.IO listener for real-time updates
  useEffect(() => {
    const socket = io(socketServerUrl);
    
    // Listen for new wheel events
    socket.on('wheelRandomSelection', (data) => {
      console.log('🎯 Admin received wheel random selection:', data);
      
      if (data.round === round && data.sessionId !== sessionId) {
        // Another admin triggered a spin
        console.log('🔄 Another admin triggered spin');
        fetchGameItems();
      }
    });

    socket.on('wheelConfirmation', (data) => {
      console.log('✅ Admin received wheel confirmation:', data);
      
      if (data.round === round) {
        // An item was confirmed and removed
        fetchGameItems();
        
        // Reset any current selection if the selected item was removed
        if (currentSelectedBid && data.itemDetails?.itemCode === currentSelectedBid.itemCode) {
          setCurrentSelectedBid(null);
          setIsSelecting(false);
          setWheelStopped(false);
          setSpinning(true);
          speedRef.current = initialSpeed;
        }
      }
    });

    socket.on('wheelSkip', (data) => {
      console.log('⏭️ Admin received wheel skip:', data);
      
      if (data.round === round && data.sessionId !== sessionId) {
        // Another admin skipped
        console.log('🔄 Another admin skipped');
        fetchGameItems();
      }
    });

    // Legacy listeners for backward compatibility
    socket.on('wheelUpdate', (data) => {
      console.log('🔄 Received wheel update (legacy):', data);
      
      if (data.action === 'itemSelected' && data.round === round) {
        fetchGameItems();
        
        if (currentSelectedBid && data.selectedItem?.itemCode === currentSelectedBid.itemCode) {
          setCurrentSelectedBid(null);
          setIsSelecting(false);
          setWheelStopped(false);
          setSpinning(true);
          speedRef.current = initialSpeed;
        }
      }
    });

    // Listen for round item updates
    socket.on('roundItemUpdate', (data) => {
      console.log('📡 Received round item update:', data);
      
      if (data.round === round) {
        fetchGameItems();
      }
    });
    
    return () => {
      socket.disconnect();
    };
  }, [round, currentSelectedBid, sessionId]);
  // Calculate dynamic card width based on remaining items
  const getDynamicCardWidth = () => {
    const remainingCards = availableItems.length;
    const totalCards = availableItems.length + selectedItems.length;
    
    if (totalCards === 0) return baseCardWidth;
    
    // As cards decrease, width increases
    const widthIncrease = (totalCards - remainingCards) / totalCards;
    const dynamicWidth = baseCardWidth + (maxCardWidth - baseCardWidth) * widthIncrease;
    
    return Math.min(dynamicWidth, maxCardWidth);
  };
  
  const currentCardWidth = getDynamicCardWidth();
  
  const stageRef = useRef(null);
  const angleRef = useRef(0);
  const speedRef = useRef(initialSpeed);
  const rafRef = useRef(null);
  const dragging = useRef(false);
  const lastX = useRef(0);
  const [spinning, setSpinning] = useState(true);
  const [ticking, setTicking] = useState(0);

  // Function to select random bid and position wheel
  const selectRandomBid = async () => {
    if (availableItems.length === 0) {
      alert("No more bids available!");
      return;
    }

    setIsSelecting(true);
    setSpinning(false);

    // Pick random bid
    const selection = pickRandomBid(availableItems);
    if (!selection) return;

    const { item: selectedBid, index: selectedIndex } = selection;
    console.log("🎉 Selected Bid:", selectedBid);

    // Set current selection
    setCurrentSelectedBid(selectedBid);

    // Record random selection in database
    try {
      const adminToken = localStorage.getItem('adminToken');
      
      const wheelState = {
        availableItemsCount: availableItems.length,
        selectedItemsCount: selectedItems.length,
        currentlySelectedItem: selectedBid
      };

      await axios.post(
        `${socketServerUrl}/api/wheel/wheel-selection/random`,
        {
          round,
          itemDetails: {
            itemId: selectedBid.id,
            itemCode: selectedBid.itemCode,
            bidNumber: selectedBid.bidNumber || selectedBid.bidNo,
            title: selectedBid.title,
            basePrice: selectedBid.basePrice,
            resources: selectedBid.resources,
            image: selectedBid.image,
            teamName: selectedBid.teamName,
            teamCode: selectedBid.teamCode,
            bidAmount: selectedBid.bidAmount
          },
          wheelState,
          sessionId
        },
        {
          headers: {
            'Authorization': `Bearer ${adminToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('✅ Random selection recorded in database');
    } catch (error) {
      console.error('❌ Error recording random selection:', error);
      // Continue with UI update even if database update fails
    }

    // Calculate target angle to position selected card in front
    const targetCardIndex = availableItems.findIndex(item => item.id === selectedBid.id);
    const targetAngle = -(targetCardIndex / availableItems.length) * Math.PI * 2;
    
    // Animate to target position
    await animateToPosition(targetAngle);

    // Show selected bid for display
    console.log("Selected bid details:", selectedBid);
  };
  
  const handleSkipSelection = async () => {
    if (!currentSelectedBid) return;

    console.log('⏭️ Skipping item:', {
      itemId: currentSelectedBid.id,
      itemCode: currentSelectedBid.itemCode,
      bidNumber: currentSelectedBid.bidNumber
    });

    // Record skip in database
    try {
      const adminToken = localStorage.getItem('adminToken');
      
      const wheelState = {
        availableItemsCount: availableItems.length,
        selectedItemsCount: selectedItems.length,
        currentlySelectedItem: null // Will be cleared after skip
      };

      await axios.post(
        `${socketServerUrl}/api/wheel/wheel-selection/skip`,
        {
          round,
          itemDetails: {
            itemId: currentSelectedBid.id,
            itemCode: currentSelectedBid.itemCode,
            bidNumber: currentSelectedBid.bidNumber || currentSelectedBid.bidNo,
            title: currentSelectedBid.title,
            basePrice: currentSelectedBid.basePrice,
            resources: currentSelectedBid.resources,
            image: currentSelectedBid.image,
            teamName: currentSelectedBid.teamName,
            teamCode: currentSelectedBid.teamCode,
            bidAmount: currentSelectedBid.bidAmount
          },
          wheelState,
          sessionId
        },
        {
          headers: {
            'Authorization': `Bearer ${adminToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('✅ Skip recorded in database');
    } catch (error) {
      console.error('❌ Error recording skip:', error);
      // Continue with UI update even if database update fails
    }

    // Just skip the selection without making any backend calls
    // The item stays in item_list and is not moved to item_list_2
    
    console.log('⏭️ Item skipped - staying in wheel for future selection');

    // Start transition
    setIsTransitioning(true);
    
    // Gradually fade out selection
    setTimeout(() => {
      setCurrentSelectedBid(null);
      setWheelStopped(false);
    }, 150);
    
    // Resume gentle spinning
    setTimeout(() => {
      speedRef.current = initialSpeed * 0.5;
      setSpinning(true);
    }, 200);
    
    // Complete transition
    setTimeout(() => {
      setIsSelecting(false);
      setIsTransitioning(false);
      speedRef.current = initialSpeed;
    }, 400);
  };

  const handleCloseSelection = async () => {
    if (!currentSelectedBid) return;

    try {
      const adminToken = localStorage.getItem('adminToken');
      
      console.log('Attempting to select item:', {
        itemId: currentSelectedBid.id,
        itemCode: currentSelectedBid.itemCode,
        bidNumber: currentSelectedBid.bidNumber
      });
      
      // Move item from item_list to item_list_2 via backend
      const response = await axios.post(
        `${socketServerUrl}/api/admin/game-items/select`,
        {
          itemCode: currentSelectedBid.itemCode,
          bidNumber: currentSelectedBid.bidNumber, // Use bidNumber field
          itemName: currentSelectedBid.title
        },
        {
          headers: {
            'Authorization': `Bearer ${adminToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Selection response:', response.data);

      if (response.status === 201) {
        // Remove from available items locally
        const selectedIndex = availableItems.findIndex(item => item.id === currentSelectedBid.id);
        if (selectedIndex !== -1) {
          const newAvailableItems = removeBidFromArray(availableItems, selectedIndex);
          setAvailableItems(newAvailableItems);
          
          // Add to selected items locally
          setSelectedItems(prev => [...prev, {
            ...currentSelectedBid,
            selectedAt: new Date()
          }]);
        }

        console.log('✅ Item moved successfully from item_list to item_list_2');
        
        // Record confirmation in database
        try {
          const wheelState = {
            availableItemsCount: availableItems.length - 1, // -1 because item was removed
            selectedItemsCount: selectedItems.length + 1, // +1 because item was added
            currentlySelectedItem: null // Cleared after confirmation
          };

          await axios.post(
            `${socketServerUrl}/api/wheel/wheel-selection/confirm`,
            {
              round,
              itemDetails: {
                itemId: currentSelectedBid.id,
                itemCode: currentSelectedBid.itemCode,
                bidNumber: currentSelectedBid.bidNumber || currentSelectedBid.bidNo,
                title: currentSelectedBid.title,
                basePrice: currentSelectedBid.basePrice,
                resources: currentSelectedBid.resources,
                image: currentSelectedBid.image,
                teamName: currentSelectedBid.teamName,
                teamCode: currentSelectedBid.teamCode,
                bidAmount: currentSelectedBid.bidAmount
              },
              wheelState,
              sessionId
            },
            {
              headers: {
                'Authorization': `Bearer ${adminToken}`,
                'Content-Type': 'application/json'
              }
            }
          );

          console.log('✅ Confirmation recorded in database');
        } catch (dbError) {
          console.error('❌ Error recording confirmation:', dbError);
          // Continue with UI update even if database update fails
        }
      }
    } catch (error) {
      console.error('Error selecting item:', error);
      console.error('Error response:', error.response?.data);
      alert(`Failed to select item: ${error.response?.data?.message || error.message}`);
      return;
    }

    // Reset selection state immediately
    setCurrentSelectedBid(null);
    setIsSelecting(false);
    setWheelStopped(false);
    
    // Only reset angle when item count changes (item removed)
    // This prevents visual artifacts
    if (availableItems.length > 1) {
      // Reset angle to redistribute remaining cards evenly
      angleRef.current = 0;
    }
    
    // Resume spinning if there are items left - add delay for DOM to settle
    const remainingItems = availableItems.length - 1; // -1 because we just removed one
    if (remainingItems > 0) {
      setTimeout(() => {
        setSpinning(true);
        speedRef.current = initialSpeed;
      }, 100); // Short delay to let React re-render
    }
  };

  // Animate wheel to specific position
  const animateToPosition = (targetAngle) => {
    return new Promise((resolve) => {
      const startAngle = angleRef.current;
      const angleDiff = targetAngle - startAngle;
      const duration = 2000; // 2 seconds
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function for smooth stop
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
    
    // Update styles with current card width
    const styleContent = `
      .spin3d-stage{ perspective:1200px; width:100%; height:600px; display:flex; align-items:center; justify-content:center; }
      .spin3d-wrapper{ position:relative; width:100%; height:100%; max-width:1100px; }
      .carousel{ position:absolute; left:50%; top:50%; transform-style:preserve-3d; transform:translate(-50%, -50%) rotateX(-10deg); transition: all 0.5s ease; }
      .card{ position:absolute; width: ${currentCardWidth}px; height: ${cardHeight}px; left:50%; top:50%; transform-origin:center center; transform-style:preserve-3d; margin:-${cardHeight / 2}px 0 0 -${currentCardWidth / 2}px; cursor:pointer; transition: transform 500ms cubic-bezier(.2,.9,.2,1), box-shadow 300ms, opacity 500ms, width 300ms ease, margin 300ms ease; overflow: hidden; }
      .card-inner{ width:100%; height:100%; border-radius:12px; overflow:hidden; backface-visibility:hidden; display:flex; align-items:flex-end; justify-content:center; font-family:Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; background: transparent; box-shadow: 0 8px 18px rgba(0,0,0,0.25); border: none; transition: all 0.3s ease; }
      .card .face{ width:100%; height:100%; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:22px; color:#fff; padding:16px; box-sizing:border-box; }
      .card.front{ transform: translateZ(${radius + 40}px) scale(1.08); z-index:50; box-shadow: 0 18px 40px rgba(0,0,0,0.5); }
      .controls{ position:relative; margin-top:16px; display:flex; gap:8px; justify-content:center; }
      .btn{ background:#111827; color:#fff; padding:8px 12px; border-radius:8px; border:1px solid rgba(255,255,255,0.06); cursor:pointer; }
      .speed-range{ width:220px; }
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

  // Clean up state when availableItems changes (items removed)
  useEffect(() => {
    // If the currently selected bid is no longer in available items, reset selection
    if (currentSelectedBid && !availableItems.find(item => item.id === currentSelectedBid.id)) {
      console.log('🧹 Cleaning up selection state - item no longer available');
      setCurrentSelectedBid(null);
      setIsSelecting(false);
      setWheelStopped(false);
      
      // Restart spinning if items remain
      if (availableItems.length > 0) {
        setSpinning(true);
        speedRef.current = initialSpeed;
      }
    }
  }, [availableItems, currentSelectedBid]);

  // Position cards around circle
  useEffect(() => {
    const wrapper = stageRef.current?.querySelector('.carousel');
    if (!wrapper) return;
    
    const count = availableItems.length;
    const domChildren = Array.from(wrapper.children);
    
    // Only position if DOM children match available items
    if (domChildren.length === count) {
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        const el = domChildren[i];
        if (el) {
          // rotateY so the card faces outward, then translateZ
          el.style.transform = `rotateY(${(angle + angleRef.current) * (180 / Math.PI)}deg) translateZ(${radius}px)`;
        }
      }
    }
  }, [availableItems, radius]);

  // RAF loop
  useEffect(() => {
    const wrapper = stageRef.current?.querySelector('.carousel');
    if (!wrapper) return;
    
    const update = () => {
      if (!isSelecting || (!currentSelectedBid && !wheelStopped)) {
        angleRef.current += speedRef.current;
        // apply friction if not actively spinning
        if (!spinning) speedRef.current *= friction;
      }
      
      // re-position children - match DOM children to available items
      const count = availableItems.length;
      const domChildren = Array.from(wrapper.children);
      
      // Ensure DOM children count matches available items count
      if (domChildren.length !== count) {
        // DOM is out of sync, let React re-render handle it
        return;
      }
      
      for (let i = 0; i < count; i++) {
        const base = (i / count) * Math.PI * 2;
        const total = base + angleRef.current;
        const deg = total * (180 / Math.PI);
        const el = domChildren[i];
        const item = availableItems[i];
        
        if (el && item) {
          el.style.transform = `rotateY(${deg}deg) translateZ(${radius}px)`;
          // compute facing factor for size/shadow
          const norm = Math.cos(total); // 1 at front, -1 at back
          const scale = 0.75 + 0.5 * (norm > 0 ? norm : 0);
          
          // Handle opacity and visibility for selected card scenario
          if (wheelStopped && currentSelectedBid && item.id === currentSelectedBid.id) {
            // Selected card: full opacity and highest z-index
            el.style.opacity = '1';
            el.style.zIndex = '1000';
          } else if (wheelStopped && currentSelectedBid) {
            // Other cards when selection is active: reduce opacity and lower z-index
            el.style.opacity = norm > 0 ? '0.3' : '0.1';
            el.style.zIndex = norm > 0 ? '10' : '1';
          } else {
            // Normal spinning state or transitioning out of selection
            el.style.opacity = 0.5 + 0.5 * (norm > 0 ? norm : 0);
            el.style.zIndex = norm > 0 ? '50' : '10';
          }
          
          el.style.transform += ` scale(${scale})`;
          
          // mark front card with class and highlight if selected
          if (norm > 0.98) {
            el.classList.add('front');
            // If this is the selected bid and wheel is stopped, enlarge it more
            if (wheelStopped && currentSelectedBid && item.id === currentSelectedBid.id) {
              el.style.transform += ` scale(1.8)`;
              el.style.zIndex = '1000';
              el.style.width = '160px'; // Make selected card wider but smaller than before
              el.style.marginLeft = '-80px'; // Re-center the wider card
            }
          } else {
            el.classList.remove('front');
          }
        }
      }
      setTicking(t => t + 1);
      rafRef.current = requestAnimationFrame(update);
    };
    rafRef.current = requestAnimationFrame(update);
    return () => cancelAnimationFrame(rafRef.current);
  }, [availableItems, radius, friction, spinning, isSelecting, wheelStopped, currentSelectedBid]);

  // Pointer controls for drag-to-spin
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return; // Add null check
    
    const onDown = (e) => {
      dragging.current = true;
      setSpinning(false);
      lastX.current = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
    };
    const onMove = (e) => {
      if (!dragging.current) return;
      const x = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
      const dx = x - lastX.current;
      lastX.current = x;
      // convert px to radians roughly
      speedRef.current = dx * 0.008;
      angleRef.current += speedRef.current;
    };
    const onUp = () => {
      dragging.current = false;
      // continue spinning with current speed
      setSpinning(true);
    };
    el.addEventListener('mousedown', onDown);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    // touch
    el.addEventListener('touchstart', onDown, { passive: true });
    window.addEventListener('touchmove', onMove, { passive: true });
    window.addEventListener('touchend', onUp);
    return () => {
      el.removeEventListener('mousedown', onDown);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      el.removeEventListener('touchstart', onDown);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onUp);
    };
  }, []);

  return (
    <div style={{ padding: 20 }}>
      {loading ? (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '400px',
          fontSize: '18px',
          color: '#666' 
        }}>
          Loading Round {round} items from database...
        </div>
      ) : (
        <div>
          {/* Information Panel */}
          <div style={{ marginBottom: 20, textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: 10 }}>
              <div>
                <strong>Round: </strong>
                <span style={{ color: 'blue' }}>{round}</span>
              </div>
              <div>
                <strong>Available Bids: </strong>
                <span style={{ color: 'green' }}>{availableItems.length}</span>
              </div>
              <div>
                <strong>Selected Bids: </strong>
                <span style={{ color: 'white' }}>{selectedItems.length}</span>
              </div>
              <div>
                <strong>Card Width: </strong>
                <span style={{ color: 'orange' }}>{Math.round(currentCardWidth)}px</span>
              </div>
            </div>
          </div>

          <div className="spin3d-stage" ref={stageRef}>
        <div className="spin3d-wrapper">
          <div className="carousel" style={{ width: currentCardWidth * 2, height: cardHeight * 1.2 }}>
            {availableItems.map((item, i) => (
              <div
                key={`${item.id}-${availableItems.length}-${i}`}
                className="card"
                onClick={() => !isSelecting && alert(`Clicked ${item.title}`)}
                style={{
                  transform: `rotateY(${(i / availableItems.length) * 360}deg) translateZ(${radius}px)`,
                  pointerEvents: isSelecting ? 'none' : 'auto',
                }}
              >
                <div className="card-inner" 
                style={{ 
                  background: currentSelectedBid?.id === item.id && wheelStopped 
                    ? 'transparent'
                    : `linear-gradient(180deg, hsl(${(i / availableItems.length) * 360} 60% 60% / 0.85), hsl(${(i / availableItems.length) * 360} 60% 35% / 0.9))`,
                  border: currentSelectedBid?.id === item.id ? 'none' : '1px solid rgba(255,255,255,0.06)',
                  padding: 0,
                  margin: 0,
                  position: 'relative'
                }}>
                  <div className="face">
                    {currentSelectedBid?.id === item.id && wheelStopped ? (
                      // Show detailed info for selected card using item's image
                      <div style={{
                        textAlign: 'center', 
                        color: 'white', 
                        fontSize: '14px',
                        lineHeight: '1.3',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '100%',
                        width: '100%',
                        backgroundImage: `url(${FrameImages[item.image] || FrameImages.Frame14})`,
                        backgroundSize: '100% 100%',
                        backgroundPosition: 'center center',
                        backgroundRepeat: 'no-repeat',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        margin: 0,
                        padding: 0,
                        borderRadius: '12px',
                        overflow: 'hidden'
                      }}>
                        {/* Overlay for better text readability */}
                        <div style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: 'linear-gradient(135deg, rgba(0,0,0,0.3) 0%, rgba(26,26,46,0.4) 50%, rgba(15,52,96,0.3) 100%)',
                          borderRadius: '12px',
                          margin: 0,
                          padding: 0
                        }}></div>
                        
                        {/* Content with higher z-index */}
                        <div style={{ 
                          position: 'relative', 
                          zIndex: 2,
                          textShadow: '2px 2px 6px rgba(0,0,0,0.9), 0 0 10px rgba(0,0,0,0.7)',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          height: '100%',
                          padding: '12px',
                          textAlign: 'center'
                        }}>
                          {/* Bid Number */}
                          <div style={{ 
                            fontSize: '20px', 
                            fontWeight: 'bold', 
                            marginBottom: '6px', 
                            color: '#FFD700',
                            textShadow: '2px 2px 4px rgba(0,0,0,0.9), 0 0 8px rgba(0,0,0,0.7)'
                          }}>
                            {item.bidNumber || item.bidNo}
                          </div>
                          
                          {/* Bid Name */}
                          <div style={{ 
                            fontSize: '16px', 
                            fontWeight: 'bold', 
                            marginBottom: '8px', 
                            color: 'white',
                            textShadow: '2px 2px 4px rgba(0,0,0,0.9), 0 0 8px rgba(0,0,0,0.7)'
                          }}>
                            {item.title}
                          </div>
                          
                          {/* Resources */}
                          <div style={{ 
                            fontSize: '11px', 
                            marginBottom: '6px', 
                            color: '#E5E7EB',
                            textShadow: '1px 1px 3px rgba(0,0,0,0.8)',
                            lineHeight: '1.2'
                          }}>
                            {Object.entries(item.resources || {}).map(([key, value]) => (
                              `${key}: ${value}`
                            )).join(' | ')}
                          </div>
                          
                          {/* Price */}
                          <div style={{ 
                            fontSize: '14px', 
                            fontWeight: 'bold',
                            color: '#10B981',
                            textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
                          }}>
                            ₹{item.basePrice?.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ) : (
                      // Show bid number for unselected cards
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{item.bidNumber || item.bidNo}</div>
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

      <div className="controls">
        <button 
          className="btn" 
          onClick={selectRandomBid}
          disabled={isSelecting || availableItems.length === 0}
          style={{ 
            background: isSelecting ? '#666' : '#e53e3e',
            fontSize: '18px',
            padding: '15px 30px',
            fontWeight: 'bold',
            borderRadius: '10px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            transform: isSelecting ? 'scale(0.95)' : 'scale(1)',
            transition: 'all 0.2s ease',
            marginRight: currentSelectedBid ? '15px' : '0'
          }}
        >
          {isSelecting ? 'Selecting...' : 'Select Random Bid'}
        </button>

        {/* Show close button when a bid is selected */}
        {currentSelectedBid && wheelStopped && (
          <>
            <button 
              onClick={handleCloseSelection}
              style={{
                background: '#10B981',
                color: 'white',
                border: 'none',
                padding: '15px 30px',
                borderRadius: '10px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '18px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                transition: 'all 0.2s ease',
                marginRight: '15px'
              }}
            >
              Confirm & Remove from Wheel
            </button>
            
            <button 
              onClick={handleSkipSelection}
              style={{
                background: '#F59E0B',
                color: 'white',
                border: 'none',
                padding: '15px 30px',
                borderRadius: '10px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '18px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                transition: 'all 0.2s ease'
              }}
            >
              Skip This Bid
            </button>
          </>
        )}
      </div>

      {/* Selected Items History */}
      {selectedItems.length > 0 && (
        <div style={{ marginTop: 20, padding: 15, background: '#f5f5f5', borderRadius: 10 }}>
          <h4 style={{ color: 'black' }}>Previously Selected Bids:</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 10 }}>
            {selectedItems.map((item, index) => (
              <div 
                key={item.id} 
                style={{ 
                  background: 'white', 
                  padding: 8, 
                  borderRadius: 5, 
                  border: '1px solid #ddd',
                  minWidth: 80,
                  textAlign: 'center'
                }}
              >
                <strong style={{ color: 'black' }}>#{item.bidNumber || item.bidNo}</strong>
                <div style={{ fontSize: '12px', color: '#666' }}>{item.title}</div>
                <div style={{ fontSize: '12px', color: '#333' }}>
                {item.teamName} ({item.teamCode})
                </div>
                <div style={{ fontSize: '12px', color: 'green', fontWeight: 'bold' }}>
                  ₹{item.bidAmount}
                </div>      
              </div>
            ))}
          </div>
        </div>
      )}
      </div>
      )}
    </div>
  );
}