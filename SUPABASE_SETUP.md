# Supabase Connection Setup

Since you are using Sequelize in your project, **you do not fundamentally need to run any SQL queries manually**. Sequelize automatically connects to the database, reads your Javascript `models`, and builds the tables automatically. 

However, since you asked for the SQL codes, I've created all the SQL commands in `d:\AG\MLM 2ND\backend\mlm_database_schema.sql` so you have a copy of how the database looks.

Here is the exact way to connect your backend to Supabase:

### Step 1: Get the exact Database URL Address
To connect the backend, you just need a string called `DATABASE_URL`. Supabase gives this to you inside your dashboard.

1. Go to your Supabase Project (`https://supabase.com/dashboard/project/tolgbkbxrmbjjeuxkwjg`)
2. Go to **Project Settings** (gear icon on the left bottom).
3. Click on **Database** under the Configuration section.
4. Scroll down slightly until you see **Connection String**.
5. Click the **URI** tab. It will give you a string that looks something like this:
   `postgresql://postgres.tolgbkbxrmbjjeuxkwjg:[YOUR-PASSWORD]@aws-0-xyz.pooler.supabase.com:6543/postgres`

### Step 2: Configure your Backend's `.env` File
Now, open the `.env` file inside your backend (`d:\AG\MLM 2ND\backend\.env`) and add the copied connection string.

It should look like this:

```env
PORT=5000
DATABASE_URL="postgresql://postgres.tolgbkbxrmbjjeuxkwjg:yourdatabasepassword@aws-0-xyz.pooler.supabase.com:6543/postgres"
JWT_SECRET=supersecretkey
```
*(Make sure to replace `yourdatabasepassword` with the password you created when setting up the database!)*

### Step 3: Start your Backend
Since your backend `db.js` file has this code:
```javascript
if (process.env.DATABASE_URL) {
    sequelize = new Sequelize(process.env.DATABASE_URL, {
        dialect: 'postgres',
        // ...
    });
}
```
It will automatically see that `DATABASE_URL` exists and switch to Supabase. When you run `npm start` or `node server.js`, it will connect and automatically sync your tables!

### Final Vercel Step (For Deployment)
When you deploy the backend to Vercel/Render, make sure you add that exact **DATABASE_URL** variable as an Environment Variable in their deployment settings too!
