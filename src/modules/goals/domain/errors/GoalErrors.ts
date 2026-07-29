import { DomainError } from '@/shared/domain';

export class GoalNotFoundError extends DomainError {
  readonly code = 'goals.not_found';
  constructor() {
    super('Goal not found');
  }
}

/** Free keeps one pocket open at a time; archived ones never count. */
export class GoalLimitReachedError extends DomainError {
  readonly code = 'goals.limit_reached';
  constructor() {
    super('Active goal limit reached for your plan');
  }
}

/** Archiving or deleting demands an empty pocket — withdraw first. */
export class GoalNotEmptyError extends DomainError {
  readonly code = 'goals.not_empty';
  constructor() {
    super('Withdraw the money first: the pocket is not empty');
  }
}

export class GoalInsufficientError extends DomainError {
  readonly code = 'goals.insufficient';
  constructor() {
    super('That withdrawal is more than the pocket holds');
  }
}

export class GoalArchivedError extends DomainError {
  readonly code = 'goals.archived';
  constructor() {
    super('This goal is archived');
  }
}

export class InvalidGoalError extends DomainError {
  readonly code = 'goals.invalid';
  constructor(message = 'Invalid goal') {
    super(message);
  }
}
