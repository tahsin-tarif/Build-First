import { ArrowRight, CheckCircle2, ExternalLink, Layers } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';
import { HERO_SHOWCASE_IMAGE } from '../data/seedData';
import type { Problem, Solution } from '../types/marketplace';
import { formatCurrency } from '../utils/marketplaceLogic';
import { ProblemCard } from './ProblemCard';

interface LandingViewProps {
  problems: Problem[];
  solutions: Solution[];
  stats: {
    problemsSolved: number;
    activeBuilders: number;
    readySolutions: number;
    totalUpvotes: number;
  };
  onOpenPostProblem: () => void;
  onExploreProblems: () => void;
  onSelectProblem: (problemId: string) => void;
  onToggleUpvote: (problemId: string) => void;
  onOpenMarketplace: () => void;
}

export function LandingView({
  problems,
  solutions,
  stats,
  onOpenPostProblem,
  onExploreProblems,
  onSelectProblem,
  onToggleUpvote,
  onOpenMarketplace,
}: LandingViewProps) {
  const [previewStage, setPreviewStage] = useState<'problem' | 'solution'>('solution');
  const [heroImgFailed, setHeroImgFailed] = useState(false);

  const featuredProblem = problems[0];
  const featuredSolution =
    solutions.find((s) => s.problemId === featuredProblem?.id) ?? solutions[0];
  const trendingProblems = [...problems]
    .sort((a, b) => b.upvotesCount - a.upvotesCount)
    .slice(0, 3);

  return (
    <div>
      {/* Hero Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-12 pb-16 lg:pt-20 lg:pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
          {/* Left Copy Column */}
          <div className="lg:col-span-6 flex flex-col justify-center">
            <p className="text-xs font-medium tracking-wide text-blue-600 dark:text-blue-400">
              Build First, Buy Later · Zero-Risk Software Marketplace
            </p>
            <h1 className="mt-4 font-display text-4xl sm:text-5xl font-bold tracking-tight text-slate-900 dark:text-white leading-[1.1] text-balance">
              Post a Problem. Get a Working Solution.
            </h1>
            <p className="mt-5 text-base sm:text-lg leading-relaxed text-slate-600 dark:text-slate-300 max-w-xl">
              Skip agency retainers and vague proposals. Describe a daily workflow bottleneck in plain language—independent developers build working prototypes first and pitch live demos you can test before paying a cent.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={onOpenPostProblem}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-700 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                <span>Post a Problem</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={onExploreProblems}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-5 py-3 text-sm font-medium text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
              >
                <span>Explore Problems to Build</span>
              </button>
            </div>
          </div>

          {/* Right Visual + Interactive Problem-to-Solution Preview Card */}
          <div className="lg:col-span-6 flex flex-col justify-between gap-4">
            <div className="relative rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
              {!heroImgFailed ? (
                <img
                  src={HERO_SHOWCASE_IMAGE}
                  alt="Small business owner and developer reviewing a working software prototype on a studio display"
                  referrerPolicy="no-referrer"
                  onError={() => setHeroImgFailed(true)}
                  className="w-full h-56 sm:h-64 object-cover"
                />
              ) : (
                <div className="w-full h-56 sm:h-64 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 flex flex-col items-center justify-center p-6 text-center">
                  <Layers className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                  <p className="mt-2 text-sm font-medium text-slate-700 dark:text-slate-200">
                    Interactive Problem-to-Solution Showcase
                  </p>
                </div>
              )}

              {/* Interactive Problem-to-Solution Switcher */}
              <div className="p-6 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between gap-4 mb-4">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Interactive Flow Preview
                  </span>
                  <div
                    role="group"
                    aria-label="Preview stage"
                    className="inline-flex rounded-lg bg-slate-100 dark:bg-slate-800 p-0.5"
                  >
                    <button
                      type="button"
                      onClick={() => setPreviewStage('problem')}
                      className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                        previewStage === 'problem'
                          ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      1. Posted Problem
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewStage('solution')}
                      className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                        previewStage === 'solution'
                          ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      2. Built Solution
                    </button>
                  </div>
                </div>

                {previewStage === 'problem' && featuredProblem ? (
                  <motion.div
                    key="preview-problem"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.18 }}
                  >
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {featuredProblem.category} · Posted by {featuredProblem.authorName} ·{' '}
                      <span className="font-mono tabular-nums">
                        {featuredProblem.upvotesCount} Me Too votes
                      </span>
                    </div>
                    <h2 className="mt-1.5 font-display text-base font-semibold text-slate-900 dark:text-white">
                      {featuredProblem.title}
                    </h2>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 line-clamp-2">
                      {featuredProblem.description}
                    </p>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-xs font-mono font-medium text-slate-700 dark:text-slate-300 tabular-nums">
                        Budget:{' '}
                        {formatCurrency(
                          featuredProblem.budgetAmount,
                          featuredProblem.budgetCurrency
                        )}
                      </span>
                      <button
                        type="button"
                        onClick={() => onSelectProblem(featuredProblem.id)}
                        className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        Inspect Problem →
                      </button>
                    </div>
                  </motion.div>
                ) : featuredSolution ? (
                  <motion.div
                    key="preview-solution"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.18 }}
                  >
                    <div className="flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Live Prototype Ready · Built by {featuredSolution.builderName}</span>
                    </div>
                    <h2 className="mt-1.5 font-display text-base font-semibold text-slate-900 dark:text-white">
                      {featuredSolution.title}
                    </h2>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 line-clamp-2">
                      {featuredSolution.pitch}
                    </p>
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-mono font-medium text-slate-700 dark:text-slate-300 tabular-nums">
                        {featuredSolution.licensingModel} ·{' '}
                        {formatCurrency(
                          featuredSolution.priceAmount,
                          featuredSolution.priceCurrency
                        )}
                      </span>
                      <button
                        type="button"
                        onClick={() => onSelectProblem(featuredSolution.problemId)}
                        className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        <span>Test Demo &amp; Chat</span>
                        <ExternalLink className="h-3 w-3" />
                      </button>
                    </div>
                  </motion.div>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        {/* Full-Width Live Stats Strip */}
        <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800 grid grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="font-mono text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white tabular-nums">
              {stats.problemsSolved}
            </div>
            <div className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Problems Solved
            </div>
          </div>
          <div>
            <div className="font-mono text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white tabular-nums">
              {stats.activeBuilders}
            </div>
            <div className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Active Builders
            </div>
          </div>
          <div>
            <div className="font-mono text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white tabular-nums">
              {stats.readySolutions}
            </div>
            <div className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Ready-to-Buy Solutions
            </div>
          </div>
          <div>
            <div className="font-mono text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white tabular-nums">
              {stats.totalUpvotes}
            </div>
            <div className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Total &ldquo;Me Too&rdquo; Demand Votes
            </div>
          </div>
        </div>
      </section>

      {/* How It Works (3-Step Flow) */}
      <section className="border-y border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white text-balance">
              How Build First reverses the software marketplace
            </h2>
            <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-300">
              Developers compete on working software instead of slide decks. Problem posters pay only when they have tested a real solution.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
              <div className="font-mono text-xs font-medium text-blue-600 dark:text-blue-400">
                01. Share your daily problem
              </div>
              <h3 className="mt-2 font-display text-lg font-semibold text-slate-900 dark:text-white">
                Describe the bottleneck in plain English
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                No technical specs required. Other users facing the same issue click &ldquo;Me Too&rdquo; to validate demand and optional bounties.
              </p>
            </div>

            <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
              <div className="font-mono text-xs font-medium text-blue-600 dark:text-blue-400">
                02. Developers build a working prototype
              </div>
              <h3 className="mt-2 font-display text-lg font-semibold text-slate-900 dark:text-white">
                Builders ship live demos first
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                Engineers signal &ldquo;I&rsquo;m Building This,&rdquo; ask quick clarification questions, and submit a live demo URL plus walkthrough video.
              </p>
            </div>

            <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
              <div className="font-mono text-xs font-medium text-blue-600 dark:text-blue-400">
                03. Test the live demo &amp; buy if you love it
              </div>
              <h3 className="mt-2 font-display text-lg font-semibold text-slate-900 dark:text-white">
                Escrow-protected deal room
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                Try the prototype directly, request minor tweaks in real-time chat, and license it exclusively or for multiple buyers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trending Problems Preview */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Trending problems with high demand
            </h2>
            <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400">
              Real bottlenecks validated by &ldquo;Me Too&rdquo; votes across retail, education, and e-commerce.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={onOpenMarketplace}
              className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap"
            >
              Browse Ready Solutions
            </button>
            <button
              type="button"
              onClick={onExploreProblems}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline whitespace-nowrap"
            >
              <span>View all problems</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trendingProblems.map((problem) => (
            <ProblemCard
              key={problem.id}
              problem={problem}
              onSelectProblem={onSelectProblem}
              onToggleUpvote={onToggleUpvote}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
