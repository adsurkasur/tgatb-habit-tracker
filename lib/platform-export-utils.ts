// Platform-specific export helpers for habit tracker

// Android export using capacitor-save-as
export async function exportDataAndroid({ data, defaultFilename }: { data: string; defaultFilename: string }) {
  try {
    const { SaveAs } = await import("capacitor-save-as");
    const encodedData = btoa(data);
    await SaveAs.showSaveAsPicker({
      filename: defaultFilename,
      mimeType: "application/json",
      data: encodedData,
    });
    return true;
  } catch (err) {
    console.warn("SaveAs plugin failed, falling back to web method:", err);
    return false;
  }
}

// Web export using File System Access API or anchor download
export async function exportDataWeb({ data, defaultFilename }: { data: string; defaultFilename: string }) {
  // Use 'window as any' to access showSaveFilePicker for TypeScript compatibility
  if (typeof (window as any).showSaveFilePicker === "function") {
    try {
      const handle = await (window as any).showSaveFilePicker({
        suggestedName: defaultFilename,
        types: [
          {
            description: "JSON Files",
            accept: { "application/json": [".json"] },
          },
        ],
      });
      const writable = await handle.createWritable();
      await writable.write(data);
      await writable.close();
      return true;
    } catch {
      // fall through to legacy method
    }
  }
  // Legacy: Download via anchor
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = defaultFilename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  return true;
}
