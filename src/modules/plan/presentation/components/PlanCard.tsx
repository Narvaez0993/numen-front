import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Button, Pill, Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';

import type { BillingPeriod, Plan } from '../../domain';

import { PlanFeatureRow } from './PlanFeatureRow';

type Props = {
  plan: Plan;
  period: BillingPeriod;
};

export function PlanCard({ plan, period }: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();

  const variant = plan.pricing ? plan.pricing[period] : null;
  const amount = plan.free ? plan.free.amount : variant?.amount;
  const unit = plan.free ? null : (variant?.unit ?? null);
  const sub = plan.free ? null : (variant?.sub ?? null);

  return (
    <View
      style={{
        backgroundColor: theme.colors.bgSurface,
        borderColor: plan.highlight
          ? 'rgba(0, 229, 168, 0.45)'
          : theme.colors.borderSubtle,
        borderWidth: plan.highlight ? 2 : 1,
        borderRadius: 18,
        padding: 16,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 10,
          marginBottom: 12,
        }}
      >
        <Text variant="h1" style={{ fontSize: 16 }}>
          {plan.title}
        </Text>
        {plan.isCurrent ? (
          <Pill variant="neutral" uppercase>
            {t('plan.status.current')}
          </Pill>
        ) : plan.highlight ? (
          <Pill variant="mint" uppercase>
            {t('plan.status.recommended')}
          </Pill>
        ) : null}
      </View>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'baseline',
          gap: 4,
          marginBottom: sub ? 4 : 14,
        }}
      >
        <Text
          variant="display"
          tabular
          style={{
            fontSize: plan.free ? 22 : 26,
            lineHeight: plan.free ? 22 : 26,
            letterSpacing: -0.52,
          }}
        >
          {amount}
        </Text>
        {unit ? (
          <Text
            variant="caption"
            color={theme.colors.textTertiary}
            style={{ fontSize: 13 }}
          >
            {unit}
          </Text>
        ) : null}
      </View>
      {sub ? (
        <Text
          variant="caption"
          color={theme.colors.textTertiary}
          style={{ fontSize: 11.5, marginBottom: 14 }}
        >
          {sub}
        </Text>
      ) : null}

      {plan.featuresHeader ? (
        <Text variant="label" style={{ fontSize: 12, marginBottom: 8 }}>
          {plan.featuresHeader}
        </Text>
      ) : null}

      <View style={{ gap: 8, marginBottom: plan.ctaLabel ? 16 : 0 }}>
        {plan.features.map((feature, i) => (
          <PlanFeatureRow key={i} feature={feature} />
        ))}
      </View>

      {plan.ctaLabel ? <Button label={plan.ctaLabel} full /> : null}
    </View>
  );
}
