/* eslint-disable react-native/no-inline-styles */
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  View,
  Text,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";

import { ListTodo, Trophy } from "lucide-react-native";

import { getTabStyles } from "./BottomTabNavigator.styles";
import withSwipeTabs from "./withSwipeTabs";
import HabitListScreen from "../features/habits/screens/HabitList/HabitListScreen";
import TodayScreen from "../features/today/screens/Today/TodayScreen";
import { useTheme } from "../providers/ThemeProvider";
import MascotScreen from "@/features/mascot/screens/MascotScreen";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// --- CLEAN DUMMY SCREENS ---
const StatsScreen = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: colors.background,
      }}
    >
      <Text
        style={[
          getTabStyles(colors).dummyScreenText,
          { color: colors.primary },
        ]}
      >
        {t("tabs.statsScreen")}
      </Text>
    </View>
  );
};

const GoalsScreen = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: colors.background,
      }}
    >
      <Text
        style={[
          getTabStyles(colors).dummyScreenText,
          { color: colors.primary },
        ]}
      >
        {t("tabs.goalsScreen")}
      </Text>
    </View>
  );
};

// Wrap each screen so a horizontal swipe moves to the adjacent tab.
const SwipeToday = withSwipeTabs(TodayScreen);
const SwipeHabits = withSwipeTabs(HabitListScreen);
const SwipeStats = withSwipeTabs(StatsScreen);
const SwipeGoals = withSwipeTabs(GoalsScreen);
const SwipeMascot = withSwipeTabs(MascotScreen);

// --- ICON SUB-COMPONENTS ---
const TodayIcon = ({ focused, t, isExpanded }) => {
  const { colors } = useTheme();
  const tabStyles = getTabStyles(colors);
  return focused ? (
    <View style={tabStyles.activeTabItemContainer}>
      <View style={tabStyles.activeTabIndicatorCapsule}>
        <View style={tabStyles.vectorTabIconWrapper}>
          <View
            style={[
              tabStyles.vectorIconCalendarBase,
              { borderColor: colors.successDark },
            ]}
          >
            <View
              style={[
                tabStyles.vectorIconCalendarDot,
                { backgroundColor: colors.successDark },
              ]}
            />
          </View>
        </View>
      </View>
      {isExpanded && (
        <Text
          style={tabStyles.tabBarLabelTextActive}
          adjustsFontSizeToFit
          numberOfLines={1}
        >
          {t("tabs.today")}
        </Text>
      )}
    </View>
  ) : (
    <View style={tabStyles.inactiveTabContainer}>
      <View style={tabStyles.vectorTabIconWrapper}>
        <View style={tabStyles.vectorIconCalendarBase}>
          <View style={tabStyles.vectorIconCalendarDot} />
        </View>
      </View>
      {isExpanded && (
        <Text
          style={tabStyles.tabBarLabelText}
          adjustsFontSizeToFit
          numberOfLines={1}
        >
          {t("tabs.today")}
        </Text>
      )}
    </View>
  );
};

const HabitsIcon = ({ focused, t, isExpanded }) => {
  const { colors } = useTheme();
  const tabStyles = getTabStyles(colors);
  const iconColor = focused ? colors.successDark : colors.textMuted;
  
  return focused ? (
    <View style={tabStyles.activeTabItemContainer}>
      <View style={tabStyles.activeTabIndicatorCapsule}>
        <View style={tabStyles.vectorTabIconWrapper}>
          <ListTodo size={20} color={iconColor} />
        </View>
      </View>
      {isExpanded && (
        <Text
          style={tabStyles.tabBarLabelTextActive}
          adjustsFontSizeToFit
          numberOfLines={1}
        >
          {t("tabs.habits")}
        </Text>
      )}
    </View>
  ) : (
    <View style={tabStyles.inactiveTabContainer}>
      <View style={tabStyles.vectorTabIconWrapper}>
        <ListTodo size={20} color={iconColor} />
      </View>
      {isExpanded && (
        <Text
          style={tabStyles.tabBarLabelText}
          adjustsFontSizeToFit
          numberOfLines={1}
        >
          {t("tabs.habits")}
        </Text>
      )}
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
            <View
              style={[
                tabStyles.vectorStatBarSingle,
                { height: 8, backgroundColor: colors.successDark },
              ]}
            />
            <View
              style={[
                tabStyles.vectorStatBarSingle,
                { height: 14, backgroundColor: colors.successDark },
              ]}
            />
            <View
              style={[
                tabStyles.vectorStatBarSingle,
                { height: 10, backgroundColor: colors.successDark },
              ]}
            />
          </View>
        </View>
      </View>
      {isExpanded && (
        <Text
          style={tabStyles.tabBarLabelTextActive}
          adjustsFontSizeToFit
          numberOfLines={1}
        >
          {t("tabs.stats")}
        </Text>
      )}
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
      {isExpanded && (
        <Text
          style={tabStyles.tabBarLabelText}
          adjustsFontSizeToFit
          numberOfLines={1}
        >
          {t("tabs.stats")}
        </Text>
      )}
    </View>
  );
};

const GoalsIcon = ({ focused, t, isExpanded }) => {
  const { colors } = useTheme();
  const tabStyles = getTabStyles(colors);
  const iconColor = focused ? colors.successDark : colors.textMuted;
  
  return focused ? (
    <View style={tabStyles.activeTabItemContainer}>
      <View style={tabStyles.activeTabIndicatorCapsule}>
        <View style={tabStyles.vectorTabIconWrapper}>
          <Trophy size={20} color={iconColor} />
        </View>
      </View>
      {isExpanded && (
        <Text
          style={tabStyles.tabBarLabelTextActive}
          adjustsFontSizeToFit
          numberOfLines={1}
        >
          {t("tabs.goals")}
        </Text>
      )}
    </View>
  ) : (
    <View style={tabStyles.inactiveTabContainer}>
      <View style={tabStyles.vectorTabIconWrapper}>
        <Trophy size={20} color={iconColor} />
      </View>
      {isExpanded && (
        <Text
          style={tabStyles.tabBarLabelText}
          adjustsFontSizeToFit
          numberOfLines={1}
        >
          {t("tabs.goals")}
        </Text>
      )}
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
          <View
            style={[
              tabStyles.vectorIconMascotFaceSmiley,
              { borderColor: colors.successDark },
            ]}
          >
            <View style={tabStyles.vectorIconMascotEyesLine}>
              <View
                style={[
                  tabStyles.vectorIconMascotEyeDot,
                  { backgroundColor: colors.successDark },
                ]}
              />
              <View
                style={[
                  tabStyles.vectorIconMascotEyeDot,
                  { backgroundColor: colors.successDark },
                ]}
              />
            </View>
            <View
              style={[
                tabStyles.vectorIconMascotSmileMini,
                { borderColor: colors.successDark },
              ]}
            />
          </View>
        </View>
      </View>
      {isExpanded && (
        <Text
          style={tabStyles.tabBarLabelTextActive}
          adjustsFontSizeToFit
          numberOfLines={1}
        >
          {t("tabs.mascot")}
        </Text>
      )}
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
      {isExpanded && (
        <Text
          style={tabStyles.tabBarLabelText}
          adjustsFontSizeToFit
          numberOfLines={1}
        >
          {t("tabs.mascot")}
        </Text>
      )}
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
        initialRouteName="Today"
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: false,
          // Slide the screens left/right when switching tabs (incl. via swipe).
          animation: "shift",
          tabBarStyle: isExpanded
            ? tabStyles.globalBottomTabBarExpanded
            : tabStyles.globalBottomTabBar,
          tabBarItemStyle: isExpanded
            ? tabStyles.tabBarItemExpanded
            : tabStyles.tabBarItem,
        }}
      >
        <Tab.Screen
          name="Today"
          component={SwipeToday}
          options={{
            tabBarIcon: (props) => (
              <TodayIcon {...props} t={t} isExpanded={isExpanded} />
            ),
          }}
        />

        <Tab.Screen
          name="Habits"
          component={SwipeHabits}
          options={{
            tabBarIcon: (props) => (
              <HabitsIcon {...props} t={t} isExpanded={isExpanded} />
            ),
          }}
        />

        <Tab.Screen
          name="Stats"
          component={SwipeStats}
          options={{
            tabBarIcon: (props) => (
              <StatsIcon {...props} t={t} isExpanded={isExpanded} />
            ),
          }}
        />

        <Tab.Screen
          name="Goals"
          component={SwipeGoals}
          options={{
            tabBarIcon: (props) => (
              <GoalsIcon {...props} t={t} isExpanded={isExpanded} />
            ),
          }}
        />

        <Tab.Screen
          name="Mascot"
          component={SwipeMascot}
          options={{
            tabBarIcon: (props) => (
              <MascotIcon {...props} t={t} isExpanded={isExpanded} />
            ),
          }}
        />
      </Tab.Navigator>

      {!isExpanded && (
        <View style={tabStyles.expandHandleWrapper}>
          <Text style={tabStyles.helperPromptText}>
            {t("tabs.tapToSeeScreenNames")}
          </Text>
          <TouchableOpacity
            accessibilityRole="button"
            onPress={toggleExpand}
            style={tabStyles.tripleArrowIconBase}
            activeOpacity={0.7}
          >
            <View style={tabStyles.arrowLineTop} />
            <View style={tabStyles.arrowLineMid} />
            <View style={tabStyles.arrowLineBot} />
          </TouchableOpacity>
        </View>
      )}
      {isExpanded && (
        <TouchableOpacity
          accessibilityRole="button"
          style={tabStyles.collapseHandleWrapper}
          onPress={toggleExpand}
          activeOpacity={0.7}
        >
          <View style={tabStyles.arrowLineBot} />
          <View style={tabStyles.arrowLineMid} />
          <View style={tabStyles.arrowLineTop} />
        </TouchableOpacity>
      )}
    </View>
  );
}
