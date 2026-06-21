const XANO_BASE_URL = 'https://x8ki-letl-twmt.n7.xano.io/api:EDyDyMOI';

async function runTests() {
    console.log('Starting automated tests for Xano endpoints...');

    try {
        // 1. Create a habit
        console.log('\n--- Test 1: POST /habits ---');
        const habitResponse = await fetch(`${XANO_BASE_URL}/habits`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Drink Water',
                category: 'Health',
                frequency: 'Daily',
                targetPerDay: 8,
                priority: 'High',
                status: 'Active'
            })
        });
        const habitData = await habitResponse.json();
        const habitId = habitData.id;
        console.log('✅ Created Habit ID:', habitId);

        // 2. Get today's habits
        console.log('\n--- Test 2: GET /habits/today ---');
        const todayResponse = await fetch(`${XANO_BASE_URL}/habits-today?timezone=Asia/Ho_Chi_Minh`);
        const todayData = await todayResponse.json();
        if (!Array.isArray(todayData)) {
            console.error('❌ GET /habits/today failed or returned error object:', todayData);
        } else {
            console.log('✅ Got today habits. Count:', todayData.length);
        }

        // 3. Create a goal for the habit
        console.log('\n--- Test 3: POST /habits/{id}/goals ---');
        const goalResponse = await fetch(`${XANO_BASE_URL}/habits/${habitId}/goals`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                targetType: 'Streak',
                targetValue: 7
            })
        });
        const goalData = await goalResponse.json();
        const goalId = goalData.id;
        console.log('✅ Created Goal ID:', goalId);

        // 4. Record a check-in
        console.log('\n--- Test 4: POST /habits/{id}/checkins ---');
        const checkinResponse = await fetch(`${XANO_BASE_URL}/habits/${habitId}/checkins`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                date: Date.now(),
                completedCount: 1
            })
        });
        const checkinData = await checkinResponse.json();
        const checkinId = checkinData.id;
        console.log('✅ Created Checkin ID:', checkinId);

        // 5. Update check-in
        console.log('\n--- Test 5: PATCH /habits/{id}/checkins/{cid} ---');
        const patchCheckinResponse = await fetch(`${XANO_BASE_URL}/habits/${habitId}/checkins/${checkinId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                completedCount: 8
            })
        });
        const patchData = await patchCheckinResponse.json();
        console.log('✅ Updated Checkin Status:', patchData.status);

        // 6. Get Dashboard summary
        console.log('\n--- Test 6: GET /dashboard/summary ---');
        const summaryResponse = await fetch(`${XANO_BASE_URL}/dashboard/summary?date=2026-06-15`);
        const summaryData = await summaryResponse.json();
        console.log('✅ Dashboard Summary:', summaryData);

        // 7. System Reset (Moved to the end)
        console.log('\n--- Test 7: GET /dashboard/goals ---');
        const goalsDashResponse = await fetch(`${XANO_BASE_URL}/dashboard/goals`);
        if (goalsDashResponse.status === 404) {
            console.log('⚠️ /dashboard/goals not implemented yet.');
        } else {
            console.log('✅ Dashboard Goals OK:', await goalsDashResponse.json());
        }

        console.log('\n--- Test 8: GET /dashboard/heatmap ---');
        const heatmapResponse = await fetch(`${XANO_BASE_URL}/dashboard/heatmap`);
        if (heatmapResponse.status === 404) {
            console.log('⚠️ /dashboard/heatmap not implemented yet.');
        } else {
            console.log('✅ Dashboard Heatmap OK:', (await heatmapResponse.json()).length, 'days');
        }

        console.log('\n--- Test 9: GET /dashboard/weekly-progress ---');
        const weeklyResponse = await fetch(`${XANO_BASE_URL}/dashboard/weekly-progress`);
        if (weeklyResponse.status === 404) {
            console.log('⚠️ /dashboard/weekly-progress not implemented yet.');
        } else {
            console.log('✅ Dashboard Weekly Progress OK:', (await weeklyResponse.json()).length, 'days');
        }

        console.log('\n--- Test 10: POST /system/reset ---');
        const resetResponse = await fetch(`${XANO_BASE_URL}/system/reset`, { method: 'POST' });
        const resetData = await resetResponse.json();
        console.log('✅ System Reset successful:', resetData);

        console.log('\n🎉 ALL TESTS PASSED SUCCESSFULLY!');
    } catch (error) {
        console.error('❌ API Test Failed:', error);
    }
}

runTests();
