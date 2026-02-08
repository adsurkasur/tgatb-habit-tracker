import { downloadLatestHabitsFromDrive } from '../../mobile/drive-sync';
import { resetAppFolderCache } from '../../lib/drive-folder';
import { TokenStorage } from '../../lib/utils';

const DRIVE_API = 'https://www.googleapis.com/drive/v3/files';
const TEST_FOLDER_ID = 'test-folder-id';

const validBundle = {
  version: '1',
  meta: { exportedAt: new Date().toISOString(), counts: { habits: 0, logs: 0 } },
  habits: [],
  logs: [],
  settings: { darkMode: false, language: 'en', motivatorPersonality: 'positive', fullscreenMode: false },
};

afterEach(() => {
  // Reset cached folder ID between tests
  resetAppFolderCache();
  // Restore any stubbed fetch
  if (globalThis.fetch && (globalThis.fetch as ReturnType<typeof vi.fn>).mockRestore) {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockRestore();
  }
});

/**
 * Helper: creates a mock fetch that routes Drive API calls correctly.
 * - Folder search → returns TEST_FOLDER_ID
 * - File list in folder → returns `folderFiles`
 * - Root fallback list → returns `rootFiles`
 * - Download by ID → delegates to `onDownload`
 */
function mockDriveFetch(opts: {
  folderFiles?: Array<{ id: string; name: string }>;
  rootFiles?: Array<{ id: string; name: string }>;
  onDownload?: (fileId: string) => Response;
  statusOverride?: number;
}) {
  const { folderFiles = [], rootFiles = [], onDownload, statusOverride } = opts;

  return vi.fn(async (url: string) => {
    // Global status override (e.g. 401 for everything)
    if (statusOverride) {
      return new Response(JSON.stringify({ error: { message: 'Unauthorized' } }), { status: statusOverride });
    }

    // 1. Folder search (contains 'vnd.google-apps.folder')
    if (url.includes('vnd.google-apps.folder')) {
      return new Response(JSON.stringify({ files: [{ id: TEST_FOLDER_ID }] }), { status: 200 });
    }

    // 2. File download (contains alt=media)
    if (url.includes('alt=media')) {
      const fileId = url.split('/files/')[1]?.split('?')[0];
      if (onDownload && fileId) return onDownload(fileId);
      throw new Error('Unexpected download URL: ' + url);
    }

    // 3. File list scoped to folder (contains 'in+parents' or 'in%20parents')
    if (url.includes('in+parents') || url.includes('in%20parents')) {
      return new Response(JSON.stringify({ files: folderFiles }), { status: 200 });
    }

    // 4. Root fallback list (just name query, no parents)
    if (url.startsWith(DRIVE_API)) {
      return new Response(JSON.stringify({ files: rootFiles }), { status: 200 });
    }

    throw new Error('Unexpected URL: ' + url);
  });
}

test('returns null when Drive list is empty', async () => {
  vi.stubGlobal('fetch', mockDriveFetch({
    folderFiles: [],
    rootFiles: [],
  }));

  const result = await downloadLatestHabitsFromDrive('fake-token');
  expect(result).toBeNull();
});

test('handles invalid json payload gracefully', async () => {
  vi.stubGlobal('fetch', mockDriveFetch({
    folderFiles: [{ id: 'abc', name: 'habits-backup.json' }],
    onDownload: () => new Response('not-json', { status: 200, headers: { 'content-type': 'application/json' } }),
  }));

  const result = await downloadLatestHabitsFromDrive('fake-token');
  expect(result).toBeNull();
});

test('returns parsed bundle for valid file in app folder', async () => {
  vi.stubGlobal('fetch', mockDriveFetch({
    folderFiles: [{ id: 'abc', name: 'habits-backup.json' }],
    onDownload: () => new Response(JSON.stringify(validBundle), { status: 200, headers: { 'content-type': 'application/json' } }),
  }));

  const result = await downloadLatestHabitsFromDrive('fake-token');
  expect(result).not.toBeNull();
  expect(result?.version).toBe('1');
});

test('falls back to root when app folder is empty', async () => {
  vi.stubGlobal('fetch', mockDriveFetch({
    folderFiles: [],
    rootFiles: [{ id: 'legacy-file', name: 'habits-backup.json' }],
    onDownload: () => new Response(JSON.stringify(validBundle), { status: 200, headers: { 'content-type': 'application/json' } }),
  }));

  const result = await downloadLatestHabitsFromDrive('fake-token');
  expect(result).not.toBeNull();
  expect(result?.version).toBe('1');
});

test('clears token on 401 and returns null', async () => {
  const removeSpy = vi.spyOn(TokenStorage, 'removeAccessToken');

  vi.stubGlobal('fetch', mockDriveFetch({ statusOverride: 401 }));

  const result = await downloadLatestHabitsFromDrive('fake-token');
  expect(result).toBeNull();
  expect(removeSpy).toHaveBeenCalled();
  removeSpy.mockRestore();
});
