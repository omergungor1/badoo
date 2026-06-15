export const MIN_GOAL_SELECTION = 3;

export function validateGoalSelection(selectedIds) {
  if (!selectedIds?.length || selectedIds.length < MIN_GOAL_SELECTION) {
    return {
      ok: false,
      message: `En az ${MIN_GOAL_SELECTION} hedef seçmelisiniz.`,
    };
  }

  return { ok: true, message: null };
}

export function toggleGoalId(selectedIds, goalOptionId) {
  return selectedIds.includes(goalOptionId)
    ? selectedIds.filter((id) => id !== goalOptionId)
    : [...selectedIds, goalOptionId];
}

export function goalNamesFromOptions(goalOptions, selectedIds) {
  return goalOptions
    .filter((option) => selectedIds.includes(option.id))
    .map((option) => option.goal_name);
}
