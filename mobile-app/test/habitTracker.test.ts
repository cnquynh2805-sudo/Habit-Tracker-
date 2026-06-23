import { getDailyProgress, getGoalProgress, getHabitsForToday } from '../src/shared/stores/habitSelectors';
import { useHabitStore } from '../src/shared/stores/useHabitStore';
import type { Habit } from '../src/shared/stores/useHabitStore';

const validHabit = (overrides: Partial<Omit<Habit, 'id' | 'createdAt'>> = {}) => ({
  name: 'Drink water',
  category: 'Health' as const,
  frequency: 'Daily',
  targetPerDay: 8,
  priority: 'High' as const,
  status: 'Active' as const,
  ...overrides,
});

const addHabit = (overrides: Partial<Omit<Habit, 'id' | 'createdAt'>> = {}) => {
  useHabitStore.getState().addHabit(validHabit(overrides));
  const { habits } = useHabitStore.getState();
  return habits[habits.length - 1] as Habit;
};

const today = () => new Date().toISOString().split('T')[0];

const dateForWeekday = (weekday: string) => {
  const date = new Date('2026-06-22T00:00:00');
  while (date.toLocaleDateString('en-US', { weekday: 'long' }) !== weekday) {
    date.setDate(date.getDate() + 1);
  }
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

describe('test_cases.md - UC01 habit management', () => {
  beforeEach(() => {
    useHabitStore.getState().resetData();
  });

  it('TC-HAB-001 creates a valid Daily habit', () => {
    const habit = addHabit();

    expect(useHabitStore.getState().habits).toHaveLength(1);
    expect(habit).toEqual(expect.objectContaining({
      name: 'Drink water',
      category: 'Health',
      frequency: 'Daily',
      targetPerDay: 8,
      priority: 'High',
      status: 'Active',
    }));
    expect(habit.id).toBeTruthy();
    expect(habit.createdAt).toBeTruthy();
  });

  it('TC-HAB-002 keeps specific weekdays as the saved frequency', () => {
    const habit = addHabit({ frequency: 'Monday, Wednesday, Friday' });

    expect(habit.frequency).toBe('Monday, Wednesday, Friday');
  });

  it('TC-HAB-003 and TC-HAB-004 reject invalid required habit fields', () => {
    useHabitStore.getState().addHabit(validHabit({ name: '' }));
    useHabitStore.getState().addHabit(validHabit({ category: '' as never }));
    useHabitStore.getState().addHabit(validHabit({ frequency: '' }));
    useHabitStore.getState().addHabit(validHabit({ targetPerDay: -1 }));

    expect(useHabitStore.getState().habits).toHaveLength(0);
  });

  it('TC-HAB-005 edits an existing habit without creating a duplicate', () => {
    const habit = addHabit({ priority: 'Medium', targetPerDay: 5 });

    useHabitStore.getState().updateHabit(habit.id, { priority: 'High', targetPerDay: 8 });

    expect(useHabitStore.getState().habits).toHaveLength(1);
    expect(useHabitStore.getState().habits[0]).toEqual(expect.objectContaining({
      id: habit.id,
      priority: 'High',
      targetPerDay: 8,
    }));
  });

  it('TC-HAB-006 deletes a habit and related check-ins/goals', () => {
    const habit = addHabit();
    useHabitStore.getState().checkIn(habit.id, today(), 8);
    useHabitStore.getState().setGoal({
      habitId: habit.id,
      targetType: 'Streak target',
      targetValue: 7,
    });

    useHabitStore.getState().deleteHabit(habit.id);

    expect(useHabitStore.getState().habits).toHaveLength(0);
    expect(useHabitStore.getState().checkins).toHaveLength(0);
    expect(useHabitStore.getState().goals).toHaveLength(0);
  });

  it('TC-HAB-008, TC-HAB-009, and TC-HAB-010 update status for pause resume archive', () => {
    const habit = addHabit({ status: 'Active' });

    useHabitStore.getState().updateHabit(habit.id, { status: 'Paused' });
    expect(useHabitStore.getState().habits[0].status).toBe('Paused');
    expect(getHabitsForToday(useHabitStore.getState().habits, today())).toHaveLength(0);

    useHabitStore.getState().updateHabit(habit.id, { status: 'Active' });
    expect(useHabitStore.getState().habits[0].status).toBe('Active');
    expect(getHabitsForToday(useHabitStore.getState().habits, today())).toHaveLength(1);

    useHabitStore.getState().updateHabit(habit.id, { status: 'Archived' });
    expect(getHabitsForToday(useHabitStore.getState().habits, today())).toHaveLength(0);
  });

  it('TC-HAB-011 filters habits without mutating raw data', () => {
    addHabit({ category: 'Health', priority: 'High', status: 'Active' });
    addHabit({ name: 'Read', category: 'Study', priority: 'Medium', status: 'Paused' });

    const raw = useHabitStore.getState().habits;
    const filtered = raw.filter(
      habit => habit.category === 'Health' && habit.priority === 'High' && habit.status === 'Active'
    );

    expect(filtered).toHaveLength(1);
    expect(useHabitStore.getState().habits).toHaveLength(2);
  });

  it('TC-HAB-014 exposes an empty habit list for empty state rendering', () => {
    expect(useHabitStore.getState().habits).toEqual([]);
  });
});

describe('test_cases.md - UC02 daily check-in', () => {
  beforeEach(() => {
    useHabitStore.getState().resetData();
  });

  it('TC-CHK-001 shows only Active habits whose frequency matches the selected day', () => {
    addHabit({ name: 'A', status: 'Active', frequency: 'Daily' });
    addHabit({ name: 'B', status: 'Paused', frequency: 'Daily' });
    addHabit({ name: 'C', status: 'Archived', frequency: 'Daily' });
    addHabit({ name: 'D', status: 'Active', frequency: 'Friday' });

    const monday = dateForWeekday('Monday');
    const habits = getHabitsForToday(useHabitStore.getState().habits, monday);

    expect(habits.map(habit => habit.name)).toEqual(['A']);
  });

  it('TC-CHK-002, TC-CHK-003, and TC-CHK-004 derive check-in status from completedCount', () => {
    const habit = addHabit();

    useHabitStore.getState().checkIn(habit.id, today(), 5);
    expect(useHabitStore.getState().checkins[0].status).toBe('In Progress');

    useHabitStore.getState().checkIn(habit.id, today(), 8);
    expect(useHabitStore.getState().checkins).toHaveLength(1);
    expect(useHabitStore.getState().checkins[0].status).toBe('Completed');

    useHabitStore.getState().checkIn(habit.id, today(), 0);
    expect(useHabitStore.getState().checkins[0].status).toBe('Not Started');
  });

  it('TC-CHK-005 and TC-CHK-006 reject completedCount outside the valid range', () => {
    const habit = addHabit({ targetPerDay: 8 });

    useHabitStore.getState().checkIn(habit.id, today(), 9);
    useHabitStore.getState().checkIn(habit.id, today(), -1);

    expect(useHabitStore.getState().checkins).toHaveLength(0);
  });

  it('TC-CHK-007 mark done behavior stores completedCount equal to targetPerDay', () => {
    const habit = addHabit({ targetPerDay: 8 });

    useHabitStore.getState().checkIn(habit.id, today(), habit.targetPerDay);

    expect(useHabitStore.getState().checkins[0]).toEqual(expect.objectContaining({
      completedCount: 8,
      status: 'Completed',
    }));
  });

  it('TC-CHK-008 updates today check-in without creating a duplicate record', () => {
    const habit = addHabit({ targetPerDay: 8 });

    useHabitStore.getState().checkIn(habit.id, today(), 5);
    useHabitStore.getState().checkIn(habit.id, today(), 7);

    expect(useHabitStore.getState().checkins).toHaveLength(1);
    expect(useHabitStore.getState().checkins[0].completedCount).toBe(7);
  });

  it('TC-CHK-009 recalculates daily progress from check-ins', () => {
    const habitA = addHabit({ name: 'A' });
    addHabit({ name: 'B' });
    addHabit({ name: 'C', status: 'Paused' });

    useHabitStore.getState().checkIn(habitA.id, today(), 8);

    expect(getDailyProgress(useHabitStore.getState().habits, useHabitStore.getState().checkins, today())).toEqual({
      total: 2,
      completed: 1,
      percentage: 50,
    });
  });

  it('TC-CHK-011 rejects future check-ins', () => {
    const habit = addHabit();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    useHabitStore.getState().checkIn(habit.id, tomorrow.toISOString().split('T')[0], 8);

    expect(useHabitStore.getState().checkins).toHaveLength(0);
  });

  it('TC-CHK-013 exposes an empty check-in list for selected days without data', () => {
    expect(useHabitStore.getState().checkins.filter(checkin => checkin.date === '2026-01-01')).toEqual([]);
  });
});

describe('test_cases.md - UC03 goals', () => {
  beforeEach(() => {
    useHabitStore.getState().resetData();
  });

  it('TC-GOAL-001 and TC-GOAL-002 create valid streak and total completion goals', () => {
    const habitA = addHabit({ name: 'A' });
    const habitB = addHabit({ name: 'B' });

    useHabitStore.getState().setGoal({
      habitId: habitA.id,
      targetType: 'Streak target',
      targetValue: 7,
    });
    useHabitStore.getState().setGoal({
      habitId: habitB.id,
      targetType: 'Total completions target',
      targetValue: 30,
    });

    expect(useHabitStore.getState().goals).toEqual(expect.arrayContaining([
      expect.objectContaining({ habitId: habitA.id, targetType: 'Streak target', targetValue: 7 }),
      expect.objectContaining({ habitId: habitB.id, targetType: 'Total completions target', targetValue: 30 }),
    ]));
  });

  it('TC-GOAL-003 updates an existing habit goal without duplicates', () => {
    const habit = addHabit();

    useHabitStore.getState().setGoal({ habitId: habit.id, targetType: 'Streak target', targetValue: 7 });
    useHabitStore.getState().setGoal({ habitId: habit.id, targetType: 'Streak target', targetValue: 14 });

    expect(useHabitStore.getState().goals).toHaveLength(1);
    expect(useHabitStore.getState().goals[0].targetValue).toBe(14);
  });

  it('TC-GOAL-004 and TC-GOAL-005 reject invalid goal data', () => {
    const habit = addHabit();

    useHabitStore.getState().setGoal({ habitId: habit.id, targetType: '' as never, targetValue: 7 });
    useHabitStore.getState().setGoal({ habitId: habit.id, targetType: 'Streak target', targetValue: 0 });
    useHabitStore.getState().setGoal({ habitId: habit.id, targetType: 'Streak target', targetValue: -1 });

    expect(useHabitStore.getState().goals).toHaveLength(0);
  });

  it('TC-GOAL-006 and TC-GOAL-007 derive current progress from check-ins', () => {
    const habit = addHabit({ targetPerDay: 1 });
    const dates = [today()];
    for (let daysAgo = 1; daysAgo <= 2; daysAgo += 1) {
      const date = new Date();
      date.setDate(date.getDate() - daysAgo);
      dates.push(date.toISOString().split('T')[0]);
    }
    dates.forEach(date => useHabitStore.getState().checkIn(habit.id, date, 1));

    expect(getGoalProgress(useHabitStore.getState().checkins, {
      id: 'g1',
      habitId: habit.id,
      targetType: 'Streak target',
      targetValue: 7,
    })).toEqual(expect.objectContaining({ progress: 3, percentage: 43 }));

    expect(getGoalProgress(useHabitStore.getState().checkins, {
      id: 'g2',
      habitId: habit.id,
      targetType: 'Total completions target',
      targetValue: 10,
    })).toEqual(expect.objectContaining({ progress: 3, percentage: 30 }));
  });

  it('TC-GOAL-008 and TC-GOAL-009 derive encouragement and achieved states', () => {
    const habit = addHabit({ targetPerDay: 1 });

    useHabitStore.setState({
      checkins: Array.from({ length: 8 }, (_, index) => ({
        id: `c-${index}`,
        habitId: habit.id,
        date: `2026-06-${String(index + 1).padStart(2, '0')}`,
        completedCount: 1,
        status: 'Completed' as const,
      })),
    });

    expect(getGoalProgress(useHabitStore.getState().checkins, {
      id: 'g1',
      habitId: habit.id,
      targetType: 'Total completions target',
      targetValue: 10,
    })).toEqual(expect.objectContaining({ progress: 8, percentage: 80, isEncouraged: true, isAchieved: false }));

    expect(getGoalProgress(useHabitStore.getState().checkins, {
      id: 'g2',
      habitId: habit.id,
      targetType: 'Total completions target',
      targetValue: 8,
    })).toEqual(expect.objectContaining({ progress: 8, percentage: 100, isAchieved: true }));
  });

  it('TC-GOAL-012 exposes an empty goal list for habits without goals', () => {
    addHabit();

    expect(useHabitStore.getState().goals).toEqual([]);
  });
});
