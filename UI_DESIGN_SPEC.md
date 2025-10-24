# Gym Bros App - UI Design Specification

## Design System

### Colors (WCAG AA Compliant)

- **Primary**: Deep blue/indigo gradient (`#2563eb` to `#1d4ed8`)
- **Secondary**: Complementary accent color
- **Surface**: Semi-transparent white overlays with backdrop blur
- **Text**: White on dark backgrounds, with opacity ≥75% for accessibility
- **Accent Colors** (darkened for WCAG compliance):
  - Green/emerald for completed/success states (`from-green-600 to-emerald-700`)
  - Orange for fire/streaks
  - Yellow for trophies/achievements
  - Cyan/teal for rehabilitation (`from-teal-600 to-cyan-700`)

### Typography

- **Large Titles**: 2xl font, bold, white
- **Section Headers**: xl/lg font, bold, white
- **Body Text**: Base font, white with opacity
- **Small Text**: sm/xs font, white with reduced opacity

### Components

- Rounded cards with `bg-white/10` and `backdrop-blur-md`
- Border: `border-white/20`
- Shadows: `shadow-lg`
- Buttons: White background with primary text, hover state `bg-white/90`
- Animations: Framer Motion with fade-ins, scale transitions, staggered delays

### Layout

- Max width: 4xl (56rem)
- Padding: 4px (1rem) on sides
- Sticky header with gradient background
- Animated background elements
- Bottom navigation for mobile (PageNav component)

---

## Page Specifications

### 1. **Root Page** (`/`)

**Purpose**: Auto-redirect to login
**Layout**:

- Full screen gradient background
- Centered spinning dumbbell icon (loading state)
- Auto-redirects to `/login` on mount

**Components**:

- Animated dumbbell icon with rotate animation

---

### 2. **Login Page** (`/login`)

**Purpose**: User authentication
**Layout**:

- Full screen gradient background
- Centered form card

**Sections**:

- **Header**: App logo/name
- **Form**:
  - Email input field
  - Password input field
  - "Remember me" checkbox (optional)
  - Login button
  - "Don't have an account?" link → `/register`
  - Password reset link (optional)
- **Footer**: App version or branding

**Key Elements**:

- Responsive form (mobile-friendly)
- Input validation feedback
- Loading state during submission
- Error message display for failed login

---

### 3. **Register Page** (`/register`)

**Purpose**: New user account creation
**Layout**:

- Full screen gradient background
- Centered form card (similar to login)

**Sections**:

- **Header**: Welcome message
- **Form**:
  - Name input
  - Email input
  - Password input
  - Confirm password input
  - Terms & conditions checkbox
  - Register button
  - "Already have an account?" link → `/login`
- **Validation**:
  - Real-time password strength indicator
  - Password match validation
  - Email validation feedback

**Key Elements**:

- Clear password requirements
- Loading state during submission
- Success message with redirect to dashboard

---

### 4. **Dashboard Page** (`/dashboard`)

**Purpose**: Main hub for user activity and quick actions
**Layout**:

- Sticky header with user greeting
- Animated background
- Max width content area
- Mobile navigation at bottom

**Sections** (top to bottom):

#### **Header**

- Greeting: "Hey, {Username}! 💪"
- Current date (short format: "Wed, Oct 23")
- PageNav component (right side)
- Logout button (right side)

#### **Setup Progress Overlay** (if applicable)

- Semi-transparent dark overlay
- Centered card with:
  - Animated dumbbell icon
  - "Setting up your profile" message
  - Progress bar with percentage
  - Status message

#### **Today's Workout Card**

- Title: "Today's Workout"
- Exercise count: "X exercises ready"
- **Progress Display**:
  - Large stat: "5/8 sets done" (completed/total)
  - Animated progress bar (white fill)
  - Percentage-based
- **Exercise List** (top 3):
  - Circle icon with number (1, 2, 3) or checkmark if completed
  - Exercise name
  - Sets completed/total (right-aligned)
  - Strikethrough if completed
  - "+X more exercises" if >3 exercises
- **Action Button**:
  - "Start Workout" or "Continue Workout" button
  - White button with primary text
  - ChevronRight icon
- **If No Workout**:
  - Dumbbell icon (muted)
  - "No Workout Today" heading
  - "Import a workout plan to get started" message
  - "Import Workout Plan" button

#### **Quick Stats** (2-column grid)

**Stat Card 1 - Total Sets**:

- Trophy icon (yellow)
- Large number (total sets completed)
- Label: "Total Sets"

**Stat Card 2 - Week Streak**:

- Flame icon (orange)
- Large number (sets/7 for weeks)
- Label: "Week Streak"

#### **Rehabilitation Section** (if enabled)

- Gradient background (teal/cyan)
- **Header**:
  - Heart icon
  - Title: "Shoulder Rehabilitation"
  - File icon button (view PDF)
  - Settings icon button (manage)
- **Progress Section**:
  - "X completed / Y total" (right-aligned)
  - Animated progress bar
- **Exercise List** (scrollable if >4):
  - Checkbox (white/filled)
  - Exercise name
  - Prescription details: "L: 3 / R: 3 sets • 10 reps • blue band"
  - Info button (expands cues)
  - Completed exercises: strikethrough + reduced opacity
  - Expanded cues: "Cues: [detailed instructions]"
- **"Add Exercises"** or **"Manage Exercises"** button

---

### 5. **Calendar Page** (`/calendar`)

**Purpose**: Monthly workout overview and visualization
**Layout**:

- Sticky header with month/year
- Animated calendar grid
- Bottom stats section

**Header**:

- Back arrow (→ `/dashboard`)
- Month & Year (centered): "October 2024"
- PageNav component (right)

**Month Navigation**:

- Previous month button (left chevron)
- "Today" button (center)
- Next month button (right chevron)

**Calendar Grid**:

- **Day headers**: Sun, Mon, Tue, Wed, Thu, Fri, Sat (gray text)
- **Empty cells** for days before month starts
- **Day cells**:
  - **No workout**: Transparent, gray number
  - **Scheduled workout**:
    - Light semi-transparent background (`bg-white/20`)
    - Day number (white, bold)
    - Dumbbell icon + exercise count (small)
    - Clickable → `/workout/[date]`
  - **Completed workout**:
    - Green gradient background (`from-green-600 to-emerald-700` - WCAG compliant)
    - Day number
    - Checkmark icon
    - Clickable → `/workout/[date]`
  - **Today indicator**:
    - White ring border with offset
    - Pulsing white dot (bottom-right)
- **Animation**: Staggered scale-in on page load

**Legend** (below calendar):

- Light gray square → "Scheduled"
- Green square → "Completed"

**Month Overview** (bottom card):

- Title: "Month Overview"
- **Stat 1**: X "Workouts completed"
- **Stat 2**: Y "Total scheduled"

---

### 6. **Stats Page** (`/stats`)

**Purpose**: Comprehensive progress tracking and analytics
**Layout**:

- Sticky header
- Multiple stat cards with animations
- Staggered animations on load

**Header**:

- Back arrow (→ `/dashboard`)
- "Progress & Stats" (centered)
- PageNav component

**Hero Stats Card**:

- Trophy icon (large, muted)
- Title: "Total Progress"
- Subtitle: "Keep up the great work!"
- **Two-column grid**:
  - Animated large number: Total sets completed
  - Label: "Total Sets"
  - Animated large number: Total active days
  - Label: "Active Days"

**Monthly Progress Card**:

- Calendar icon
- Title: "This Month"
- **Progress bar**:
  - Label: "Sets completed"
  - Right-aligned: "X/100"
  - Animated gradient fill bar
- **Top Exercise** (if exists):
  - Label: "Most done exercise"
  - Exercise name (left)
  - Set count (right)

**Stats Grid** (4 cards in 2x2):

1. **Day Streak**:
   - Flame icon (orange)
   - Large number
   - Label: "Day Streak"
   - Motivational text if >0: "Keep it up! 🔥"

2. **Week Streak**:
   - Award icon (yellow)
   - Large number
   - Label: "Week Streak"
   - "Consistency pays off!"

3. **Exercises Done**:
   - Target icon (green)
   - Large number
   - Label: "Exercises Done"

4. **Avg Sets/Day**:
   - TrendingUp icon (blue)
   - Large number (rounded)
   - Label: "Avg Sets/Day"

**Last Workout Card** (if exists):

- Title: "Last Workout"
- Formatted date: "Wednesday, October 23, 2024"

---

### 7. **Workout Detail Page** (`/workout/[date]`)

**Purpose**: Log and track daily workout exercises and sets
**Layout**:

- Sticky header with date and progress
- Scrollable exercise list
- Quick action buttons

**Header**:

- Back arrow (→ `/dashboard`)
- Date: "Wednesday, October 23"
- Progress indicator (right side)
- PageNav component

**Progress Summary**:

- Large bold number: "5/8" (completed/total sets)
- "sets done" label
- Animated progress bar
- Percentage text below bar

**Exercise List** (scrollable):
For each exercise:

- Exercise name
- Set count indicator
- **Individual set rows**:
  - Checkbox (unchecked/checked)
  - Set number (e.g., "Set 1")
  - Weight/reps if stored (e.g., "225 lbs × 8")
  - Completed indicator (✓ or dot)
- **Expandable details** (optional):
  - Notes field
  - Rest timer
  - Exercise history/previous weights

**Action Buttons**:

- "Mark Complete" button (completes workout)
- "Save Progress" button (saves incomplete workout)
- "View Calendar" link (→ `/calendar`)

**Empty State** (if no exercises):

- Dumbbell icon
- "No exercises for this date"
- "Import a workout plan" link

---

### 8. **Friends Page** (`/friends`)

**Purpose**: Social interaction and friend activity tracking
**Layout**:

- Sticky header
- Friend list or activity feed

**Header**:

- "Gym Bros" or "Friends" (centered)
- Search icon (top right)
- PageNav component

**Possible Layouts** (choose based on feature scope):

**Option A - Activity Feed**:

- List of recent friend activities
- Each item shows:
  - Friend avatar/name
  - Action: "completed a workout" / "hit new PR"
  - Timestamp: "2 hours ago"
  - Exercise details if applicable
  - Like/comment buttons (optional)

**Option B - Friend List**:

- Searchable list of gym friends
- Each friend card shows:
  - Avatar/name
  - Last active date
  - Current streak
  - View profile button
  - Message button (if messaging enabled)

**Option C - Leaderboard**:

- Ranked list by activity metric (sets, streak, etc.)
- Columns: Rank, Name, Metric value
- Current user highlighted
- Filter by time period (week, month, all-time)

---

### 9. **Settings Page** (`/settings`)

**Purpose**: User preferences and account management
**Layout**:

- Sticky header
- Scrollable settings sections

**Header**:

- Back arrow (→ `/dashboard`)
- "Settings" (centered)
- PageNav component

**Settings Sections**:

#### **Account Settings**

- User name field (editable, with save)
- Email display (read-only or editable)
- Password change button
- Profile picture upload (optional)

#### **Preferences**

- **Notifications**:
  - Daily reminder toggle
  - Reminder time picker (if enabled)
  - Goal-based alerts toggle
- **Theme** (if applicable):
  - Dark/Light mode toggle
- **Units**:
  - Metric/Imperial toggle (kg/lbs, cm/inches)
  - Rest timer default
  - Auto-increment weights on sets

#### **Rehabilitation**

- Enable/disable rehab features toggle
- View linked rehab program

#### **Data Management**

- "Export Data" button
- "Backup Data" button
- "Clear Cache" button

#### **Support & Info**

- "About App" section with version
- "Help & FAQs" link
- "Contact Support" link
- "Privacy Policy" link
- "Terms & Conditions" link

#### **Logout**

- "Logout" button (red/destructive style)

---

### 10. **Import Workout Plan Page** (`/import`)

**Purpose**: Upload or select workout plans
**Layout**:

- Sticky header
- Two import methods
- Preview section

**Header**:

- Back arrow (→ `/dashboard`)
- "Import Workout" (centered)
- PageNav component

**Import Methods**:

#### **Method 1 - File Upload**

- **Drop zone**:
  - "Drag and drop your file here"
  - "or click to select file"
  - Accepts: CSV, JSON, PDF
  - File size limit display
- **Upload button**

#### **Method 2 - Template Selection** (optional)

- Predefined templates:
  - "Push/Pull/Legs"
  - "Upper/Lower"
  - "Full Body"
  - "Strength Focus"
  - etc.
- Each shows:
  - Template name
  - Number of days/week
  - Brief description
  - "Select" button

**Preview Section** (after selection):

- Parsed workout data preview
- Exercise count
- Days per week
- "Confirm Import" button
- "Cancel" or "Back" button

**Loading State**:

- Spinner with "Processing workout plan..."

**Success State**:

- Checkmark
- "Workout plan imported successfully!"
- "Redirecting to dashboard..."

**Error State**:

- Error icon
- "Failed to parse file"
- Error details
- "Try again" button
- "Upload different file" button

---

### 11. **Rehab Manage Page** (`/rehab/manage`)

**Purpose**: Add, edit, and manage rehabilitation exercises
**Layout**:

- Sticky header
- Scrollable exercise list
- Add new exercise button

**Header**:

- Back arrow (→ `/dashboard`)
- "Manage Rehab Exercises" (centered)
- PageNav component

**Exercise List** (if exercises exist):
For each exercise:

- **Editable fields**:
  - Exercise name (text input)
  - Prescription dropdown (sets, reps, hold, time, etc.)
  - Cues/instructions (text area)
  - Bilateral options: L/R sets if applicable
  - Band color (if applicable)
  - Load/weight (if applicable)
- **Actions**:
  - Delete button (trash icon)
  - Save changes button
  - Collapse/expand for editing
- **Completed indicator**:
  - Checkbox showing completion status
  - Last completed date (if applicable)

**Empty State**:

- Heart icon (teal)
- "No rehab exercises yet"
- "Add your first exercise below"

**Add New Exercise Button**:

- Large button at bottom
- "Add Exercise" or "+"
- Opens form for new exercise
- Same fields as existing exercises

**Form for New Exercise**:

- Modal or expanded section
- All input fields
- Cancel button
- Save button
- On success: Exercise added to list, form clears

---

### 12. **Common Components & Patterns**

#### **Header Pattern** (on all authenticated pages)

```
[Back Arrow] [Title/Content] [PageNav] [Settings/More]
```

#### **Card Pattern**

```
bg-white/10
backdrop-blur-md
rounded-2xl
p-5-6
border border-white/20
shadow-lg
text-white
```

#### **Button Pattern**

```
Primary: bg-white text-primary rounded-xl py-3 hover:bg-white/90
Secondary: bg-white/10 text-white rounded-xl py-3 hover:bg-white/20
```

#### **Progress Pattern**

```
Progress.Root (relative overflow-hidden)
├─ bg-white/20 or bg-white rounded-full h-3
Progress.Indicator
├─ gradient fill (white or primary-to-secondary)
├─ transform translateX(-${100-percent}%)
```

#### **Icon + Text Card Pattern**

```
[Icon - 8x8 size]
[Large Number]
[Small Label]
```

#### **Animation Pattern**

```
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ delay: 0.1 }}
```

---

## Mobile Considerations

### PageNav Component

- Sticky bottom navigation on mobile
- Icons only (no labels) to save space
- Tabs: Dashboard, Calendar, Stats, Friends, Settings
- Active indicator on current page

### Responsive Breakpoints

- Cards: full width on mobile, with padding
- 2-column grids: stack to 1 column on mobile
- Font sizes: slightly reduced on mobile
- Padding/margins: reduced on mobile to save space

### Touch Interactions

- Min touch target: 44x44px
- Extra padding/spacing around buttons
- Swipe navigation (optional)
- No hover states (only active/tapped)

---

## Animations & Transitions

### Page Load

- Fade in + slide up (0.3s)
- Staggered card animations (0.1s delay between cards)
- Background animation loop (subtle, continuous)

### Interactions

- Button: scale 0.95 on press, 1 on release
- Cards: scale 1.02 on hover (desktop only)
- Toggles: smooth state transitions
- Progress bars: animate width over 0.5s

### Loading States

- Rotating icon (dumbbell)
- Smooth fade in when content loads
- Skeleton screens (optional, for faster perceived load)

---

## Color Reference

### Backgrounds

- Primary gradient: `from-[var(--primary)] via-[var(--primary-dark)] to-[var(--secondary)]`
- Card: `bg-white/10 backdrop-blur-md`

### Icons

- Default: `text-white` or `text-white/80`
- Accent colors:
  - Trophy: `text-yellow-300`
  - Flame: `text-orange-400`
  - Heart/Rehab: `text-teal-600` or `text-cyan-600`
  - Success: `text-green-400`
  - Target: `text-green-300`
  - TrendingUp: `text-blue-300`

### Text Opacity (WCAG AA Compliant - 4.5:1 Contrast Ratio)

- Primary text: `text-white` (headings, important text - 100%)
- Secondary: `text-white/90` (body text, descriptions - 90%)
- Tertiary: `text-white/85` (secondary information - 85%)
- Muted: `text-white/80` or `text-white/75` (labels, hints - minimum 75% for accessibility)

**Note**: Avoid using opacity below 75% (`text-white/75`) to maintain WCAG AA standards.
All gradient backgrounds have been darkened to meet contrast requirements.

---

## State Management Notes

- **Auth**: Check user session before rendering protected pages
- **Data Loading**: Show spinner, then content fade-in
- **Errors**: Display error card with message and retry button
- **Success**: Show confirmation toast or message
- **Empty States**: Show icon + message + call-to-action
- **Incomplete Form**: Disable submit, show validation errors
