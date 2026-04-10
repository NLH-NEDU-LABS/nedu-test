/**
 * Enneagram Scoring — Option D: Hybrid Triads + Likert
 *
 * Phase 1 (6 câu): Xác định trung tâm (Gut / Heart / Head)
 *   - 2 câu/trung tâm, rated 1–5
 *   - Tổng điểm cao nhất → trung tâm thắng
 *
 * Phase 2 (9 câu): Phân biệt 3 type trong trung tâm thắng
 *   - 3 câu/type, rated 1–5
 *   - Type có tổng điểm cao nhất = kết quả
 *
 * Tổng: 15 câu
 */

export type Center = 'gut' | 'heart' | 'head';

export interface EnneagramQuestion {
  id: string;
  statement: string;
}

export interface Phase1Question extends EnneagramQuestion {
  center: Center;
}

export interface Phase2Question extends EnneagramQuestion {
  type: number; // 1–9
}

// ─── Phase 1: Xác định trung tâm ──────────────────────────────────────────────
// Gut  (8, 9, 1) — bản năng, tức giận, kiểm soát
// Heart(2, 3, 4) — cảm xúc, hình ảnh, danh tính
// Head (5, 6, 7) — suy nghĩ, lo âu, an toàn
// Câu hỏi interleaved: gut → heart → head → gut → heart → head

export const ENNEAGRAM_PHASE1: Phase1Question[] = [
  {
    id: "p1_g1",
    center: "gut",
    statement: "Khi thấy điều gì đó không công bằng hoặc không đúng, tôi cảm thấy bức xúc và muốn hành động ngay."
  },
  {
    id: "p1_h1",
    center: "heart",
    statement: "Cách người khác nhìn nhận và cảm nhận về tôi ảnh hưởng đến tâm trạng của tôi khá nhiều."
  },
  {
    id: "p1_e1",
    center: "head",
    statement: "Trước khi làm điều gì mới, tôi thường cần tìm hiểu kỹ hoặc chuẩn bị để cảm thấy an tâm."
  },
  {
    id: "p1_g2",
    center: "gut",
    statement: "Tôi thường có phản ứng bản năng mạnh mẽ ngay lập tức — cảm giác trong người trước khi suy nghĩ kịp."
  },
  {
    id: "p1_h2",
    center: "heart",
    statement: "Tôi thường tự hỏi mình thực sự là ai và muốn được nhìn nhận đúng với con người thật của mình."
  },
  {
    id: "p1_e2",
    center: "head",
    statement: "Tôi hay lo xa — thường nghĩ đến những rủi ro hoặc kịch bản xấu có thể xảy ra."
  },
];

// ─── Phase 2: Phân biệt type trong từng trung tâm ─────────────────────────────

export const ENNEAGRAM_PHASE2: Record<Center, Phase2Question[]> = {
  // Gut: Type 8 (Challenger), 9 (Peacemaker), 1 (Perfectionist)
  gut: [
    // Type 8
    {
      id: "p2_8a",
      type: 8,
      statement: "Tôi không ngại đối đầu trực tiếp khi cần bảo vệ bản thân hoặc người mình quan tâm."
    },
    {
      id: "p2_8b",
      type: 8,
      statement: "Tôi cảm thấy mạnh mẽ và tự tin nhất khi nắm quyền kiểm soát tình huống."
    },
    {
      id: "p2_8c",
      type: 8,
      statement: "Tôi dễ mất kiên nhẫn với những người do dự, không quyết đoán hoặc không thành thật."
    },
    // Type 9
    {
      id: "p2_9a",
      type: 9,
      statement: "Tôi thường nhường nhịn hoặc thỏa hiệp để tránh xung đột, dù đôi khi không thực sự muốn."
    },
    {
      id: "p2_9b",
      type: 9,
      statement: "Tôi dễ bị cuốn vào việc của người khác và đôi khi quên đi những gì mình thực sự muốn."
    },
    {
      id: "p2_9c",
      type: 9,
      statement: "Tôi cảm thấy thoải mái nhất khi mọi người xung quanh đều ổn và không có căng thẳng."
    },
    // Type 1
    {
      id: "p2_1a",
      type: 1,
      statement: "Tôi thường cảm thấy khó chịu khi thấy điều gì đó được làm không đúng hoặc không đủ chuẩn."
    },
    {
      id: "p2_1b",
      type: 1,
      statement: "Tôi tự phê bình bản thân khá nhiều khi mắc sai lầm — dù người khác không để ý."
    },
    {
      id: "p2_1c",
      type: 1,
      statement: "Tôi tin rằng có một cách đúng để làm mọi thứ và tôi cố gắng tìm ra cách đó."
    },
  ],

  // Heart: Type 2 (Helper), 3 (Achiever), 4 (Individualist)
  heart: [
    // Type 2
    {
      id: "p2_2a",
      type: 2,
      statement: "Tôi cảm thấy có giá trị nhất khi được cần đến và giúp ích được cho người khác."
    },
    {
      id: "p2_2b",
      type: 2,
      statement: "Tôi thường nhận ra nhu cầu của người khác trước khi họ tự nói ra."
    },
    {
      id: "p2_2c",
      type: 2,
      statement: "Đôi khi tôi giúp đỡ quá nhiều đến mức bỏ quên nhu cầu và cảm xúc của chính mình."
    },
    // Type 3
    {
      id: "p2_3a",
      type: 3,
      statement: "Tôi được thúc đẩy mạnh bởi mong muốn thành công và được công nhận bởi những người quan trọng."
    },
    {
      id: "p2_3b",
      type: 3,
      statement: "Tôi biết cách thể hiện bản thân tốt nhất tùy theo từng tình huống và đối tượng."
    },
    {
      id: "p2_3c",
      type: 3,
      statement: "Tôi cảm thấy lo lắng và mất phương hướng khi không đạt được mục tiêu đề ra."
    },
    // Type 4
    {
      id: "p2_4a",
      type: 4,
      statement: "Tôi thường cảm thấy mình khác biệt với những người xung quanh theo một cách khó giải thích."
    },
    {
      id: "p2_4b",
      type: 4,
      statement: "Tôi bị thu hút bởi những gì sâu sắc, chân thật và có ý nghĩa riêng — không thích sự hời hợt."
    },
    {
      id: "p2_4c",
      type: 4,
      statement: "Tôi hay nhớ lại và suy nghĩ nhiều về những trải nghiệm cảm xúc quan trọng trong quá khứ."
    },
  ],

  // Head: Type 5 (Investigator), 6 (Loyalist), 7 (Enthusiast)
  head: [
    // Type 5
    {
      id: "p2_5a",
      type: 5,
      statement: "Tôi cần hiểu rõ mọi thứ trước khi hành động — kiến thức và năng lực là nền tảng của sự tự tin."
    },
    {
      id: "p2_5b",
      type: 5,
      statement: "Tôi thường thích quan sát và phân tích từ xa hơn là trực tiếp tham gia vào tình huống."
    },
    {
      id: "p2_5c",
      type: 5,
      statement: "Tôi cần nhiều thời gian và không gian riêng để nạp lại năng lượng sau khi tương tác nhiều."
    },
    // Type 6
    {
      id: "p2_6a",
      type: 6,
      statement: "Tôi thường nghĩ đến những rủi ro và điều có thể xảy ra sai trước khi bắt đầu."
    },
    {
      id: "p2_6b",
      type: 6,
      statement: "Tôi rất coi trọng sự trung thành — một khi đã tin ai, tôi gắn bó sâu sắc và lâu dài."
    },
    {
      id: "p2_6c",
      type: 6,
      statement: "Khi không chắc chắn, tôi tìm kiếm sự đảm bảo hoặc ý kiến từ người tôi tin tưởng trước khi quyết định."
    },
    // Type 7
    {
      id: "p2_7a",
      type: 7,
      statement: "Tôi bị thu hút bởi những trải nghiệm và ý tưởng mới — cảm thấy ngột ngạt khi bị giới hạn."
    },
    {
      id: "p2_7b",
      type: 7,
      statement: "Tôi thường có nhiều ý tưởng và kế hoạch hơn thời gian để thực hiện tất cả."
    },
    {
      id: "p2_7c",
      type: 7,
      statement: "Tôi có xu hướng nhìn về tương lai tích cực và tìm cách thoát khỏi những cảm xúc hoặc tình huống tiêu cực."
    },
  ],
};

// ─── Likert scale options (dùng chung cho tất cả câu) ─────────────────────────
export const LIKERT_OPTIONS: Record<string, string> = {
  "1": "Hoàn toàn không đúng",
  "2": "Ít đúng với tôi",
  "3": "Đôi khi đúng",
  "4": "Khá đúng với tôi",
  "5": "Rất đúng với tôi",
};

// ─── Scoring functions ─────────────────────────────────────────────────────────

export function determineCenter(answers: Record<string, string>): Center {
  const score: Record<Center, number> = { gut: 0, heart: 0, head: 0 };

  for (const q of ENNEAGRAM_PHASE1) {
    const val = parseInt(answers[q.id] ?? "0");
    score[q.center] += val;
  }

  // Highest total wins; tie → gut > heart > head (arbitrary but consistent)
  return (Object.entries(score).sort((a, b) => b[1] - a[1])[0][0]) as Center;
}

export function calculateEnneagramType(
  center: Center,
  phase2Answers: Record<string, string>
): number {
  const score: Record<number, number> = {};

  for (const q of ENNEAGRAM_PHASE2[center]) {
    if (!score[q.type]) score[q.type] = 0;
    score[q.type] += parseInt(phase2Answers[q.id] ?? "0");
  }

  return Number(Object.entries(score).sort((a, b) => b[1] - a[1])[0][0]);
}
