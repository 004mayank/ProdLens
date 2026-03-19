export function uid(prefix = "id") {
  // Good-enough for local-first apps.
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}
