-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "setupComplete" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Workout" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Workout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Exercise" (
    "id" TEXT NOT NULL,
    "workoutId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL,

    CONSTRAINT "Exercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Set" (
    "id" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "reps" INTEGER NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "orderIndex" INTEGER NOT NULL,

    CONSTRAINT "Set_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Stats" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "totalSetsCompleted" INTEGER NOT NULL DEFAULT 0,
    "totalExercises" INTEGER NOT NULL DEFAULT 0,
    "lastWorkoutDate" TIMESTAMP(3),

    CONSTRAINT "Stats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RehabExercise" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "setsLeft" INTEGER,
    "setsRight" INTEGER,
    "sets" INTEGER,
    "reps" INTEGER,
    "hold" INTEGER,
    "load" TEXT,
    "bandColor" TEXT,
    "time" TEXT,
    "cues" TEXT,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completedDate" TIMESTAMP(3),
    "orderIndex" INTEGER NOT NULL,

    CONSTRAINT "RehabExercise_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_name_key" ON "User"("name");

-- CreateIndex
CREATE INDEX "Workout_userId_date_idx" ON "Workout"("userId", "date");

-- CreateIndex
CREATE INDEX "Exercise_workoutId_idx" ON "Exercise"("workoutId");

-- CreateIndex
CREATE INDEX "Set_exerciseId_idx" ON "Set"("exerciseId");

-- CreateIndex
CREATE UNIQUE INDEX "Stats_userId_key" ON "Stats"("userId");

-- CreateIndex
CREATE INDEX "RehabExercise_userId_idx" ON "RehabExercise"("userId");

-- AddForeignKey
ALTER TABLE "Workout" ADD CONSTRAINT "Workout_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exercise" ADD CONSTRAINT "Exercise_workoutId_fkey" FOREIGN KEY ("workoutId") REFERENCES "Workout"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Set" ADD CONSTRAINT "Set_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stats" ADD CONSTRAINT "Stats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RehabExercise" ADD CONSTRAINT "RehabExercise_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
