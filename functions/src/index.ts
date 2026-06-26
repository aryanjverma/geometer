import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';
import OpenAI from 'openai';

/**
 * Secure OpenAI proxy for the Phase 2 review session.
 *
 * The browser never sees the OpenAI key: it is stored as the Firebase secret
 * `OPENAI_API_KEY` and only read here, server-side. The callable enforces App
 * Check (so only the deployed app can invoke it) and requires an authenticated
 * user. The client (`src/services/aiReviewService.ts`) sends a single `prompt`
 * string and receives `{ text }`; all prompt-building, number validation, and
 * answer-leak filtering stay on the client where the ground-truth answer lives.
 */

const OPENAI_API_KEY = defineSecret('OPENAI_API_KEY');

const MODEL = 'gpt-4o-mini';
const MAX_PROMPT_CHARS = 4000;

interface AiGenerateRequest {
  prompt?: unknown;
}

export const aiGenerate = onCall(
  {
    region: 'us-central1',
    enforceAppCheck: true,
    secrets: [OPENAI_API_KEY],
    timeoutSeconds: 30,
    memory: '256MiB',
  },
  async (request): Promise<{ text: string }> => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Sign in to use Geometer AI.');
    }

    const { prompt } = (request.data ?? {}) as AiGenerateRequest;
    if (typeof prompt !== 'string' || prompt.trim().length === 0) {
      throw new HttpsError('invalid-argument', 'prompt must be a non-empty string');
    }
    if (prompt.length > MAX_PROMPT_CHARS) {
      throw new HttpsError('invalid-argument', 'prompt is too long');
    }

    const client = new OpenAI({ apiKey: OPENAI_API_KEY.value() });
    try {
      const completion = await client.chat.completions.create({
        model: MODEL,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 400,
      });
      const text = completion.choices[0]?.message?.content ?? '';
      return { text };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      // Preserve the upstream message (including any 429 / retry-delay hints) so
      // the client's rate-limit cooldown breaker can parse and back off on it.
      throw new HttpsError('internal', message);
    }
  },
);
