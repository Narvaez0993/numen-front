export type PlanFeature = string | { strong: string; text: string };

export type PlanPriceVariant = {
  amount: string;
  unit: string;
  sub: string;
};

export type PlanPricing = {
  mensual: PlanPriceVariant;
  anual: PlanPriceVariant;
};

export type Plan = {
  id: 'esencial' | 'plus';
  title: string;
  highlight: boolean;
  isCurrent: boolean;
  free: { amount: string } | null;
  pricing: PlanPricing | null;
  featuresHeader: string | null;
  features: readonly PlanFeature[];
  ctaLabel: string | null;
};
