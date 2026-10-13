import { Pressable, View } from 'react-native';

import { Orb, Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';

type Props = {
  name: string;
  initials: string;
  /** «Contigo desde marzo». Absent until `/auth/me` answers. */
  since: string | null;
  onPress: () => void;
};

/**
 * Who you are, at the top of your own screen.
 *
 * The avatar is the app's orb, not a flat circle of accent: the same glass
 * sphere that signs the capture button and breathes through onboarding. It is
 * the one place in the app where it stands for a person rather than for the
 * agent, and reusing it is what makes that read as the same object.
 *
 * The line under the name is a relationship, not a setting — the design asks for
 * how long you have been here, which is the only fact in this block that the
 * client cannot work out on its own. It stays silent rather than guessing.
 */
export function IdentityBlock({ name, initials, since, onPress }: Props) {
  const { theme } = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <Orb size={56}>
        <Text
          color={theme.palette.orbInk}
          style={{ fontSize: 20, fontFamily: 'Geist_500Medium' }}
        >
          {initials}
        </Text>
      </Orb>

      <View style={{ flex: 1, minWidth: 0 }}>
        <Text numberOfLines={1} style={{ fontSize: 20, letterSpacing: -0.5 }}>
          {name}
        </Text>
        {since ? (
          <Text
            color={theme.colors.textTertiary}
            style={{ fontSize: 11.5, marginTop: 3 }}
          >
            {since}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}
