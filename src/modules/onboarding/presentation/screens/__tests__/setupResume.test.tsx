/**
 * HU-03 «Onboarding incompleto no deja la cuenta a medias»: a setup abandoned
 * before the first account picks up, on the next open, at the step the server
 * has no answer for — not at the name every time.
 *
 * The steps are stood in for by their names: what is under test is which one
 * the flow opens with, and what it already knows when it does.
 */

import { render, screen } from '@testing-library/react-native';
import { Text as MockText } from 'react-native';

import type { Account } from '@/modules/accounts/domain';

import { SetupFlow } from '../SetupFlow';

type Profile = { displayName: string; objective: string | null };

let mockServer: Profile = { displayName: '', objective: null };
let mockSession: Profile = { displayName: '', objective: null };
let mockAccounts: Account[] = [];

jest.mock('expo-router', () => ({ router: { replace: jest.fn() } }));

jest.mock('@/core/di/container', () => ({
  completeOnboardingUseCase: { execute: jest.fn() },
}));

jest.mock('@/modules/auth/presentation', () => ({
  // The session the steps save their answers into.
  useAuthStore: (select: (state: unknown) => unknown) => select({ session: mockSession }),
  useMe: () => ({ isPending: false, data: { user: mockServer } }),
  useUpdateName: () => ({ mutate: jest.fn() }),
  useUpdatePreferences: () => ({ mutate: jest.fn() }),
}));

jest.mock('@/modules/accounts/presentation/hooks/useAccounts', () => ({
  useAccounts: () => ({ isPending: false, data: { accounts: mockAccounts } }),
}));

jest.mock('../NameStep', () => ({
  NameStep: ({ initialValue }: { initialValue: string }) => (
    <MockText>{`step:name ${initialValue}`}</MockText>
  ),
}));
jest.mock('../GoalStep', () => ({
  GoalStep: ({ name }: { name: string }) => <MockText>{`step:goal ${name}`}</MockText>,
}));
jest.mock('../AccountStep', () => ({
  AccountStep: () => <MockText>step:account</MockText>,
}));
jest.mock('../MagicStep', () => ({
  MagicStep: ({ account }: { account: Account }) => (
    <MockText>{`step:magic ${account.name}`}</MockText>
  ),
}));

const NOMINA: Account = {
  id: 'acc-1',
  kind: 'debit',
  name: 'Nómina',
  sub: '',
  icon: 'building-bank',
  color: 'purple',
  currency: 'COP',
  balance: 1_200_000,
};

beforeEach(() => {
  mockServer = { displayName: '', objective: null };
  mockSession = { displayName: '', objective: null };
  mockAccounts = [];
});

describe('HU-03 · Onboarding incompleto', () => {
  it('starts at the name when nothing was answered', () => {
    render(<SetupFlow />);
    expect(screen.getByText('step:name')).toBeTruthy();
  });

  it('resumes at the objective, greeting with the name already saved', () => {
    mockServer = { displayName: 'Laura', objective: null };
    render(<SetupFlow />);

    expect(screen.getByText('step:goal Laura')).toBeTruthy();
    expect(screen.queryByText(/step:name/)).toBeNull();
  });

  it('resumes at the first account when only that is missing', () => {
    mockServer = { displayName: 'Laura', objective: 'ahorrar' };
    render(<SetupFlow />);

    expect(screen.getByText('step:account')).toBeTruthy();
  });

  it('resumes at the first expense, on the account already created', () => {
    mockServer = { displayName: 'Laura', objective: 'gastos' };
    mockAccounts = [NOMINA];
    render(<SetupFlow />);

    expect(screen.getByText('step:magic Nómina')).toBeTruthy();
  });

  it('trusts a name saved in this session while the profile is a minute old', () => {
    mockServer = { displayName: '', objective: null };
    mockSession = { displayName: 'Laura', objective: null };
    render(<SetupFlow />);

    expect(screen.getByText('step:goal Laura')).toBeTruthy();
  });
});
