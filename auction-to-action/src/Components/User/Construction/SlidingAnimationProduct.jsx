import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";
import axios from "axios";
import productsData from "../../../assets/products-data.json";
import cardsData from "../../../assets/cards-data.json";

import product1 from "../../../assets/images/Products/Product1.png";
import product2 from "../../../assets/images/Products/Product2.png";
import product3 from "../../../assets/images/Products/Product3.png";
import product4 from "../../../assets/images/Products/Product4.png";
import product5 from "../../../assets/images/Products/Product5.png";
import serverUrl from "./../../../servercon";

const imageMap = {
  "Product1.png": product1,
  "Product2.png": product2,
  "Product3.png": product3,
  "Product4.png": product4,
  "Product5.png": product5,
};

// Build a lookup map for enterprise names by id
const enterpriseNameMap = {};
(Array.isArray(cardsData) ? cardsData : []).forEach((ent) => {
  enterpriseNameMap[ent.id] = ent.title;
});

const SlidingAnimationProduct = forwardRef((props, ref) => {
  const [cards, setCards] = useState([]);
  const [activeCard, setActiveCard] = useState(null); // numeric id
  const [hoveredCard, setHoveredCard] = useState(null); // numeric id
  const [focusedIndex, setFocusedIndex] = useState(null);

  // Get owned enterprises and products from backend
  const [ownedEnterprises, setOwnedEnterprises] = useState([]);
  const [ownedProducts, setOwnedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const containerRef = useRef(null);
  const cardRefs = useRef([]);
  const activeCardRef = useRef(activeCard);
  const hoveredCardRef = useRef(hoveredCard);
  const isScrollingRef = useRef(false);

  // Fetch team inventory
  const fetchTeamInventory = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await axios.get(
        `${serverUrl}/api/construction/inventory`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.enterprises) {
        const enterpriseIds = response.data.enterprises.map((ent) =>
          parseInt(ent.id)
        );
        setOwnedEnterprises(enterpriseIds);
      }
      if (response.data.products) {
        setOwnedProducts(
          response.data.products.map((prod) => parseInt(prod.id))
        );
      }
    } catch (error) {
      console.error("Error fetching team inventory:", error);
    } finally {
      setLoading(false);
    }
  };

  // normalize productsData and attach images
  useEffect(() => {
    fetchTeamInventory(); // Fetch inventory when component loads
  }, []);

  useEffect(() => {
    const normalized = (Array.isArray(productsData) ? productsData : []).map(
      (product, i) => {
        const imageName = (product.imageUrl || "").split("/").pop();
        const requiredId = parseInt(product.requiredEnterpriseId);
        const isAvailable = ownedEnterprises.includes(requiredId);

        return {
          ...product,
          id: Number(product.id) || i + 1, // ensure numeric id
          imageUrl:
            imageMap[imageName] || product.imageUrl || imageMap["Product1.png"],
          title: product.title ?? `Product ${i + 1}`,
          worth: product.worth ?? `${(i + 1) * 1000}`,
          requirements: Array.isArray(product.requirements)
            ? product.requirements
            : [],
          requiredEnterpriseId: product.requiredEnterpriseId,
          isAvailable, // Add availability status
        };
      }
    );
    setCards(normalized);
  }, [ownedEnterprises]);

  useImperativeHandle(ref, () => ({
    getActiveCard: () => {
      if (activeCard == null) return null;
      return cards.find((c) => c.id === activeCard) ?? null;
    },
    refreshComponent: () => {
      fetchTeamInventory(); // Allow parent to refresh the inventory
    },
  }));

  useEffect(() => {
    activeCardRef.current = activeCard;
  }, [activeCard]);
  useEffect(() => {
    hoveredCardRef.current = hoveredCard;
  }, [hoveredCard]);

  // constants
  const EDGE_ZONE_RATIO = 0.15;
  const BASE_SPEED = 900;
  const MAX_SPEED = 3000;
  const ACCELERATION = 9000;
  const ANIMATION_DURATION_MS = 600;

  const scrollRef = useRef({
    direction: 0,
    targetSpeed: 0,
    currentSpeed: 0,
    animationFrameId: null,
    lastTs: null,
  });

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  const scrollLoop = useCallback((timestamp) => {
    const container = containerRef.current;
    if (!container) {
      scrollRef.current.animationFrameId = null;
      scrollRef.current.lastTs = null;
      scrollRef.current.currentSpeed = 0;
      return;
    }
    if (scrollRef.current.direction === 0) {
      scrollRef.current.lastTs = null;
      scrollRef.current.currentSpeed = 0;
      scrollRef.current.animationFrameId = null;
      isScrollingRef.current = false;
      return;
    }
    if (scrollRef.current.lastTs == null) scrollRef.current.lastTs = timestamp;
    const dt = (timestamp - scrollRef.current.lastTs) / 1000;
    scrollRef.current.lastTs = timestamp;

    const needed =
      scrollRef.current.targetSpeed - scrollRef.current.currentSpeed;
    const maxDelta = ACCELERATION * dt;
    const speedDelta =
      Math.abs(needed) <= maxDelta ? needed : Math.sign(needed) * maxDelta;
    scrollRef.current.currentSpeed += speedDelta;

    const distance =
      scrollRef.current.direction * scrollRef.current.currentSpeed * dt;
    container.scrollLeft += distance;

    if (
      (container.scrollLeft <= 0 && scrollRef.current.direction < 0) ||
      (container.scrollLeft >= container.scrollWidth - container.clientWidth &&
        scrollRef.current.direction > 0)
    ) {
      if (scrollRef.current.animationFrameId) {
        cancelAnimationFrame(scrollRef.current.animationFrameId);
        scrollRef.current.animationFrameId = null;
      }
      scrollRef.current.direction = 0;
      scrollRef.current.currentSpeed = 0;
      scrollRef.current.targetSpeed = 0;
      scrollRef.current.lastTs = null;
      isScrollingRef.current = false;
      return;
    }

    scrollRef.current.animationFrameId = requestAnimationFrame(scrollLoop);
  }, []);

  const startScrolling = (direction) => {
    if (
      scrollRef.current.direction === direction &&
      scrollRef.current.animationFrameId
    )
      return;
    isScrollingRef.current = true;
    scrollRef.current.direction = direction;
    scrollRef.current.lastTs = null;
    scrollRef.current.currentSpeed = Math.max(
      scrollRef.current.currentSpeed,
      (scrollRef.current.targetSpeed || BASE_SPEED) * 0.4
    );
    if (!scrollRef.current.animationFrameId) {
      scrollRef.current.animationFrameId = requestAnimationFrame(scrollLoop);
    }
  };

  const stopScrolling = () => {
    if (scrollRef.current.animationFrameId) {
      cancelAnimationFrame(scrollRef.current.animationFrameId);
      scrollRef.current.animationFrameId = null;
    }
    scrollRef.current.direction = 0;
    scrollRef.current.currentSpeed = 0;
    scrollRef.current.targetSpeed = 0;
    scrollRef.current.lastTs = null;
    isScrollingRef.current = false;
  };

  const scrollToCard = useCallback(
    (index) => {
      const container = containerRef.current;
      const cardEl = cardRefs.current[index];
      if (!container || !cardEl || !cards.length) return;
      stopScrolling();

      if (index === 0) {
        container.scrollTo({ left: 0, behavior: "smooth" });
      } else if (index === cards.length - 1) {
        const maxLeft = Math.max(
          0,
          container.scrollWidth - container.clientWidth
        );
        container.scrollTo({ left: maxLeft, behavior: "smooth" });
      } else {
        const targetLeft =
          cardEl.offsetLeft - (container.clientWidth - cardEl.clientWidth) / 2;
        container.scrollTo({ left: targetLeft, behavior: "smooth" });
      }

      const id = cards[index].id;
      setActiveCard(id);
      activeCardRef.current = id;
      setHoveredCard(null);
      hoveredCardRef.current = null;
      setFocusedIndex(index);
    },
    [cards]
  );

  // Individual lock variables for each product (change to false to unlock)
  // Now using availability check instead of hardcoded locks
  const needsLock1 = !cards[0]?.isAvailable;
  const needsLock2 = !cards[1]?.isAvailable;
  const needsLock3 = !cards[2]?.isAvailable;
  const needsLock4 = !cards[3]?.isAvailable;
  const needsLock5 = !cards[4]?.isAvailable;

  // Local variable to lock all cards (set to false to unlock all)
  const allLocked = false; // Unlock all cards

  const handleCardClick = useCallback(
    (cardId, idx, event) => {
      if (event && event.stopPropagation) {
        event.stopPropagation();
        event.preventDefault();
      }

      if (isScrollingRef.current) return;

      const card = cards.find((c) => c.id === cardId);

      // Use availability check instead of hardcoded locks
      const isLocked = !card?.isAvailable;

      if (isLocked) {
        console.log("Product not available - required enterprise not owned");
        return;
      }

      stopScrolling();

      if (activeCardRef.current === cardId) {
        // deselect
        setActiveCard(null);
        activeCardRef.current = null;
        setFocusedIndex(null);
        setHoveredCard(null);
        hoveredCardRef.current = null;
      } else {
        // select + scroll-to
        setActiveCard(cardId);
        activeCardRef.current = cardId;
        setFocusedIndex(idx);
        setHoveredCard(cardId);
        hoveredCardRef.current = cardId;
        scrollToCard(idx);
      }
    },
    [
      scrollToCard,
      cards,
      needsLock1,
      needsLock2,
      needsLock3,
      needsLock4,
      needsLock5,
    ]
  );

  cardRefs.current = [];
  const setCardRef = (el, i) => {
    cardRefs.current[i] = el;
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onMove = (e) => {
      const rect = container.getBoundingClientRect();
      const mouseX = e.clientX;
      const mouseY = e.clientY;
      const hotZone = rect.width * EDGE_ZONE_RATIO;
      const insideVertically = mouseY >= rect.top && mouseY <= rect.bottom;
      const insideHorizontally = mouseX >= rect.left && mouseX <= rect.right;
      if (!insideVertically || !insideHorizontally) {
        stopScrolling();
        if (!activeCardRef.current) {
          setHoveredCard(null);
          hoveredCardRef.current = null;
        }
        return;
      }

      const el = document.elementFromPoint(mouseX, mouseY);
      const cardEl = el?.closest?.(".card-image");
      const hoveredId =
        cardEl && container.contains(cardEl)
          ? Number(cardEl.getAttribute("data-id"))
          : null;

      if (activeCardRef.current != null) {
        const keepHovered =
          hoveredId === activeCardRef.current ? activeCardRef.current : null;
        setHoveredCard(keepHovered);
        hoveredCardRef.current = keepHovered;
      } else {
        setHoveredCard(hoveredId);
        hoveredCardRef.current = hoveredId;
      }

      const relativeX = mouseX - rect.left;
      const inLeftEdge = relativeX < hotZone;
      const inRightEdge = relativeX > rect.width - hotZone;

      if (inLeftEdge || inRightEdge) {
        const distIntoZone = inLeftEdge
          ? hotZone - relativeX
          : relativeX - (rect.width - hotZone);
        const progress = clamp(distIntoZone / hotZone, 0, 1);
        const target = BASE_SPEED + (MAX_SPEED - BASE_SPEED) * progress;
        scrollRef.current.targetSpeed = target;
        startScrolling(inRightEdge ? 1 : -1);
      } else {
        scrollRef.current.targetSpeed = 0;
        stopScrolling();
      }
    };

    const onLeave = () => {
      stopScrolling();
      if (!activeCardRef.current) {
        setHoveredCard(null);
        hoveredCardRef.current = null;
      }
    };

    container.addEventListener("mousemove", onMove);
    container.addEventListener("mouseleave", onLeave);
    window.addEventListener("mouseleave", onLeave);

    return () => {
      container.removeEventListener("mousemove", onMove);
      container.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("mouseleave", onLeave);
      stopScrolling();
    };
  }, [cards]);

  const styles = `
    .card-container-wrapper { position: relative; width: 100%; }
    .card-container {
      width: 100%;
      height: 420px;
      display: flex;
      gap: 8px;
      padding: 0.6rem;
      background-color: transparent;
      border-radius: 1rem;
      overflow-x: auto;
      scroll-behavior: auto;
      -webkit-overflow-scrolling: auto;
      align-items: stretch;
      box-sizing: border-box;
    }
    .card-container::-webkit-scrollbar { display: none; }
    .card-container { -ms-overflow-style: none; scrollbar-width: none; }

    .card-image {
      width: 110px;
      height: 100%;
      border-radius: 10px;
      border: 3px solid transparent;
      transition: width ${ANIMATION_DURATION_MS}ms cubic-bezier(.22,.9,.35,1), border-color 0.35s ease-in-out, transform 0.25s ease, opacity 0.3s ease;
      cursor: pointer;
      filter: none;
      flex-shrink: 0;
      color: white;
      user-select: none;
      position: relative;
      overflow: hidden;
      background-size: cover;
      background-position: center;
    }
    .card-image.unavailable {
      opacity: 0.7;
      cursor: not-allowed;
      filter: grayscale(0.4);
    }
    .card-image::before {
      content: '';
      position: absolute; inset: 0;
      background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 40%, transparent 70%);
      opacity: 0.8;
      transition: opacity 0.3s ease;
      pointer-events: none;
    }
    .card-image.unavailable::before {
      background: linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.5) 40%, rgba(0,0,0,0.2) 70%);
    }
    .card-image.expanded { width: 360px; transform: translateY(-3px); }
    .card-image.unavailable.expanded { transform: translateY(0px); }
    .card-image.selected { border-color: #0C969C; box-shadow: 0 0 0 2px rgba(12,150,156,0.25); }
    
    .card-content { 
      position: absolute; 
      bottom: 0; 
      left: 0; 
      right: 0; 
      padding: 1rem; 
      opacity: 0; 
      transition: opacity 0.3s ease ${ANIMATION_DURATION_MS / 2.5}ms; 
      display:flex; 
      flex-direction:column; 
      justify-content:flex-end; 
      height:100%; 
      pointer-events:none; 
    }
    .card-image.expanded .card-content { opacity: 1; pointer-events:auto; }
    
    .card-title { 
      font-size: 1.2rem; 
      font-weight:700; 
      margin:0; 
      text-shadow:0 2px 4px rgba(0,0,0,0.5); 
      line-height: 1.2; 
    }
    .card-worth { 
      font-size: 1rem; 
      color:#a0deca; 
      margin-top:0.15rem; 
    }
    .card-requirements { 
      margin:0.6rem 0 0 0; 
      font-size: 0.75rem; 
      color:#e2e8f0; 
      list-style:none; 
      padding-left:0; 
    }
    .card-requirements li { 
      margin-bottom: 0.15rem; 
    }
    
    .lock-overlay {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 2rem;
      color: rgba(255, 255, 255, 0.8);
      text-shadow: 0 2px 4px rgba(0,0,0,0.8);
      pointer-events: none;
      z-index: 2;
      transition: opacity 0.3s;
      opacity: 0;
    }
    .card-image.expanded .lock-overlay {
      opacity: 1;
    }
    .unavailable-notice {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(255, 0, 0, 0.85);
      color: white;
      padding: 0.7rem 1.2rem;
      border-radius: 8px;
      font-size: 1rem;
      text-align: center;
      opacity: 0;
      z-index: 3;
      pointer-events: none;
      box-shadow: 0 2px 8px rgba(0,0,0,0.18);
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: 60%;
      min-height: 2.5rem;
      transition: opacity 0.3s;
    }
    .card-image.expanded .unavailable-notice {
      opacity: 1;
    }
  `;

  const expandedIndex =
    activeCard != null
      ? cards.findIndex((c) => c.id === activeCard)
      : hoveredCard != null
      ? cards.findIndex((c) => c.id === hoveredCard)
      : null;

  return (
    <div>
      <style>{styles}</style>

      <div className="card-container-wrapper">
        <div
          className={`card-container ${
            expandedIndex === 0 ? "edge-left" : ""
          } ${expandedIndex === cards.length - 1 ? "edge-right" : ""}`}
          ref={containerRef}
        >
          {cards.map((card, idx) => {
            // Use availability check instead of hardcoded locks
            const isLocked = !card.isAvailable;

            const isActive = activeCard === card.id;
            const isHovered = hoveredCard === card.id;
            const isExpanded = isActive || (!activeCard && isHovered);

            const enterpriseName =
              enterpriseNameMap[card.requiredEnterpriseId] ||
              card.requiredEnterpriseId;

            return (
              <div
                key={card.id}
                data-id={card.id}
                data-idx={idx}
                ref={(el) => setCardRef(el, idx)}
                className={`card-image ${isExpanded ? "expanded" : ""} ${
                  isActive ? "selected" : ""
                }${isLocked ? " unavailable" : ""}`}
                style={{
                  backgroundImage: `url(${card.imageUrl})`,
                  cursor: isLocked ? "not-allowed" : "pointer",
                  filter: isLocked ? "brightness(0.5)" : "none",
                }}
                onClick={(e) => handleCardClick(card.id, idx, e)}
                role="button"
                aria-pressed={isActive}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleCardClick(card.id, idx, e);
                  }
                }}
              >
                {isExpanded && (
                  <>
                    {isLocked && (
                      <>
                        <div className="lock-overlay">🔒</div>
                        <div className="unavailable-notice">
                          Requires Enterprise: {enterpriseName}
                        </div>
                      </>
                    )}
                    <div className="card-content">
                      <h3 className="card-title">{card.title}</h3>
                      <p className="card-worth">
                        Worth: ₹{Number(card.worth || 0).toLocaleString()}
                      </p>
                      <ul className="card-requirements">
                        {(card.requirements || []).slice(0, 4).map((r, i) => (
                          <li key={i}>{r}</li>
                        ))}
                      </ul>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});

export default SlidingAnimationProduct;
