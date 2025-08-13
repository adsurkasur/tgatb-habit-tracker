"use client";
import React from "react";

type Props = { children: React.ReactNode };

export function FirebaseErrorBoundary({ children }: Props) {
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    const handler = (event: ErrorEvent) => {
      if (event.error && event.error.message.includes("Firebase configuration error")) {
        setError(event.error);
      }
    };
    window.addEventListener("error", handler);
    return () => window.removeEventListener("error", handler);
  }, []);

  if (error) {
    return (
      <div style={{ padding: "2rem", textAlign: "center", color: "#b91c1c", background: "#fff0f0" }}>
        <h2>⚠️ Firebase Configuration Error</h2>
        <p>{error.message}</p>
        <p>Please check your .env or build configuration and try again.</p>
      </div>
    );
  }
  return <>{children}</>;
}
