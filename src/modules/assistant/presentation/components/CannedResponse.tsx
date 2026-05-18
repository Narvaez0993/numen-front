import { View } from 'react-native';

import { IconBox, Text } from '@/shared/presentation/components';
import { useTheme } from '@/shared/presentation/theme';
import { formatCOP } from '@/shared/presentation/utils/formatCOP';

import type { AccentColor } from '@/shared/domain';

import type { CannedResponseId } from '../../domain/types/Assistant';

import { FormattedText } from './FormattedText';
import { MiniBarChart } from './MiniBarChart';
import { RichStat } from './RichStat';

type Props = { id: CannedResponseId };

export function CannedResponse({ id }: Props) {
  switch (id) {
    case 'cafe':
      return <CafeResponse />;
    case 'subs':
      return <SubsResponse />;
    case 'abril':
      return <AbrilResponse />;
    case 'saldo':
      return <SaldoResponse />;
    case 'finde':
      return <FindeResponse />;
    case 'honest':
      return <HonestResponse />;
  }
}

function CafeResponse() {
  const { theme } = useTheme();
  return (
    <View style={{ gap: 10 }}>
      <FormattedText text="Este mes llevas $422.400 en Café — 96% de tu presupuesto de $440.000." />
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <RichStat label="Quedan" value="$17.600" color="coral" sub="17 días" />
        <RichStat label="Diario sano" value="$1.035" sub="para llegar" />
      </View>
      <Text
        variant="body"
        color={theme.colors.textSecondary}
        style={{ fontSize: 12, lineHeight: 18, paddingTop: 2 }}
      >
        Tu top:{' '}
        <Text variant="body" style={{ fontWeight: '500', fontSize: 12 }}>
          Juan Valdez
        </Text>{' '}
        6× y{' '}
        <Text variant="body" style={{ fontWeight: '500', fontSize: 12 }}>
          Tinto matinal
        </Text>{' '}
        6×.
      </Text>
    </View>
  );
}

type Sub = {
  name: string;
  amount: number;
  days: number;
  color: AccentColor;
  icon: string;
};

function SubsResponse() {
  const { theme } = useTheme();
  const subs: Sub[] = [
    { name: 'Notion', amount: 45000, days: 9, color: 'purple', icon: 'notebook' },
    { name: 'Netflix', amount: 30900, days: 2, color: 'coral', icon: 'device-tv' },
    { name: 'Spotify', amount: 16900, days: 5, color: 'mint', icon: 'brand-spotify' },
  ];
  return (
    <View style={{ gap: 10 }}>
      <FormattedText text="Pagas $92.800/mes en 3 suscripciones activas." />
      <View style={{ gap: 6 }}>
        {subs.map((s) => (
          <View
            key={s.name}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
              backgroundColor: theme.colors.bgFloat,
              borderRadius: 10,
              paddingHorizontal: 10,
              paddingVertical: 8,
            }}
          >
            <IconBox name={s.icon} color={s.color} size={28} iconSize={14} radius={8} />
            <Text variant="label" style={{ flex: 1, fontSize: 12.5 }} numberOfLines={1}>
              {s.name}
            </Text>
            <Text
              variant="micro"
              muted
              style={{ fontSize: 10.5, letterSpacing: 0 }}
              numberOfLines={1}
            >
              en {s.days}d
            </Text>
            <Text
              variant="label"
              color={theme.colors.textSecondary}
              tabular
              style={{ fontSize: 12.5, minWidth: 60, textAlign: 'right' }}
            >
              {formatCOP(s.amount)}
            </Text>
          </View>
        ))}
      </View>
      <Text variant="caption" muted style={{ fontSize: 11.5 }}>
        Anual proyectado:{' '}
        <Text
          variant="caption"
          color={theme.colors.textSecondary}
          tabular
          style={{ fontWeight: '500', fontSize: 11.5 }}
        >
          $1.113.600
        </Text>
      </Text>
    </View>
  );
}

function AbrilResponse() {
  const { theme } = useTheme();
  return (
    <View style={{ gap: 12 }}>
      <Text variant="body" style={{ fontSize: 13, lineHeight: 19.5 }}>
        Vamos parejo con abril, pero proyectamos cerrar arriba.
      </Text>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <RichStat label="Abril (final)" value="$2.150.000" sub="cerró" />
        <RichStat
          label="Mayo (proyectado)"
          value="$4.250.000"
          color="amber"
          sub="a este ritmo"
        />
      </View>
      <View style={{ paddingTop: 4 }}>
        <MiniBarChart
          data={[
            { label: 'E', v: 78 },
            { label: 'F', v: 92 },
            { label: 'M', v: 88 },
            { label: 'A', v: 86 },
            { label: 'M', v: 124 },
          ]}
          highlight={4}
          color="amber"
        />
      </View>
      <Text
        variant="caption"
        color={theme.colors.textTertiary}
        style={{ fontSize: 11.5, lineHeight: 17 }}
      >
        El brinco viene de Café y un cargo grande en gasolina ($85.000 el sábado).
      </Text>
    </View>
  );
}

function SaldoResponse() {
  return (
    <FormattedText text="Tu saldo neto es $5.245.000 — eso es 3 cuentas + efectivo menos $850.000 de deuda en BBVA Crédito (paga el 5 de junio)." />
  );
}

function FindeResponse() {
  const { theme } = useTheme();
  return (
    <View style={{ gap: 8 }}>
      <FormattedText text="El último finde gastaste $155.500 — un poco más que tu promedio de $128.000." />
      <Text
        variant="body"
        color={theme.colors.textSecondary}
        style={{ fontSize: 12, lineHeight: 18 }}
      >
        Lo más fuerte:{' '}
        <Text variant="body" style={{ fontWeight: '500', fontSize: 12 }}>
          Tuya gasolina $85.000
        </Text>{' '}
        el sábado y{' '}
        <Text variant="body" style={{ fontWeight: '500', fontSize: 12 }}>
          Cine Andino $42.000
        </Text>{' '}
        en la noche.
      </Text>
    </View>
  );
}

function HonestResponse() {
  return (
    <Text variant="body" style={{ fontSize: 13, lineHeight: 19.5 }}>
      Aún no tengo data suficiente para responder eso bien. Probá preguntarme por tus
      categorías, suscripciones o cómo va el mes.
    </Text>
  );
}
