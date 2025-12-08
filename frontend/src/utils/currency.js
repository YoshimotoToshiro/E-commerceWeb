// Simple Vietnamese currency formatting and number-to-words

export function formatCurrencyVND(amount, options = { minimumFractionDigits: 0 }) {
  // Đảm bảo parse đúng số
  const numeric = typeof amount === 'string' ? parseFloat(amount.replace(/[^\d.-]/g, '')) : Number(amount);
  const value = Number.isFinite(numeric) ? numeric : 0;
  const { minimumFractionDigits = 0 } = options;
  
  // Use vi-VN, format without decimal places by default
  const formatted = new Intl.NumberFormat('vi-VN', {
    minimumFractionDigits,
    maximumFractionDigits: minimumFractionDigits > 0 ? minimumFractionDigits : 0
  }).format(value);
  
  // vi-VN format uses dot (.) for thousands separator and comma (,) for decimal
  // Replace comma with dot only for decimal part, keep dots for thousands
  if (formatted.includes(',')) {
    return formatted.replace(',', '.') + ' ₫';
  }
  return formatted + ' ₫';
}

const ONES = ['', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];

function threeDigitsToWords(n) {
  const hundreds = Math.floor(n / 100);
  const tens = Math.floor((n % 100) / 10);
  const ones = n % 10;
  let parts = [];

  if (hundreds > 0) {
    parts.push(ONES[hundreds] + ' trăm');
  }

  if (tens > 1) {
    parts.push(ONES[tens] + ' mươi');
    if (ones === 1) parts.push('mốt');
    else if (ones === 5) parts.push('lăm');
    else if (ones > 0) parts.push(ONES[ones]);
  } else if (tens === 1) {
    parts.push('mười');
    if (ones === 5) parts.push('lăm');
    else if (ones > 0) parts.push(ONES[ones]);
  } else if (tens === 0 && ones > 0) {
    if (hundreds > 0) parts.push('lẻ');
    parts.push(ONES[ones]);
  }

  return parts.join(' ').trim();
}

export function moneyToWordsVn(amount) {
  const value = Math.round((Number.isFinite(amount) ? amount : 0));
  if (value === 0) return 'không đồng';

  const units = ['', ' nghìn', ' triệu', ' tỷ', ' nghìn tỷ', ' triệu tỷ'];
  let n = value;
  let i = 0;
  let parts = [];

  while (n > 0 && i < units.length) {
    const chunk = n % 1000;
    if (chunk !== 0) {
      const chunkWords = threeDigitsToWords(chunk);
      if (chunkWords) {
        parts.unshift(chunkWords + units[i]);
      }
    }
    n = Math.floor(n / 1000);
    i++;
  }

  const sentence = parts.join(' ').replace(/\s+/g, ' ').trim();
  // Uppercase first letter and append "đồng"
  return sentence.charAt(0).toUpperCase() + sentence.slice(1) + ' đồng';
}


