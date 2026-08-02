import {
  stroopsToXlm,
  xlmToStroops,
  bpsToOddsLabel,
  oddsToImpliedProb,
  calcPayout,
  shortenAddress,
  formatXlm,
} from '../lib/utils';

describe('stroopsToXlm', () => {
  it('converts 10_000_000 stroops to 1.00 XLM', () => {
    expect(stroopsToXlm(10_000_000)).toBe('1.00');
  });

  it('converts 0 stroops to 0.00', () => {
    expect(stroopsToXlm(0)).toBe('0.00');
  });
});

describe('xlmToStroops', () => {
  it('converts 1 XLM to 10_000_000 stroops', () => {
    expect(xlmToStroops(1)).toBe(10_000_000n);
  });

  it('converts 0.5 XLM correctly', () => {
    expect(xlmToStroops(0.5)).toBe(5_000_000n);
  });
});

describe('bpsToOddsLabel', () => {
  it('formats 20000 bps as 2.00x', () => {
    expect(bpsToOddsLabel(20000)).toBe('2.00x');
  });

  it('formats 10000 bps as 1.00x', () => {
    expect(bpsToOddsLabel(10000)).toBe('1.00x');
  });

  it('formats 25000 bps as 2.50x', () => {
    expect(bpsToOddsLabel(25000)).toBe('2.50x');
  });
});

describe('oddsToImpliedProb', () => {
  it('returns 50.0% for 2.0x odds', () => {
    expect(oddsToImpliedProb(2)).toBe('50.0%');
  });

  it('returns 100.0% for 1.0x odds', () => {
    expect(oddsToImpliedProb(1)).toBe('100.0%');
  });
});

describe('calcPayout', () => {
  it('calculates 10 XLM at 2.0x = 20 XLM', () => {
    expect(calcPayout(10, 20000)).toBe(20);
  });

  it('calculates 5 XLM at 3.5x = 17.5 XLM', () => {
    expect(calcPayout(5, 35000)).toBe(17.5);
  });
});

describe('shortenAddress', () => {
  it('shortens a Stellar address', () => {
    const addr = 'GABCDEFGHIJKLMNOPQRSTUVWXYZ01234567890ABCDEFGHIJKLMNOPQ';
    const shortened = shortenAddress(addr);
    expect(shortened).toMatch(/^GABCD\.\.\..*$/);
    expect(shortened.length).toBeLessThan(addr.length);
  });

  it('returns short strings unchanged', () => {
    expect(shortenAddress('ABC')).toBe('ABC');
  });
});

describe('formatXlm', () => {
  it('formats with XLM suffix', () => {
    expect(formatXlm(100)).toBe('100.00 XLM');
  });
});
