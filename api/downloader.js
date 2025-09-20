export const config = { runtime: "edge" };

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
    // Panggil API pihak ketiga
    const apiRes = await fetch(`https://api.siputzx.my.id/api/d/tiktok/v2?url=${encodeURIComponent(url)}`);
    if (!apiRes.ok) {
      const text = await apiRes.text();
      console.error("API error:", text);
      return new Response(JSON.stringify({ error: "Gagal memuat data dari API pihak ketiga." }), {
        status: 502,
        headers: { "Content-Type": "application/json" },
      });
    }

    const data = await apiRes.json();

    if (!data.status || !data.download_urls) {
      return new Response(JSON.stringify({ error: "Data video tidak valid. Periksa URL." }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Buat link HD dan audio
    const hdUrl = data.download_urls.find(l => l.includes("nowatermark")) || null;
    const audioUrl = data.download_urls.find(l => l.includes("music")) || null;

    const downloadLinks = [];
    if (hdUrl) downloadLinks.push({ quality: "HD", url: `/api/download?url=${encodeURIComponent(hdUrl)}` });
    if (audioUrl) downloadLinks.push({ quality: "audio", url: `/api/download?url=${encodeURIComponent(audioUrl)}` });

    const formattedData = {
      result: {
        title: data.video_info.title || "Video Tanpa Judul",
        thumbnail: data.video_info.cover || "",
        author: { nickname: data.video_info.author_name || "Tidak Diketahui" },
        links: downloadLinks,
      },
    };

    return new Response(JSON.stringify(formattedData), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("Server error:", err);
    return new Response(JSON.stringify({ error: "Terjadi kesalahan server. Coba lagi." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
        }
