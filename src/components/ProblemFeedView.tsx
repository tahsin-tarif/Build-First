import { Plus, Search, SlidersHorizontal } from 'lucide-react';
import type {
  Problem,
  ProblemCategory,
  ProblemStatus,
  SortOption,
} from '../types/marketplace';
import {
  filterAndSortProblems,
  PROBLEM_CATEGORIES,
  PROBLEM_STATUSES,
} from '../utils/marketplaceLogic';
import { ProblemCard } from './ProblemCard';

interface ProblemFeedViewProps {
  problems: Problem[];
  search: string;
  onSearchChange: (val: string) => void;
  category: ProblemCategory | 'All';
  onCategoryChange: (val: ProblemCategory | 'All') => void;
  status: ProblemStatus | 'All';
  onStatusChange: (val: ProblemStatus | 'All') => void;
  sortBy: SortOption;
  onSortChange: (val: SortOption) => void;
  onResetFilters: () => void;
  onSelectProblem: (problemId: string) => void;
  onToggleUpvote: (problemId: string) => void;
  onOpenPostProblem: () => void;
}

export function ProblemFeedView({
  problems,
  search,
  onSearchChange,
  category,
  onCategoryChange,
  status,
  onStatusChange,
  sortBy,
  onSortChange,
  onResetFilters,
  onSelectProblem,
  onToggleUpvote,
  onOpenPostProblem,
}: ProblemFeedViewProps) {
  const filtered = filterAndSortProblems(problems, {
    search,
    category,
    status,
    sortBy,
  });

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      {/* Page Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 pb-8 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Problem Discovery Feed
          </h1>
          <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400">
            Browse real-world bottlenecks validated by user demand. Pick a problem, build a working solution, and pitch your live demo.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenPostProblem}
          className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors whitespace-nowrap shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>Post a Problem</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="mt-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search Input */}
          <div className="md:col-span-5 relative">
            <label htmlFor="problem-search" className="sr-only">
              Search problems
            </label>
            <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="problem-search"
              type="search"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search problems, workflows, or keywords..."
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 pl-10 pr-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none"
            />
          </div>

          {/* Category Dropdown */}
          <div className="md:col-span-3">
            <label htmlFor="problem-category-filter" className="sr-only">
              Filter by category
            </label>
            <select
              id="problem-category-filter"
              value={category}
              onChange={(e) =>
                onCategoryChange(e.target.value as ProblemCategory | 'All')
              }
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:border-blue-600 focus:outline-none"
            >
              <option value="All">All Categories</option>
              {PROBLEM_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Selector */}
          <div className="md:col-span-4 flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-slate-400 shrink-0 hidden sm:block" />
            <label htmlFor="problem-sort" className="sr-only">
              Sort problems
            </label>
            <select
              id="problem-sort"
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as SortOption)}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:border-blue-600 focus:outline-none"
            >
              <option value="most_upvoted">Sort: Most Upvoted (&ldquo;Me Too&rdquo;)</option>
              <option value="highest_bounty">Sort: Highest Bounty</option>
              <option value="newest">Sort: Newest</option>
            </select>
          </div>
        </div>

        {/* Status Segmented Tabs + Count */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div
            role="tablist"
            aria-label="Filter problems by status"
            className="inline-flex flex-nowrap max-w-full overflow-x-auto items-center gap-1 rounded-lg bg-slate-100 dark:bg-slate-800/80 p-1"
          >
            {(['All', ...PROBLEM_STATUSES] as const).map((item) => {
              const active = status === item;
              return (
                <button
                  key={item}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => onStatusChange(item)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                    active
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  {item === 'All' ? 'All Statuses' : item}
                </button>
              );
            })}
          </div>

          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums">
            Showing {filtered.length} of {problems.length} problems
          </span>
        </div>
      </div>

      {/* Problem Grid or Empty State */}
      {filtered.length === 0 ? (
        <div className="mt-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center">
          <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
            No problems match those filters
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
            Try clearing your search query or switching back to all categories and statuses—or post a new bottleneck yourself.
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={onResetFilters}
              className="rounded-lg border border-slate-300 dark:border-slate-700 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Reset Filters
            </button>
            <button
              type="button"
              onClick={onOpenPostProblem}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
            >
              Post a Problem
            </button>
          </div>
        </div>
      ) : (
        <div
          data-testid="problem-feed-grid"
          className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filtered.map((problem) => (
            <ProblemCard
              key={problem.id}
              problem={problem}
              onSelectProblem={onSelectProblem}
              onToggleUpvote={onToggleUpvote}
            />
          ))}
        </div>
      )}
    </section>
  );
}
