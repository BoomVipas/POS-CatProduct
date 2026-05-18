"use client";

import { useState } from "react";
import {
  petSummary,
  speciesEmoji,
  type DemoPet,
  type PetSpecies,
} from "@/lib/demo/pets";
import { useDemoPets } from "@/lib/demo/useDemoPets";
import { useDemoAudit } from "@/lib/demo/useDemoAudit";

const SPECIES_OPTIONS: PetSpecies[] = [
  "cat",
  "dog",
  "rabbit",
  "bird",
  "other",
];

/** Inline pet roster for one customer phone. */
export function PetCardsBlock({ phone }: { phone: string }) {
  const pets = useDemoPets();
  const audit = useDemoAudit();
  const trimmed = phone.trim();
  const list = trimmed ? pets.forPhone(trimmed) : [];
  const [adding, setAdding] = useState(false);
  const [draftName, setDraftName] = useState("");
  const [draftSpecies, setDraftSpecies] = useState<PetSpecies>("cat");
  const [draftBreed, setDraftBreed] = useState("");
  const [draftWeight, setDraftWeight] = useState("");

  if (!trimmed) return null;
  if (!pets.ready) return null;

  function handleAdd() {
    if (draftName.trim().length < 1) return;
    const weight = draftWeight.trim() === "" ? undefined : Number(draftWeight);
    const pet = pets.add(trimmed, {
      name: draftName.trim(),
      species: draftSpecies,
      ...(draftBreed.trim() ? { breed: draftBreed.trim() } : {}),
      ...(weight !== undefined && Number.isFinite(weight) && weight > 0
        ? { weightKg: weight }
        : {}),
    });
    if (pet) {
      audit.log({
        action: "pet_create",
        targetTable: "pets",
        targetId: pet.id,
        summary: `+ ${pet.name} (${pet.species}) for ${trimmed}`,
        newValue: { name: pet.name, species: pet.species, breed: pet.breed },
      });
    }
    setDraftName("");
    setDraftSpecies("cat");
    setDraftBreed("");
    setDraftWeight("");
    setAdding(false);
  }

  function handleRemove(p: DemoPet) {
    if (!confirm(`Remove pet "${p.name}"?`)) return;
    pets.remove(p.id);
    audit.log({
      action: "pet_delete",
      targetTable: "pets",
      targetId: p.id,
      summary: `− ${p.name} (${p.species})`,
      oldValue: { name: p.name, species: p.species },
    });
  }

  if (list.length === 0 && !adding) {
    return (
      <button
        type="button"
        onClick={() => setAdding(true)}
        className="btn-ghost btn-sm self-start border-dashed"
      >
        + Add cat / pet for this customer
      </button>
    );
  }

  return (
    <div className="rounded-[var(--radius-md)] border border-line bg-panel p-3">
      <p className="kicker">Pets on file</p>
      <ul className="mt-2 grid gap-1.5">
        {list.map((p) => (
          <li
            key={p.id}
            className="flex items-baseline justify-between gap-2 rounded-[var(--radius-sm)] bg-soft px-2 py-1.5 text-xs"
          >
            <span>
              <span className="mr-1">{speciesEmoji(p.species)}</span>
              <strong className="font-semibold text-text">
                {petSummary(p)}
              </strong>
              {p.allergies && (
                <span className="ml-2 chip chip-warn">
                  ⚠ {p.allergies}
                </span>
              )}
            </span>
            <button
              type="button"
              onClick={() => handleRemove(p)}
              className="text-[10px] font-semibold text-[var(--color-danger-soft-fg)] hover:underline"
              aria-label={`Remove ${p.name}`}
            >
              ×
            </button>
          </li>
        ))}
      </ul>
      {adding ? (
        <div className="mt-2 grid gap-2">
          <div className="grid gap-1.5 sm:grid-cols-2">
            <input
              type="text"
              placeholder="Name (e.g. Mochi)"
              value={draftName}
              onChange={(e) => setDraftName(e.currentTarget.value)}
              className="field text-xs"
              autoFocus
            />
            <select
              value={draftSpecies}
              onChange={(e) =>
                setDraftSpecies(e.currentTarget.value as PetSpecies)
              }
              className="field text-xs"
            >
              {SPECIES_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {speciesEmoji(s)} {s}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Breed (optional)"
              value={draftBreed}
              onChange={(e) => setDraftBreed(e.currentTarget.value)}
              className="field text-xs"
            />
            <input
              type="number"
              placeholder="Weight kg (optional)"
              value={draftWeight}
              onChange={(e) => setDraftWeight(e.currentTarget.value)}
              min={0}
              step={0.1}
              className="field mono num text-xs"
            />
          </div>
          <div className="flex justify-end gap-1.5">
            <button
              type="button"
              onClick={() => setAdding(false)}
              className="btn-ghost btn-sm"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAdd}
              disabled={draftName.trim().length === 0}
              className="btn-accent btn-sm"
            >
              Save pet
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="btn-link mt-2 self-start text-[11px]"
        >
          + Add another
        </button>
      )}
    </div>
  );
}
