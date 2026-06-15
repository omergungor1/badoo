export const FALLBACK_GOAL_OPTIONS = [
  { goal_key: 'lose_weight', goal_name: 'Kilo vermek', sort_order: 1 },
  { goal_key: 'gain_weight', goal_name: 'Kilo almak', sort_order: 2 },
  { goal_key: 'maintain_weight', goal_name: 'Kilosunu korumak', sort_order: 3 },
  { goal_key: 'understand_digestion', goal_name: 'Sindirim sistemini anlamak', sort_order: 4 },
  { goal_key: 'track_protein', goal_name: 'Protein takibi yapmak', sort_order: 5 },
  { goal_key: 'healthy_life', goal_name: 'Sağlıklı yaşam', sort_order: 6 },
];

export function mapFallbackGoalOptions() {
  return FALLBACK_GOAL_OPTIONS.map((option) => ({
    ...option,
    id: option.goal_key,
    is_active: true,
  }));
}
