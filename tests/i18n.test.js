import assert from 'node:assert/strict';
import test from 'node:test';

const fakeStorage = new Map();
globalThis.localStorage = {
  getItem: (key) => fakeStorage.get(key) ?? null,
  setItem: (key, value) => fakeStorage.set(key, String(value))
};

test('i18n module exposes the three supported languages', async () => {
  const { LANGUAGES, setLanguage, getLanguage, t } = await import('../js/i18n.js');
  assert.deepEqual(LANGUAGES, ['en', 'fa', 'es']);
  assert.equal(setLanguage('fa'), 'fa');
  assert.equal(getLanguage(), 'fa');
  assert.equal(t('login', 'es'), 'Iniciar sesión');
  assert.equal(t('login', 'unknown'), 'Login');
});
