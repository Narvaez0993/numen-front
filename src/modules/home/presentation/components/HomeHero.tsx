import { Trans, useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import type { Objective } from '@/shared/domain';
import { Icon, Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';
import { amountDigits, formatMoney } from '@/shared/presentation/utils/formatMoney';

import type { HeroGoal } from '../../domain/types/HomeOverview';

/**
 * What the hero leads with. The server picks it (`focus`) from the objective the
 * user declared and the data that exists; Home turns that into one of these.
 */
export type HeroFace =
  | {
      kind: 'spend';
      spent: number;
      /** Signed share against the same stretch of last month. `null` on a first
       *  month — a zero there would read as "you spent the same". */
      change: number | null;
      /** The month of the last Corte that exists — the one that already closed,
       *  never the month in progress, which has no Corte yet. `null` before the
       *  first one, and then there is no link: it would open an empty list. */
      corteMonth: string | null;
      onCortePress: () => void;
    }
  | { kind: 'goal'; goal: HeroGoal; onPress: () => void }
  | {
      /** Saving without a goal yet: what the month kept out of what came in. */
      kind: 'saved';
      saved: number;
      savingsRate: number;
      onNewGoal: () => void;
    }
  | {
      kind: 'debt';
      cardDebt: number;
      cardLimit: number;
      cardsCount: number;
      iOwe: number;
      owedToMe: number;
      onPeoplePress: () => void;
      onCardsPress: () => void;
    }
  | {
      /** The objective's data is missing: ask for it, and keep the month's spend
       *  under the question so the screen still says something true. */
      kind: 'invite';
      objective: Objective | null;
      spent: number;
      onPress: () => void;
    };

type Props = { face: HeroFace };

/**
 * The sentence, then the figure.
 *
 * The old hero led with the number and explained it underneath. This leads with
 * what the number MEANS — "vas 12% más liviana que el mes pasado" — because that
 * is the only part a person can act on, and the amount is right below for anyone
 * who wants it.
 *
 * The design draws one face, the month's spend. The others keep its exact shape —
 * sentence, label with its link, figure — and change only the content, because
 * Home answers what the user said they came for: someone saving sees their goal,
 * someone paying off debt sees the debt. Same screen, a different first thing.
 *
 * On a first month there is nothing to compare against, so the sentence is about
 * the month itself. Inventing a trend from one data point would be the app
 * pretending to know the user better than it does.
 */
export function HomeHero({ face }: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();

  switch (face.kind) {
    case 'spend': {
      const pct = face.change === null ? null : Math.abs(Math.round(face.change * 100));
      const lighter = (face.change ?? 0) < 0;
      return (
        <Shape
          sentence={
            <Sentence
              i18nKey={
                pct === null
                  ? 'home.hero.firstMonth'
                  : lighter
                    ? 'home.hero.lighter'
                    : 'home.hero.heavier'
              }
              values={{ pct }}
            />
          }
          label={t('home.hero.spent')}
          link={
            face.corteMonth === null
              ? undefined
              : t('home.hero.corte', { month: face.corteMonth })
          }
          onLink={face.onCortePress}
          amount={face.spent}
        />
      );
    }

    case 'goal': {
      const { goal } = face;
      return (
        <Shape
          sentence={
            <Sentence
              i18nKey={goal.pct >= 1 ? 'home.hero.goalDone' : 'home.hero.goal'}
              // Floored: «100%» has to mean the goal is reached, not 99.6% of it.
              values={{ pct: Math.floor(goal.pct * 100), name: goal.name }}
            />
          }
          label={t('home.hero.saved')}
          link={t('home.hero.goals')}
          onLink={face.onPress}
          amount={goal.saved}
          suffix={t('home.hero.of', { amount: formatMoney(goal.target) })}
        />
      );
    }

    case 'saved':
      return (
        <Shape
          sentence={
            <Sentence
              i18nKey={face.saved < 0 ? 'home.hero.overspent' : 'home.hero.keeps'}
              values={{ pct: Math.round(face.savingsRate * 100) }}
            />
          }
          label={t('home.hero.savedMonth')}
          link={t('home.hero.newGoal')}
          onLink={face.onNewGoal}
          amount={face.saved}
        />
      );

    case 'debt': {
      const people = face.iOwe > 0;
      const cards = face.cardDebt > 0;
      const sentence =
        cards && people ? (
          <Sentence i18nKey="home.hero.debtBoth" />
        ) : people ? (
          <Sentence i18nKey="home.hero.debtPeople" />
        ) : face.cardLimit > 0 ? (
          <Sentence
            i18nKey="home.hero.debtCards"
            count={face.cardsCount}
            values={{ pct: Math.round((face.cardDebt / face.cardLimit) * 100) }}
          />
        ) : (
          <Sentence i18nKey="home.hero.debtCardsPlain" />
        );
      return (
        <Shape
          sentence={sentence}
          label={t('home.hero.owe')}
          // People's debts live in Deudas; a card's lives with the accounts.
          link={people ? t('home.hero.debts') : t('home.hero.cards')}
          onLink={people ? face.onPeoplePress : face.onCardsPress}
          amount={face.cardDebt + face.iOwe}
          footnote={
            face.owedToMe > 0 ? (
              // An asset, so never added to the figure: its own line, in the
              // colour of money coming in.
              <Text
                tabular
                color={theme.colors.accentMint}
                style={{ fontSize: 11.5, marginTop: 8 }}
              >
                {t('home.hero.owedToMe', { amount: formatMoney(face.owedToMe) })}
              </Text>
            ) : null
          }
        />
      );
    }

    case 'invite': {
      const key = face.objective ?? 'gastos';
      return (
        <Shape
          sentence={<Sentence i18nKey={`home.hero.invite.${key}`} />}
          label={t('home.hero.spent')}
          link={t(`home.invite.${key}.action`)}
          onLink={face.onPress}
          amount={face.spent}
        />
      );
    }
  }
}

function Shape({
  sentence,
  label,
  link,
  onLink,
  amount,
  suffix,
  footnote,
}: {
  sentence: React.ReactNode;
  label: string;
  link?: string;
  onLink: () => void;
  amount: number;
  suffix?: string;
  footnote?: React.ReactNode;
}) {
  const { theme } = useTheme();

  return (
    <View style={{ gap: 16 }}>
      {sentence}

      <View>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 7,
          }}
        >
          <Text
            variant="micro"
            uppercase
            color={theme.colors.textTertiary}
            style={{ letterSpacing: 2.2 }}
          >
            {label}
          </Text>
          {link !== undefined ? (
            <Pressable
              accessibilityRole="button"
              onPress={onLink}
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <Text
                color={theme.palette.acc3}
                style={{ fontSize: 11.5, fontWeight: '500' }}
              >
                {link}
              </Text>
              <Icon
                name="chevron-right"
                size={13}
                stroke={2.2}
                color={theme.palette.acc}
              />
            </Pressable>
          ) : null}
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 3 }}>
          {/* The minus goes before the symbol — «−$12.000», never «$-12.000». */}
          <Text
            color={theme.colors.textTertiary}
            style={{ fontSize: 19, fontWeight: '300' }}
          >
            {amount < 0 ? '−$' : '$'}
          </Text>
          <Text
            tabular
            style={{
              fontSize: 38,
              fontWeight: '500',
              letterSpacing: -1.8,
              color: theme.colors.textPrimary,
            }}
          >
            {amountDigits(Math.abs(amount))}
          </Text>
          {suffix !== undefined ? (
            <Text
              tabular
              color={theme.colors.textTertiary}
              style={{ fontSize: 13, marginLeft: 6 }}
            >
              {suffix}
            </Text>
          ) : null}
        </View>

        {footnote}
      </View>
    </View>
  );
}

function Sentence({
  i18nKey,
  values,
  count,
}: {
  i18nKey: string;
  values?: Record<string, unknown>;
  count?: number;
}) {
  const { theme } = useTheme();

  return (
    <Text
      style={{
        fontSize: 25,
        lineHeight: 31,
        fontWeight: '300',
        letterSpacing: -0.7,
        color: theme.colors.textPrimary,
      }}
    >
      <Trans
        i18nKey={i18nKey}
        values={values}
        count={count}
        components={{ b: <Text style={{ fontSize: 25, fontWeight: '500' }} /> }}
      />
    </Text>
  );
}
