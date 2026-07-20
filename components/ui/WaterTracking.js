import WaterGlassPicker from './WaterGlassPicker';

export default function WaterTracking({
  waterTotal = 0,
  waterGoal = 2000,
  consumedGlasses = 0,
  goalGlasses = 8,
  lastLogTime,
  onSelectGlasses,
  saving = false,
}) {
  return (
    <WaterGlassPicker
      title="Su Takibi"
      glasses={consumedGlasses}
      onChange={onSelectGlasses}
      min={0}
      max={goalGlasses}
      waterTotal={waterTotal}
      waterGoal={waterGoal}
      lastLogTime={lastLogTime}
      showTimestamps
      saving={saving}
    />
  );
}
