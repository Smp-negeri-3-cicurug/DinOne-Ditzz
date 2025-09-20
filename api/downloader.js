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
        // Handle API errors gracefully, returning a user-friendly message
        const apiErrorText = await apiRes.text();
        console.error("API error response:", apiErrorText);
        return new Response(JSON.stringify({ error: `Gagal dari API pihak ketiga. Status: ${apiRes.status}` }), {
            status: apiRes.status,
            headers: { "Content-Type": "application/json" },
        });
    }
    
    const data = await apiRes.json();

    // Pastikan properti 'result' ada dan bukan null
    if (!data.result) {
        return new Response(JSON.stringify({ error: "API tidak mengembalikan data video yang valid." }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
    
    // Format data agar sesuai dengan frontend Anda
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
    console.error("Kesalahan saat memproses permintaan:", err);
    return new Response(JSON.stringify({ error: "Terjadi kesalahan server. Coba lagi nanti." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
