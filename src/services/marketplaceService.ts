import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
  type Unsubscribe,
} from 'firebase/firestore';
import {
  DEFAULT_USER_PROFILE,
  SEED_COMMENTS,
  SEED_DEALS,
  SEED_MESSAGES,
  SEED_PROBLEMS,
  SEED_SOLUTIONS,
} from '../data/seedData';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import type {
  CurrencyCode,
  Deal,
  DealMessage,
  EscrowStatus,
  LicensingModel,
  Problem,
  ProblemCategory,
  ProblemComment,
  Solution,
  UrgencyLevel,
  UserProfile,
  UserRole,
} from '../types/marketplace';

const STORAGE_KEY = 'build_first_workspace_v1';

export interface WorkspaceState {
  profile: UserProfile;
  problems: Problem[];
  comments: ProblemComment[];
  solutions: Solution[];
  deals: Deal[];
  messages: DealMessage[];
}

export function loadLocalWorkspace(): WorkspaceState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {
        profile: DEFAULT_USER_PROFILE,
        problems: SEED_PROBLEMS,
        comments: SEED_COMMENTS,
        solutions: SEED_SOLUTIONS,
        deals: SEED_DEALS,
        messages: SEED_MESSAGES,
      };
    }
    const parsed = JSON.parse(raw) as Partial<WorkspaceState>;
    return {
      profile: parsed.profile ?? DEFAULT_USER_PROFILE,
      problems: Array.isArray(parsed.problems) && parsed.problems.length > 0 ? parsed.problems : SEED_PROBLEMS,
      comments: Array.isArray(parsed.comments) ? parsed.comments : SEED_COMMENTS,
      solutions: Array.isArray(parsed.solutions) && parsed.solutions.length > 0 ? parsed.solutions : SEED_SOLUTIONS,
      deals: Array.isArray(parsed.deals) ? parsed.deals : SEED_DEALS,
      messages: Array.isArray(parsed.messages) ? parsed.messages : SEED_MESSAGES,
    };
  } catch {
    return {
      profile: DEFAULT_USER_PROFILE,
      problems: SEED_PROBLEMS,
      comments: SEED_COMMENTS,
      solutions: SEED_SOLUTIONS,
      deals: SEED_DEALS,
      messages: SEED_MESSAGES,
    };
  }
}

export function saveLocalWorkspace(state: WorkspaceState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage quota errors in private browsing
  }
}

export function createId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

// --- Firebase Firestore Synchronization Layer (Active when Authenticated) ---

export async function syncSignedInUserToFirestore(
  uid: string,
  email: string,
  displayName: string,
  activeRole: UserRole
): Promise<void> {
  try {
    const userRef = doc(db, 'users', uid);
    await setDoc(
      userRef,
      {
        uid,
        email,
        displayName,
        activeRole,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${uid}`);
  }

  try {
    const profileRef = doc(db, 'profiles', uid);
    await setDoc(
      profileRef,
      {
        uid,
        displayName,
        headline: 'Builder & Problem Solver on Build First',
        bio: 'Building working software demos before pitching.',
        techStack: ['React', 'TypeScript', 'Tailwind CSS'],
        githubUrl: '',
        portfolioUrl: '',
        solutionsBuilt: 0,
        dealsClosed: 0,
        totalUpvotes: 0,
        visibility: 'public',
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `profiles/${uid}`);
  }
}

export function subscribePublicMarketplace(
  onProblems: (remoteProblems: Problem[]) => void,
  onSolutions: (remoteSolutions: Solution[]) => void
): Unsubscribe {
  const problemsQ = query(
    collection(db, 'problems'),
    where('visibility', '==', 'public'),
    orderBy('createdAt', 'desc')
  );
  const solutionsQ = query(
    collection(db, 'solutions'),
    where('visibility', '==', 'public'),
    orderBy('createdAt', 'desc')
  );

  const unsubProblems = onSnapshot(
    problemsQ,
    (snapshot) => {
      const items: Problem[] = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          authorId: String(data.authorId ?? ''),
          authorName: String(data.authorName ?? 'Anonymous'),
          authorRole: String(data.authorRole ?? 'Problem Poster'),
          title: String(data.title ?? ''),
          description: String(data.description ?? ''),
          category: data.category as ProblemCategory,
          status: data.status,
          urgency: data.urgency as UrgencyLevel,
          hasBudget: Boolean(data.hasBudget),
          budgetAmount: typeof data.budgetAmount === 'number' ? data.budgetAmount : null,
          budgetCurrency: (data.budgetCurrency as CurrencyCode) ?? 'USD',
          upvotesCount: Number(data.upvotesCount ?? 1),
          activeBuildersCount: Number(data.activeBuildersCount ?? 0),
          solutionsCount: Number(data.solutionsCount ?? 0),
          createdAt: data.createdAt?.toDate?.()?.toISOString?.() ?? new Date().toISOString(),
          updatedAt: data.updatedAt?.toDate?.()?.toISOString?.() ?? new Date().toISOString(),
        };
      });
      onProblems(items);
    },
    (error) => handleFirestoreError(error, OperationType.LIST, 'problems')
  );

  const unsubSolutions = onSnapshot(
    solutionsQ,
    (snapshot) => {
      const items: Solution[] = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          problemId: String(data.problemId ?? ''),
          problemTitle: String(data.problemTitle ?? ''),
          builderId: String(data.builderId ?? ''),
          builderName: String(data.builderName ?? 'Builder'),
          title: String(data.title ?? ''),
          pitch: String(data.pitch ?? ''),
          liveDemoUrl: String(data.liveDemoUrl ?? ''),
          videoUrl: String(data.videoUrl ?? ''),
          screenshotUrl: String(data.screenshotUrl ?? ''),
          licensingModel: data.licensingModel as LicensingModel,
          priceAmount: Number(data.priceAmount ?? 0),
          priceCurrency: (data.priceCurrency as CurrencyCode) ?? 'USD',
          techStack: Array.isArray(data.techStack) ? data.techStack.map(String) : [],
          upvotesCount: Number(data.upvotesCount ?? 0),
          createdAt: data.createdAt?.toDate?.()?.toISOString?.() ?? new Date().toISOString(),
          updatedAt: data.updatedAt?.toDate?.()?.toISOString?.() ?? new Date().toISOString(),
        };
      });
      onSolutions(items);
    },
    (error) => handleFirestoreError(error, OperationType.LIST, 'solutions')
  );

  return () => {
    unsubProblems();
    unsubSolutions();
  };
}

export async function persistProblemToFirestore(problem: Problem): Promise<void> {
  const path = `problems/${problem.id}`;
  try {
    await setDoc(doc(db, 'problems', problem.id), {
      authorId: problem.authorId,
      authorName: problem.authorName.slice(0, 100),
      authorRole: problem.authorRole.slice(0, 100),
      title: problem.title.slice(0, 160),
      description: problem.description.slice(0, 4000),
      category: problem.category,
      status: 'Open for Builders',
      urgency: problem.urgency,
      hasBudget: problem.hasBudget,
      budgetAmount: problem.hasBudget ? problem.budgetAmount : null,
      budgetCurrency: problem.budgetCurrency,
      upvotesCount: 1,
      activeBuildersCount: 0,
      solutionsCount: 0,
      visibility: 'public',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function persistUpvoteToFirestore(
  problem: Problem,
  userId: string,
  nextUpvoted: boolean
): Promise<void> {
  const path = `problems/${problem.id}/upvotes/${userId}`;
  try {
    const batch = writeBatch(db);
    const upvoteRef = doc(db, 'problems', problem.id, 'upvotes', userId);
    const problemRef = doc(db, 'problems', problem.id);

    if (nextUpvoted) {
      batch.set(upvoteRef, {
        userId,
        problemId: problem.id,
        isPublic: true,
        createdAt: serverTimestamp(),
      });
      batch.update(problemRef, {
        upvotesCount: problem.upvotesCount + 1,
        updatedAt: serverTimestamp(),
      });
    } else {
      batch.delete(upvoteRef);
      batch.update(problemRef, {
        upvotesCount: Math.max(0, problem.upvotesCount - 1),
        updatedAt: serverTimestamp(),
      });
    }
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function persistBuilderIntentToFirestore(
  problem: Problem,
  userId: string,
  builderName: string
): Promise<void> {
  const path = `problems/${problem.id}/builders/${userId}`;
  try {
    const batch = writeBatch(db);
    batch.set(doc(db, 'problems', problem.id, 'builders', userId), {
      userId,
      problemId: problem.id,
      builderName: builderName.slice(0, 100),
      isPublic: true,
      createdAt: serverTimestamp(),
    });
    batch.update(doc(db, 'problems', problem.id), {
      activeBuildersCount: problem.activeBuildersCount + 1,
      status: problem.status === 'Open for Builders' ? 'In Progress' : problem.status,
      updatedAt: serverTimestamp(),
    });
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function persistSolutionToFirestore(
  solution: Solution,
  parentProblem: Problem
): Promise<void> {
  const path = `solutions/${solution.id}`;
  try {
    const batch = writeBatch(db);
    batch.set(doc(db, 'solutions', solution.id), {
      problemId: solution.problemId,
      problemTitle: solution.problemTitle.slice(0, 160),
      builderId: solution.builderId,
      builderName: solution.builderName.slice(0, 100),
      title: solution.title.slice(0, 140),
      pitch: solution.pitch.slice(0, 3000),
      liveDemoUrl: solution.liveDemoUrl.slice(0, 500),
      videoUrl: solution.videoUrl.slice(0, 500),
      screenshotUrl: solution.screenshotUrl.slice(0, 500),
      licensingModel: solution.licensingModel,
      priceAmount: solution.priceAmount,
      priceCurrency: solution.priceCurrency,
      techStack: solution.techStack.slice(0, 10),
      upvotesCount: 0,
      visibility: 'public',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    batch.update(doc(db, 'problems', parentProblem.id), {
      solutionsCount: parentProblem.solutionsCount + 1,
      status: 'Solution Ready',
      updatedAt: serverTimestamp(),
    });
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function persistDealToFirestore(deal: Deal): Promise<void> {
  const path = `deals/${deal.id}`;
  try {
    await setDoc(doc(db, 'deals', deal.id), {
      problemId: deal.problemId,
      solutionId: deal.solutionId,
      solutionTitle: deal.solutionTitle.slice(0, 140),
      posterId: deal.posterId,
      posterName: deal.posterName.slice(0, 100),
      builderId: deal.builderId,
      builderName: deal.builderName.slice(0, 100),
      offerAmount: deal.offerAmount,
      offerCurrency: deal.offerCurrency,
      licensingModel: deal.licensingModel.slice(0, 100),
      escrowStatus: 'Negotiating',
      customizationNotes: deal.customizationNotes.slice(0, 1000),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function persistDealEscrowUpdateToFirestore(
  dealId: string,
  nextStatus: EscrowStatus
): Promise<void> {
  const path = `deals/${dealId}`;
  try {
    await updateDoc(doc(db, 'deals', dealId), {
      escrowStatus: nextStatus,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function persistMessageToFirestore(message: DealMessage): Promise<void> {
  const path = `deals/${message.dealId}/messages/${message.id}`;
  try {
    await setDoc(doc(db, 'deals', message.dealId, 'messages', message.id), {
      dealId: message.dealId,
      posterId: message.posterId,
      builderId: message.builderId,
      senderId: message.senderId,
      senderName: message.senderName.slice(0, 100),
      senderRole: message.senderRole,
      messageType: message.messageType,
      body: message.body.slice(0, 2000),
      offerAmount: message.offerAmount,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}
