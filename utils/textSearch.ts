/**
 * Represents a segment of text that matches a search query token.
 * Used to highlight matching portions of words in search results.
 */
type HighlightSegment = {
  /** The index of the matched word in the space-separated title */
  wordIndex: number
  /** The starting character position within the matched word */
  matchStart: number
  /** The length of the matched portion */
  matchLength: number
}

/**
 * Represents the result of a prefix search operation.
 */
type SearchResult = {
  /** Indicates whether all query tokens were successfully matched in order */
  matched: boolean
  /** Array of highlight information for each matched token */
  highlightInfo: HighlightSegment[]
}

/**
 * Performs a case-insensitive prefix search on space-separated words.
 *
 * This function searches for each token from the query within the title's words,
 * requiring that:
 * 1. Each token matches as a prefix of some word
 * 2. Matches must be found in order (no backtracking)
 * 3. Once a word is matched, subsequent tokens must match later words
 *
 * @param query - Space-separated search tokens (e.g., "coo ess")
 * @param title - The target text to search within (e.g., "cool essays")
 * @returns A SearchResult object containing:
 *          - matched: true if all tokens were matched in order
 *          - highlightInfo: array of HighlightSegment objects for each match
 *
 * @example
 * // Returns { matched: true, highlightInfo: [
 * //   { wordIndex: 0, matchStart: 0, matchLength: 3 },  // 'coo' in "cool"
 * //   { wordIndex: 1, matchStart: 0, matchLength: 3 }   // 'ess' in "essays"
 * // ]}
 * prefixSearch("coo ess", "cool essays")
 *
 * @example
 * // Returns { matched: false, highlightInfo: [] }
 * prefixSearch("essay cool", "cool essays")  // Wrong order
 */
export function prefixSearch(query: string, title: string): SearchResult {
  const tokens = query.trim().split(/\s+/).filter(Boolean)
  const words = title.split(/\s+/)
  const highlightInfo: HighlightSegment[] = []

  // Edge case: if no tokens, we can either say "not matched" or "matched trivially".
  // The tests do not clarify. I'll assume "no tokens => not matched."
  if (tokens.length === 0) {
    return {
      matched: false,
      highlightInfo: []
    }
  }

  let wIndex = 0

  // For each token, we look for a word among the remaining words that starts with it.
  for (const token of tokens) {
    let found = false
    const tokenLower = token.toLowerCase()

    while (wIndex < words.length) {
      const word = words[wIndex]

      // Strip leading punctuation so that something like "(Henry" can match "hen"
      const leadingPuncMatch = word.match(/^[^a-zA-Z0-9]+/)
      const leadingPuncCount = leadingPuncMatch ? leadingPuncMatch[0].length : 0
      const wordLower = word.slice(leadingPuncCount).toLowerCase()

      // Compare lowercased token to the lowercased start of the word.
      if (wordLower.startsWith(tokenLower)) {
        highlightInfo.push({
          wordIndex: wIndex,
          matchStart: leadingPuncCount,
          matchLength: token.length
        })
        // Move to the next token. The next token search will continue from the next word.
        wIndex++
        found = true
        break
      }
      // Otherwise keep scanning through the words.
      wIndex++
    }

    // If this token was not found in any remaining words, fail immediately.
    if (!found) {
      return {
        matched: false,
        highlightInfo: []
      }
    }
  }

  // All tokens matched in order.
  return {
    matched: true,
    highlightInfo
  }
}
