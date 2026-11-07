# 09 · Recipe costing

## Context

**Promise.** The baker enters each ingredient once, with what she buys and what it costs, and splits every cake's recipe into parts made of those ingredients. From then on each cake shows what it costs her next to what she charges, a changed ingredient price reaches every recipe at once, and the money screen tells her what this month's cakes cost her in materials.

**Acceptance**

- [ ] Ingredients list, reached from the products screen: add and edit name, unit (grams, millilitres, pieces), pack quantity and pack price; the derived cost per unit is shown. Delete is refused while a recipe uses the ingredient. The empty list says what to do.
- [ ] Product form: the recipe as named parts, each a list of ingredient lines with a quantity, for one unit of the product; parts and lines are added and removed in place; the part names are hers.
- [ ] A product with a recipe shows its cost and margin on the form and its cost beside the price on the list; a product without one shows neither.
- [ ] Changing an ingredient's price changes every product cost that uses it and no saved order. An order line saved while its product has a cost carries `unitCost`; the order detail shows the materials cost under the total when any line has one.
- [ ] Money: the month's materials cost (orders delivered in the month) beside the income, with the difference; lines without a cost are left out and the screen says the figure follows the recipes entered (D35).
- [ ] Schema version 2: an `ingredients` table, `parts` on a product, `unitCost` on an order item; a backup carries ingredients, and a version 1 backup still restores. `src/db` gets its first test, with the in-memory IndexedDB and stack-table row D33 foresaw.
- [ ] `src/lib/costing.ts`, tested: cost per unit, part cost, product cost, rounding to whole agorot, no recipe → no cost.
- [ ] Added 2026-11-07 before work started (D36): the product form shows the recipe scaled to a typed number of units, and the minimum and recommended price (10% and 40% margin) beside the cost.
- [ ] The order detail shows the order's margin and its share of the price under the materials cost line.
- [ ] Shopping list at `#/shopping`, reached from the ingredients list: ingredient totals and whole packs for the open orders due within fourteen days; products without a recipe listed underneath; `src/lib/shopping.ts` tested.
- [ ] `docs/SPEC.md` data model, routes and architecture updated in the same scene.
- [ ] Verified on the Pixel: three ingredients, one cake with two parts, its cost on the form and the list, an ingredient repriced, an order saved before and after, both checked by hand; the price marks, the scaled recipe and the shopping list for two open orders checked against a hand calculation.

<!-- append below, in the same commit as the change; one section per change -->
