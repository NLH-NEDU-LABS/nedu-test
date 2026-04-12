export const BIRTHPLACE_OPTIONS = [
  { value: 'vietnam', label: 'Việt Nam', tz: '+07:00' },
  { value: 'singapore', label: 'Singapore', tz: '+08:00' },
  { value: 'china', label: 'Trung Quốc', tz: '+08:00' },
  { value: 'japan', label: 'Nhật Bản', tz: '+09:00' },
  { value: 'korea', label: 'Hàn Quốc', tz: '+09:00' },
  { value: 'thailand', label: 'Thái Lan', tz: '+07:00' },
  { value: 'usa_east', label: 'Mỹ (East)', tz: '-05:00' },
  { value: 'usa_west', label: 'Mỹ (West)', tz: '-08:00' },
];

/**
 * Resolve timezone string from a location value.
 *
 * Supports three input formats (in priority order):
 *  1. Already a GMT offset string like "+07:00" → pass through
 *  2. Legacy key from BIRTHPLACE_OPTIONS like "vietnam" → lookup
 *  3. Fallback → "+07:00" (Vietnam)
 */
export const getTimezoneForLocation = (locationVal: string): string => {
  // 1. Already an offset? e.g. "+07:00" or "-05:00"
  if (/^[+-]\d{2}:\d{2}$/.test(locationVal)) {
    return locationVal;
  }

  // 2. Legacy key lookup
  const opt = BIRTHPLACE_OPTIONS.find((o) => o.value === locationVal);
  if (opt) return opt.tz;

  // 3. Default
  return '+07:00';
};
