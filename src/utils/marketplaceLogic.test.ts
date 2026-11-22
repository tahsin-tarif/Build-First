import test from 'node:test';
import assert from 'node:assert/strict';
import {
  canTransitionEscrow,
  computePlatformStats,
  filterAndSortProblems,
  filterAndSortSolutions,
  formatCurrency,
  getNextEscrowStatus,
  validateProblemInput,
  validateSolutionInput,
} from './marketplaceLogic';
import type { Problem, Solution } from '../types/marketplace';

const sampleProblems: Problem[] = [
  {
    id: 'p1',
    authorId: 'u1',
    authorName: 'Nadia Rahman',
    authorRole: 'Boutique Shop Owner',
    title: 'Daily WhatsApp receipt reconciliation takes 2 hours every night',
    description: 'Customers send payment screenshots on WhatsApp and I match them manually to orders.',
    category: 'Business & Retail',
    status: 'Solution Ready',
    urgency: 'Urgent',
    hasBudget: true,
    budgetAmount: 5000,
    budgetCurrency: 'BDT',
    upvotesCount: 42,
    activeBuildersCount: 3,
    solutionsCount: 1,
    createdAt: '2026-11-18T10:00:00Z',
    updatedAt: '2026-11-20T10:00:00Z',
  },
  {
    id: 'p2',
    authorId: 'u2',
    authorName: 'Marcus Chen',
    authorRole: 'E-commerce Operator',
    title: 'Multi-channel inventory oversells during flash sales',
    description: 'Shopify and Etsy inventory drifts out of sync within minutes.',
    category: 'E-commerce',
    status: 'In Progress',
    urgency: 'Standard',
    hasBudget: true,
    budgetAmount: 150,
    budgetCurrency: 'USD',
    upvotesCount: 19,
    activeBuildersCount: 2,
    solutionsCount: 0,
    createdAt: '2026-11-20T12:00:00Z',
    updatedAt: '2026-11-20T12:00:00Z',
  },
  {
    id: 'p3',
    authorId: 'u3',
    authorName: 'Elena Ortiz',
    authorRole: 'Private Tutor',
    title: 'Tracking student makeup classes across spreadsheets',
    description: 'Parents reschedule lessons over text and billing gets messy.',
    category: 'Education',
    status: 'Open for Builders',
    urgency: 'Low',
    hasBudget: false,
    budgetAmount: null,
    budgetCurrency: 'USD',
    upvotesCount: 64,
    activeBuildersCount: 0,
    solutionsCount: 0,
    createdAt: '2026-11-21T08:00:00Z',
    updatedAt: '2026-11-21T08:00:00Z',
  },
];

const sampleSolutions: Solution[] = [
  {
    id: 's1',
    problemId: 'p1',
    problemTitle: sampleProblems[0].title,
    builderId: 'b1',
    builderName: 'Tariq Hassan',
    title: 'SnapLedger — OCR WhatsApp Receipt Matcher',
    pitch: 'Parses mobile wallet screenshots and reconciles them against daily CSV orders.',
    liveDemoUrl: 'https://snapledger-demo.vercel.app',
    videoUrl: 'https://www.loom.com/share/demo1',
    screenshotUrl: '',
    licensingModel: 'Multi-User License (SaaS/Template)',
    priceAmount: 45,
    priceCurrency: 'USD',
    techStack: ['React', 'TypeScript', 'Tesseract.js'],
    upvotesCount: 28,
    createdAt: '2026-11-19T14:00:00Z',
    updatedAt: '2026-11-19T14:00:00Z',
  },
];

test('filterAndSortProblems filters by category and sorts by upvotes', () => {
  const allByUpvotes = filterAndSortProblems(sampleProblems, {
    search: '',
    category: 'All',
    status: 'All',
    sortBy: 'most_upvoted',
  });
  assert.deepEqual(
    allByUpvotes.map((p) => p.id),
    ['p3', 'p1', 'p2']
  );

  const ecomOnly = filterAndSortProblems(sampleProblems, {
    search: '',
    category: 'E-commerce',
    status: 'All',
    sortBy: 'newest',
  });
  assert.equal(ecomOnly.length, 1);
  assert.equal(ecomOnly[0].id, 'p2');
});

test('filterAndSortProblems sorts highest_bounty using USD conversion', () => {
  const sorted = filterAndSortProblems(sampleProblems, {
    search: '',
    category: 'All',
    status: 'All',
    sortBy: 'highest_bounty',
  });
  // $150 USD > 5000 BDT (~$41.5 USD) > No budget (-1)
  assert.deepEqual(
    sorted.map((p) => p.id),
    ['p2', 'p1', 'p3']
  );
});

test('filterAndSortSolutions filters by category via parent problem map', () => {
  const byId = Object.fromEntries(sampleProblems.map((p) => [p.id, p]));
  const retail = filterAndSortSolutions(sampleSolutions, byId, {
    search: 'ocr',
    licensing: 'All',
    category: 'Business & Retail',
  });
  assert.equal(retail.length, 1);

  const edu = filterAndSortSolutions(sampleSolutions, byId, {
    search: '',
    licensing: 'All',
    category: 'Education',
  });
  assert.equal(edu.length, 0);
});

test('escrow state machine enforces strict sequential transitions', () => {
  assert.equal(getNextEscrowStatus('Negotiating'), 'Payment Held in Escrow');
  assert.equal(getNextEscrowStatus('Payment Held in Escrow'), 'Code/Access Delivered');
  assert.equal(getNextEscrowStatus('Code/Access Delivered'), 'Completed');
  assert.equal(getNextEscrowStatus('Completed'), null);

  assert.equal(canTransitionEscrow('Negotiating', 'Payment Held in Escrow'), true);
  assert.equal(canTransitionEscrow('Negotiating', 'Completed'), false);
  assert.equal(canTransitionEscrow('Completed', 'Negotiating'), false);
});

test('validateProblemInput catches short titles and missing budgets', () => {
  const invalid = validateProblemInput({
    title: 'Hi',
    description: 'Too short',
    category: 'Other',
    urgency: 'Standard',
    hasBudget: true,
    budgetAmount: 0,
    budgetCurrency: 'USD',
  });
  assert.ok(invalid.title);
  assert.ok(invalid.description);
  assert.ok(invalid.budgetAmount);

  const valid = validateProblemInput({
    title: 'Automate supplier PDF invoices into Google Sheets',
    description: 'Every Monday I manually copy 40 line items from PDF invoices into a sheet.',
    category: 'Automation',
    urgency: 'Urgent',
    hasBudget: true,
    budgetAmount: 120,
    budgetCurrency: 'USD',
  });
  assert.deepEqual(valid, {});
});

test('validateSolutionInput validates URLs and paid pricing', () => {
  const bad = validateSolutionInput({
    title: 'A',
    pitch: 'Short',
    liveDemoUrl: 'not-a-url',
    videoUrl: 'ftp://bad',
    licensingModel: 'One-Time Exclusive Buyout',
    priceAmount: 0,
    techStack: ['React'],
  });
  assert.ok(bad.title);
  assert.ok(bad.pitch);
  assert.ok(bad.liveDemoUrl);
  assert.ok(bad.videoUrl);
  assert.ok(bad.priceAmount);
});

test('formatCurrency and computePlatformStats produce deterministic output', () => {
  assert.equal(formatCurrency(5000, 'BDT'), '5,000 BDT');
  assert.equal(formatCurrency(150, 'USD'), '$150');
  assert.equal(formatCurrency(null, 'USD'), 'Open Idea');

  const stats = computePlatformStats(sampleProblems, sampleSolutions, 4);
  assert.equal(stats.problemsSolved, 4);
  assert.equal(stats.readySolutions, 1);
  assert.equal(stats.totalUpvotes, 125);
});
