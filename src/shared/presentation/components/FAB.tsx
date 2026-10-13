import { Pressable } from 'react-native';

import { Icon } from './Icon';
import { Orb } from './Orb';

/**
 * `coral` and `pink` no longer pick a colour — the redesign has one FAB and it
 * wears the palette. The prop stays so the screens that pass it keep compiling
 * until they are redesigned; it is ignored.
 */
export type FabVariant = 'coral' | 'pink';

type Props = {
  onPress?: () => void;
  bottomOffset?: number;
  variant?: FabVariant;
};

/**
 * The orb, floating. 60px at `right:12`, exactly where the bundle puts it.
 *
 * It used to be a solid coral disc. It is glass now because the design leans on
 * one signature object rather than one signature colour: the same sphere carries
 * the palette here, in the onboarding, and in the capture sheet, and it is what
 * makes five different accents still look like the same app.
 */
export function FAB({ onPress, bottomOffset = 118 }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => ({
        position: 'absolute',
        right: 12,
        bottom: bottomOffset,
        transform: [{ scale: pressed ? 0.94 : 1 }],
        zIndex: 4,
      })}
    >
      <Orb size={60}>
        <Icon name="plus" size={24} stroke={2} color="#FFFFFF" />
      </Orb>
    </Pressable>
  );
}
