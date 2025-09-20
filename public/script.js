document.addEventListener('DOMContentLoaded', () => {
    // Cache DOM elements
    const elements = {
        downloadBtn: document.getElementById('downloadBtn'),
        urlInput: document.getElementById('urlInput'),
        loader: document.querySelector('.loader'),
        resultSection: document.getElementById('resultSection'),
        videoThumbnail: document.getElementById('videoThumbnail'),
        videoTitle: document.getElementById('videoTitle'),
        videoAuthor: document.getElementById('videoAuthor'),
        downloadLinks: document.getElementById('downloadLinks'),
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

    /** Escape text untuk mencegah XSS */
    function safeText(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

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

            displayVideoInfo(data);
            displayDownloadLinks(data.links);

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
        elements.resultSection.classList.remove('show');
    }

    /** Reset UI sections */
    function resetUI() {
        elements.resultSection.classList.remove('show');
        elements.messageSection.classList.remove('show');
        elements.resultSection.style.display = 'none';
        elements.messageSection.style.display = 'none';
    }

    /** Reset app state */
    function resetApp() {
        elements.urlInput.value = '';
        resetUI();
        setLoadingState(false);
        elements.urlInput.focus(); // fokus lagi biar langsung bisa paste
    }

    /** Show video info */
    function displayVideoInfo(data) {
        elements.videoThumbnail.src = data.thumbnail || 'placeholder.jpg';
        elements.videoTitle.innerHTML = safeText(data.title || 'Video Tanpa Judul');
        elements.videoAuthor.innerHTML = safeText(data.author || '');
        elements.resultSection.style.display = 'block';
        elements.resultSection.classList.add('show');
    }

    /** Generate download links */
    function displayDownloadLinks(links) {
        elements.downloadLinks.innerHTML = '';
        if (links && links.length > 0) {
            links.forEach(link => {
                const a = document.createElement('a');
                a.href = link.url;
                a.textContent = link.quality || 'Unduh';
                a.className = 'btn btn-secondary download-link';
                a.target = '_blank';
                a.rel = 'noopener noreferrer';
                elements.downloadLinks.appendChild(a);
            });
        } else {
            elements.downloadLinks.innerHTML = '<p class="text-muted">Tidak ada tautan unduhan yang ditemukan.</p>';
        }
    }
});