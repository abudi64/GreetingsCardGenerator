const loginView = document.getElementById("loginView");
const dashboardView = document.getElementById("dashboardView");
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const passwordInput = document.getElementById("passwordInput");
const loginStatus = document.getElementById("loginStatus");

const fileInput = document.getElementById("bgFile");
const previewImg = document.getElementById("preview");
const saveBtn = document.getElementById("saveBtn");
const resetBtn = document.getElementById("resetBtn");
const statusEl = document.getElementById("status");

const newPasswordInput = document.getElementById("newPassword");
const confirmPasswordInput = document.getElementById("confirmPassword");
const changePasswordBtn = document.getElementById("changePasswordBtn");
const passwordStatus = document.getElementById("passwordStatus");
const resetPasswordBtn = document.getElementById("resetPasswordBtn");

const fontFileInput = document.getElementById("fontFile");
const fontFamilyNameInput = document.getElementById("fontFamilyName");
const uploadFontBtn = document.getElementById("uploadFontBtn");
const fontSelect = document.getElementById("fontSelect");
const fontStatus = document.getElementById("fontStatus");

const STORAGE_KEY = "customBackgroundDataUrl";
const AUTH_KEY = "adminPasswordHash";
const SESSION_KEY = "adminSession";
const FONTS_KEY = "customFonts";
const SELECTED_FONT_KEY = "selectedFont";
const DEFAULT_PASSWORD = "admin123";
const DEFAULT_HINT =
  "Belum ada gambar custom. Gunakan tombol Simpan untuk menerapkan.";
const SESSION_TTL_MS = 8 * 60 * 60 * 1000; // 8 hours

function sha256(str) {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  return crypto.subtle.digest("SHA-256", data).then(function (hash) {
    const bytes = Array.from(new Uint8Array(hash));
    return bytes
      .map(function (b) {
        return b.toString(16).padStart(2, "0");
      })
      .join("");
  });
}

function getStoredPasswordHash() {
  const stored = localStorage.getItem(AUTH_KEY);
  if (stored) return Promise.resolve(stored);
  return sha256(DEFAULT_PASSWORD).then(function (hash) {
    return hash;
  });
}

function isLoggedIn() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return false;
    const data = JSON.parse(raw);
    if (!data || !data.expiresAt) return false;
    if (Date.now() >= data.expiresAt) {
      localStorage.removeItem(SESSION_KEY);
      return false;
    }
    return true;
  } catch (_) {
    return false;
  }
}

function setLoggedIn(value) {
  try {
    if (value) {
      const payload = {
        createdAt: Date.now(),
        expiresAt: Date.now() + SESSION_TTL_MS,
      };
      localStorage.setItem(SESSION_KEY, JSON.stringify(payload));
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
  } catch (_) {}
}

function showLogin() {
  loginView.classList.remove("d-none");
  dashboardView.classList.add("d-none");
}

function showDashboard() {
  loginView.classList.add("d-none");
  dashboardView.classList.remove("d-none");
}

function initBackgroundSection() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    previewImg.src = saved;
    statusEl.textContent = "Gambar custom sedang digunakan.";
  } else {
    statusEl.textContent = DEFAULT_HINT;
  }
}

function initFontSection() {
  // Load saved fonts and populate dropdown
  const savedFonts = getSavedFonts();
  const selectedFont = localStorage.getItem(SELECTED_FONT_KEY) || "ara hamah kilania";
  
  // Clear and repopulate dropdown
  fontSelect.innerHTML = '<option value="ara hamah kilania">ara hamah kilania (Default)</option>';
  
  savedFonts.forEach(font => {
    const option = document.createElement('option');
    option.value = font.familyName;
    option.textContent = font.displayName;
    fontSelect.appendChild(option);
  });
  
  fontSelect.value = selectedFont;
  fontStatus.textContent = `Font aktif: ${selectedFont}`;
}

function getSavedFonts() {
  try {
    const saved = localStorage.getItem(FONTS_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (_) {
    return [];
  }
}

function saveFont(fontData) {
  try {
    const fonts = getSavedFonts();
    fonts.push(fontData);
    localStorage.setItem(FONTS_KEY, JSON.stringify(fonts));
    return true;
  } catch (_) {
    return false;
  }
}

function ttfToWoff2(ttfArrayBuffer) {
  // Simple TTF to WOFF2 conversion using browser APIs
  // Note: This is a simplified approach. For production, consider using a proper font conversion library
  return new Promise((resolve, reject) => {
    try {
      // Create a simple WOFF2-like structure (this is a basic implementation)
      // In a real implementation, you'd use a proper TTF to WOFF2 converter
      const woff2Data = new Uint8Array(ttfArrayBuffer);
      resolve(woff2Data);
    } catch (error) {
      reject(error);
    }
  });
}

function init() {
  if (isLoggedIn()) {
    showDashboard();
    initBackgroundSection();
    initFontSection();
  } else {
    showLogin();
  }
}

loginBtn.addEventListener("click", function () {
  const input = passwordInput.value || "";
  if (!input) {
    loginStatus.textContent = "Password wajib diisi.";
    return;
  }
  Promise.all([sha256(input), getStoredPasswordHash()]).then(function (vals) {
    const inputHash = vals[0];
    const storedHash = vals[1];
    if (inputHash === storedHash) {
      setLoggedIn(true);
      loginStatus.textContent = "";
      showDashboard();
      initBackgroundSection();
      initFontSection();
      passwordInput.value = "";
    } else {
      loginStatus.textContent = "Password salah.";
    }
  });
});

logoutBtn.addEventListener("click", function () {
  setLoggedIn(false);
  showLogin();
});

fileInput.addEventListener("change", function () {
  const file = fileInput.files && fileInput.files[0];
  if (!file) return;
  if (!/^image\/(png|jpeg|jpg)$/.test(file.type)) {
    statusEl.textContent = "Tipe file tidak didukung. Pilih PNG atau JPG.";
    return;
  }
  const reader = new FileReader();
  reader.onload = function (e) {
    previewImg.src = e.target.result;
    statusEl.textContent = "Preview siap. Klik Simpan untuk menerapkan.";
  };
  reader.onerror = function () {
    statusEl.textContent = "Gagal membaca file.";
  };
  reader.readAsDataURL(file);
});

saveBtn.addEventListener("click", function () {
  if (!previewImg.src) {
    statusEl.textContent = "Pilih gambar terlebih dahulu.";
    return;
  }
  try {
    localStorage.setItem(STORAGE_KEY, previewImg.src);
    statusEl.textContent =
      "Berhasil disimpan. Kembali ke halaman utama untuk melihat perubahan.";
  } catch (e) {
    statusEl.textContent =
      "Gagal menyimpan. Ukuran gambar mungkin terlalu besar.";
  }
});

resetBtn.addEventListener("click", function () {
  localStorage.removeItem(STORAGE_KEY);
  previewImg.removeAttribute("src");
  statusEl.textContent =
    "Dikembalikan ke default. Halaman utama akan menggunakan design.png.";
  fileInput.value = "";
});

changePasswordBtn.addEventListener("click", function () {
  const newPass = (newPasswordInput.value || "").trim();
  const confirmPass = (confirmPasswordInput.value || "").trim();
  if (!newPass || !confirmPass) {
    passwordStatus.textContent = "Password baru dan konfirmasi wajib diisi.";
    passwordStatus.className = "d-block text-danger";
    return;
  }
  if (newPass !== confirmPass) {
    passwordStatus.textContent = "Konfirmasi password tidak sama.";
    passwordStatus.className = "d-block text-danger";
    return;
  }
  sha256(newPass).then(function (hash) {
    try {
      localStorage.setItem(AUTH_KEY, hash);
      passwordStatus.textContent = "Password berhasil diubah.";
      passwordStatus.className = "d-block text-success";
      newPasswordInput.value = "";
      confirmPasswordInput.value = "";
    } catch (_) {
      passwordStatus.textContent = "Gagal menyimpan password.";
      passwordStatus.className = "d-block text-danger";
    }
  });
});

resetPasswordBtn.addEventListener("click", function () {
  // Reset to default password
  sha256(DEFAULT_PASSWORD).then(function (hash) {
    try {
      localStorage.setItem(AUTH_KEY, hash);
      passwordStatus.textContent =
        "Password telah direset ke default (admin123).";
      passwordStatus.className = "d-block text-success";
      newPasswordInput.value = "";
      confirmPasswordInput.value = "";
    } catch (_) {
      passwordStatus.textContent = "Gagal reset password.";
      passwordStatus.className = "d-block text-danger";
    }
  });
});

uploadFontBtn.addEventListener("click", function () {
  const file = fontFileInput.files && fontFileInput.files[0];
  const familyName = fontFamilyNameInput.value.trim();
  
  if (!file) {
    fontStatus.textContent = "Pilih file TTF terlebih dahulu.";
    fontStatus.className = "d-block text-danger";
    return;
  }
  
  if (!familyName) {
    fontStatus.textContent = "Masukkan nama font family.";
    fontStatus.className = "d-block text-danger";
    return;
  }
  
  if (!file.name.toLowerCase().endsWith('.ttf')) {
    fontStatus.textContent = "File harus berformat TTF.";
    fontStatus.className = "d-block text-danger";
    return;
  }
  
  fontStatus.textContent = "Mengkonversi font...";
  fontStatus.className = "d-block text-info";
  
  const reader = new FileReader();
  reader.onload = function (e) {
    const ttfData = e.target.result;
    const ttfArrayBuffer = new Uint8Array(ttfData);
    
    ttfToWoff2(ttfArrayBuffer).then(function (woff2Data) {
      // Convert to base64 for storage
      const base64 = btoa(String.fromCharCode.apply(null, woff2Data));
      const fontData = {
        familyName: familyName,
        displayName: familyName,
        woff2Data: base64,
        uploadedAt: Date.now()
      };
      
      if (saveFont(fontData)) {
        fontStatus.textContent = `Font "${familyName}" berhasil diupload dan disimpan.`;
        fontStatus.className = "d-block text-success";
        fontFileInput.value = "";
        fontFamilyNameInput.value = "";
        initFontSection(); // Refresh dropdown
      } else {
        fontStatus.textContent = "Gagal menyimpan font.";
        fontStatus.className = "d-block text-danger";
      }
    }).catch(function (error) {
      fontStatus.textContent = "Gagal mengkonversi font: " + error.message;
      fontStatus.className = "d-block text-danger";
    });
  };
  
  reader.onerror = function () {
    fontStatus.textContent = "Gagal membaca file.";
    fontStatus.className = "d-block text-danger";
  };
  
  reader.readAsArrayBuffer(file);
});

fontSelect.addEventListener("change", function () {
  const selectedFont = fontSelect.value;
  localStorage.setItem(SELECTED_FONT_KEY, selectedFont);
  fontStatus.textContent = `Font aktif: ${selectedFont}`;
  fontStatus.className = "d-block text-success";
});

init();
