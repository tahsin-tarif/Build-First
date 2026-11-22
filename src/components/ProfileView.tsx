import { Edit3, ExternalLink, Github, Globe, MessageSquare } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import type { Deal, Problem, Solution, UserProfile } from '../types/marketplace';
import { formatCurrency } from '../utils/marketplaceLogic';
import { ProblemCard } from './ProblemCard';

interface ProfileViewProps {
  profile: UserProfile;
  problems: Problem[];
  solutions: Solution[];
  deals: Deal[];
  onUpdateProfile: (updates: Partial<UserProfile>) => void;
  onSelectProblem: (problemId: string) => void;
  onToggleUpvote: (problemId: string) => void;
  onOpenDealRoomById: (dealId: string) => void;
}

export function ProfileView({
  profile,
  problems,
  solutions,
  deals,
  onUpdateProfile,
  onSelectProblem,
  onToggleUpvote,
  onOpenDealRoomById,
}: ProfileViewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [headline, setHeadline] = useState(profile.headline);
  const [bio, setBio] = useState(profile.bio);
  const [techStackRaw, setTechStackRaw] = useState(profile.techStack.join(', '));
  const [githubUrl, setGithubUrl] = useState(profile.githubUrl);
  const [portfolioUrl, setPortfolioUrl] = useState(profile.portfolioUrl);

  const myProblems = problems.filter((p) => p.authorId === profile.uid);
  const mySolutions = solutions.filter((s) => s.builderId === profile.uid);
  const closedDeals = deals.filter((d) => d.escrowStatus === 'Completed').length;

  const solutionsBuiltTotal = Math.max(profile.solutionsBuilt, mySolutions.length);
  const dealsClosedTotal = Math.max(profile.dealsClosed, closedDeals);
  const upvotesEarnedTotal =
    profile.totalUpvotes +
    mySolutions.reduce((acc, s) => acc + s.upvotesCount, 0);

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      displayName: displayName.trim() || profile.displayName,
      headline: headline.trim(),
      bio: bio.trim(),
      techStack: techStackRaw
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
        .slice(0, 12),
      githubUrl: githubUrl.trim(),
      portfolioUrl: portfolioUrl.trim(),
    });
    setIsEditing(false);
  };

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Profile & Builder Stats Header */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-2xl">
            <div className="text-xs font-medium text-blue-600 dark:text-blue-400">
              {profile.activeRole === 'builder'
                ? 'Active Builder Portfolio'
                : 'Problem Poster & Product Buyer'}
            </div>
            <h1 className="mt-1.5 font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              {profile.displayName}
            </h1>
            <p className="mt-1 text-sm font-medium text-slate-700 dark:text-slate-300">
              {profile.headline}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              {profile.bio}
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-600 dark:text-slate-400">
              <span className="font-mono">
                Stack: {profile.techStack.join(' · ')}
              </span>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-4">
              {profile.githubUrl && (
                <a
                  href={profile.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  <Github className="h-4 w-4" />
                  <span>GitHub</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
              {profile.portfolioUrl && (
                <a
                  href={profile.portfolioUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  <Globe className="h-4 w-4" />
                  <span>Portfolio</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsEditing((v) => !v)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <Edit3 className="h-3.5 w-3.5" />
            <span>{isEditing ? 'Cancel Edit' : 'Edit Profile'}</span>
          </button>
        </div>

        {/* Edit Form */}
        {isEditing && (
          <form
            onSubmit={handleSave}
            className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                Headline
              </label>
              <input
                type="text"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                Bio
              </label>
              <textarea
                rows={2}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                Tech Stack (comma-separated)
              </label>
              <input
                type="text"
                value={techStackRaw}
                onChange={(e) => setTechStackRaw(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                GitHub URL
              </label>
              <input
                type="url"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                Portfolio URL
              </label>
              <input
                type="url"
                value={portfolioUrl}
                onChange={(e) => setPortfolioUrl(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100"
              />
            </div>
            <div className="sm:col-span-2 flex justify-end">
              <button
                type="submit"
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Save Profile
              </button>
            </div>
          </form>
        )}

        {/* Tabular Stats Strip */}
        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 grid grid-cols-3 gap-6">
          <div>
            <div className="font-mono text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
              {solutionsBuiltTotal}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Solutions Built
            </div>
          </div>
          <div>
            <div className="font-mono text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
              {dealsClosedTotal}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Deals Closed
            </div>
          </div>
          <div>
            <div className="font-mono text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
              {upvotesEarnedTotal}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Total Upvotes Earned
            </div>
          </div>
        </div>
      </div>

      {/* Active Deal Rooms Summary */}
      <div className="space-y-4">
        <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">
          Your Deal Rooms &amp; Escrow Activity ({deals.length})
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {deals.map((deal) => (
            <div
              key={deal.id}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 flex items-center justify-between gap-4"
            >
              <div>
                <div className="font-display text-sm font-semibold text-slate-900 dark:text-white">
                  {deal.solutionTitle}
                </div>
                <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {deal.licensingModel} ·{' '}
                  <span className="font-mono tabular-nums">
                    {formatCurrency(deal.offerAmount, deal.offerCurrency)}
                  </span>{' '}
                  · {deal.escrowStatus}
                </div>
              </div>
              <button
                type="button"
                onClick={() => onOpenDealRoomById(deal.id)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 whitespace-nowrap shrink-0"
              >
                <MessageSquare className="h-3.5 w-3.5" />
                <span>Open Room</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Showcase Grid: Built Solutions */}
      <div className="space-y-4">
        <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">
          Working Solutions Built ({mySolutions.length})
        </h2>
        {mySolutions.length === 0 ? (
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-sm text-slate-600 dark:text-slate-400">
            You have not submitted a solution under this profile yet. Open any problem in the Discovery Feed and submit a live demo.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mySolutions.map((sol) => (
              <div
                key={sol.id}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 flex flex-col justify-between gap-4"
              >
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {sol.licensingModel} ·{' '}
                    <span className="font-mono tabular-nums">
                      {formatCurrency(sol.priceAmount, sol.priceCurrency)}
                    </span>
                  </div>
                  <h3 className="mt-1.5 font-display text-base font-semibold text-slate-900 dark:text-white">
                    {sol.title}
                  </h3>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 line-clamp-2">
                    {sol.pitch}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onSelectProblem(sol.problemId)}
                  className="text-left text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
                >
                  View Problem &amp; Demo →
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Showcase Grid: Posted Problems */}
      <div className="space-y-4">
        <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">
          Problems Posted ({myProblems.length})
        </h2>
        {myProblems.length === 0 ? (
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-sm text-slate-600 dark:text-slate-400">
            You have not posted any problems yet. Click &ldquo;Post a Problem&rdquo; in the top bar whenever you hit a repetitive daily bottleneck.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myProblems.map((prob) => (
              <ProblemCard
                key={prob.id}
                problem={prob}
                onSelectProblem={onSelectProblem}
                onToggleUpvote={onToggleUpvote}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
