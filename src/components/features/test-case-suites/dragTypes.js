/*
The MIME type a manual test case is dragged with.

Lives on its own because both the folder tree (a drop target) and the suite list (the drag
source and also a drop target) need it. Importing it from either component would make the
two import each other, which is a cycle a bundler resolves by handing one of them
`undefined` at module-evaluation time.

A custom type rather than text/plain so text dragged from anywhere else - or a case dragged
out of the browser entirely - is never mistaken for a move.
 */
export const CASE_MIME = 'application/x-angles-test-case';
