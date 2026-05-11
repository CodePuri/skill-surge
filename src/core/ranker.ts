const STOP = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'do', 'for', 'from', 'how',
  'i', 'in', 'is', 'it', 'me', 'my', 'of', 'on', 'or', 'please', 'that', 'the',
  'this', 'to', 'use', 'with', 'you', 'we', 'our', 'your', 'will', 'would',
  'could', 'should', 'need', 'want', 'like', 'just', 'make', 'get', 'was',
  'were', 'been', 'being', 'have', 'has', 'had', 'does', 'did', 'done', 'doing',
  'some', 'any', 'all', 'each', 'every', 'both',
]);

export function tokenize(value: string): Set<string> {
  return new Set(
    String(value).toLowerCase().split(/[^a-z0-9]+/).filter(t => t.length > 1 && !STOP.has(t)),
  );
}

const SIMPLE = /^(hi|hello|hey|thanks|thank you|ok|okay|yes|no|date|time|pwd|ls|whoami|bye|goodbye|cool|nice|sure|great)(,?\s*(thanks|ok|please|yeah|yep|nope|you)?)*$/i;

export function isTrivialTask(task: string): boolean {
  const terms = tokenize(task.trim());
  if (terms.size <= 1) return true;
  if (SIMPLE.test(task.trim())) return true;
  return false;
}
