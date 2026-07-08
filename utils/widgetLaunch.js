let pendingMealCapture = false;

export function setPendingMealCapture(value = true) {
  pendingMealCapture = value;
}

export function consumePendingMealCapture() {
  const shouldCapture = pendingMealCapture;
  pendingMealCapture = false;
  return shouldCapture;
}
