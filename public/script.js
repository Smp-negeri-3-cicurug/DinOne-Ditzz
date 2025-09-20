document.addEventListener("DOMContentLoaded", () => {
  const elements = {
    downloadBtn: document.getElementById("downloadBtn"),
    urlInput: document.getElementById("urlInput"),
    loader: document.querySelector(".loader"),
    messageSection: document.getElementById("messageSection"),
    messageText: document.getElementById("messageText"),
    resetBtn: document.getElementById("resetBtn"),
  };

  elements.downloadBtn.addEventListener("click", handleDownload);
  elements.urlInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") handleDownload();
  });
  elements.resetBtn.addEventListener("click", resetApp);

  async function handleDownload() {
    const url = elements.urlInput.value.trim();
    if (!url || !isValidUrl(url)) {
      showMessage("Silakan masukkan tautan video yang valid.", "error");
      return;
    }

    resetUI();
    setLoadingState(true);

    try {
      const response = await fetch(`/api/downloader?url=${encodeURIComponent(url)}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      if (data.error) {
        showMessage(data.error, "error");
        return;
      }

      // Simpan hasil ke localStorage lalu redirect
      localStorage.setItem("downloadResult", JSON.stringify(data.result));
      window.location.href = "/result.html";
    } catch (err) {
      console.error("Fetch error:", err);
      showMessage("Terjadi kesalahan jaringan. Pastikan koneksi internet stabil.", "error");
    } finally {
      setLoadingState(false);
    }
  }

  function isValidUrl(str) {
    try {
      new URL(str);
      return true;
    } catch {
      return false;
    }
  }

  function setLoadingState(isLoading) {
    elements.loader.style.display = isLoading ? "block" : "none";
    elements.downloadBtn.disabled = isLoading;
    elements.downloadBtn.textContent = isLoading ? "Memproses..." : "Unduh";
    elements.resetBtn.disabled = isLoading;
  }

  function showMessage(msg, type="info") {
    elements.messageText.textContent = msg;
    elements.messageSection.style.display = "block";
    elements.messageSection.className = `message-section message-${type} show`;
  }

  function resetUI() {
    elements.messageSection.classList.remove("show");
    elements.messageSection.style.display = "none";
  }

  function resetApp() {
    elements.urlInput.value = "";
    resetUI();
    setLoadingState(false);
    elements.urlInput.focus();
  }
});
