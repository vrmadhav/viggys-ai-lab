"use client";

import { useEffect } from "react";

// Catches errors thrown in the root layout itself. Must render its own
// <html>/<body>; globals.css is not guaranteed to be applied here, so the
// shell is styled inline to stay self-contained.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#101018",
          color: "#f5f5fa",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
        }}
      >
        <div style={{ maxWidth: 420, padding: 32, textAlign: "center" }}>
          <h1 style={{ fontSize: 20, fontWeight: 600 }}>Something broke</h1>
          <p style={{ marginTop: 8, fontSize: 14, opacity: 0.7 }}>
            The app failed to load. Try again.
          </p>
          <button
            onClick={() => reset()}
            style={{
              marginTop: 24,
              padding: "8px 16px",
              borderRadius: 8,
              border: "none",
              cursor: "pointer",
              background: "linear-gradient(90deg, #8b5cf6, #22d3ee)",
              color: "#101018",
              fontWeight: 500,
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
