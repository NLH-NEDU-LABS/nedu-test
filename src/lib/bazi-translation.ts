// Bazi terminology translation maps (Chinese -> Vietnamese)

export const stemsMap: Record<string, string> = {
  '甲': 'Giáp',
  '乙': 'Ất',
  '丙': 'Bính',
  '丁': 'Đinh',
  '戊': 'Mậu',
  '己': 'Kỷ',
  '庚': 'Canh',
  '辛': 'Tân',
  '壬': 'Nhâm',
  '癸': 'Quý'
};

export const branchesMap: Record<string, string> = {
  '子': 'Tý',
  '丑': 'Sửu',
  '寅': 'Dần',
  '卯': 'Mão',
  '辰': 'Thìn',
  '巳': 'Tỵ',
  '午': 'Ngọ',
  '未': 'Mùi',
  '申': 'Thân',
  '酉': 'Dậu',
  '戌': 'Tuất',
  '亥': 'Hợi'
};

export const viZodiac: Record<string, string> = {
  '鼠': 'Tý (Chuột)',
  '牛': 'Sửu (Trâu)',
  '虎': 'Dần (Hổ)',
  '兔': 'Mão (Mèo)', // Viet zodiac uses Cat
  '龙': 'Thìn (Rồng)',
  '蛇': 'Tỵ (Rắn)',
  '马': 'Ngọ (Ngựa)',
  '羊': 'Mùi (Dê)',
  '猴': 'Thân (Khỉ)',
  '鸡': 'Dậu (Gà)',
  '狗': 'Tuất (Chó)',
  '猪': 'Hợi (Lợn)'
};

export const tenGodsMap: Record<string, string> = {
  '正官': 'Chính Quan',
  '偏官': 'Thiên Quan',
  '七杀': 'Thất Sát',
  '正印': 'Chính Ấn',
  '偏印': 'Thiên Ấn',
  '枭神': 'Kiêu Thần',
  '比肩': 'Tỷ Kiên',
  '劫财': 'Kiếp Tài',
  '食神': 'Thực Thần',
  '伤官': 'Thương Quan',
  '正财': 'Chính Tài',
  '偏财': 'Thiên Tài'
};

export const elementsMap: Record<string, string> = {
  '金': 'Kim',
  '木': 'Mộc',
  '水': 'Thủy',
  '火': 'Hỏa',
  '土': 'Thổ'
};

export const genderMap: Record<string, string> = {
  '男': 'Nam',
  '女': 'Nữ'
};

// Common Stars (Thần sát)
export const starsMap: Record<string, string> = {
  '天乙贵人': 'Thiên Ất Quý Nhân',
  '太极贵人': 'Thái Cực Quý Nhân',
  '天德贵人': 'Thiên Đức Quý Nhân',
  '月德贵人': 'Nguyệt Đức Quý Nhân',
  '三奇贵人': 'Tam Kỳ Quý Nhân',
  '福星贵人': 'Phúc Tinh Quý Nhân',
  '文昌贵人': 'Văn Xương Quý Nhân',
  '魁罡贵人': 'Khôi Canh Quý Nhân',
  '国印贵人': 'Quốc Ấn Quý Nhân',
  '学堂': 'Học Đường',
  '词馆': 'Từ Quán',
  '驿马': 'Dịch Mã',
  '华盖': 'Hoa Cái',
  '将星': 'Tướng Tinh',
  '金舆': 'Kim Dư',
  '天医': 'Thiên Y',
  '禄神': 'Lộc Thần',
  '羊刃': 'Dương Nhận',
  '飞刃': 'Phi Nhận',
  '墓库': 'Mộ Khố',
  '桃花': 'Đào Hoa',
  '咸池': 'Hàm Trì',
  '红鸾': 'Hồng Loan',
  '天喜': 'Thiên Hỷ',
  '孤辰': 'Cô Thần',
  '寡宿': 'Quả Tú',
  '阴阳差错': 'Âm Dương Lệch',
  '四废': 'Tứ Phế',
  '元辰': 'Nguyên Thần',
  '空亡': 'Không Vong',
  '十恶大败': 'Thập Ác Đại Bại',
  '灾煞': 'Tai Sát',
  '劫煞': 'Kiếp Sát',
  '天罗': 'Thiên La',
  '地网': 'Địa Võng',
  '红艳': 'Hồng Diễm',
  '孤鸾': 'Cô Loan',
  '天狗': 'Thiên Cẩu',
  '白虎': 'Bạch Hổ',
  '丧门': 'Tang Môn',
  '吊客': 'Điếu Khách',
  '病符': 'Bệnh Phù',
  '太岁': 'Thái Tuế',
  '五鬼': 'Ngũ Quỷ',
  '官符': 'Quan Phù',
  '死符': 'Tử Phù',
  '天煞': 'Thiên Sát',
  '地煞': 'Địa Sát',
  '年煞': 'Niên Sát',
  '月煞': 'Nguyệt Sát',
  '亡神': 'Vong Thần',
  '大耗': 'Đại Hao',
  '小耗': 'Tiểu Hao',
  '天德合': 'Thiên Đức Hợp',
  '月德合': 'Nguyệt Đức Hợp',
  '天厨贵人': 'Thiên Trù Quý Nhân'
};

// Translate function
export const tCan = (str: string) => stemsMap[str] || str;
export const tChi = (str: string) => branchesMap[str] || str;
export const tGod = (str: string) => tenGodsMap[str] || str;
export const tElem = (str: string) => elementsMap[str] || str;
export const tStar = (str: string) => starsMap[str] || str;
export const tZodiac = (str: string) => viZodiac[str] || str;
export const tGender = (str: string) => genderMap[str] || str;

// Hàm dịch nguyên cụm CanChi (vđ: 甲子 -> Giáp Tý)
export const tCanChi = (str: string) => {
  if (!str || str.length !== 2) return str;
  return `${tCan(str[0])} ${tChi(str[1])}`;
};
