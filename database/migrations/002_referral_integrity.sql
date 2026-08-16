BEGIN;

-- One invitee can have at most one inviter. This is also enforced by
-- referrals.invitee_id UNIQUE in the base schema.
CREATE UNIQUE INDEX IF NOT EXISTS ux_referrals_invitee ON referrals(invitee_id);

-- An inviter/invitee pair can never point to the same user.
ALTER TABLE referrals DROP CONSTRAINT IF EXISTS referrals_no_self;
ALTER TABLE referrals ADD CONSTRAINT referrals_no_self CHECK (inviter_id <> invitee_id);

COMMIT;
