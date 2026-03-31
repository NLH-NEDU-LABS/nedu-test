export interface UserBirthData {
  email: string;
  fullName?: string;
  dob: string;           // YYYY-MM-DD
  birthTime: string;     // HH:MM
  birthTimeUnknown: boolean;
  birthPlace: string;    // key from BIRTHPLACE_OPTIONS
  gender: 0 | 1;         // 0=female, 1=male
  occupation: string;
  feeling: string;
}
