import { buildCalendarBusyBlocks } from './calendarService.js';

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

function intervalsOverlap(leftStart, leftEnd, rightStart, rightEnd) {
  return leftStart < rightEnd && rightStart < leftEnd;
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

function buildTaskIntervals(entries = []) {
  return entries
    .filter((entry) => entry.task.durationMinutes && (entry.startAt || entry.dueAt))
    .map((entry) => {
      const start = entry.startAt ?? entry.dueAt ?? 0;
      const end = start + entry.task.durationMinutes * MINUTE_MS;
      return {
        id: entry.task.id,
        start,
        end,
        task: entry.task
      };
    })
    .filter((entry) => Number.isFinite(entry.start) && Number.isFinite(entry.end));
}

function overlapsFor(entries = []) {
  const overlaps = {};
  const intervals = buildTaskIntervals(entries);

  intervals.forEach((left) => {
    const peers = intervals
      .filter((right) => right.id !== left.id && intervalsOverlap(left.start, left.end, right.start, right.end))
      .map((item) => item.id);

    if (peers.length > 0) {
      overlaps[left.id] = peers;
    }
  });

  return overlaps;
}

function getCalendarEvents(options = {}) {
  if (Array.isArray(options.calendarEvents)) {
    return options.calendarEvents;
  }

  if (Array.isArray(options.calendarOverlay?.importedEvents)) {
    return options.calendarOverlay.importedEvents;
  }

  return [];
}

function buildBusyBlocks(events = [], windowStartMs, windowEndMs) {
  return buildCalendarBusyBlocks(events)
    .map((event) => {
      const startMs = parseDate(event.startAt)?.getTime();
      const endMs = parseDate(event.endAt)?.getTime();
      if (!Number.isFinite(startMs) || !Number.isFinite(endMs)) {
        return null;
      }
      if (!intervalsOverlap(startMs, endMs, windowStartMs, windowEndMs)) {
        return null;
      }

      const clampedStartMs = Math.max(startMs, windowStartMs);
      const clampedEndMs = Math.min(endMs, windowEndMs);
      return {
        id: event.id,
        title: event.title,
        provider: event.provider,
        calendarId: event.calendarId,
        status: event.status,
        allDay: event.allDay,
        startAt: new Date(clampedStartMs).toISOString(),
        endAt: new Date(clampedEndMs).toISOString(),
        startMs: clampedStartMs,
        endMs: clampedEndMs,
        minutes: Math.max(0, Math.round((clampedEndMs - clampedStartMs) / MINUTE_MS))
      };
    })
    .filter(Boolean)
    .sort((left, right) => left.startMs - right.startMs);
}

function mergeIntervals(intervals = []) {
  if (!intervals.length) {
    return [];
  }

  const sorted = intervals
    .map((interval) => ({ startMs: interval.startMs, endMs: interval.endMs }))
    .sort((left, right) => left.startMs - right.startMs);

  return sorted.reduce((merged, interval) => {
    const previous = merged[merged.length - 1];
    if (!previous || interval.startMs > previous.endMs) {
      merged.push({ ...interval });
      return merged;
    }

    previous.endMs = Math.max(previous.endMs, interval.endMs);
    return merged;
  }, []);
}

function getBlockedTaskIds(entries = [], busyBlocks = []) {
  if (!busyBlocks.length) {
    return [];
  }

  const blocked = new Set();
  buildTaskIntervals(entries).forEach((interval) => {
    const isBlocked = busyBlocks.some((block) => intervalsOverlap(interval.start, interval.end, block.startMs, block.endMs));
    if (isBlocked) {
      blocked.add(interval.id);
    }
  });

  return Array.from(blocked).sort();
}

function calculateAvailableMinutes(windowStartMs, windowEndMs, busyBlocks = []) {
  const occupiedMinutes = mergeIntervals(busyBlocks).reduce((total, interval) => {
    return total + Math.max(0, Math.round((interval.endMs - interval.startMs) / MINUTE_MS));
  }, 0);

  const totalMinutes = Math.max(0, Math.round((windowEndMs - windowStartMs) / MINUTE_MS));
  return Math.max(0, totalMinutes - occupiedMinutes);
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
    next.inWindow = anchor === null ? true : anchor >= nowMs && anchor <= horizonEndMs;
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
  const busyBlocks = buildBusyBlocks(getCalendarEvents(options), nowMs, horizonEndMs);
  const blockedTaskIds = getBlockedTaskIds(visible, busyBlocks);
  const availableMinutes = calculateAvailableMinutes(nowMs, horizonEndMs, busyBlocks);

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
    rankedOverlaps,
    busyBlocks: busyBlocks.map(({ startMs, endMs, ...block }) => block),
    blockedTaskIds,
    availableMinutes
  };
}

export function generatePlanSlice(tasks = [], options = {}) {
  const plan = buildPlanWindow(tasks, options);
  return {
    visible: plan.visible.map((entry) => entry.task),
    overlaps: plan.overlaps,
    rankedOverlaps: plan.rankedOverlaps,
    busyBlocks: plan.busyBlocks,
    blockedTaskIds: plan.blockedTaskIds,
    availableMinutes: plan.availableMinutes
  };
}
