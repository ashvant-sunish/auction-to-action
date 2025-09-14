import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";
import axios from 'axios';
import { socketServerUrl } from '../../../servercon';
import cardData from "../../../assets/cards-data.json";

import enterprise1 from "../../../assets/images/Construction/Enterprise1.png";
import enterprise2 from "../../../assets/images/Construction/Enterprise2.png";
import enterprise3 from "../../../assets/images/Construction/Enterprise3.png";
import enterprise4 from "../../../assets/images/Construction/Enterprise4.png";
import enterprise5 from "../../../assets/images/Construction/Enterprise5.png";
import enterprise6 from "../../../assets/images/Construction/Enterprise6.png";
import enterprise7 from "../../../assets/images/Construction/Enterprise7.png";
import enterprise8 from "../../../assets/images/Construction/Enterprise8.png";
import enterprise9 from "../../../assets/images/Construction/Enterprise9.png";
import enterprise10 from "../../../assets/images/Construction/Enterprise10.png";
import enterprise11 from "../../../assets/images/Construction/Enterprise11.png";
import enterprise12 from "../../../assets/images/Construction/Enterprise12.png";
import enterprise13 from "../../../assets/images/Construction/Enterprise13.png";
import enterprise14 from "../../../assets/images/Construction/Enterprise14.png";
import enterprise15 from "../../../assets/images/Construction/Enterprise15.png";

const imageMap = {
  "Enterprise1.png": enterprise1,
  "Enterprise2.png": enterprise2,
  "Enterprise3.png": enterprise3,
  "Enterprise4.png": enterprise4,
  "Enterprise5.png": enterprise5,
  "Enterprise6.png": enterprise6,
  "Enterprise7.png": enterprise7,
  "Enterprise8.png": enterprise8,
  "Enterprise9.png": enterprise9,
  "Enterprise10.png": enterprise10,
  "Enterprise11.png": enterprise11,
  "Enterprise12.png": enterprise12,
  "Enterprise13.png": enterprise13,
  "Enterprise14.png": enterprise14,
  "Enterprise15.png": enterprise15,
};

const SlidingAnimation = forwardRef((props, ref) => {
  const [cards, setCards] = useState([]);
  const [activeCard, setActiveCard] = useState(null); // numeric id
  const [hoveredCard, setHoveredCard] = useState(null); // numeric id
  const [focusedIndex, setFocusedIndex] = useState(null);
  const [ownedEnterprises, setOwnedEnterprises] = useState([]);
  const [loading, setLoading] = useState(true);

  const containerRef = useRef(null);
  const cardRefs = useRef([]);
  const activeCardRef = useRef(activeCard);
  const hoveredCardRef = useRef(hoveredCard);
  const isScrollingRef = useRef(false);

  // Fetch team inventory
  const fetchTeamInventory = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get(`${socketServerUrl}/api/construction/inventory`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data.enterprises) {
        setOwnedEnterprises(response.data.enterprises.map(ent => ent.id));
      }
    } catch (error) {
      console.error('Error fetching team inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  // normalize cardData and attach images
  useEffect(() => {
    const normalized = (Array.isArray(cardData) ? cardData : []).map(
      (card, i) => {
        const imageName = (card.imageUrl || "").split("/").pop();
        return {
          ...card,
          id: Number(card.id) || i + 1, // ensure numeric id
          imageUrl:
            imageMap[imageName] || card.imageUrl || imageMap["Enterprise1.png"],
          title: card.title ?? `Project ${i + 1}`,
          worth: card.worth ?? `${(i + 1) * 100000}`,
          requirements: Array.isArray(card.requirements)
            ? card.requirements
            : card.requirementList || [],
        };
      }
    );
    setCards(normalized);
    fetchTeamInventory(); // Fetch inventory when component loads
  }, []);

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
  const EDGE_ZONE_RATIO = 0.15; // 15% as you requested earlier
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
    // jump-start for snappier feel
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

  // center & select by index (index is 0..N-1)
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
      activeCardRef.current = id; // immediate ref update
      setHoveredCard(null);
      hoveredCardRef.current = null;
      setFocusedIndex(index);
    },
    [cards]
  );

  // click: use cardId for state, index for scrolling
  const handleCardClick = useCallback(
    (cardId, idx, event) => {
      if (event && event.stopPropagation) {
        event.stopPropagation();
        event.preventDefault();
      }

      // ignore clicks while auto-edge-scrolling is actively running
      if (isScrollingRef.current) return;

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
    [scrollToCard]
  );

  // ref assignment
  cardRefs.current = [];
  const setCardRef = (el, i) => {
    cardRefs.current[i] = el;
  };

  // mouse move handler (hover + edge scroll)
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

      // edge logic
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
    .page-header { text-align:center; margin-bottom:0.8rem; }
    .page-title { font-size:1.4rem; font-weight:700; color:#2d3748; margin:0; }

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
      transition: width ${ANIMATION_DURATION_MS}ms cubic-bezier(.22,.9,.35,1), border-color 0.35s ease-in-out, transform 0.25s ease;
      cursor: pointer;
      flex-shrink: 0;
      color: white;
      user-select: none;
      position: relative;
      overflow: hidden;
      background-size: cover;
      background-position: center;
    }
    .card-image::before {
      content: '';
      position: absolute; inset: 0;
      background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 40%, transparent 70%);
      opacity: 0.8;
      transition: opacity 0.3s ease;
      pointer-events: none;
    }
    .card-image.expanded { width: 360px; transform: translateY(-3px); }
    .card-image.selected { border-color: #0C969C; box-shadow: 0 0 0 2px rgba(12,150,156,0.25); }
    .card-content {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 1rem;
      display: none;
      /* no opacity transition */
      flex-direction: column;
      justify-content: flex-end;
      height: 100%;
      pointer-events: none;
    }
    .card-image.expanded .card-content {
      display: flex;
      pointer-events: auto;
    }
    .card-title { font-size: 1.2rem; font-weight:700; margin:0; text-shadow:0 2px 4px rgba(0,0,0,0.5); line-height: 1.2; }
    .card-worth { font-size: 1rem; color:#a0deca; margin-top:0.15rem; }
    .card-requirements { margin:0.6rem 0 0 0; font-size: 0.75rem; color:#e2e8f0; list-style:none; padding-left:0; }
    .card-requirements li { margin-bottom: 0.15rem; }
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
      <div className="page-header">
        <h2 className="page-title">Enterprise Construction</h2>
      </div>

      <div className="card-container-wrapper">
        <div
          className={`card-container ${
            expandedIndex === 0 ? "edge-left" : ""
          } ${expandedIndex === cards.length - 1 ? "edge-right" : ""}`}
          ref={containerRef}
        >
          {cards.map((card, idx) => {
            const isActive = activeCard === card.id;
            const isHovered = hoveredCard === card.id;
            const isExpanded = isActive || (!activeCard && isHovered);

            return (
              <div
                key={card.id}
                data-id={card.id}
                data-idx={idx}
                ref={(el) => setCardRef(el, idx)}
                className={`card-image ${isExpanded ? "expanded" : ""} ${
                  isActive ? "selected" : ""
                }`}
                style={{ backgroundImage: `url(${card.imageUrl})` }}
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
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});

export default SlidingAnimation;
