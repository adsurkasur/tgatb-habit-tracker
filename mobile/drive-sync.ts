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
		return data.id ?? null;
	} catch {
		return null;
	}
}
// Download the latest habits backup from Drive
export async function downloadLatestHabitsFromDrive(accessToken: string): Promise<any> {
	 try {
		 // List files named 'habits-backup.json' (to match web)
		 const listRes = await fetch('https://www.googleapis.com/drive/v3/files?q=name%3D%27habits-backup.json%27&spaces=drive&fields=files(id%2Cname%2CmodifiedTime)&orderBy=modifiedTime desc', {
			 headers: { Authorization: `Bearer ${accessToken}` }
		 });
		 const listJson = await listRes.json();
		 const files = listJson.files || [];
		 if (!files.length) throw new Error("No backup file found in Drive");
		 const fileId = files[0].id;
		 // Download full bundle from Drive
		 const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
			 headers: { Authorization: `Bearer ${accessToken}` }
		 });
		 const cloudJson = await res.text();
		 return JSON.parse(cloudJson);
	 } catch {
		 return null;
	 }
}
// Google Drive sync logic for mobile
// Use REST API with accessToken from FirebaseAuthentication
import { exportBundleToJson, importBundleFromJson } from '../shared/data-sync';

export async function uploadHabitsToDrive(habits: any[], accessToken: string): Promise<string | null> {
	 const metadata = {
		 name: 'habits-export.json',
		 mimeType: 'application/json',
	 };
	 const form = new FormData();
	 form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
	 // Always upload as full export bundle
	 form.append('file', new Blob([exportBundleToJson(habits)], { type: 'application/json' }));
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

export async function downloadHabitsFromDrive(fileId: string, accessToken: string): Promise<any> {
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
