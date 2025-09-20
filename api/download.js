// File: api/download.js
export const config = {
  runtime: "edge",
};

export default async function handler(req) {
  const { searchParams } = new URL(req.url);
  const videoUrl = searchParams.get('url');

  if (!videoUrl) {
    return new Response('URL video tidak ditemukan.', { status: 400 });
  }

  try {
    const response = await fetch(videoUrl);

    if (!response.ok) {
      return new Response(`Gagal mengunduh file. Status: ${response.status}`, { status: response.status });
    }

    // Mendapatkan nama file dari URL
    const filename = videoUrl.split('/').pop().split('?')[0];

    // Mengembalikan respons dengan video sebagai stream
    return new Response(response.body, {
      headers: {
        'Content-Type': 'video/mp4',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });

  } catch (error) {
    return new Response('Terjadi kesalahan saat mengunduh video.', { status: 500 });
  }
}
