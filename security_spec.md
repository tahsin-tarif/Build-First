# Build First Security Specification (Phase 0 TDD)

## 1. Data Invariants
1. **PII Isolation**: User email addresses reside exclusively in `/users/{userId}` and can only be read or written by the authenticated owner (`request.auth.uid == userId`). Public portfolios live in `/profiles/{userId}` without any PII fields.
2. **Identity Integrity**: No user may create a problem, comment, upvote, builder intent, solution, deal, or message impersonating another `authorId`, `builderId`, `posterId`, or `senderId`.
3. **Referential Integrity**: Every upvote, comment, builder intent, and solution must reference an existing parent problem via `exists()`. Every deal must reference an existing solution, and every message must reference an existing deal where the sender is either `posterId` or `builderId`.
4. **Immutable Authorship & Timestamps**: `createdAt`, `authorId`, `builderId`, and `posterId` cannot change after document creation. Timestamps must equal `request.time`.
5. **Terminal Deal Locking**: Once a deal reaches `escrowStatus == 'Completed'`, no further updates are allowed on the deal document.
6. **Participant-Only Deal Rooms**: Only `posterId` or `builderId` may read, list, or write to a deal and its `/messages` subcollection.

## 2. The "Dirty Dozen" Adversarial Payloads
1. **PII Leak Attempt**: Non-owner authenticated user reads `/users/otherUid` -> `PERMISSION_DENIED`.
2. **Problem Author Spoofing**: User A posts `/problems/p1` with `authorId: 'userB'` -> `PERMISSION_DENIED`.
3. **Shadow Field Injection on Problem**: User creates problem with extra `isFeatured: true` -> `PERMISSION_DENIED` (`hasOnly()` gate).
4. **Oversized ID Poisoning**: Client writes `/problems/<200-char-junk>` -> `PERMISSION_DENIED` (`isValidId()` gate).
5. **Client Timestamp Forgery**: Client creates problem with `createdAt: 2020-01-01` -> `PERMISSION_DENIED` (`request.time` check).
6. **Unverified Email Write**: User with `email_verified: false` tries creating a solution -> `PERMISSION_DENIED`.
7. **Orphaned Solution**: Builder submits solution referencing nonexistent `problemId: 'fake_999'` -> `PERMISSION_DENIED` (`exists()` check).
8. **Unauthorized Problem Edit**: Non-author modifies another user's problem `title` -> `PERMISSION_DENIED`.
9. **Deal Outsider Eavesdropping**: Third-party user tries reading `/deals/d1/messages/m1` -> `PERMISSION_DENIED`.
10. **Deal State Shortcutting / Post-Completion Mutation**: Participant attempts updating a deal whose `escrowStatus` is already `'Completed'` -> `PERMISSION_DENIED`.
11. **Value Poisoning on Update**: Problem author updates `upvotesCount` to `"999999"` (string) or `-5` -> `PERMISSION_DENIED` (`isValidProblem()` on update).
12. **Array Size Exhaustion**: Builder submits solution with 50 techStack items -> `PERMISSION_DENIED` (`techStack.size() <= 10`).
