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

export const getTimezoneForLocation = (locationVal: string): string => {
  const opt = BIRTHPLACE_OPTIONS.find((o) => o.value === locationVal);
  return opt ? opt.tz : '+07:00'; // Mặc định +07:00 (Việt Nam)
};
