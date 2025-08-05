import type { TransactionMeta } from '@metamask/transaction-controller';

import type { CoverageResult, ShieldBackend } from './types';

export const BASE_URL = 'https://rule-engine.metamask.io';

export class ShieldRemoteBackend implements ShieldBackend {
  readonly #getAccessToken: () => Promise<string>;

  constructor(getAccessToken: () => Promise<string>) {
    this.#getAccessToken = getAccessToken;
  }

  checkCoverage: (txMeta: TransactionMeta) => Promise<CoverageResult> = async (
    txMeta,
  ) => {
    const accessToken = await this.#getAccessToken();
    return fetch(`${BASE_URL}/api/v1/coverage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        txMeta,
      }),
    }).then((res) => res.json());
  };
}
