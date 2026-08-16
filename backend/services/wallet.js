/** Server-side wallet projection helpers. */

export function walletView(user) {
  if (!user) throw new Error('User is required');
  const sf = Number(user.sf_balance);
  const energy = Number(user.energy);
  if (!Number.isInteger(sf) || sf < 0) throw new Error('Invalid SF balance');
  if (!Number.isInteger(energy) || energy < 0 || energy > 3) throw new Error('Invalid energy');
  return Object.freeze({
    username: user.steem_username,
    sf,
    energy,
    totalPoints: Number(user.total_points) || 0
  });
}

export function transactionPage(rows = []) {
  return rows.map((row) => ({
    id: row.id,
    type: row.type,
    amount: Number(row.amount),
    createdAt: row.created_at
  }));
}
