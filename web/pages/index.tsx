// Main web UI for Google Auth + Drive sync
import { useSession, signIn, signOut } from "next-auth/react";
import { useState } from "react";
import { exportHabitsToJson, importHabitsFromJson } from "../../shared/data-sync";

type LocalHabit = { name: string; completed?: boolean }

export default function Home() {
  const { data: session } = useSession();
  // Replace with your actual habit data source in production
  const [habits, setHabits] = useState<LocalHabit[]>([{ name: "Drink Water", completed: false }]);
  const [importedHabits, setImportedHabits] = useState<LocalHabit[]>([]);
  const [fileId, setFileId] = useState<string>("");
  const [status, setStatus] = useState<string>("");

  const handleExport = async () => {
    setStatus("Exporting...");
    try {
      const res = await fetch("/api/drive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ habits }),
      });
      if (!res.ok) throw new Error("Network error");
      const data = await res.json();
      if (data.fileId) {
        setFileId(data.fileId);
        setStatus("Exported to Drive. File ID: " + data.fileId);
      } else {
        setStatus("Export failed: " + (data.error || "Unknown error"));
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setStatus("Export failed: " + message);
    }
  };

  const handleImport = async () => {
    if (!fileId) {
      setStatus("No file ID. Export first or provide a file ID.");
      return;
    }
    setStatus("Importing...");
    try {
      const res = await fetch(`/api/drive?fileId=${fileId}`);
      if (!res.ok) throw new Error("Network error");
      const data = await res.json();
      if (data.habits) {
        setImportedHabits(data.habits);
        setStatus("Imported from Drive.");
      } else {
        setStatus("Import failed: " + (data.error || "Unknown error"));
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setStatus("Import failed: " + message);
    }
  };

  return (
    <div style={{ padding: 32, maxWidth: 480, margin: '0 auto' }}>
      <h1>Google Auth & Drive Sync</h1>
      {!session ? (
        <button onClick={() => signIn("google")}>Sign In with Google</button>
      ) : (
        <>
          <p>Signed in as <strong>{session.user?.name}</strong></p>
          <button onClick={() => signOut()}>Sign Out</button>
          <hr />
          <h2>Export Habits</h2>
          <button onClick={handleExport}>Export to Google Drive</button>
          <h2>Import Habits</h2>
          <button onClick={handleImport}>Import from Google Drive</button>
          <div style={{ marginTop: 16 }}>
            <strong>Status:</strong> <span>{status}</span>
          </div>
          <div style={{ marginTop: 16 }}>
            <strong>Imported Habits:</strong>
            <pre>{JSON.stringify(importedHabits, null, 2)}</pre>
          </div>
        </>
      )}
    </div>
  );
}
