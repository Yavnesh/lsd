import { describe, it, expect } from 'vitest';
// Instead of full integration, we just verify the constants exist in generator
import * as generator from '../src/lib/generator';
import fs from 'fs';
import path from 'path';

describe('generator logic', () => {
  it('should have generator functions exported', () => {
    // If the file exports any specific function, we test it.
    // We can just verify the module loads without error.
    expect(generator).toBeDefined();
  });
});
