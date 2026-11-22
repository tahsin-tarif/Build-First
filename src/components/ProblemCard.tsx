import { ArrowUp, CheckCircle2, Clock, Code2, Hammer } from 'lucide-react';
import type { Problem } from '../types/marketplace';
import { formatCurrency } from '../utils/marketplaceLogic';

interface ProblemCardProps {
  problem: Problem;
  onSelectProblem: (problemId: string) => void;
  onToggleUpvote: (problemId: string) => void;
}

export function ProblemCard({
  problem,
  onSelectProblem,
  onToggleUpvote,
}: ProblemCardProps) {
  const formattedDate = new Date(problem.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  const renderStatus = () => {
    if (problem.status === 'Solution Ready') {
      return (
        <span className="inline-flex items-center gap-1 font-medium text-emerald-700 dark:text-emerald-400">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Solution Ready
        </span>
      );
    }
    if (problem.status === 'In Progress') {
      return (
        <span className="inline-flex items-center gap-1 font-medium text-amber-700 dark:text-amber-400">
          <Hammer className="h-3.5 w-3.5" />
          In Progress
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 font-medium text-blue-700 dark:text-blue-400">
        <Clock className="h-3.5 w-3.5" />
        Open for Builders
      </span>
    );
  };

  return (
    <article
      data-testid={`problem-card-${problem.id}`}
      className="group rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 transition-colors hover:border-slate-300 dark:hover:border-slate-700 flex flex-col justify-between gap-5"
    >
      <div>
        {/* Clean unboxed metadata row */}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
          <span className="font-medium text-slate-700 dark:text-slate-300">
            {problem.category}
          </span>
          <span aria-hidden="true">·</span>
          {renderStatus()}
          <span aria-hidden="true">·</span>
          <span>{problem.urgency} priority</span>
          <span aria-hidden="true">·</span>
          <span className="tabular-nums">{formattedDate}</span>
        </div>

        {/* Title & plain-language problem statement */}
        <button
          type="button"
          onClick={() => onSelectProblem(problem.id)}
          className="mt-3 text-left block w-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 rounded"
        >
          <h3 className="font-display text-lg font-semibold leading-snug text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {problem.title}
          </h3>
        </button>

        <p className="mt-2.5 text-sm leading-relaxed text-slate-600 dark:text-slate-300 line-clamp-3">
          {problem.description}
        </p>
      </div>

      {/* Bottom bar: Budget, Builder activity, Me Too Upvote */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="text-xs font-medium text-slate-900 dark:text-slate-100 font-mono tabular-nums">
            {problem.hasBudget
              ? `Willing to pay: ${formatCurrency(problem.budgetAmount, problem.budgetCurrency)}`
              : 'Open Idea / No Fixed Budget'}
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
            <span className="inline-flex items-center gap-1">
              <Code2 className="h-3.5 w-3.5" />
              {problem.activeBuildersCount}{' '}
              {problem.activeBuildersCount === 1 ? 'Builder' : 'Builders'} working
            </span>
            {problem.solutionsCount > 0 && (
              <>
                <span aria-hidden="true">·</span>
                <span className="font-medium text-emerald-700 dark:text-emerald-400">
                  {problem.solutionsCount}{' '}
                  {problem.solutionsCount === 1 ? 'Solution' : 'Solutions'} submitted
                </span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onToggleUpvote(problem.id)}
            aria-pressed={Boolean(problem.upvotedByMe)}
            aria-label={`Me Too upvote for ${problem.title}`}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 tabular-nums ${
              problem.upvotedByMe
                ? 'border-blue-600 bg-blue-50 text-blue-700 dark:border-blue-500 dark:bg-blue-950/60 dark:text-blue-300'
                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600'
            }`}
          >
            <ArrowUp className="h-3.5 w-3.5" />
            <span>Me Too</span>
            <span className="font-mono font-semibold">{problem.upvotesCount}</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectProblem(problem.id)}
            className="inline-flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
          >
            View
          </button>
        </div>
      </div>
    </article>
  );
}
