import { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';

import { useTheme } from '../theme';
import {
  isAfter,
  monthMatrix,
  monthName,
  shiftMonth,
  weekdayInitials,
} from '../utils/dates';

import { BottomSheet } from './BottomSheet';
import { Icon } from './Icon';
import { Text } from './Text';

type Props = {
  visible: boolean;
  /** Currently selected day (`YYYY-MM-DD`). */
  value: string;
  /** The user's today: days after it cannot be picked. */
  today: string;
  title: string;
  language?: string;
  onClose: () => void;
  onSelect: (iso: string) => void;
};

/**
 * Month calendar, built with plain views — no date library and no native picker,
 * so it looks the same on both platforms and adds no dependency.
 *
 * Future days are disabled: a movement is something that already happened (a
 * charge that has not posted yet is a subscription, not a movement).
 */
export function DatePickerSheet({
  visible,
  value,
  today,
  title,
  language = 'es',
  onClose,
  onSelect,
}: Props) {
  const [month, setMonth] = useState(value);

  // Reopen on the month of whatever is selected, not wherever we were left.
  useEffect(() => {
    if (visible) setMonth(value);
  }, [visible, value]);

  const weeks = monthMatrix(month);
  const headers = weekdayInitials(language);
  const canGoForward = shiftMonth(month, 1) <= today;

  return (
    <BottomSheet visible={visible} onClose={onClose} maxHeight="70%">
      <View style={{ paddingHorizontal: 18, paddingTop: 8, paddingBottom: 24, gap: 14 }}>
        <Text variant="h1" style={{ fontSize: 16, paddingRight: 40 }}>
          {title}
        </Text>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <MonthArrow
            icon="chevron-left"
            onPress={() => setMonth(shiftMonth(month, -1))}
          />
          <Text variant="label" style={{ fontSize: 13.5, textTransform: 'capitalize' }}>
            {monthName(month, language)} {month.slice(0, 4)}
          </Text>
          <MonthArrow
            icon="chevron-right"
            disabled={!canGoForward}
            onPress={() => setMonth(shiftMonth(month, 1))}
          />
        </View>

        <View style={{ flexDirection: 'row' }}>
          {headers.map((initial, index) => (
            <Text
              key={`${initial}-${index}`}
              variant="micro"
              muted
              style={{ flex: 1, textAlign: 'center', fontSize: 10.5 }}
            >
              {initial}
            </Text>
          ))}
        </View>

        <View style={{ gap: 4 }}>
          {weeks.map((week, weekIndex) => (
            <View key={weekIndex} style={{ flexDirection: 'row', gap: 4 }}>
              {week.map((iso, dayIndex) => (
                <DayCell
                  key={iso ?? `pad-${weekIndex}-${dayIndex}`}
                  iso={iso}
                  selected={iso === value}
                  isToday={iso === today}
                  disabled={iso !== null && isAfter(iso, today)}
                  onPress={() => {
                    if (iso) {
                      onSelect(iso);
                      onClose();
                    }
                  }}
                />
              ))}
            </View>
          ))}
        </View>
      </View>
    </BottomSheet>
  );
}

function MonthArrow({
  icon,
  disabled = false,
  onPress,
}: {
  icon: 'chevron-left' | 'chevron-right';
  disabled?: boolean;
  onPress: () => void;
}) {
  const { theme } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      hitSlop={8}
      style={({ pressed }) => ({
        width: 34,
        height: 34,
        borderRadius: 17,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.bgFloat,
        opacity: disabled ? 0.3 : pressed ? 0.7 : 1,
      })}
    >
      <Icon name={icon} size={15} color={theme.colors.textSecondary} />
    </Pressable>
  );
}

function DayCell({
  iso,
  selected,
  isToday,
  disabled,
  onPress,
}: {
  iso: string | null;
  selected: boolean;
  isToday: boolean;
  disabled: boolean;
  onPress: () => void;
}) {
  const { theme } = useTheme();

  if (iso === null) {
    return <View style={{ flex: 1, aspectRatio: 1 }} />;
  }

  const day = Number(iso.slice(-2));
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected, disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => ({
        flex: 1,
        aspectRatio: 1,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10,
        backgroundColor: selected ? theme.colors.accentMintBg : 'transparent',
        borderWidth: isToday && !selected ? 1 : 0,
        borderColor: theme.colors.borderDefault,
        opacity: disabled ? 0.25 : pressed ? 0.6 : 1,
      })}
    >
      <Text
        variant="label"
        tabular
        color={selected ? theme.colors.accentMint : theme.colors.textPrimary}
        style={{ fontSize: 13 }}
      >
        {day}
      </Text>
    </Pressable>
  );
}
