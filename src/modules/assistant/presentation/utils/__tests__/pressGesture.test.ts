import { classifyTap, createPressController, HOLD_DELAY_MS } from '../pressGesture';

describe('classifyTap', () => {
  it('sends the left third back and the rest forward', () => {
    expect(classifyTap(0.1)).toBe('back');
    expect(classifyTap(0.32)).toBe('back');
    expect(classifyTap(0.34)).toBe('next');
    expect(classifyTap(0.9)).toBe('next');
  });
});

describe('createPressController', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  function build() {
    const events: string[] = [];
    const controller = createPressController({
      onHoldStart: () => events.push('hold-start'),
      onHoldEnd: () => events.push('hold-end'),
      onTap: (zone) => events.push(`tap-${zone}`),
    });
    return { events, controller };
  }

  it('a quick touch is a tap in the zone where the finger LANDED', () => {
    const { events, controller } = build();
    controller.pressIn(0.2);
    jest.advanceTimersByTime(HOLD_DELAY_MS - 1);
    controller.pressOut();
    expect(events).toEqual(['tap-back']);
  });

  it('holding past the delay pauses, and the release only resumes', () => {
    const { events, controller } = build();
    controller.pressIn(0.8);
    jest.advanceTimersByTime(HOLD_DELAY_MS);
    controller.pressOut();
    expect(events).toEqual(['hold-start', 'hold-end']);
  });

  it('a second press starts clean after a hold', () => {
    const { events, controller } = build();
    controller.pressIn(0.8);
    jest.advanceTimersByTime(HOLD_DELAY_MS);
    controller.pressOut();
    controller.pressIn(0.9);
    controller.pressOut();
    expect(events).toEqual(['hold-start', 'hold-end', 'tap-next']);
  });
});
