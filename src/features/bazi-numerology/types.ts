/**
 * Bazi/Numerology feature types.
 * UserBirthData moved from src/types/user-data.ts
 */

export interface UserBirthData {
  email: string;
  fullName?: string;
  dob: string;           // YYYY-MM-DD
  birthTime: string;     // HH:MM
  birthTimeUnknown: boolean;
  birthPlace: string;    // display label, e.g. "Nha Trang, Khánh Hòa, Vietnam"
  birthPlaceLat?: number;
  birthPlaceLng?: number;
  birthPlaceTimezone?: string;  // e.g. "+07:00" — from GeoNames
  gender: 0 | 1;         // 0=female, 1=male
  occupation: string;
  feeling: string;
  phone?: string;
  telegram?: string;
}
