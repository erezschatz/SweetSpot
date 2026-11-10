# 09 · Recipe costing

## Context

**Promise.** The baker enters each ingredient once, with what she buys and what it costs, and splits every cake's recipe into parts made of those ingredients. From then on each cake shows what it costs her next to what she charges, a changed ingredient price reaches every recipe at once, and the money screen tells her what this month's cakes cost her in materials.

**Acceptance**

- [x] Ingredients list, reached from the products screen: add and edit name, unit (grams, millilitres, pieces), pack quantity and pack price; the derived cost per unit is shown. Delete is refused while a recipe uses the ingredient. The empty list says what to do.
- [x] Product form: the recipe as named parts, each a list of ingredient lines with a quantity, for one unit of the product; parts and lines are added and removed in place; the part names are hers.
- [x] A product with a recipe shows its cost and margin on the form and its cost beside the price on the list; a product without one shows neither.
- [x] Changing an ingredient's price changes every product cost that uses it and no saved order. An order line saved while its product has a cost carries `unitCost`; the order detail shows the materials cost under the total when any line has one.
- [x] Money: the month's materials cost (orders delivered in the month) beside the income, with the difference; lines without a cost are left out and the screen says the figure follows the recipes entered (D35).
- [x] Schema version 2: an `ingredients` table, `parts` on a product, `unitCost` on an order item; a backup carries ingredients, and a version 1 backup still restores. `src/db` gets its first test, with the in-memory IndexedDB and stack-table row D33 foresaw.
- [x] `src/lib/costing.ts`, tested: cost per unit, part cost, product cost, rounding to whole agorot, no recipe → no cost.
- [x] Added 2026-11-07 before work started (D36): the product form shows the recipe scaled to a typed number of units, and the minimum and recommended price (10% and 40% margin) beside the cost.
- [x] The order detail shows the order's margin and its share of the price under the materials cost line.
- [x] Shopping list at `#/shopping`, reached from the ingredients list: ingredient totals and whole packs for the open orders due within fourteen days; products without a recipe listed underneath; `src/lib/shopping.ts` tested.
- [x] `docs/SPEC.md` data model, routes and architecture updated in the same scene.
- [x] Verified on the Pixel: three ingredients, one cake with two parts, its cost on the form and the list, an ingredient repriced, an order saved before and after, both checked by hand; the price marks, the scaled recipe and the shopping list for two open orders checked against a hand calculation.

<!-- append below, in the same commit as the change; one section per change -->
## What was done

2026-11-09, programmer's Mac. The choices made along the way are D41.

**Pure logic, all tested (162 tests in all, 34 new):**
- `src/lib/costing.ts`:
  - `costPerUnit`, unrounded;
  - `partCost`, rounded to whole agorot;
  - `productCost`, the sum of the rounded parts (D41). No recipe, an empty one, or a line naming a missing ingredient gives no cost, not ₪0.
  - `margin`;
  - `priceForMargin`, in integer arithmetic, rounded up to whole shekels, at the 10% and 40% marks;
  - `scaleQty`;
  - `orderCost` (from the lines' `unitCost`, counting those without one);
  - `monthMaterials` (delivered orders, by delivery month);
  - `usedIngredientIds`;
  - `displayUnitCost` (per kilo, litre or piece), `formatQty`, `formatShare`;
  - the ingredient form's `validateIngredient` and `ingredientFromDraft`;
  - the recipe drafts: `recipeDraft`, `validateRecipe`, `recipeFromDraft`, and `draftAsRecipe` for the live cost while she types. Empty lines are dropped, and so is a part left with no lines, even a named one; no parts left is no recipe. A part with lines needs a name, a line an ingredient and a quantity above 0.
  - small helpers `hasRecipe`, `ingredientMap`, `parseQuantity`.
- `src/lib/shopping.ts`: `shoppingList` covers open orders due today through the thirteenth day after, with the current recipes × line quantities summed by ingredient and whole packs. Products with no usable recipe and free-text lines are listed by name. The tests cover the window's edges, overdue, delivered and cancelled orders, and an exact number of packs.
- `src/lib/order-draft.ts`:
  - an order line takes its product's cost at save through a `costOf` argument;
  - a loaded line keeps the cost it was saved with as `savedCost`, together with the product it was for, apart from `productId`;
  - at save, a line on that same product keeps the saved cost, even after she retyped the name and it was unlinked for a moment; a line on another product takes that product's cost (D41).
- `src/lib/products.ts`: `productFromDraft` carries `parts`, and an empty list of parts is no recipe.
- `src/lib/backup.ts`: schema version 2 adds ingredients, recipe parts and `unitCost`, all shape-checked. A recipe naming an ingredient the file lacks is refused as damaged. A version 1 file restores with no ingredients.
- `src/lib/route.ts`: `#/ingredients`, `#/ingredients/new`, `#/ingredients/:id`, `#/shopping`.

**Data layer:**
- `src/db/schema.ts`: version 2, with an `ingredients` table (`id, name`). It needs no upgrade pass, since `parts` and `unitCost` are optional and unindexed.
- `src/db/repositories.ts`: `ingredientsRepo`. Its `deleteIfUnused` refuses an ingredient a recipe uses, checked in one transaction with the products.
- `src/db/backup.ts`:
  - backup carries ingredients;
  - restore clears and fills five tables in one transaction, and marks the settings row with the current schema version.
- `src/db/repositories.test.ts`, the first `src/db` test (D33): Dexie on fake-indexeddb, a dev dependency pinned at 6.2.6 (D41), with a stack-table row. It covers a refused and an allowed delete, a version 2 restore, and a version 1 restore over existing ingredients.

**Screens:**
- `src/screens/ingredients.tsx`:
  - the list, with each ingredient's price per kilo, litre or piece and its pack;
  - a hint when empty;
  - a link back to products, and one on to the shopping list once there is an ingredient.
- `src/screens/ingredient-form.tsx`: name, unit (three buttons), pack quantity and price, and the derived price shown live. Delete is refused with a message while a recipe uses the ingredient, and a failed delete says so.
- `src/ui/recipe-editor.tsx`: parts with her names, each a list of ingredient, quantity and unit, with a narrow ✕ to remove a line. Each part shows its cost once it is above ₪0. Without ingredients, a link to add them.
- `src/screens/product-form.tsx`:
  - the recipe editor;
  - under it, the cost, the margin (amount and share), the two price marks, and a folding "מתכון מוגדל" with a units field (default 2);
  - nothing of this when there is no recipe;
  - the form waits for the ingredients to load, so an existing recipe never flashes "add ingredients first".
- `src/screens/products.tsx`: a link to the ingredients, and "עלות … · רווח …" (amounts, no share) under each product that has a recipe.
- `src/screens/order-form.tsx`: reads products and ingredients at save to give each line its cost.
- `src/screens/order-detail.tsx`: under the total, the materials cost and the margin with its share, when any line has a cost. A note says when some lines have none.
- `src/screens/money.tsx`: the month's materials cost and what is left of the income after it, with the estimate note and the count of lines saved without a cost. Shown when the month's delivered orders have any cost above ₪0 or any line without one.
- `src/screens/shopping.tsx`: the list, its date range and order count, packs (one pack in the singular), and the products not covered.
- `src/ui/bottom-nav.tsx`: the products tab stays lit on the ingredient screens and the shopping list. The ingredient form hides the bar.
- `src/app.tsx`: the four new routes. `package.json`/`package-lock.json`: fake-indexeddb.
- `src/i18n/he.ts`: the `recipe`, `ingredients` and `shopping` blocks, and new lines in `products`, `orderDetail` and `money`. CSS for the recipe lines.
- `docs/SPEC.md`:
  - the costing, money, routes, backup, code layout, data model and derived values;
  - the stack table.
- D41.

**Observed by Claude** in the browser pane at 360×780 against the dev server, not on a device.
- **Setup:**
  - The pane's database was on version 1 with 9 orders, and opened as version 2 with all 9 kept.
  - Its data was then set aside, and put back afterwards.
  - Three ingredients: flour 1,000 g for ₪6, butter 200 g for ₪9, eggs 12 for ₪15.
  - One cake at ₪200 in two parts: בצק (300 g flour, 4 eggs) and קרם (100 g butter, 1 egg).
- **Product form** (hand calculation: ₪6.80 + ₪5.75 = ₪12.55):
  - parts ₪6.8 and ₪5.75, cost ₪12.55, margin ₪187.45 · 94%;
  - minimum ₪14 (₪13.94 rounded up) and recommended ₪21 (₪20.92);
  - at 2 units the recipe read 600 g flour, 8 eggs, 200 g butter, 2 eggs;
  - the list showed "עלות ₪12.55 · רווח ₪187.45".
- **Orders and repricing:**
  - An order for 2 cakes saved through the form carried `unitCost` 1255.
  - Butter repriced to ₪18 through the ingredient form. The form showed ₪90 per kilo, and the list showed the cake at ₪17.05.
  - The saved order still carried 1255, and kept it when opened in the form and saved again. Its detail showed cost ₪25.1 and margin ₪374.9 · 94%.
  - A second order saved after the repricing (1 cake, 3 cookies) carried 1705 on the cake and no cost on the cookies.
- **Shopping list** for the two orders (12 and 20 Nov): eggs 15, 2 packs; butter 300 g, 2 packs; flour 900 g, 1 pack, all as calculated. Cookies ×3 were listed underneath. A single pack then read "אריזות", which was changed to "אריזה".
- **Money** with both orders marked delivered this month and ₪400 paid: income ₪400, materials ₪42.15, ₪357.85 left, and one line without a cost noted.
- **Layout:** at 360 px the recipe line's remove button took too much room. It became a ✕, and the unit column got a fixed width.

A fresh-reader review led to these fixes before commit, after the browser run:
- The saved cost was lost when she retyped a product's name in an edited order: a half-typed name unlinked the line and dropped its `unitCost`, so the whole name took the current cost. The cost is now kept with the product it was for (`savedCost`), with a test that retypes letter by letter.
- A named part with no lines was saved as a recipe with no cost; it is now dropped.
- The product form showed "add ingredients first" while the ingredients were still loading.
- Delete on the ingredient form had no failure message.
- Money's note said "items without a recipe"; a line can also lack a cost because it was saved before its recipe existed. It now says "saved without a cost".

Not observed:
- Deleting an ingredient through the form, because the pane dismisses the confirmation dialog. The refusal is covered by the `src/db` test.
- A backup and restore through the share sheet and file picker.
- `npm run build`; only `tsc --noEmit` and the tests were run.

Known gaps:
- Changing an ingredient's unit after a recipe uses it changes what that recipe's quantities mean; nothing warns her.
- Amounts with agorot show one decimal where the second is 0 ("₪25.1"), as prices already did.
- The materials cost sits under the income figures, not in a third box beside them.
- On a phone upgraded from version 1, the settings row keeps `schemaVersion: 1` until a restore; nothing reads it.

Not verified on a device; every box except the `src/lib`, `src/db` and `docs/SPEC.md` ones waits for the Pixel, by the step's own last box.

## What was done

2026-11-09, programmer's Mac. Erez asked why an amount with agorot read "₪25.1" rather than "₪25.10"; nothing prevented it. D42.

- `src/lib/money.ts`: `formatShekels` uses two formatters. A whole amount is shown without decimals and any amount with agorot to exactly two digits. This reaches every screen and the WhatsApp messages. Input fields still start from "25.1".
- `src/lib/money.test.ts`: the half-shekel case now expects "120.50", and a new test covers ₪25.10, ₪12.55, ₪0.05, a negative margin and ₪0. 163 tests in all.
- `docs/SPEC.md`: the formatting rule under Data model. D42.
- This closes the known gap the section above listed ("₪25.1").

In the browser pane's Chrome, `formatShekels` gave "₪25.10", "₪12.55", "₪0.05", "₪320", "-₪25.10" and "₪0". Not observed on a screen or a device; it rides on step 09's Pixel run.

## What was done

2026-11-10, on the Pixel, by the programmer, from the deploy of 28fcfa2, against the scenario Claude wrote for this step (sections A–H: upgrade, ingredients, recipe, orders and repricing, shopping list, money, backup, look). Erez reported everything as passing, with three remarks:
- the ways to the ingredients and to the shopping list were text links, and should be buttons;
- a recipe's part should be called "מרכיב", and the ingredient picker's empty choice "בחירת מוצרים";
- deleting an ingredient a recipe uses (C8) asked "למחוק?" first, and only then said it could not be deleted.

Erez also named two items for before delivery: the app's own dialogs in place of the browser's, and moving some buttons. Both went to step 10 (D43).

All acceptance boxes ticked. verified 2026-11-10, Pixel 9, Erez.

## What was done

2026-11-10, programmer's Mac. The three remarks above, D43.
- `src/screens/products.tsx`, `src/screens/ingredients.tsx`, `src/screens/shopping.tsx`: the ways between products, ingredients and the shopping list became secondary buttons in a row under the heading (`.screen-links`). The shopping-list button still appears only once there is an ingredient.
- `src/ui/recipe-editor.tsx`: the way to the ingredients, when a recipe has none, is a small button.
- `src/i18n/he.ts`: "חלק" became "מרכיב" in the recipe's explanation, field, buttons, part cost and error. The picker's empty choice reads "בחירת מוצרים".
- `src/screens/ingredient-form.tsx`: the form reads the products. Delete on an ingredient a recipe uses shows the refusal at once and asks nothing; otherwise it asks as before. `deleteIfUnused` still refuses inside its transaction.
- `tasks/10-handoff.md`: two boxes added to the Context before work on the step started: the app's own dialogs, and the buttons Erez lists.
- `docs/SPEC.md`: the costing bullet. D43.

Observed by Claude in the browser pane at 360×780:
- the ingredients screen showed "→ למוצרים" and "רשימת קניות" as buttons;
- the recipe read "שם המרכיב", "בחירת מוצרים", "הסרת המרכיב" and "עלות המרכיב: ₪4.50";
- delete on an ingredient a recipe uses showed the refusal with no dialog (none was opened), and the ingredient stayed.

The test rows were removed afterwards. Not verified on a device.
