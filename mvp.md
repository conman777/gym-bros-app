# Gym Bros MVP Specification

## Overview
A simple, focused gym tracking app for Conor and Devlin to track workouts, manage schedules, and monitor progress.

## Core Features

### 1. User Profiles
- Two separate profiles: Conor and Devlin
- Simple selection screen on startup
- Independent workout schedules and progress tracking

### 2. Workout Management
- **Exercise Structure:**
  - Exercise name
  - Sets x Reps (e.g., 3x10)
  - Weight tracking per set
  - Checkbox completion for each set

- **Schedule Features:**
  - Calendar view of planned workouts
  - Auto-adjustment when days are missed (shifts schedule forward)
  - Daily workout view with exercise details

### 3. Template Import System
- Copy/paste workout plans in text format
- Smart parser recognizes:
  - Day headers (e.g., "Monday - Chest & Triceps")
  - Exercise format (e.g., "Bench Press: 3x10 @ 135lbs")
  - Automatic calendar population from start date

### 4. Progress Tracking
- Check off individual sets during workout
- All-time exercise counter
- Weekly/monthly statistics
- Visual progress indicators

### 5. Multi-Platform Access
- Responsive web application
- Mobile-first design with desktop enhancements
- Real-time sync between devices
- Offline capability

## MVP User Flow

1. **Login** → Select profile (Conor/Devlin)
2. **Dashboard** → View today's workout or navigate to other features
3. **Import Template** → Paste workout plan and apply to calendar
4. **Daily Workout** → Check off sets with weight tracking
5. **Stats** → View progress and completion metrics

## Technical Requirements

### Frontend
- Responsive web app (mobile + desktop)
- Touch-optimized interface
- Large buttons and inputs for gym use
- Offline-first architecture

### Data Model
```
User
- id
- name (Conor/Devlin)
- stats

Workout
- id
- userId
- date
- exercises[]

Exercise
- name
- sets[]
- completed

Set
- reps
- weight
- completed (boolean)
```

### Key UI Components
1. **Profile Selector** - Simple two-button choice
2. **Calendar Widget** - Month view with workout indicators
3. **Exercise Card** - Collapsible with set checkboxes
4. **Weight Input** - Number pad on mobile, keyboard on desktop
5. **Progress Bar** - Visual workout completion
6. **Stats Dashboard** - Simple metrics display

## MVP Scope Limitations
- No complex authentication (just profile selection)
- No social features
- No exercise library (custom text entries)
- No detailed analytics (just basic counts)
- No workout timer
- No rest period tracking

## Success Criteria
1. Can import a workout plan via copy/paste
2. Can complete a workout by checking off sets
3. Can track weight for each set
4. Schedule auto-adjusts when days are missed
5. Can view total exercises completed
6. Works on both mobile and desktop
7. Data persists between sessions

## Future Enhancements (Post-MVP)
- Exercise library with form videos
- Progressive overload suggestions
- Workout templates/favorites
- Export data functionality
- Rest timer between sets
- Personal records tracking
- Body weight tracking
- Photo progress tracking