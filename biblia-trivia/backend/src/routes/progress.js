const express = require("express");
const db = require("../db");
const { requireAuth } = require("../auth");

const router = express.Router();

const TIER_RANK = { free: 0, tier100: 1, tier120: 2 };

function tierRequiredFor(level) {
  if (level <= 20) return "free";
  if (level <= 100) return "tier100";
  return "tier120";
}

router.get("/", requireAuth, (req, res) => {
  const progress = db.prepare("SELECT * FROM progress WHERE user_id = ?").get(req.userId);
  if (!progress) return res.status(404).json({ error: "Progreso no encontrado." });
  res.json({ progress });
});

router.post("/advance", requireAuth, (req, res) => {
  const { level, passed, scoreGained } = req.body || {};
  const lvl = Number(level);
  const gained = Number(scoreGained) || 0;

  if (!Number.isInteger(lvl) || lvl < 21 || lvl > 120) {
    return res.status(400).json({ error: "level debe estar entre 21 y 120 (los niveles 1-20 son gratis y locales)." });
  }

  const progress = db.prepare("SELECT * FROM progress WHERE user_id = ?").get(req.userId);
  if (!progress) return res.status(404).json({ error: "Progreso no encontrado." });

  const required = tierRequiredFor(lvl);
  if (TIER_RANK[progress.tier] < TIER_RANK[required]) {
    return res.status(402).json({ error: `Este nivel requiere la suscripción "${required}".`, requiredTier: required });
  }

  if (lvl > progress.unlocked_level) {
    return res.status(409).json({ error: "No has desbloqueado ese nivel todavía." });
  }

  let unlockedLevel = progress.unlocked_level;
  let completedAt = progress.completed_at;

  if (passed && lvl === unlockedLevel && unlockedLevel < 121) {
    unlockedLevel = Math.min(121, unlockedLevel + 1);
  }
  if (passed && lvl === 120 && progress.tier === "tier120" && !completedAt) {
    completedAt = new Date().toISOString();
  }

  db.prepare(
    `UPDATE progress
     SET unlocked_level = ?, total_score = total_score + ?, completed_at = ?, updated_at = datetime('now')
     WHERE user_id = ?`
  ).run(unlockedLevel, gained, completedAt, req.userId);

  const updated = db.prepare("SELECT * FROM progress WHERE user_id = ?").get(req.userId);
  res.json({ progress: updated });
});

module.exports = router;
