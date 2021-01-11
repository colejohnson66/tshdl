import { strict as assert } from "assert";

// Inspired by <https://github.com/stefanpenner/get-caller-file/blob/master/index.ts>

/**
 * The information returned from `getSourceInfo`.
 * A `null` for any of the fields means that information was unable to be retrieved.
*/
type SourceInfo = {
    function: string | null,
    file: string | null,
    line: number | null,
    column: number | null,
} | null;

/**
 * Gets the info of the caller by generating and examining a stack trace.
 * 
 * @param position The position in the stack (how far to look back); Must be non-negative
 * 
 * @default
 * position: 0
 * 
 * @returns
 * The information from the stack trace.
 * `null` is returned if the information couldn't be retrieved.
 * 
 * @remarks
 * The `position` parameter refers to how many steps in the stack to look (beginning at `getSourceInfo`'s caller).
 * Therefore, a value of 0 would refer to `getSourceInfo`'s call site.
 * A value of 1 would refer to *your* caller.
 * Etc.
 */
function getSourceInfo(position = 0): SourceInfo {
    assert(position >= 0, "Position must be non-negative.");
    assert(position < Error.stackTraceLimit - 1,
        `Stack history only goes back ${Error.stackTraceLimit} steps; Requested ${position}.`);

    // ensure we get a stack trace how we want (NodeJS.CallSite[]), then get one
    const oldPrepare = Error.prepareStackTrace;
    Error.prepareStackTrace = (_, stack) => stack;
    const stack = new Error().stack;
    Error.prepareStackTrace = oldPrepare;
    assert(stack, "Failed to capture a stack snapshot.");

    const callSite = (stack as unknown as NodeJS.CallSite[])[position + 1];
    if (!callSite)
        return null;

    return {
        function: callSite.getFunctionName() || callSite.getMethodName(),
        file: callSite.getFileName(),
        line: callSite.getLineNumber(),
        column: callSite.getColumnNumber(),
    };
}

export { SourceInfo, getSourceInfo };
