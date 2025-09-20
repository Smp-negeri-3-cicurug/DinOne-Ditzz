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
    const apiRes = await fetch(`https://api.siputzx.my.id/api/d/tiktok/v2?url=${encodeURIComponent(url)}`);

    if (!apiRes.ok) {
        const apiErrorText = await apiRes.text();
        console.error("API error response:", apiErrorText);
        return new Response(JSON.stringify({ error: "Gagal dari API pihak ketiga. Silakan coba tautan lain." }), {
            status: apiRes.status,
            headers: { "Content-Type": "application/json" },
        });
    }
    
    const data = await apiRes.json();

    if (!data.status || !data.download_urls) {
        return new Response(JSON.stringify({ error: "API tidak mengembalikan data video yang valid. Pastikan tautan benar." }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
    
    const downloadLinks = [
        { quality: 'HD', url: `/api/download?url=${encodeURIComponent(data.download_urls.find(l => l.includes('nowatermark')))}` },
        { quality: 'audio', url: `/api/download?url=${encodeURIComponent(data.download_urls.find(l => l.includes('music')))}` }
    ];

    const formattedData = {
        result: {
            title: data.video_info.title,
            thumbnail: data.video_info.cover,
            author: {
              nickname: data.video_info.author_name
            },
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
  
