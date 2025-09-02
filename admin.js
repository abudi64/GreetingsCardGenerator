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

const STORAGE_KEY = "customBackgroundDataUrl";
const AUTH_KEY = "adminPasswordHash";
const SESSION_KEY = "adminSession";
const DEFAULT_PASSWORD = "admin123";
const DEFAULT_HINT =
  "Belum ada gambar custom. Gunakan tombol Simpan untuk menerapkan.";

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
    return localStorage.getItem(SESSION_KEY) === "1";
  } catch (_) {
    return false;
  }
}

function setLoggedIn(value) {
  try {
    if (value) localStorage.setItem(SESSION_KEY, "1");
    else localStorage.removeItem(SESSION_KEY);
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

function init() {
  if (isLoggedIn()) {
    showDashboard();
    initBackgroundSection();
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

init();
