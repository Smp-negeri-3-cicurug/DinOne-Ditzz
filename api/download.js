// File: api/download.js
export const config = {
  runtime: "edge",
};

export default async function handler(req) {
  const { searchParams } = new URL(req.url);
  const fileUrl = searchParams.get("url");

  if (!fileUrl) {
    return new Response("URL file tidak ditemukan.", { status: 400 });
  }

  try {
    // Tambahkan timeout untuk keamanan (10 detik)
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(fileUrl, { signal: controller.signal });
    clearTimeout(timeout);

    if (!response.ok) {
      return new Response(`Gagal mengunduh file. Status: ${response.status}`, { status: response.status });
    }

    // Tentukan nama file dengan fallback
    let filename = "download";
    try {
      filename = new URL(fileUrl).pathname.split("/").pop() || "download";
    } catch (e) {
      console.warn("Gagal parsing nama file, fallback ke 'download'");
    }

    // Tentukan content-type dengan fallback
    const contentType = response.headers.get("content-type") || "application/octet-stream";

    return new Response(response.body, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Kesalahan saat mengunduh:", error);
    return new Response("Terjadi kesalahan saat mengunduh file.", { status: 500 });
  }
                   }
