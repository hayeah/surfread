/**
 * Extracts text context around a user's selection, limited to a specific number of words
 * before and after the selection. This function handles selections that span multiple DOM
 * elements and maintains proper text flow.
 * 
 * The function works by:
 * 1. Creating separate ranges for before and after the selection
 * 2. Traversing the DOM tree to find text nodes in both directions
 * 3. Accumulating text until the word limit is reached
 * 
 * @param selection - The DOM Selection object containing the user's text selection
 * @param wordLimit - The maximum number of words to include before and after the selection
 * @returns A string containing: [words before] + [selected text] + [words after]
 */
export function getSelectionContext(
    selection: Selection,
    wordLimit: number = 200
): string {
    const beforeLimit = Math.floor(wordLimit / 2);
    const afterLimit = Math.floor(wordLimit / 2);

    const range = selection.getRangeAt(0);
    const selectedText = selection.toString().trim();

    const beforeRange = range.cloneRange();
    const afterRange = range.cloneRange();
    beforeRange.collapse(true);   // collapse to the start of selection
    afterRange.collapse(false);   // collapse to the end of selection

    const beforeText = getTextAroundSelection(beforeRange, beforeLimit, getPreviousTextNode);
    const afterText = getTextAroundSelection(afterRange, afterLimit, getNextTextNode);

    return `${beforeText} [[[${selectedText}]]] ${afterText}`.trim();

    function getTextAroundSelection(
        range: Range,
        limit: number,
        traverseFn: (node: Node, offset: number) => [Node | null, number]
    ): string {
        let text = '';
        let node: Node | null = traverseFn === getPreviousTextNode
            ? range.startContainer
            : range.endContainer;
        let offset = traverseFn === getPreviousTextNode
            ? range.startOffset
            : range.endOffset;

        while (node && countWords(text) < limit) {
            if (isValidTextNode(node)) {
                const nodeText = node.textContent ?? '';
                if (traverseFn === getPreviousTextNode) {
                    // Take text up to `offset` for "before" context
                    text = nodeText.slice(0, offset) + ' ' + text;
                } else {
                    // Take text from `offset` onward for "after" context
                    text += ' ' + nodeText.slice(offset);
                }
            }
            // Move to the next (or previous) text node
            const [nextNode, nextOffset] = traverseFn(node, offset);
            if (!nextNode) break;
            node = nextNode;
            offset = nextOffset;
        }

        // Trim to the requested word limit
        const words = text.trim().split(/\s+/);
        if (traverseFn === getPreviousTextNode) {
            return words.slice(-limit).join(' ');
        } else {
            return words.slice(0, limit).join(' ');
        }
    }
}

/**
 * Move to the *next* text node in the DOM, climbing up when needed.
 *
 * Returns a [node, offset] tuple:
 *   - node is the next text node or null if we’re done
 *   - offset is 0 (since when we move forward, we start at the beginning)
 */
function getNextTextNode(startNode: Node, _offset: number): [Node | null, number] {
    let current: Node | null = startNode;

    while (true) {
        // 1) If there's a firstChild, descend
        if (current.firstChild) {
            current = current.firstChild;
        }
        // 2) Else if there's a nextSibling, go to that
        else if (current.nextSibling) {
            current = current.nextSibling;
        }
        // 3) Otherwise climb up until there’s a nextSibling or we’re out of parents
        else {
            while (current && !current.nextSibling) {
                current = current.parentNode;
            }
            // If we run out of parents, we’re done
            if (!current) {
                return [null, 0];
            }
            current = current.nextSibling;
        }

        if (current && isValidTextNode(current)) {
            return [current, 0];
        }
        if (!current) {
            return [null, 0];
        }
    }
}

/**
 * Move to the *previous* text node in the DOM, climbing up when needed.
 *
 * Returns a [node, offset] tuple:
 *   - node is the previous text node or null if we’re done
 *   - offset is node.textContent.length (because we start at the end when moving backwards)
 */
function getPreviousTextNode(startNode: Node, _offset: number): [Node | null, number] {
    let current: Node | null = startNode;

    while (true) {
        // 1) If there's a previousSibling, jump there
        if (current.previousSibling) {
            current = current.previousSibling;
            // Then descend *all the way* into the last child if it’s an element
            while (current && current.lastChild) {
                current = current.lastChild;
            }
        }
        // 2) Otherwise climb up to parent
        else {
            current = current.parentNode;
            // If no parent, no more text nodes
            if (!current) {
                return [null, 0];
            }
        }

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
 * A "valid" text node is a non-empty text node.
 */
function isValidTextNode(node: Node): boolean {
    return node.nodeType === Node.TEXT_NODE && !!node.textContent?.trim();
}

function countWords(text: string): number {
    return text.trim().split(/\s+/).length;
}
