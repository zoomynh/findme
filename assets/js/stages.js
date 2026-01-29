import { storage } from "./storage.js";

export async function loadStages() {
  try {
    const res = await fetch("assets/data/stages.json", { cache: "no-store" });
    if (!res.ok) throw new Error("HTTP " + res.status);
    return await res.json();
  } catch (e) {
    console.warn("Cannot load stages.json, fallback enabled:", e);
    return {
      startStage: "stage-01",
      stages: {
        "stage-01": { title: "fallback", lines: ["type help"], commands: {} }
      }
    };
  }
}

export function resolveStage(data) {
  return storage.getStage() || data.startStage;
}

export function applyCommand({ data, stageId, input, term }) {
  const stage = data.stages[stageId];
  if (!stage) {
    term.printLine("stage not found.");
    return {};
  }

  const raw = (input || "").trim().toLowerCase();

  // --- UNLOCK ---
  if (stage.unlock?.prefix) {
    const prefix = String(stage.unlock.prefix || "").trim().toLowerCase();
    if (raw.startsWith(prefix)) {
      const attempt = raw.slice(prefix.length).trim();
      const expected = String(stage.unlock.expected || "").trim().toLowerCase();

      if (attempt === expected) {
        term.printLine("unlock ok.");
        const nextStage = stage.unlock.next;
        if (nextStage) storage.setStage(nextStage);
        return { nextStage };
      }
      term.printLine("unlock failed.");
      return {};
    }
  }

  // --- COMMANDS ---
  const commands = stage.commands || {};
  const normalizedCommands = Object.fromEntries(
    Object.entries(commands).map(([k, v]) => [String(k).trim().toLowerCase(), v])
  );

  const hit = normalizedCommands[raw];

  if (!hit) {
    term.printLine("unknown command.");
    return {};
  }

  if (hit.reply) {
    if (Array.isArray(hit.reply)) hit.reply.forEach(line => term.printLine(line));
    else term.printLine(String(hit.reply));
  }

  if (hit.action) {
    return { action: hit.action };
  }

  if (hit.next) {
    storage.setStage(hit.next);
    return { nextStage: hit.next };
  }

  return {};
}
