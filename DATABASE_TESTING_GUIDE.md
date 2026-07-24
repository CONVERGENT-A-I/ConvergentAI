# Database Integration Testing Guide

## ✅ What Has Been Completed

### 1. Database Infrastructure
- PostgreSQL running in Docker (localhost:5432)
- pgAdmin interface (localhost:5050)
- Prisma schema with all tables created
- Service layer with database operations

### 2. Code Integration
- ✅ `SessionContextManager.onAgentTurn()` - Now async, saves assistant messages to database
- ✅ `SessionContextManager.onUserTurn()` - Saves user messages to database
- ✅ `SessionContextManager.syncToDatabase()` - Syncs profile data every 5 seconds
- ✅ `SessionContextManager.initializeFromDatabase()` - Restores session from database
- ✅ `agent.ts` - Creates/loads applications on session start
- ✅ Database operations are completely optional (safe if DATABASE_URL missing)

### 3. Key Features
- **Session Persistence**: Conversations resume where they left off
- **State Recovery**: All 4 stages (1, 2, 3, 4) restore from database
- **Conversation History**: Every user/assistant turn saved
- **Graceful Degradation**: App works normally without DATABASE_URL

---

## 🚀 How to Test the Integration

### Step 1: Ensure Database is Running

```bash
# Check if Docker containers are running
docker ps

# You should see:
# - postgres_db (port 5432)
# - pgadmin (port 5050)

# If not running, start them:
docker-compose up -d
```

### Step 2: Verify Backend Environment Variables

Check `backend/.env` file contains:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/convergentai?schema=public"
```

### Step 3: Start the Application

```bash
# Start backend server
cd backend
npm run dev

# In another terminal, start frontend (if needed)
cd ..
npm run dev
```

### Step 4: Create a Test Conversation

1. **Start a new conversation** through your application
2. **Go through the flow**:
   - Stage 1: Provide name, mortgage goal, occupancy
   - Stage 2: Provide income, debt, credit range
   - Continue as far as you like

3. **Check logs** for database activity:
   ```
   [agent-db]: ✅ Created new application (id=xxx)
   [context-manager] ✅ Successfully restored application from database
   [db-sync] ✅ Application xxx synced to database
   ```

### Step 5: Verify Data in pgAdmin

1. **Open pgAdmin**: http://localhost:5050
   - Email: `admin@admin.com`
   - Password: `admin`

2. **Connect to PostgreSQL**:
   - Right-click "Servers" → Register → Server
   - Name: `ConvergentAI Local`
   - Host: `postgres_db`
   - Port: `5432`
   - Username: `postgres`
   - Password: `password`
   - Database: `convergentai`

3. **Run queries to verify data**:

```sql
-- Check if users were created
SELECT * FROM "User";

-- Check if applications were created
SELECT * FROM "Application";

-- Check conversation history
SELECT * FROM "Conversation" ORDER BY "createdAt" DESC;

-- Check Stage 1 data
SELECT * FROM "Stage1Discovery";

-- Check Stage 2 data
SELECT * FROM "Stage2PreQualification";

-- Check all data for a specific application
SELECT 
  a.id,
  a."currentStage",
  a.status,
  u.email,
  s1."borrowerName",
  s2."grossAnnualIncome",
  COUNT(c.id) as conversation_turns
FROM "Application" a
LEFT JOIN "User" u ON a."userId" = u.id
LEFT JOIN "Stage1Discovery" s1 ON a.id = s1."applicationId"
LEFT JOIN "Stage2PreQualification" s2 ON a.id = s2."applicationId"
LEFT JOIN "Conversation" c ON a.id = c."applicationId"
GROUP BY a.id, u.email, s1."borrowerName", s2."grossAnnualIncome";
```

### Step 6: Test Session Resumption

1. **Stop the backend server** (Ctrl+C)
2. **Restart the backend server**
3. **Return to the same conversation** (same LiveKit room)
4. **Verify** that:
   - Context is restored (check logs for "Successfully restored application from database")
   - Conversation continues where it left off
   - Agent remembers all previously collected information

---

## 🔍 What to Look For

### Success Indicators ✅

1. **Console Logs**:
   ```
   [agent-db]: ✅ Created new application
   [context-manager] ✅ Successfully restored application
   [db-sync] ✅ Application synced to database
   ```

2. **Database Tables Have Data**:
   - `User` table has test users
   - `Application` table has your session
   - `Conversation` table has all turns
   - `Stage1Discovery`, `Stage2PreQualification`, etc. have form data

3. **Session Resumption Works**:
   - After restart, agent remembers previous context
   - No data loss between restarts

### Failure Indicators ❌

1. **Error Logs**:
   ```
   [agent-db]: ❌ Failed to initialize application
   [db-sync] ❌ Failed to sync to database
   ```

2. **Missing Data**:
   - Database tables are empty
   - Session doesn't resume after restart

3. **Application Crashes**:
   - Should NEVER crash even if DATABASE_URL is missing
   - Check for unhandled promise rejections

---

## 🐛 Troubleshooting

### Problem: "Database not enabled" message

**Cause**: `DATABASE_URL` environment variable is not set

**Solution**:
```bash
# Add to backend/.env
DATABASE_URL="postgresql://postgres:password@localhost:5432/convergentai?schema=public"

# Restart backend
```

### Problem: "Failed to connect to database"

**Cause**: PostgreSQL container not running

**Solution**:
```bash
# Check Docker containers
docker ps

# Start containers if not running
docker-compose up -d

# Check logs
docker logs postgres_db
```

### Problem: "Table does not exist"

**Cause**: Prisma migrations not applied

**Solution**:
```bash
cd backend
npx prisma migrate deploy
npx prisma generate
```

### Problem: Data not appearing in pgAdmin

**Possible Causes**:
1. Wrong database connection in pgAdmin (use `postgres_db` as host, not `localhost`)
2. Data is in wrong schema (check `public` schema)
3. Database sync is being skipped (check `DATABASE_URL`)

---

## 📊 Useful SQL Queries

```sql
-- See all tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Count records in each table
SELECT 
  'User' as table_name, COUNT(*) FROM "User"
UNION ALL
SELECT 'Application', COUNT(*) FROM "Application"
UNION ALL
SELECT 'Conversation', COUNT(*) FROM "Conversation"
UNION ALL
SELECT 'Stage1Discovery', COUNT(*) FROM "Stage1Discovery"
UNION ALL
SELECT 'Stage2PreQualification', COUNT(*) FROM "Stage2PreQualification";

-- View recent conversations
SELECT 
  c."applicationId",
  c.role,
  c.message,
  c."createdAt"
FROM "Conversation" c
ORDER BY c."createdAt" DESC
LIMIT 20;

-- View application progress
SELECT 
  a.id,
  a."currentStage",
  a.status,
  a."createdAt",
  u.email,
  s1."borrowerName",
  s1."mortgageGoal"
FROM "Application" a
LEFT JOIN "User" u ON a."userId" = u.id
LEFT JOIN "Stage1Discovery" s1 ON a.id = s1."applicationId"
ORDER BY a."createdAt" DESC;

-- Delete all test data (use carefully!)
DELETE FROM "Conversation";
DELETE FROM "Stage4Underwriting";
DELETE FROM "Stage3Application";
DELETE FROM "Stage2PreQualification";
DELETE FROM "Stage1Discovery";
DELETE FROM "Application";
DELETE FROM "User";
```

---

## ✨ Next Steps

After verifying the basic integration works:

1. **Test all 4 stages** - Ensure data persists correctly for each stage
2. **Test field confirmations** - Verify all `_confirmed` flags are saved
3. **Test stage transitions** - Ensure `StageTransition` table records changes
4. **Test error handling** - Remove DATABASE_URL and confirm app still works
5. **Performance testing** - Monitor sync frequency and database load

---

## 🎯 What This Enables

✅ **Session Persistence**: Users can leave and return without losing progress
✅ **Audit Trail**: Complete conversation history for compliance
✅ **Analytics**: Rich data for understanding user behavior
✅ **Recovery**: Can restore sessions after crashes
✅ **Team-Friendly**: Developers without DATABASE_URL can still work normally

---

## 📝 Team Note

**For team members WITHOUT local database setup:**

The application will work normally without `DATABASE_URL` set. You'll see:

```
[agent-db]: Database persistence disabled (no DATABASE_URL configured)
[context-manager] Database persistence DISABLED (no DATABASE_URL found)
```

This is expected! All features work, just without persistence. You'll be ready for GCP database migration in 2-3 days without any code changes.
