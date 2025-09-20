export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get('url');

  if (!url) {
    return new Response(JSON.stringify({ error: 'URL tidak ditemukan.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const apiRes = await fetch(`https://api.sxtream.xyz/downloader/aio-v2?url=${encodeURIComponent(url)}`);
    const data = await apiRes.json();

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Gagal mengambil data dari API.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
