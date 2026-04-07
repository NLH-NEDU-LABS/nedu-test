import React, { useState, useEffect } from 'react';
import type { Persona, SetAnswer, Problem } from '@/types/assessment';

// ── COLORS ───────────────────────────────────────────────────────────────────
const C = {
  bg: "#FAFAF8",
  white: "#FFFFFF",
  dark: "#1C1917",
  muted: "#78716C",
  border: "#E7E5E1",
  most: "#16A34A",    // green
  mostBg: "#F0FDF4",
  mostRing: "#BBF7D0",
  least: "#DC2626",   // red
  leastBg: "#FEF2F2",
  leastRing: "#FECACA",
  neutral: "#57534E",
  neutralBg: "#F5F5F4",
};

// ── LEGEND PILL ───────────────────────────────────────────────────────────────
function LegendPill({ color, bg, icon, label, align }: { color: string, bg: string, icon: string, label: string, align: "left" | "right" }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 6,
      justifyContent: align === "right" ? "flex-end" : "flex-start"
    }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 5,
        background: bg, borderRadius: 8, padding: "5px 10px"
      }}>
        <span style={{ fontSize: 11, color, fontWeight: 800 }}>{icon}</span>
        <span style={{ fontSize: 10, fontWeight: 700, color, letterSpacing: "0.07em" }}>{label}</span>
      </div>
    </div>
  );
}

// ── RADIO BTN ────────────────────────────────────────────────────────────────
function RadioBtn({ active, disabled, color, activeBg, onClick, icon, side, tooltip }: any) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={tooltip}
      style={{
        width: "100%", height: "100%", minHeight: 80,
        border: "none", cursor: disabled ? "not-allowed" : "pointer",
        background: active ? activeBg : "transparent",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexDirection: "column", gap: 4,
        transition: "all 0.15s ease",
        opacity: disabled ? 0.25 : 1,
        padding: "8px 6px"
      }}
      onMouseEnter={e => { if (!disabled && !active) e.currentTarget.style.background = color + "15"; }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}
    >
      <div style={{
        width: 28, height: 28, borderRadius: "50%",
        border: `2px solid ${active ? "#fff" : color}`,
        background: active ? "rgba(255,255,255,0.25)" : "transparent",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: active ? 13 : 11,
        color: active ? "#fff" : color,
        fontWeight: 700,
        transition: "all 0.15s"
      }}>
        {icon}
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
  const rowBorderWidth = (isMost || isLeast) ? 2 : 1.5;

  // Render first emoji or word if no icon provided in problem type
  const iconFallback = "👉";

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "52px 1fr 52px",
      alignItems: "center",
      gap: 0,
      background: rowBg,
      border: `${rowBorderWidth}px solid ${rowBorder}`,
      borderRadius: 14,
      overflow: "hidden",
      transition: "all 0.18s ease",
      boxShadow: (isMost || isLeast) ? "0 2px 12px rgba(0,0,0,0.08)" : "none"
    }}>

      {/* LEFT — Most button */}
      <RadioBtn
        active={isMost}
        disabled={disabledMost}
        color={C.most}
        activeBg={C.most}
        onClick={onPickMost}
        icon={isMost ? "✓" : "▲"}
        side="left"
        tooltip="Lựa chọn Tích Cực (Positive)"
      />

      {/* CENTER — Content */}
      <div style={{
        padding: "14px 12px",
        borderLeft: `1px solid ${rowBorder}`,
        borderRight: `1px solid ${rowBorder}`,
        textAlign: "center"
      }}>
        <div style={{
          fontSize: 13, fontWeight: 600, color: C.dark,
          marginBottom: 3, lineHeight: 1.35
        }}>
          {item.label}
        </div>
      </div>

      {/* RIGHT — Least button */}
      <RadioBtn
        active={isLeast}
        disabled={disabledLeast}
        color={C.least}
        activeBg={C.least}
        onClick={onPickLeast}
        icon={isLeast ? "✓" : "▼"}
        side="right"
        tooltip="Lựa chọn Ít Ưu Tiên (Negative)"
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
          padding: "5px 12px"
        }}>
          <span style={{ fontSize: 14 }}>{persona.emoji}</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: pColor, letterSpacing: "0.06em" }}>
            {persona.label}
          </span>
        </div>
        <span style={{ fontSize: 12, color: C.muted, fontWeight: 600 }}>
          {currentSet.set_label} / {totalSets}
        </span>
      </div>

      {/* Progress */}
      <div style={{ height: 4, background: C.border, borderRadius: 99, marginBottom: 22, overflow: "hidden" }}>
        <div style={{
          height: "100%", width: `${progress}%`,
          background: pColor, borderRadius: 99,
          transition: "width 0.5s ease"
        }} />
      </div>

      {/* Question */}
      <div style={{ marginBottom: 22 }}>
        <p style={{ fontSize: 14, fontWeight: 500, color: C.dark, margin: 0, lineHeight: 1.6 }}>
          {persona.maxdiff_instruction}
        </p>
      </div>

      {/* Legend row */}
      <div style={{
        display: "grid", gridTemplateColumns: "1fr auto 1fr",
        alignItems: "center", marginBottom: 16, gap: 8
      }}>
        <LegendPill color={C.most} bg={C.mostBg} icon="▲" label={persona.most_label || "QUAN TRỌNG NHẤT VỚI TÔI"} align="left" />
        <div style={{ width: 1, height: 28, background: C.border }} />
        <LegendPill color={C.least} bg={C.leastBg} icon="▼" label={persona.least_label || "ÍT QUAN TRỌNG NHẤT LÚC NÀY"} align="right" />
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
          marginBottom: 16, padding: "8px 12px",
          background: C.neutralBg, borderRadius: 8
        }}>
          {!selectedMost && !selectedLeast
            ? `👆 Hãy chọn điều ${persona.most_label || 'QUAN TRỌNG NHẤT'} và ${persona.least_label || 'ÍT QUAN TRỌNG NHẤT'} với bạn`
            : !selectedMost ? `✅ Tốt! Giờ hãy chọn thêm điều ${persona.most_label || 'QUAN TRỌNG NHẤT'}`
            : `✅ Tốt! Giờ hãy chọn thêm điều ${persona.least_label || 'ÍT QUAN TRỌNG NHẤT'}`}
        </div>
      )}

      {/* Buttons */}
      <div style={{ display: "flex", gap: 12 }}>
        <button
          type="button"
          onClick={onBack}
          disabled={currentSetIndex === 0 && !onBack}
          style={{
            flex: 1, padding: "14px 0",
            border: `1.5px solid ${C.border}`, borderRadius: 12,
            background: "transparent", cursor: "pointer",
            fontSize: 14, color: C.muted,
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
            border: "none", borderRadius: 12,
            cursor: canProceed ? "pointer" : "not-allowed",
            fontSize: 14, fontWeight: 600, color: canProceed ? "#fff" : C.muted,
            transition: "all 0.2s",
            boxShadow: canProceed ? `0 4px 16px ${pColor}40` : "none"
          }}
        >
          {currentSetIndex === totalSets - 1 ? "Xem kết quả của tôi →" : "Nhóm tiếp theo →"}
        </button>
      </div>

    </div>
  );
};

