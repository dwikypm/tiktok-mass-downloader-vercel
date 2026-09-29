"use client";

import { useMemo, useState } from "react";

export default function Home() {
  const [text, setText] = useState("");
  const [urls, setUrls] = useState<string[]>([]);
  const [selected, setSelected] = useState<boolean[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const parsedUrls = useMemo(() => {
    return text
      .split(/\r?\n/)
      .map((x) => x.trim())
      .filter(Boolean);
  }, [text]);

  function processUrls() {
    const unique = [...new Set(parsedUrls)];

    const valid = unique.filter((url) => {
      try {
        const u = new URL(url);
        return u.protocol === "http:" || u.protocol === "https:";
      } catch {
        return false;
      }
    });

    setUrls(valid);
    setSelected(valid.map(() => true));

    setMessage(
      valid.length
        ? `${valid.length} URL siap diproses.`
        : "Tidak ada URL yang valid."
    );
  }

  function toggle(index: number) {
    setSelected((current) =>
      current.map((value, i) => (i === index ? !value : value))
    );
  }

  async function downloadAll() {
    const selectedUrls = urls.filter((_, index) => selected[index]);

    if (!selectedUrls.length) {
      setMessage("Pilih minimal satu video.");
      return;
    }

    setLoading(true);
    setMessage("Menyiapkan download...");

    try {
      const response = await fetch("/api/download", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          urls: selectedUrls,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error || "Download gagal.");
      }

      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = "tiktok-mass-download.zip";
      document.body.appendChild(a);
      a.click();
      a.remove();

      URL.revokeObjectURL(downloadUrl);

      setMessage(`${selectedUrls.length} file selesai diproses.`);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Terjadi kesalahan."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="container">
      <section className="card">
        <div className="header">
          <div className="logo">▶</div>

          <div>
            <h1>TikTok Mass Downloader</h1>
            <p>Bulk video downloader tanpa login</p>
          </div>
        </div>

        <div className="notice">
          Masukkan URL media langsung yang dapat diakses dan kamu berhak
          mengunduhnya. Aplikasi ini tidak meminta login TikTok.
        </div>

        <label>URL Video</label>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={`https://example.com/video1.mp4
https://example.com/video2.mp4
https://example.com/video3.mp4`}
        />

        <button className="primary" onClick={processUrls}>
          PROSES URL
        </button>

        {message && <div className="message">{message}</div>}

        {urls.length > 0 && (
          <section className="results">
            <div className="resultsHeader">
              <strong>{urls.length} Video</strong>

              <button
                className="download"
                onClick={downloadAll}
                disabled={loading}
              >
                {loading ? "MEMPROSES..." : "DOWNLOAD SEMUA"}
              </button>
            </div>

            {urls.map((url, index) => (
              <div className="item" key={`${url}-${index}`}>
                <input
                  type="checkbox"
                  checked={selected[index] ?? false}
                  onChange={() => toggle(index)}
                />

                <div className="itemText">
                  <strong>Video {index + 1}</strong>
                  <span>{url}</span>
                </div>
              </div>
            ))}
          </section>
        )}

        <footer>
          Tidak membutuhkan TikTok Login • Tidak membutuhkan Client Key
        </footer>
      </section>
    </main>
  );
}
