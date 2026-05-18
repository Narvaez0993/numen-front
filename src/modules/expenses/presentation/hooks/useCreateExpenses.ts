import { useMutation } from '@tanstack/react-query';

import { container } from '@/core/di/container';

import type {
  CreateExpensesInputDTO,
  CreateExpensesOutputDTO,
} from '../../application/dto/CreateExpenseDTO';

export function useCreateExpenses() {
  return useMutation<CreateExpensesOutputDTO, Error, CreateExpensesInputDTO>({
    mutationFn: (input) => container.createExpensesUseCase.execute(input),
  });
}
