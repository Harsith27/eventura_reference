# Eventura - Event Management Platform

A modern, full-stack event management platform built with Next.js 16, TypeScript, Prisma, and PostgreSQL. Features role-based dashboards, JWT authentication, event registration, and QR code-based attendance tracking.

## 🚀 Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Service Layer Pattern
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with HTTP-only cookies
- **Validation**: Zod
- **Password Hashing**: bcryptjs
- **Fonts**: Space Grotesk (display), Sora (body), JetBrains Mono (code)

## 🎨 Design System

Eventura features a dark, modern UI inspired by Eventify with:
- **Color Scheme**: Deep blacks (#050607, #0b0f14) with neon blue accents (#5ad7ff)
- **Typography**: Clean, minimal sans-serif with custom font loading
- **Effects**: Thin borders (12-18% transparency), glass morphism, subtle gradients
- **Components**: Card glow effects, backdrop filters, grid patterns

## 📦 Project Structure

```
eventura/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/          # Authentication routes
│   │   │   └── events/        # Event CRUD routes
│   │   ├── layout.tsx         # Root layout with custom fonts
│   │   ├── page.tsx           # Landing page
│   │   └── globals.css        # Dark theme design system
│   ├── lib/
│   │   ├── prisma.ts          # Prisma client singleton
│   │   ├── auth.ts            # JWT & password utilities
│   │   └── validations.ts     # Zod schemas
│   ├── services/
│   │   ├── user.service.ts    # User business logic
│   │   └── event.service.ts   # Event business logic
│   └── middleware.ts          # Auth & role-based protection
└── .env.example               # Environment variables template
```

## 🔧 Setup Instructions

### Prerequisites

- Node.js 20+ and npm
- PostgreSQL database (local or cloud)

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your credentials:
# - DATABASE_URL: PostgreSQL connection string
# - JWT_SECRET: Random 32+ character string
```

### 3. Database Setup

```bash
# Generate Prisma Client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the landing page.

## 🛠️ Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npx prisma studio` - Open Prisma Studio (database GUI)
- `npx prisma migrate dev` - Create new migration

## 🔐 Authentication Flow

1. **Register**: `POST /api/auth/register` with email, password, name, role
2. **Login**: `POST /api/auth/login` returns JWT in HTTP-only cookie
3. **Protected Routes**: Middleware validates JWT and injects user info
4. **Logout**: `POST /api/auth/logout` clears authentication cookie

## 📊 Database Schema

**Models:**
- **User**: Email, password, role (SUPERADMIN/ADMIN/ORGANISER/USER), profile
- **College**: Name, domain, location
- **Event**: Title, description, dates, location, capacity, status
- **Registration**: User-Event link with QR code and attendance status
- **Bookmark**: User-Event bookmark/favorite
- **Notification**: User notifications for event updates
- **ContactMessage**: Contact form submissions

## 🎯 API Endpoints

### Authentication
- `POST /api/auth/register` - Create new user account
- `POST /api/auth/login` - Authenticate user
- `POST /api/auth/logout` - End user session
- `GET /api/auth/me` - Get current user profile

### Events (Protected)
- `GET /api/events` - List all events (with filters)
- `POST /api/events` - Create new event
- `GET /api/events/[id]` - Get single event
- `PUT /api/events/[id]` - Update event (creator only)
- `DELETE /api/events/[id]` - Delete event (creator only)

### Registrations (Protected)
- `POST /api/events/[id]/register` - Register for event
- `DELETE /api/events/[id]/register` - Unregister from event
- `GET /api/events/[id]/register` - Get registration with QR code
- `GET /api/registrations` - Get user's all registrations
- `GET /api/events/[id]/registrations` - Get event registrations (organizers)
- `POST /api/events/[id]/verify-attendance` - Verify QR code and mark attendance

### Bookmarks (Protected)
- `POST /api/events/[id]/bookmark` - Toggle bookmark
- `GET /api/bookmarks` - Get user's bookmarked events

### Notifications (Protected)
- `GET /api/notifications` - Get user's notifications (supports pagination & unread filter)
- `PUT /api/notifications` - Mark all notifications as read
- `PUT /api/notifications/[id]` - Mark single notification as read
- `DELETE /api/notifications/[id]` - Delete notification

## 🚧 Next Steps

### Completed ✅
- [x] **Registration Service**: User event registration with QR code generation
- [x] **Notification Service**: In-app notifications
- [x] **QR Scanner**: Attendance verification system
- [x] **Bookmark API**: Save/unsave events

### Priority Features
- [ ] **Dashboard UI**: Role-based conditional rendering (/dashboard route)
- [ ] **Email Service**: SMTP integration with Nodemailer for event reminders
- [ ] **Image Upload**: Cloudinary integration for event banners
- [ ] **Login/Register UI**: Frontend forms with validation
- [ ] **Event Management UI**: Create, edit, view events

### Future Enhancements
- [ ] Event search and filtering UI
- [ ] User profile edit page
- [ ] Admin panel for user management
- [ ] Event analytics (registrations, attendance)
- [ ] Export attendance reports (CSV/PDF)

## 📝 Architecture Notes

**Service Layer Pattern**: Business logic lives in `/services`, NOT in API routes.

**Single Dashboard Route**: Use `/dashboard` with role-based conditional rendering.

**Prisma Only**: No raw SQL queries. All database interactions use Prisma Client.

**Security**: Passwords hashed with bcrypt, JWTs in HTTP-only cookies, input validation with Zod.

