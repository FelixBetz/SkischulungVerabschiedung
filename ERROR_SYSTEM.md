# Error Collection System

This document describes the centralized error and warning collection system implemented for the Skischulung application.

## Overview

The system provides a centralized way to collect, store, and display errors and warnings from across the application, making them accessible through an API endpoint and a visual interface in the admin panel.

## Components

### 1. Error Store (`/lib/stores/errorStore.ts`)

The central error collection system that:

- Stores errors and warnings in memory
- Provides functions to add, retrieve, filter, and clear errors
- Maintains a maximum of 100 errors to prevent memory issues
- Still logs to console for development purposes

Key functions:

- `addError(type, source, message, details?)` - Add a new error
- `getAllErrors()` - Get all errors
- `getErrorsByType(type)` - Filter by error/warning
- `getErrorsBySource(source)` - Filter by source module
- `clearAllErrors()` - Clear all errors
- `removeError(id)` - Remove specific error by ID

### 2. API Endpoint (`/routes/api/errors/+server.ts`)

Provides REST API access to the error collection:

- `GET /api/errors` - Retrieve errors (with optional filtering)
- `DELETE /api/errors` - Clear errors (with optional filtering)

Query parameters:

- `type` - Filter by 'error' or 'warning'
- `source` - Filter by source module
- `id` - Target specific error for deletion

### 3. Error Log Component (`/lib/components/ErrorLog.svelte`)

Visual interface for the admin panel that:

- Displays all collected errors and warnings
- Provides filtering by type and source
- Allows clearing errors (all, filtered, or individual)
- Auto-refreshes every 5 seconds
- Shows timestamps and detailed error information

### 4. Integration

The error collection system has been integrated into:

- **Game1 Loader** (`/lib/data/game1-loader.ts`)
- **Game1 API** (`/routes/api/game1/+server.ts`)
- **Word Sets API** (`/routes/api/game1/wordsets/+server.ts`)
- **Game1 Admin Component** (`/lib/components/game1/Game1Admin.svelte`)
- **Admin Panel** (`/routes/admin/+page.svelte`)

## Usage

### Adding Errors in Code

```typescript
import { addError } from '$lib/stores/errorStore';

// Add an error
addError('error', 'my-module', 'Something went wrong', errorObject);

// Add a warning
addError('warning', 'my-module', 'This might be an issue');
```

### Accessing Errors via API

```javascript
// Get all errors
fetch('/api/errors');

// Get only errors
fetch('/api/errors?type=error');

// Get errors from specific source
fetch('/api/errors?source=game1-loader');

// Clear all errors
fetch('/api/errors', { method: 'DELETE' });

// Clear specific type
fetch('/api/errors?type=warning', { method: 'DELETE' });
```

### Viewing in Admin Panel

1. Navigate to the admin panel
2. The Error Log section appears at the top
3. Use filters to narrow down errors
4. Click individual × buttons to remove specific errors
5. Use "Clear" buttons to remove multiple errors

## Error Sources

Current error sources in the system:

- `game1-loader` - Word set loading and validation
- `game1-api` - Game 1 API operations
- `wordsets-api` - Word sets API operations
- `game1-admin` - Game 1 admin component operations
- `admin-panel` - General admin panel operations

## Benefits

1. **Centralized Logging** - All errors collected in one place
2. **Real-time Monitoring** - Errors appear immediately in admin panel
3. **Filtering & Search** - Easy to find specific errors or patterns
4. **API Access** - Can be integrated with external monitoring tools
5. **Memory Safe** - Automatic cleanup prevents memory issues
6. **Development Friendly** - Still logs to console for debugging

## Future Enhancements

Potential improvements:

- Persist errors to database for long-term analysis
- Add email/notification alerts for critical errors
- Export error logs to files
- Add error trend analysis
- Integrate with external logging services
