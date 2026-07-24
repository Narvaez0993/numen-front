import { Stack } from 'expo-router';

// `signup` (the welcome→register flow) is the group's anchor; `login` and
// `verify` are pushed/replaced on top of it.
export const unstable_settings = {
  initialRouteName: 'signup',
};

export default function AuthLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
