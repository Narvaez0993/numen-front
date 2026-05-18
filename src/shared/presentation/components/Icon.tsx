import Svg, { Path } from 'react-native-svg';

/**
 * Tabler outline icons. Paths copied verbatim from the design bundle
 * (`icons.jsx`). To add a new icon, paste its Tabler path here.
 */
const TABLER_PATHS: Record<string, string[]> = {
  // Generic / nav
  plus: ['M12 5l0 14M5 12l14 0'],
  x: ['M18 6l-12 12M6 6l12 12'],
  'chevron-right': ['M9 6l6 6-6 6'],
  'chevron-left': ['M15 6l-6 6 6 6'],
  'chevron-down': ['M6 9l6 6 6-6'],
  'arrow-left': ['M5 12l14 0M5 12l6 6M5 12l6-6'],
  search: ['M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0', 'M21 21l-6 -6'],
  sparkles: [
    'M16 18a2 2 0 0 1 2 2a2 2 0 0 1 2-2a2 2 0 0 1-2-2a2 2 0 0 1-2 2zm0-12a2 2 0 0 1 2 2a2 2 0 0 1 2-2a2 2 0 0 1-2-2a2 2 0 0 1-2 2zm-7 12a6 6 0 0 1 6-6a6 6 0 0 1-6-6a6 6 0 0 1-6 6a6 6 0 0 1 6 6z',
  ],
  send: [
    'M10 14l11 -11',
    'M21 3l-6.5 18a.55 .55 0 0 1 -1 0L10 14L3 10.5a.55 .55 0 0 1 0 -1L21 3z',
  ],
  dots: [
    'M5 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0-2 0',
    'M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0-2 0',
    'M19 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0-2 0',
  ],
  check: ['M5 12l5 5l10 -10'],
  'alert-triangle': [
    'M12 9v4',
    'M10.363 3.591l-8.106 13.534a1.914 1.914 0 0 0 1.636 2.871h16.214a1.914 1.914 0 0 0 1.636 -2.87l-8.106 -13.536a1.914 1.914 0 0 0 -3.274 0z',
    'M12 16h.01',
  ],

  // Tab bar
  home: [
    'M5 12l-2 0l9 -9l9 9l-2 0',
    'M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-7',
    'M9 21v-6a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v6',
  ],
  'list-details': [
    'M13 5h8',
    'M13 9h5',
    'M13 15h8',
    'M13 19h5',
    'M3 4m0 1a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z',
    'M3 14m0 1a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z',
  ],
  target: [
    'M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0',
    'M12 12m-5 0a5 5 0 1 0 10 0a5 5 0 1 0 -10 0',
    'M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0',
  ],

  // Inputs / actions
  microphone: [
    'M9 2m0 3a3 3 0 0 1 3 -3h0a3 3 0 0 1 3 3v5a3 3 0 0 1 -3 3h0a3 3 0 0 1 -3 -3z',
    'M5 10a7 7 0 0 0 14 0',
    'M8 21l8 0',
    'M12 17l0 4',
  ],
  camera: [
    'M5 7h1a2 2 0 0 0 2 -2a1 1 0 0 1 1 -1h6a1 1 0 0 1 1 1a2 2 0 0 0 2 2h1a2 2 0 0 1 2 2v9a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-9a2 2 0 0 1 2 -2',
    'M12 13m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0',
  ],
  pencil: ['M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4', 'M13.5 6.5l4 4'],

  // Categories
  'shopping-cart': [
    'M4 19a2 2 0 1 0 4 0a2 2 0 0 0 -4 0',
    'M15 19a2 2 0 1 0 4 0a2 2 0 0 0 -4 0',
    'M17 17h-11v-14h-2',
    'M6 5l14 1l-1 7h-13',
  ],
  truck: [
    'M7 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0',
    'M17 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0',
    'M5 17h-2v-11a1 1 0 0 1 1 -1h9v12m-4 0h6m4 0h2v-6h-8m0 -5h5l3 5',
  ],
  car: [
    'M7 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0',
    'M17 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0',
    'M5 17h-2v-6l2 -5h9l4 5h1a2 2 0 0 1 2 2v4h-2m-4 0h-6m-6 -6h15m-6 0v-5',
  ],
  coffee: [
    'M3 14c.83 .642 2.077 1.017 3.5 1c1.423 .017 2.67 -.358 3.5 -1c.83 -.642 2.077 -1.017 3.5 -1c1.423 -.017 2.67 .358 3.5 1',
    'M8 3a2.4 2.4 0 0 0 -1 2a2.4 2.4 0 0 0 1 2',
    'M12 3a2.4 2.4 0 0 0 -1 2a2.4 2.4 0 0 0 1 2',
  ],
  movie: [
    'M4 4m0 2a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z',
    'M8 4l0 16',
    'M16 4l0 16',
    'M4 8l4 0',
    'M4 16l4 0',
    'M4 12l16 0',
    'M16 8l4 0',
    'M16 16l4 0',
  ],
  refresh: [
    'M20 11a8.1 8.1 0 0 0 -15.5 -2m-.5 -4v4h4',
    'M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4',
  ],

  // Subscriptions / services
  'device-tv': [
    'M3 7m0 1a1 1 0 0 1 1 -1h16a1 1 0 0 1 1 1v9a1 1 0 0 1 -1 1h-16a1 1 0 0 1 -1 -1z',
    'M16 3l-4 4l-4 -4',
  ],
  'brand-spotify': [
    'M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0',
    'M8 11.973c2.5 -1.473 5.5 -.973 7.5 .527',
    'M7 15c1.5 -1 4 -1.5 6.5 -.5',
    'M9 9c2 -.5 5 -.5 7.5 1',
  ],
  notebook: [
    'M6 4h11a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-11a1 1 0 0 1 -1 -1v-14a1 1 0 0 1 1 -1m3 0v18',
    'M13 8l2 0',
    'M13 12l2 0',
  ],

  // Misc
  bell: [
    'M10 5a2 2 0 1 1 4 0a7 7 0 0 1 4 6v3a4 4 0 0 0 2 3h-16a4 4 0 0 0 2 -3v-3a7 7 0 0 1 4 -6',
    'M9 17v1a3 3 0 0 0 6 0v-1',
  ],
  'credit-card': [
    'M3 5m0 3a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v8a3 3 0 0 1 -3 3h-12a3 3 0 0 1 -3 -3z',
    'M3 10l18 0',
    'M7 15l.01 0',
    'M11 15l2 0',
  ],
  'building-bank': [
    'M3 21l18 0',
    'M3 10l18 0',
    'M5 6l7 -3l7 3',
    'M4 10l0 11',
    'M20 10l0 11',
    'M8 14l0 3',
    'M12 14l0 3',
    'M16 14l0 3',
  ],
};

export type IconName = keyof typeof TABLER_PATHS | string;

type IconProps = {
  name: IconName;
  size?: number;
  color?: string;
  stroke?: number;
};

export function Icon({ name, size = 18, color = 'currentColor', stroke = 2 }: IconProps) {
  const paths = TABLER_PATHS[name];
  if (!paths) return null;
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths.map((d, i) => (
        <Path key={i} d={d} />
      ))}
    </Svg>
  );
}
