/**
 * Thần Số Học (Pythagorean Numerology) — Ported from nlf-education-backend Python logic
 * Includes: Life Path, Destiny, Soul Urge, Name Chart, 4 Pinnacles, 4 Challenges, Life Peaks
 */

// ===== HELPERS =====

function reduceDigit(num: number): number {
  while (num > 9) {
    num = String(num).split('').reduce((s, d) => s + parseInt(d), 0);
  }
  return num;
}

function reduceDigitMaster(num: number, masterNumbers = [11, 22, 33]): number {
  while (num > 9 && !masterNumbers.includes(num)) {
    num = String(num).split('').reduce((s, d) => s + parseInt(d), 0);
  }
  return num;
}

function sumDigits(num: number): number {
  return String(num).split('').reduce((s, d) => s + parseInt(d), 0);
}

// ===== LIFE PATH NUMBER =====
// Input: dob as "YYYY-MM-DD"
export function calculateLifePathNumber(dob: string): number {
  const [year, month, day] = dob.split('-').map(Number);

  const sumMonth = sumDigits(month);
  const sumDay = sumDigits(day);
  const sumYear = sumDigits(year);

  let lifePath = sumDigits(sumMonth + sumDay + sumYear);

  // Check master numbers
  if ([11, 22, 33].includes(lifePath)) return lifePath;

  while (lifePath > 9) {
    lifePath = sumDigits(lifePath);
  }

  return lifePath;
}

// ===== DESTINY NUMBER (Expression Number) =====
// Hỗ trợ ký tự tiếng Việt (Â, Ê, Ô, Ư, Ơ, Ă, Đ)
const DESTINY_LETTER_VALUES: Record<string, number> = {
  'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5, 'F': 6, 'G': 7, 'H': 8, 'I': 9,
  'J': 1, 'K': 2, 'L': 3, 'M': 4, 'N': 5, 'O': 6, 'P': 7, 'Q': 8, 'R': 9,
  'S': 1, 'T': 2, 'U': 3, 'V': 4, 'W': 5, 'X': 6, 'Y': 7, 'Z': 8,
  // Vietnamese special chars
  'Â': 1, 'Ê': 5, 'Ô': 6, 'Ư': 3, 'Ơ': 6, 'Ă': 1, 'Đ': 4
};

export function calculateDestinyNumber(fullName: string): number {
  const upper = fullName.toUpperCase();
  let letterSum = 0;

  for (const char of upper) {
    if (/[A-ZÂÊÔƯƠĂĐa-zâêôươăđ]/u.test(char)) {
      letterSum += DESTINY_LETTER_VALUES[char] || 0;
    }
  }

  while (letterSum > 9) {
    if ([11, 22, 33].includes(letterSum)) break;
    letterSum = String(letterSum).split('').reduce((s, d) => s + parseInt(d), 0);
  }

  return letterSum;
}

// ===== SOUL URGE NUMBER (Heart's Desire) =====
// Tính bằng nguyên âm (vowels), hỗ trợ tiếng Việt
const SOUL_VOWELS: Record<string, number> = {
  'a': 1, 'e': 5, 'i': 9, 'o': 6, 'u': 3,
  'â': 1, 'ê': 5, 'ô': 6, 'ư': 3, 'ơ': 6,
  'ă': 1, 'y': 7
};

export function calculateSoulUrgeNumber(fullName: string): number {
  const name = fullName.toLowerCase().replace(/[^a-zâêôươăđ]/gu, '');
  if (!name) return 0;

  let soulUrgeSum = 0;
  for (const char of name) {
    soulUrgeSum += SOUL_VOWELS[char] || 0;
  }

  if ([11, 22, 33].includes(soulUrgeSum)) return soulUrgeSum;

  while (soulUrgeSum > 9) {
    soulUrgeSum = String(soulUrgeSum).split('').reduce((s, d) => s + parseInt(d), 0);
  }

  return soulUrgeSum;
}

// ===== NAME CHART =====
const NAME_CHART_VALUES: Record<string, number> = {
  'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5, 'F': 6, 'G': 7, 'H': 8, 'I': 9,
  'J': 1, 'K': 2, 'L': 3, 'M': 4, 'N': 5, 'O': 6, 'P': 7, 'Q': 8, 'R': 9,
  'S': 1, 'T': 2, 'U': 3, 'V': 4, 'W': 5, 'X': 6, 'Y': 7, 'Z': 8
};

export function createNameChart(fullName: string): string {
  const upper = fullName.toUpperCase();
  const chart: string[] = [];

  for (const char of upper) {
    if (/[A-Z]/.test(char)) {
      chart.push(String(NAME_CHART_VALUES[char] || 0));
    } else {
      chart.push(char);
    }
  }

  return chart.join(' ');
}

// ===== 4 LIFE PINNACLES (4 Đỉnh Cao) =====
// Input: dob as "YYYY-MM-DD"
export function calculateLifePinnacles(dob: string): number[] {
  const [year, month, day] = dob.split('-').map(Number);

  const reducedDay = reduceDigit(day);
  const reducedMonth = reduceDigit(month);
  const reducedYear = reduceDigit(sumDigits(year));

  const base1 = reducedDay;
  const base2 = reducedMonth;
  const base3 = reducedYear;

  const pinnacle1 = reduceDigit(base1 + base2);
  const pinnacle2 = reduceDigit(base2 + base3);

  let pinnacle3 = pinnacle1 + pinnacle2;
  if (![10, 11].includes(pinnacle3)) {
    pinnacle3 = reduceDigit(pinnacle3);
  }

  let pinnacle4 = base1 + base3;
  if (![10, 11].includes(pinnacle4)) {
    pinnacle4 = reduceDigit(pinnacle4);
  }

  return [pinnacle1, pinnacle2, pinnacle3, pinnacle4];
}

// ===== 4 CHALLENGES (4 Thách Thức) =====
export function calculateChallenges(dob: string): number[] {
  const [year, month, day] = dob.split('-').map(Number);

  const reducedDay = reduceDigit(day);
  const reducedMonth = reduceDigit(month);
  const reducedYear = reduceDigit(sumDigits(year));

  const pinnacles = calculateLifePinnacles(dob);

  const challenge1 = Math.abs(reducedMonth - reducedDay);
  const challenge2 = Math.abs(reducedDay - reducedYear);
  const challenge3 = Math.abs(pinnacles[0] - pinnacles[1]);
  const challenge4 = Math.abs(reducedYear - reducedMonth);

  return [challenge1, challenge2, challenge3, challenge4];
}

// ===== LIFE PEAKS (Mốc tuổi cho 4 đỉnh cao) =====
export function calculateLifePeaks(dob: string): number[] {
  const lifePathNumber = calculateLifePathNumber(dob);
  const peak1 = 36 - lifePathNumber;
  const peak2 = peak1 + 9;
  const peak3 = peak2 + 9;
  const peak4 = peak3 + 9;
  return [peak1, peak2, peak3, peak4];
}

// ===== MAIN EXPORT: Full Numerology Calculation =====
// Returns keys matching NumerologyResultView + Python backend format
export function calculateFullNumerology(dob: string, fullName?: string) {
  const lifePathNumber = calculateLifePathNumber(dob);
  const lifePinnacles = calculateLifePinnacles(dob);
  const lifePeaks = calculateLifePeaks(dob);
  const challenges = calculateChallenges(dob);

  const result: any = {
    life_path_number: lifePathNumber,
    life_pinnacles: {
      pinnacle_1: lifePinnacles[0],
      pinnacle_2: lifePinnacles[1],
      pinnacle_3: lifePinnacles[2],
      pinnacle_4: lifePinnacles[3],
    },
    life_peaks: {
      peaks_1: lifePeaks[0],
      peaks_2: lifePeaks[1],
      peaks_3: lifePeaks[2],
      peaks_4: lifePeaks[3],
    },
    challenges: {
      challenge_1: challenges[0],
      challenge_2: challenges[1],
      challenge_3: challenges[2],
      challenge_4: challenges[3],
    }
  };

  if (fullName && fullName.trim()) {
    result.destiny_number = calculateDestinyNumber(fullName);
    result.soul_urge_number = calculateSoulUrgeNumber(fullName);
    result.name_chart = createNameChart(fullName);
  }

  return result;
}
