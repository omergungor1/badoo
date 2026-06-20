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

export function mapSavedGoalsToSelectedIds(savedGoals = [], options = []) {
  const selected = [];

  for (const goal of savedGoals) {
    let match = null;

    if (goal.goal_option_id) {
      match = options.find((option) => option.id === goal.goal_option_id);
    }

    if (!match && goal.goal_name) {
      const normalizedName = goal.goal_name.trim().toLowerCase();
      match = options.find(
        (option) => option.goal_name?.trim().toLowerCase() === normalizedName,
      );
    }

    if (match && !selected.includes(match.id)) {
      selected.push(match.id);
    }
  }

  return selected;
}
