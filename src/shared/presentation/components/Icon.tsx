import Svg, { Path } from 'react-native-svg';

/**
 * Tabler outline icons. Paths copied verbatim from the design bundle
 * (`icons.jsx`). To add a new icon, paste its Tabler path here.
 */
const TABLER_PATHS: Record<string, string[]> = {
  // The five tabs. Paths verbatim from the redesign bundle, which picked a
  // different metaphor for each: a pulse for the month's pace, two crossing
  // arrows for money moving, bars for the year, a gauge for the cap.
  'tab-inicio': ['M3 12h3.5l2.5 7l4 -14l2.5 7h5.5'],
  'tab-movimientos': [
    'M8 4v16M8 4l-3.5 3.5M8 4l3.5 3.5',
    'M16 20V4M16 20l-3.5 -3.5M16 20l3.5 -3.5',
  ],
  'tab-historia': [
    'M4 19V5',
    'M4 19h16',
    'M8 16V11',
    'M12 16V7',
    'M16 16v-6',
    'M20 16v-9',
  ],
  'tab-presupuesto': [
    'M12 21a9 9 0 1 1 9 -9',
    'M12 12l5 -3',
    'M12 12m-1.5 0a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0 -3 0',
  ],
  'tab-chat': [
    'M12 3l1.9 4.6l4.6 1.9l-4.6 1.9l-1.9 4.6l-1.9 -4.6l-4.6 -1.9l4.6 -1.9z',
    'M18 17l.8 2.2l2.2 .8l-2.2 .8l-.8 2.2l-.8 -2.2l-2.2 -.8l2.2 -.8z',
  ],

  // Privacy: the eye that blurs every figure on the screen.
  eye: [
    'M10 12a2 2 0 1 0 4 0a2 2 0 0 0 -4 0',
    'M21 12c-2.4 4 -5.4 6 -9 6c-3.6 0 -6.6 -2 -9 -6c2.4 -4 5.4 -6 9 -6c3.6 0 6.6 2 9 6',
  ],
  'eye-off': [
    'M10.585 10.587a2 2 0 0 0 2.829 2.828',
    'M16.681 16.673a8.717 8.717 0 0 1 -4.681 1.327c-3.6 0-6.6-2-9-6c1.272-2.12 2.712-3.678 4.32-4.674m2.86-1.146a9.055 9.055 0 0 1 1.82-.18c3.6 0 6.6 2 9 6c-.666 1.11-1.379 2.067-2.138 2.87',
    'M3 3l18 18',
  ],

  // Capture: typing, and a waveform for a note left to be read later.
  typography: ['M4 7v-1h16v1', 'M9 18h6', 'M12 6v12'],
  waveform: ['M3 12h2M7 8v8M11 5v14M15 9v6M19 11v2'],

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
  books: [
    'M5 4m0 1a1 1 0 0 1 1 -1h2a1 1 0 0 1 1 1v14a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1z',
    'M9 4m0 1a1 1 0 0 1 1 -1h2a1 1 0 0 1 1 1v14a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1z',
    'M5 8h4',
    'M9 16h4',
    'M13.803 4.56l2.184 -.53c.562 -.135 1.133 .19 1.282 .732l3.695 13.418a1.02 1.02 0 0 1 -.634 1.219l-.133 .041l-2.184 .53c-.562 .135 -1.133 -.19 -1.282 -.732l-3.695 -13.418a1.02 1.02 0 0 1 .634 -1.219l.133 -.041z',
    'M14 9l4 -1',
    'M16 16l3.923 -.98',
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
  cash: [
    'M7 9m0 2a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v6a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2z',
    'M14 14m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0',
    'M17 9v-2a2 2 0 0 0 -2 -2h-10a2 2 0 0 0 -2 2v6a2 2 0 0 0 2 2h2',
  ],

  // Onboarding
  'brand-apple': [
    'M9 7c-3 0-4 3-4 5.5 0 3 2 7.5 4 7.5 1.088-.046 1.679-.5 3-.5 1.312 0 1.5.5 3 .5s4-3 4-5c-.028-.01-2.472-.403-2.5-3-.019-2.17 2.416-2.954 2.5-3-1.023-1.492-2.951-1.963-3.5-2-1.433-.111-2.83 1-3.5 1-.68 0-1.9-1-3-1z',
    'M12 4a2 2 0 0 0 2-2a2 2 0 0 0-2 2',
  ],
  'brand-google': [
    'M20.945 11a9 9 0 1 1 -3.284 -5.997l-2.655 2.392a5.5 5.5 0 1 0 2.585 6.605h-5.591v-3h8.945z',
  ],
  mail: [
    'M3 7a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v10a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-10z',
    'M3 7l9 6l9 -6',
  ],
  'pig-money': [
    'M15 11v.01',
    'M5.173 8.378a3 3 0 1 1 4.656 -1.377',
    'M16 4v3.803a6.019 6.019 0 0 1 2.658 3.197h1.341a1 1 0 0 1 1 1v2a1 1 0 0 1 -1 1h-1.342c-.336 .95 -.907 1.8 -1.658 2.473v2.027a1.5 1.5 0 0 1 -3 0v-.583a6.04 6.04 0 0 1 -1 .083h-4a6.04 6.04 0 0 1 -1 -.083v.583a1.5 1.5 0 0 1 -3 0v-2.027a6 6 0 0 1 3 -10.473h2.5l4.5 -3z',
  ],
  'chain-off': [
    'M3 3l18 18',
    'M9 8h-1a4 4 0 0 0 -3.995 3.8l-.005 .2c0 .12 .005 .24 .015 .36',
    'M16 8h2a4 4 0 0 1 4 4a4 4 0 0 1 -2 3.464',
    'M9 12h2m4 0h1',
  ],
  'receipt-off': [
    'M5 21v-13m0 -4h14v6m0 4v7l-3 -2l-2 2l-2 -2l-2 2l-2 -2l-3 2',
    'M9 7h1m4 0h1',
    'M3 3l18 18',
  ],

  // Profile rows
  palette: [
    'M12 21a9 9 0 0 1 0 -18c4.97 0 9 3.582 9 8c0 1.06 -.474 2.078 -1.318 2.828c-.844 .75 -1.989 1.172 -3.182 1.172h-2.5a2 2 0 0 0 -1 3.75a1.3 1.3 0 0 1 -1 2.25',
    'M8.5 10.5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0',
    'M12.5 7.5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0',
    'M16.5 10.5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0',
  ],
  star: [
    'M12 17.75l-6.172 3.245l1.179 -6.873l-4.993 -4.867l6.9 -1.002l3.086 -6.253l3.086 6.253l6.9 1.002l-4.993 4.867l1.179 6.873z',
  ],
  download: [
    'M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2',
    'M7 11l5 5l5 -5',
    'M12 4l0 12',
  ],

  // Categories
  'tools-kitchen-2': [
    'M19 3v12h-5c-.023 -3.681 .184 -7.406 5 -12zm0 12v6h-1v-3m-10 -14v17m-3 -17v3a3 3 0 1 0 6 0v-3',
  ],
  bolt: ['M13 3l0 7l6 0l-8 11l0 -7l-6 0l8 -11'],
  heart: ['M19.5 12.572l-7.5 7.428l-7.5 -7.428a5 5 0 1 1 7.5 -6.566a5 5 0 1 1 7.5 6.572'],
  school: ['M22 9l-10 -4l-10 4l10 4l10 -4v6', 'M6 10.6v5.4a6 3 0 0 0 12 0v-5.4'],
  'home-2': [
    'M5 12l-2 0l9 -9l9 9l-2 0',
    'M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-7',
    'M10 21v-6a2 2 0 0 1 2 -2h0a2 2 0 0 1 2 2v6',
  ],

  // Expense sheet
  trash: [
    'M4 7l16 0',
    'M10 11l0 6',
    'M14 11l0 6',
    'M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12',
    'M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3',
  ],
  tag: [
    'M7.859 6h-2.834a2.025 2.025 0 0 0 -2.025 2.025v2.834c0 .537 .213 1.052 .593 1.432l6.617 6.617a2.025 2.025 0 0 0 2.864 0l2.834 -2.834a2.025 2.025 0 0 0 0 -2.864l-6.617 -6.617a2.025 2.025 0 0 0 -1.432 -.593z',
    'M7.5 9.5l0 0',
  ],
  wand: [
    'M6 21l15 -15l-3 -3l-15 15l3 3',
    'M15 6l3 3',
    'M9 3a2 2 0 0 0 2 2a2 2 0 0 0 -2 2a2 2 0 0 0 -2 -2a2 2 0 0 0 2 -2',
    'M19 13a2 2 0 0 0 2 2a2 2 0 0 0 -2 2a2 2 0 0 0 -2 -2a2 2 0 0 0 2 -2',
  ],
  image: [
    'M15 8h.01',
    'M3 6a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v12a3 3 0 0 1 -3 3h-12a3 3 0 0 1 -3 -3v-12z',
    'M3 16l5 -5c.928 -.893 2.072 -.893 3 0l5 5',
    'M14 14l1 -1c.928 -.893 2.072 -.893 3 0l3 3',
  ],

  // Hero variant picker
  adjustments: [
    'M4 10a2 2 0 1 0 4 0a2 2 0 0 0 -4 0',
    'M6 4l0 4',
    'M6 12l0 8',
    'M10 16a2 2 0 1 0 4 0a2 2 0 0 0 -4 0',
    'M12 4l0 10',
    'M12 18l0 2',
    'M16 7a2 2 0 1 0 4 0a2 2 0 0 0 -4 0',
    'M18 4l0 1',
    'M18 9l0 11',
  ],
  sun: [
    'M14.828 14.828a4 4 0 1 0 -5.656 -5.656a4 4 0 0 0 5.656 5.656z',
    'M6.343 17.657l-1.414 1.414',
    'M6.343 6.343l-1.414 -1.414',
    'M17.657 6.343l1.414 -1.414',
    'M17.657 17.657l1.414 1.414',
    'M3 12l-2 0',
    'M12 3l0 -2',
    'M12 21l0 2',
    'M21 12l2 0',
  ],

  // Home layout picker / Gastado card
  'arrow-up-right': ['M17 7l-10 10', 'M8 7h9v9'],
  'layout-grid': [
    'M4 4m0 1a1 1 0 0 1 1 -1h6a1 1 0 0 1 1 1v6a1 1 0 0 1 -1 1h-6a1 1 0 0 1 -1 -1z',
    'M14 4m0 1a1 1 0 0 1 1 -1h6a1 1 0 0 1 1 1v6a1 1 0 0 1 -1 1h-6a1 1 0 0 1 -1 -1z',
    'M4 14m0 1a1 1 0 0 1 1 -1h6a1 1 0 0 1 1 1v6a1 1 0 0 1 -1 1h-6a1 1 0 0 1 -1 -1z',
    'M14 14m0 1a1 1 0 0 1 1 -1h6a1 1 0 0 1 1 1v6a1 1 0 0 1 -1 1h-6a1 1 0 0 1 -1 -1z',
  ],

  // Deudas feature
  users: [
    'M9 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0',
    'M3 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2',
    'M16 3.13a4 4 0 0 1 0 7.75',
    'M21 21v-2a4 4 0 0 0 -3 -3.85',
  ],
  'info-circle': [
    'M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0',
    'M12 8h.01',
    'M11 12h1v4h1',
  ],
  'alert-circle': ['M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0', 'M12 8v4', 'M12 16h.01'],
  equal: ['M5 10h14', 'M5 14h14'],
  'user-up': [
    'M9 10a4 4 0 1 0 0 -8a4 4 0 0 0 0 8z',
    'M3 22v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2',
    'M19 16v-6',
    'M16 13l3 -3l3 3',
  ],
  checks: ['M7 12l5 5l10 -10', 'M2 12l5 5m5 -5l5 -5'],
  'arrow-down-left': ['M7 17l10 -10', 'M16 17h-9v-9'],
  calendar: [
    'M4 5m0 2a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z',
    'M16 3v4',
    'M8 3v4',
    'M4 11h16',
    'M11 15h1',
    'M12 15v3',
  ],
  'calendar-event': [
    'M4 5m0 2a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z',
    'M16 3v4',
    'M8 3v4',
    'M4 11h16',
    'M8 15h2v2h-2z',
  ],
};

/**
 * A name from the table below, or any string — because most icons arrive from the API
 * (a category's `icon`), where the client cannot know the set in advance.
 *
 * That `| string` is also why a **typo in our own code compiles**: it did, and shipped a
 * mint square with a hole in it where a check should have been. The warning in `Icon`
 * exists to make the next one loud instead of invisible.
 */
export type IconName = keyof typeof TABLER_PATHS | string;

export const ICON_NAMES = Object.keys(TABLER_PATHS);

type IconProps = {
  name: IconName;
  size?: number;
  color?: string;
  stroke?: number;
  filled?: boolean;
};

export function Icon({
  name,
  size = 18,
  color = 'currentColor',
  stroke = 2,
  filled = false,
}: IconProps) {
  const paths = TABLER_PATHS[name];
  if (!paths) {
    // Nothing is still the right thing to draw — a placeholder glyph inside a coloured
    // box looks worse than an empty one — but in dev it says so, because a silent hole
    // is exactly how `trending-up` (a name that never existed) reached a screenshot.
    if (__DEV__) console.warn(`[Icon] unknown name "${name}"`);
    return null;
  }
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? color : 'none'}
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
