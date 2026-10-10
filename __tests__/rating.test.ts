import { describe, it, expect } from 'vitest';
import { getMasteryTitle, getMasteryColor, getExpectedScore, calculateEloUpdate } from '../src/lib/rating';

describe('rating system logic', () => {
  it('should return correct mastery titles', () => {
    expect(getMasteryTitle(500)).toBe('Novice');
    expect(getMasteryTitle(1200)).toBe('Explorer');
    expect(getMasteryTitle(1400)).toBe('Thinker');
    expect(getMasteryTitle(2800)).toBe('Legend');
  });

  it('should return correct expected score', () => {
    // If player and quest have same rating, expected score is 0.5
    expect(getExpectedScore(1200, 1200)).toBe(0.5);
    
    // Player higher rating than quest, expected score > 0.5
    expect(getExpectedScore(1600, 1200)).toBeGreaterThan(0.5);
    
    // Player lower rating than quest, expected score < 0.5
    expect(getExpectedScore(1200, 1600)).toBeLessThan(0.5);
  });

  it('should calculate correct Elo updates for correct answer', () => {
    const result = calculateEloUpdate(1200, 1200, true, { attempts: 1 });
    // Expected score is 0.5. Player score is 1.0. Base K is 32.
    // playerChange = 32 * (1.0 - 0.5) = 16
    expect(result.playerChange).toBe(16);
    // Quest change is opposite and dampened (16 * (0.5 - 1.0)) = -8
    expect(result.questChange).toBe(-8);
  });

  it('should calculate correct Elo updates for incorrect answer', () => {
    const result = calculateEloUpdate(1200, 1200, false, { attempts: 1 });
    // Expected is 0.5. Player score is 0.0.
    // playerChange = 32 * (0.0 - 0.5) = -16
    expect(result.playerChange).toBe(-16);
    // questChange = 16 * (0.5 - 0.0) = 8
    expect(result.questChange).toBe(8);
  });
  
  it('should handle multi-attempt penalties', () => {
    const result = calculateEloUpdate(1200, 1200, true, { attempts: 2 });
    // Player score is 0.6. Expected is 0.5.
    // playerChange = 32 * (0.6 - 0.5) = 32 * 0.1 = 3
    expect(result.playerChange).toBe(3);
  });
});
