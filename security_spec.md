# Security Specification for SKILL2CASHAPP

## Data Invariants
1. A user can only access their own private profile data (if any was private, but here mostly profile is public-ish).
2. Balance can ONLY be modified through server-side logic or strict transaction rules (though client-side updates are tempting for simplicity, we must secure it). Actually, for this app, I'll allow client-side wallet updates IF they follow strict transaction proofs, or better, keep wallet logic very tight.
3. A Task can only be 'completed' if a submission exists and is approved by the creator.
4. A Task 'creatorId' must match the authenticated user during creation and is immutable.
5. Users cannot arbitrary update their own balance field directly. It should be changed only by participating in task flows.
6. Chat messages can only be read/written by participants in the room.

## The "Dirty Dozen" Payloads (Deny cases)
1. **Balance Spoofing:** `setDoc(doc(db, 'users', 'victimId'), { balance: 999999 })` - Deny if not admin.
2. **Task Price Inflation:** `updateDoc(doc(db, 'tasks', 'taskId'), { price: 5000 })` - Deny if user is not creator or if task is already in progress/completed.
3. **Ghost Task Completion:** `updateDoc(doc(db, 'tasks', 'taskId'), { status: 'completed' })` - Deny if caller is not task creator.
4. **Chat Eavesdropping:** `getDocs(collection(db, 'chatRooms', 'otherRoomId', 'messages'))` - Deny if user not in room.
5. **Review Hijacking:** `setDoc(doc(db, 'reviews', 'revId'), { rating: 5, reviewerId: 'victimId' })` - Deny if reviewerId doesn't match auth.uid.
6. **Notification Spam:** `setDoc(doc(db, 'users', 'victimId', 'notifications', 'spm'), { message: 'Hack' })` - Deny if not system/receiver.
7. **Task Hijacking:** `updateDoc(doc(db, 'tasks', 'taskId'), { creatorId: 'attackerId' })` - Deny (immutable creatorId).
8. **Ineligible Submission:** `setDoc(doc(db, 'tasks', 'taskId', 'submissions', 'sub1'), { taskId: 'differentId' })` - Deny (taskId must match path).
9. **Transaction Creation Spying:** `getDocs(collection(db, 'transactions'))` - Deny (should only see own transactions).
10. **Role Escalation:** `updateDoc(doc(db, 'users', 'myId'), { role: 'admin' })` - Deny.
11. **Invisible Withdrawal:** `setDoc(doc(db, 'transactions', 'tx1'), { type: 'withdrawal', status: 'completed' })` - Deny (Status must be 'pending' for new tx).
12. **Negative Balance:** `updateDoc(doc(db, 'users', 'myId'), { balance: -100 })` - Deny.

## Test Runner (Draft)
A `firestore.rules.test.ts` would verify these. (I won't write the full test file now but I'll implement the rules to block these).
