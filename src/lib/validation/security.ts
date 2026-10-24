/**
 * Security and sanitization utilities for Plan-B.
 * Defends against prompt injection, XSS in rendered outputs, and abusive payloads.
 */

/**
 * Escapes characters that could be dangerous for HTML rendering.
 */
export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Detects and neutralizes common prompt-injection markers in user free-text inputs.
 * Ensures system delimiter isolation.
 */
export function sanitizePromptInput(input: string, maxLength: number = 500): string {
  if (!input) return "";

  // 1. Truncate to maximum permissible length
  let sanitized = input.slice(0, maxLength);

  // 2. Neutralize dangerous LLM delimiters and system escape sequences
  sanitized = sanitized
    .replace(/```/g, "'''")
    .replace(/\[SYSTEM\]/gi, "[Filtered]")
    .replace(/\[INSTRUCTION\]/gi, "[Filtered]")
    .replace(/<\|.*?\|>/g, "")
    .replace(/<\/?(script|iframe|object|embed)[^>]*>/gi, "");

  // 3. Remove non-printable control characters (except common whitespace)
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");

  return sanitized.trim();
}

/**
 * In-memory token bucket rate limiter for local API endpoints.
 */
interface RateLimitRecord {
  tokens: number;
  lastRefill: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();
const CAPACITY = 60; // Max requests per window
const REFILL_RATE_MS = 60_000; // 1 minute window

export function checkRateLimit(clientIp: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  let record = rateLimitMap.get(clientIp);

  if (!record) {
    record = { tokens: CAPACITY - 1, lastRefill: now };
    rateLimitMap.set(clientIp, record);
    return { allowed: true, remaining: record.tokens };
  }

  // Refill tokens based on elapsed time
  const elapsed = now - record.lastRefill;
  if (elapsed > REFILL_RATE_MS) {
    record.tokens = CAPACITY;
    record.lastRefill = now;
  }

  if (record.tokens > 0) {
    record.tokens -= 1;
    return { allowed: true, remaining: record.tokens };
  }

  return { allowed: false, remaining: 0 };
}
