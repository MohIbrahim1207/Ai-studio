import { useMemo, useState } from "react";

const API_BASE_RAW = import.meta.env.VITE_API_BASE_URL || "/api";
const API_BASE = API_BASE_RAW.endsWith("/") ? API_BASE_RAW.slice(0, -1) : API_BASE_RAW;

const initialForm = {
  brief: "Create a 20 second Instagram ad for a beard growth oil targeting men 20-35",
  productName: "",
  audience: "",
  platform: "Instagram Reels",
  tone: "testimonial",
  duration: 20
};

function JsonCard({ title, data }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-black/25 p-4 shadow-glow">
      <p className="mb-2 text-xs uppercase tracking-[0.24em] text-studio-cyan/90">{title}</p>
      <pre className="max-h-72 overflow-auto rounded-xl bg-black/45 p-3 text-xs leading-5 text-slate-100">
        {JSON.stringify(data, null, 2)}
      </pre>
    </section>
  );
}

export default function App() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const canGenerate = useMemo(() => form.brief.trim().length > 8, [form.brief]);

  const onField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const generateAd = async () => {
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const response = await fetch(`${API_BASE}/generate-all`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json?.error || "Failed to generate ad");
      setResult(json);
    } catch (err) {
      setError(err.message || "Unexpected error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 py-8 md:px-8">
      <header className="mb-8 rounded-3xl border border-studio-cyan/40 bg-black/30 p-6 shadow-glow backdrop-blur">
        <p className="text-xs uppercase tracking-[0.3em] text-studio-peach">D2C Creative Automation</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white md:text-5xl">AI Ad Studio</h1>
        <p className="mt-3 max-w-3xl text-sm text-slate-200/80 md:text-base">
          Generate a 15-30 second high-converting ad from a one-line brief with script, scenes, voiceover, and final MP4 export.
        </p>
      </header>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <div className="rounded-3xl border border-white/10 bg-black/25 p-5 shadow-glow">
          <label className="text-sm font-semibold text-slate-100">Ad Brief</label>
          <textarea
            className="mt-2 h-32 w-full rounded-xl border border-white/20 bg-studio-steel/70 p-3 text-sm text-white outline-none ring-studio-cyan/50 transition focus:ring-2"
            value={form.brief}
            onChange={(e) => onField("brief", e.target.value)}
            placeholder="Describe your ad in one sentence..."
          />

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <input
              className="rounded-xl border border-white/20 bg-studio-steel/70 p-2.5 text-sm text-white"
              placeholder="Product name (optional)"
              value={form.productName}
              onChange={(e) => onField("productName", e.target.value)}
            />
            <input
              className="rounded-xl border border-white/20 bg-studio-steel/70 p-2.5 text-sm text-white"
              placeholder="Audience (optional)"
              value={form.audience}
              onChange={(e) => onField("audience", e.target.value)}
            />
            <select
              className="rounded-xl border border-white/20 bg-studio-steel/70 p-2.5 text-sm text-white"
              value={form.platform}
              onChange={(e) => onField("platform", e.target.value)}
            >
              <option>Instagram Reels</option>
              <option>YouTube Shorts</option>
              <option>Facebook</option>
            </select>
            <select
              className="rounded-xl border border-white/20 bg-studio-steel/70 p-2.5 text-sm text-white"
              value={form.tone}
              onChange={(e) => onField("tone", e.target.value)}
            >
              <option>funny</option>
              <option>emotional</option>
              <option>testimonial</option>
            </select>
            <input
              type="number"
              min={15}
              max={30}
              className="rounded-xl border border-white/20 bg-studio-steel/70 p-2.5 text-sm text-white sm:col-span-2"
              value={form.duration}
              onChange={(e) => onField("duration", Number(e.target.value))}
            />
          </div>

          <button
            disabled={loading || !canGenerate}
            onClick={generateAd}
            className="mt-5 w-full rounded-xl bg-gradient-to-r from-studio-cyan to-teal-400 px-4 py-3 text-sm font-semibold text-slate-950 transition enabled:hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-45"
          >
            {loading ? "Generating Ad..." : "Generate Ad"}
          </button>

          {error ? <p className="mt-3 text-sm text-red-300">{error}</p> : null}
        </div>

        <div className="rounded-3xl border border-white/10 bg-black/25 p-5 shadow-glow">
          <p className="text-xs uppercase tracking-[0.25em] text-studio-cyan">Preview</p>
          {result?.videoUrl ? (
            <>
              <video
                className="mt-3 w-full rounded-2xl border border-white/10 bg-black"
                controls
                src={result.videoUrl}
              />
              <a
                className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-studio-peach px-4 py-2.5 text-sm font-semibold text-slate-950"
                href={result.videoUrl}
                download
              >
                Download MP4
              </a>
            </>
          ) : (
            <div className="mt-4 rounded-2xl border border-dashed border-white/20 p-6 text-sm text-slate-200/70">
              Video preview appears here after generation.
            </div>
          )}
        </div>
      </section>

      {result ? (
        <section className="mt-6 grid gap-4 lg:grid-cols-3">
          <JsonCard title="Parsed Brief" data={result.parsedBrief} />
          <JsonCard title="Script" data={result.script} />
          <JsonCard title="Scenes" data={result.scenes} />
        </section>
      ) : null}
    </main>
  );
}
