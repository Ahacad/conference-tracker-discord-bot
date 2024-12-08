import { jest } from '@jest/globals';

declare global {
  // Extend the NodeJS namespace
  namespace NodeJS {
    interface Global {
      fetch: jest.Mock;
    }
  }
}
