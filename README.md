# GrowthTracker

A modern personal growth tracking application built with Next.js 14, featuring notes, todos, goals, and collaborative features.

## Features

- **Personal Growth Tracking**: Notes, todos, and goal setting
- **Collaboration**: Connect with others and share resources
- **Modern UI**: Glassmorphism design with dark theme
- **Authentication**: Secure sign-in/sign-up system
- **Responsive**: Works on all devices

## Tech Stack

- **Frontend**: Next.js 14, React, Tailwind CSS, Framer Motion
- **Backend**: Next.js API Routes, MongoDB, Mongoose
- **Authentication**: NextAuth.js
- **UI Components**: Lucide React, Ant Design
- **Styling**: Tailwind CSS with custom glassmorphism effects

## Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd growth-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   MONGODB_URI=mongodb://localhost:27017/growth-tracker
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-secret-key-here
   NODE_ENV=development
   ```

4. **Set up MongoDB**
   - Install MongoDB locally or use MongoDB Atlas
   - Update the `MONGODB_URI` in your `.env.local` file

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
growth-tracker/
├── app/                    # Next.js 14 app directory
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard pages
│   ├── login/            # Authentication pages
│   └── signup/
├── components/           # React components
│   ├── ui/              # UI components
│   └── ...
├── lib/                 # Utility functions
├── models/              # MongoDB models
└── public/              # Static assets
```

## Models

- **User**: User accounts with connections
- **Note**: Personal notes with sharing capabilities
- **Todo**: Task management with priorities
- **Goal**: Goal setting with milestones
- **Resource**: Shared links and resources

## Key Features

### Authentication
- Email/password sign-up and sign-in
- Secure password hashing with bcryptjs
- JWT-based sessions

### Dashboard
- Overview of all activities
- Quick action buttons
- Recent activity feed
- Progress tracking

### Notes
- Create, edit, and organize notes
- Tag system for categorization
- Share notes with connections

### Todos
- Task management with priorities
- Due date tracking
- Status management (pending, in-progress, completed)
- Share todos with connections

### Goals
- Goal setting with categories
- Progress tracking (0-100%)
- Milestone system
- Target date management

### Connections
- Connect with other users
- Share resources and content
- Collaborative features

### Resources
- Share helpful links and resources
- Categorize by type (learning, productivity, etc.)
- Tag system for organization

## API Endpoints

- `POST /api/auth/signup` - User registration
- `GET /api/notes` - Get user's notes
- `POST /api/notes` - Create new note
- `GET /api/todos` - Get user's todos
- `POST /api/todos` - Create new todo
- `GET /api/goals` - Get user's goals
- `POST /api/goals` - Create new goal
- `GET /api/resources` - Get shared resources
- `POST /api/resources` - Share new resource

## Styling

The app uses a modern glassmorphism design with:
- Dark gradient backgrounds
- Glass-like cards with backdrop blur
- Orange/red/pink accent colors
- Smooth animations with Framer Motion
- Responsive design for all screen sizes

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
