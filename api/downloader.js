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
        const apiErrorText = await apiRes.text();
        console.error("API error response:", apiErrorText);
        return new Response(JSON.stringify({ error: "Gagal dari API pihak ketiga. Silakan coba tautan lain." }), {
            status: apiRes.status,
            headers: { "Content-Type": "application/json" },
        });
    }
    
    const data = await apiRes.json();

    if (!data.result || !data.result.data || data.result.data.length === 0) {
        return new Response(JSON.stringify({ error: "API tidak mengembalikan data video yang valid. Pastikan tautan benar." }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
    
    // Perbarui logika untuk membuat URL unduhan yang mengarah ke proxy Anda
    const downloadLinks = [
        { quality: 'HD', url: `/api/download?url=${encodeURIComponent(data.result.data.find(l => l.type === 'nowatermark_hd')?.url)}` },
        { quality: 'SD', url: `/api/download?url=${encodeURIComponent(data.result.data.find(l => l.type === 'nowatermark')?.url)}` },
        { quality: 'audio', url: `/api/download?url=${encodeURIComponent(data.result.music_info?.url)}` }
    ];

    const formattedData = {
        result: {
            title: data.result.title,
            thumbnail: data.result.cover,
            author: data.result.author,
            links: downloadLinks
        }
    };

    return new Response(JSON.stringify(formattedData), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("Kesalahan saat memproses permintaan:", err);
    return new Response(JSON.stringify({ error: "Terjadi kesalahan server saat memproses permintaan. Coba lagi." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
  
