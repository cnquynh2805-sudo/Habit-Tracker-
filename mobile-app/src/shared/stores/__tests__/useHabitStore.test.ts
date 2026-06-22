import { useHabitStore } from '../useHabitStore';
import { calculateStreaks, getGoalProgress, getDailyProgress } from '../habitSelectors';

describe('useHabitStore', () => {
  beforeEach(() => {
    useHabitStore.getState().resetData();
  });

  it('TC-HAB-001: should add a valid Daily habit', () => {
    useHabitStore.getState().addHabit({
      name: 'Drink water',
      category: 'Health',
      frequency: 'Daily',
      targetPerDay: 8,
      priority: 'High',
      status: 'Active',
    });

    const state = useHabitStore.getState();
    expect(state.habits.length).toBe(1);
    expect(state.habits[0].name).toBe('Drink water');
    expect(state.habits[0].id).toBeDefined();
    expect(state.habits[0].createdAt).toBeDefined();
  });

  it('TC-HAB-006: should delete a habit', () => {
    useHabitStore.getState().addHabit({
      name: 'Drink water',
      category: 'Health',
      frequency: 'Daily',
      targetPerDay: 8,
      priority: 'High',
      status: 'Active',
    });
    
    const habitId = useHabitStore.getState().habits[0].id;
    useHabitStore.getState().deleteHabit(habitId);
    expect(useHabitStore.getState().habits.length).toBe(0);
  });

  it('TC-CHK-002: should track check-ins and set status', () => {
    useHabitStore.getState().addHabit({
      name: 'Drink water',
      category: 'Health',
      frequency: 'Daily',
      targetPerDay: 8,
      priority: 'High',
      status: 'Active',
    });
    const habitId = useHabitStore.getState().habits[0].id;
    const todayStr = new Date().toISOString().split('T')[0];

    useHabitStore.getState().checkIn(habitId, todayStr, 5);
    let checkins = useHabitStore.getState().checkins;
    expect(checkins.length).toBe(1);
    expect(checkins[0].status).toBe('In Progress');

    // TC-CHK-003: check-in completed
    useHabitStore.getState().checkIn(habitId, todayStr, 8);
    checkins = useHabitStore.getState().checkins;
    expect(checkins.length).toBe(1);
    expect(checkins[0].status).toBe('Completed');

    // TC-CHK-004: Not started
    useHabitStore.getState().checkIn(habitId, todayStr, 0);
    checkins = useHabitStore.getState().checkins;
    expect(checkins[0].status).toBe('Not Started');
  });

  it('TC-CHK-005, TC-CHK-006: should prevent invalid check-ins (negative or exceeding target)', () => {
    useHabitStore.getState().addHabit({
      name: 'Read Book',
      category: 'Study',
      frequency: 'Daily',
      targetPerDay: 5,
      priority: 'Medium',
      status: 'Active',
    });
    const habitId = useHabitStore.getState().habits[0].id;
    const todayStr = new Date().toISOString().split('T')[0];

    // Exceed target
    useHabitStore.getState().checkIn(habitId, todayStr, 6);
    expect(useHabitStore.getState().checkins.length).toBe(0);

    // Negative target
    useHabitStore.getState().checkIn(habitId, todayStr, -1);
    expect(useHabitStore.getState().checkins.length).toBe(0);
  });

  it('TC-CHK-011: should prevent future check-ins', () => {
    useHabitStore.getState().addHabit({
      name: 'Read Book',
      category: 'Study',
      frequency: 'Daily',
      targetPerDay: 1,
      priority: 'Medium',
      status: 'Active',
    });
    const habitId = useHabitStore.getState().habits[0].id;
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    useHabitStore.getState().checkIn(habitId, tomorrowStr, 1);
    expect(useHabitStore.getState().checkins.length).toBe(0);
  });
});

describe('habitSelectors derived state', () => {
  it('TC-GOAL-006: calculateStreaks calculates correctly', () => {
    const today = new Date();
    const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
    const dayBefore = new Date(today); dayBefore.setDate(dayBefore.getDate() - 2);

    const checkins = [
      { id: '1', habitId: 'h1', date: today.toISOString().split('T')[0], completedCount: 1, status: 'Completed' },
      { id: '2', habitId: 'h1', date: yesterday.toISOString().split('T')[0], completedCount: 1, status: 'Completed' },
      { id: '3', habitId: 'h1', date: dayBefore.toISOString().split('T')[0], completedCount: 1, status: 'Completed' },
    ];

    const stats = calculateStreaks(checkins as any, 'h1');
    expect(stats.currentStreak).toBe(3);
    expect(stats.longestStreak).toBe(3);
    expect(stats.totalCompletions).toBe(3);
  });

  it('TC-GOAL-008, TC-GOAL-009: getGoalProgress shows alerts', () => {
    const checkins = [
      { id: '1', habitId: 'h1', date: '2026-06-01', completedCount: 1, status: 'Completed' },
    ];
    // Goal is 1 total completion
    const goal = { id: 'g1', habitId: 'h1', targetType: 'Total completions target', targetValue: 1 };
    
    let progress = getGoalProgress(checkins as any, goal as any);
    expect(progress.progress).toBe(1);
    expect(progress.percentage).toBe(100);
    expect(progress.isAchieved).toBe(true);

    // Goal is 10 total completions, we have 8 => 80%
    const checkins8 = Array(8).fill({ habitId: 'h1', status: 'Completed' }).map((c, i) => ({ ...c, date: `2026-06-0${i+1}` }));
    const goal10 = { id: 'g2', habitId: 'h1', targetType: 'Total completions target', targetValue: 10 };
    
    progress = getGoalProgress(checkins8 as any, goal10 as any);
    expect(progress.progress).toBe(8);
    expect(progress.percentage).toBe(80);
    expect(progress.isEncouraged).toBe(true);
    expect(progress.isAchieved).toBe(false);
  });

  it('TC-CHK-009: getDailyProgress calculates percentage correctly', () => {
    
    const habits = [
      { id: 'h1', status: 'Active', frequency: 'Daily' },
      { id: 'h2', status: 'Active', frequency: 'Daily' },
      { id: 'h3', status: 'Paused', frequency: 'Daily' } // Should not be counted
    ];

    const date = '2026-06-23';
    const checkins = [
      { habitId: 'h1', date, status: 'Completed' },
      { habitId: 'h2', date, status: 'In Progress' }
    ];

    const dailyProgress = getDailyProgress(habits as any, checkins as any, date);
    
    // Total active = 2 (h1, h2)
    // Completed = 1 (h1)
    // Percentage = 50%
    expect(dailyProgress.total).toBe(2);
    expect(dailyProgress.completed).toBe(1);
    expect(dailyProgress.percentage).toBe(50);
  });
});

describe('UC06 and UC07: Undo and Reset functionality', () => {
  it('TC-CHK-013: should undo the last check-in correctly', () => {
    useHabitStore.getState().resetData();
    useHabitStore.getState().addHabit({
      name: 'Drink Water',
      category: 'Health',
      frequency: 'Daily',
      targetPerDay: 5,
      priority: 'High',
      status: 'Active'
    });

    const habitId = useHabitStore.getState().habits[0].id;
    const today = new Date().toISOString().split('T')[0];

    // First checkin (new)
    useHabitStore.getState().checkIn(habitId, today, 2);
    expect(useHabitStore.getState().checkins[0].completedCount).toBe(2);
    
    // Update checkin
    useHabitStore.getState().checkIn(habitId, today, 4);
    expect(useHabitStore.getState().checkins[0].completedCount).toBe(4);

    // Undo the update
    useHabitStore.getState().undoLastCheckIn();
    
    // Should revert to 2
    expect(useHabitStore.getState().checkins[0].completedCount).toBe(2);

    // Undo again (should do nothing since lastAction was cleared)
    useHabitStore.getState().undoLastCheckIn();
    expect(useHabitStore.getState().checkins[0].completedCount).toBe(2);
  });

  it('TC-SYS-001: should reset all data', () => {
    useHabitStore.getState().resetData();
    useHabitStore.getState().addHabit({
      name: 'Test',
      category: 'Health',
      frequency: 'Daily',
      targetPerDay: 1,
      priority: 'High',
      status: 'Active'
    });
    const state = useHabitStore.getState();
    const todayStr = new Date().toISOString().split('T')[0];
    state.checkIn(state.habits[0].id, todayStr, 1);
    state.setGoal({ habitId: state.habits[0].id, targetType: 'Streak target', targetValue: 10 });

    expect(useHabitStore.getState().habits.length).toBeGreaterThan(0);
    expect(useHabitStore.getState().checkins.length).toBeGreaterThan(0);
    expect(useHabitStore.getState().goals.length).toBeGreaterThan(0);

    useHabitStore.getState().resetData();

    expect(useHabitStore.getState().habits.length).toBe(0);
    expect(useHabitStore.getState().checkins.length).toBe(0);
    expect(useHabitStore.getState().goals.length).toBe(0);
    expect(useHabitStore.getState().lastAction).toBeNull();
  });
});
