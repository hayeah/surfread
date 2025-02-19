import { describe, it, expect } from 'vitest'
import { prefixSearch } from './textSearch'


// This is just a type signature for clarity; the actual implementation
// is what you'd test with these specs.


describe('prefixSearch', () => {
  it('handles a single-token query, matching a prefix of one word', () => {
    // For instance, query: "coo" and title: "cool essays".
    // Expect prefixSearch to identify "coo" in "cool", but not attempt matching "essays".
    const result = prefixSearch('coo', 'cool essays')

    expect(result.matched).toBe(true)
    expect(result.highlightInfo).toEqual([
      { wordIndex: 0, matchStart: 0, matchLength: 3 }
    ])
  })

  it('matches two tokens in order when both prefixes are found', () => {
    // For the user’s example:
    // query: 'coo ess'
    // title: 'cool essays'
    // The function should return matched = true,
    // with highlight info indicating 'coo' matched the start of "cool"
    // and 'ess' matched the start of "essays".
    const result = prefixSearch('coo ess', 'cool essays')

    expect(result.matched).toBe(true)
    expect(result.highlightInfo).toEqual([
      { wordIndex: 0, matchStart: 0, matchLength: 3 }, // 'coo' in "cool"
      { wordIndex: 1, matchStart: 0, matchLength: 3 }  // 'ess' in "essays"
    ])
  })

  it('fails to match if any query token is not found in order', () => {
    // Suppose we have 'coo xyz'.
    // 'coo' would match "cool", but 'xyz' doesn't match the prefix of "essays".
    // The result should indicate no full match.
    const result = prefixSearch('coo xyz', 'cool essays')

    expect(result.matched).toBe(false)
    expect(result.highlightInfo).toEqual([])
  })

  it('allows partial matches but requires them to be in sequential word order', () => {
    // If we try 'co ess' on "cool essays",
    // 'co' should match the first 2 letters of "cool",
    // 'ess' should match the first 3 letters of "essays".
    const result = prefixSearch('co ess', 'cool essays')

    expect(result.matched).toBe(true)
    expect(result.highlightInfo).toEqual([
      { wordIndex: 0, matchStart: 0, matchLength: 2 }, // 'co' in "cool"
      { wordIndex: 1, matchStart: 0, matchLength: 3 }  // 'ess' in "essays"
    ])
  })

  it('does not skip word order once matching begins', () => {
    // If the function is supposed to match tokens across consecutive words in order,
    // for query "co ess" to match "cool other essays" or not, depends on the intended logic.
    // In some designs, it should match 'co' -> "cool", skip "other", then match 'ess' -> "essays".
    // In other designs, it must match consecutive words. Let's assume skipping is allowed
    // but the order must be maintained.
    //
    // If skipping is allowed, we expect:
    const result = prefixSearch('co ess', 'cool other essays')
    expect(result.matched).toBe(true)
    expect(result.highlightInfo).toEqual([
      { wordIndex: 0, matchStart: 0, matchLength: 2 }, // 'co' in "cool"
      { wordIndex: 2, matchStart: 0, matchLength: 3 }  // 'ess' in "essays"
    ])
    //
    // If skipping is NOT allowed, then we'd expect matched = false here.
    // Adjust to your desired behavior.
  })

  it('matches text within parentheses', () => {
    const result = prefixSearch('hen', 'blah blah (Henry James)')

    expect(result.matched).toBe(true)
    expect(result.highlightInfo).toEqual([
      { wordIndex: 2, matchStart: 1, matchLength: 3 } // 'hen' in "(Henry"
    ])
  })
})
