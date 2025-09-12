import React, { useState, useRef, useEffect, useCallback } from "react";
import { Box, Heading, Text, VStack, Image } from "@chakra-ui/react";

/**
 * Full-feature EnterpriseConstruction:
 * - Ramped edge auto-scroll (20% left/right)
 * - Hover preview (only when no card is active)
 * - Arrow key navigation (discrete card-by-card)
 * - Click to select (persist). While selected:
 *     - transitions are disabled (instant snap)
 *     - hover won't override the selected card
 * - Click same card again to unselect (restore transitions)
 */

const EnterpriseConstruction = () => {
  const CARDS_COUNT = 20;

  // UI state
  const [activeCard, setActiveCard] = useState(null); // clicked card id or null
  const [hoveredCard, setHoveredCard] = useState(null); // transient hover id or null
  const [focusedIndex, setFocusedIndex] = useState(null);
  const [transitionsDisabled, setTransitionsDisabled] = useState(false);

  // refs
  const containerRef = useRef(null);
  const cardRefs = useRef([]);
  const activeCardRef = useRef(activeCard);
  const hoveredCardRef = useRef(hoveredCard);

  // edge scroll tunables
  const EDGE_ZONE_RATIO = 0.2; // 20% left and right
  const BASE_SPEED = 300; // px/s
  const MAX_SPEED = 900; // px/s
  const ACCELERATION = 3000; // px/s^2
  const KEY_REPEAT_INTERVAL = 220;

  // scroll runtime ref (no rerenders)
  const scrollRef = useRef({
    direction: 0, // -1 | 0 | 1
    targetSpeed: 0,
    currentSpeed: 0,
    animationFrameId: null,
    lastTs: null,
  });

  // keep refs in sync with state to read inside handlers reliably
  useEffect(() => {
    activeCardRef.current = activeCard;
    // toggle transition disabling when active/unset
    setTransitionsDisabled(activeCard !== null);
  }, [activeCard]);

  useEffect(() => {
    hoveredCardRef.current = hoveredCard;
  }, [hoveredCard]);

  // utils
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const getMaxScrollLeft = (container) =>
    Math.max(0, container.scrollWidth - container.clientWidth);

  // rAF scroll loop (time-based ramp)
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
      return;
    }

    if (scrollRef.current.lastTs == null) scrollRef.current.lastTs = timestamp;
    const dt = (timestamp - scrollRef.current.lastTs) / 1000;
    scrollRef.current.lastTs = timestamp;

    // ramp currentSpeed -> targetSpeed
    const needed =
      scrollRef.current.targetSpeed - scrollRef.current.currentSpeed;
    const maxDelta = ACCELERATION * dt;
    const speedDelta =
      Math.abs(needed) <= maxDelta ? needed : Math.sign(needed) * maxDelta;
    scrollRef.current.currentSpeed += speedDelta;

    const distance =
      scrollRef.current.direction * scrollRef.current.currentSpeed * dt;
    container.scrollLeft += distance;

    // stop at boundaries
    if (
      (container.scrollLeft <= 0 && scrollRef.current.direction < 0) ||
      (container.scrollLeft >= container.scrollWidth - container.clientWidth &&
        scrollRef.current.direction > 0)
    ) {
      // reached edge
      if (scrollRef.current.animationFrameId) {
        cancelAnimationFrame(scrollRef.current.animationFrameId);
        scrollRef.current.animationFrameId = null;
      }
      scrollRef.current.direction = 0;
      scrollRef.current.currentSpeed = 0;
      scrollRef.current.targetSpeed = 0;
      scrollRef.current.lastTs = null;
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
    scrollRef.current.direction = direction;
    scrollRef.current.lastTs = null;
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
  };

  // center & select a card by index
  const scrollToCard = useCallback((index) => {
    const container = containerRef.current;
    const cardEl = cardRefs.current[index];
    if (!container || !cardEl) return;
    stopScrolling();
    // center the card
    const targetLeft =
      cardEl.offsetLeft - (container.clientWidth - cardEl.clientWidth) / 2;
    container.scrollTo({ left: targetLeft, behavior: "smooth" });
    const id = index + 1;
    setActiveCard(id);
    setHoveredCard(null);
    setFocusedIndex(index);
  }, []);

  // toggle click select/unselect
  const handleCardClick = (cardId, idx) => {
    stopScrolling();
    if (activeCardRef.current === cardId) {
      // unselect
      setActiveCard(null);
      setFocusedIndex(null);
      setHoveredCard(null);
    } else {
      // select + center
      scrollToCard(idx);
    }
  };

  // helper: assign refs to cards
  cardRefs.current = [];
  const setCardRef = (el, i) => {
    cardRefs.current[i] = el;
  };

  // mousemove handler on container: determines hover card (but does not override active) and edge-scroll
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
          if (hoveredCardRef.current !== null) setHoveredCard(null);
        }
        return;
      }

      // find card under pointer reliably
      const el = document.elementFromPoint(mouseX, mouseY);
      const cardEl = el?.closest?.(".card-image");
      const hoveredId =
        cardEl && container.contains(cardEl)
          ? Number(cardEl.getAttribute("data-idx")) + 1
          : null;

      // HOVER logic: if there's an active card, don't let hover change expansion except when hovering the active card itself
      if (activeCardRef.current != null) {
        const keepHovered =
          hoveredId === activeCardRef.current ? activeCardRef.current : null;
        if (hoveredCardRef.current !== keepHovered) setHoveredCard(keepHovered);
      } else {
        if (hoveredCardRef.current !== hoveredId) setHoveredCard(hoveredId);
      }

      // SCROLL logic (edge zones)
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
      if (!activeCardRef.current) setHoveredCard(null);
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
  }, []); // stable

  // keyboard navigation: discrete card-by-card (hold to repeat)
  useEffect(() => {
    let repeatTimer = null;
    let repeatingDirection = 0;

    const isTypingElement = (target) => {
      if (!target) return false;
      const tag = target.tagName;
      if (!tag) return false;
      const editable = target.isContentEditable;
      return (
        editable ||
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        (target.getAttribute && target.getAttribute("role") === "textbox")
      );
    };

    const navigateCardBy = (offset, cardsLength) => {
      if (cardsLength === 0) return;
      let next;
      if (focusedIndex === null) next = offset > 0 ? 0 : cardsLength - 1;
      else next = clamp(focusedIndex + offset, 0, cardsLength - 1);
      scrollToCard(next);
    };

    const onKeyDown = (e) => {
      if (isTypingElement(e.target)) return;
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        e.preventDefault();
        stopScrolling();
        const dir = e.key === "ArrowRight" ? 1 : -1;
        navigateCardBy(dir, CARDS_COUNT);

        if (repeatTimer == null) {
          repeatingDirection = dir;
          repeatTimer = setTimeout(() => {
            repeatTimer = setInterval(() => {
              navigateCardBy(repeatingDirection, CARDS_COUNT);
            }, KEY_REPEAT_INTERVAL);
          }, 350);
        }
      }
    };

    const onKeyUp = (e) => {
      if (isTypingElement(e.target)) return;
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        e.preventDefault();
        if (repeatTimer) {
          clearTimeout(repeatTimer);
          clearInterval(repeatTimer);
          repeatTimer = null;
          repeatingDirection = 0;
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      if (repeatTimer) {
        clearTimeout(repeatTimer);
        clearInterval(repeatTimer);
      }
    };
  }, [focusedIndex, scrollToCard]);

  // styles (disabled transitions applied via container class)
  const styles = `
    .card-container-wrapper { position: relative; }
    .card-container {
      width: 100%;
      height: 400px;
      display: flex;
      gap: 10px;
      padding: 1rem;
      background-color: #f0f4f8;
      border-radius: 1rem;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      overflow-x: auto;
      scroll-behavior: auto;
      -webkit-overflow-scrolling: auto;
    }
    .card-container.no-transition .card-image {
      transition: none !important;
    }
    .card-container::-webkit-scrollbar { display: none; }
    .card-container { -ms-overflow-style: none; scrollbar-width: none; }

    .card-image {
      width: 8%;
      height: 100%;
      object-fit: cover;
      border-radius: 10px;
      border: 3px solid transparent;
      transition: width 0.6s cubic-bezier(.22,.9,.35,1), border-color 0.35s ease-in-out, transform 0.25s ease;
      cursor: pointer;
      flex-shrink: 0;
      background: #0f3b3d;
      color: white;
      display:flex;
      align-items:center;
      justify-content:center;
      font-size: 36px;
      user-select: none;
    }

    .card-image.expanded {
      width: 25%;
      transform: translateY(-4px);
    }

    .card-image.selected { border-color: #0C969C; }
  `;

  // cards data
  const cards = Array.from({ length: CARDS_COUNT }, (_, i) => ({
    id: i + 1,
    imageUrl: `https://placehold.co/600x400/0f3b3d/ffffff?text=Project+${
      i + 1
    }`,
  }));

  return (
    <Box>
      <style>{styles}</style>
      <VStack spacing={2} mb={8} textAlign="center">
        <Heading color="gray.700">Enterprise Construction</Heading>
        <Text color="gray.500">
          Hover or use arrow keys to navigate. Click to select (click again to
          collapse).
        </Text>
      </VStack>

      <div className="card-container-wrapper">
        <div
          className={`card-container ${
            transitionsDisabled ? "no-transition" : ""
          }`}
          ref={containerRef}
        >
          {cards.map((card, idx) => {
            const isActive = activeCard === card.id;
            const isHovered = hoveredCard === card.id;
            const isExpanded = isActive || (!activeCard && isHovered);

            return (
              <div
                key={card.id}
                data-idx={idx}
                ref={(el) => setCardRef(el, idx)}
                className={`card-image ${isExpanded ? "expanded" : ""} ${
                  isActive ? "selected" : ""
                }`}
                onClick={() => handleCardClick(card.id, idx)}
                role="button"
                aria-pressed={isActive}
              >
                {card.id}
              </div>
            );
          })}
        </div>
      </div>
    </Box>
  );
};

export default EnterpriseConstruction;
