import {
  addDays,
  dayLabel,
  isAfter,
  monthKey,
  monthMatrix,
  monthName,
  monthRange,
  recentDays,
  sameSpanLastMonth,
  shiftMonth,
  shortDate,
  toIsoDate,
  weekdayInitials,
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

describe('isAfter', () => {
  it('compares ISO days as plain strings', () => {
    expect(isAfter('2026-07-26', TODAY)).toBe(true);
    expect(isAfter(TODAY, TODAY)).toBe(false);
    expect(isAfter('2026-07-24', TODAY)).toBe(false);
    expect(isAfter('2027-01-01', '2026-12-31')).toBe(true);
  });
});

describe('weekdayInitials', () => {
  it('starts on Monday by default', () => {
    expect(weekdayInitials()).toEqual(['L', 'M', 'M', 'J', 'V', 'S', 'D']);
  });

  it('can start on Sunday', () => {
    expect(weekdayInitials('en', 0)).toEqual(['S', 'M', 'T', 'W', 'T', 'F', 'S']);
  });
});

describe('monthMatrix', () => {
  it('always lays out rows of seven', () => {
    for (const week of monthMatrix(TODAY)) {
      expect(week).toHaveLength(7);
    }
  });

  it('pads before the first day and after the last', () => {
    // July 2026 starts on a Wednesday, so two blanks with a Monday-first week.
    const weeks = monthMatrix('2026-07-15');
    expect(weeks[0]?.slice(0, 3)).toEqual([null, null, '2026-07-01']);
    expect(weeks.at(-1)?.filter(Boolean).at(-1)).toBe('2026-07-31');
  });

  it('contains every day of the month exactly once', () => {
    const days = monthMatrix('2026-02-10').flat().filter(Boolean);
    expect(days).toHaveLength(28);
    expect(new Set(days).size).toBe(28);
    expect(days[0]).toBe('2026-02-01');
  });

  it('handles a leap February', () => {
    expect(monthMatrix('2028-02-10').flat().filter(Boolean)).toHaveLength(29);
  });

  it('respects the week start', () => {
    const monday = monthMatrix('2026-07-15', 1)[0]!;
    const sunday = monthMatrix('2026-07-15', 0)[0]!;
    expect(monday.filter(Boolean)[0]).toBe('2026-07-01');
    expect(sunday.filter(Boolean)[0]).toBe('2026-07-01');
    // A Wednesday 1st sits one column later when the week starts on Sunday.
    expect(monday.indexOf('2026-07-01')).toBe(2);
    expect(sunday.indexOf('2026-07-01')).toBe(3);
  });
});

describe('sameSpanLastMonth', () => {
  it('cuts last month at the same day, so a month in progress compares fairly', () => {
    expect(sameSpanLastMonth('2026-07-26')).toEqual({
      from: '2026-06-01',
      to: '2026-06-26',
    });
  });

  it('clamps to the last day when the previous month is shorter', () => {
    expect(sameSpanLastMonth('2026-03-31')).toEqual({
      from: '2026-02-01',
      to: '2026-02-28',
    });
    expect(sameSpanLastMonth('2028-03-30')).toEqual({
      from: '2028-02-01',
      to: '2028-02-29', // leap
    });
  });

  it('crosses the year backwards', () => {
    expect(sameSpanLastMonth('2026-01-15')).toEqual({
      from: '2025-12-01',
      to: '2025-12-15',
    });
  });

  it('on the 1st the span is a single day', () => {
    expect(sameSpanLastMonth('2026-07-01')).toEqual({
      from: '2026-06-01',
      to: '2026-06-01',
    });
  });

  it('a full previous month is covered when today is the last day', () => {
    expect(sameSpanLastMonth('2026-07-31')).toEqual({
      from: '2026-06-01',
      to: '2026-06-30',
    });
  });
});
