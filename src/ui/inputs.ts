// A number field that already holds a value (qty "1", a prefilled amount) is selected
// whole on focus, so typing 5 gives 5 and not 15. The select is deferred one tick
// because on a touch screen the tap that focused the field can otherwise place the
// caret afterwards and undo the selection.
export function selectAll(e: { currentTarget: HTMLInputElement }): void {
  const input = e.currentTarget;
  setTimeout(() => input.select(), 0);
}
