import { ShieldRemoteBackend, BASE_URL } from './backend';
import type { CoverageStatus } from './types';
import { generateMockTxMeta } from '../tests/txUtils';

/**
 *
 */
function setup() {
  // Setup fetch mock.
  const fetchMock = jest.spyOn(global, 'fetch') as jest.MockedFunction<
    typeof fetch
  >;

  // Setup access token mock.
  const getAccessToken = jest.fn().mockResolvedValue('token');

  // Setup backend.
  const backend = new ShieldRemoteBackend({
    getAccessToken,
    getCoverageResultTimeout: 1000,
    getCoverageResultPollInterval: 100,
  });

  return {
    backend,
    getAccessToken,
    fetchMock,
  };
}

/**
 *
 */
function getRandomCoverageStatus(): CoverageStatus {
  return ['covered', 'malicious', 'unsupported'][
    Math.floor(Math.random() * 3)
  ] as CoverageStatus;
}

describe('ShieldRemoteBackend', () => {
  it('should check coverage', async () => {
    const { backend, fetchMock, getAccessToken } = setup();

    // Mock init coverage check.
    fetchMock.mockResolvedValueOnce({
      status: 200,
      json: jest.fn().mockResolvedValue({ coverageId: 'coverageId' }),
    } as unknown as Response);

    // Mock get coverage result.
    const status = getRandomCoverageStatus();
    fetchMock.mockResolvedValueOnce({
      status: 200,
      json: jest.fn().mockResolvedValue({ status }),
    } as unknown as Response);

    const txMeta = generateMockTxMeta();
    const coverageResult = await backend.checkCoverage(txMeta);
    expect(coverageResult).toStrictEqual({ status });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(getAccessToken).toHaveBeenCalledTimes(2);
  });

  it('should check coverage with delay', async () => {
    const { backend, fetchMock, getAccessToken } = setup();

    // Mock init coverage check.
    fetchMock.mockResolvedValueOnce({
      status: 200,
      json: jest.fn().mockResolvedValue({ coverageId: 'coverageId' }),
    } as unknown as Response);

    // Mock get coverage result: result unavailable.
    fetchMock.mockResolvedValueOnce({
      status: 404,
      json: jest.fn().mockResolvedValue({ status: 'unavailable' }),
    } as unknown as Response);

    // Mock get coverage result: result available.
    const status = getRandomCoverageStatus();
    fetchMock.mockResolvedValueOnce({
      status: 200,
      json: jest.fn().mockResolvedValue({ status }),
    } as unknown as Response);

    const txMeta = generateMockTxMeta();
    const coverageResult = await backend.checkCoverage(txMeta);
    expect(coverageResult).toStrictEqual({ status });
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(getAccessToken).toHaveBeenCalledTimes(3);
  });
});
