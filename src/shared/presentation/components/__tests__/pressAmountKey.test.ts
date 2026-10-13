import { pressAmountKey } from '../AmountKeypad';

describe('pressAmountKey', () => {
  it('appends a digit', () => {
    expect(pressAmountKey('25', '3')).toBe('253');
  });

  it('appends three zeros at once', () => {
    // The reason the key exists: "veinte mil" is two taps instead of five.
    expect(pressAmountKey('20', '000')).toBe('20000');
  });

  it('trims the last digit', () => {
    expect(pressAmountKey('253', 'back')).toBe('25');
  });

  it('is a no-op backspacing an empty amount', () => {
    expect(pressAmountKey('', 'back')).toBe('');
  });

  it('never grows a leading zero', () => {
    // "0" then "5" is five, not "05" — which would format as $05.
    expect(pressAmountKey('', '0')).toBe('');
    expect(pressAmountKey('', '000')).toBe('');
    expect(pressAmountKey('0', '5')).toBe('5');
  });

  it('refuses a thirteenth digit', () => {
    // Past this it is a mis-tap, not a purchase, and the amount stops fitting
    // the 50px line it is typed into.
    const twelve = '123456789012';
    expect(pressAmountKey(twelve, '3')).toBe(twelve);
    expect(pressAmountKey(twelve, '000')).toBe(twelve);
  });

  it('lets 000 land when there is room for it', () => {
    expect(pressAmountKey('123456789', '000')).toBe('123456789000');
  });
});
