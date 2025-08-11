// Main web UI for Google Auth + Drive sync
import { useSession, signIn, signOut } from "next-auth/react";
import { useState } from "react";
import { exportHabitsToJson, importHabitsFromJson } from "../../shared/data-sync";

export default function Home() {
  const { data: session } = useSession();
  const [habits, setHabits] = useState<any[]>([]);
  const [importedHabits, setImportedHabits] = useState<any[]>([]);
  const [fileId, setFileId] = useState<string>("");
  const [status, setStatus] = useState<string>("");

  const handleExport = async () => {
    setStatus("Exporting...");
    try {
      // Example habit data
      const habitsToExport = habits.length ? habits : [{ name: "Drink Water", completed: false }];
      const res = await fetch("/api/drive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ habits: habitsToExport }),
      });
      if (!res.ok) throw new Error("Network error");
      const data = await res.json();
      if (data.fileId) {
        setFileId(data.fileId);
        setStatus("Exported to Drive. File ID: " + data.fileId);
      } else {
        setStatus("Export failed: " + (data.error || "Unknown error"));
      }
    } catch (err: any) {
      setStatus("Export failed: " + err.message);
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
    } catch (err: any) {
      setStatus("Import failed: " + err.message);
    }
  };

  return (
    <div style={{ padding: 32 }}>
  <h1>Google Auth + Drive Sync</h1>
      {!session ? (
        <button onClick={() => signIn("google")}>Sign In with Google</button>
      ) : (
        <>
          <p>Signed in as {session.user?.name}</p>
          <button onClick={() => signOut()}>Sign Out</button>
          <hr />
          <h2>Export Habits to Drive</h2>
          <button onClick={handleExport}>Export</button>
          <h2>Import Habits from Drive</h2>
          <button onClick={handleImport}>Import</button>
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
