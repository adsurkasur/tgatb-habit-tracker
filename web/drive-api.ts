// API route example for Google Drive operations
import { google } from "googleapis";
import { getSession } from "next-auth/react";

export default async function handler(req, res) {
  // Type the session to include accessToken (from NextAuth callbacks)
  const session = await getSession({ req }) as { accessToken?: string };
  const accessToken = session?.accessToken;
  if (!accessToken) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  const drive = google.drive({ version: "v3", auth });
  try {
    const response = await drive.files.list({
      pageSize: 10,
      fields: "files(id, name, mimeType)",
    });
    res.status(200).json(response.data.files);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch files" });
  }
}
