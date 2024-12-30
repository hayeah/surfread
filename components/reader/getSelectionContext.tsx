/**
 * Retrieves a text-based context around a user's selected text in the DOM.
 * The context is determined by traversing backwards for the 'before' context
 * and forwards for the 'after' context, following siblings and climbing up
 * the DOM when there are no more siblings at the current level.
 *
 * @param selection - The user's Selection object from the browser
 * @param wordLimit - Maximum total words around the selection
 * @returns A string containing the before context, the selected text bracketed,
 *          and the after context
 */
export function getSelectionContext(
    selection: Selection,
    wordLimit: number = 200
): string {
    // Split the desired context so half the words come before, half after
    const beforeLimit = Math.floor(wordLimit / 2);
    const afterLimit = Math.floor(wordLimit / 2);

    // The selected range plus some boilerplate
    const range = selection.getRangeAt(0);
    const selectedText = selection.toString().trim();

    // We create two extra Ranges: one collapsed at the start (for 'before'),
    // one collapsed at the end (for 'after') so we can gather text around them.
    const beforeRange = range.cloneRange();
    const afterRange = range.cloneRange();
    beforeRange.collapse(true);  // collapse to the start of the selection
    afterRange.collapse(false);  // collapse to the end of the selection

    // Get context before and after by walking the DOM
    const beforeText = getTextAroundSelection(beforeRange, beforeLimit, getPreviousTextNode);
    const afterText = getTextAroundSelection(afterRange, afterLimit, getNextTextNode);

    // Return them combined, with the selection bracketed
    return `${beforeText} [[[${selectedText}]]] ${afterText}`.trim();

    /**
     * Gathers text around the collapsed range, either looking backwards (previous text nodes)
     * or forwards (next text nodes). We'll keep accumulating text until we hit the word limit
     * or run out of nodes.
     *
     * @param range      The range from which we start
     * @param limit      How many total words we can accumulate
     * @param traverseFn Either getPreviousTextNode or getNextTextNode
     */
    function getTextAroundSelection(
        range: Range,
        limit: number,
        traverseFn: (node: Node, offset: number) => [Node | null, number]
    ): string {
        let text = '';

        // For the starting node, we figure out if we are looking "before" or "after",
        // and set node+offset accordingly.
        let node: Node | null =
            traverseFn === getPreviousTextNode ? range.startContainer : range.endContainer;

        let offset =
            traverseFn === getPreviousTextNode ? range.startOffset : range.endOffset;

        // Keep gathering text as long as we have a node, and haven't exceeded our word limit
        while (node && countWords(text) < limit) {
            // If it's a valid text node, slice off the relevant portion
            if (isValidTextNode(node)) {
                const nodeText = node.textContent ?? '';
                if (traverseFn === getPreviousTextNode) {
                    // For "before" context, we take text up to offset
                    text = nodeText.slice(0, offset) + ' ' + text;
                } else {
                    // For "after" context, take text from offset onward
                    text += ' ' + nodeText.slice(offset);
                }
            }

            // Move on to the next/previous text node, resetting offset appropriately
            const [nextNode, nextOffset] = traverseFn(node, offset);
            if (!nextNode) break;

            node = nextNode;
            offset = nextOffset;
        }

        // Once we've collected enough text or run out of nodes, trim to the word limit.
        const words = text.trim().split(/\s+/);
        if (traverseFn === getPreviousTextNode) {
            // We accumulated text from the end backwards, so slice from the right
            return words.slice(-limit).join(' ');
        } else {
            // For "after", we slice from the beginning
            return words.slice(0, limit).join(' ');
        }
    }
}

/**
 * Moves to the next text node in the DOM, climbing up when needed.
 * This function returns a tuple [Node | null, number]:
 *   - Node is the next valid text node or null if none exists.
 *   - offset is 0, meaning we start reading that node's text at index 0.
 *
 * The logic:
 *   1) If current has a firstChild, descend.
 *   2) Else if it has a nextSibling, move to that.
 *   3) Else climb back up (parentNode) until we find a next sibling or run out of parents.
 */
function getNextTextNode(startNode: Node, _offset: number): [Node | null, number] {
    let current: Node | null = startNode;

    while (true) {
        if (current.firstChild) {
            // Descend into the firstChild
            current = current.firstChild;
        } else if (current.nextSibling) {
            // Or move to nextSibling
            current = current.nextSibling;
        } else {
            // If no children or siblings, climb up looking for parent's nextSibling
            while (current && !current.nextSibling) {
                current = current.parentNode;
            }
            // If we exhaust parents, there's no next node
            if (!current) {
                return [null, 0];
            }
            // Move to that sibling
            current = current.nextSibling;
        }

        // If it's a valid text node, return it at offset 0
        if (current && isValidTextNode(current)) {
            return [current, 0];
        }

        if (!current) {
            return [null, 0];
        }
    }
}

/**
 * Moves to the previous text node in the DOM, climbing up when needed.
 * This function returns a tuple [Node | null, number]:
 *   - Node is the previous valid text node or null if none exists.
 *   - offset is the text length, meaning we start at the end of that node's text.
 *
 * The logic:
 *   1) If current has a previousSibling, move there.
 *      Then keep descending into that sibling's lastChild until you can't anymore.
 *   2) Otherwise climb up to current.parentNode.
 *   3) If no parent, you're at the top - stop.
 */
function getPreviousTextNode(startNode: Node, _offset: number): [Node | null, number] {
    let current: Node | null = startNode;

    while (true) {
        if (current.previousSibling) {
            // Move to the previous sibling
            current = current.previousSibling;
            // Then descend all the way down to the lastChild
            while (current && current.lastChild) {
                current = current.lastChild;
            }
        } else {
            // If there's no previous sibling, climb up to the parent
            current = current.parentNode;
            if (!current) {
                // Reached the very top, so no more text nodes
                return [null, 0];
            }
        }

        // If it's a valid text node, we start reading from the end
        if (current && isValidTextNode(current)) {
            const length = current.textContent?.length ?? 0;
            return [current, length];
        }

        if (!current) {
            return [null, 0];
        }
    }
}

/**
 * A node is "valid" if it's a text node and its text is non-empty when trimmed.
 */
function isValidTextNode(node: Node): boolean {
    return node.nodeType === Node.TEXT_NODE && !!node.textContent?.trim();
}

/**
 * Basic helper that counts the words in a string by splitting on whitespace.
 */
function countWords(text: string): number {
    return text.trim().split(/\s+/).length;
}
