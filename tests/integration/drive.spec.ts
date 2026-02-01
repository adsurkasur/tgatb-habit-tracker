import { downloadLatestHabitsFromDrive } from '../../mobile/drive-sync';
import { TokenStorage } from '../../lib/utils';

const FILE_LIST_URL = 'https://www.googleapis.com/drive/v3/files';
const FILE_DOWNLOAD_BASE = 'https://www.googleapis.com/drive/v3/files';

const validBundle = {
  version: '1',
  meta: { exportedAt: new Date().toISOString(), counts: { habits: 0, logs: 0 } },
  habits: [],
  logs: [],
  settings: { darkMode: false, language: 'en', motivatorPersonality: 'positive', fullscreenMode: false },
};

afterEach(() => {
  // restore any stubbed fetch
  if (globalThis.fetch && (globalThis.fetch as any).mockRestore) {
    (globalThis.fetch as any).mockRestore();
  }
});

test('returns null when Drive list is empty', async () => {
  vi.stubGlobal('fetch', vi.fn(async (url: string) => {
    if (url.startsWith(FILE_LIST_URL)) return new Response(JSON.stringify({ files: [] }), { status: 200 });
    throw new Error('Unexpected URL');
  }));

  const result = await downloadLatestHabitsFromDrive('fake-token');
  expect(result).toBeNull();
});

test('handles invalid json payload gracefully', async () => {
  vi.stubGlobal('fetch', vi.fn(async (url: string) => {
    if (url.startsWith(FILE_LIST_URL)) return new Response(JSON.stringify({ files: [{ id: 'abc', name: 'habits-backup.json' }] }), { status: 200 });
    if (url.startsWith(`${FILE_DOWNLOAD_BASE}/abc`)) return new Response('not-json', { status: 200, headers: { 'content-type': 'application/json' } });
    throw new Error('Unexpected URL');
  }));

  const result = await downloadLatestHabitsFromDrive('fake-token');
  expect(result).toBeNull();
});

test('returns parsed bundle for valid file', async () => {
  {
    const calls: string[] = [];
    vi.stubGlobal('fetch', vi.fn(async (url: string) => {
      calls.push(url);
      // More specific check first to avoid matching the base list URL
      if (url.startsWith(`${FILE_DOWNLOAD_BASE}/abc`)) return new Response(JSON.stringify(validBundle), { status: 200, headers: { 'content-type': 'application/json' } });
      if (url.startsWith(FILE_LIST_URL)) return new Response(JSON.stringify({ files: [{ id: 'abc', name: 'habits-backup.json' }] }), { status: 200 });
      throw new Error('Unexpected URL: ' + url);
    }));

    const parsed = await (await import('../../shared/data-sync')).importBundleFromJson(JSON.stringify(validBundle));
    expect(parsed).not.toBeNull();

    // sanity-check the underlying network responses
    const listRes = await fetch('https://www.googleapis.com/drive/v3/files?q=name%3D%27habits-backup.json%27&spaces=drive&fields=files(id%2Cname%2CmodifiedTime)&orderBy=modifiedTime desc');
    const listJson = await listRes.json();
    expect(listJson.files?.[0]?.id).toBe('abc');

    const fileRes = await fetch('https://www.googleapis.com/drive/v3/files/abc?alt=media');
    const fileText = await fileRes.text();
    expect(fileText).toBe(JSON.stringify(validBundle));

    const result = await downloadLatestHabitsFromDrive('fake-token');
    // debug info if something goes wrong
    if (!result) {
      // eslint-disable-next-line no-console
      console.debug('fetch calls:', calls);
    }

    expect(result).not.toBeNull();
    expect(result?.version).toBe('1');
  }

  const result = await downloadLatestHabitsFromDrive('fake-token');
  expect(result).not.toBeNull();
  expect(result?.version).toBe('1');
});

test('clears token on 401 and returns null', async () => {
  const removeSpy = vi.spyOn(TokenStorage, 'removeAccessToken');

  vi.stubGlobal('fetch', vi.fn(async (url: string) => {
    return new Response(JSON.stringify({ error: { message: 'Unauthorized' } }), { status: 401 });
  }));

  const result = await downloadLatestHabitsFromDrive('fake-token');
  expect(result).toBeNull();
  expect(removeSpy).toHaveBeenCalled();
  removeSpy.mockRestore();
});
