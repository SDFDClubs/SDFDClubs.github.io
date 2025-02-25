document.addEventListener("DOMContentLoaded", function() {
    const inputField = document.getElementById("qrInput");
    const logoInput = document.getElementById("logoInput");
    const generateBtn = document.getElementById("btnGenerate");
    const downloadBtn = document.getElementById("btnDownload");
    const finalQRImg = document.getElementById("finalQR");
  
    // Hidden container to generate the raw QR code
    const hiddenQRContainer = document.createElement("div");
    hiddenQRContainer.style.visibility = "hidden";
    hiddenQRContainer.style.position = "absolute";
    hiddenQRContainer.style.left = "-9999px";
    document.body.appendChild(hiddenQRContainer);
  
    // We'll store the final data URL so we can let user download it
    let finalDataUrl = null;
  
    generateBtn.addEventListener("click", async function() {
      const text = inputField.value.trim();
      if (!text) {
        alert("Please enter some text or a URL.");
        return;
      }
  
      // Clear any existing content in hidden container
      hiddenQRContainer.innerHTML = "";
  
      // 1) Generate a bare QR code (256 x 256 px)
      new QRCode(hiddenQRContainer, {
        text: text,
        width: 256,
        height: 256,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
      });
  
      // Wait a bit for the library to render it
      await new Promise(r => setTimeout(r, 50));
  
      const canvas = hiddenQRContainer.querySelector("canvas");
      if (!canvas) {
        alert("Failed to generate QR code. No canvas found.");
        return;
      }
  
      // If no logo selected, just use the raw QR canvas
      if (!logoInput.files || logoInput.files.length === 0) {
        finalDataUrl = canvas.toDataURL("image/png");
        finalQRImg.src = finalDataUrl;
        downloadBtn.disabled = false;
        return;
      }
  
      // There is a logo file
      try {
        const file = logoInput.files[0];
        const logoImg = await loadImageFile(file);
  
        // Create a new canvas to combine QR + logo
        const combinedCanvas = document.createElement("canvas");
        combinedCanvas.width = canvas.width;
        combinedCanvas.height = canvas.height;
        const ctx = combinedCanvas.getContext("2d");
  
        // Draw the QR code
        ctx.drawImage(canvas, 0, 0);
  
        // Calculate a suitable logo size
        const logoSize = Math.floor(canvas.width * 0.25); // e.g. 25% of QR width
        const x = (canvas.width - logoSize) / 2;
        const y = (canvas.height - logoSize) / 2;
        ctx.drawImage(logoImg, x, y, logoSize, logoSize);
  
        finalDataUrl = combinedCanvas.toDataURL("image/png");
        finalQRImg.src = finalDataUrl;
        downloadBtn.disabled = false;
        
      } catch (err) {
        console.error(err);
        alert("Failed to load or overlay logo image.");
      }
    });
  
    // Handle the Download button
    downloadBtn.addEventListener("click", function() {
      if (!finalDataUrl) {
        alert("No QR code to download yet!");
        return;
      }
      // Create a link element and trigger a download
      const a = document.createElement("a");
      a.href = finalDataUrl;
      a.download = "qr_code.png";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    });
  
    /**
     * Utility function: returns a Promise that resolves with
     * an <img> element once the File (from <input type="file">) is loaded.
     */
    function loadImageFile(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function(e) {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = (err) => reject(err);
          img.src = e.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    }
  });
  