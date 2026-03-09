# Eventura - Quick Developer Reference

## 📁 Project Structure

```
eventura/
├── src/
│   ├── app/
│   │   ├── (auth routes)
│   │   │   ├── login/page.tsx          → User login page
│   │   │   └── register/page.tsx       → User registration
│   │   │
│   │   ├── (event management)
│   │   │   ├── dashboard/page.tsx      → Main dashboard after login
│   │   │   ├── browse/page.tsx         → Public event browsing
│   │   │   └── events/
│   │   │       ├── [id]/page.tsx       → Event details
│   │   │       ├── [id]/edit/page.tsx  → Event editing (Organizers)
│   │   │       └── create/page.tsx     → Create new event
│   │   │
│   │   ├── (user features)
│   │   │   ├── profile/page.tsx        → User profile
│   │   │   ├── notifications/page.tsx  → Notification center
│   │   │   └── bookmarks/page.tsx      → Saved events
│   │   │
│   │   ├── (admin)
│   │   │   └── admin/page.tsx          → Admin dashboard
│   │   │
│   │   ├── api/                        → API routes (handlers)
│   │   ├── page.tsx                    → Homepage
│   │   ├── layout.tsx                  → Root layout
│   │   └── globals.css                 → Global styles
│   │
│   └── lib/                            → Shared utilities
│
├── public/                             → Static assets
├── prisma/                             → Database schema & migrations
├── .env.local                          → Environment variables
├── package.json                        → Dependencies
├── tsconfig.json                       → TypeScript config
└── tailwind.config.ts                  → Tailwind CSS config
```

## 🎨 Theme Configuration

**Colors Used:**
- **Background**: `bg-ink` / `bg-gray-900` - Dark background
- **Text**: `text-white` - Primary text
- **Muted**: `text-muted` / `text-gray-400` - Secondary text
- **Accent**: `text-neon` / `text-purple-400` - Interactive elements
- **Borders**: `border-white/10` - Subtle borders

**Key Tailwind Classes:**
```tsx
// Dark background
className="bg-ink" // or "bg-gray-900"

// Text styling
className="text-white text-muted text-neon"

// Hover effects with borders
className="border border-white/10 hover:border-neon/50"

// Grid layouts
className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"

// Interactive elements
className="bg-neon text-black hover:bg-neon/80 transition"
```

## 🔐 Authentication Flow

### User Registration
```
/register → Collect (name, email, password, college, role)
         → POST /api/auth/register
         → Store JWT in HTTP-only cookie
         → Redirect to /dashboard
```

### User Login
```
/login → Collect (email, password)
      → POST /api/auth/login
      → Store JWT in HTTP-only cookie
      → Redirect to /dashboard
```

### Protected Routes
```tsx
// Check authentication in client components
useEffect(() => {
  const checkAuth = async () => {
    const response = await fetch('/api/auth/me');
    if (!response.ok) {
      router.push('/login');
    }
  };
  checkAuth();
}, []);
```

## 📝 Common Component Patterns

### Page with Navigation
```tsx
'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function PageName() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-ink text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/50">
        <div className="mx-auto max-w-6xl px-6 py-4">
          <Link href="/dashboard" className="text-neon hover:underline">
            ← Back
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-6xl px-6 py-12">
        {/* Page content */}
      </main>
    </div>
  );
}
```

### Form with Validation
```tsx
const [formData, setFormData] = useState({ field: '' });
const [error, setError] = useState('');
const [loading, setLoading] = useState(false);

const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const { name, value } = e.target;
  setFormData(prev => ({ ...prev, [name]: value }));
};

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError('');
  setLoading(true);

  try {
    const response = await fetch('/api/endpoint', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    if (response.ok) {
      // Success handling
    } else {
      const data = await response.json();
      setError(data.error || 'Action failed');
    }
  } catch (err) {
    setError('Something went wrong');
  } finally {
    setLoading(false);
  }
};
```

### API Fetch Pattern
```tsx
const [data, setData] = useState(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState('');

useEffect(() => {
  const fetchData = async () => {
    try {
      const response = await fetch('/api/endpoint');
      
      if (response.status === 401) {
        router.push('/login');
        return;
      }
      
      if (response.ok) {
        const result = await response.json();
        setData(result);
      }
    } catch (err) {
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, []);
```

## 🎯 Key Routes & Their Purpose

| Route | Purpose | Auth Required |
|-------|---------|---------------|
| `/` | Landing/Home page | No |
| `/login` | User login | No |
| `/register` | User registration | No |
| `/browse` | Public event browsing | No |
| `/dashboard` | Main authenticated dashboard | Yes |
| `/events/[id]` | Event details & registration | No* |
| `/events/[id]/edit` | Edit event (Organizer only) | Yes (Organizer) |
| `/events/create` | Create new event | Yes (Organizer) |
| `/profile` | User profile page | Yes |
| `/bookmarks` | Saved events | Yes |
| `/notifications` | Notification center | Yes |
| `/admin` | Admin dashboard | Yes (Admin) |

*\* Event details visible to all, but registration/edit requires auth*

## 🔄 State Management Patterns

**Local State for Forms:**
```tsx
const [formData, setFormData] = useState({
  field1: '',
  field2: '',
});
```

**Loading & Error States:**
```tsx
const [loading, setLoading] = useState(true);
const [error, setError] = useState('');
```

**Data Display:**
```tsx
const [data, setData] = useState<DataType[]>([]);
```

**Boolean Toggles:**
```tsx
const [isOpen, setIsOpen] = useState(false);
```

## 🎨 Commonly Used Tailwind Patterns

### Button Styles
```tsx
// Primary (Neon accent)
className="bg-neon text-black px-6 py-3 rounded-lg hover:bg-neon/80 transition"

// Secondary (Border)
className="border border-white/10 px-6 py-3 rounded-lg hover:bg-white/5 transition"

// Destructive (Red)
className="border border-red-500/30 text-red-400 px-6 py-3 rounded-lg hover:bg-red-500/10 transition"
```

### Input Styles
```tsx
className="px-4 py-2 bg-black/40 border border-white/10 rounded-lg focus:outline-none focus:border-neon transition"
```

### Card Styles
```tsx
className="rounded-lg border border-white/10 bg-black/40 p-6 hover:border-neon/50 transition"
```

### Grid Layouts
```tsx
// 2 columns on md, 3 on lg
className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"

// Responsive padding
className="px-6 py-12"
```

## 🛠️ Development Workflow

### Adding a New Page
1. Create directory: `src/app/newpage/`
2. Create `page.tsx` with 'use client' directive
3. Import necessary components (Link, useRouter, etc.)
4. Add navigation link from existing pages
5. Test navigation flow

### Adding an API Endpoint
1. Create route in `src/app/api/endpoint/route.ts`
2. Define request handler (GET, POST, PUT, DELETE)
3. Add JWT verification if protected
4. Return JSON responses
5. Update feature documentation

### Styling New Components
1. Use existing Tailwind classes from other components
2. Maintain dark theme (bg-ing, text-white, borders-white/10)
3. Use neon accent (purple-400) for interactive elements
4. Test responsiveness (mobile, tablet, desktop)
5. Ensure hover states are visible

## 🚀 Deployment Checklist

- [ ] Environment variables set (.env.local)
- [ ] Database migrations run
- [ ] API endpoints tested
- [ ] Navigation flows verified
- [ ] Forms validated (client + server)
- [ ] Error handling works
- [ ] Mobile responsiveness checked
- [ ] Dark theme verified
- [ ] Security checks passed (auth, CORS)
- [ ] Build succeeds (`npm run build`)

## 🐛 Debugging Tips

**Check Authentication:**
```tsx
// In browser console
fetch('/api/auth/me').then(r => r.json()).then(console.log)
```

**Check Environment Variables:**
```tsx
// In page component
console.log(process.env.NEXT_PUBLIC_*)
```

**View Network Requests:**
- Open DevTools → Network tab
- Filter by XHR/Fetch
- Check request/response headers & bodies

**Clear Cache:**
```bash
rm -rf .next
npm run dev
```

## 📚 Useful Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Prisma ORM Docs](https://www.prisma.io/docs)

---

**Happy Coding! 🚀**
