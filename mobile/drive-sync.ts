// Google Drive sync logic for mobile
// Use REST API with accessToken from FirebaseAuthentication
import { exportHabitsToJson, importHabitsFromJson } from '../shared/data-sync';

export async function uploadHabitsToDrive(habits: any[], accessToken: string): Promise<string | null> {
	const metadata = {
		name: 'habits-export.json',
		mimeType: 'application/json',
	};
	const form = new FormData();
	form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
	form.append('file', new Blob([exportHabitsToJson(habits)], { type: 'application/json' }));
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

export async function downloadHabitsFromDrive(fileId: string, accessToken: string): Promise<any[]> {
	try {
		const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
		});
		const json = await res.text();
		return importHabitsFromJson(json);
	} catch {
		return [];
	}
}

// Usage:
// const fileId = await uploadHabitsToDrive(habits, accessToken);
// const habits = await downloadHabitsFromDrive(fileId, accessToken);
