# EverMedical API Reference

## 🔗 API Overview

The EverMedical platform provides a comprehensive REST API for managing medical events, user profiles, RFQs, and more. All APIs are built on Supabase with automatic authentication, validation, and security.

## 📡 Base URL
```
Production: https://your-project.supabase.co/rest/v1/
Development: http://localhost:54321/rest/v1/
```

## 🔐 Authentication

All API requests require authentication via JWT token in the Authorization header:

```http
Authorization: Bearer <your-jwt-token>
```

### Authentication Endpoints

#### Sign In
```http
POST /auth/v1/token?grant_type=password
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 3600,
  "refresh_token": "...",
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "user@example.com",
    "email_confirmed_at": "2024-01-01T00:00:00Z"
  }
}
```

#### Sign Up
```http
POST /auth/v1/signup
Content-Type: application/json

{
  "email": "newuser@example.com",
  "password": "securepassword",
  "data": {
    "first_name": "John",
    "last_name": "Doe",
    "profile_type": "medical_personnel"
  }
}
```

#### Refresh Token
```http
POST /auth/v1/token?grant_type=refresh_token
Content-Type: application/json

{
  "refresh_token": "your-refresh-token"
}
```

## 👥 User Profile APIs

### Get Current User Profile
```http
GET /profiles?select=*&user_id=eq.<user-id>
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "user_id": "123e4567-e89b-12d3-a456-426614174000",
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "username": "johndoe",
  "title": "Cardiologist",
  "organization": "City Medical Center",
  "specialty": "cardiology",
  "country": "US",
  "profile_type": "medical_personnel",
  "verified": true,
  "subscription_plan": "professional",
  "subscription_status": "active",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

### Update Profile
```http
PATCH /profiles?user_id=eq.<user-id>
Authorization: Bearer <token>
Content-Type: application/json

{
  "first_name": "John",
  "last_name": "Smith",
  "title": "Senior Cardiologist",
  "organization": "Metropolitan Medical Center"
}
```

### Upload Avatar
```http
POST /storage/v1/object/avatars/<user-id>/<filename>
Authorization: Bearer <token>
Content-Type: multipart/form-data

<file-data>
```

## 🏥 Medical Events APIs

### List Public Events
```http
GET /public_medical_events?select=*&status=eq.approved&order=start_date.asc
```

**Query Parameters:**
- `specialty_slug` - Filter by medical specialty
- `country` - Filter by country
- `format` - Filter by event format (in-person, virtual, hybrid)
- `has_cme` - Filter events with CME credits
- `is_free` - Filter free events
- `start_date` - Filter by start date (gte.2024-01-01)
- `end_date` - Filter by end date (lte.2024-12-31)
- `limit` - Number of results (default: 20)
- `offset` - Pagination offset

**Response:**
```json
[
  {
    "id": "event-123",
    "title": "Advanced Cardiology Symposium 2024",
    "description": "Leading experts discuss latest cardiology treatments...",
    "start_date": "2024-06-15T09:00:00Z",
    "end_date": "2024-06-17T18:00:00Z",
    "timezone": "America/New_York",
    "format": "hybrid",
    "venue_name": "Medical Convention Center",
    "venue_address": "123 Medical Dr, New York, NY",
    "country": "US",
    "city": "New York",
    "specialty_slug": "cardiology",
    "has_cme": true,
    "cme_hours": 20,
    "is_free": false,
    "price_range": "$500-800",
    "registration_url": "https://example.com/register",
    "featured_image": "https://example.com/image.jpg",
    "registered_count": 150,
    "capacity": 300,
    "status": "approved",
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

### Get Event Details
```http
GET /public_medical_events?select=*&id=eq.<event-id>
```

### Search Events (AI-Enhanced)
```http
POST /functions/v1/event-search
Authorization: Bearer <token>
Content-Type: application/json

{
  "query": "cardiology conference New York",
  "specialty": "cardiology",
  "country": "US",
  "format": "in-person",
  "has_cme": true,
  "start_date": "2024-06-01",
  "end_date": "2024-12-31",
  "page": 1,
  "limit": 20
}
```

### Create Event (Authenticated Users)
```http
POST /medical_events
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Neurology Workshop 2024",
  "description": "Hands-on neurology training...",
  "start_date": "2024-08-15T09:00:00Z",
  "end_date": "2024-08-15T17:00:00Z",
  "timezone": "America/Los_Angeles",
  "format": "in-person",
  "venue_name": "Medical Training Center",
  "venue_address": "456 Training Ave, LA, CA",
  "country": "US",
  "city": "Los Angeles",
  "specialty_slug": "neurology",
  "has_cme": true,
  "cme_hours": 8,
  "is_free": true,
  "registration_url": "https://example.com/register"
}
```

## 🛒 RFQ (Request for Quotation) APIs

### List Accessible RFQs
```http
GET /rfqs?select=*&status=eq.open&order=created_at.desc
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "id": "rfq-123",
    "title": "Cardiac Monitoring Equipment",
    "description": "Looking for 10 units of cardiac monitors...",
    "budget_range": "$50,000-75,000",
    "delivery_location": "New York, NY",
    "status": "open",
    "category_id": "medical-equipment",
    "buyer_id": "buyer-456",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
]
```

### Get RFQ Details (Secure)
```http
POST /functions/v1/get-safe-rfq-display
Authorization: Bearer <token>
Content-Type: application/json

{
  "rfq_id": "rfq-123",
  "include_sensitive": false
}
```

### Create RFQ
```http
POST /rfqs
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "MRI Scanner Procurement",
  "description": "Hospital seeking 3 Tesla MRI scanner...",
  "budget_range": "$1,000,000-1,500,000",
  "delivery_location": "Boston, MA",
  "category_id": "imaging-equipment"
}
```

### Update RFQ
```http
PATCH /rfqs?id=eq.<rfq-id>
Authorization: Bearer <token>
Content-Type: application/json

{
  "description": "Updated requirements...",
  "budget_range": "$1,200,000-1,600,000"
}
```

## 📊 Analytics APIs

### Track Event
```http
POST /functions/v1/analytics-track
Authorization: Bearer <token>
Content-Type: application/json

{
  "event_name": "event_viewed",
  "properties": {
    "event_id": "event-123",
    "specialty": "cardiology",
    "format": "virtual"
  }
}
```

### Track Page View
```http
POST /functions/v1/analytics-track
Authorization: Bearer <token>
Content-Type: application/json

{
  "event_name": "page_view",
  "properties": {
    "path": "/events/cardiology",
    "referrer": "https://google.com"
  }
}
```

## 🔒 Security APIs

### Get Organizer Contact Info (Authorized Users Only)  
```http
POST /functions/v1/get-organizer-contact-info
Authorization: Bearer <token>
Content-Type: application/json

{
  "event_id": "event-123"
}
```

### Check Data Access Permissions
```http
POST /functions/v1/can-access-organizer-data
Authorization: Bearer <token>
Content-Type: application/json

{
  "event_id": "event-123"
}
```

## 📁 File Storage APIs

### Upload File
```http
POST /storage/v1/object/<bucket-name>/<file-path>
Authorization: Bearer <token>
Content-Type: multipart/form-data

<file-data>
```

**Buckets:**
- `avatars` - User profile pictures (public)
- `event-images` - Event promotional images (public)
- `documents` - Private documents (RLS protected)

### Get File URL
```http
GET /storage/v1/object/public/<bucket-name>/<file-path>
```

### Delete File
```http
DELETE /storage/v1/object/<bucket-name>/<file-path>
Authorization: Bearer <token>
```

## 🌍 Internationalization APIs

### Get Translations
```http
GET /translations?select=*&language=eq.en
```

### Update Translation (Admin Only)
```http
PATCH /translations?id=eq.<translation-id>
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "value": "Updated translation text"
}
```

## ⚠️ Error Responses

All APIs return standardized error responses:

```json
{
  "error": "invalid_request",
  "error_description": "The request is missing required parameters",
  "message": "Email is required",
  "details": {
    "field": "email",
    "code": "required"
  }
}
```

**Common Error Codes:**
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate data)
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error

## 📈 Rate Limiting

API requests are rate limited per user:
- **Authenticated requests**: 1000 requests per hour
- **Anonymous requests**: 100 requests per hour
- **File uploads**: 50 uploads per hour

Rate limit headers are included in responses:
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999  
X-RateLimit-Reset: 1640995200
```

## 🔄 Real-time Subscriptions

Subscribe to real-time updates using WebSocket connections:

```javascript
// Subscribe to event updates
const subscription = supabase
  .channel('events-changes')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'medical_events' },
    (payload) => {
      console.log('Event updated:', payload);
    }
  )
  .subscribe();
```

## 📝 API Versioning

The API follows semantic versioning:
- **Current version**: v1
- **Base path**: `/rest/v1/`
- **Deprecation policy**: 6 months notice for breaking changes

## 🧪 Testing APIs

### Test Data Endpoints (Development Only)
```http
POST /functions/v1/seed-test-data
Authorization: Bearer <dev-token>
```

### Health Check
```http
GET /health
```

Response:
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

For more detailed API documentation and interactive testing, visit the Swagger UI at `/api-docs` when running locally.