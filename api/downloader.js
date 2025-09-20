// File: backend/api/downloader.js
export const config = {
  runtime: "edge",
};

export default async function handler(req) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url");

  if (!url) {
    return new Response(JSON.stringify({ error: "URL tidak ditemukan" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    // Perbarui URL API ke endpoint TikTok yang baru
    const apiRes = await fetch(`https://api.sxtream.xyz/downloader/tiktok?url=${encodeURIComponent(url)}`);
    const data = await apiRes.json();

    // Sekarang, Anda harus mengembalikan data yang diformat agar sesuai dengan frontend
    // Frontend Anda mengharapkan 'data' yang berisi 'links', bukan 'result'
    // Jadi, kita perlu memformat ulang responsnya
    const formattedData = {
      result: {
        title: data.result.title,
        thumbnail: data.result.cover,
        author: data.result.author,
        links: [
          { quality: 'HD', url: data.result.data.find(l => l.type === 'nowatermark_hd')?.url },
          { quality: 'SD', url: data.result.data.find(l => l.type === 'nowatermark')?.url },
          { quality: 'audio', url: data.result.music_info?.url }
        ]
      }
    };

    return new Response(JSON.stringify(formattedData), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Gagal memproses video. Pastikan tautan benar." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
  
