import { X } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import type {
  CurrencyCode,
  ProblemCategory,
  UrgencyLevel,
} from '../types/marketplace';
import {
  PROBLEM_CATEGORIES,
  validateProblemInput,
  type ProblemInput,
} from '../utils/marketplaceLogic';

interface PostProblemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitProblem: (input: ProblemInput, authorRole: string) => void;
}

export function PostProblemModal({
  isOpen,
  onClose,
  onSubmitProblem,
}: PostProblemModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ProblemCategory>('Business & Retail');
  const [urgency, setUrgency] = useState<UrgencyLevel>('Standard');
  const [authorRole, setAuthorRole] = useState('Small Business Owner');
  const [hasBudget, setHasBudget] = useState(true);
  const [budgetAmount, setBudgetAmount] = useState('100');
  const [budgetCurrency, setBudgetCurrency] = useState<CurrencyCode>('USD');
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const parsedBudget = hasBudget ? Number(budgetAmount) : null;
    const input: ProblemInput = {
      title,
      description,
      category,
      urgency,
      hasBudget,
      budgetAmount: parsedBudget,
      budgetCurrency,
    };

    const validationErrors = validateProblemInput(input);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    onSubmitProblem(input, authorRole.trim() || 'Community Member');
    setTitle('');
    setDescription('');
    setErrors({});
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="post-problem-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto"
    >
      <div className="w-full max-w-xl rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xl my-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2
              id="post-problem-title"
              className="font-display text-xl font-bold text-slate-900 dark:text-white"
            >
              Post a Daily Bottleneck
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Describe what wastes your time in plain language. No technical jargon needed.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Post a Problem modal"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div>
            <label
              htmlFor="problem-title-input"
              className="block text-sm font-medium text-slate-800 dark:text-slate-200"
            >
              Problem Title
            </label>
            <input
              id="problem-title-input"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Automatically sort daily supplier PDF invoices into Excel"
              className="mt-1.5 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:border-blue-600 focus:outline-none"
            />
            {errors.title && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                {errors.title}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="problem-description-input"
              className="block text-sm font-medium text-slate-800 dark:text-slate-200"
            >
              Describe what wastes your time or frustrates you
            </label>
            <textarea
              id="problem-description-input"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain your current manual workflow, how often it happens, and what an ideal outcome looks like..."
              className="mt-1.5 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:border-blue-600 focus:outline-none"
            />
            {errors.description && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                {errors.description}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="problem-category-select"
                className="block text-sm font-medium text-slate-800 dark:text-slate-200"
              >
                Category
              </label>
              <select
                id="problem-category-select"
                value={category}
                onChange={(e) => setCategory(e.target.value as ProblemCategory)}
                className="mt-1.5 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:border-blue-600 focus:outline-none"
              >
                {PROBLEM_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="problem-urgency-select"
                className="block text-sm font-medium text-slate-800 dark:text-slate-200"
              >
                Urgency Level
              </label>
              <select
                id="problem-urgency-select"
                value={urgency}
                onChange={(e) => setUrgency(e.target.value as UrgencyLevel)}
                className="mt-1.5 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:border-blue-600 focus:outline-none"
              >
                <option value="Low">Low (Nice to have)</option>
                <option value="Standard">Standard (This month)</option>
                <option value="Urgent">Urgent (Hurting operations daily)</option>
              </select>
            </div>
          </div>

          <div>
            <label
              htmlFor="problem-role-input"
              className="block text-sm font-medium text-slate-800 dark:text-slate-200"
            >
              Your Role / Context (optional)
            </label>
            <input
              id="problem-role-input"
              type="text"
              value={authorRole}
              onChange={(e) => setAuthorRole(e.target.value)}
              placeholder="e.g. Boutique Shop Owner, Graduate Student, Clinic Manager"
              className="mt-1.5 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:border-blue-600 focus:outline-none"
            />
          </div>

          {/* Optional Willing to Pay Toggle */}
          <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 p-4 space-y-3">
            <label className="flex items-center justify-between gap-3 cursor-pointer">
              <div>
                <span className="block text-sm font-medium text-slate-900 dark:text-slate-100">
                  Willing to pay for a working solution?
                </span>
                <span className="block text-xs text-slate-500 dark:text-slate-400">
                  You only pay after testing the live demo.
                </span>
              </div>
              <input
                type="checkbox"
                checked={hasBudget}
                onChange={(e) => setHasBudget(e.target.checked)}
                className="h-4 w-4 accent-blue-600 rounded"
              />
            </label>

            {hasBudget && (
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="col-span-2">
                  <label htmlFor="problem-budget-amount" className="sr-only">
                    Budget amount
                  </label>
                  <input
                    id="problem-budget-amount"
                    type="number"
                    min="1"
                    value={budgetAmount}
                    onChange={(e) => setBudgetAmount(e.target.value)}
                    placeholder="Amount"
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm font-mono text-slate-900 dark:text-slate-100 focus:border-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="problem-budget-currency" className="sr-only">
                    Currency
                  </label>
                  <select
                    id="problem-budget-currency"
                    value={budgetCurrency}
                    onChange={(e) =>
                      setBudgetCurrency(e.target.value as CurrencyCode)
                    }
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-blue-600 focus:outline-none"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="BDT">BDT</option>
                    <option value="EUR">EUR (€)</option>
                  </select>
                </div>
                {errors.budgetAmount && (
                  <p className="col-span-3 text-xs text-red-600 dark:text-red-400">
                    {errors.budgetAmount}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 dark:border-slate-700 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
            >
              Publish Problem
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
