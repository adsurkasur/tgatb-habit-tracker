// Google Drive sync logic for web
// Use googleapis and shared/data-sync helpers

import { exportBundleToJson, importBundleFromJson } from '../shared/data-sync';
import { getOrCreateAppFolder } from '../lib/drive-folder';

// Example: Export habits to Drive
// const bundle = {...};
// const json = exportBundleToJson(bundle);
// await uploadToDrive(json, accessToken);

// Example: Import habits from Drive
// const json = await downloadFromDrive(accessToken);
// const bundle = importBundleFromJson(json);

// Upload JSON data to Google Drive (into the "TGATB Habit Tracker" folder)
export async function uploadToDrive(jsonData: string, accessToken: string): Promise<{ id?: string } | null> {
	try {
		if (process.env.NODE_ENV !== "production") {
			console.debug('[DriveSync] uploadToDrive called', { jsonData, accessToken });
		}
		const folderId = await getOrCreateAppFolder(accessToken);
		const metadata = {
			name: 'habits-backup.json',
			mimeType: 'application/json',
			parents: [folderId],
		};
		const form = new FormData();
		form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
		form.append('file', new Blob([jsonData], { type: 'application/json' }));
		const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
			method: 'POST',
			headers: {
				'Authorization': `Bearer ${accessToken}`,
			},
			body: form,
		});
			const result = await response.json();
			if (process.env.NODE_ENV !== "production") {
				console.debug('[DriveSync] uploadToDrive response', result);
			}
			if (!response.ok) {
				console.error('[DriveSync] uploadToDrive error', {
					status: response.status,
					statusText: response.statusText,
					result,
					headers: Object.fromEntries(response.headers.entries()),
					request: {
						url: response.url,
						method: 'POST',
						metadata,
					},
				});
				throw new Error(result.error?.message || 'Drive upload failed');
			}
			return { id: result.id };
	} catch (err) {
		console.error('[DriveSync] uploadToDrive exception', err);
		throw err;
	}
} 
