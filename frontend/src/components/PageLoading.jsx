// Komponen loading page yang konsisten untuk semua halaman

export default function PageLoading() {
  return (
    <>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg) }
          to   { transform: rotate(360deg) }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1 }
          50%       { opacity: 0.4 }
        }
        .page-loading-wrap {
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          height: 100vh; background: #0a0a0a; gap: 24px;
        }
        .pl-logo-ring {
          position: relative; width: 64px; height: 64px;
        }
        .pl-ring {
          position: absolute; inset: 0;
          border: 3px solid rgba(230,57,70,0.15);
          border-top-color: #e63946;
          border-radius: 50%;
          animation: spin 0.9s linear infinite;
        }
        .pl-ring-2 {
          position: absolute; inset: 8px;
          border: 2px solid rgba(230,57,70,0.08);
          border-bottom-color: #e63946;
          border-radius: 50%;
          animation: spin 1.4s linear infinite reverse;
        }
        .pl-logo-inner {
          position: absolute; inset: 0;
          display: flex; align-items: center; justify-content: center;
        }
        .pl-logo-inner img {
          width: 28px; height: 28px; object-fit: contain;
          animation: pulse 1.5s ease-in-out infinite;
        }
        .pl-text {
          font-family: 'Orbitron', sans-serif;
          font-size: 0.7rem; font-weight: 900;
          letter-spacing: 4px; color: #333;
          animation: pulse 1.5s ease-in-out infinite;
        }
        .pl-dots {
          display: flex; gap: 6px;
        }
        .pl-dot {
          width: 4px; height: 4px; border-radius: 50%;
          background: #e63946;
          animation: pulse 1.2s ease-in-out infinite;
        }
        .pl-dot:nth-child(2) { animation-delay: 0.2s; }
        .pl-dot:nth-child(3) { animation-delay: 0.4s; }
      `}</style>

      <div className="page-loading-wrap">
        <div className="pl-logo-ring">
          <div className="pl-ring"/>
          <div className="pl-ring-2"/>
          <div className="pl-logo-inner">
            <img src="/Logo.png" alt="loading"/>
          </div>
        </div>
        <div className="pl-text">LOADING</div>
        <div className="pl-dots">
          <div className="pl-dot"/>
          <div className="pl-dot"/>
          <div className="pl-dot"/>
        </div>
      </div>
    </>
  )
}