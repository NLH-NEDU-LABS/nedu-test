import React, { useState, useEffect } from 'react';
import type { Persona, SetAnswer, Problem } from '@/types/assessment';

// ── COLORS ───────────────────────────────────────────────────────────────────
const C = {
  bg: "#FAFAF8",
  white: "#FFFFFF",
  dark: "#1C1917",
  muted: "#8E8E93",   // Apple secondary label
  border: "#E5E5EA",  // Apple separator
  most: "#34C759",    // Apple system green
  mostBg: "#F0FDF4",
  mostRing: "#A7F3C0",
  least: "#FF3B30",   // Apple system red
  leastBg: "#FFF5F5",
  leastRing: "#FFBBB7",
  neutral: "#57534E",
  neutralBg: "#F2F2F7", // Apple grouped background
};

// ── LEGEND PILL ───────────────────────────────────────────────────────────────
function LegendPill({ color, bg, isUp, align }: { color: string, bg: string, isUp: boolean, align: "left" | "right" }) {
  const label = isUp ? "QUAN TRỌNG NHẤT" : "ÍT QUAN TRỌNG";
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 6,
      justifyContent: align === "right" ? "flex-end" : "flex-start"
    }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 5,
        background: bg, borderRadius: 10, padding: "5px 10px",
        flexDirection: align === "right" ? "row-reverse" : "row"
      }}>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {isUp
            ? <polyline points="18 15 12 9 6 15" />
            : <polyline points="6 9 12 15 18 9" />}
        </svg>
        <span style={{ fontSize: 10, fontWeight: 600, color, letterSpacing: "0.04em" }}>{label}</span>
      </div>
    </div>
  );
}

// ── RADIO BTN ────────────────────────────────────────────────────────────────
function RadioBtn({ active, disabled, color, isUp, onClick, tooltip }: {
  active: boolean; disabled: boolean; color: string; isUp: boolean;
  onClick: () => void; tooltip: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={tooltip}
      style={{
        width: "100%", height: "100%", minHeight: 72,
        border: "none", cursor: disabled ? "not-allowed" : "pointer",
        background: "transparent",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "background 0.15s ease",
        opacity: disabled ? 0.22 : 1,
        padding: "8px 6px"
      }}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.background = color + "12"; }}
      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
    >
      <div style={{
        width: 32, height: 32, borderRadius: "50%",
        border: active ? "none" : `1.5px solid ${color}`,
        background: active ? color : "transparent",
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: active ? `0 2px 8px ${color}40` : "none",
        transition: "all 0.2s cubic-bezier(0.34,1.56,0.64,1)"
      }}>
        {active ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            {isUp
              ? <polyline points="18 15 12 9 6 15" />
              : <polyline points="6 9 12 15 18 9" />}
          </svg>
        )}
      </div>
    </button>
  );
}

// ── ITEM ROW ─────────────────────────────────────────────────────────────────
function ItemRow({ 
  item, isMost, isLeast, isNeutral, disabledMost, disabledLeast, onPickMost, onPickLeast 
}: { 
  item: Problem, isMost: boolean, isLeast: boolean, isNeutral: boolean, 
  disabledMost: boolean, disabledLeast: boolean, onPickMost: () => void, onPickLeast: () => void 
}) {
  const rowBg = isMost ? C.mostBg : isLeast ? C.leastBg : C.white;
  const rowBorder = isMost ? C.mostRing : isLeast ? C.leastRing : C.border;
  const rowBorderWidth = (isMost || isLeast) ? 1.5 : 1;

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "56px 1fr 56px",
      alignItems: "center",
      gap: 0,
      background: rowBg,
      border: `${rowBorderWidth}px solid ${rowBorder}`,
      borderRadius: 16,
      overflow: "hidden",
      transition: "all 0.2s ease",
      boxShadow: isMost
        ? `0 2px 16px ${C.most}1A`
        : isLeast
        ? `0 2px 16px ${C.least}1A`
        : "none"
    }}>

      {/* LEFT — Most button */}
      <RadioBtn
        active={isMost}
        disabled={disabledMost}
        color={C.most}
        isUp={true}
        onClick={onPickMost}
        tooltip="Quan trọng nhất với tôi"
      />

      {/* CENTER — Content */}
      <div style={{
        padding: "15px 12px",
        borderLeft: `1px solid ${rowBorder}`,
        borderRight: `1px solid ${rowBorder}`,
        textAlign: "center"
      }}>
        <div style={{
          fontSize: 14, fontWeight: 500, color: C.dark,
          lineHeight: 1.4, letterSpacing: "-0.01em"
        }}>
          {item.label}
        </div>
      </div>

      {/* RIGHT — Least button */}
      <RadioBtn
        active={isLeast}
        disabled={disabledLeast}
        color={C.least}
        isUp={false}
        onClick={onPickLeast}
        tooltip="Ít quan trọng nhất lúc này"
      />
    </div>
  );
}

// ── MAIN SCREEN ─────────────────────────────────────────────────────────────
interface MaxDiffSetScreenProps {
  persona: Persona;
  currentSetIndex: number;
  totalSets: number;
  onAnswer: (answer: SetAnswer) => void;
  onBack: () => void;
}

export const MaxDiffSetScreen = ({
  persona,
  currentSetIndex,
  totalSets,
  onAnswer,
  onBack,
}: MaxDiffSetScreenProps) => {
  const currentSet = persona.sets[currentSetIndex];
  const items = currentSet.items.map(
    (itemId) => persona.problem_pool.find((p) => p.id === itemId)!
  );

  const [selectedMost, setSelectedMost] = useState<string | null>(null);
  const [selectedLeast, setSelectedLeast] = useState<string | null>(null);

  // Reset state on set change
  useEffect(() => {
    setSelectedMost(null);
    setSelectedLeast(null);
  }, [currentSetIndex]);

  const canProceed = selectedMost !== null && selectedLeast !== null;
  const progress = (currentSetIndex / totalSets) * 100;

  const handlePick = (type: "most" | "least", itemId: string) => {
    if (type === "most") {
      if (selectedLeast === itemId) setSelectedLeast(null);
      setSelectedMost(prev => prev === itemId ? null : itemId);
    } else {
      if (selectedMost === itemId) setSelectedMost(null);
      setSelectedLeast(prev => prev === itemId ? null : itemId);
    }
  };

  const handleNext = () => {
    if (!canProceed) return;
    onAnswer({
      set_id: currentSet.set_id,
      most: selectedMost!,
      least: selectedLeast!,
    });
  };

  // Generate light/dark variants from base color
  const pColor = persona.color || "#378ADD";
  const pColorLight = pColor + "15"; // 8% opacity fallback wrapper

  return (
    <div style={{ width: "100%", maxWidth: 680, margin: "0 auto", animation: "fade-in 0.5s ease-out" }}>
      {/* Top bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          background: pColorLight, borderRadius: 99,
          border: `1px solid ${pColor}22`,
          padding: "5px 12px"
        }}>
          <span style={{ fontSize: 13 }}>{persona.emoji}</span>
          <span style={{ fontSize: 11, fontWeight: 600, color: pColor, letterSpacing: "0.04em" }}>
            {persona.label}
          </span>
        </div>
        <span style={{ fontSize: 12, color: C.muted, fontWeight: 500, letterSpacing: "-0.01em" }}>
          {currentSet.set_label} / {totalSets}
        </span>
      </div>

      {/* Progress */}
      <div style={{ height: 3, background: C.border, borderRadius: 99, marginBottom: 24, overflow: "hidden" }}>
        <div style={{
          height: "100%", width: `${progress}%`,
          background: pColor, borderRadius: 99,
          transition: "width 0.5s ease"
        }} />
      </div>

      {/* Question */}
      <div style={{ marginBottom: 20 }}>
        <p style={{ fontSize: 15, fontWeight: 400, color: C.dark, margin: 0, lineHeight: 1.55, letterSpacing: "-0.01em" }}>
          {persona.maxdiff_instruction}
        </p>
      </div>

      {/* Legend row */}
      <div style={{
        display: "grid", gridTemplateColumns: "1fr auto 1fr",
        alignItems: "center", marginBottom: 14, gap: 8
      }}>
        <LegendPill color={C.most} bg={C.mostBg} isUp={true} align="left" />
        <div style={{ width: 1, height: 24, background: C.border }} />
        <LegendPill color={C.least} bg={C.leastBg} isUp={false} align="right" />
      </div>

      {/* Items */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
        {items.map((item) => {
          const isMost = selectedMost === item.id;
          const isLeast = selectedLeast === item.id;
          const isNeutral = !isMost && !isLeast;

          return (
            <ItemRow
              key={item.id}
              item={item}
              isMost={isMost}
              isLeast={isLeast}
              isNeutral={isNeutral}
              disabledMost={!!selectedMost && !isMost && selectedLeast !== item.id}
              disabledLeast={!!selectedLeast && !isLeast && selectedMost !== item.id}
              onPickMost={() => handlePick("most", item.id)}
              onPickLeast={() => handlePick("least", item.id)}
            />
          );
        })}
      </div>

      {/* Warning / Hint */}
      {!canProceed && (
        <div style={{
          textAlign: "center", fontSize: 12, color: C.muted,
          marginBottom: 16, padding: "9px 14px",
          background: C.neutralBg, borderRadius: 10,
          letterSpacing: "-0.01em"
        }}>
          {!selectedMost && !selectedLeast
            ? "Hãy chọn điều quan trọng nhất và ít quan trọng nhất với bạn"
            : !selectedMost ? "Tốt! Giờ hãy chọn thêm điều quan trọng nhất"
            : "Tốt! Giờ hãy chọn thêm điều ít quan trọng nhất"}
        </div>
      )}

      {/* Buttons */}
      <div style={{ display: "flex", gap: 10 }}>
        <button
          type="button"
          onClick={onBack}
          disabled={currentSetIndex === 0 && !onBack}
          style={{
            flex: 1, padding: "14px 0",
            border: `1px solid ${C.border}`, borderRadius: 14,
            background: "white", cursor: "pointer",
            fontSize: 15, fontWeight: 500, color: C.muted,
            letterSpacing: "-0.01em",
            transition: "all 0.15s"
          }}
        >
          ← Quay lại
        </button>
        <button
          type="button"
          onClick={handleNext}
          disabled={!canProceed}
          style={{
            flex: 2, padding: "14px 0",
            background: canProceed ? pColor : C.border,
            border: "none", borderRadius: 14,
            cursor: canProceed ? "pointer" : "not-allowed",
            fontSize: 15, fontWeight: 600, color: canProceed ? "#fff" : C.muted,
            letterSpacing: "-0.01em",
            transition: "all 0.2s",
            boxShadow: canProceed ? `0 2px 12px ${pColor}40` : "none"
          }}
        >
          {currentSetIndex === totalSets - 1 ? "Xem kết quả của tôi →" : "Nhóm tiếp theo →"}
        </button>
      </div>

    </div>
  );
};

