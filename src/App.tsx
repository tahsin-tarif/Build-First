import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { Bell, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { DealRoomDrawer } from './components/DealRoomDrawer';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LandingView } from './components/LandingView';
import { MarketplaceView } from './components/MarketplaceView';
import { Navbar } from './components/Navbar';
import { PostProblemModal } from './components/PostProblemModal';
import { ProblemDetailView } from './components/ProblemDetailView';
import { ProblemFeedView } from './components/ProblemFeedView';
import { ProfileView } from './components/ProfileView';
import { SubmitSolutionModal } from './components/SubmitSolutionModal';
import { WorkspaceBar } from './components/WorkspaceBar';
import { auth, googleAuthProvider, testConnection } from './lib/firebase';
import {
  createId,
  loadLocalWorkspace,
  persistBuilderIntentToFirestore,
  persistDealEscrowUpdateToFirestore,
  persistDealToFirestore,
  persistMessageToFirestore,
  persistProblemToFirestore,
  persistSolutionToFirestore,
  persistUpvoteToFirestore,
  saveLocalWorkspace,
  subscribePublicMarketplace,
  syncSignedInUserToFirestore,
  type WorkspaceState,
} from './services/marketplaceService';
import type {
  AppTab,
  CurrencyCode,
  Deal,
  DealMessage,
  EscrowStatus,
  PlatformNotification,
  Problem,
  ProblemCategory,
  ProblemComment,
  ProblemStatus,
  Solution,
  SortOption,
  UserProfile,
  UserRole,
} from './types/marketplace';
import {
  canTransitionEscrow,
  computePlatformStats,
  type ProblemInput,
  type SolutionInput,
} from './utils/marketplaceLogic';

const THEME_STORAGE_KEY = 'build_first_theme_v1';

export default function App() {
  const [workspace, setWorkspace] = useState<WorkspaceState>(() =>
    loadLocalWorkspace()
  );
  const [activeTab, setActiveTab] = useState<AppTab>('landing');
  const [selectedProblemId, setSelectedProblemId] = useState<string | null>(null);

  // Filters for Discovery Feed
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<ProblemCategory | 'All'>('All');
  const [statusFilter, setStatusFilter] = useState<ProblemStatus | 'All'>('All');
  const [sortBy, setSortBy] = useState<SortOption>('most_upvoted');

  // Modals & Drawers
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [submitSolutionProblemId, setSubmitSolutionProblemId] = useState<string | null>(
    null
  );
  const [isDealRoomOpen, setIsDealRoomOpen] = useState(false);
  const [activeDealId, setActiveDealId] = useState<string | null>(
    workspace.deals[0]?.id ?? null
  );

  // Notification banner
  const [notification, setNotification] = useState<PlatformNotification | null>(
    null
  );

  // Theme state (Crisp light mode default)
  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      return localStorage.getItem(THEME_STORAGE_KEY) === 'dark';
    } catch {
      return false;
    }
  });

  // Firebase Auth state
  const [isFirebaseAuthenticated, setIsFirebaseAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

  // Apply .dark class to <html>
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem(THEME_STORAGE_KEY, isDark ? 'dark' : 'light');
    } catch {
      // Ignore
    }
  }, [isDark]);

  // Persist workspace to localStorage whenever state updates
  useEffect(() => {
    saveLocalWorkspace(workspace);
  }, [workspace]);

  // Support ?autostart=1 query param to jump straight into Problem Discovery Feed
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('autostart') === '1') {
      setActiveTab('discover');
    }
  }, []);

  // Initialize Firebase connection check & auth listener
  useEffect(() => {
    void testConnection();
    let unsubMarketplace: (() => void) | null = null;

    const unsubAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setIsFirebaseAuthenticated(true);
        const displayName = firebaseUser.displayName || 'Builder User';
        const email = firebaseUser.email || '';
        setWorkspace((prev) => ({
          ...prev,
          profile: {
            ...prev.profile,
            uid: firebaseUser.uid,
            displayName,
            email,
            isDemoUser: false,
          },
        }));

        void syncSignedInUserToFirestore(
          firebaseUser.uid,
          email,
          displayName,
          workspace.profile.activeRole
        ).catch((err) => console.error(err));

        unsubMarketplace = subscribePublicMarketplace(
          (remoteProblems) => {
            if (remoteProblems.length === 0) return;
            setWorkspace((prev) => {
              const remoteIds = new Set(remoteProblems.map((p) => p.id));
              const localOnly = prev.problems.filter((p) => !remoteIds.has(p.id));
              return {
                ...prev,
                problems: [...remoteProblems, ...localOnly],
              };
            });
          },
          (remoteSolutions) => {
            if (remoteSolutions.length === 0) return;
            setWorkspace((prev) => {
              const remoteIds = new Set(remoteSolutions.map((s) => s.id));
              const localOnly = prev.solutions.filter((s) => !remoteIds.has(s.id));
              return {
                ...prev,
                solutions: [...remoteSolutions, ...localOnly],
              };
            });
          }
        );
      } else {
        setIsFirebaseAuthenticated(false);
        if (unsubMarketplace) {
          unsubMarketplace();
          unsubMarketplace = null;
        }
      }
    });

    return () => {
      unsubAuth();
      if (unsubMarketplace) unsubMarketplace();
    };
  }, []);

  const handleSignInGoogle = async () => {
    setAuthLoading(true);
    try {
      await signInWithPopup(auth, googleAuthProvider);
    } catch (error) {
      console.error('Google sign-in aborted or failed:', error);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
  };

  const handleSelectTab = (tab: AppTab) => {
    setActiveTab(tab);
    setSelectedProblemId(null);
  };

  const handleSelectProblem = (problemId: string) => {
    setSelectedProblemId(problemId);
    setActiveTab('discover');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleChangeRole = (role: UserRole) => {
    setWorkspace((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        activeRole: role,
      },
    }));
  };

  const handlePostProblem = (input: ProblemInput, authorRole: string) => {
    const now = new Date().toISOString();
    const newProblem: Problem = {
      id: createId('prob'),
      authorId: workspace.profile.uid,
      authorName: workspace.profile.displayName,
      authorRole,
      title: input.title.trim(),
      description: input.description.trim(),
      category: input.category,
      status: 'Open for Builders',
      urgency: input.urgency,
      hasBudget: input.hasBudget,
      budgetAmount: input.hasBudget ? input.budgetAmount : null,
      budgetCurrency: input.budgetCurrency,
      upvotesCount: 1,
      activeBuildersCount: 0,
      solutionsCount: 0,
      upvotedByMe: true,
      builtByMe: false,
      createdAt: now,
      updatedAt: now,
    };

    setWorkspace((prev) => ({
      ...prev,
      problems: [newProblem, ...prev.problems],
    }));
    setActiveTab('discover');
    setSelectedProblemId(newProblem.id);

    if (isFirebaseAuthenticated) {
      void persistProblemToFirestore(newProblem).catch((err) =>
        console.error(err)
      );
    }
  };

  const handleToggleUpvote = (problemId: string) => {
    const target = workspace.problems.find((p) => p.id === problemId);
    if (!target) return;
    const nextUpvoted = !target.upvotedByMe;

    setWorkspace((prev) => ({
      ...prev,
      problems: prev.problems.map((p) => {
        if (p.id !== problemId) return p;
        return {
          ...p,
          upvotedByMe: nextUpvoted,
          upvotesCount: nextUpvoted
            ? p.upvotesCount + 1
            : Math.max(0, p.upvotesCount - 1),
          updatedAt: new Date().toISOString(),
        };
      }),
    }));

    if (isFirebaseAuthenticated) {
      void persistUpvoteToFirestore(
        target,
        workspace.profile.uid,
        nextUpvoted
      ).catch((err) => console.error(err));
    }
  };

  const handleToggleBuildingIntent = (problemId: string) => {
    const target = workspace.problems.find((p) => p.id === problemId);
    if (!target) return;
    const nextBuilt = !target.builtByMe;

    setWorkspace((prev) => ({
      ...prev,
      problems: prev.problems.map((p) => {
        if (p.id !== problemId) return p;
        const nextCount = nextBuilt
          ? p.activeBuildersCount + 1
          : Math.max(0, p.activeBuildersCount - 1);
        const nextStatus: ProblemStatus =
          p.solutionsCount > 0
            ? 'Solution Ready'
            : nextCount > 0
              ? 'In Progress'
              : 'Open for Builders';
        return {
          ...p,
          builtByMe: nextBuilt,
          activeBuildersCount: nextCount,
          status: nextStatus,
          updatedAt: new Date().toISOString(),
        };
      }),
    }));

    if (isFirebaseAuthenticated && nextBuilt) {
      void persistBuilderIntentToFirestore(
        target,
        workspace.profile.uid,
        workspace.profile.displayName
      ).catch((err) => console.error(err));
    }
  };

  const handleAddComment = (problemId: string, body: string) => {
    const newComment: ProblemComment = {
      id: createId('cmt'),
      problemId,
      authorId: workspace.profile.uid,
      authorName: workspace.profile.displayName,
      authorTag:
        workspace.profile.activeRole === 'builder' ? 'Builder' : 'Problem Poster',
      body,
      createdAt: new Date().toISOString(),
    };

    setWorkspace((prev) => ({
      ...prev,
      comments: [...prev.comments, newComment],
    }));
  };

  const handleSubmitSolution = (
    problemId: string,
    payload: SolutionInput & {
      screenshotUrl: string;
      priceCurrency: CurrencyCode;
    }
  ) => {
    const parentProblem = workspace.problems.find((p) => p.id === problemId);
    if (!parentProblem) return;

    const now = new Date().toISOString();
    const newSolution: Solution = {
      id: createId('sol'),
      problemId,
      problemTitle: parentProblem.title,
      builderId: workspace.profile.uid,
      builderName: workspace.profile.displayName,
      title: payload.title.trim(),
      pitch: payload.pitch.trim(),
      liveDemoUrl: payload.liveDemoUrl.trim(),
      videoUrl: payload.videoUrl.trim(),
      screenshotUrl: payload.screenshotUrl,
      licensingModel: payload.licensingModel,
      priceAmount: payload.priceAmount,
      priceCurrency: payload.priceCurrency,
      techStack: payload.techStack,
      upvotesCount: 1,
      upvotedByMe: true,
      createdAt: now,
      updatedAt: now,
    };

    setWorkspace((prev) => ({
      ...prev,
      solutions: [newSolution, ...prev.solutions],
      problems: prev.problems.map((p) =>
        p.id === problemId
          ? {
              ...p,
              solutionsCount: p.solutionsCount + 1,
              status: 'Solution Ready',
              updatedAt: now,
            }
          : p
      ),
      profile: {
        ...prev.profile,
        solutionsBuilt: prev.profile.solutionsBuilt + 1,
      },
    }));

    setNotification({
      id: createId('notif'),
      title: 'Good news! A developer built a working solution for your problem.',
      message: `${workspace.profile.displayName} submitted "${newSolution.title}" for "${parentProblem.title}".`,
      problemId,
      createdAt: now,
    });

    if (isFirebaseAuthenticated) {
      void persistSolutionToFirestore(newSolution, parentProblem).catch((err) =>
        console.error(err)
      );
    }
  };

  const handleToggleSolutionUpvote = (solutionId: string) => {
    setWorkspace((prev) => ({
      ...prev,
      solutions: prev.solutions.map((s) => {
        if (s.id !== solutionId) return s;
        const nextUpvoted = !s.upvotedByMe;
        return {
          ...s,
          upvotedByMe: nextUpvoted,
          upvotesCount: nextUpvoted
            ? s.upvotesCount + 1
            : Math.max(0, s.upvotesCount - 1),
        };
      }),
    }));
  };

  const handleOpenDealRoomForSolution = (solution: Solution) => {
    const existingDeal = workspace.deals.find(
      (d) => d.solutionId === solution.id
    );
    if (existingDeal) {
      setActiveDealId(existingDeal.id);
      setIsDealRoomOpen(true);
      return;
    }

    const now = new Date().toISOString();
    const newDeal: Deal = {
      id: createId('deal'),
      problemId: solution.problemId,
      solutionId: solution.id,
      solutionTitle: solution.title,
      posterId: workspace.profile.uid,
      posterName: workspace.profile.displayName,
      builderId: solution.builderId,
      builderName: solution.builderName,
      offerAmount: solution.priceAmount,
      offerCurrency: solution.priceCurrency,
      licensingModel: solution.licensingModel,
      escrowStatus: 'Negotiating',
      customizationNotes: '',
      createdAt: now,
      updatedAt: now,
    };

    const welcomeMsg: DealMessage = {
      id: createId('msg'),
      dealId: newDeal.id,
      posterId: newDeal.posterId,
      builderId: newDeal.builderId,
      senderId: solution.builderId,
      senderName: solution.builderName,
      senderRole: 'builder',
      messageType: 'text',
      body: `Deal room opened for "${solution.title}". Feel free to test the live demo and share any customization questions.`,
      offerAmount: null,
      createdAt: now,
    };

    setWorkspace((prev) => ({
      ...prev,
      deals: [newDeal, ...prev.deals],
      messages: [...prev.messages, welcomeMsg],
    }));
    setActiveDealId(newDeal.id);
    setIsDealRoomOpen(true);

    if (isFirebaseAuthenticated) {
      void persistDealToFirestore(newDeal)
        .then(() => persistMessageToFirestore(welcomeMsg))
        .catch((err) => console.error(err));
    }
  };

  const handleSendMessage = (
    dealId: string,
    body: string,
    messageType: DealMessage['messageType'],
    offerAmount: number | null = null
  ) => {
    const deal = workspace.deals.find((d) => d.id === dealId);
    if (!deal) return;

    const newMsg: DealMessage = {
      id: createId('msg'),
      dealId,
      posterId: deal.posterId,
      builderId: deal.builderId,
      senderId: workspace.profile.uid,
      senderName: workspace.profile.displayName,
      senderRole: workspace.profile.activeRole,
      messageType,
      body,
      offerAmount,
      createdAt: new Date().toISOString(),
    };

    setWorkspace((prev) => ({
      ...prev,
      messages: [...prev.messages, newMsg],
    }));

    if (isFirebaseAuthenticated) {
      void persistMessageToFirestore(newMsg).catch((err) => console.error(err));
    }
  };

  const handleSendOffer = (dealId: string, amount: number) => {
    const deal = workspace.deals.find((d) => d.id === dealId);
    if (!deal) return;

    setWorkspace((prev) => ({
      ...prev,
      deals: prev.deals.map((d) =>
        d.id === dealId
          ? { ...d, offerAmount: amount, updatedAt: new Date().toISOString() }
          : d
      ),
    }));

    handleSendMessage(
      dealId,
      `Sent formal offer of ${amount} ${deal.offerCurrency} for ${deal.licensingModel}.`,
      'formal_offer',
      amount
    );
  };

  const handleAdvanceEscrow = (dealId: string, nextStatus: EscrowStatus) => {
    const deal = workspace.deals.find((d) => d.id === dealId);
    if (!deal || !canTransitionEscrow(deal.escrowStatus, nextStatus)) return;

    setWorkspace((prev) => ({
      ...prev,
      deals: prev.deals.map((d) =>
        d.id === dealId
          ? {
              ...d,
              escrowStatus: nextStatus,
              updatedAt: new Date().toISOString(),
            }
          : d
      ),
      profile:
        nextStatus === 'Completed'
          ? { ...prev.profile, dealsClosed: prev.profile.dealsClosed + 1 }
          : prev.profile,
    }));

    handleSendMessage(
      dealId,
      `Escrow status updated to: ${nextStatus}.`,
      'escrow_update',
      null
    );

    if (isFirebaseAuthenticated) {
      void persistDealEscrowUpdateToFirestore(dealId, nextStatus).catch((err) =>
        console.error(err)
      );
    }
  };

  const handleUpdateProfile = (updates: Partial<UserProfile>) => {
    setWorkspace((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        ...updates,
      },
    }));
  };

  const selectedProblem =
    workspace.problems.find((p) => p.id === selectedProblemId) ?? null;

  const submitTargetProblem =
    workspace.problems.find((p) => p.id === submitSolutionProblemId) ?? null;

  const stats = computePlatformStats(
    workspace.problems,
    workspace.solutions,
    workspace.profile.dealsClosed
  );

  return (
    <ErrorBoundary>
      <div className="min-h-screen flex flex-col bg-[#FAFAFA] text-slate-900 dark:bg-[#0B0F17] dark:text-slate-100">
        <Navbar
          activeTab={activeTab}
          onSelectTab={handleSelectTab}
          onOpenPostProblem={() => setIsPostModalOpen(true)}
        />

        <WorkspaceBar
          profile={workspace.profile}
          isDark={isDark}
          onToggleTheme={() => setIsDark((d) => !d)}
          onChangeRole={handleChangeRole}
          dealsCount={workspace.deals.length}
          onOpenDealRoom={() => setIsDealRoomOpen(true)}
          isFirebaseAuthenticated={isFirebaseAuthenticated}
          onSignInGoogle={handleSignInGoogle}
          onSignOut={handleSignOut}
          authLoading={authLoading}
        />

        {/* Real-Time Solution Notification Banner */}
        {notification && (
          <div
            role="status"
            data-testid="solution-notification-banner"
            className="border-b border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/60"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Bell className="h-4 w-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
                <div className="text-sm">
                  <span className="font-semibold text-emerald-900 dark:text-emerald-200">
                    {notification.title}
                  </span>{' '}
                  <span className="text-emerald-800 dark:text-emerald-300">
                    {notification.message}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setNotification(null)}
                aria-label="Dismiss notification"
                className="p-1 text-emerald-800 dark:text-emerald-300 hover:opacity-75"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Main Viewport */}
        <main className="flex-1">
          {selectedProblem ? (
            <ProblemDetailView
              problem={selectedProblem}
              comments={workspace.comments.filter(
                (c) => c.problemId === selectedProblem.id
              )}
              solutions={workspace.solutions.filter(
                (s) => s.problemId === selectedProblem.id
              )}
              currentUser={workspace.profile}
              onBack={() => setSelectedProblemId(null)}
              onToggleUpvote={handleToggleUpvote}
              onToggleBuildingIntent={handleToggleBuildingIntent}
              onAddComment={handleAddComment}
              onOpenSubmitSolution={(pid) => setSubmitSolutionProblemId(pid)}
              onOpenDealRoomForSolution={handleOpenDealRoomForSolution}
              onToggleSolutionUpvote={handleToggleSolutionUpvote}
            />
          ) : activeTab === 'landing' ? (
            <LandingView
              problems={workspace.problems}
              solutions={workspace.solutions}
              stats={stats}
              onOpenPostProblem={() => setIsPostModalOpen(true)}
              onExploreProblems={() => setActiveTab('discover')}
              onSelectProblem={handleSelectProblem}
              onToggleUpvote={handleToggleUpvote}
              onOpenMarketplace={() => setActiveTab('marketplace')}
            />
          ) : activeTab === 'discover' ? (
            <ProblemFeedView
              problems={workspace.problems}
              search={search}
              onSearchChange={setSearch}
              category={categoryFilter}
              onCategoryChange={setCategoryFilter}
              status={statusFilter}
              onStatusChange={setStatusFilter}
              sortBy={sortBy}
              onSortChange={setSortBy}
              onResetFilters={() => {
                setSearch('');
                setCategoryFilter('All');
                setStatusFilter('All');
                setSortBy('most_upvoted');
              }}
              onSelectProblem={handleSelectProblem}
              onToggleUpvote={handleToggleUpvote}
              onOpenPostProblem={() => setIsPostModalOpen(true)}
            />
          ) : activeTab === 'marketplace' ? (
            <MarketplaceView
              solutions={workspace.solutions}
              problems={workspace.problems}
              onSelectProblem={handleSelectProblem}
              onOpenDealRoomForSolution={handleOpenDealRoomForSolution}
              onToggleSolutionUpvote={handleToggleSolutionUpvote}
            />
          ) : (
            <ProfileView
              profile={workspace.profile}
              problems={workspace.problems}
              solutions={workspace.solutions}
              deals={workspace.deals}
              onUpdateProfile={handleUpdateProfile}
              onSelectProblem={handleSelectProblem}
              onToggleUpvote={handleToggleUpvote}
              onOpenDealRoomById={(dealId) => {
                setActiveDealId(dealId);
                setIsDealRoomOpen(true);
              }}
            />
          )}
        </main>

        {/* Quiet Footer */}
        <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B0F17] py-8 mt-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
            <div>
              <span className="font-display font-semibold text-slate-800 dark:text-slate-200">
                Build First
              </span>{' '}
              · Problem-First Reverse Marketplace
            </div>
            <div className="flex items-center gap-6">
              <button
                type="button"
                onClick={() => handleSelectTab('discover')}
                className="hover:text-slate-900 dark:hover:text-white"
              >
                Discover Problems
              </button>
              <button
                type="button"
                onClick={() => handleSelectTab('marketplace')}
                className="hover:text-slate-900 dark:hover:text-white"
              >
                Solutions Marketplace
              </button>
              <button
                type="button"
                onClick={() => handleSelectTab('portfolio')}
                className="hover:text-slate-900 dark:hover:text-white"
              >
                Builder Portfolio
              </button>
            </div>
          </div>
        </footer>

        {/* Modals & Deal Room Drawer */}
        <PostProblemModal
          isOpen={isPostModalOpen}
          onClose={() => setIsPostModalOpen(false)}
          onSubmitProblem={handlePostProblem}
        />

        <SubmitSolutionModal
          isOpen={Boolean(submitTargetProblem)}
          problem={submitTargetProblem}
          onClose={() => setSubmitSolutionProblemId(null)}
          onSubmitSolution={handleSubmitSolution}
        />

        <DealRoomDrawer
          isOpen={isDealRoomOpen}
          onClose={() => setIsDealRoomOpen(false)}
          deals={workspace.deals}
          activeDealId={activeDealId}
          onSelectDeal={setActiveDealId}
          messages={workspace.messages}
          currentUser={workspace.profile}
          onSendMessage={handleSendMessage}
          onAdvanceEscrow={handleAdvanceEscrow}
          onSendOffer={handleSendOffer}
        />
      </div>
    </ErrorBoundary>
  );
}
