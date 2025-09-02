const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const nameInput = document.getElementById("name");
const downloadBtn = document.getElementById("download-btn");

const image = new Image();
const STORAGE_KEY = "customBackgroundDataUrl";
const storedBg = (function () {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch (_) {
    return null;
  }
})();
image.src = storedBg || "design.png";
let imageLoaded = false;

// Disable download until ready
downloadBtn.disabled = true;
downloadBtn.setAttribute("aria-disabled", "true");

image.onload = function () {
  imageLoaded = true;
  if (document.fonts && document.fonts.load) {
    document.fonts
      .load("55px ara hamah kilania")
      .catch(function () {})
      .finally(function () {
        drawImage();
        downloadBtn.disabled = false;
        downloadBtn.setAttribute("aria-disabled", "false");
      });
  } else {
    drawImage();
    downloadBtn.disabled = false;
    downloadBtn.setAttribute("aria-disabled", "false");
  }
};

function drawImage() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

  const text =
    nameInput.value && nameInput.value.trim() !== ""
      ? nameInput.value.trim()
      : "Nama Anda";

  // Auto-fit font size based on available width
  const maxFontSize = 90; // px
  const minFontSize = 32; // px
  const targetWidth = canvas.width * 0.75; // 75% of canvas width
  let fontSize = maxFontSize;

  ctx.textBaseline = "middle";
  ctx.textAlign = "center";
  ctx.fillStyle = "#F6F6F6";

  while (fontSize > minFontSize) {
    ctx.font = fontSize + "px ara hamah kilania";
    const measuredWidth = ctx.measureText(text).width;
    if (measuredWidth <= targetWidth) break;
    fontSize -= 2;
  }

  ctx.font = fontSize + "px ara hamah kilania";
  ctx.fillText(text, canvas.width / 2, 840);
}

nameInput.addEventListener("input", function () {
  if (!imageLoaded) return;
  drawImage();
});

downloadBtn.addEventListener("click", download);

function download() {
  if (!imageLoaded) return;

  const safeName =
    nameInput.value && nameInput.value.trim()
      ? nameInput.value.trim()
      : "Nama Anda";
  const filename = "Greeting Card - " + safeName + ".png";

  if (canvas.toBlob) {
    canvas.toBlob(function (blob) {
      if (!blob) {
        fallbackDownload();
        return;
      }
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, "image/png");
  } else {
    fallbackDownload();
  }

  function fallbackDownload() {
    const dataUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

//downloadBtn.addEventListener("click", function () {
//downloadBtn.href = canvas.toDataURL("image/png", 1);
//downloadBtn.download = "Ied Greeting Card - " + nameInput.value;
// console.log(downloadBtn.href);
//downloadBtn.click();
//});
