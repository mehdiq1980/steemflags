import json
from pathlib import Path
from datetime import datetime, timezone

ROOT = Path(__file__).resolve().parents[1]
QUEUE = ROOT / "data/rewards/pending.json"
LEADERBOARD = ROOT / "data/leaderboard.json"

queue = json.loads(QUEUE.read_text(encoding="utf-8"))
lb = json.loads(LEADERBOARD.read_text(encoding="utf-8"))

events = queue.get("events", [])
processed = set(lb.get("processed_events", []))
players = lb.setdefault("players", {})
new_events = []

for event in events:
    event_id = str(event.get("event_id", "")).strip()
    username = str(event.get("username", "")).strip().lower()
    sf = event.get("sf")

    if not event_id or not username or not isinstance(sf, int):
        continue
    if event_id in processed:
        continue
    if not 1 <= sf <= 20:
        continue
    if not all(c.isalnum() or c in "._-" for c in username):
        continue

    player = players.setdefault(username, {"sf": 0})
    player["sf"] = max(0, int(player.get("sf", 0)) + sf)
    processed.add(event_id)
    new_events.append(event_id)

if new_events:
    lb["processed_events"] = list(processed)[-5000:]
    lb["updated_at"] = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
    lb["version"] = 1
    LEADERBOARD.write_text(json.dumps(lb, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

# Keep only unprocessed events in the queue.
queue["events"] = [e for e in events if str(e.get("event_id", "")) not in processed]
QUEUE.write_text(json.dumps(queue, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
