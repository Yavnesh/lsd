import { describe, it, expect } from 'vitest';
import { calculateStreak } from '../src/lib/streak';

describe('streak calculator logic', () => {
  it('should return 0 streak for empty activities', () => {
    const result = calculateStreak([], 'UTC');
    expect(result.streak).toBe(0);
    expect(result.shieldsConsumed).toBe(0);
  });

  it('should calculate active streak correctly without gap', () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const activities = [
      { completedAt: today },
      { completedAt: yesterday }
    ];
    
    const result = calculateStreak(activities, 'UTC');
    expect(result.streak).toBe(2);
  });

  it('should break streak if gap is larger than 1 day and no shields', () => {
    const today = new Date();
    const twoDaysAgo = new Date(today);
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    
    const activities = [
      { completedAt: twoDaysAgo }
    ];
    
    const result = calculateStreak(activities, 'UTC');
    expect(result.streak).toBe(0); // broken
  });

  it('should consume a shield if gap is present and shields are available', () => {
    const today = new Date();
    const twoDaysAgo = new Date(today);
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    const threeDaysAgo = new Date(today);
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    
    const activities = [
      { completedAt: twoDaysAgo },
      { completedAt: threeDaysAgo }
    ];
    
    // Streak would normally be 0 because today and yesterday have no activity.
    // With 1 shield, we can bridge the gap.
    const result = calculateStreak(activities, 'UTC', 1);
    
    expect(result.streak).toBe(2);
    expect(result.shieldsConsumed).toBe(1);
  });
});
