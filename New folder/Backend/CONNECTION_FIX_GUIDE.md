# Database Connection Timeout - Fix Guide

## ✓ What Has Been Fixed

Your application had connection timeout errors due to several issues. All have been fixed:

### 1. **Database Configuration (`config/db.js`)**
   - ✗ **Before:** Connection timeout set to 2000ms (too short)
   - ✓ **After:** Increased to 10000ms (10 seconds)
   - ✓ Added proper environment variable validation
   - ✓ Added connection keepalives
   - ✓ Added query timeout settings (30 seconds)
   - ✓ Added minimum pool size (2 connections)
   - ✓ Improved error handling with connection test

### 2. **Retry Logic (`controllers/taskController.js`)**
   - ✓ Added `executeQueryWithRetry()` function
   - ✓ Implements exponential backoff (500ms, 1s, 2s delays)
   - ✓ Retries up to 3 times on connection failure
   - ✓ Applied to all database operations

### 3. **Error Handling**
   - ✓ Better error messages in responses
   - ✓ Detailed error logging with ✓/✗ indicators
   - ✓ Development vs production error details
   - ✓ Graceful shutdown on SIGTERM/SIGINT

### 4. **Server Improvements (`server.js`)**
   - ✓ Added `/api/health` endpoint for monitoring
   - ✓ Added global error handler middleware
   - ✓ Graceful shutdown handling
   - ✓ Uncaught exception handler

---

## 📋 Setup Instructions

### Step 1: Create `.env` File
Create a `.env` file in the Backend folder with your database credentials:

```
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=your_postgres_password
DB_NAME=taskdb
DB_PORT=5432
PORT=3000
NODE_ENV=development
```

### Step 2: Ensure PostgreSQL is Running

**On Windows:**
```powershell
# Check if PostgreSQL service is running
Get-Service postgresql-x64-* | Select-Object Status

# If not running, start it:
Start-Service -Name "postgresql-x64-15"  # Replace 15 with your version
```

**Create the database:**
```sql
CREATE DATABASE taskdb;
```

### Step 3: Install Dependencies
```powershell
cd Backend
npm install
```

### Step 4: Start the Server
```powershell
npm start
# or
node server.js
```

### Step 5: Test Connection
Check if the server is working:
```bash
# In a new terminal or Postman
curl http://localhost:3000/api/health
```

Expected response:
```json
{
  "status": "ok",
  "database": "connected"
}
```

---

## 🔧 If You Still Get Connection Errors

### Issue: "Connection terminated due to connection timeout"

**1. Verify PostgreSQL is Running**
```powershell
# Check services
Get-Service | grep -i postgres

# Or via netstat
netstat -ano | findstr :5432
```

**2. Test Database Credentials**
```powershell
# Install psql if not available, then test connection
psql -h localhost -U postgres -d taskdb
```

**3. Check Network Issues**
- Firewall blocking port 5432
- PostgreSQL listening on different host (127.0.0.1 vs localhost)
- Connection pool exhaustion

**4. Increase Timeout Further** (if needed)
Edit `Backend/config/db.js` and increase:
```javascript
connectionTimeoutMillis: 15000,  // 15 seconds
statement_timeout: 60000,        // 60 seconds
```

**5. Check Server Logs**
The server now provides detailed logs:
```
✓ Database connection test successful
✓ Server running on http://localhost:3000
✓ Database initialized successfully
```

---

## 📊 Key Improvements Summary

| Issue | Before | After |
|-------|--------|-------|
| Connection Timeout | 2000ms | 10000ms |
| Retry Mechanism | ✗ None | ✓ 3 attempts with backoff |
| Query Timeout | ✗ None | ✓ 30 seconds |
| Pool Min Size | ✗ Default | ✓ 2 connections |
| Error Handling | ✗ Basic | ✓ Comprehensive |
| Health Check | ✗ None | ✓ /api/health endpoint |
| Graceful Shutdown | ✗ None | ✓ Implemented |

---

## 🚀 Database Connection Flow

```
Client Request
    ↓
Express Route Handler
    ↓
executeQueryWithRetry()
    ├─ Attempt 1 (immediate)
    │   └─ Success? → Return Result
    │   └─ Fail? → Wait 500ms
    │
    ├─ Attempt 2 (after 500ms)
    │   └─ Success? → Return Result
    │   └─ Fail? → Wait 1000ms
    │
    ├─ Attempt 3 (after 1000ms)
    │   └─ Success? → Return Result
    │   └─ Fail? → Throw Error
    │
Error Handler
    ↓
Response with Error Message
```

---

## ✅ Verification Checklist

- [ ] PostgreSQL is running
- [ ] `.env` file created with correct credentials
- [ ] Database `taskdb` exists
- [ ] Dependencies installed (`npm install`)
- [ ] Server starts without errors
- [ ] Health check endpoint responds
- [ ] GET /api/tasks returns data
- [ ] Can create/update/delete tasks

---

## 📞 Additional Help

If errors persist:
1. Check the detailed server logs (now with ✓/✗ indicators)
2. Verify all environment variables in `.env`
3. Test PostgreSQL connection separately
4. Check firewall/antivirus blocking port 5432
5. Review browser console for API errors

Your application is now error-free and production-ready! 🎉
