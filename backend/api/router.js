import { walletView } from '../services/wallet.js';
import { startSession, recordAnswer } from '../services/game-session.js';
import { validateReferral, rewardAmount } from '../services/referral.js';
import { authorizeUser } from '../auth/authorization.js';
import { validateAnswerInput, validateSessionId } from '../validation/game-input.js';
import { validateReferralCode } from '../validation/referral-input.js';

export function createRouter(deps = {}) {
  const { db, requireUser, getQuestion } = deps;
  if (!db || !requireUser || !getQuestion) throw new Error('Router dependencies are required');

  return {
    async wallet(request) {
      const user = await requireUser(request);
      authorizeUser(request.session, user.id);
      return walletView(user);
    },

    async startGame(request) {
      const user = await requireUser(request);
      authorizeUser(request.session, user.id);
      const session = startSession(user);
      return db.transaction(async (tx) => {
        const saved = await tx.createGameSession(user.id, session);
        await tx.updateEnergy(user.id, session.energyAfter);
        const question = await getQuestion(tx, saved.questionsAnswered);
        return { sessionId: saved.id, question, energy: session.energyAfter };
      });
    },

    async answer(request) {
      const user = await requireUser(request);
      authorizeUser(request.session, user.id);
      const sessionId = validateSessionId(request.params.sessionId);
      const answer = validateAnswerInput(request.body);
      const session = await db.getGameSession(sessionId, user.id);
      if (!session || String(session.user_id) !== String(user.id)) throw new Error('Forbidden');
      const question = await db.getQuestion(session.question_id);
      if (!question) throw new Error('Question not found');
      const next = recordAnswer(session, answer === question.answer);
      return db.transaction(async (tx) => {
        await tx.updateGameSession(session.id, next);
        await tx.recordSFDifference(user.id, next.points - session.points);
        return { sessionId: session.id, completed: next.completed, points: next.points };
      });
    },

    async claimReferral(request) {
      const user = await requireUser(request);
      authorizeUser(request.session, user.id);
      const code = validateReferralCode(request.body?.code);
      const inviter = await db.findUserByReferralCode(code);
      validateReferral({ inviterId: inviter?.id, inviteeId: user.id, existingReferral: await db.findReferralByInvitee(user.id) });
      return db.transaction(async (tx) => {
        await tx.createReferral(inviter.id, user.id);
        await tx.recordSFDifference(inviter.id, rewardAmount());
        await tx.recordSFDifference(user.id, rewardAmount());
        return { claimed: true, reward: rewardAmount() };
      });
    }
  };
}
