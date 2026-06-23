import { Habit, Checkin, Goal, TargetType } from './useHabitStore';

// Helper to get today's date in YYYY-MM-DD
export const getTodayDateString = () => {
  return new Date().toISOString().split('T')[0];
};

const getWeekdayName = (date: string) => {
  const parsedDate = new Date(`${date}T00:00:00`);
  return parsedDate.toLocaleDateString('en-US', { weekday: 'long' });
};

const frequencyMatchesDate = (frequency: string, date: string) => {
  if (frequency === 'Daily') return true;

  const weekday = getWeekdayName(date);
  const selectedDays = frequency
    .split(',')
    .map(day => day.trim())
    .filter(Boolean);

  return selectedDays.includes(weekday);
};

export const getHabitsForToday = (habits: Habit[], date = getTodayDateString()) => {
  return habits.filter(h => h.status === 'Active' && frequencyMatchesDate(h.frequency, date));
};

export const getDailyProgress = (habits: Habit[], checkins: Checkin[], date: string) => {
  const activeHabits = getHabitsForToday(habits, date);
  if (activeHabits.length === 0) return { total: 0, completed: 0, percentage: 0 };

  const checkinsToday = checkins.filter(c => c.date === date && c.status === 'Completed');
  const completedCount = activeHabits.filter(h => 
    checkinsToday.some(c => c.habitId === h.id)
  ).length;

  return {
    total: activeHabits.length,
    completed: completedCount,
    percentage: Math.round((completedCount / activeHabits.length) * 100)
  };
};

export const calculateStreaks = (checkins: Checkin[], habitId: string) => {
  const habitCheckins = checkins
    .filter(c => c.habitId === habitId && c.status === 'Completed')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (habitCheckins.length === 0) {
    return { currentStreak: 0, longestStreak: 0, totalCompletions: 0 };
  }

  const totalCompletions = habitCheckins.length;
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;

  const todayStr = getTodayDateString();
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterdayStr = yesterdayDate.toISOString().split('T')[0];

  // We need to trace streaks day by day backwards
  const checkinDates = new Set(habitCheckins.map(c => c.date));
  
  let dateToVerify = new Date(); // Start from today
  
  // Calculate current streak
  let isCurrentStreakAlive = checkinDates.has(todayStr) || checkinDates.has(yesterdayStr);
  
  if (isCurrentStreakAlive) {
    let checkDate = new Date(checkinDates.has(todayStr) ? todayStr : yesterdayStr);
    while (checkinDates.has(checkDate.toISOString().split('T')[0])) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }
  }

  // Calculate longest streak
  const sortedDates = Array.from(checkinDates).sort();
  tempStreak = 1;
  longestStreak = 1;

  for (let i = 1; i < sortedDates.length; i++) {
    const prevDate = new Date(sortedDates[i - 1]);
    const currDate = new Date(sortedDates[i]);
    const diffTime = Math.abs(currDate.getTime() - prevDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    
    if (diffDays === 1) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      tempStreak = 1;
    }
  }

  return { currentStreak, longestStreak, totalCompletions };
};

export const getGoalProgress = (checkins: Checkin[], goal: Goal) => {
  if (!goal) return { progress: 0, percentage: 0, isEncouraged: false, isAchieved: false };

  const { targetType, targetValue } = goal;
  const stats = calculateStreaks(checkins, goal.habitId);
  
  let progress = 0;
  if (targetType === 'Streak target') {
    progress = stats.currentStreak;
  } else if (targetType === 'Total completions target') {
    progress = stats.totalCompletions;
  }

  const percentage = Math.min(100, Math.round((progress / targetValue) * 100));
  const isEncouraged = percentage >= 80 && percentage < 100;
  const isAchieved = percentage >= 100;

  return { progress, percentage, isEncouraged, isAchieved };
};
