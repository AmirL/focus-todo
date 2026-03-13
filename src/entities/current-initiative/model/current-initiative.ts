import { instanceToPlain, plainToInstance, Transform } from 'class-transformer';
import dayjs from '@/shared/lib/dayjs';

type CurrentInitiativePlain = {
  id: number;
  userId: string;
  date: string;
  suggestedListId: number | null;
  chosenListId: number | null;
  reason: string | null;
  setAt: string;
  changedAt: string | null;
};

export class CurrentInitiativeModel {
  id!: number;
  userId!: string;
  date!: string; // YYYY-MM-DD format
  suggestedListId!: number | null;
  chosenListId!: number | null;
  reason!: string | null;

  @Transform(transformDateToUTCString, { toPlainOnly: true })
  setAt!: Date;

  @Transform(transformDateToUTCString, { toPlainOnly: true })
  changedAt!: Date | null;

  static toInstance(data: CurrentInitiativePlain): CurrentInitiativeModel {
    return plainToInstance(CurrentInitiativeModel, data);
  }

  static fromPlainArray(data: CurrentInitiativePlain[]): CurrentInitiativeModel[] {
    return data.map((item) => this.toInstance(item));
  }

  static toPlain(item: CurrentInitiativeModel): CurrentInitiativePlain {
    return instanceToPlain(item) as CurrentInitiativePlain;
  }

  /**
   * Get the effective list ID (chosen if changed, otherwise suggested)
   */
  getEffectiveListId(): number | null {
    return this.chosenListId ?? this.suggestedListId;
  }

  /**
   * Check if the user changed from the suggested list
   */
  wasChanged(): boolean {
    return this.chosenListId !== null && this.chosenListId !== this.suggestedListId;
  }
}

export type ListWithLastTouched = {
  id: number;
  name: string;
  participatesInInitiative: boolean;
  lastTouchedAt: Date | null;
};

export type InitiativeBalance = {
  listId: number;
  listName: string;
  count: number;
  lastUsedDate: string | null;
};

/**
 * Calculates the balance of initiative usage across participating lists.
 * Returns counts of how many times each list was chosen/suggested in the given period.
 */
export function calculateBalance(
  initiatives: CurrentInitiativeModel[],
  lists: { id: number; name: string }[]
): InitiativeBalance[] {
  const balanceMap = new Map<number, { count: number; lastUsedDate: string | null }>();

  // Initialize all lists with 0 count
  for (const list of lists) {
    balanceMap.set(list.id, { count: 0, lastUsedDate: null });
  }

  // Count effective list usage
  for (const initiative of initiatives) {
    const effectiveListId = initiative.chosenListId ?? initiative.suggestedListId;
    if (effectiveListId !== null && balanceMap.has(effectiveListId)) {
      const current = balanceMap.get(effectiveListId)!;
      current.count++;
      if (!current.lastUsedDate || initiative.date > current.lastUsedDate) {
        current.lastUsedDate = initiative.date;
      }
    }
  }

  return lists.map((list) => ({
    listId: list.id,
    listName: list.name,
    count: balanceMap.get(list.id)?.count ?? 0,
    lastUsedDate: balanceMap.get(list.id)?.lastUsedDate ?? null,
  }));
}

/**
 * Suggests which list should be the focus for a given day.
 * Algorithm: Suggest whichever participating list was touched longest ago.
 * Lists never touched have highest priority.
 */
export function getSuggestedList(
  participatingLists: ListWithLastTouched[]
): ListWithLastTouched | null {
  if (participatingLists.length === 0) {
    return null;
  }

  // Filter to only lists that participate in initiative
  const eligibleLists = participatingLists.filter((list) => list.participatesInInitiative);

  if (eligibleLists.length === 0) {
    return null;
  }

  // Sort by lastTouchedAt: null values first (never touched), then oldest first
  const sorted = [...eligibleLists].sort((a, b) => {
    // Null (never touched) has highest priority
    if (a.lastTouchedAt === null && b.lastTouchedAt === null) {
      // Both never touched, sort by id for consistency
      return a.id - b.id;
    }
    if (a.lastTouchedAt === null) return -1;
    if (b.lastTouchedAt === null) return 1;

    // Both have been touched, oldest first
    return a.lastTouchedAt.getTime() - b.lastTouchedAt.getTime();
  });

  return sorted[0];
}

function transformDateToUTCString({ value }: { value: Date | null }) {
  if (!value) return null;
  return dayjs(value).utc().format('YYYY-MM-DD HH:mm:ss');
}
