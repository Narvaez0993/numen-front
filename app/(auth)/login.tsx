import { Redirect } from 'expo-router';

// TODO: restore <LoginScreen /> when the back exposes /auth/login.
// Until then, hitting /login (e.g. via Expo Router URL persistence after a
// reload) bounces back to the home screen — there's no real auth gate yet.
export default function LoginRoute() {
  return <Redirect href="/" />;
}
