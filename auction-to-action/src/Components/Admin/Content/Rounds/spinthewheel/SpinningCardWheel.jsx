import React, { useEffect, useRef, useState } from 'react';

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
  initialItems = Array.from({ length: 75 }, (_, i) => ({ 
    id: i + 1, 
    bidNo: i + 1,
    title: `Bid ${i + 1}`,
    details: `Details for bid ${i + 1}`,
    category: `Category ${Math.floor(i / 10) + 1}`
  })),
  radius = 550,
  baseCardWidth = 50, // Base width when all cards are present
  maxCardWidth = 120, // Maximum width when few cards remain
  cardHeight = 260,
  initialSpeed = 0.008, // Good spinning velocity
  friction = 0.995, // Smoother deceleration
  onBidSelected = null, // Callback function to handle selected bid
}) {
  // State management
  const [availableItems, setAvailableItems] = useState(initialItems);
  const [selectedItems, setSelectedItems] = useState([]);
  const [currentSelectedBid, setCurrentSelectedBid] = useState(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [wheelStopped, setWheelStopped] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [teamData, setTeamData] = useState({
  teamCode: "",
  teamName: "",
  bidAmount: "",
  spinBid: ""
});
  // Calculate dynamic card width based on remaining items
  const getDynamicCardWidth = () => {
    const remainingCards = availableItems.length;
    const totalCards = initialItems.length;
    
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
    setShowForm(false); // Make sure form is hidden when a new selection starts

    // Pick random bid
    const selection = pickRandomBid(availableItems);
    if (!selection) return;

    const { item: selectedBid, index: selectedIndex } = selection;
    console.log("🎉 Selected Bid:", selectedBid);

    // Set current selection
    setCurrentSelectedBid(selectedBid);

    // Calculate target angle to position selected card in front
    const targetCardIndex = availableItems.findIndex(item => item.id === selectedBid.id);
    const targetAngle = -(targetCardIndex / availableItems.length) * Math.PI * 2;
    
    // Animate to target position
    await animateToPosition(targetAngle);

    // Don't auto-remove - wait for user to manually close
    // The user can now see the card and decide to either close or keep it
  };
  
  const handleConfirmSelection = () => {
    if (!currentSelectedBid) return;

    // Set the team data with the spin bid won
    setTeamData({
      teamCode: "",
      teamName: "",
      bidAmount: "",
      spinBid: `#${currentSelectedBid.bidNo} - ${currentSelectedBid.title}`
    });

    // Show the form
    setShowForm(true);
  };

  const handleSaveAndResume = () => {
    // Ensure a bid is selected and form is visible
    if (!currentSelectedBid || !showForm) return;

    // Remove from available items
    const selectedIndex = availableItems.findIndex(item => item.id === currentSelectedBid.id);
    const newAvailableItems = removeBidFromArray(availableItems, selectedIndex);
    setAvailableItems(newAvailableItems);
    
    // Add to selected items with the new team data
    setSelectedItems(prev => [...prev, {
      ...currentSelectedBid,
      teamCode: teamData.teamCode,
      teamName: teamData.teamName,
      bidAmount: teamData.bidAmount,
      spinBid: teamData.spinBid
    }]);

    // Call callback if provided
    if (onBidSelected) {
      onBidSelected(currentSelectedBid, newAvailableItems, [...selectedItems, currentSelectedBid]);
    }

    // Reset states
    setTeamData({ teamCode: "", teamName: "", bidAmount: "", spinBid: "" });
    setCurrentSelectedBid(null);
    setIsSelecting(false);
    setWheelStopped(false);
    setShowForm(false);
    
    // Resume spinning if there are items left
    if (newAvailableItems.length > 0) {
      setSpinning(true);
      speedRef.current = initialSpeed;
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
      .carousel{ position:absolute; left:50%; top:50%; transform-style:preserve-3d; transform:translate(-50%, -50%) rotateX(-10deg); }
      .card{ position:absolute; width: ${currentCardWidth}px; height: ${cardHeight}px; left:50%; top:50%; transform-origin:center center; transform-style:preserve-3d; margin:-${cardHeight / 2}px 0 0 -${currentCardWidth / 2}px; cursor:pointer; transition: transform 300ms cubic-bezier(.2,.9,.2,1), box-shadow 300ms, opacity 300ms, z-index 0ms; overflow: hidden; }
      .card-inner{ width:100%; height:100%; border-radius:12px; overflow:hidden; backface-visibility:hidden; display:flex; align-items:flex-end; justify-content:center; font-family:Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; background: linear-gradient(180deg, rgba(255,255,255,0.1), rgba(0,0,0,0.15)); box-shadow: 0 8px 18px rgba(0,0,0,0.25); border:1px solid rgba(255,255,255,0.06); }
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

  // Position cards around circle
  useEffect(() => {
    const wrapper = stageRef.current?.querySelector('.carousel');
    if (!wrapper) return;
    
    const count = availableItems.length;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const el = wrapper.children[i];
      if (el) {
        // rotateY so the card faces outward, then translateZ
        el.style.transform = `rotateY(${(angle + angleRef.current) * (180 / Math.PI)}deg) translateZ(${radius}px)`;
      }
    }
  }, [availableItems, radius]);

  // RAF loop
  useEffect(() => {
    const wrapper = stageRef.current?.querySelector('.carousel');
    if (!wrapper) return;
    
    const update = () => {
      if (!isSelecting) {
        angleRef.current += speedRef.current;
        // apply friction if not actively spinning
        if (!spinning) speedRef.current *= friction;
      }
      
      // re-position children
      const count = availableItems.length;
      for (let i = 0; i < count; i++) {
        const base = (i / count) * Math.PI * 2;
        const total = base + angleRef.current;
        const deg = total * (180 / Math.PI);
        const el = wrapper.children[i];
        if (el) {
          el.style.transform = `rotateY(${deg}deg) translateZ(${radius}px)`;
          // compute facing factor for size/shadow
          const norm = Math.cos(total); // 1 at front, -1 at back
          const scale = 0.75 + 0.5 * (norm > 0 ? norm : 0);
          
          // Handle opacity and visibility for selected card scenario
          if (wheelStopped && currentSelectedBid && availableItems[i]?.id === currentSelectedBid.id) {
            // Selected card: full opacity and highest z-index
            el.style.opacity = '1';
            el.style.zIndex = '1000';
          } else if (wheelStopped && currentSelectedBid) {
            // Other cards when selection is active: reduce opacity and lower z-index
            el.style.opacity = norm > 0 ? '0.3' : '0.1';
            el.style.zIndex = norm > 0 ? '10' : '1';
          } else {
            // Normal spinning state
            el.style.opacity = 0.5 + 0.5 * (norm > 0 ? norm : 0);
            el.style.zIndex = norm > 0 ? '50' : '10';
          }
          
          el.style.transform += ` scale(${scale})`;
          
          // mark front card with class and highlight if selected
          if (norm > 0.98) {
            el.classList.add('front');
            // If this is the selected bid and wheel is stopped, enlarge it more
            if (wheelStopped && currentSelectedBid && availableItems[i]?.id === currentSelectedBid.id) {
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
  }, [availableItems.length, radius, friction, spinning, isSelecting, wheelStopped, currentSelectedBid]);

  // Pointer controls for drag-to-spin
  useEffect(() => {
    const el = stageRef.current;
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
      {/* Information Panel */}
      <div style={{ marginBottom: 20, textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: 10 }}>
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
        
        {/* Removed the selected bid info panel since it's now shown on the card itself */}
      </div>

      <div className="spin3d-stage" ref={stageRef}>
        <div className="spin3d-wrapper">
          <div className="carousel" style={{ width: currentCardWidth * 2, height: cardHeight * 1.2 }}>
            {availableItems.map((item, i) => (
              <div
                key={item.id}
                className="card"
                onClick={() => !isSelecting && alert(`Clicked ${item.title}`)}
                style={{
                  transform: `rotateY(${(i / availableItems.length) * 360}deg) translateZ(${radius}px)`,
                  pointerEvents: isSelecting ? 'none' : 'auto',
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
                      // Show detailed info for selected card
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
                        <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '6px' }}>
                          {item.title}
                        </div>
                        <div style={{ fontSize: '12px', opacity: 0.9, marginBottom: '6px' }}>
                          {item.details}
                        </div>
                        <div style={{ fontSize: '11px', opacity: 0.8, fontStyle: 'italic' }}>
                          {item.category}
                        </div>
                        <div style={{ 
                          marginTop: '10px',
                          padding: '4px 8px',
                          background: 'rgba(255,215,0,0.3)',
                          borderRadius: '12px',
                          fontSize: '10px',
                          fontWeight: 'bold',
                          color: '#FFD700'
                        }}>
                          SELECTED
                        </div>
                      </div>
                    ) : (
                      // Show normal bid number for unselected cards
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{item.bidNo}</div>
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
          disabled={isSelecting || availableItems.length === 0 || showForm} // Disable button if form is showing
          style={{ 
            background: isSelecting || showForm ? '#666' : '#e53e3e',
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

        {/* Show confirm button when a bid is selected and form is not showing */}
        {currentSelectedBid && !showForm && (
          <button 
            onClick={handleConfirmSelection}
            style={{
              background: '#28a745',
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
            Confirm Selection
          </button>
        )}
      </div>

      {/* Team Details Form */}
      {showForm && (
        <div style={{ 
          marginTop: 20, 
          padding: 20, 
          background: '#1f2937', 
          borderRadius: 12, 
          color: 'white', 
          maxWidth: 400, 
          marginInline: 'auto'
        }}>
          <h3 style={{ marginBottom: 15 }}>Enter Team Details</h3>

          <div style={{ marginBottom: 10 }}>
            <label style={{ color: 'white' }}>Team Code</label>
            <input 
              type="text" 
              value={teamData.teamCode}
              onChange={(e) => setTeamData({ ...teamData, teamCode: e.target.value })}
              style={{ 
                width: '100%', 
                padding: 8, 
                borderRadius: 6, 
                border: '1px solid #ccc', 
                marginTop: 5, 
                background: '#374151', 
                color: 'white' 
              }}
            />
          </div>

          <div style={{ marginBottom: 10 }}>
            <label style={{ color: 'white' }}>Team Name</label>
            <input 
              type="text" 
              value={teamData.teamName}
              onChange={(e) => setTeamData({ ...teamData, teamName: e.target.value })}
              style={{ 
                width: '100%', 
                padding: 8, 
                borderRadius: 6, 
                border: '1px solid #ccc', 
                marginTop: 5, 
                background: '#374151', 
                color: 'white' 
              }}
            />
          </div>

          <div style={{ marginBottom: 10 }}>
            <label style={{ color: 'white' }}>Bid Amount</label>
            <input 
              type="number" 
              value={teamData.bidAmount || ""}
              onChange={(e) => setTeamData({ ...teamData, bidAmount: e.target.value })}
              style={{ 
                width: '100%', 
                padding: 8, 
                borderRadius: 6, 
                border: '1px solid #ccc', 
                marginTop: 5, 
                background: '#374151', 
                color: 'white' 
              }}
            />
          </div>

          <div style={{ marginBottom: 10 }}>
            <label style={{ color: 'white' }}>Spin Bid Won</label>
            <input 
              type="text" 
              value={teamData.spinBid}
              disabled
              style={{ 
                width: '100%', 
                padding: 8, 
                borderRadius: 6, 
                border: '1px solid #ccc', 
                marginTop: 5, 
                background: '#374151', 
                color: 'white' 
              }}
            />
          </div>

          <button 
            onClick={handleSaveAndResume}
            style={{
              background: '#10b981',
              padding: '10px 20px',
              border: 'none',
              borderRadius: 8,
              color: 'white',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Save & Resume
          </button>
        </div>
      )}

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
                <strong style={{ color: 'black' }}>#{item.bidNo}</strong>
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
  );
}