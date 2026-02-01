import assert from 'assert';

(async function run() {
  const { SecureStorage } = await import('../lib/secure-storage.ts');
  const { TokenStorage } = await import('../lib/utils.ts');

  // SecureStorage tests (fallback behavior should use in-memory or PlatformStorage)
  await SecureStorage.removeItem('__test_secure');
  await SecureStorage.setItem('__test_secure', 'svalue');
  const s = await SecureStorage.getItem('__test_secure');
  assert(s === 'svalue', 'SecureStorage should set/get fallback value');
  await SecureStorage.removeItem('__test_secure');
  const s2 = await SecureStorage.getItem('__test_secure');
  assert(s2 === null, 'SecureStorage remove should clear value');

  // TokenStorage tests
  await TokenStorage.removeAccessToken();
  await TokenStorage.setAccessToken('tok-123');
  const t = await TokenStorage.getAccessToken();
  assert(t === 'tok-123', 'TokenStorage should store and retrieve token');
  await TokenStorage.removeAccessToken();
  const t2 = await TokenStorage.getAccessToken();
  assert(t2 === null, 'TokenStorage remove should clear token');

  console.log('token_storage.test: OK');

})().catch(e=>{ console.error(e); process.exit(1); });