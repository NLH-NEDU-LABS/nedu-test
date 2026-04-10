/**
 * MBTI Scoring — Option A: 32 Binary Forced-Choice Questions
 * 8 câu x 4 dimension (E/I, S/N, T/F, J/P)
 * Mỗi câu chỉ đo DUY NHẤT 1 dimension, 2 options A/B = 2 cực đối lập.
 * Interleaved order: EI → SN → TF → JP (lặp 8 vòng) để tránh mỏi một dimension.
 */

export const MBTI_QUESTIONS = [
  // Round 1
  {
    id: "q1",
    question: "Sau một ngày dài làm việc, bạn thường muốn...",
    options: {
      a: "Ra ngoài gặp bạn bè hoặc làm gì đó có người.",
      b: "Ở nhà một mình để nghỉ ngơi và nạp lại năng lượng.",
    }
  },
  {
    id: "q2",
    question: "Khi đưa ra quyết định, bạn tập trung nhiều hơn vào...",
    options: {
      a: "Những gì đang xảy ra thực tế, dữ liệu và sự kiện cụ thể.",
      b: "Những khả năng và xu hướng có thể xảy ra trong tương lai.",
    }
  },
  {
    id: "q3",
    question: "Khi ai đó đưa ra ý kiến chưa đúng, bạn thường...",
    options: {
      a: "Chỉ ra điểm sai một cách thẳng thắn và logic.",
      b: "Cân nhắc cảm xúc của họ trước khi phản hồi.",
    }
  },
  {
    id: "q4",
    question: "Lịch trình hàng ngày của bạn thường...",
    options: {
      a: "Được lên kế hoạch rõ ràng từ trước.",
      b: "Linh hoạt, thay đổi tùy theo tình huống.",
    }
  },
  // Round 2
  {
    id: "q5",
    question: "Trong một buổi họp nhóm, bạn thường...",
    options: {
      a: "Chủ động chia sẻ ý kiến và tham gia sôi nổi.",
      b: "Lắng nghe kỹ và chỉ phát biểu khi thực sự cần.",
    }
  },
  {
    id: "q6",
    question: "Khi học một kỹ năng mới, bạn thích...",
    options: {
      a: "Thực hành ngay từ đầu, học qua thực tế.",
      b: "Hiểu lý thuyết và nguyên lý đằng sau trước.",
    }
  },
  {
    id: "q7",
    question: "Khi phải chọn giữa hai phương án khó, bạn tin vào...",
    options: {
      a: "Phân tích khách quan — cái nào hợp lý và hiệu quả hơn.",
      b: "Giá trị cá nhân — cái nào cảm thấy đúng với mình hơn.",
    }
  },
  {
    id: "q8",
    question: "Khi bắt đầu một dự án mới, bạn thích...",
    options: {
      a: "Lập kế hoạch chi tiết và theo sát từng bước.",
      b: "Bắt tay vào làm và điều chỉnh dần khi cần.",
    }
  },
  // Round 3
  {
    id: "q9",
    question: "Ở một bữa tiệc với nhiều người lạ, bạn...",
    options: {
      a: "Dễ dàng làm quen và trò chuyện với nhiều người mới.",
      b: "Chủ yếu ở bên những người đã quen hoặc tìm góc yên tĩnh.",
    }
  },
  {
    id: "q10",
    question: "Khi đọc một cuốn sách, bạn thích...",
    options: {
      a: "Sách thực tế, có thể áp dụng ngay vào cuộc sống.",
      b: "Sách tư duy, triết học, hay những ý tưởng mang tính khám phá.",
    }
  },
  {
    id: "q11",
    question: "Khi phê bình công việc của người khác, bạn...",
    options: {
      a: "Tập trung vào kết quả và chất lượng, nói thẳng những gì cần cải thiện.",
      b: "Chú ý đến cảm xúc của họ, cố gắng đưa ra phản hồi nhẹ nhàng hơn.",
    }
  },
  {
    id: "q12",
    question: "Khi kết thúc một công việc, bạn cảm thấy...",
    options: {
      a: "Hài lòng vì đã hoàn thành đúng kế hoạch, sẵn sàng cho việc tiếp theo.",
      b: "Muốn xem xét lại và khám phá thêm những hướng khác có thể làm.",
    }
  },
  // Round 4
  {
    id: "q13",
    question: "Khi có thời gian rảnh dài, bạn thích...",
    options: {
      a: "Tụ tập với bạn bè hoặc tham gia hoạt động xã hội.",
      b: "Dành thời gian một mình cho sở thích cá nhân.",
    }
  },
  {
    id: "q14",
    question: "Khi giải thích điều gì đó, bạn thường...",
    options: {
      a: "Đưa ra ví dụ cụ thể và chi tiết thực tế.",
      b: "Dùng hình ảnh, ẩn dụ và khái niệm tổng quát.",
    }
  },
  {
    id: "q15",
    question: "Khi tranh luận, bạn dễ bị thuyết phục bởi...",
    options: {
      a: "Lập luận chặt chẽ, có logic và bằng chứng rõ ràng.",
      b: "Câu chuyện cảm xúc và giá trị nhân văn đằng sau.",
    }
  },
  {
    id: "q16",
    question: "Khi đặt kỳ nghỉ, bạn thường...",
    options: {
      a: "Đặt chỗ, lên lịch và chuẩn bị trước kỹ lưỡng.",
      b: "Để mọi thứ tự nhiên, thích nghi và khám phá khi đến nơi.",
    }
  },
  // Round 5
  {
    id: "q17",
    question: "Sau một sự kiện xã hội lớn, bạn thường cảm thấy...",
    options: {
      a: "Sảng khoái và muốn tiếp tục gặp gỡ thêm.",
      b: "Mệt mỏi và cần thời gian yên tĩnh để phục hồi.",
    }
  },
  {
    id: "q18",
    question: "Bạn tin tưởng hơn vào...",
    options: {
      a: "Kinh nghiệm trực tiếp và những gì đã được chứng minh.",
      b: "Trực giác và linh cảm về những điều chưa xảy ra.",
    }
  },
  {
    id: "q19",
    question: "Điều quan trọng hơn với bạn khi làm việc nhóm là...",
    options: {
      a: "Mọi người làm đúng vai trò và kết quả đạt hiệu quả.",
      b: "Mọi người cảm thấy được lắng nghe và không khí hài hòa.",
    }
  },
  {
    id: "q20",
    question: "Khi gặp thay đổi bất ngờ trong kế hoạch, bạn...",
    options: {
      a: "Cảm thấy khó chịu và cần sắp xếp lại ngay.",
      b: "Thích nghi khá nhanh và coi đó là cơ hội mới.",
    }
  },
  // Round 6
  {
    id: "q21",
    question: "Khi làm việc, bạn thích...",
    options: {
      a: "Làm việc nhóm, thường xuyên trao đổi với người khác.",
      b: "Làm việc độc lập, tự mình xử lý phần lớn công việc.",
    }
  },
  {
    id: "q22",
    question: "Bạn dễ nhớ hơn...",
    options: {
      a: "Chi tiết cụ thể: số liệu, ngày tháng, sự kiện.",
      b: "Ý nghĩa tổng thể và mối liên hệ giữa các sự việc.",
    }
  },
  {
    id: "q23",
    question: "Khi ai đó buồn, bạn thường...",
    options: {
      a: "Giúp họ phân tích vấn đề và tìm hướng giải quyết.",
      b: "Ngồi bên cạnh, lắng nghe và chia sẻ cảm xúc với họ.",
    }
  },
  {
    id: "q24",
    question: "Deadline khiến bạn cảm thấy...",
    options: {
      a: "Có động lực — bạn thích có mốc thời gian rõ ràng.",
      b: "Bó buộc — bạn làm tốt hơn khi không bị ép thời gian.",
    }
  },
  // Round 7
  {
    id: "q25",
    question: "Khi gặp người mới, bạn thường...",
    options: {
      a: "Chủ động bắt chuyện và làm quen ngay.",
      b: "Chờ người kia mở lời hoặc có lý do cụ thể để nói chuyện.",
    }
  },
  {
    id: "q26",
    question: "Công việc lý tưởng của bạn...",
    options: {
      a: "Có quy trình rõ ràng, kết quả đo lường được.",
      b: "Cho phép khám phá và sáng tạo, không lặp lại.",
    }
  },
  {
    id: "q27",
    question: "Khi đánh giá một ý tưởng mới, bạn hỏi trước tiên...",
    options: {
      a: "\"Điều này có khả thi và hợp lý không?\"",
      b: "\"Điều này có tác động tốt đến mọi người không?\"",
    }
  },
  {
    id: "q28",
    question: "Phòng làm việc của bạn thường...",
    options: {
      a: "Gọn gàng, ngăn nắp — mọi thứ đều có chỗ của nó.",
      b: "Có vẻ lộn xộn nhưng bạn biết mọi thứ ở đâu.",
    }
  },
  // Round 8
  {
    id: "q29",
    question: "Khi nghĩ về bản thân, bạn tự nhận mình là người...",
    options: {
      a: "Hướng ngoại, cởi mở và dễ kết nối với nhiều người.",
      b: "Hướng nội, cần không gian riêng và chọn lọc trong các mối quan hệ.",
    }
  },
  {
    id: "q30",
    question: "Bạn thấy mình giỏi hơn trong việc...",
    options: {
      a: "Thực hiện kế hoạch có sẵn một cách chính xác.",
      b: "Tìm ra ý tưởng mới và nhìn thấy tiềm năng chưa ai khám phá.",
    }
  },
  {
    id: "q31",
    question: "Khi phải nói điều người khác không muốn nghe, bạn...",
    options: {
      a: "Nói thẳng — sự thật quan trọng hơn cảm giác thoải mái tạm thời.",
      b: "Tìm cách nói nhẹ nhàng nhất có thể để không làm họ tổn thương.",
    }
  },
  {
    id: "q32",
    question: "Bạn cảm thấy thoải mái hơn khi...",
    options: {
      a: "Mọi thứ đã được quyết định và có kế hoạch rõ ràng.",
      b: "Các lựa chọn vẫn còn mở và bạn có thể thay đổi hướng bất cứ lúc nào.",
    }
  },
];

// Mỗi câu chỉ map 1 dimension duy nhất: a = cực dương, b = cực âm
export const MBTI_ANSWER_MAP: Record<string, Record<string, string>> = {
  // E/I
  q1:  { a: "E", b: "I" },
  q5:  { a: "E", b: "I" },
  q9:  { a: "E", b: "I" },
  q13: { a: "E", b: "I" },
  q17: { a: "E", b: "I" },
  q21: { a: "E", b: "I" },
  q25: { a: "E", b: "I" },
  q29: { a: "E", b: "I" },
  // S/N
  q2:  { a: "S", b: "N" },
  q6:  { a: "S", b: "N" },
  q10: { a: "S", b: "N" },
  q14: { a: "S", b: "N" },
  q18: { a: "S", b: "N" },
  q22: { a: "S", b: "N" },
  q26: { a: "S", b: "N" },
  q30: { a: "S", b: "N" },
  // T/F
  q3:  { a: "T", b: "F" },
  q7:  { a: "T", b: "F" },
  q11: { a: "T", b: "F" },
  q15: { a: "T", b: "F" },
  q19: { a: "T", b: "F" },
  q23: { a: "T", b: "F" },
  q27: { a: "T", b: "F" },
  q31: { a: "T", b: "F" },
  // J/P
  q4:  { a: "J", b: "P" },
  q8:  { a: "J", b: "P" },
  q12: { a: "J", b: "P" },
  q16: { a: "J", b: "P" },
  q20: { a: "J", b: "P" },
  q24: { a: "J", b: "P" },
  q28: { a: "J", b: "P" },
  q32: { a: "J", b: "P" },
};

export function calculateMBTI(answers: Record<string, string>): string {
  const score = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };

  Object.entries(answers).forEach(([q, ans]) => {
    const letter = MBTI_ANSWER_MAP[q]?.[ans];
    if (letter) score[letter as keyof typeof score]++;
  });

  // Tie (4-4) → không có cực ưu thế, trả về ký tự thứ hai (cực âm) để thể hiện sự cân bằng lệch nhẹ
  return [
    score.E > score.I ? "E" : "I",
    score.S > score.N ? "S" : "N",
    score.T > score.F ? "T" : "F",
    score.J > score.P ? "J" : "P",
  ].join("");
}
