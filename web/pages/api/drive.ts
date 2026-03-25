// API route for Google Drive file upload and download

import { google } from "googleapis";
import { getSession } from "next-auth/react";
import type { NextApiRequest, NextApiResponse } from "next";
import { exportBundleToJson, importBundleFromJson } from "../../../shared/data-sync";
import type { ExportBundle } from "../../../shared/schema";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });
  if (!session || !session.accessToken) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: session.accessToken });
  const drive = google.drive({ version: "v3", auth });

  try {
    if (req.method === "POST") {
      // Export: Upload full bundle data to Drive (habits + logs + settings)
      const { bundle } = req.body as { bundle?: ExportBundle };
      if (!bundle || typeof bundle !== "object") {
        return res.status(400).json({ error: "Invalid bundle payload" });
      }
      if (!Array.isArray(bundle.habits) || !Array.isArray(bundle.logs) || !bundle.settings) {
        return res.status(400).json({ error: "Bundle must contain habits, logs, and settings" });
      }
      const fileMetadata = { name: "habits-export.json" };
      const media = {
        mimeType: "application/json",
        body: exportBundleToJson(bundle),
      };
      const fileResponse = await drive.files.create({
        requestBody: fileMetadata,
        media,
        fields: "id",
      });
      return res.status(200).json({ fileId: fileResponse.data.id });
    } else if (req.method === "GET") {
      // Import: Download full export bundle from Drive (by fileId)
      const { fileId } = req.query;
      const fileResponse = await drive.files.get({
        fileId: fileId as string,
        alt: "media",
      }, { responseType: "text" });
      const bundle = await importBundleFromJson(fileResponse.data as string);
      if (!bundle) return res.status(422).json({ error: "Invalid export bundle" });
      return res.status(200).json({ bundle });
    } else {
      res.setHeader("Allow", ["GET", "POST"]);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return res.status(500).json({ error: message || "Internal server error" });
  }
}
