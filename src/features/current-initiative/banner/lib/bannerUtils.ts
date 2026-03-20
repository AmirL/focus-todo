/** Resolve the effective list ID from pending, existing, and suggested values */
export function resolveCurrentListId(
  pendingListId: number | null,
  existingListId: number | null,
  suggestedListId: number | null | undefined,
): number | null {
  return pendingListId ?? existingListId ?? suggestedListId ?? null;
}

/** Detect whether there are unsaved changes in the initiative picker */
export function detectUnsavedChanges(
  isNotSet: boolean,
  pendingListId: number | null,
  existingListId: number | null,
): boolean {
  if (isNotSet) {
    return pendingListId !== null;
  }
  return pendingListId !== null && pendingListId !== existingListId;
}

/** Determine the selection result when a list is clicked */
export function resolveSelection(
  listId: number,
  isNotSet: boolean,
  existingListId: number | null,
): number | null {
  if (!isNotSet && listId === existingListId) {
    // Selecting the already-saved option clears pending
    return null;
  }
  return listId;
}
