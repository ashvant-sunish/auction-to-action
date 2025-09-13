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
  baseCardWidth = 50,
  maxCardWidth = 120,
  cardHeight = 260,
  initialSpeed = 0.008,
  friction = 0.995,
  onBidSelected = null,
}) {
  // State management
  const [availableItems, setAvailableItems] = useState(initialItems);
  const [currentSelectedBid, setCurrentSelectedBid] = useState(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [wheelStopped, setWheelStopped] = useState(false);

  // Calculate dynamic card width based on remaining items
  const getDynamicCardWidth = () => {
    const remainingCards = availableItems.length;
    const totalCards = initialItems.length;

    const widthIncrease = (totalCards - remainingCards) / totalCards;
    const dynamicWidth = baseCardWidth + (maxCardWidth - baseCardWidth) * widthIncrease;

    return Math.min(dynamicWidth, maxCardWidth);
  };

  const currentCardWidth = getDynamicCardWidth();

  const stageRef = useRef(null);
  const angleRef = useRef(0);
  const speedRef = useRef(initialSpeed);
  const rafRef = useRef(null);
  const [spinning, setSpinning] = useState(true);

  // Function to select random bid and position wheel
  const selectRandomBid = async () => {
    if (availableItems.length === 0 || isSelecting) {
      console.log("No more bids available or already selecting.");
      return;
    }

    setIsSelecting(true);
    setSpinning(false);

    // Pick random bid
    const selection = pickRandomBid(availableItems);
    if (!selection) return;

    const { item: selectedBid } = selection;
    console.log("🎉 Selected Bid:", selectedBid);

    setCurrentSelectedBid(selectedBid);

    // Calculate target angle to position selected card in front
    const targetCardIndex = availableItems.findIndex(item => item.id === selectedBid.id);
    const targetAngle = -(targetCardIndex / availableItems.length) * Math.PI * 2;

    // Animate to target position
    await animateToPosition(targetAngle);

    // Remove selected item and reset state
    const newAvailableItems = removeBidFromArray(availableItems, selection.index);
    setAvailableItems(newAvailableItems);

    if (onBidSelected) {
      onBidSelected(selectedBid, newAvailableItems);
    }

    setCurrentSelectedBid(null);
    setIsSelecting(false);
    setWheelStopped(false);

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
    const styleContent = `
      .spin3d-stage{ perspective:1200px; width:100%; height:600px; display:flex; align-items:center; justify-content:center; }
      .spin3d-wrapper{ position:relative; width:100%; height:100%; max-width:1100px; }
      .carousel{ position:absolute; left:50%; top:50%; transform-style:preserve-3d; transform:translate(-50%, -50%) rotateX(-10deg); }
      .card{ position:absolute; width: ${currentCardWidth}px; height: ${cardHeight}px; left:50%; top:50%; transform-origin:center center; transform-style:preserve-3d; margin:-${cardHeight / 2}px 0 0 -${currentCardWidth / 2}px; cursor:pointer; transition: transform 300ms cubic-bezier(.2,.9,.2,1), box-shadow 300ms, opacity 300ms, z-index 0ms; overflow: hidden; }
      .card-inner{ width:100%; height:100%; border-radius:12px; overflow:hidden; backface-visibility:hidden; display:flex; align-items:flex-end; justify-content:center; font-family:Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; background: linear-gradient(180deg, rgba(255,255,255,0.1), rgba(0,0,0,0.15)); box-shadow: 0 8px 18px rgba(0,0,0,0.25); border:1px solid rgba(255,255,255,0.06); }
      .card .face{ width:100%; height:100%; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:22px; color:#fff; padding:16px; box-sizing:border-box; }
      .card.front{ transform: translateZ(${radius + 40}px) scale(1.08); z-index:50; box-shadow: 0 18px 40px rgba(0,0,0,0.5); }
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
        el.style.transform = `rotateY(${(angle + angleRef.current) * (180 / Math.PI)}deg) translateZ(${radius}px)`;
      }
    }
  }, [availableItems, radius]);

  // RAF loop
  useEffect(() => {
    const wrapper = stageRef.current?.querySelector('.carousel');
    if (!wrapper) return;

    const update = () => {
      if (spinning && !isSelecting) {
        angleRef.current += speedRef.current;
        speedRef.current *= friction;
      }
      
      const count = availableItems.length;
      for (let i = 0; i < count; i++) {
        const base = (i / count) * Math.PI * 2;
        const total = base + angleRef.current;
        const deg = total * (180 / Math.PI);
        const el = wrapper.children[i];
        if (el) {
          el.style.transform = `rotateY(${deg}deg) translateZ(${radius}px)`;
          const norm = Math.cos(total);
          const scale = 0.75 + 0.5 * (norm > 0 ? norm : 0);
          el.style.opacity = 0.5 + 0.5 * (norm > 0 ? norm : 0);
          el.style.zIndex = norm > 0 ? '50' : '10';
          el.style.transform += ` scale(${scale})`;
          if (norm > 0.98) {
            el.classList.add('front');
          } else {
            el.classList.remove('front');
          }
        }
      }
      rafRef.current = requestAnimationFrame(update);
    };
    rafRef.current = requestAnimationFrame(update);
    return () => cancelAnimationFrame(rafRef.current);
  }, [availableItems.length, radius, friction, spinning, isSelecting]);

  // Expose the selectRandomBid function for external use
  React.useImperativeHandle(null, () => ({
    selectRandomBid,
  }));

  return (
    <div className="spin3d-stage" ref={stageRef}>
      <div className="spin3d-wrapper">
        <div className="carousel" style={{ width: currentCardWidth * 2, height: cardHeight * 1.2 }}>
          {availableItems.map((item, i) => (
            <div
              key={item.id}
              className="card"
              style={{
                pointerEvents: isSelecting ? 'none' : 'auto',
                transform: `rotateY(${(i / availableItems.length) * 360}deg) translateZ(${radius}px)`,
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
  );
}