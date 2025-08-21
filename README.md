# EverMedical Platform

A comprehensive medical networking and event management platform built for the healthcare industry. Connect with medical professionals, discover events, and access a marketplace for medical equipment - all in one secure, enterprise-grade platform.

## 🏥 Platform Overview

EverMedical is a next-generation healthcare platform designed to facilitate professional networking, event discovery, and business connections within the medical community. Built with modern web technologies and enterprise-grade security.

### Key Features

- **🔬 Medical Event Discovery**: Find conferences, workshops, webinars, and training sessions
- **👥 Professional Networking**: Connect with healthcare professionals worldwide  
- **🛒 RFQ Marketplace**: Request quotes for medical equipment and supplies
- **🤖 AI-Powered Recommendations**: Intelligent event and connection suggestions
- **🌍 Multilingual Support**: English and Arabic language support
- **🔒 Enterprise Security**: Row-level security with comprehensive audit logging
- **📱 Responsive Design**: Optimized for desktop, tablet, and mobile devices

## 🚀 Technology Stack

### Frontend
- **React 18** - Modern React with Hooks and Concurrent Features
- **TypeScript** - Type-safe development with full IntelliSense
- **Vite** - Fast build tool with HMR for optimal development experience
- **Tailwind CSS** - Utility-first CSS framework with custom design system
- **shadcn/ui** - Beautifully designed, accessible UI components
- **React Query** - Powerful data synchronization for React
- **React Router** - Declarative routing with protected routes

### Backend & Infrastructure
- **Supabase** - Backend-as-a-Service with PostgreSQL database
- **Row Level Security (RLS)** - Database-level security policies
- **Edge Functions** - Serverless functions for custom logic
- **Real-time Subscriptions** - Live data updates via WebSockets
- **File Storage** - Secure file uploads and management

### Development & Quality
- **ESLint** - Code linting with medical industry best practices
- **Prettier** - Code formatting for consistency
- **Husky** - Git hooks for quality assurance
- **GitHub Actions** - Continuous integration and deployment

## 🛠️ Quick Start

### Prerequisites

Ensure you have the following installed:
- **Node.js** (v18 or higher) - [Install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
- **npm** or **yarn** package manager
- **Git** for version control

### Installation

1. **Clone the repository**
   ```bash
   git clone <YOUR_GIT_URL>
   cd <YOUR_PROJECT_NAME>
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your Supabase credentials
   ```

4. **Start development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173` to see the application

### Environment Variables

Create a `.env.local` file with the following variables:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Application Configuration  
VITE_APP_URL=http://localhost:5173
VITE_APP_NAME=EverMedical

# Optional: Analytics & Monitoring
VITE_ANALYTICS_ID=your_analytics_id
VITE_SENTRY_DSN=your_sentry_dsn
```

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   ├── shared/         # Common shared components
│   ├── auth/           # Authentication components
│   ├── events/         # Event-related components
│   ├── templates/      # Page templates and layouts
│   └── security/       # Security boundary components
├── pages/              # Page components and routes
│   ├── company/        # Company pages (About, etc.)
│   └── legal/          # Legal pages (Privacy, Terms)
├── hooks/              # Custom React hooks
│   ├── auth/           # Authentication hooks
│   ├── common/         # Common utility hooks
│   └── domain/         # Domain-specific hooks
├── lib/                # Utility libraries and configurations
│   ├── i18n/           # Internationalization
│   ├── api.ts          # API client configuration
│   ├── utils.ts        # General utility functions
│   ├── constants.ts    # Application constants
│   ├── types.ts        # TypeScript type definitions
│   └── secureApi.ts    # Secure API functions
├── integrations/       # Third-party integrations
│   └── supabase/       # Supabase client and types
└── assets/             # Static assets (images, icons)
```

## 🔐 Security Features

EverMedical implements enterprise-grade security measures:

### Database Security
- **Row Level Security (RLS)** - All tables protected with granular access policies
- **Input Validation** - Comprehensive server-side and client-side validation
- **SQL Injection Prevention** - Parameterized queries and input sanitization
- **Audit Logging** - Complete audit trail for all database operations

### Authentication & Authorization
- **Multi-factor Authentication** - Support for 2FA and email verification
- **Role-based Access Control** - Granular permissions based on user roles
- **Session Management** - Secure session handling with automatic refresh
- **Rate Limiting** - API rate limiting to prevent abuse

### Data Protection
- **Encryption at Rest** - All sensitive data encrypted in database
- **Encryption in Transit** - HTTPS/TLS for all communications
- **PII Protection** - Personal information handling per healthcare regulations
- **GDPR Compliance** - Data privacy and user consent management

## 🌍 Internationalization

The platform supports multiple languages with full RTL (Right-to-Left) support:

- **English** (en) - Default language
- **Arabic** (ar) - Full RTL support with localized content

### Language Configuration

```typescript
// src/lib/i18n/translations.ts
export const translations = {
  en: {
    common: {
      welcome: "Welcome to EverMedical",
      // ... more translations
    }
  },
  ar: {
    common: {
      welcome: "مرحباً بكم في إيفر ميديكال",
      // ... more translations
    }
  }
};
```

## 🧪 Testing

Run the test suite to ensure code quality:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- UserProfile.test.tsx
```

### Testing Strategy
- **Unit Tests** - Component and function testing with Jest
- **Integration Tests** - API and database integration testing
- **E2E Tests** - End-to-end user journey testing with Cypress
- **Accessibility Tests** - WCAG compliance testing

## 📈 Performance Optimization

### Frontend Optimizations
- **Code Splitting** - Route-based and component-based splitting
- **Lazy Loading** - Dynamic imports for non-critical components
- **Image Optimization** - WebP format with fallbacks
- **Bundle Analysis** - Regular bundle size monitoring
- **Caching Strategy** - Intelligent caching with React Query

### Backend Optimizations
- **Database Indexing** - Optimized queries with proper indexes
- **Connection Pooling** - Efficient database connection management
- **CDN Integration** - Global content delivery for static assets
- **Edge Functions** - Serverless functions for optimal performance

## 🚀 Deployment

### Production Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Deploy to your hosting platform**
   
   **Vercel** (Recommended):
   ```bash
   npx vercel --prod
   ```

   **Netlify**:
   ```bash
   npm run build
   # Upload dist/ folder to Netlify
   ```

3. **Configure environment variables** in your hosting platform

### Database Migrations

Run database migrations when deploying:

```bash
# Run pending migrations
npm run db:migrate

# Reset database (development only)
npm run db:reset

# Generate new migration
npm run db:generate <migration_name>
```

## 🤝 Contributing

We welcome contributions from the medical and developer community!

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes** following our coding standards
4. **Run tests** to ensure quality
   ```bash
   npm test
   npm run lint
   ```
5. **Commit your changes**
   ```bash
   git commit -m "feat: add amazing feature"
   ```
6. **Push to your branch**
   ```bash
   git push origin feature/amazing-feature
   ```
7. **Open a Pull Request**

### Coding Standards

- **TypeScript** - All new code must be written in TypeScript
- **ESLint** - Follow our ESLint configuration
- **Testing** - Include tests for new features
- **Documentation** - Update documentation for API changes
- **Accessibility** - Ensure WCAG 2.1 AA compliance

## 📝 API Documentation

### Authentication Endpoints

```typescript
POST /auth/login
POST /auth/register  
POST /auth/logout
POST /auth/refresh
POST /auth/verify-email
POST /auth/reset-password
```

### Event Endpoints

```typescript
GET /events              # List events with filtering
POST /events             # Create new event
GET /events/:id          # Get specific event
PUT /events/:id          # Update event
DELETE /events/:id       # Delete event
POST /events/:id/register # Register for event
```

### Profile Endpoints

```typescript
GET /profiles            # Get current user profile
PUT /profiles            # Update profile
DELETE /profiles         # Delete profile
POST /profiles/avatar    # Upload avatar
```

For complete API documentation, visit `/api-docs` when running locally.

## 🔧 Configuration

### Custom Theme Configuration

```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        primary: 'hsl(var(--primary))',
        // ... custom medical theme colors
      }
    }
  }
} satisfies Config;
```

### Database Configuration

```sql
-- Example RLS policy for events
CREATE POLICY "Users can view approved events" 
ON medical_events FOR SELECT 
USING (status = 'approved');
```

## 📱 Mobile Support

EverMedical is fully responsive and optimized for mobile devices:

- **Progressive Web App (PWA)** - Installable on mobile devices
- **Touch Gestures** - Native touch interactions
- **Offline Support** - Core functionality available offline
- **Push Notifications** - Event reminders and updates

## 🆘 Support & Help

### Getting Help

- **Documentation** - Check our comprehensive docs
- **GitHub Issues** - Report bugs and request features
- **Community** - Join our Discord community
- **Email Support** - support@evermedical.com

### Troubleshooting

Common issues and solutions:

**Build Errors**:
- Ensure Node.js version is 18 or higher
- Clear node_modules and reinstall dependencies
- Check for TypeScript errors

**Database Errors**:
- Verify Supabase connection credentials
- Check RLS policies for proper permissions
- Review database migrations

**Authentication Issues**:
- Verify Supabase auth configuration
- Check redirect URLs in Supabase dashboard
- Ensure email confirmation is set up

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Healthcare Professionals** - For their feedback and requirements
- **Open Source Community** - For the amazing tools and libraries
- **Supabase Team** - For the excellent backend platform
- **React Team** - For the fantastic frontend framework

---

Built with ❤️ for the global healthcare community by the EverMedical Team.

For more information, visit our website: [evermedical.com](https://evermedical.com)