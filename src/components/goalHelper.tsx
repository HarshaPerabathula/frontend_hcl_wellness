export const getGoalTypeLabel = (type: string): string => {
  const labels: { [key: string]: string } = {
    steps: 'Steps',
    water_intake: 'Water Intake',
    sleep_hours: 'Sleep Hours',
    exercise_minutes: 'Exercise Minutes',
    weight_loss: 'Weight Loss'
  };
  return labels[type] || type;
};