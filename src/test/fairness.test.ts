import { describe, it, expect } from 'vitest';

// Mock the weighted random selection function
function selectWeightedRandom(
  availableNames: string[], 
  selectionCounts: Record<string, number>,
  fairnessEnabled: boolean = true
): string {
  if (!fairnessEnabled || availableNames.length === 0) {
    return availableNames[Math.floor(Math.random() * availableNames.length)];
  }

  // Calculate weights based on selection counts (inverse weighting)
  const maxSelections = Math.max(...availableNames.map(name => selectionCounts[name] || 0), 0);
  const weights = availableNames.map(name => {
    const count = selectionCounts[name] || 0;
    // Higher weight for less selected names
    return Math.max(1, maxSelections - count + 1);
  });

  // Calculate total weight
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  
  // Generate random number
  let random = Math.random() * totalWeight;
  
  // Find selected name based on weights
  for (let i = 0; i < availableNames.length; i++) {
    random -= weights[i];
    if (random <= 0) {
      return availableNames[i];
    }
  }
  
  // Fallback
  return availableNames[availableNames.length - 1];
}

describe('Fairness Weighting', () => {
  const availableNames = ['Alice', 'Bob', 'Charlie'];

  it('should give equal weights when no one has been selected', () => {
    const selectionCounts = { Alice: 0, Bob: 0, Charlie: 0 };
    
    // Mock Math.random to return specific values for testing
    const originalRandom = Math.random;
    
    // Test different random values to ensure all names can be selected
    Math.random = () => 0.1; // Should select first name
    expect(selectWeightedRandom(availableNames, selectionCounts)).toBe('Alice');
    
    Math.random = () => 0.5; // Should select middle name
    expect(selectWeightedRandom(availableNames, selectionCounts)).toBe('Bob');
    
    Math.random = () => 0.9; // Should select last name
    expect(selectWeightedRandom(availableNames, selectionCounts)).toBe('Charlie');
    
    Math.random = originalRandom;
  });

  it('should favor less selected names', () => {
    const selectionCounts = { Alice: 3, Bob: 1, Charlie: 0 };
    
    const originalRandom = Math.random;
    
    // Charlie has never been selected (count: 0), so should have highest weight
    // Bob has been selected once (count: 1), so should have medium weight  
    // Alice has been selected most (count: 3), so should have lowest weight
    
    // With max selections = 3, weights should be:
    // Alice: max(1, 3-3+1) = 1
    // Bob: max(1, 3-1+1) = 3  
    // Charlie: max(1, 3-0+1) = 4
    // Total weight: 1 + 3 + 4 = 8
    
    // Random 0.1 * 8 = 0.8, should select Alice (weight 1)
    Math.random = () => 0.1;
    expect(selectWeightedRandom(availableNames, selectionCounts)).toBe('Alice');
    
    // Random 0.3 * 8 = 2.4, should select Bob (after Alice's weight of 1)
    Math.random = () => 0.3;
    expect(selectWeightedRandom(availableNames, selectionCounts)).toBe('Bob');
    
    // Random 0.8 * 8 = 6.4, should select Charlie (after Alice's 1 + Bob's 3 = 4)
    Math.random = () => 0.8;
    expect(selectWeightedRandom(availableNames, selectionCounts)).toBe('Charlie');
    
    Math.random = originalRandom;
  });

  it('should work with fairness disabled', () => {
    const selectionCounts = { Alice: 10, Bob: 0, Charlie: 0 };
    
    const originalRandom = Math.random;
    Math.random = () => 0.1; // Should select first name regardless of selection counts
    
    expect(selectWeightedRandom(availableNames, selectionCounts, false)).toBe('Alice');
    
    Math.random = originalRandom;
  });

  it('should handle empty selection counts', () => {
    const selectionCounts = {};
    
    const originalRandom = Math.random;
    Math.random = () => 0.1;
    
    // Should not throw an error and should return a valid name
    const result = selectWeightedRandom(availableNames, selectionCounts);
    expect(availableNames).toContain(result);
    
    Math.random = originalRandom;
  });

  it('should handle single name', () => {
    const singleName = ['Alice'];
    const selectionCounts = { Alice: 5 };
    
    expect(selectWeightedRandom(singleName, selectionCounts)).toBe('Alice');
  });

  it('should always return a valid name', () => {
    const selectionCounts = { Alice: 1, Bob: 2, Charlie: 3 };
    
    // Run multiple times to ensure stability
    for (let i = 0; i < 100; i++) {
      const result = selectWeightedRandom(availableNames, selectionCounts);
      expect(availableNames).toContain(result);
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    }
  });
});