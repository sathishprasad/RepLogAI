"use client";

export function VideoSection() {
  return (
    <section id="demo" className="py-28 bg-[#0B0F17] text-white border-y border-white/10">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="text-center mb-12">
          <p className="text-xs font-bold uppercase tracking-widest text-primary mb-3">See It In Action</p>
          <p className="text-gray-400 text-lg">From voice note to CRM update in under 10 seconds.</p>
        </div>

        <div className="relative mx-auto max-w-4xl">
          <div className="relative rounded-xl border border-white/10 bg-[#161B26] p-2 shadow-[0_0_60px_rgba(79,124,255,0.1)]">
            <div className="flex items-center gap-2 px-3 py-2 border-b border-white/10">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <div className="flex-1 text-center">
                <span className="text-xs text-gray-500 font-mono">replog.ai</span>
              </div>
            </div>
            <video
              autoPlay
              muted
              loop
              playsInline
              className="w-full rounded-b-lg"
              src="/replog-demo.mov"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
