import express from 'express';
import cors from 'cors';
import pg from 'pg';
const { Pool } = pg;
const app = express();
const port = Number(process.env.PORT || 3000);
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: process.env.DATABASE_SSL !== 'false' ? { rejectUnauthorized: false } : false });
app.use(cors({ origin: true, methods: ['GET', 'POST', 'OPTIONS'], allowedHeaders: ['Content-Type'] }));
app.use(express.json({ limit: '16kb' }));
const USERNAME_RE = /^[a-z0-9.-]{3,32}$/;
async function init() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required');
  await pool.query(`CREATE TABLE IF NOT EXISTS leaderboard (username TEXT PRIMARY KEY, sf INTEGER NOT NULL DEFAULT 0, updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW());`);
  await pool.query(`CREATE INDEX IF NOT EXISTS leaderboard_sf_idx ON leaderboard (sf DESC, updated_at ASC, username ASC);`);
}
app.get('/health', async (_req, res) => { try { await pool.query('SELECT 1'); res.json({ ok: true }); } catch { res.status(503).json({ ok: false }); } });
app.get('/api/leaderboard', async (req, res) => { const rawLimit = Number(req.query.limit || 10); const limit = Math.min(Math.max(Number.isInteger(rawLimit) ? rawLimit : 10, 1), 100); try { const { rows } = await pool.query('SELECT username, sf, updated_at FROM leaderboard ORDER BY sf DESC, updated_at ASC, username ASC LIMIT $1', [limit]); res.set('Cache-Control', 'no-store'); res.json({ leaderboard: rows }); } catch (error) { console.error(error); res.status(503).json({ error: 'Leaderboard unavailable' }); } });
app.post('/api/leaderboard', async (req, res) => { const username = String(req.body?.username || '').trim().toLowerCase(); const sf = Number(req.body?.sf); if (!USERNAME_RE.test(username) || !Number.isInteger(sf) || sf < -1000000000 || sf > 1000000000) return res.status(400).json({ error: 'Invalid username or SF' }); try { await pool.query(`INSERT INTO leaderboard (username, sf) VALUES ($1, $2) ON CONFLICT (username) DO UPDATE SET sf = EXCLUDED.sf, updated_at = NOW()`, [username, sf]); res.json({ ok: true }); } catch (error) { console.error(error); res.status(503).json({ error: 'Leaderboard unavailable' }); } });
init().then(() => app.listen(port, () => console.log(`Steem Flags leaderboard API listening on ${port}`))).catch(error => { console.error(error); process.exit(1); });
