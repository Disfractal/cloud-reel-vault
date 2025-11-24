# Firestore Migration Guide

## Overview

Your SQL schema has been converted to a Firestore NoSQL structure. This document explains how to use the new database structure.

## What Changed

### SQL → Firestore Mapping

| SQL Tables | Firestore Collections |
|------------|----------------------|
| `autospotr_core.users` | `users` |
| `autospotr_core.auto_makes` | `autoMakes` |
| `autospotr_core.auto_models` | `autoModels` |
| `autospotr_core.auto_trims` | `autoTrims` |
| `autospotr_core.clips` | `clips` |
| `autospotr_core.daily_prompts` | `dailyPrompts` |
| `autospotr_core.daily_prompt_submissions` | `users/{userId}/submissions` (subcollection) |

### Key Differences

1. **Foreign Keys → References**: Relationships use document IDs instead of SQL foreign keys
2. **Denormalization**: Common fields (like `makeName`, `modelName`) are duplicated for faster queries
3. **Subcollections**: User submissions are stored as subcollections under users
4. **No Joins**: Data is structured to minimize the need for joins

## Using the New Structure

### Import helpers and types

```typescript
import { getAllClips, searchAutosByMake, getTodayPrompt } from "@/lib/firestore-helpers";
import type { Clip, AutoMake, AutoModel } from "@/types/firestore";
```

### Common Operations

#### Get all clips
```typescript
const clips = await getAllClips();
```

#### Search by make
```typescript
const teslaTrims = await searchAutosByMake("tesla");
```

#### Get today's daily prompt
```typescript
const prompt = await getTodayPrompt();
```

#### Create a new clip
```typescript
import { createDocument, collections } from "@/lib/firestore-helpers";

await createDocument(collections.clips, {
  source: "https://storage.googleapis.com/video.mp4",
  trimId: "model-3-performance",
  trimName: "Performance",
  modelName: "Model 3",
  makeName: "Tesla",
  makeId: "tesla-id",
  duration: "2:30",
  size: "45 MB",
});
```

## Seeding Data

To populate your database with sample data:

```typescript
import { seedDatabase } from "@/lib/seed-data";

// This will add sample makes and models
await seedDatabase();
```

## Required Firestore Indexes

Create these composite indexes in the Firebase Console:

1. **clips** collection:
   - `trimId` (Ascending) + `createdOn` (Descending)

2. **autoModels** collection:
   - `makeId` (Ascending) + `name` (Ascending)

3. **autoTrims** collection:
   - `modelId` (Ascending) + `name` (Ascending)

4. **dailyPrompts** collection:
   - `promptDate` (Descending) + `promptRound` (Ascending)

### How to Create Indexes

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: `terraform-autosport-test4`
3. Navigate to Firestore Database → Indexes
4. Click "Create Index" and add the composite indexes listed above

## Migrating Existing SQL Data

If you need to migrate your existing SQL data to Firestore, you'll need to:

1. Export your SQL data to JSON
2. Transform the data to match Firestore structure
3. Use batch writes to import:

```typescript
import { writeBatch, doc, collection } from "firebase/firestore";
import { db } from "@/lib/firebase";

const batch = writeBatch(db);

// Add makes
makes.forEach(make => {
  const ref = doc(collection(db, "autoMakes"));
  batch.set(ref, make);
});

await batch.commit();
```

## Notes

- The current database name is `dev-fb-autospotr-firestore`
- Mock data will display if Firestore is empty
- All timestamps use Firestore server timestamps for consistency
- Remember to set up security rules for production use

## Next Steps

1. Create Firestore indexes (required for queries to work)
2. Run `seedDatabase()` to populate with sample data
3. Update upload functionality to create proper clip documents
4. Implement user authentication to link clips to users
5. Set up Firestore security rules

## Security Rules Example

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read access to all car data
    match /autoMakes/{makeId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    match /autoModels/{modelId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    match /clips/{clipId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && 
        resource.data.uploadedBy == request.auth.uid;
    }
  }
}
```
