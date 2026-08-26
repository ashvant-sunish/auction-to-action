import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import io from "socket.io-client";
import { FrameImages } from "../../../utils/spinthewheelimagepath";
import serverUrl from "./../../../servercon";

// ─── Helpers (unchanged) ───────────────────────────────────────────────────────
function pickRandomBid(availableItems) {
  if (availableItems.length === 0) return null;
  const index = Math.floor(Math.random() * availableItems.length);
  return { item: availableItems[index], index };
}
function removeBidFromArray(array, index) {
  return array.filter((_, i) => i !== index);
}

// ─── Math helpers ──────────────────────────────────────────────────────────────
const lerp   = (a, b, t) => a + (b - a) * t;
const clamp  = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const easeOut  = (t) => 1 - Math.pow(1 - t, 3);
const easeInOut = (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

// Consistent per-card pseudo-random values
const cardRng = (seed) => {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
};

// ─── Constants ────────────────────────────────────────────────────────────────
const SHUFFLE_DURATION = 5200; // ms total
const PHASE_WASH_END   = 0.22; // 0→22%  : wash/spread
const PHASE_SPLIT_END  = 0.40; // 22→40% : gather into L+R piles
const PHASE_RIFFLE_END = 0.82; // 40→82% : riffle interleave
const PHASE_SQUARE_END = 0.92; // 82→92% : square up
// 92→100% : reveal handled by wheelStopped

const VISUAL_DECK = 16; // cards in the visual shuffle deck

// ─── CSS injected (always updates innerHTML so HMR picks up changes) ───────────
const STYLE_ID = "a2a-csh-v3-styles";
function injectStyles() {
  // Always re-inject so that Vite HMR changes are reflected immediately.
  // Remove stale element first so we don't accumulate duplicates.
  const stale = document.getElementById(STYLE_ID);
  if (stale) stale.remove();
  const el = document.createElement("style");
  el.id = STYLE_ID;
  el.innerHTML = `
    .csh2-stage {
      width: 100%;
      height: calc(100vh - 100px);
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      background:
        radial-gradient(ellipse 60% 50% at 50% 55%, rgba(232,255,0,0.04) 0%, transparent 70%),
        radial-gradient(ellipse 100% 100% at 50% 50%, #0d1119 0%, #080b0f 100%);
      overflow: hidden;
      perspective: 1200px;
      perspective-origin: 50% 45%;
      font-family: 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif;
    }

    /* ── Table felt texture line ── */
    .csh2-stage::before {
      content: '';
      position: absolute;
      bottom: 22%;
      left: 10%;
      right: 10%;
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(232,255,0,0.08), transparent);
      pointer-events: none;
    }

    /* ── Deck root ── */
    .csh2-deck-root {
      position: relative;
      width: 0;
      height: 0;
      transform-style: preserve-3d;
      z-index: 10;
    }

    /* ── Individual card ── */
    .csh2-card {
      position: absolute;
      width: 300px;
      height: 420px;
      left: -150px;
      top: -210px;
      transform-style: preserve-3d;
      will-change: transform;
      pointer-events: none;
    }

    /* ── Shared face properties ── */
    .csh2-face {
      position: absolute;
      inset: 0;
      border-radius: 18px;
      backface-visibility: hidden;
      -webkit-backface-visibility: hidden;
    }

    /* ══════════════════════════════════════════
       CARD BACK — base (shared structure)
    ══════════════════════════════════════════ */
    .csh2-back {
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    /* ── DIAMOND card — red neon theme ── */
    .csh2-back.is-diamond {
      background: #110508;
      border: 3px solid #ff2244;
      box-shadow: 0 0 0 1px rgba(255,255,255,0.04) inset;
    }
    .csh2-back.is-diamond .csh2-back-pattern {
      background-image:
        repeating-linear-gradient(45deg, transparent 0px, transparent 14px, rgba(255,34,68,0.06) 14px, rgba(255,34,68,0.06) 15px),
        repeating-linear-gradient(-45deg, transparent 0px, transparent 14px, rgba(255,34,68,0.06) 14px, rgba(255,34,68,0.06) 15px);
    }
    .csh2-back.is-diamond .csh2-back-inner  { border-color: rgba(255,34,68,0.28); }
    .csh2-back.is-diamond .csh2-back-title  { color: #ff4466; text-shadow: 0 0 10px rgba(255,34,68,0.7); }
    .csh2-back.is-diamond .csh2-back-sub    { color: rgba(255,100,120,0.4); }
    .csh2-back.is-diamond .csh2-back-pip    { color: rgba(255,34,68,0.6); font-size: 14px; }

    /* ── SPADE card — black/silver neon theme ── */
    .csh2-back.is-spade {
      background: #07080c;
      border: 3px solid rgba(210,215,240,0.65);
      box-shadow: 0 0 0 1px rgba(255,255,255,0.06) inset;
    }
    .csh2-back.is-spade .csh2-back-pattern {
      background-image:
        repeating-linear-gradient(45deg, transparent 0px, transparent 14px, rgba(200,210,255,0.05) 14px, rgba(200,210,255,0.05) 15px),
        repeating-linear-gradient(-45deg, transparent 0px, transparent 14px, rgba(200,210,255,0.05) 14px, rgba(200,210,255,0.05) 15px);
    }
    .csh2-back.is-spade .csh2-back-inner  { border-color: rgba(210,215,240,0.22); }
    .csh2-back.is-spade .csh2-back-title  { color: rgba(220,225,255,0.88); text-shadow: 0 0 10px rgba(200,210,255,0.6); }
    .csh2-back.is-spade .csh2-back-sub    { color: rgba(180,190,255,0.35); }
    .csh2-back.is-spade .csh2-back-pip    { color: rgba(200,210,255,0.55); font-size: 14px; }

    /* Crosshatch pattern — base (overridden per variant above) */
    .csh2-back-pattern {
      position: absolute;
      inset: 0;
    }

    /* Inner border inset */
    .csh2-back-inner {
      position: absolute;
      inset: 14px;
      border: 1.5px solid rgba(255,255,255,0.12);
      border-radius: 10px;
    }

    /* Center logo area */
    .csh2-back-logo-wrap {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      z-index: 1;
    }

    /* Diamond logo — vivid red neon */
    .csh2-back-diamond {
      width: 60px;
      height: 60px;
      background: linear-gradient(135deg, #ff1a38 0%, #cc0020 100%);
      transform: rotate(45deg);
      box-shadow:
        0 0 0 2px rgba(255,30,60,0.4),
        0 0 16px rgba(255,30,60,0.6),
        0 0 32px rgba(255,30,60,0.25);
    }
    /* Spade logo — dark/black with white neon glow, same visual size as diamond */
    .csh2-back-spade {
      font-size: 90px;
      line-height: 1;
      /* Dark fill so the symbol reads as black — white glow makes it visible */
      color: #0a0c10;
      text-shadow:
        0 0 2px rgba(220,225,255,0.8),
        0 0 12px rgba(200,215,255,0.6),
        0 0 24px rgba(180,200,255,0.3);
      user-select: none;
      margin-bottom: -6px; /* optical alignment with diamond */
    }
    .csh2-back-title {
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      text-align: center;
    }
    .csh2-back-sub {
      font-size: 9px;
      letter-spacing: 0.14em;
      text-transform: uppercase;
    }

    /* Corner pip */
    .csh2-back-pip {
      position: absolute;
      font-weight: 800;
      letter-spacing: 0.05em;
    }
    .csh2-back-pip.tl { top: 18px; left: 18px; }
    .csh2-back-pip.br { bottom: 18px; right: 18px; transform: rotate(180deg); }

    /* ══════════════════════════════════════════
       CARD FRONT — revealed on flip
    ══════════════════════════════════════════ */
    .csh2-front {
      transform: rotateY(180deg);
      background: linear-gradient(160deg, #141820 0%, #0e1116 50%, #0a0d12 100%);
      border: 3px solid transparent; /* Set by variant */
      box-shadow: 0 0 0 1px rgba(255,255,255,0.06) inset;
      display: flex;
      flex-direction: column;
      padding: 32px 28px 28px;
      overflow: hidden;
    }

    /* Glow sweep on front */
    .csh2-front::after {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: 15px;
      pointer-events: none;
    }

    /* Base Font Layout (Colors handled by variants below) */
    .csh2-front-lot    { font-size: 10px; letter-spacing: 0.26em; font-weight: 700; text-transform: uppercase; margin-bottom: 2px; }
    .csh2-front-number { font-size: 72px; font-weight: 200; line-height: 0.9; letter-spacing: -2px; margin-bottom: 12px; }
    .csh2-front-rule   { width: 44px; height: 2px; margin-bottom: 14px; flex-shrink: 0; }
    .csh2-front-title  { font-size: 16px; font-weight: 700; color: #ffffff; line-height: 1.25; margin-bottom: 8px; }
    .csh2-front-res    { font-size: 10px; color: rgba(255,255,255,0.38); letter-spacing: 0.04em; margin-bottom: 12px; line-height: 1.4; }
    .csh2-front-plabel { font-size: 9px; letter-spacing: 0.2em; text-transform: uppercase; margin-bottom: 3px; }
    .csh2-front-price  { font-size: 26px; font-weight: 800; letter-spacing: -0.5px; margin-bottom: 14px; }
    .csh2-front-badge  {
      padding: 7px 14px;
      border: 1.5px solid transparent;
      border-radius: 8px;
      font-size: 9px; font-weight: 800; letter-spacing: 0.22em;
      text-transform: uppercase; text-align: center;
      flex-shrink: 0;
    }

    /* ── FRONT SPADE VARIANT ── */
    .csh2-front.is-spade { border-color: rgba(210,215,240,0.65); }
    .csh2-front.is-spade::after { background: linear-gradient(135deg, rgba(200,210,255,0.05) 0%, transparent 60%); }
    .csh2-front.is-spade .csh2-front-lot    { color: rgba(200,210,255,0.65); }
    .csh2-front.is-spade .csh2-front-number { color: #dce1ff; text-shadow: 0 0 16px rgba(200,210,255,0.4); }
    .csh2-front.is-spade .csh2-front-rule   { background: #dce1ff; box-shadow: 0 0 6px rgba(200,210,255,0.3); }
    .csh2-front.is-spade .csh2-front-plabel { color: rgba(200,210,255,0.55); }
    .csh2-front.is-spade .csh2-front-price  { color: #dce1ff; text-shadow: 0 0 12px rgba(200,210,255,0.3); }
    .csh2-front.is-spade .csh2-front-badge  {
      background: rgba(200,210,255,0.08);
      border-color: rgba(200,210,255,0.35);
      color: #dce1ff;
    }

    /* ── FRONT DIAMOND VARIANT ── */
    .csh2-front.is-diamond { border-color: #ff2244; }
    .csh2-front.is-diamond::after { background: linear-gradient(135deg, rgba(255,34,68,0.05) 0%, transparent 60%); }
    .csh2-front.is-diamond .csh2-front-lot    { color: rgba(255,34,68,0.65); }
    .csh2-front.is-diamond .csh2-front-number { color: #ff3355; text-shadow: 0 0 16px rgba(255,34,68,0.4); }
    .csh2-front.is-diamond .csh2-front-rule   { background: #ff3355; box-shadow: 0 0 6px rgba(255,34,68,0.3); }
    .csh2-front.is-diamond .csh2-front-plabel { color: rgba(255,34,68,0.55); }
    .csh2-front.is-diamond .csh2-front-price  { color: #ff3355; text-shadow: 0 0 12px rgba(255,34,68,0.3); }
    .csh2-front.is-diamond .csh2-front-badge  {
      background: rgba(255,34,68,0.08);
      border-color: rgba(255,34,68,0.35);
      color: #ff3355;
    }

    /* Removed Glow ring (.csh2-glow-ring is dead CSS, kept empty) */

    /* ─── Selected bid side panel ─── */
    .csh2-panel {
      position: absolute;
      top: 40px; left: 40px;
      z-index: 200;
      background: rgba(12,14,20,0.92);
      backdrop-filter: blur(16px);
      border: 1px solid rgba(232,255,0,0.22);
      border-left: 4px solid #e8ff00;
      padding: 28px 36px;
      border-radius: 0 16px 16px 0;
      box-shadow: 0 20px 40px rgba(0,0,0,0.6), 0 0 40px rgba(232,255,0,0.07);
      display: flex;
      flex-direction: column;
      gap: 8px;
      max-width: 330px;
      animation: csh2-pulse 3s ease-in-out infinite;
    }
    @keyframes csh2-pulse { 0%,100%{opacity:1} 50%{opacity:0.88} }

    /* ─── Connection badge ─── */
    .csh2-conn {
      position: absolute;
      top: 40px; right: 40px;
      z-index: 100;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .csh2-conn-dot {
      width: 9px; height: 9px;
      border-radius: 50%;
      transition: background 0.4s, box-shadow 0.4s;
    }

    /* ─── Status bar ─── */
    .csh2-status {
      position: absolute;
      bottom: 28px;
      left: 50%; transform: translateX(-50%);
      z-index: 100;
      padding: 9px 22px;
      border-radius: 28px;
      font-size: 12px; font-weight: 800;
      display: flex; align-items: center; gap: 9px;
      background: rgba(12,14,20,0.85);
      color: #e8ff00;
      border: 1.5px solid rgba(232,255,0,0.4);
      box-shadow: 0 0 20px rgba(232,255,0,0.15), 0 4px 16px rgba(0,0,0,0.5);
      letter-spacing: 0.12em;
      white-space: nowrap;
    }
    .csh2-spinner {
      width: 13px; height: 13px;
      border: 2px solid rgba(232,255,0,0.2);
      border-top-color: #e8ff00;
      border-radius: 50%;
      animation: csh2-spin 0.8s linear infinite;
    }
    @keyframes csh2-spin { to{transform:rotate(360deg)} }

    /* ─── Overlays ─── */
    .csh2-overlay {
      position: absolute;
      top: 50%; left: 50%;
      transform: translate(-50%,-50%);
      z-index: 300;
      background: rgba(12,14,20,0.97);
      border: 1px solid rgba(255,255,255,0.06);
      color: white;
      padding: 26px 52px;
      border-radius: 16px;
      font-size: 15px; font-weight: 600;
      box-shadow: 0 16px 48px rgba(0,0,0,0.6);
      text-align: center;
    }

    .csh2-idle-hint {
      position: absolute;
      bottom: 28px;
      left: 50%; transform: translateX(-50%);
      font-size: 11px;
      letter-spacing: 0.24em;
      color: rgba(255,255,255,0.18);
      text-transform: uppercase;
      white-space: nowrap;
      z-index: 5;
    }

    @media (prefers-reduced-motion: reduce) {
      .csh2-card { transition: transform 0.6s ease, opacity 0.4s ease !important; }
    }

    @media (max-width: 600px) {
      .csh2-card { width: 200px; height: 280px; left: -100px; top: -140px; }
      .csh2-front-number { font-size: 56px; }
    }
  `;
  document.head.appendChild(el);
}

// Execute immediately on module load/HMR so styles are always fresh
if (typeof document !== "undefined") {
  injectStyles();
}
// ─── Main component ────────────────────────────────────────────────────────────
export default function Spin3DCards({
  round         = 1,
  radius        = 550,
  baseCardWidth = 50,
  maxCardWidth  = 120,
  cardHeight    = 260,
  initialSpeed  = 0.008,
  friction      = 0.995,
  onBidSelected = null,
}) {
  // ── Saved-state rehydration ──────────────────────────────────────────────────
  const [wheelState] = useState(() => {
    const saved = localStorage.getItem(`wheel_state_round_${round}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Date.now() - parsed.timestamp < 30 * 60 * 1000) return parsed;
      } catch (e) {
        console.error("Failed to parse saved wheel state");
      }
    }
    return null;
  });

  // ── Core state (unchanged) ───────────────────────────────────────────────────
  const [availableItems,     setAvailableItems]     = useState([]);
  const [currentSelectedBid, setCurrentSelectedBid] = useState(null);
  const [isSelecting,        setIsSelecting]         = useState(false);
  const [wheelStopped,       setWheelStopped]        = useState(false);
  const [loading,            setLoading]             = useState(true);
  const [socketConnected,    setSocketConnected]     = useState(false);
  const [spinning,           setSpinning]            = useState(true);

  // ── Refs ────────────────────────────────────────────────────────────────────
  const deckRootRef           = useRef(null);
  const rafRef                = useRef(null);
  const animatingToPosition   = useRef(false);
  const shuffleStartTime      = useRef(null);
  const selectedIndexRef      = useRef(0);
  const glowRef               = useRef(null);
  const revealedRef           = useRef(false);
  // flickingRef: true while card-flick-away animation plays.
  // RAF wheelStopped block checks this to avoid stomping the flick transform.
  const flickingRef           = useRef(false);
  const stageRef              = useRef(null);
  // legacy compat refs
  const angleRef              = useRef(0);
  const speedRef              = useRef(initialSpeed);
  const prefersReducedMotion  = useRef(
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  // ── fetchGameItems (unchanged) ──────────────────────────────────────────────
  const fetchGameItems = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${serverUrl}/api/admin/public/game-items/round/${round}`
      );
      if (response.data && response.data.availableItems) {
        const items = response.data.availableItems.map((item) => ({
          id:        item.id,
          itemCode:  item.itemCode,
          bidNo:     item.bidNo || item.bidNumber,
          bidNumber: item.bidNumber || item.bidNo,
          title:     item.title,
          details:   item.details,
          category:  item.category,
          basePrice: item.basePrice,
          resources: item.resources || {},
          image:     item.image,
        }));
        setAvailableItems(items);
      } else {
        throw new Error("API response not successful");
      }
    } catch (error) {
      console.error("❌ Error fetching game items:", error);
      if (error.response) console.error("Backend error:", error.response.status, error.response.data);
      else if (error.request) console.error("Network error: No response from server");
      else console.error("Request setup error:", error.message);
      const fallbackItems = Array.from({ length: 75 }, (_, i) => ({
        id: `fallback_${i + 1}`, itemCode: `r1i${String(i + 1).padStart(3, "0")}`,
        bidNo: i + 1, bidNumber: i + 1, title: `BID ${i + 1}`,
        details: `Base Price: ₹${7000 + Math.floor(Math.random() * 2500)}`,
        category: `Round ${round}`, basePrice: 7000 + Math.floor(Math.random() * 2500),
        resources: { Technology: Math.floor(Math.random() * 7) + 1, Property: Math.floor(Math.random() * 6) + 1 },
      }));
      setAvailableItems(fallbackItems);
    } finally {
      setLoading(false);
    }
  };

  // ── Load + rehydrate (unchanged) ────────────────────────────────────────────
  useEffect(() => {
    const loadData = async () => {
      if (wheelState) {
        setCurrentSelectedBid(wheelState.selectedBid);
        setWheelStopped(wheelState.stopped);
        setSpinning(!wheelState.stopped);
        if (wheelState.angle) angleRef.current = wheelState.angle;
        
        // Restore index so the card retains its correct suit color (even=0=diamond, odd=1=spade)
        if (wheelState.selectedBid) {
          const bidNum = parseInt(wheelState.selectedBid.bidNo || wheelState.selectedBid.bidNumber, 10) || 0;
          selectedIndexRef.current = (bidNum % 2 !== 0) ? 1 : 0;
        }
      }
      await fetchGameItems();
    };
    loadData();
  }, [round]);

  // ── Persist (unchanged) ─────────────────────────────────────────────────────
  useEffect(() => {
    if (currentSelectedBid || wheelStopped) {
      localStorage.setItem(`wheel_state_round_${round}`, JSON.stringify({
        timestamp: Date.now(), selectedBid: currentSelectedBid,
        stopped: wheelStopped, angle: angleRef.current, round,
      }));
    }
  }, [currentSelectedBid, wheelStopped, round]);

  // ── clearSavedState / resetWheel (unchanged) ────────────────────────────────
  const clearSavedState = () => localStorage.removeItem(`wheel_state_round_${round}`);

  const resetWheel = () => {
    clearSavedState();
    setCurrentSelectedBid(null);
    setIsSelecting(false);
    setWheelStopped(false);
    setSpinning(true);
    speedRef.current          = initialSpeed;
    animatingToPosition.current = false;
    shuffleStartTime.current    = null;
    selectedIndexRef.current    = 0;
    revealedRef.current         = false;
    flickingRef.current         = false;
    if (glowRef.current) glowRef.current.classList.remove("active");
  };

  // ── animateToPosition – visual replacement (API contract preserved) ──────────
  const animateToPosition = (targetAngle) => {
    return new Promise((resolve) => {
      animatingToPosition.current = true;
      shuffleStartTime.current    = Date.now();

      if (prefersReducedMotion.current) {
        animatingToPosition.current = false;
        setWheelStopped(true);
        resolve();
        return;
      }

      setTimeout(() => {
        animatingToPosition.current = false;
        setWheelStopped(true);
        resolve();
      }, SHUFFLE_DURATION + 1000);
    });
  };

  // ── triggerAdminSpin (COMPLETELY UNCHANGED LOGIC) ────────────────────────────
  const triggerAdminSpin = async (itemDetails) => {
    console.log("🚀 triggerAdminSpin called with:", itemDetails);
    console.log("🚀 Current availableItems length:", availableItems.length);
    console.log("🚀 Current isSelecting:", isSelecting);
    console.log("🚀 Current wheelStopped:", wheelStopped);

    if (availableItems.length === 0 || isSelecting) {
      const reason = availableItems.length === 0 ? "No items available" : "Already selecting";
      console.log("❌ Early return -", reason);
      return;
    }

    console.log("🎯 Triggering admin spin with item details:", itemDetails);
    setIsSelecting(true);

    let targetItem = null;
    let matchStrategy = "none";
    console.log("🔍 Starting item matching...");

    if (itemDetails.itemId || itemDetails.id) {
      const searchId = itemDetails.itemId || itemDetails.id;
      console.log("🔍 Strategy 1: Matching by ID:", searchId);
      targetItem = availableItems.find((item) => item.id === searchId);
      if (targetItem) matchStrategy = "id";
      console.log("🔍 Strategy 1 result:", targetItem ? "FOUND" : "NOT FOUND");
    }
    if (!targetItem && itemDetails.itemCode) {
      console.log("🔍 Strategy 2: Matching by itemCode:", itemDetails.itemCode);
      targetItem = availableItems.find((item) => item.itemCode === itemDetails.itemCode);
      if (targetItem) matchStrategy = "itemCode";
      console.log("🔍 Strategy 2 result:", targetItem ? "FOUND" : "NOT FOUND");
    }
    if (!targetItem && (itemDetails.bidNumber || itemDetails.bidNo)) {
      const bidNum = itemDetails.bidNumber || itemDetails.bidNo;
      console.log("🔍 Strategy 3: Matching by bidNum:", bidNum, "(type:", typeof bidNum, ")");
      targetItem = availableItems.find((item) => {
        const m1 = item.bidNo == bidNum, m2 = item.bidNumber == bidNum;
        const m3 = String(item.bidNo) === String(bidNum), m4 = String(item.bidNumber) === String(bidNum);
        if (m1 || m2 || m3 || m4) console.log("🔍 Strategy 3 MATCH:", { itemBidNo: item.bidNo, bidNum });
        return m1 || m2 || m3 || m4;
      });
      if (targetItem) matchStrategy = "bidNumber";
      console.log("🔍 Strategy 3 result:", targetItem ? "FOUND" : "NOT FOUND");
    }
    if (!targetItem && itemDetails.title) {
      console.log("🔍 Strategy 4: Matching by title:", itemDetails.title);
      targetItem = availableItems.find((item) => item.title === itemDetails.title);
      if (targetItem) matchStrategy = "title";
      console.log("🔍 Strategy 4 result:", targetItem ? "FOUND" : "NOT FOUND");
    }

    if (!targetItem) {
      console.error("❌ CRITICAL: Selected item not found in available items!");
      console.error("❌ Item details received:", JSON.stringify(itemDetails, null, 2));
      resetWheel();
      return;
    }

    console.log("✅ MATCH FOUND using strategy:", matchStrategy);
    console.log("✅ Target item:", targetItem);
    console.log("🎉 Admin Selected Bid for Users:", targetItem);

    // Place the winning card at the front of the visual deck.
    // Ensure the suit matches the lot parity: Even -> Diamond (index 0), Odd -> Spade (index 1).
    const bidNum = parseInt(targetItem.bidNo || targetItem.bidNumber, 10) || 0;
    const isOdd = bidNum % 2 !== 0;
    selectedIndexRef.current = isOdd ? 1 : 0;

    setCurrentSelectedBid(targetItem);

    const targetCardIndex = availableItems.findIndex((item) => item.id === targetItem.id);
    const targetAngle     = -(targetCardIndex / availableItems.length) * Math.PI * 2;
    setSpinning(false);

    try {
      await animateToPosition(targetAngle);
      setWheelStopped(true);
      if (onBidSelected) onBidSelected(targetItem, availableItems);
    } catch (error) {
      resetWheel();
    }
  };

  // ── Socket listeners (COMPLETELY UNCHANGED) ──────────────────────────────────
  useEffect(() => {
    const socket = io(serverUrl);
    socket.on("connect", () => { console.log("🔌 User wheel connected:", socket.id); setSocketConnected(true); });
    socket.on("disconnect", () => { console.log("🔌 User wheel disconnected"); setSocketConnected(false); });

    socket.on("wheelRandomSelection", (data) => {
      console.log("📡 Raw wheelRandomSelection data received:", JSON.stringify(data, null, 2));
      if (data.round === round && data.itemDetails) {
        if (availableItems.length === 0) {
          setTimeout(() => { if (availableItems.length > 0) triggerAdminSpin(data.itemDetails); }, 500);
          return;
        }
        triggerAdminSpin(data.itemDetails);
      }
    });
    socket.on("RANDOM_SELECTED", (data) => {
      console.log("📡 Raw RANDOM_SELECTED data received:", JSON.stringify(data, null, 2));
      if (data.round === round && data.itemDetails) {
        if (availableItems.length === 0) { setTimeout(() => { if (availableItems.length > 0) triggerAdminSpin(data.itemDetails); }, 500); return; }
        triggerAdminSpin(data.itemDetails);
      }
    });
    socket.on("wheelConfirmation", (data) => {
      console.log("📡 User received wheel confirmation:", data);
      if (data.round == round) {
        clearSavedState();

        // ── Flick the selected card off the right side ─────────────────────
        // Set flickingRef FIRST so the RAF wheelStopped block stops
        // overwriting that card's transform on every frame.
        flickingRef.current = true;

        const deck = deckRootRef.current;
        if (deck) {
          const cards = Array.from(deck.children).filter(c => c.classList.contains("csh2-card"));
          const selectedCard = cards[selectedIndexRef.current];
          if (selectedCard) {
            // One rAF tick of breathing room so the stopped-state transform
            // finishes before our flick overrides it.
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                selectedCard.style.transition =
                  "transform 1.0s cubic-bezier(0.25, 0.0, 0.55, 1.0), opacity 0.85s ease";
                selectedCard.style.transform =
                  "translate3d(1200px, -150px, 300px) rotateY(-45deg) rotateZ(32deg) scale(0.65)";
                selectedCard.style.opacity = "0";
              });
            });
          }
        }

        // Reset after animation completes (1s animation + 300ms buffer)
        setTimeout(() => {
          fetchGameItems();
          resetWheel();
        }, 1300);
      }
    });
    socket.on("wheelSkip", (data) => {
      console.log("📡 User received wheel skip:", data);
      if (data.round == round) { clearSavedState(); resetWheel(); }
    });

    socket.on("wheelUpdate", (data) => {
      console.log("📡 User received wheel update (legacy):", data);
      if (data.round === round) {
        if (data.action === "randomSelection" && data.selectedItem) triggerAdminSpin(data.selectedItem);
        else if (data.action === "itemSelected") { fetchGameItems(); resetWheel(); }
        else if (data.action === "skip") resetWheel();
      }
    });
    socket.on("roundItemUpdate", (data) => {
      console.log("📡 User received round item update:", data);
      if (data.round === round) fetchGameItems();
    });
    socket.onAny((eventName, data) => {
      const known = ["connect","disconnect","wheelRandomSelection","wheelConfirmation","wheelSkip","wheelUpdate","roundItemUpdate","RANDOM_SELECTED"];
      if (!known.includes(eventName)) console.log("📡 Unknown socket event:", eventName, data);
    });
    return () => { socket.disconnect(); };
  }, [round, availableItems.length]);

  // ── RAF loop – pure visual, zero game logic ───────────────────────────────────
  useEffect(() => {
    const root = deckRootRef.current;
    if (!root) return;

    const prefRM = prefersReducedMotion.current;

    const update = (timestamp) => {
      const cards = Array.from(root.children).filter(c => c.classList.contains("csh2-card"));
      const count = cards.length;
      if (count === 0) { rafRef.current = requestAnimationFrame(update); return; }

      const t = timestamp * 0.001;
      const elapsed  = shuffleStartTime.current ? Date.now() - shuffleStartTime.current : 0;
      const progress = clamp(elapsed / SHUFFLE_DURATION, 0, 1);
      const half     = Math.floor(count / 2);

      for (let i = 0; i < count; i++) {
        const card = cards[i];
        if (!card) continue;
        const isSelectedCard = i === selectedIndexRef.current;

        let tx = 0, ty = 0, tz = 0;
        let ry = 0, rz = 0;
        let scale = 1;

        // ── IDLE (waiting for admin) ────────────────────────────────────────────
        if (!isSelecting) {
          // Compact, neat stack. Very tight offset so cards look like a real deck.
          tx = i * 0.6;
          ty = i * -1.0 + Math.sin(t * 1.1 + i * 0.2) * (i < 3 ? 2 : 0);
          tz = -i * 2;
          rz = 0;
          scale = 1;
          card.style.opacity = "1";
          card.style.zIndex  = String(count - i);
          card.style.transition = "none";
          card.style.transform  = `translate3d(${tx}px,${ty}px,${tz}px) rotateZ(${rz}deg) scale(${scale})`;
          continue;
        }

        // ── REDUCED MOTION (skip to reveal) ────────────────────────────────────
        if (prefRM) {
          if (isSelectedCard && wheelStopped) {
            card.style.transform  = "translate3d(0,-40px,180px) rotateY(180deg) scale(1.1)";
            card.style.opacity    = "1";
            card.style.zIndex     = "500";
            card.style.transition = "transform 0.5s ease, opacity 0.3s";
          } else {
            tx = i * 0.6; ty = i * -1; tz = -i * 2;
            card.style.transform  = `translate3d(${tx}px,${ty}px,${tz}px)`;
            card.style.opacity    = wheelStopped ? "0.15" : "1";
            card.style.zIndex     = String(count - i);
            card.style.transition = "transform 0.5s ease, opacity 0.4s";
          }
          continue;
        }

        // ─ Remove any CSS transition during RAF (we drive it manually) ─
        card.style.transition = "none";

        // ── PHASE 1 — WASH (0 → PHASE_WASH_END) ────────────────────────────────
        if (progress <= PHASE_WASH_END) {
          const p  = progress / PHASE_WASH_END;
          const ep = easeOut(p);

          // Each card fans out to a unique position (seeded randomness)
          const angle     = (cardRng(i * 3)     - 0.5) * Math.PI * 1.6; // spread direction
          const dist      = 120 + cardRng(i * 7) * 260;                  // spread distance
          const cardRot   = (cardRng(i * 5)     - 0.5) * 40;             // z rotation spread
          const cardRaisY = -cardRng(i * 11)    * 60;                    // slight upward arc

          tx = Math.cos(angle) * dist * ep;
          ty = (Math.sin(angle) * dist * 0.4 + cardRaisY) * ep;
          tz = (-i * 2) * (1 - ep) + (cardRng(i * 13) * 60 - 30) * ep;
          rz = cardRot * ep;

          card.style.opacity = "1";
          card.style.zIndex  = String(Math.round(cardRng(i * 17) * count));
        }

        // ── PHASE 2 — GATHER INTO L + R PILES (WASH_END → SPLIT_END) ────────────
        else if (progress <= PHASE_SPLIT_END) {
          const p  = (progress - PHASE_WASH_END) / (PHASE_SPLIT_END - PHASE_WASH_END);
          const ep = easeInOut(p);

          const isLeft    = i < half;
          const halfIdx   = isLeft ? i : i - half;
          const halfCount = isLeft ? half : count - half;

          // Target: two neat piles offset left and right
          const targetX = isLeft ? -160 : 160;
          const targetY = halfIdx * -1.0;
          const targetZ = -halfIdx * 2;
          const targetR = isLeft ? -6 : 6;

          // Start: spread-out wash positions
          const angle   = (cardRng(i * 3) - 0.5) * Math.PI * 1.6;
          const dist    = 120 + cardRng(i * 7) * 260;
          const startX  = Math.cos(angle) * dist;
          const startY  = Math.sin(angle) * dist * 0.4 - cardRng(i * 11) * 60;
          const startZ  = (cardRng(i * 13) * 60 - 30);
          const startR  = (cardRng(i * 5) - 0.5) * 40;

          tx = lerp(startX, targetX, ep);
          ty = lerp(startY, targetY, ep);
          tz = lerp(startZ, targetZ, ep);
          rz = lerp(startR, targetR, ep);

          card.style.opacity = "1";
          card.style.zIndex  = String(isLeft ? halfCount - halfIdx + count : halfCount - halfIdx);
        }

        // ── PHASE 3 — RIFFLE INTERLEAVE (SPLIT_END → RIFFLE_END) ────────────────
        else if (progress <= PHASE_RIFFLE_END) {
          const p = (progress - PHASE_SPLIT_END) / (PHASE_RIFFLE_END - PHASE_SPLIT_END);

          const isLeft  = i < half;
          const halfIdx = isLeft ? i : i - half;

          // Interleave order: L0,R0,L1,R1,L2,R2... → index in assembled deck
          const interleavePos   = halfIdx * 2 + (isLeft ? 0 : 1);
          const totalInterleave = count;
          // Each card's "drop time" — normalised 0→1
          const dropAt          = interleavePos / (totalInterleave - 1);
          // How far through that card's own drop: 0 (waiting) → 1 (landed)
          const cardP           = clamp((p - dropAt * 0.75) / 0.25, 0, 1);
          const eCP             = easeOut(cardP);

          // Source pile position
          const pileX  = isLeft ? -160 : 160;
          const pileY  = halfIdx * -1.0;
          const pileZ  = -halfIdx * 2;
          const pileR  = isLeft ? -6 : 6;

          // Destination: assembled deck position
          const destX  = interleavePos * 0.4;
          const destY  = interleavePos * -0.8;
          const destZ  = -interleavePos * 1.5;
          const destR  = 0;

          // Arc: lift upward mid-transit
          const arcLift = Math.sin(eCP * Math.PI) * 50;

          tx = lerp(pileX, destX, eCP);
          ty = lerp(pileY, destY, eCP) - arcLift;
          tz = lerp(pileZ, destZ, eCP);
          rz = lerp(pileR, destR, eCP);

          // Slight Y rotation flutter while in transit
          ry = Math.sin(eCP * Math.PI * 2) * (1 - eCP) * 8 * (isLeft ? 1 : -1);

          card.style.opacity = "1";
          card.style.zIndex  = String(count - interleavePos);
        }

        // ── PHASE 4 — SQUARE UP (RIFFLE_END → SQUARE_END) ──────────────────────
        else if (progress <= PHASE_SQUARE_END) {
          const p  = (progress - PHASE_RIFFLE_END) / (PHASE_SQUARE_END - PHASE_RIFFLE_END);
          const ep = easeInOut(p);

          // Start: interleaved order
          const startX = i * 0.4;
          const startY = i * -0.8;
          const startZ = -i * 1.5;

          // End: tight compact stack
          const endX = i * 0.6;
          const endY = i * -1.0;
          const endZ = -i * 2;

          // Rock side to side while squaring
          const rock = Math.sin(p * Math.PI * 3) * (1 - ep) * 6;

          tx = lerp(startX, endX, ep) + rock;
          ty = lerp(startY, endY, ep);
          tz = lerp(startZ, endZ, ep);
          rz = rock * 0.4;

          card.style.opacity = "1";
          card.style.zIndex  = String(count - i);
        }

        // ── PHASE 5 — REVEAL (SQUARE_END → 1.0) / WHEEL STOPPED ─────────────────
        else {
          const p  = (progress - PHASE_SQUARE_END) / (1 - PHASE_SQUARE_END);
          const ep = easeOut(p);

          if (isSelectedCard) {
            // Selected card lifts forward and begins its journey to flip position
            tx = 0;
            ty = lerp(0, -50, ep);
            tz = lerp(-0, 80, ep);
            scale = lerp(1, 1.06, ep);
            card.style.opacity = "1";
            card.style.zIndex  = "500";
          } else {
            tx = i * 0.6;
            ty = i * -1;
            tz = -i * 2 - ep * 30;
            card.style.opacity = String(lerp(1, 0.18, ep));
            card.style.zIndex  = String(count - i);
          }
        }

        // Write transform (except stopped state handled below)
        if (!wheelStopped || !isSelectedCard) {
          card.style.transform = `translate3d(${tx}px,${ty}px,${tz}px) rotateY(${ry}deg) rotateZ(${rz}deg) scale(${scale})`;
        }
      }

      // ── WHEEL STOPPED — persistent reveal transforms (CSS transition driven) ──
      // Skip entirely if a flick animation is in progress (flickingRef) so we
      // don't stomp on the outgoing card's transition every frame.
      if (wheelStopped && !flickingRef.current) {
        for (let i = 0; i < count; i++) {
          const card = cards[i];
          if (!card) continue;
          const isSelectedCard = i === selectedIndexRef.current;

          const backFace  = card.querySelector('.csh2-back');
          const frontFace = card.querySelector('.csh2-front');

          if (isSelectedCard) {
            card.style.transition = "transform 0.9s cubic-bezier(.2,.9,.2,1), opacity 0.3s";
            card.style.transform  = "translate3d(0,-50px,180px) rotateY(180deg) scale(1.12)";
            card.style.opacity    = "1";
            card.style.zIndex     = "500";
            if (backFace)  backFace.style.visibility  = 'hidden';
            if (frontFace) frontFace.style.visibility = 'visible';
            // Note: glow-ring removed per request, refs kept for safety but no CSS class will show
            if (!revealedRef.current && glowRef.current) {
              revealedRef.current = true;
            }
          } else {
            card.style.transition = "transform 0.7s ease, opacity 0.6s";
            card.style.transform  = `translate3d(${i * 3}px,${30 + i * 4}px,${-60 - i * 10}px) rotateZ(${(i % 2 === 0 ? 1 : -1) * i * 0.8}deg) scale(0.94)`;
            card.style.opacity    = String(Math.max(0, 0.18 - i * 0.025));
            card.style.zIndex     = String(count - i);
            // Not flipped: keep back visible, hide front
            if (backFace)  backFace.style.visibility  = 'visible';
            if (frontFace) frontFace.style.visibility = 'hidden';
          }
        }
      }

      rafRef.current = requestAnimationFrame(update);
    };

    rafRef.current = requestAnimationFrame(update);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [availableItems.length, isSelecting, wheelStopped, spinning]);

  // ── Visual deck: always render VISUAL_DECK cards. ───────────────────────────
  // The selected card (index 0) shows real data on its front face.
  // All other cards show generic fronts (never visible until flip anyway).
  const deckItems = availableItems.length > 0
    ? Array.from({ length: Math.min(VISUAL_DECK, availableItems.length) }, (_, i) => availableItems[i])
    : Array.from({ length: VISUAL_DECK }, (_, i) => ({ id: `placeholder-${i}`, bidNo: i + 1, title: "–", basePrice: 0, resources: {} }));

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="csh2-stage" ref={stageRef}>

      {/* ── Selected bid panel (always preserved) ── */}
      {currentSelectedBid && wheelStopped && (
        <div className="csh2-panel">
          <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.32)", letterSpacing: "0.22em", textTransform: "uppercase" }}>Current Lot</div>
          <div style={{ fontSize: "58px", fontWeight: "200", color: "#e8ff00", lineHeight: "1", letterSpacing: "-2px", textShadow: "0 0 20px rgba(232,255,0,0.4)" }}>
            {currentSelectedBid.bidNo || currentSelectedBid.bidNumber}
          </div>
          <div style={{ fontSize: "16px", fontWeight: "700", color: "white", marginTop: "6px", lineHeight: "1.25" }}>
            {currentSelectedBid.title}
          </div>
          {currentSelectedBid.resources && Object.keys(currentSelectedBid.resources).length > 0 && (
            <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.38)", marginTop: "2px" }}>
              {Object.entries(currentSelectedBid.resources).map(([k, v]) => `${k}: ${v}`).join(" · ")}
            </div>
          )}
          <div style={{ fontSize: "20px", color: "#b8d000", fontWeight: "300", marginTop: "6px" }}>
            ₹{currentSelectedBid.basePrice?.toLocaleString()}
          </div>
        </div>
      )}

      {/* ── Connection badge ── */}
      <div className="csh2-conn">
        <div style={{ fontSize: "11px", fontWeight: "800", letterSpacing: "0.18em", color: socketConnected ? "#e8ff00" : "rgba(255,255,255,0.25)" }}>
          {socketConnected ? "SYSTEM LIVE" : "OFFLINE"}
        </div>
        <div className="csh2-conn-dot" style={{
          background: socketConnected ? "#e8ff00" : "rgba(255,255,255,0.12)",
          boxShadow:  socketConnected ? "0 0 10px #e8ff00, 0 0 20px rgba(232,255,0,0.4)" : "none",
          animation:  socketConnected ? "csh2-pulse 2s ease-in-out infinite" : "none",
        }} />
      </div>

      {/* ── Status bar (shuffle in progress) ── */}
      {isSelecting && !wheelStopped && (
        <div className="csh2-status">
          <div className="csh2-spinner" />
          SELECTING LOT
        </div>
      )}

      {/* ── Idle hint ── */}
      {!isSelecting && !wheelStopped && !loading && availableItems.length > 0 && (
        <div className="csh2-idle-hint">Auction Standby — Awaiting Admin</div>
      )}

      {/* ── Loading overlay ── */}
      {loading && <div className="csh2-overlay">Loading Round {round} items…</div>}

      {/* ── Empty / view-only overlay ── */}
      {!loading && availableItems.length === 0 && (
        <div className="csh2-overlay">View Only — Admin Controls the Auction</div>
      )}

      {/* ── 3D Deck ── */}
      {!loading && (
        <div style={{ position: "relative" }}>
          {/* Deck root (perspective origin) */}
          <div
            className="csh2-deck-root"
            ref={deckRootRef}
            style={{ transform: "rotateX(-8deg)" }}
          >
            {deckItems.map((item, i) => {
              const isSelectedCard = i === selectedIndexRef.current;
              // Alternate suits: even cards = diamond (♦), odd cards = spade (♠)
              const isSpade = i % 2 === 1;
              return (
                <div key={`csh2-${item.id}-${i}`} className="csh2-card">
                  {/* ── Back face — color-coded by suit ── */}
                  <div className={`csh2-face csh2-back ${isSpade ? 'is-spade' : 'is-diamond'}`}>
                    <div className="csh2-back-pattern" />
                    <div className="csh2-back-inner" />
                    {/* Corner pips */}
                    <span className="csh2-back-pip tl">{isSpade ? '♠' : '♦'}</span>
                    <span className="csh2-back-pip br">{isSpade ? '♠' : '♦'}</span>
                    <div className="csh2-back-logo-wrap">
                      {isSpade
                        ? <div className="csh2-back-spade">♠</div>
                        : <div className="csh2-back-diamond" />
                      }
                      <div className="csh2-back-title">Auction to Action</div>
                      <div className="csh2-back-sub">Round {round}</div>
                    </div>
                  </div>

                  {/* ── Front face (hidden by default via CSS; revealed via JS visibility toggle on flip) ── */}
                  <div className={`csh2-face csh2-front ${isSpade ? 'is-spade' : 'is-diamond'}`} style={{ visibility: 'hidden' }}>
                    {isSelectedCard && currentSelectedBid ? (
                      <>
                        <div className="csh2-front-lot">Lot</div>
                        <div className="csh2-front-number">
                          {currentSelectedBid.bidNo || currentSelectedBid.bidNumber}
                        </div>
                        <div className="csh2-front-rule" />
                        <div className="csh2-front-title">{currentSelectedBid.title}</div>
                        {currentSelectedBid.resources && Object.keys(currentSelectedBid.resources).length > 0 && (
                          <div className="csh2-front-res">
                            {Object.entries(currentSelectedBid.resources).map(([k, v]) => `${k}: ${v}`).join(" · ")}
                          </div>
                        )}
                        <div className="csh2-front-plabel">Base Price</div>
                        <div className="csh2-front-price">₹{currentSelectedBid.basePrice?.toLocaleString()}</div>
                        <div className="csh2-front-badge">✦ Selected</div>
                      </>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
