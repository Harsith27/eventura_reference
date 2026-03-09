# 🚀 QUICK REFERENCE - NEXT STEPS

## What's Done ✅
- Backend API (all 15+ routes)
- Database schema (production-ready)
- Authentication (JWT + HTTP-only cookies)
- Business logic (all services)
- Validation (Zod schemas)
- Error handling
- Type safety (TypeScript strict)

## What You Need to Build 🎨
- UI Components (login, register, events, dashboard)
- Pages (frontend views)
- Forms (with React Hook Form)
- QR code display
- State management (if needed)

---

## 🎯 IMMEDIATE TODO LIST

### 1. **Test the API** (5 min)
```bash
npm run dev
# Open Postman or Insomnia
# Try the example requests in DELIVERY_SUMMARY.md
```

### 2. **Create Login UI Page** (30 min)
- Edit `src/app/login/page.tsx`
- Add form with email/password inputs
- Call `POST /api/auth/login`
- Redirect to `/dashboard` on success

### 3. **Create Register UI Page** (30 min)
- Edit `src/app/register/page.tsx`
- Add form with name, email, password, profile image URL
- Call `POST /api/auth/register`
- Redirect to `/dashboard` on success

### 4. **Create Dashboard** (45 min)
- Edit `src/app/dashboard/page.tsx`
- Use `getCurrentUser()` to check role
- Show different UI based on role:
  - USER: Shows "My Events" tab
  - ORGANISER: Shows "Manage Events" + "Create Event" tab
  - ADMIN: Shows admin controls

### 5. **Create Event Browsing** (45 min)
- Edit `src/app/events/page.tsx`
- Fetch from `GET /api/events?page=1&limit=20`
- Display event cards
- Add search/filter UI

### 6. **Create Event Detail** (30 min)
- Create `src/app/events/[id]/page.tsx`
- Show event details
- Show "Register" button for users
- After registration, show QR code

### 7. **QR Code Display** (15 min)
- In event detail or dashboard
- Fetch registration data
- Use `qrcode` npm package (already installed)
- Generate QR from registrationId:qrToken

### 8. **Organiser QR Scanner** (45 min)
- Create `src/app/dashboard/organize/[id]/scan/page.tsx`
- Use HTML5 camera API
- Scan QR code
- Call `POST /api/events/[id]/verify-attendance`

---

## 📝 QUICK API CHEAT SHEET

### Get Current User
```typescript
// Server-side only
import { getCurrentUser } from '@/lib/auth';

const user = await getCurrentUser();
if (!user) {
  // Not logged in
  redirect('/login');
}

// user is { id, email, name, role, profileImageUrl, collegeId }
```

### Call API from Client
```typescript
// Client-side component
'use client';

const handleRegister = async (data: FormData) => {
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  
  if (res.ok) {
    const result = await res.json();
    // result.data.user is the user object
  }
};
```

### Validation Types (already available)
```typescript
import { RegisterInput, CreateEventInput, etc. } from '@/lib/validations';

// Use these types in your React components!
```

---

## 🎨 UI FRAMEWORK SETUP

### Already Installed
- ✅ Tailwind CSS v4
- ✅ Next.js 16
- ✅ React 19
- ✅ TypeScript 5

### Recommended Packages
```bash
# Forms & validation
npm install react-hook-form

# Loading states
npm install react

# QR code
npm i qrcode  # Already installed!

# UI alerts/toasts
npm install sonner

# Icons
npm install lucide-react
```

---

## 📋 API ROUTES REFERENCE

### Auth
```
POST /api/auth/register - { name, email, password, profileImageUrl }
POST /api/auth/login - { email, password }
POST /api/auth/logout - No body
GET  /api/auth/me - No body
```

### Events
```
GET  /api/events - ?page=1&limit=20&search=...&filter=upcoming
POST /api/events - { title, description, date, venue, capacity, bannerUrl, isPaid }
GET  /api/events/[id] - No body
POST /api/events/[id]/register - No body
POST /api/events/[id]/verify-attendance - { qrData: "id:token" }
```

### Registrations & Bookmarks
```
GET  /api/registrations - No body
GET  /api/bookmarks - No body
POST /api/bookmarks - { eventId }
```

---

## 🌟 FILE LOCATIONS FOR UI

All pages to update:
- `src/app/page.tsx` - Home page
- `src/app/login/page.tsx` - Login
- `src/app/register/page.tsx` - Registration
- `src/app/dashboard/page.tsx` - Main dashboard
- `src/app/events/page.tsx` - Browse events
- `src/app/events/[id]/page.tsx` - Event detail
- `src/app/events/create/page.tsx` - Create event form

---

## 💡 USEFUL COMMANDS

```bash
# Development
npm run dev

# Build
npm run build

# Start production
npm start

# Lint
npm run lint

# Database
npx prisma studio  # Visual DB explorer
npx prisma db seed # Seed data
```

---

## 🔐 SECURITY REMINDERS

✅ All auth checks are server-side only
✅ Passwords never exposed in responses
✅ JWT automatically set in HTTP-only cookies
✅ Role checks happen on backend before data returns
✅ All inputs validated with Zod

**No sensitive logic on frontend!**

---

## 🎯 SUCCESS CRITERIA

Your Eventura project is complete when:
- [  ] Users can register
- [  ] Users can login
- [  ] Organisers can create events
- [  ] Users can browse events
- [  ] Users can register for events
- [  ] Users see QR code after registration
- [  ] Organisers can scan QR and mark attendance
- [  ] Users can bookmark events
- [  ] Dashboard shows role-appropriate content

---

## ❓ TROUBLESHOOTING

### "auth cookie not set"
- Check that you're not in HTTP-only blocking environment
- Production: set `NODE_ENV=production` for secure flag

### "Validation error on request"
- Check Zod schemas in `lib/validations.ts`
- Make sure all required fields are sent

### "Database connection error"
- Verify `DATABASE_URL` in `.env`
- Run `npx prisma db push`

### "import errors"
- Make sure aliases are set in `tsconfig.json`
- `@/` should resolve to `src/`

---

## 📞 FILE STRUCTURE REMINDER

```
src/
├── app/                 ← Pages & API routes  
├── lib/                 ← Utilities (auth, validations, prisma)
├── services/            ← Business logic
└── components/          ← Reusable React components (TODO)

prisma/
└── schema.prisma        ← Database schema (done)

public/                  ← Static files

.env                     ← Secrets (create from .env.example)
package.json             ← Dependencies
tsconfig.json            ← TypeScript config
```

---

## 🚀 READY?

You have a **production-grade backend**. 

The API is waiting for your UI.

**Let's build something amazing!** ✨

---

**Questions?** Check:
- DELIVERY_SUMMARY.md - Full feature list
- IMPLEMENTATION_COMPLETE.md - Technical details
- project-setup.txt - Original specifications
