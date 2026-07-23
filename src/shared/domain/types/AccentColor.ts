/**
 * Shared color vocabulary used across domain (which categories/subscriptions
 * report a color name) and presentation (which maps the name to actual hex).
 *
 * Domain owns the type because the API will return color names as data;
 * presentation owns the mapping name → theme token.
 */
export type AccentColor = 'mint' | 'coral' | 'purple' | 'amber' | 'pink';
