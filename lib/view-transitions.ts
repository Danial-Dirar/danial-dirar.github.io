/**
 * Names shared between pages so React's <ViewTransition> can morph an element
 * from one route into the other. Plain module: used by server and client code.
 */

/** A project's cover — the card thumbnail and the case-study hero. */
export const coverTransitionName = (slug: string) => `cover-${slug}`;
