import React from 'react';
import { useTranslation } from 'react-i18next';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text } from 'react-native';
import HabitListScreen from '../screens/HabitList/HabitListScreen';
import { getTabStyles } from './BottomTabNavigator.styles';
import { useTheme } from '../../providers/ThemeProvider';

// --- CLEAN DUMMY SCREENS ---
const TodayScreen = () => { const { t } = useTranslation(); const { colors } = useTheme(); return (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
    <Text style={{ fontSize: 16, color: colors.primary, fontWeight: 'bold' }}>{t('tabs.todayScreen')}</Text>
  </View>
);};

const StatsScreen = () => { const { t } = useTranslation(); const { colors } = useTheme(); return (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
    <Text style={{ fontSize: 16, color: colors.primary, fontWeight: 'bold' }}>{t('tabs.statsScreen')}</Text>
  </View>
);};

const GoalsScreen = () => { const { t } = useTranslation(); const { colors } = useTheme(); return (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
    <Text style={{ fontSize: 16, color: colors.primary, fontWeight: 'bold' }}>{t('tabs.goalsScreen')}</Text>
  </View>
);};

const MascotScreen = () => { const { t } = useTranslation(); const { colors } = useTheme(); return (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
    <Text style={{ fontSize: 16, color: colors.primary, fontWeight: 'bold' }}>{t('tabs.mascotScreen')}</Text>
  </View>
);};


// --- ICON SUB-COMPONENTS (Isolated to Eliminate Warnings & Optimize Rendering) ---
const TodayIcon = ({ focused, t }) => {
  const { colors } = useTheme();
  const tabStyles = getTabStyles(colors);
  return focused ? (
  <View style={tabStyles.activeTabIndicatorCapsule}>
    <View style={tabStyles.vectorTabIconWrapper}>
      <View style={[tabStyles.vectorIconCalendarBase, { borderColor: colors.successDark }]}>
        <View style={[tabStyles.vectorIconCalendarDot, { backgroundColor: colors.successDark }]} />
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

const HabitsIcon = ({ focused, t }) => {
  const { colors } = useTheme();
  const tabStyles = getTabStyles(colors);
  return focused ? (
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
        <Text style={[tabStyles.vectorIconCheckmarkMini, { color: colors.textMuted }]}>✓</Text>
        <View style={[tabStyles.vectorIconCheckLine, { backgroundColor: colors.textMuted }]} />
      </View>
    </View>
    <Text style={tabStyles.tabBarLabelText}>{t('tabs.habits')}</Text>
  </View>
);

const StatsIcon = ({ focused, t }) => {
  const { colors } = useTheme();
  const tabStyles = getTabStyles(colors);
  return focused ? (
  <View style={tabStyles.activeTabIndicatorCapsule}>
    <View style={tabStyles.vectorTabIconWrapper}>
      <View style={tabStyles.vectorIconStatsBars}>
        <View style={[tabStyles.vectorStatBarSingle, { height: 8, backgroundColor: colors.successDark }]} />
        <View style={[tabStyles.vectorStatBarSingle, { height: 14, backgroundColor: colors.successDark }]} />
        <View style={[tabStyles.vectorStatBarSingle, { height: 10, backgroundColor: colors.successDark }]} />
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

const GoalsIcon = ({ focused, t }) => {
  const { colors } = useTheme();
  const tabStyles = getTabStyles(colors);
  return focused ? (
  <View style={tabStyles.activeTabIndicatorCapsule}>
    <View style={tabStyles.vectorTabIconWrapper}>
      <View style={[tabStyles.vectorIconTrophyCup, { borderColor: colors.successDark }]} />
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

const MascotIcon = ({ focused, t }) => {
  const { colors } = useTheme();
  const tabStyles = getTabStyles(colors);
  return focused ? (
  <View style={tabStyles.activeTabIndicatorCapsule}>
    <View style={tabStyles.vectorTabIconWrapper}>
      <View style={[tabStyles.vectorIconMascotFaceSmiley, { borderColor: colors.successDark }]}>
        <View style={tabStyles.vectorIconMascotEyesLine}>
          <View style={[tabStyles.vectorIconMascotEyeDot, { backgroundColor: colors.successDark }]} />
          <View style={[tabStyles.vectorIconMascotEyeDot, { backgroundColor: colors.successDark }]} />
        </View>
        <View style={[tabStyles.vectorIconMascotSmileMini, { borderColor: colors.successDark }]} />
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
  const { colors } = useTheme();
  const tabStyles = getTabStyles(colors);
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