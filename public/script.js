document.addEventListener('DOMContentLoaded', () => {
    // Cache DOM elements
    const elements = {
        downloadBtn: document.getElementById('downloadBtn'),
        urlInput: document.getElementById('urlInput'),
        loader: document.querySelector('.loader'),
        messageSection: document.getElementById('messageSection'),
        messageText: document.getElementById('messageText'),
        resetBtn: document.getElementById('resetBtn'),
    };

    // Event listeners
    elements.downloadBtn.addEventListener('click', handleDownload);
    elements.urlInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleDownload();
    });
    elements.resetBtn.addEventListener('click', resetApp);

    /** Handles video download */
    async function handleDownload() {
        const url = elements.urlInput.value.trim();

        if (!url || !isValidUrl(url)) {
            showMessage('Silakan masukkan tautan video yang valid.', 'error');
            return;
        }

        resetUI();
        setLoadingState(true);

        try {
            const response = await fetch(`/api/downloader?url=${encodeURIComponent(url)}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            if (data.error) {
                showMessage(data.error, 'error');
                return;
            }

            // Arahkan ke halaman hasil di tab yang sama
            const encodedData = btoa(JSON.stringify(data.result));
            const resultUrl = `/result.html?data=${encodedData}`;
            window.location.href = resultUrl;

        } catch (error) {
            console.error('Error fetching data:', error);
            showMessage('Terjadi kesalahan jaringan. Pastikan koneksi internet Anda stabil.', 'error');
        } finally {
            setLoadingState(false);
        }
    }

    /** Valid URL check */
    function isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch {
            return false;
        }
    }

    /** Toggle loading state */
    function setLoadingState(isLoading) {
        elements.loader.style.display = isLoading ? 'block' : 'none';
        elements.downloadBtn.disabled = isLoading;
        elements.downloadBtn.textContent = isLoading ? 'Memproses...' : 'Unduh';
        elements.resetBtn.disabled = isLoading;
    }

    /** Show messages */
    function showMessage(message, type = 'info') {
        elements.messageText.textContent = message;
        elements.messageSection.style.display = 'block';
        elements.messageSection.className = `message-section message-${type} show`;
    }

    /** Reset UI sections */
    function resetUI() {
        elements.messageSection.classList.remove('show');
        elements.messageSection.style.display = 'none';
    }

    /** Reset app state */
    function resetApp() {
        elements.urlInput.value = '';
        resetUI();
        setLoadingState(false);
        elements.urlInput.focus();
    }
});
            
