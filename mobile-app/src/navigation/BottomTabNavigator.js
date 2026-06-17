import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, TouchableOpacity, LayoutAnimation, Platform, UIManager } from 'react-native';
import HabitListScreen from '../screens/HabitList/HabitListScreen';
import { getTabStyles } from './BottomTabNavigator.styles';
import { useTheme } from '../providers/ThemeProvider';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

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


// --- ICON SUB-COMPONENTS ---
const TodayIcon = ({ focused, t, isExpanded }) => {
  const { colors } = useTheme();
  const tabStyles = getTabStyles(colors);
  return focused ? (
  <View style={tabStyles.activeTabItemContainer}>
    <View style={tabStyles.activeTabIndicatorCapsule}>
      <View style={tabStyles.vectorTabIconWrapper}>
        <View style={[tabStyles.vectorIconCalendarBase, { borderColor: colors.successDark }]}>
          <View style={[tabStyles.vectorIconCalendarDot, { backgroundColor: colors.successDark }]} />
        </View>
      </View>
    </View>
    {isExpanded && <Text style={tabStyles.tabBarLabelTextActive} adjustsFontSizeToFit={true} numberOfLines={1}>{t('tabs.today')}</Text>}
  </View>
) : (
  <View style={tabStyles.inactiveTabContainer}>
    <View style={tabStyles.vectorTabIconWrapper}>
      <View style={tabStyles.vectorIconCalendarBase}>
        <View style={tabStyles.vectorIconCalendarDot} />
      </View>
    </View>
    {isExpanded && <Text style={tabStyles.tabBarLabelText} adjustsFontSizeToFit={true} numberOfLines={1}>{t('tabs.today')}</Text>}
  </View>
  );
};

const HabitsIcon = ({ focused, t, isExpanded }) => {
  const { colors } = useTheme();
  const tabStyles = getTabStyles(colors);
  return focused ? (
  <View style={tabStyles.activeTabItemContainer}>
    <View style={tabStyles.activeTabIndicatorCapsule}>
      <View style={tabStyles.vectorTabIconWrapper}>
        <View style={tabStyles.vectorIconChecklistRow}>
          <Text style={tabStyles.vectorIconCheckmarkMini}>{t('icons.check')}</Text>
          <View style={tabStyles.vectorIconCheckLine} />
        </View>
      </View>
    </View>
    {isExpanded && <Text style={tabStyles.tabBarLabelTextActive} adjustsFontSizeToFit={true} numberOfLines={1}>{t('tabs.habits')}</Text>}
  </View>
) : (
  <View style={tabStyles.inactiveTabContainer}>
    <View style={tabStyles.vectorTabIconWrapper}>
      <View style={tabStyles.vectorIconChecklistRow}>
        <Text style={[tabStyles.vectorIconCheckmarkMini, { color: colors.textMuted }]}>{t('icons.check')}</Text>
        <View style={[tabStyles.vectorIconCheckLine, { backgroundColor: colors.textMuted }]} />
      </View>
    </View>
    {isExpanded && <Text style={tabStyles.tabBarLabelText} adjustsFontSizeToFit={true} numberOfLines={1}>{t('tabs.habits')}</Text>}
  </View>
  );
};

const StatsIcon = ({ focused, t, isExpanded }) => {
  const { colors } = useTheme();
  const tabStyles = getTabStyles(colors);
  return focused ? (
  <View style={tabStyles.activeTabItemContainer}>
    <View style={tabStyles.activeTabIndicatorCapsule}>
      <View style={tabStyles.vectorTabIconWrapper}>
        <View style={tabStyles.vectorIconStatsBars}>
          <View style={[tabStyles.vectorStatBarSingle, { height: 8, backgroundColor: colors.successDark }]} />
          <View style={[tabStyles.vectorStatBarSingle, { height: 14, backgroundColor: colors.successDark }]} />
          <View style={[tabStyles.vectorStatBarSingle, { height: 10, backgroundColor: colors.successDark }]} />
        </View>
      </View>
    </View>
    {isExpanded && <Text style={tabStyles.tabBarLabelTextActive} adjustsFontSizeToFit={true} numberOfLines={1}>{t('tabs.stats')}</Text>}
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
    {isExpanded && <Text style={tabStyles.tabBarLabelText} adjustsFontSizeToFit={true} numberOfLines={1}>{t('tabs.stats')}</Text>}
  </View>
  );
};

const GoalsIcon = ({ focused, t, isExpanded }) => {
  const { colors } = useTheme();
  const tabStyles = getTabStyles(colors);
  return focused ? (
  <View style={tabStyles.activeTabItemContainer}>
    <View style={tabStyles.activeTabIndicatorCapsule}>
      <View style={tabStyles.vectorTabIconWrapper}>
        <View style={[tabStyles.vectorIconTrophyCup, { borderColor: colors.successDark }]} />
      </View>
    </View>
    {isExpanded && <Text style={tabStyles.tabBarLabelTextActive} adjustsFontSizeToFit={true} numberOfLines={1}>{t('tabs.goals')}</Text>}
  </View>
) : (
  <View style={tabStyles.inactiveTabContainer}>
    <View style={tabStyles.vectorTabIconWrapper}>
      <View style={tabStyles.vectorIconTrophyCup} />
    </View>
    {isExpanded && <Text style={tabStyles.tabBarLabelText} adjustsFontSizeToFit={true} numberOfLines={1}>{t('tabs.goals')}</Text>}
  </View>
  );
};

const MascotIcon = ({ focused, t, isExpanded }) => {
  const { colors } = useTheme();
  const tabStyles = getTabStyles(colors);
  return focused ? (
  <View style={tabStyles.activeTabItemContainer}>
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
    </View>
    {isExpanded && <Text style={tabStyles.tabBarLabelTextActive} adjustsFontSizeToFit={true} numberOfLines={1}>{t('tabs.mascot')}</Text>}
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
    {isExpanded && <Text style={tabStyles.tabBarLabelText} adjustsFontSizeToFit={true} numberOfLines={1}>{t('tabs.mascot')}</Text>}
  </View>
  );
};


// --- MAIN NAVIGATOR ---
const Tab = createBottomTabNavigator();

export default function BottomTabNavigator() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const tabStyles = getTabStyles(colors);
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded(!isExpanded);
  };

  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        initialRouteName="Habits"
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: false,
          tabBarStyle: isExpanded ? tabStyles.globalBottomTabBarExpanded : tabStyles.globalBottomTabBar,
          tabBarItemStyle: isExpanded ? tabStyles.tabBarItemExpanded : tabStyles.tabBarItem,
        }}
      >
        <Tab.Screen 
          name="Today" 
          component={TodayScreen}
          options={{
            tabBarIcon: (props) => <TodayIcon {...props} t={t} isExpanded={isExpanded} />
          }}
        />

        <Tab.Screen 
          name="Habits" 
          component={HabitListScreen}
          options={{
            tabBarIcon: (props) => <HabitsIcon {...props} t={t} isExpanded={isExpanded} />
          }}
        />

        <Tab.Screen 
          name="Stats" 
          component={StatsScreen}
          options={{
            tabBarIcon: (props) => <StatsIcon {...props} t={t} isExpanded={isExpanded} />
          }}
        />

        <Tab.Screen 
          name="Goals" 
          component={GoalsScreen}
          options={{
            tabBarIcon: (props) => <GoalsIcon {...props} t={t} isExpanded={isExpanded} />
          }}
        />

        <Tab.Screen 
          name="Mascot" 
          component={MascotScreen}
          options={{
            tabBarIcon: (props) => <MascotIcon {...props} t={t} isExpanded={isExpanded} />
          }}
        />
      </Tab.Navigator>

      {!isExpanded && (
        <View style={tabStyles.expandHandleWrapper}>
          <Text style={tabStyles.helperPromptText}>
            {t('tabs.tapToSeeScreenNames')}
          </Text>
          <TouchableOpacity onPress={toggleExpand} style={tabStyles.tripleArrowIconBase} activeOpacity={0.7}>
            <View style={tabStyles.arrowLineTop} />
            <View style={tabStyles.arrowLineMid} />
            <View style={tabStyles.arrowLineBot} />
          </TouchableOpacity>
        </View>
      )}
      {isExpanded && (
        <TouchableOpacity style={tabStyles.collapseHandleWrapper} onPress={toggleExpand} activeOpacity={0.7}>
          <View style={tabStyles.arrowLineBot} />
          <View style={tabStyles.arrowLineMid} />
          <View style={tabStyles.arrowLineTop} />
        </TouchableOpacity>
      )}
    </View>
  );
}
