/**
 * AVANTI OS Brain — Shared Action API Client
 *
 * Pattern: newApiInstance() + NEW_API_URL (matches Badinho's existing axios pattern)
 *
 * Used by: Home Grid overlays, Club OS chips, GAMEDAY side panel,
 *          Camp+Tryout overlays, Admin Ops console.
 * All AVANTI surfaces call the same 4 endpoints — no chip invents its own AI text.
 */

import { newApiInstance } from '@/api/instance'; // matches existing vai-mobile pattern

// ─── Types ───────────────────────────────────────────────────────────────────

export type RiskLevel = 'green' | 'yellow' | 'red';

export type ActionStatus =
  | 'prepared'
  | 'confirmation_required'
  | 'confirmed'
  | 'executing'
  | 'succeeded'
  | 'failed'
  | 'expired'
  | 'cancelled'
  | 'blocked';

export interface PrepareActionInput {
  tileId: string;
  featureKey: string;
  actionType: string;
  contextEntityType?: string;
  contextEntityId?: string;
  athleteId?: string;
  clubId?: string;
  orgId?: string;
  surface?: string;
  input?: Record<string, unknown>;
}

export interface PreparedAction {
  actionRunId: string;
  riskLevel: RiskLevel;
  status: ActionStatus;
  requiresConfirmation: boolean;
  label: string;
  summary: string;
  preview: Record<string, unknown>;
  expiresAt: string | null;
}

export interface ConfirmActionInput {
  confirmed: boolean;
  confirmationPayload?: Record<string, unknown>;
}

export interface ExecutionResult {
  actionRunId: string;
  status: ActionStatus;
  result: Record<string, unknown>;
}

export interface ActionHistoryItem {
  actionRunId: string;
  featureKey: string;
  actionType: string;
  riskLevel: RiskLevel;
  status: ActionStatus;
  summary: string;
  createdAt: string;
  executedAt: string | null;
}

export interface TileAvantiContext {
  tileId: string;
  featureKey: string;
  title: string;
  riskLevel: RiskLevel;
  summary: string;
  preparedAction: PreparedAction | null;
  quickPrompts: string[];
  navigate: { label: string; route: string };
}

// ─── API calls ───────────────────────────────────────────────────────────────

const api = newApiInstance();

// RFC 4122 v4 UUID — uses crypto.getRandomValues when available
// (React Native: ensure 'react-native-get-random-values' is imported once at app entry)
const createIdempotencyKey = (): string => {
  const cryptoObj = (globalThis as { crypto?: Crypto }).crypto;
  if (cryptoObj?.randomUUID) {
    return `idemp_${cryptoObj.randomUUID()}`;
  }
  if (cryptoObj?.getRandomValues) {
    const bytes = new Uint8Array(16);
    cryptoObj.getRandomValues(bytes);
    bytes[6] = (bytes[6] & 0x0f) | 0x40; // version 4
    bytes[8] = (bytes[8] & 0x3f) | 0x80; // variant 10
    const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
    return `idemp_${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
  }
  throw new Error(
    "createIdempotencyKey requires crypto.randomUUID or crypto.getRandomValues. " +
    "On React Native, import 'react-native-get-random-values' at app entry."
  );
};

export const avantiActionsApi = {
  /**
   * Prepare an AVANTI action.
   * Green → completes immediately (status=succeeded, no confirmation needed).
   * Yellow → stops at confirmation_required — show confirm card before execute.
   * Red → returns blocked explanation, riskLevel='red', never executable.
   * Pass a stable idempotencyKey from UI state for retry-safe behavior.
   */
  prepare: async (
    input: PrepareActionInput,
    idempotencyKey?: string
  ): Promise<PreparedAction> => {
    const { data } = await api.post<{ data: PreparedAction }>(
      '/v1/avanti/actions/prepare',
      input,
      { headers: { 'Idempotency-Key': idempotencyKey ?? createIdempotencyKey() } }
    );
    return data.data;
  },

  /**
   * Confirm a Yellow action.
   * Must be called before execute for any Yellow action.
   * Show exact preview card and wait for user tap before calling this.
   * Pass a stable idempotencyKey from UI state for retry-safe behavior.
   */
  confirm: async (
    actionRunId: string,
    input: ConfirmActionInput,
    idempotencyKey?: string
  ): Promise<{ actionRunId: string; status: ActionStatus }> => {
    const { data } = await api.post<{ data: { actionRunId: string; status: ActionStatus } }>(
      `/v1/avanti/actions/${actionRunId}/confirm`,
      input,
      { headers: { 'Idempotency-Key': idempotencyKey ?? createIdempotencyKey() } }
    );
    return data.data;
  },

  /**
   * Execute a confirmed action.
   * Never call without a preceding confirm for Yellow actions.
   * Green actions that completed at prepare time do not need execute.
   * Pass a stable idempotencyKey from UI state for retry-safe behavior.
   */
  execute: async (
    actionRunId: string,
    idempotencyKey?: string
  ): Promise<ExecutionResult> => {
    const { data } = await api.post<{ data: ExecutionResult }>(
      `/v1/avanti/actions/${actionRunId}/execute`,
      {},
      { headers: { 'Idempotency-Key': idempotencyKey ?? createIdempotencyKey() } }
    );
    return data.data;
  },

  /**
   * Fetch AVANTI action history for the current user.
   * Used by: AVANTI full chat/history screen, Admin Ops audit view.
   */
  history: async (params?: {
    featureKey?: string;
    status?: ActionStatus;
    limit?: number;
    cursor?: string;
  }): Promise<ActionHistoryItem[]> => {
    const { data } = await api.get<{ data: ActionHistoryItem[] }>(
      '/v1/avanti/actions/history',
      { params }
    );
    return data.data;
  },

  /**
   * Lazy-load AVANTI context for a tile overlay.
   * Called on tile TAP — not on home screen load.
   * Home screen load uses GET /v1/home/context (useHomeContext hook).
   */
  getTileContext: async (
    tileId: string,
    params?: { contextEntityId?: string; athleteId?: string }
  ): Promise<TileAvantiContext> => {
    const { data } = await api.get<{ data: TileAvantiContext }>(
      `/v1/home/tiles/${tileId}/avanti-context`,
      { params }
    );
    return data.data;
  },
};
