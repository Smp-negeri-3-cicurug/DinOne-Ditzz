// File: api/downloader.js
export const config = {
  runtime: "edge",
};

export default async function handler(req) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url");

  if (!url) {
    return new Response(JSON.stringify({ error: "URL tidak ditemukan." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const apiRes = await fetch(`https://api.sxtream.xyz/downloader/tiktok?url=${encodeURIComponent(url)}`);
    if (!apiRes.ok) {
      return new Response(JSON.stringify({ error: "Gagal dari API pihak ketiga." }), {
        status: apiRes.status,
        headers: { "Content-Type": "application/json" },
      });
    }

    const data = await apiRes.json();

    if (!data.result) {
      return new Response(JSON.stringify({ error: "Data video tidak valid. Pastikan link benar." }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const video = data.result;

    // Buat list download links dengan ukuran file
    const downloadLinks = [];

    if (video.data && Array.isArray(video.data)) {
      const sd = video.data.find(l => l.type === "nowatermark");
      const hd = video.data.find(l => l.type === "nowatermark_hd");

      if (sd) downloadLinks.push({ quality: "SD", url: `/api/download?url=${encodeURIComponent(sd.url)}`, size: formatBytes(video.size_nowm) });
      if (hd) downloadLinks.push({ quality: "HD", url: `/api/download?url=${encodeURIComponent(hd.url)}`, size: formatBytes(video.size_nowm_hd) });
    }

    if (video.music_info && video.music_info.url) {
      downloadLinks.push({ quality: "Audio", url: `/api/download?url=${encodeURIComponent(video.music_info.url)}`, size: "Unknown" });
    }

    const formattedData = {
      result: {
        title: video.title || "Video tanpa judul",
        thumbnail: video.cover || "",
        author: {
          nickname: video.author?.nickname || "Unknown",
        },
        links: downloadLinks
      }
    };

    return new Response(JSON.stringify(formattedData), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("Error saat memproses permintaan:", err);
    return new Response(JSON.stringify({ error: "Terjadi kesalahan server. Coba lagi." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// Fungsi helper untuk convert bytes ke KB / MB
function formatBytes(bytes, decimals = 2) {
  if (!bytes) return "0 KB";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}
