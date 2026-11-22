import type {
  CurrencyCode,
  EscrowStatus,
  LicensingModel,
  Problem,
  ProblemCategory,
  ProblemStatus,
  Solution,
  SortOption,
  UrgencyLevel,
} from '../types/marketplace';

export const PROBLEM_CATEGORIES: ProblemCategory[] = [
  'Business & Retail',
  'Education',
  'Personal Productivity',
  'E-commerce',
  'Automation',
  'Other',
];

export const PROBLEM_STATUSES: ProblemStatus[] = [
  'Open for Builders',
  'In Progress',
  'Solution Ready',
];

export const LICENSING_MODELS: LicensingModel[] = [
  'One-Time Exclusive Buyout',
  'Multi-User License (SaaS/Template)',
  'Free / Open-Source Portfolio Project',
];

export const ESCROW_STEPS: EscrowStatus[] = [
  'Negotiating',
  'Payment Held in Escrow',
  'Code/Access Delivered',
  'Completed',
];

const CURRENCY_USD_RATE: Record<CurrencyCode, number> = {
  USD: 1,
  EUR: 1.08,
  BDT: 0.0083,
};

export function toUsdEquivalent(amount: number | null, currency: CurrencyCode): number {
  if (amount === null || Number.isNaN(amount)) return 0;
  return amount * (CURRENCY_USD_RATE[currency] ?? 1);
}

export function formatCurrency(amount: number | null, currency: CurrencyCode): string {
  if (amount === null || Number.isNaN(amount)) return 'Open Idea';
  if (amount === 0) return 'Free / Open-Source';
  const formatted = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
  }).format(amount);
  if (currency === 'BDT') return `${formatted} BDT`;
  if (currency === 'EUR') return `€${formatted}`;
  return `$${formatted}`;
}

export interface ProblemFilterOptions {
  search: string;
  category: ProblemCategory | 'All';
  status: ProblemStatus | 'All';
  sortBy: SortOption;
}

export function filterAndSortProblems(
  problems: Problem[],
  options: ProblemFilterOptions
): Problem[] {
  const query = options.search.trim().toLowerCase();

  const filtered = problems.filter((p) => {
    if (options.category !== 'All' && p.category !== options.category) return false;
    if (options.status !== 'All' && p.status !== options.status) return false;
    if (!query) return true;
    return (
      p.title.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query) ||
      p.authorName.toLowerCase().includes(query) ||
      p.category.toLowerCase().includes(query)
    );
  });

  return [...filtered].sort((a, b) => {
    if (options.sortBy === 'most_upvoted') {
      if (b.upvotesCount !== a.upvotesCount) return b.upvotesCount - a.upvotesCount;
    } else if (options.sortBy === 'highest_bounty') {
      const aUsd = a.hasBudget ? toUsdEquivalent(a.budgetAmount, a.budgetCurrency) : -1;
      const bUsd = b.hasBudget ? toUsdEquivalent(b.budgetAmount, b.budgetCurrency) : -1;
      if (bUsd !== aUsd) return bUsd - aUsd;
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

export interface SolutionFilterOptions {
  search: string;
  licensing: LicensingModel | 'All';
  category: ProblemCategory | 'All';
}

export function filterAndSortSolutions(
  solutions: Solution[],
  problemsById: Record<string, Problem>,
  options: SolutionFilterOptions
): Solution[] {
  const query = options.search.trim().toLowerCase();

  const filtered = solutions.filter((s) => {
    if (options.licensing !== 'All' && s.licensingModel !== options.licensing) return false;
    const parent = problemsById[s.problemId];
    if (options.category !== 'All' && parent?.category !== options.category) return false;
    if (!query) return true;
    return (
      s.title.toLowerCase().includes(query) ||
      s.pitch.toLowerCase().includes(query) ||
      s.problemTitle.toLowerCase().includes(query) ||
      s.builderName.toLowerCase().includes(query) ||
      s.techStack.some((t) => t.toLowerCase().includes(query))
    );
  });

  return [...filtered].sort((a, b) => b.upvotesCount - a.upvotesCount);
}

export function getNextEscrowStatus(current: EscrowStatus): EscrowStatus | null {
  const index = ESCROW_STEPS.indexOf(current);
  if (index === -1 || index >= ESCROW_STEPS.length - 1) return null;
  return ESCROW_STEPS[index + 1];
}

export function canTransitionEscrow(from: EscrowStatus, to: EscrowStatus): boolean {
  const fromIdx = ESCROW_STEPS.indexOf(from);
  const toIdx = ESCROW_STEPS.indexOf(to);
  return fromIdx !== -1 && toIdx === fromIdx + 1;
}

export interface ProblemInput {
  title: string;
  description: string;
  category: ProblemCategory;
  urgency: UrgencyLevel;
  hasBudget: boolean;
  budgetAmount: number | null;
  budgetCurrency: CurrencyCode;
}

export function validateProblemInput(input: ProblemInput): Record<string, string> {
  const errors: Record<string, string> = {};
  const title = input.title.trim();
  const description = input.description.trim();

  if (title.length < 5 || title.length > 160) {
    errors.title = 'Title must be between 5 and 160 characters.';
  }
  if (description.length < 15 || description.length > 4000) {
    errors.description = 'Description must be between 15 and 4,000 characters.';
  }
  if (input.hasBudget) {
    if (input.budgetAmount === null || Number.isNaN(input.budgetAmount) || input.budgetAmount <= 0) {
      errors.budgetAmount = 'Enter a positive budget amount or disable the budget toggle.';
    } else if (input.budgetAmount > 10_000_000) {
      errors.budgetAmount = 'Budget cannot exceed 10,000,000.';
    }
  }
  return errors;
}

export interface SolutionInput {
  title: string;
  pitch: string;
  liveDemoUrl: string;
  videoUrl: string;
  licensingModel: LicensingModel;
  priceAmount: number;
  techStack: string[];
}

export function isValidHttpUrl(url: string): boolean {
  try {
    const parsed = new URL(url.trim());
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

export function validateSolutionInput(input: SolutionInput): Record<string, string> {
  const errors: Record<string, string> = {};
  const title = input.title.trim();
  const pitch = input.pitch.trim();

  if (title.length < 3 || title.length > 140) {
    errors.title = 'Solution title must be between 3 and 140 characters.';
  }
  if (pitch.length < 10 || pitch.length > 3000) {
    errors.pitch = 'Pitch must be between 10 and 3,000 characters.';
  }
  if (!isValidHttpUrl(input.liveDemoUrl)) {
    errors.liveDemoUrl = 'Enter a valid Live Demo URL starting with https:// or http://.';
  }
  if (input.videoUrl.trim() && !isValidHttpUrl(input.videoUrl)) {
    errors.videoUrl = 'Video walkthrough URL must start with https:// or http://.';
  }
  if (input.licensingModel !== 'Free / Open-Source Portfolio Project') {
    if (Number.isNaN(input.priceAmount) || input.priceAmount <= 0) {
      errors.priceAmount = 'Enter a positive asking price for paid licenses.';
    }
  }
  if (input.techStack.length > 10) {
    errors.techStack = 'Limit tech stack tags to 10 items.';
  }
  return errors;
}

export function computePlatformStats(
  problems: Problem[],
  solutions: Solution[],
  dealsClosedCount: number
) {
  const readySolutions = solutions.length;
  const problemsSolved = problems.filter((p) => p.status === 'Solution Ready').length;
  const activeBuilders =
    problems.reduce((sum, p) => sum + p.activeBuildersCount, 0) +
    new Set(solutions.map((s) => s.builderId)).size;

  return {
    problemsSolved: Math.max(problemsSolved, dealsClosedCount),
    activeBuilders,
    readySolutions,
    totalUpvotes: problems.reduce((sum, p) => sum + p.upvotesCount, 0),
  };
}
