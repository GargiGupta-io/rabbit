const MINUTE_MS = 60 * 1000;
const DEFAULT_HORIZON_MINUTES = 7 * 24 * 60;
const DEFAULT_WEEK_MINUTES = 7 * 24 * 60;

function parseDate(value) {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.valueOf())) {
    return null;
  }
  return parsed;
}

function clampMinuteWindow(rawMinutes, fallback) {
  const minutes = Number(rawMinutes);
  if (!Number.isFinite(minutes) || minutes <= 0) {
    return fallback;
  }
  return Math.max(1, Math.floor(minutes));
}

function toWindowStart(date) {
  const day = new Date(date);
  day.setHours(0, 0, 0, 0);
  return day.getTime();
}

function buildVisibleEntries(tasks = []) {
  return tasks
    .filter((task) => task.status !== 'deleted')
    .map((task) => ({
      task,
      startAt: parseDate(task.startAt)?.getTime() ?? null,
      dueAt: parseDate(task.dueAt)?.getTime() ?? null
    }));
}

function overlapsFor(entries = []) {
  const overlaps = {};
  const intervals = entries
    .filter((entry) => entry.task.durationMinutes && (entry.startAt || entry.dueAt))
    .map((entry) => {
      const start = entry.startAt ?? entry.dueAt ?? 0;
      const end = start + entry.task.durationMinutes * MINUTE_MS;
      return { id: entry.task.id, start, end };
    })
    .filter((entry) => Number.isFinite(entry.start));

  intervals.forEach((left) => {
    const peers = intervals
      .filter((right) => right.id !== left.id && right.start < left.end && left.start < right.end)
      .map((item) => item.id);

    if (peers.length > 0) {
      overlaps[left.id] = peers;
    }
  });

  return overlaps;
}

export function rankConflicts(overlaps = {}) {
  return Object.entries(overlaps)
    .map(([taskId, peers]) => ({
      taskId,
      count: peers.length,
      peers
    }))
    .sort((left, right) => {
      const countDiff = right.count - left.count;
      if (countDiff !== 0) {
        return countDiff;
      }
      return left.taskId.localeCompare(right.taskId);
    });
}

export function buildPlanWindow(tasks = [], options = {}) {
  const now = new Date(options.now || Date.now());
  const horizonMinutes = clampMinuteWindow(
    options.horizonMinutes ?? options.limitMinutes ?? DEFAULT_HORIZON_MINUTES,
    DEFAULT_HORIZON_MINUTES
  );
  const nowMs = now.getTime();
  const horizonEndMs = nowMs + horizonMinutes * MINUTE_MS;
  const todayStartMs = toWindowStart(now);
  const todayEndMs = todayStartMs + 24 * 60 * MINUTE_MS;
  const weekEndMs = todayStartMs + DEFAULT_WEEK_MINUTES * MINUTE_MS;

  const entries = buildVisibleEntries(tasks).map((entry) => {
    const next = { ...entry };
    const anchor = entry.startAt ?? entry.dueAt;
    next.inWindow = anchor === null ? true : (anchor >= nowMs && anchor <= horizonEndMs);
    next.isOverdue = Boolean((entry.dueAt || 0) < nowMs && entry.task.status !== 'done' && entry.task.status !== 'deleted');
    return next;
  });

  const visible = entries.filter((entry) => entry.inWindow);
  const inWindow = (value) => {
    if (value === null) {
      return false;
    }
    return value >= todayStartMs && value < weekEndMs;
  };

  const today = entries
    .filter((entry) => entry.inWindow)
    .filter((entry) => inWindow(entry.startAt ?? entry.dueAt))
    .filter((entry) => (entry.startAt ?? entry.dueAt) >= todayStartMs && (entry.startAt ?? entry.dueAt) < todayEndMs);

  const week = entries
    .filter((entry) => entry.inWindow)
    .filter((entry) => (entry.startAt ?? entry.dueAt) !== null && inWindow(entry.startAt ?? entry.dueAt));

  const overlapScores = overlapsFor(visible);
  const rankedOverlaps = rankConflicts(overlapScores);

  return {
    now: now.toISOString(),
    horizonMinutes,
    window: {
      start: new Date(nowMs).toISOString(),
      end: new Date(horizonEndMs).toISOString()
    },
    visible,
    today,
    week,
    overlaps: overlapScores,
    rankedOverlaps
  };
}

export function generatePlanSlice(tasks = [], options = {}) {
  const plan = buildPlanWindow(tasks, options);
  return {
    visible: plan.visible.map((entry) => entry.task),
    overlaps: plan.overlaps,
    rankedOverlaps: plan.rankedOverlaps
  };
}

