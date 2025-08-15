/* ====== CONFIG ====== */
const BASE_PATH = '/WaDir/'; // penting untuk GitHub Pages di repo WaDir
const DEBUG_EL = () => document.getElementById('debug');

/* ====== COUNTRY CODES (30+ negara) ====== */
const COUNTRY_CODES = {
  "62": { flag: "🇮🇩", name: "INA" },
  "1":  { flag: "🇺🇸", name: "USA" },
  "44": { flag: "🇬🇧", name: "UK"  },
  "81": { flag: "🇯🇵", name: "JPN" },
  "49": { flag: "🇩🇪", name: "GER" },
  "33": { flag: "🇫🇷", name: "FRA" },
  "61": { flag: "🇦🇺", name: "AUS" },
  "39": { flag: "🇮🇹", name: "ITA" },
  "34": { flag: "🇪🇸", name: "ESP" },
  "55": { flag: "🇧🇷", name: "BRA" },
  "7":  { flag: "🇷🇺", name: "RUS" },
  "82": { flag: "🇰🇷", name: "KOR" },
  "65": { flag: "🇸🇬", name: "SGP" },
  "66": { flag: "🇹🇭", name: "THA" },
  "90": { flag: "🇹🇷", name: "TUR" },
  "46": { flag: "🇸🇪", name: "SWE" },
  "41": { flag: "🇨🇭", name: "SWI" },
  "31": { flag: "🇳🇱", name: "NLD" },
  "27": { flag: "🇿🇦", name: "RSA" },
  "354":{ flag: "🇮🇸", name: "ISL" },
  "351":{ flag: "🇵🇹", name: "POR" },
  "64": { flag: "🇳🇿", name: "NZL" },
  "48": { flag: "🇵🇱", name: "POL" },
  "420":{ flag: "🇨🇿", name: "CZE" },
  "43": { flag: "🇦🇹", name: "AUT" },
  "36": { flag: "🇭🇺", name: "HUN" },
  "358":{ flag: "🇫🇮", name: "FIN" },
  "30": { flag: "🇬🇷", name: "GRE" },
  "372":{ flag: "🇪🇪", name: "EST" },
  "359":{ flag: "🇧🇬", name: "BUL" },
  "52": { flag: "🇲🇽", name: "MEX" },
  "91": { flag: "🇮🇳", name: "IND" },
  "971":{ flag: "🇦🇪", name: "UAE" },
  "351":{ flag: "🇵🇹", name: "POR" }, // duplikat aman, tetap sama
  "60": { flag: "🇲🇾", name: "MYS" }
};

/* ====== DOM ====== */
const phoneInput = document.getElementById('phone');
const flagSpan = document.getElementById('flag');
const sendBtn = document.getElementById('sendBtn');
const msgInput = document.getElementById('message');

/* ====== Helper ====== */
const sortedCodes = Object.keys(COUNTRY_CODES).sort((a, b) => b.length - a.length);

function detectFlag(number) {
  let detected = { flag: "🌐", name: "" };
  for (const code of sortedCodes) {
    if (number.startsWith(code)) {
      detected = COUNTRY_CODES[code];
      break;
    }
  }
  return detected;
}

function normalizePhone(raw) {
  // hapus semua selain digit
  let phone = (raw || '').replace(/\D+/g, '');
  // jika mulai 0 → 62
  if (phone.startsWith('0')) phone = '62' + phone.slice(1);
  return phone;
}

function getSelectedWaType() {
  const el = document.querySelector('input[name="waType"]:checked');
  return el ? el.value : 'original';
}

function buildUrl(phone, message, waType) {
  const text = encodeURIComponent(message || '');
  // ANDROID INTENT untuk WA Business agar langsung ke com.whatsapp.w4b
  const isAndroid = /Android/i.test(navigator.userAgent);

  if (waType === 'business') {
    if (isAndroid) {
      // Intent langsung ke paket WA Business
      return `intent://send?phone=${phone}&text=${text}#Intent;scheme=whatsapp;package=com.whatsapp.w4b;end`;
    }
    // fallback non-Android / iOS: tetap pakai api.whatsapp.com
    return `https://api.whatsapp.com/send?phone=${phone}&text=${text}`;
  }

  // Original
  return `https://wa.me/${phone}?text=${text}`;
}

/* ====== Events ====== */
phoneInput.addEventListener('input', () => {
  const raw = phoneInput.value.trim();
  const onlyDigits = raw.replace(/\D+/g, '');
  const d = detectFlag(onlyDigits);
  flagSpan.textContent = d.flag + (d.name ? ' ' + d.name : '');
});

sendBtn.addEventListener('click', () => {
  const rawPhone = phoneInput.value.trim();
  const phone = normalizePhone(rawPhone);
  const waType = getSelectedWaType();
  const message = msgInput.value.trim();

  if (!phone) {
    alert('Masukkan nomor WA terlebih dahulu!');
    return;
  }

  const url = buildUrl(phone, message, waType);
  DEBUG_EL().textContent = `Mode: ${waType} → ${url}`;

  // Buka di tab baru / trigger intent
  window.location.href = url;
});
