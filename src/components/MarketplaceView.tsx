import {
  ArrowUp,
  CheckCircle2,
  ExternalLink,
  Layers,
  MessageSquare,
  Search,
  Video,
} from 'lucide-react';
import { useState } from 'react';
import type {
  LicensingModel,
  Problem,
  ProblemCategory,
  Solution,
} from '../types/marketplace';
import {
  filterAndSortSolutions,
  formatCurrency,
  LICENSING_MODELS,
  PROBLEM_CATEGORIES,
} from '../utils/marketplaceLogic';

interface MarketplaceViewProps {
  solutions: Solution[];
  problems: Problem[];
  onSelectProblem: (problemId: string) => void;
  onOpenDealRoomForSolution: (solution: Solution) => void;
  onToggleSolutionUpvote: (solutionId: string) => void;
}

export function MarketplaceView({
  solutions,
  problems,
  onSelectProblem,
  onOpenDealRoomForSolution,
  onToggleSolutionUpvote,
}: MarketplaceViewProps) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<ProblemCategory | 'All'>('All');
  const [licensing, setLicensing] = useState<LicensingModel | 'All'>('All');
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  const problemsById = Object.fromEntries(problems.map((p) => [p.id, p]));
  const filtered = filterAndSortSolutions(solutions, problemsById, {
    search,
    category,
    licensing,
  });

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="pb-8 border-b border-slate-200 dark:border-slate-800">
        <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Ready-to-Buy Solutions Marketplace
        </h1>
        <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
          Every tool below was built to solve a real user bottleneck. Test any live demo immediately and license it for your own workflow.
        </p>
      </div>

      {/* Filters */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-12 gap-3">
        <div className="md:col-span-5 relative">
          <label htmlFor="marketplace-search" className="sr-only">
            Search solutions
          </label>
          <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            id="marketplace-search"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search working tools, stacks, or builders..."
            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 pl-10 pr-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none"
          />
        </div>

        <div className="md:col-span-3">
          <label htmlFor="marketplace-category" className="sr-only">
            Filter solutions by category
          </label>
          <select
            id="marketplace-category"
            value={category}
            onChange={(e) =>
              setCategory(e.target.value as ProblemCategory | 'All')
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

        <div className="md:col-span-4">
          <label htmlFor="marketplace-licensing" className="sr-only">
            Filter by licensing model
          </label>
          <select
            id="marketplace-licensing"
            value={licensing}
            onChange={(e) =>
              setLicensing(e.target.value as LicensingModel | 'All')
            }
            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:border-blue-600 focus:outline-none"
          >
            <option value="All">All Licensing Models</option>
            {LICENSING_MODELS.map((model) => (
              <option key={model} value={model}>
                {model}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="mt-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center">
          <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
            No ready solutions match your filter
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Clear your filters to browse all available working prototypes.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearch('');
              setCategory('All');
              setLicensing('All');
            }}
            className="mt-5 rounded-lg border border-slate-300 dark:border-slate-700 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div
          data-testid="marketplace-solutions-grid"
          className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filtered.map((solution) => (
            <article
              key={solution.id}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden flex flex-col justify-between"
            >
              <div>
                {solution.screenshotUrl && !failedImages[solution.id] ? (
                  <img
                    src={solution.screenshotUrl}
                    alt={`Live preview of ${solution.title}`}
                    referrerPolicy="no-referrer"
                    onError={() =>
                      setFailedImages((prev) => ({
                        ...prev,
                        [solution.id]: true,
                      }))
                    }
                    className="w-full h-48 object-cover border-b border-slate-100 dark:border-slate-800"
                  />
                ) : (
                  <div className="w-full h-48 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 flex flex-col items-center justify-center p-6 text-center border-b border-slate-100 dark:border-slate-800">
                    <Layers className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                    <span className="mt-2 text-xs font-medium text-slate-600 dark:text-slate-300">
                      {solution.title}
                    </span>
                  </div>
                )}

                <div className="p-6">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                    <span className="inline-flex items-center gap-1 font-medium text-emerald-700 dark:text-emerald-400">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Ready Demo
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>By {solution.builderName}</span>
                  </div>

                  <h2 className="mt-2 font-display text-lg font-semibold text-slate-900 dark:text-white leading-snug">
                    {solution.title}
                  </h2>

                  <button
                    type="button"
                    onClick={() => onSelectProblem(solution.problemId)}
                    className="mt-1.5 text-left text-xs text-blue-600 dark:text-blue-400 hover:underline line-clamp-1"
                  >
                    Solves: {solution.problemTitle}
                  </button>

                  <p className="mt-3 text-sm text-slate-600 dark:text-slate-300 line-clamp-3">
                    {solution.pitch}
                  </p>

                  <div className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                    {solution.licensingModel}
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-base font-semibold text-slate-900 dark:text-white tabular-nums">
                    {formatCurrency(solution.priceAmount, solution.priceCurrency)}
                  </span>

                  <button
                    type="button"
                    onClick={() => onToggleSolutionUpvote(solution.id)}
                    className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-medium tabular-nums transition-colors ${
                      solution.upvotedByMe
                        ? 'border-blue-600 bg-blue-50 text-blue-700 dark:border-blue-500 dark:bg-blue-950/60 dark:text-blue-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                    <span>{solution.upvotesCount}</span>
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <a
                    href={solution.liveDemoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 whitespace-nowrap"
                  >
                    <span>Live Demo</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                  {solution.videoUrl && (
                    <a
                      href={solution.videoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 whitespace-nowrap"
                    >
                      <Video className="h-3.5 w-3.5" />
                      <span>Video</span>
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => onOpenDealRoomForSolution(solution)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-slate-900 dark:bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800 dark:hover:bg-blue-700 transition-colors whitespace-nowrap"
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    <span>Chat &amp; Buy</span>
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
