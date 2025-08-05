/**
 *
 */
export function createMockBackend() {
  return {
    checkCoverage: jest.fn().mockResolvedValue({
      status: 'covered',
    }),
  };
}
