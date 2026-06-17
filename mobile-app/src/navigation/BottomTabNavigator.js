import React from 'react';
import { useTranslation } from 'react-i18next';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text } from 'react-native';
import HabitListScreen from '../screens/HabitList/HabitListScreen';
import { tabStyles } from './BottomTabNavigator.styles';

// --- CLEAN DUMMY SCREENS ---
const TodayScreen = () => { const { t } = useTranslation(); return (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FBF9' }}>
    <Text style={{ fontSize: 16, color: '#2D4A3E', fontWeight: 'bold' }}>{t('tabs.todayScreen')}</Text>
  </View>
);};

const StatsScreen = () => { const { t } = useTranslation(); return (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FBF9' }}>
    <Text style={{ fontSize: 16, color: '#2D4A3E', fontWeight: 'bold' }}>{t('tabs.statsScreen')}</Text>
  </View>
);};

const GoalsScreen = () => { const { t } = useTranslation(); return (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FBF9' }}>
    <Text style={{ fontSize: 16, color: '#2D4A3E', fontWeight: 'bold' }}>{t('tabs.goalsScreen')}</Text>
  </View>
);};

const MascotScreen = () => { const { t } = useTranslation(); return (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FBF9' }}>
    <Text style={{ fontSize: 16, color: '#2D4A3E', fontWeight: 'bold' }}>{t('tabs.mascotScreen')}</Text>
  </View>
);};


// --- ICON SUB-COMPONENTS (Isolated to Eliminate Warnings & Optimize Rendering) ---
const TodayIcon = ({ focused, t }) => focused ? (
  <View style={tabStyles.activeTabIndicatorCapsule}>
    <View style={tabStyles.vectorTabIconWrapper}>
      <View style={[tabStyles.vectorIconCalendarBase, { borderColor: '#1E4631' }]}>
        <View style={[tabStyles.vectorIconCalendarDot, { backgroundColor: '#1E4631' }]} />
      </View>
    </View>
    <Text style={tabStyles.tabBarLabelTextActive}>{t('tabs.today')}</Text>
  </View>
) : (
  <View style={tabStyles.inactiveTabContainer}>
    <View style={tabStyles.vectorTabIconWrapper}>
      <View style={tabStyles.vectorIconCalendarBase}>
        <View style={tabStyles.vectorIconCalendarDot} />
      </View>
    </View>
    <Text style={tabStyles.tabBarLabelText}>{t('tabs.today')}</Text>
  </View>
);

const HabitsIcon = ({ focused, t }) => focused ? (
  <View style={tabStyles.activeTabIndicatorCapsule}>
    <View style={tabStyles.vectorTabIconWrapper}>
      <View style={tabStyles.vectorIconChecklistRow}>
        <Text style={tabStyles.vectorIconCheckmarkMini}>✓</Text>
        <View style={tabStyles.vectorIconCheckLine} />
      </View>
    </View>
    <Text style={tabStyles.tabBarLabelTextActive}>{t('tabs.habits')}</Text>
  </View>
) : (
  <View style={tabStyles.inactiveTabContainer}>
    <View style={tabStyles.vectorTabIconWrapper}>
      <View style={tabStyles.vectorIconChecklistRow}>
        <Text style={[tabStyles.vectorIconCheckmarkMini, { color: '#5F6368' }]}>✓</Text>
        <View style={[tabStyles.vectorIconCheckLine, { backgroundColor: '#5F6368' }]} />
      </View>
    </View>
    <Text style={tabStyles.tabBarLabelText}>{t('tabs.habits')}</Text>
  </View>
);

const StatsIcon = ({ focused, t }) => focused ? (
  <View style={tabStyles.activeTabIndicatorCapsule}>
    <View style={tabStyles.vectorTabIconWrapper}>
      <View style={tabStyles.vectorIconStatsBars}>
        <View style={[tabStyles.vectorStatBarSingle, { height: 8, backgroundColor: '#1E4631' }]} />
        <View style={[tabStyles.vectorStatBarSingle, { height: 14, backgroundColor: '#1E4631' }]} />
        <View style={[tabStyles.vectorStatBarSingle, { height: 10, backgroundColor: '#1E4631' }]} />
      </View>
    </View>
    <Text style={tabStyles.tabBarLabelTextActive}>{t('tabs.stats')}</Text>
  </View>
) : (
  <View style={tabStyles.inactiveTabContainer}>
    <View style={tabStyles.vectorTabIconWrapper}>
      <View style={tabStyles.vectorIconStatsBars}>
        <View style={[tabStyles.vectorStatBarSingle, { height: 8 }]} />
        <View style={[tabStyles.vectorStatBarSingle, { height: 14 }]} />
        <View style={[tabStyles.vectorStatBarSingle, { height: 10 }]} />
      </View>
    </View>
    <Text style={tabStyles.tabBarLabelText}>{t('tabs.stats')}</Text>
  </View>
);

const GoalsIcon = ({ focused, t }) => focused ? (
  <View style={tabStyles.activeTabIndicatorCapsule}>
    <View style={tabStyles.vectorTabIconWrapper}>
      <View style={[tabStyles.vectorIconTrophyCup, { borderColor: '#1E4631' }]} />
    </View>
    <Text style={tabStyles.tabBarLabelTextActive}>{t('tabs.goals')}</Text>
  </View>
) : (
  <View style={tabStyles.inactiveTabContainer}>
    <View style={tabStyles.vectorTabIconWrapper}>
      <View style={tabStyles.vectorIconTrophyCup} />
    </View>
    <Text style={tabStyles.tabBarLabelText}>{t('tabs.goals')}</Text>
  </View>
);

const MascotIcon = ({ focused, t }) => focused ? (
  <View style={tabStyles.activeTabIndicatorCapsule}>
    <View style={tabStyles.vectorTabIconWrapper}>
      <View style={[tabStyles.vectorIconMascotFaceSmiley, { borderColor: '#1E4631' }]}>
        <View style={tabStyles.vectorIconMascotEyesLine}>
          <View style={[tabStyles.vectorIconMascotEyeDot, { backgroundColor: '#1E4631' }]} />
          <View style={[tabStyles.vectorIconMascotEyeDot, { backgroundColor: '#1E4631' }]} />
        </View>
        <View style={[tabStyles.vectorIconMascotSmileMini, { borderColor: '#1E4631' }]} />
      </View>
    </View>
    <Text style={tabStyles.tabBarLabelTextActive}>{t('tabs.mascot')}</Text>
  </View>
) : (
  <View style={tabStyles.inactiveTabContainer}>
    <View style={tabStyles.vectorTabIconWrapper}>
      <View style={tabStyles.vectorIconMascotFaceSmiley}>
        <View style={tabStyles.vectorIconMascotEyesLine}>
          <View style={tabStyles.vectorIconMascotEyeDot} />
          <View style={tabStyles.vectorIconMascotEyeDot} />
        </View>
        <View style={tabStyles.vectorIconMascotSmileMini} />
      </View>
    </View>
    <Text style={tabStyles.tabBarLabelText}>{t('tabs.mascot')}</Text>
  </View>
);


// --- MAIN NAVIGATOR ---
const Tab = createBottomTabNavigator();

export default function BottomTabNavigator() {
  const { t } = useTranslation();
  return (
    <Tab.Navigator
      initialRouteName="Habits"
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: tabStyles.globalBottomTabBar,
        tabBarItemStyle: {
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
        },
      }}
    >
      <Tab.Screen 
        name="Today" 
        component={TodayScreen}
        options={{
          tabBarIcon: (props) => <TodayIcon {...props} t={t} />
        }}
      />

      <Tab.Screen 
        name="Habits" 
        component={HabitListScreen}
        options={{
          tabBarIcon: (props) => <HabitsIcon {...props} t={t} />
        }}
      />

      <Tab.Screen 
        name="Stats" 
        component={StatsScreen}
        options={{
          tabBarIcon: (props) => <StatsIcon {...props} t={t} />
        }}
      />

      <Tab.Screen 
        name="Goals" 
        component={GoalsScreen}
        options={{
          tabBarIcon: (props) => <GoalsIcon {...props} t={t} />
        }}
      />

      <Tab.Screen 
        name="Mascot" 
        component={MascotScreen}
        options={{
          tabBarIcon: (props) => <MascotIcon {...props} t={t} />
        }}
      />
    </Tab.Navigator>
  );
}