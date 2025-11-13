# List Items Edit Feature

## Overview
This feature allows users to edit items within a list and view each user's total expenses for that list.

## Components Created

### 1. ListItemsEdit Component (`/src/pages/ListItemsEdit.tsx`)

A comprehensive component that provides:
- **Inline editing** of items in a table format
- **User totals display** showing each user's share of expenses
- **Real-time calculations** with Walmart rounding applied
- **Edit, save, and delete** functionality for items

#### Features:
- **User Totals Section**: Displays cards for each user showing:
  - Username with avatar
  - Total amount owed
  - Number of items shared
  - Highlighted "Highest" badge for the user with the most expenses

- **Overall Totals**: Shows subtotal, tax, and grand total

- **Editable Items Table**:
  - Click "Edit" button to enable inline editing
  - Modify item name, category, price, and shared users
  - Save or cancel changes
  - Delete items with confirmation

## Routes Added

```tsx
/lists/:id/edit-items
```

Access this route from the list detail page by clicking the "Edit Items" button.

## Styling

Added CSS classes in `App.css`:
- `.user-total-card` - Card styling for user totals
- `.user-total-card.highest` - Special styling for highest spending user
- `.user-avatar` - Circular avatar with user initial
- `.user-total-amount` - Large, prominent amount display
- `.highest-badge` - Badge indicating highest spender
- `.user-selection-compact` - Compact checkbox list for user selection
- `.user-checkbox-compact` - Individual checkbox items

## User Experience Flow

1. Navigate to a list detail page (`/lists/:id`)
2. Click "Edit Items" button in the page header
3. View user totals at the top of the page
4. See all items in an editable table
5. Click edit icon on any item to modify it
6. Make changes and click checkmark to save or X to cancel
7. Delete items using the trash icon
8. Return to list view using "Back to List View" link

## API Endpoints Used

- `GET /api/lists/:id/` - Fetch list with items and totals
- `GET /api/users/` - Fetch all users for selection
- `PUT /api/lists/items/:itemId/` - Update an item
- `DELETE /api/lists/items/:itemId/` - Delete an item

## Key Functions

### `calculateUserTotals(items)`
Processes the item data to calculate each user's total expenses across all items they're involved in.

### `handleEditClick(item)`
Activates inline editing mode for a specific item, populating the edit form with current values.

### `handleSaveEdit(itemId)`
Saves changes to an item, validates data, and refreshes the list.

### `handleDeleteItem(itemId)`
Deletes an item after user confirmation.

### `handleUserToggle(userId)`
Toggles user selection when editing which users an item is shared with.

## Backend Integration

The component relies on the `collect_item` utility function in the backend which:
- Calculates taxes based on category (5% for groceries, 7% for other)
- Applies Walmart rounding to totals
- Computes per-user shares of each item
- Returns comprehensive item data with calculated fields

## Future Enhancements

Potential improvements:
- Bulk edit functionality
- Export user totals to PDF/CSV
- Email notifications for users about their totals
- Filter and sort options for items
- Undo/redo functionality
- Drag-and-drop reordering of items

