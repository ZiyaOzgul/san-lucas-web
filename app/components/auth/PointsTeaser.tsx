"use client";

export function PointsTeaser() {
  return (
    <div className="bg-brand/10 border border-brand/30 rounded-2xl p-4 flex items-start gap-3">
      <div className="w-9 h-9 rounded-full bg-brand flex items-center justify-center shrink-0">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m12 3 1.9 5.9H20l-5.05 3.66L17 18.5 12 14.84 7 18.5l1.9-5.95L4 8.9h6.1Z" />
        </svg>
      </div>
      <div className="flex-1">
        <p className="text-xs font-bold tracking-wider uppercase text-brand">
          San Lucas Puanı
        </p>
        <p className="text-xs text-text/70 mt-1 leading-snug">
          Giriş yapıp sipariş ver, her üründen{" "}
          <span className="font-bold text-text">San Lucas Puanı</span> kazan.
          Puanlarınla sonraki siparişinde indirim avantajı yakala.
        </p>
      </div>
    </div>
  );
}
