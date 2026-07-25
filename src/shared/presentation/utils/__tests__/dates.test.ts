import {
  addDays,
  dayLabel,
  monthKey,
  monthName,
  monthRange,
  recentDays,
  shiftMonth,
  shortDate,
  toIsoDate,
} from '../dates';

// Every case pins "today" explicitly: these helpers never read the clock.
const TODAY = '2026-07-25';

describe('monthRange', () => {
  it('covers the whole month, inclusive', () => {
    expect(monthRange(TODAY)).toEqual({ from: '2026-07-01', to: '2026-07-31' });
  });

  it('handles a 30-day month', () => {
    expect(monthRange('2026-06-15')).toEqual({ from: '2026-06-01', to: '2026-06-30' });
  });

  it('handles February in a leap year', () => {
    expect(monthRange('2028-02-10')).toEqual({ from: '2028-02-01', to: '2028-02-29' });
  });

  it('handles February in a common year', () => {
    expect(monthRange('2026-02-10')).toEqual({ from: '2026-02-01', to: '2026-02-28' });
  });
});

describe('shiftMonth', () => {
  it('steps back a month', () => {
    expect(monthRange(shiftMonth(TODAY, -1))).toEqual({
      from: '2026-06-01',
      to: '2026-06-30',
    });
  });

  it('crosses the year backwards', () => {
    expect(monthKey(shiftMonth('2026-01-15', -1))).toBe('2025-12');
  });

  it('does not skip a short month when starting from the 31st', () => {
    // Naive date math would turn Jul 31 - 1 month into Mar 3.
    expect(monthKey(shiftMonth('2026-07-31', -1))).toBe('2026-06');
    expect(monthKey(shiftMonth('2026-03-31', -1))).toBe('2026-02');
  });
});

describe('addDays', () => {
  it('crosses a month boundary', () => {
    expect(addDays('2026-07-31', 1)).toBe('2026-08-01');
  });

  it('crosses a year boundary backwards', () => {
    expect(addDays('2026-01-01', -1)).toBe('2025-12-31');
  });
});

describe('dayLabel', () => {
  it('names today and yesterday', () => {
    expect(dayLabel(TODAY, TODAY)).toBe('hoy');
    expect(dayLabel('2026-07-24', TODAY)).toBe('ayer');
  });

  it('falls back to weekday and short date', () => {
    expect(dayLabel('2026-07-18', TODAY)).toBe('sáb 18 jul');
  });

  it('uses the English tables', () => {
    expect(
      dayLabel('2026-07-18', TODAY, 'en', { today: 'today', yesterday: 'yesterday' }),
    ).toBe('Sat 18 jul');
  });

  it('takes the labels from the caller so they can be translated', () => {
    expect(dayLabel(TODAY, TODAY, 'en', { today: 'today', yesterday: 'yesterday' })).toBe(
      'today',
    );
  });
});

describe('shortDate and monthName', () => {
  it('formats a short day', () => {
    expect(shortDate('2026-07-11')).toBe('11 jul');
    expect(shortDate('2026-07-11', 'en')).toBe('11 jul');
  });

  it('names the month per language', () => {
    expect(monthName(TODAY)).toBe('julio');
    expect(monthName(TODAY, 'en')).toBe('July');
  });
});

describe('recentDays', () => {
  it('starts today and walks backwards', () => {
    expect(recentDays(3, TODAY)).toEqual(['2026-07-25', '2026-07-24', '2026-07-23']);
  });

  it('crosses a month boundary', () => {
    expect(recentDays(2, '2026-08-01')).toEqual(['2026-08-01', '2026-07-31']);
  });
});

describe('toIsoDate', () => {
  it('pads month and day', () => {
    expect(toIsoDate(new Date(2026, 0, 5, 12))).toBe('2026-01-05');
  });
});
