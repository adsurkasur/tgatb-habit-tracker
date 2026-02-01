// Upload full export bundle (string) to Drive
export async function uploadDataToDrive(jsonData: string, accessToken: string): Promise<string | null> {
	const metadata = {
		name: 'habits-backup.json',
		mimeType: 'application/json',
	};
	const form = new FormData();
	form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
	form.append('file', new Blob([jsonData], { type: 'application/json' }));
	try {
		const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
			body: form,
		});
		const data = await res.json();
		if (!res.ok) {
			// Detect unauthorized and proactively clear stored token on mobile so callers can trigger re-auth
			if (res.status === 401) {
				console.error('[DriveSync] uploadDataToDrive 401', { status: res.status, result: data });
				try {
					const { Preferences } = await import('@capacitor/preferences');
					await Preferences.remove({ key: 'googleAccessToken' });
				} catch (e) {
					console.warn('[DriveSync] failed to clear googleAccessToken in Preferences', e);
				}
				throw new Error('Drive Unauthorized (401)');
			}
			console.error('[DriveSync] uploadDataToDrive error', { status: res.status, result: data });
			throw new Error(data?.error?.message || 'Drive upload failed');
		}
		return data.id ?? null;
	} catch (err) {
		// Re-throw so callers can show UX to re-authenticate
		throw err;
	}
}
import type { ExportBundle } from '../shared/schema';

// Download the latest habits backup from Drive
export async function downloadLatestHabitsFromDrive(accessToken: string): Promise<ExportBundle | null> {
	 try {
		 // List files named 'habits-backup.json' (to match web)
		 const listRes = await fetch('https://www.googleapis.com/drive/v3/files?q=name%3D%27habits-backup.json%27&spaces=drive&fields=files(id%2Cname%2CmodifiedTime)&orderBy=modifiedTime desc', {
			 headers: { Authorization: `Bearer ${accessToken}` }
		 });
		 const listJson = await listRes.json();
		 if (!listRes.ok) {
			 if (listRes.status === 401) {
				 console.error('[DriveSync] list files 401', { status: listRes.status, result: listJson });
				 try {
					 const { Preferences } = await import('@capacitor/preferences');
					 await Preferences.remove({ key: 'googleAccessToken' });
				 } catch (e) {
					 console.warn('[DriveSync] failed to clear googleAccessToken in Preferences', e);
				 }
				 throw new Error('Drive Unauthorized (401)');
			 }
			 throw new Error(listJson?.error?.message || 'Drive file list failed');
		 }
		 const files = listJson.files || [];
		 if (!files.length) throw new Error("No backup file found in Drive");
		 const fileId = files[0].id;
		 // Download full bundle from Drive
		 const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
			 headers: { Authorization: `Bearer ${accessToken}` }
		 });
		 const cloudJson = await res.text();
		 if (!res.ok) {
			 const parsed = (() => { try { return JSON.parse(cloudJson); } catch { return cloudJson; } })();
			 if (res.status === 401) {
				 console.error('[DriveSync] download file 401', { status: res.status, result: parsed });
				 try {
					 const { Preferences } = await import('@capacitor/preferences');
					 await Preferences.remove({ key: 'googleAccessToken' });
				 } catch (e) {
					 console.warn('[DriveSync] failed to clear googleAccessToken in Preferences', e);
				 }
				 throw new Error('Drive Unauthorized (401)');
			 }
			 throw new Error(parsed?.error?.message || 'Drive download failed');
		 }
		 const parsed = (() => { try { return JSON.parse(cloudJson); } catch { return null; } })();
		 return parsed as ExportBundle | null;
	 } catch {
		 return null;
	 }
}
// Google Drive sync logic for mobile
// Use REST API with accessToken from FirebaseAuthentication
import { exportBundleToJson, importBundleFromJson } from '../shared/data-sync';

export async function uploadHabitsToDrive(habitsOrBundle: ExportBundle | ExportBundle['habits'], accessToken: string): Promise<string | null> {
	 const metadata = {
		 name: 'habits-export.json',
		 mimeType: 'application/json',
	 };
	 const form = new FormData();
	 form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
	 // Normalize to ExportBundle
	 const bundle: ExportBundle = Array.isArray(habitsOrBundle)
		 ? {
			 version: '1',
			 meta: { exportedAt: new Date().toISOString(), counts: { habits: habitsOrBundle.length, logs: 0 } },
			 habits: habitsOrBundle,
			 logs: [],
			 settings: { darkMode: false, language: 'en', motivatorPersonality: 'positive', fullscreenMode: false },
		 }
		 : habitsOrBundle;
	 form.append('file', new Blob([exportBundleToJson(bundle)], { type: 'application/json' }));
	try {
		const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
			body: form,
		});
		const data = await res.json();
		return data.id ?? null;
	} catch {
		return null;
	}
}

export async function downloadHabitsFromDrive(fileId: string, accessToken: string): Promise<ExportBundle | null> {
	 try {
		 const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
			 headers: {
				 Authorization: `Bearer ${accessToken}`,
			 },
		 });
		 const json = await res.text();
		 return importBundleFromJson(json);
	 } catch {
		 return null;
	 }
} 

// Usage:
// const fileId = await uploadHabitsToDrive(habits, accessToken);
// const habits = await downloadHabitsFromDrive(fileId, accessToken);
