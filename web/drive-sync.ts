// Google Drive sync logic for web
// Use googleapis and shared/data-sync helpers

import { exportHabitsToJson, importHabitsFromJson } from '../shared/data-sync';

// Example: Export habits to Drive
// const habits = [...];
// const json = exportHabitsToJson(habits);
// await uploadToDrive(json, accessToken);

// Example: Import habits from Drive
// const json = await downloadFromDrive(accessToken);
// const habits = importHabitsFromJson(json);

// Upload JSON data to Google Drive
export async function uploadToDrive(jsonData: string, accessToken: string): Promise<any> {
	try {
		console.debug('[DriveSync] uploadToDrive called', { jsonData, accessToken });
		const metadata = {
			name: 'habits-backup.json',
			mimeType: 'application/json',
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
			console.debug('[DriveSync] uploadToDrive response', result);
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
			return result;
	} catch (err) {
		console.error('[DriveSync] uploadToDrive exception', err);
		throw err;
	}
}
