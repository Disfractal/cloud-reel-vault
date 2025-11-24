# Firestore Schema for AutoSpotr

## Collections Structure

### users
```
users/{userId}
  - firstName: string
  - lastName: string
  - username: string (indexed)
  - picture: string (URL)
  - locale: string
  - email: string (indexed)
  - emailVerified: boolean
  - updatedOn: timestamp
  - createdOn: timestamp
  - sub: string (auth provider ID)
```

### autoMakes
```
autoMakes/{makeId}
  - name: string (indexed)
  - logoImage: string (URL)
  - foundedYear: number
  - updatedOn: timestamp
  - createdOn: timestamp
```

### autoModels
```
autoModels/{modelId}
  - name: string
  - makeId: string (reference to autoMakes)
  - makeName: string (denormalized for search)
  - productionStartYear: number
  - productionEndYear: number
  - updatedOn: timestamp
  - createdOn: timestamp
```

### autoTrims
```
autoTrims/{trimId}
  - name: string
  - modelId: string (reference to autoModels)
  - modelName: string (denormalized)
  - makeId: string (denormalized)
  - makeName: string (denormalized)
  - productionStartYear: number
  - productionEndYear: number
  - updatedOn: timestamp
  - createdOn: timestamp
```

### clips
```
clips/{clipId}
  - source: string (video URL)
  - trimId: string (reference to autoTrims)
  - trimName: string (denormalized)
  - modelName: string (denormalized)
  - makeName: string (denormalized)
  - makeLogoImage: string (denormalized)
  - uploadedBy: string (userId)
  - duration: string
  - size: string
  - updatedOn: timestamp
  - createdOn: timestamp
```

### dailyPrompts
```
dailyPrompts/{promptId}
  - promptDate: timestamp
  - promptRound: number
  - timeLimitMs: number
  - clipId: string (reference to clips)
  - questions: object
  - updatedOn: timestamp
  - createdOn: timestamp
```

### submissions (subcollection under users)
```
users/{userId}/submissions/{submissionId}
  - promptId: string (reference to dailyPrompts)
  - promptDate: timestamp
  - answers: array of objects
    - questionNumber: number
    - answer: object
    - correct: boolean
    - createdOn: timestamp
  - totalCorrect: number
  - totalElapsedTime: number
  - updatedOn: timestamp
  - createdOn: timestamp
```

## Key Design Decisions

1. **Denormalization**: Common query fields (makeName, modelName) are duplicated to avoid multiple reads
2. **Subcollections**: User submissions are stored as subcollections under users for better organization
3. **Composite Indexes**: Required for queries like "search by make and model"
4. **Timestamps**: Using Firestore server timestamps for consistency

## Indexes Required

```
Collection: autoModels
Fields: makeId (Ascending), name (Ascending)

Collection: autoTrims  
Fields: modelId (Ascending), name (Ascending)

Collection: clips
Fields: trimId (Ascending), createdOn (Descending)

Collection: dailyPrompts
Fields: promptDate (Descending), promptRound (Ascending)
```

## Migration Notes

- SQL views (auto_search, daily_answer_search, daily_leaderboard) will be replaced with:
  - Client-side queries with denormalized data
  - Cloud Functions for complex aggregations
  - Real-time listeners for leaderboard updates
