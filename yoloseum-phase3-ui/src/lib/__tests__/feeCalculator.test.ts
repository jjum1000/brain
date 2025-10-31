import { describe, it, expect } from 'vitest';
import {
  calculatePerformanceFee,
  calculateCumulativeFees,
  calculateBreakEvenProfit,
  calculateFeeAmount,
  getFeePercentageText,
  calculateAverageFeePercentage,
} from '@/lib/feeCalculator';

describe('feeCalculator', () => {
  describe('calculatePerformanceFee', () => {
    it('should return 0 fee for 0 profit', () => {
      const result = calculatePerformanceFee(0);
      expect(result.performanceFee).toBe(0);
      expect(result.netProfit).toBe(0);
      expect(result.totalProfit).toBe(0);
    });

    it('should return 0 fee for negative profit', () => {
      const result = calculatePerformanceFee(-100);
      expect(result.performanceFee).toBe(0);
      expect(result.netProfit).toBe(-100);
      expect(result.totalProfit).toBe(-100);
    });

    it('should calculate 20% fee correctly on positive profit', () => {
      const result = calculatePerformanceFee(1000);
      expect(result.performanceFee).toBe(200);
      expect(result.netProfit).toBe(800);
      expect(result.totalProfit).toBe(1000);
      expect(result.feePercentage).toBe(0.2);
    });

    it('should support custom fee percentage', () => {
      const result = calculatePerformanceFee(1000, 0.1);
      expect(result.performanceFee).toBe(100);
      expect(result.netProfit).toBe(900);
    });

    it('should handle decimal profits', () => {
      const result = calculatePerformanceFee(1234.56);
      expect(result.performanceFee).toBeCloseTo(246.912, 2);
      expect(result.netProfit).toBeCloseTo(987.648, 2);
    });

    it('should handle small positive profits', () => {
      const result = calculatePerformanceFee(0.01);
      expect(result.performanceFee).toBeCloseTo(0.002, 3);
      expect(result.netProfit).toBeCloseTo(0.008, 3);
    });
  });

  describe('calculateCumulativeFees', () => {
    it('should return 0 for empty array', () => {
      const result = calculateCumulativeFees([]);
      expect(result).toBe(0);
    });

    it('should calculate fees for single earning', () => {
      const result = calculateCumulativeFees([1000]);
      expect(result).toBe(200);
    });

    it('should sum fees for multiple earnings', () => {
      const result = calculateCumulativeFees([1000, 500, 1500]);
      expect(result).toBe(600); // (1000 + 500 + 1500) * 0.2
    });

    it('should ignore negative earnings', () => {
      const result = calculateCumulativeFees([1000, -500, 500]);
      expect(result).toBe(300); // (1000 + 500) * 0.2, -500 ignored
    });

    it('should ignore zero earnings', () => {
      const result = calculateCumulativeFees([1000, 0, 500]);
      expect(result).toBe(300);
    });

    it('should support custom fee percentage', () => {
      const result = calculateCumulativeFees([1000, 500], 0.1);
      expect(result).toBe(150); // (1000 + 500) * 0.1
    });

    it('should return 0 for all negative/zero earnings', () => {
      const result = calculateCumulativeFees([-1000, -500, 0]);
      expect(result).toBe(0);
    });
  });

  describe('calculateBreakEvenProfit', () => {
    it('should calculate required profit for target net profit', () => {
      const required = calculateBreakEvenProfit(800);
      expect(required).toBeCloseTo(1000, 5); // need $1000 gross with 20% fee
    });

    it('should handle zero target', () => {
      const required = calculateBreakEvenProfit(0);
      expect(required).toBe(0);
    });

    it('should handle negative target', () => {
      const required = calculateBreakEvenProfit(-100);
      expect(required).toBeCloseTo(-125, 5); // -100 / (1 - 0.2) = -100 / 0.8
    });

    it('should handle custom fee percentage', () => {
      const required = calculateBreakEvenProfit(900, 0.1);
      expect(required).toBeCloseTo(1000, 5); // 900 / (1 - 0.1) = 900 / 0.9
    });

    it('should return Infinity for 100% fee', () => {
      const required = calculateBreakEvenProfit(1000, 1.0);
      expect(required).toBe(Infinity);
    });

    it('should return Infinity for fee > 100%', () => {
      const required = calculateBreakEvenProfit(1000, 1.5);
      expect(required).toBe(Infinity);
    });

    it('should handle very high fees approaching 100%', () => {
      const required = calculateBreakEvenProfit(1000, 0.99);
      expect(required).toBeCloseTo(100000, 0); // 1000 / 0.01
    });
  });

  describe('calculateFeeAmount', () => {
    it('should return 0 for zero amount', () => {
      const result = calculateFeeAmount(0);
      expect(result).toBe(0);
    });

    it('should return 0 for negative amount', () => {
      const result = calculateFeeAmount(-100);
      expect(result).toBe(0);
    });

    it('should calculate fee for positive amount', () => {
      const result = calculateFeeAmount(1000);
      expect(result).toBe(200);
    });

    it('should support custom fee percentage', () => {
      const result = calculateFeeAmount(1000, 0.15);
      expect(result).toBe(150);
    });

    it('should handle decimal amounts', () => {
      const result = calculateFeeAmount(123.45);
      expect(result).toBeCloseTo(24.69, 2);
    });
  });

  describe('getFeePercentageText', () => {
    it('should format 0.2 as "20%"', () => {
      expect(getFeePercentageText(0.2)).toBe('20%');
    });

    it('should format 0.1 as "10%"', () => {
      expect(getFeePercentageText(0.1)).toBe('10%');
    });

    it('should format 0.05 as "5%"', () => {
      expect(getFeePercentageText(0.05)).toBe('5%');
    });

    it('should round to nearest integer', () => {
      expect(getFeePercentageText(0.125)).toBe('13%'); // 12.5 rounds to 13
      expect(getFeePercentageText(0.119)).toBe('12%'); // 11.9 rounds to 12
    });

    it('should format 0 as "0%"', () => {
      expect(getFeePercentageText(0)).toBe('0%');
    });

    it('should format 1.0 as "100%"', () => {
      expect(getFeePercentageText(1.0)).toBe('100%');
    });
  });

  describe('calculateAverageFeePercentage', () => {
    it('should return 0 for empty array', () => {
      const result = calculateAverageFeePercentage([]);
      expect(result).toBe(0);
    });

    it('should return 0 when total amount is 0', () => {
      const result = calculateAverageFeePercentage([
        { amount: 0, fee: 0 },
        { amount: 0, fee: 0 },
      ]);
      expect(result).toBe(0);
    });

    it('should calculate average fee percentage', () => {
      const result = calculateAverageFeePercentage([
        { amount: 1000, fee: 200 }, // 20%
        { amount: 1000, fee: 200 }, // 20%
      ]);
      expect(result).toBe(0.2);
    });

    it('should calculate weighted average', () => {
      const result = calculateAverageFeePercentage([
        { amount: 1000, fee: 100 }, // 10%
        { amount: 1000, fee: 300 }, // 30%
      ]);
      expect(result).toBeCloseTo(0.2, 5); // (100 + 300) / (1000 + 1000)
    });

    it('should handle single transaction', () => {
      const result = calculateAverageFeePercentage([
        { amount: 500, fee: 50 },
      ]);
      expect(result).toBe(0.1);
    });

    it('should handle mixed fee percentages', () => {
      const result = calculateAverageFeePercentage([
        { amount: 100, fee: 0 },
        { amount: 200, fee: 40 }, // 20%
        { amount: 300, fee: 30 }, // 10%
      ]);
      // (0 + 40 + 30) / (100 + 200 + 300) = 70 / 600 = 0.1166...
      expect(result).toBeCloseTo(0.1166666, 5);
    });
  });
});
