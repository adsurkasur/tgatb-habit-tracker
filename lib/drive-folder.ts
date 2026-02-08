/**
 * Shared helper for managing the "TGATB Habit Tracker" folder in Google Drive.
 *
 * All TGATB cloud files are stored inside this dedicated folder.
 * Backward compatibility: download/list helpers can fall back to searching
 * the entire Drive for legacy files that were uploaded to root.
 */

import { TokenStorage } from '@/lib/utils';

const FOLDER_NAME = 'TGATB Habit Tracker';
const FOLDER_MIME = 'application/vnd.google-apps.folder';
const DRIVE_FILES_API = 'https://www.googleapis.com/drive/v3/files';

/** Session-scoped cache so we don't re-query the folder on every API call. */
let cachedFolderId: string | null = null;

/**
 * Get or create the "TGATB Habit Tracker" folder in Google Drive.
 * The result is cached for the lifetime of the page/session.
 */
export async function getOrCreateAppFolder(accessToken: string): Promise<string> {
	if (cachedFolderId) return cachedFolderId;

	// Search for an existing, non-trashed folder with the expected name
	const q = `mimeType='${FOLDER_MIME}' and name='${FOLDER_NAME}' and trashed=false`;
	const searchUrl = `${DRIVE_FILES_API}?q=${encodeURIComponent(q)}&spaces=drive&fields=files(id)`;

	const searchRes = await fetch(searchUrl, {
		headers: { Authorization: `Bearer ${accessToken}` },
	});

	if (!searchRes.ok) {
		await handleNonOk(searchRes, 'App folder search');
	}

	const searchJson = await searchRes.json();
	if (searchJson.files?.length) {
		cachedFolderId = searchJson.files[0].id;
		return cachedFolderId!;
	}

	// Folder doesn't exist yet — create it
	const createRes = await fetch(DRIVE_FILES_API, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${accessToken}`,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ name: FOLDER_NAME, mimeType: FOLDER_MIME }),
	});

	if (!createRes.ok) {
		await handleNonOk(createRes, 'App folder creation');
	}

	const created = await createRes.json();
	cachedFolderId = created.id;
	return cachedFolderId!;
}

export interface DriveFile {
	id: string;
	name: string;
	modifiedTime: string;
}

/**
 * List files with `fileName` inside the app folder, ordered by most-recent first.
 *
 * When `withRootFallback` is true and no files are found in the folder,
 * a second query searches the entire Drive for legacy files that were
 * uploaded before the folder structure was introduced.
 */
export async function listAppFiles(
	fileName: string,
	accessToken: string,
	opts?: { withRootFallback?: boolean },
): Promise<DriveFile[]> {
	const folderId = await getOrCreateAppFolder(accessToken);

	const folderQ = `'${folderId}' in parents and name='${fileName}' and trashed=false`;
	const folderUrl =
		`${DRIVE_FILES_API}?q=${encodeURIComponent(folderQ)}` +
		`&spaces=drive&fields=files(id,name,modifiedTime)&orderBy=modifiedTime%20desc`;

	const folderRes = await fetch(folderUrl, {
		headers: { Authorization: `Bearer ${accessToken}` },
	});

	if (!folderRes.ok) {
		await handleNonOk(folderRes, 'List files in app folder');
	}

	const folderJson = await folderRes.json();
	const files: DriveFile[] = folderJson.files || [];

	if (files.length > 0 || !opts?.withRootFallback) return files;

	// Fallback: search entire Drive for legacy files uploaded to root
	const rootQ = `name='${fileName}' and trashed=false`;
	const rootUrl =
		`${DRIVE_FILES_API}?q=${encodeURIComponent(rootQ)}` +
		`&spaces=drive&fields=files(id,name,modifiedTime)&orderBy=modifiedTime%20desc`;

	const rootRes = await fetch(rootUrl, {
		headers: { Authorization: `Bearer ${accessToken}` },
	});

	if (!rootRes.ok) {
		await handleNonOk(rootRes, 'List legacy files in root');
	}

	const rootJson = await rootRes.json();
	return rootJson.files || [];
}

/** Reset the cached folder ID (call on sign-out). */
export function resetAppFolderCache(): void {
	cachedFolderId = null;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Uniform error handler for non-ok Drive responses.
 * On 401 the stored access token is proactively cleared so callers can
 * trigger re-auth without extra logic.
 */
async function handleNonOk(res: Response, context: string): Promise<never> {
	if (res.status === 401) {
		console.error(`[DriveFolder] ${context} 401`, { status: res.status });
		try {
			await TokenStorage.removeAccessToken();
		} catch (e) {
			console.warn('[DriveFolder] failed to clear access token', e);
		}
		throw new Error('Drive Unauthorized (401)');
	}

	const body = await res.json().catch(() => ({}));
	throw new Error(body?.error?.message || `${context} failed (${res.status})`);
}
