## Why another view migration pattern?

We ran into an issue attempting to migrate `tasks.filters.updatedTime` views to `tasks.filters.lastInteractedTime`. In `use-save-view.ts`, we determine dirty view state by comparing the backend view to the local view from IndexedDB:

```
    const modified = !areViewsEqual(
      selectedView.definition,
      effectiveView.definition
    )
```

The problem arises that when changing a view field, unless changes to these two are synchronized, the comparision will result `dirty`. To avoid the need to do that, we apply these migrations to the backend views before setting them in the app context.
