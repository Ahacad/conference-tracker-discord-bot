import { jest } from '@jest/globals';
import { Response } from '@cloudflare/workers-types';

beforeEach(() => {
  global.fetch = jest.fn();
});
