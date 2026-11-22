export type UserRole = 'poster' | 'builder';

export type ProblemCategory =
  | 'Business & Retail'
  | 'Education'
  | 'Personal Productivity'
  | 'E-commerce'
  | 'Automation'
  | 'Other';

export type ProblemStatus =
  | 'Open for Builders'
  | 'In Progress'
  | 'Solution Ready';

export type UrgencyLevel = 'Low' | 'Standard' | 'Urgent';

export type CurrencyCode = 'USD' | 'BDT' | 'EUR';

export type LicensingModel =
  | 'One-Time Exclusive Buyout'
  | 'Multi-User License (SaaS/Template)'
  | 'Free / Open-Source Portfolio Project';

export type EscrowStatus =
  | 'Negotiating'
  | 'Payment Held in Escrow'
  | 'Code/Access Delivered'
  | 'Completed';

export type SortOption = 'most_upvoted' | 'highest_bounty' | 'newest';

export type AppTab = 'landing' | 'discover' | 'marketplace' | 'portfolio';

export interface UserProfile {
  uid: string;
  displayName: string;
  email?: string;
  activeRole: UserRole;
  headline: string;
  bio: string;
  techStack: string[];
  githubUrl: string;
  portfolioUrl: string;
  solutionsBuilt: number;
  dealsClosed: number;
  totalUpvotes: number;
  isDemoUser?: boolean;
}

export interface Problem {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  title: string;
  description: string;
  category: ProblemCategory;
  status: ProblemStatus;
  urgency: UrgencyLevel;
  hasBudget: boolean;
  budgetAmount: number | null;
  budgetCurrency: CurrencyCode;
  upvotesCount: number;
  activeBuildersCount: number;
  solutionsCount: number;
  upvotedByMe?: boolean;
  builtByMe?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProblemComment {
  id: string;
  problemId: string;
  authorId: string;
  authorName: string;
  authorTag: string;
  body: string;
  createdAt: string;
}

export interface Solution {
  id: string;
  problemId: string;
  problemTitle: string;
  builderId: string;
  builderName: string;
  title: string;
  pitch: string;
  liveDemoUrl: string;
  videoUrl: string;
  screenshotUrl: string;
  licensingModel: LicensingModel;
  priceAmount: number;
  priceCurrency: CurrencyCode;
  techStack: string[];
  upvotesCount: number;
  upvotedByMe?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Deal {
  id: string;
  problemId: string;
  solutionId: string;
  solutionTitle: string;
  posterId: string;
  posterName: string;
  builderId: string;
  builderName: string;
  offerAmount: number;
  offerCurrency: CurrencyCode;
  licensingModel: LicensingModel;
  escrowStatus: EscrowStatus;
  customizationNotes: string;
  createdAt: string;
  updatedAt: string;
}

export interface DealMessage {
  id: string;
  dealId: string;
  posterId: string;
  builderId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  messageType: 'text' | 'customization_request' | 'formal_offer' | 'escrow_update';
  body: string;
  offerAmount: number | null;
  createdAt: string;
}

export interface PlatformNotification {
  id: string;
  title: string;
  message: string;
  problemId?: string;
  createdAt: string;
}
