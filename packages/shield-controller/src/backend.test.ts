import { ShieldRemoteBackend, BASE_URL } from './backend';
import { generateMockTxMeta } from '../tests/txUtils';

/**
 *
 */
function setup() {
  // Setup fetch mock.
  const fetchMock = jest.fn().mockResolvedValue({
    json: () =>
      Promise.resolve({
        status: 'covered',
      }),
  });
  global.fetch = fetchMock;

  // Setup access token mock.
  const getAccessToken = jest.fn().mockResolvedValue('token');

  // Setup backend.
  const backend = new ShieldRemoteBackend(getAccessToken);

  return {
    backend,
    getAccessToken,
    fetchMock,
  };
}

describe('ShieldRemoteBackend', () => {
  it('should check coverage', async () => {
    const { backend, fetchMock, getAccessToken } = setup();
    const txMeta = generateMockTxMeta();
    const coverageResult = await backend.checkCoverage(txMeta);
    expect(coverageResult).toStrictEqual({
      status: 'covered',
    });
    expect(fetchMock).toHaveBeenCalledWith(`${BASE_URL}/api/v1/coverage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer token',
      },
      body: JSON.stringify({
        txMeta,
      }),
    });
    expect(getAccessToken).toHaveBeenCalledTimes(1);
  });
});
