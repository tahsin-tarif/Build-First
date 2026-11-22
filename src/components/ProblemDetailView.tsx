import {
  ArrowLeft,
  ArrowUp,
  CheckCircle2,
  Code2,
  ExternalLink,
  Hammer,
  Layers,
  MessageSquare,
  Send,
  Video,
} from 'lucide-react';
import { useState, type FormEvent } from 'react';
import type {
  Problem,
  ProblemComment,
  Solution,
  UserProfile,
} from '../types/marketplace';
import { formatCurrency } from '../utils/marketplaceLogic';

interface ProblemDetailViewProps {
  problem: Problem;
  comments: ProblemComment[];
  solutions: Solution[];
  currentUser: UserProfile;
  onBack: () => void;
  onToggleUpvote: (problemId: string) => void;
  onToggleBuildingIntent: (problemId: string) => void;
  onAddComment: (problemId: string, body: string) => void;
  onOpenSubmitSolution: (problemId: string) => void;
  onOpenDealRoomForSolution: (solution: Solution) => void;
  onToggleSolutionUpvote: (solutionId: string) => void;
}

export function ProblemDetailView({
  problem,
  comments,
  solutions,
  currentUser,
  onBack,
  onToggleUpvote,
  onToggleBuildingIntent,
  onAddComment,
  onOpenSubmitSolution,
  onOpenDealRoomForSolution,
  onToggleSolutionUpvote,
}: ProblemDetailViewProps) {
  const [commentText, setCommentText] = useState('');
  const [commentError, setCommentError] = useState('');
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  const handleCommentSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = commentText.trim();
    if (trimmed.length < 2) {
      setCommentError('Please write at least 2 characters before posting.');
      return;
    }
    setCommentError('');
    onAddComment(problem.id, trimmed);
    setCommentText('');
  };

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Breadcrumb */}
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Problem Feed</span>
      </button>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Main Breakdown + Clarification Thread + Solutions */}
        <div className="lg:col-span-8 space-y-8">
          {/* Problem Breakdown Card */}
          <article className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
              <span className="font-medium text-slate-800 dark:text-slate-200">
                {problem.category}
              </span>
              <span aria-hidden="true">·</span>
              <span
                className={
                  problem.status === 'Solution Ready'
                    ? 'font-medium text-emerald-700 dark:text-emerald-400'
                    : problem.status === 'In Progress'
                      ? 'font-medium text-amber-700 dark:text-amber-400'
                      : 'font-medium text-blue-700 dark:text-blue-400'
                }
              >
                {problem.status}
              </span>
              <span aria-hidden="true">·</span>
              <span>{problem.urgency} priority</span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">
                Posted {new Date(problem.createdAt).toLocaleDateString('en-US')}
              </span>
            </div>

            <h1 className="mt-3 font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white text-balance">
              {problem.title}
            </h1>

            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
              <span>
                Posted by{' '}
                <strong className="font-medium text-slate-900 dark:text-slate-100">
                  {problem.authorName}
                </strong>{' '}
                ({problem.authorRole})
              </span>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Problem Description
              </h2>
              <p className="mt-2 text-base leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-line">
                {problem.description}
              </p>
            </div>
          </article>

          {/* Submitted Solutions Showcase */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">
                  Submitted Solutions ({solutions.length})
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Working prototypes built specifically for this bottleneck. Test the live demo before buying.
                </p>
              </div>
              <button
                type="button"
                onClick={() => onOpenSubmitSolution(problem.id)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors whitespace-nowrap shrink-0"
              >
                <Code2 className="h-4 w-4" />
                <span>Submit Finished Solution</span>
              </button>
            </div>

            {solutions.length === 0 ? (
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center">
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  No finished solutions submitted yet
                </p>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  Are you a developer? Signal &ldquo;I&rsquo;m Building This&rdquo; or submit your working prototype to pitch {problem.authorName} directly.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {solutions.map((solution) => (
                  <article
                    key={solution.id}
                    data-testid={`solution-card-${solution.id}`}
                    className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-12">
                      {/* Screenshot Preview */}
                      <div className="md:col-span-5 bg-slate-100 dark:bg-slate-800/70">
                        {solution.screenshotUrl && !failedImages[solution.id] ? (
                          <img
                            src={solution.screenshotUrl}
                            alt={`Screenshot of ${solution.title}`}
                            referrerPolicy="no-referrer"
                            onError={() =>
                              setFailedImages((prev) => ({
                                ...prev,
                                [solution.id]: true,
                              }))
                            }
                            className="w-full h-52 md:h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-52 md:h-full min-h-[200px] bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 flex flex-col items-center justify-center p-6 text-center">
                            <Layers className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                            <span className="mt-2 text-xs font-medium text-slate-600 dark:text-slate-300">
                              {solution.title}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Solution Pitch & Actions */}
                      <div className="md:col-span-7 p-6 flex flex-col justify-between gap-4">
                        <div>
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                            <span className="inline-flex items-center gap-1 font-medium text-emerald-700 dark:text-emerald-400">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Working Demo
                            </span>
                            <span aria-hidden="true">·</span>
                            <span>Built by {solution.builderName}</span>
                            <span aria-hidden="true">·</span>
                            <span>{solution.licensingModel}</span>
                          </div>

                          <h3 className="mt-2 font-display text-lg font-semibold text-slate-900 dark:text-white">
                            {solution.title}
                          </h3>
                          <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                            {solution.pitch}
                          </p>

                          {solution.techStack.length > 0 && (
                            <div className="mt-3 text-xs font-mono text-slate-500 dark:text-slate-400">
                              Stack: {solution.techStack.join(' · ')}
                            </div>
                          )}
                        </div>

                        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                          <div className="font-mono text-base font-semibold text-slate-900 dark:text-white tabular-nums">
                            {formatCurrency(solution.priceAmount, solution.priceCurrency)}
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              onClick={() => onToggleSolutionUpvote(solution.id)}
                              className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-medium tabular-nums transition-colors ${
                                solution.upvotedByMe
                                  ? 'border-blue-600 bg-blue-50 text-blue-700 dark:border-blue-500 dark:bg-blue-950/60 dark:text-blue-300'
                                  : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                              }`}
                            >
                              <ArrowUp className="h-3.5 w-3.5" />
                              <span>{solution.upvotesCount}</span>
                            </button>

                            <a
                              href={solution.liveDemoUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors whitespace-nowrap"
                            >
                              <span>Live Demo</span>
                              <ExternalLink className="h-3 w-3" />
                            </a>

                            {solution.videoUrl && (
                              <a
                                href={solution.videoUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors whitespace-nowrap"
                              >
                                <Video className="h-3.5 w-3.5" />
                                <span>Walkthrough</span>
                              </a>
                            )}

                            <button
                              type="button"
                              onClick={() => onOpenDealRoomForSolution(solution)}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 dark:bg-blue-600 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-slate-800 dark:hover:bg-blue-700 transition-colors whitespace-nowrap"
                            >
                              <MessageSquare className="h-3.5 w-3.5" />
                              <span>Test Demo &amp; Chat with Builder</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>

          {/* Clarification Discussion Thread */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8">
            <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
              Clarification &amp; Scope Discussion ({comments.length})
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Builders ask quick edge-case questions here before writing code.
            </p>

            <div className="mt-6 space-y-4">
              {comments.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  No clarification questions yet. Start the thread below.
                </p>
              ) : (
                comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="pt-4 border-t border-slate-100 dark:border-slate-800 first:pt-0 first:border-t-0"
                  >
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <span className="font-medium text-slate-900 dark:text-slate-100">
                        {comment.authorName}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{comment.authorTag}</span>
                      <span aria-hidden="true">·</span>
                      <span className="tabular-nums">
                        {new Date(comment.createdAt).toLocaleDateString('en-US')}
                      </span>
                    </div>
                    <p className="mt-1.5 text-sm text-slate-700 dark:text-slate-300">
                      {comment.body}
                    </p>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleCommentSubmit} className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
              <label
                htmlFor="clarification-comment"
                className="block text-xs font-medium text-slate-700 dark:text-slate-300"
              >
                Ask a clarification question as {currentUser.displayName} (
                {currentUser.activeRole === 'builder' ? 'Builder' : 'Problem Poster'})
              </label>
              <div className="mt-2 flex flex-col sm:flex-row gap-2">
                <input
                  id="clarification-comment"
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="e.g. Does this need CSV export or direct Google Sheets sync?"
                  className="flex-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-blue-600 focus:outline-none"
                />
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-slate-900 dark:bg-slate-100 px-4 py-2 text-sm font-medium text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-white transition-colors whitespace-nowrap shrink-0"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Post Comment</span>
                </button>
              </div>
              {commentError && (
                <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">
                  {commentError}
                </p>
              )}
            </form>
          </div>
        </div>

        {/* Right Sticky Action Rail */}
        <aside className="lg:col-span-4 space-y-4">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-5">
            <div>
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Poster Budget Signal
              </div>
              <div className="mt-1 font-mono text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
                {problem.hasBudget
                  ? formatCurrency(problem.budgetAmount, problem.budgetCurrency)
                  : 'Open Idea'}
              </div>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {problem.hasBudget
                  ? 'Poster indicated willingness to pay for a working solution.'
                  : 'No fixed budget—ideal for SaaS multi-user tools or portfolio builds.'}
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-4">
              <div>
                <div className="font-mono text-xl font-semibold text-slate-900 dark:text-white tabular-nums">
                  {problem.upvotesCount}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  &ldquo;Me Too&rdquo; Votes
                </div>
              </div>
              <div>
                <div className="font-mono text-xl font-semibold text-slate-900 dark:text-white tabular-nums">
                  {problem.activeBuildersCount}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Active Builders
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
              <button
                type="button"
                onClick={() => onToggleUpvote(problem.id)}
                className={`w-full inline-flex items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
                  problem.upvotedByMe
                    ? 'border-blue-600 bg-blue-50 text-blue-700 dark:border-blue-500 dark:bg-blue-950/60 dark:text-blue-300'
                    : 'border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <ArrowUp className="h-4 w-4" />
                <span>
                  {problem.upvotedByMe
                    ? 'Upvoted ("Me Too")'
                    : 'I Have This Problem Too'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => onToggleBuildingIntent(problem.id)}
                className={`w-full inline-flex items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
                  problem.builtByMe
                    ? 'border-amber-600 bg-amber-50 text-amber-800 dark:border-amber-500 dark:bg-amber-950/50 dark:text-amber-300'
                    : 'border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Hammer className="h-4 w-4" />
                <span>
                  {problem.builtByMe
                    ? "Signaled: I'm Building This"
                    : "I'm Building This"}
                </span>
              </button>

              <button
                type="button"
                onClick={() => onOpenSubmitSolution(problem.id)}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
              >
                <Code2 className="h-4 w-4" />
                <span>Submit Finished Solution</span>
              </button>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
