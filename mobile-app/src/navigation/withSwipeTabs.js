/* eslint-disable react-native/no-inline-styles, react-hooks/refs */
import React, { useMemo } from "react";
import { PanResponder, View } from "react-native";

const SWIPE_DISTANCE = 60;

// Wraps a tab screen so a horizontal swipe navigates to the adjacent tab.
// Only clearly horizontal swipes are claimed; vertical scrolls and child
// gestures (e.g. a card's right-swipe-to-done) keep working because this
// responder lives at the bubble phase and uses a high threshold.
export default function withSwipeTabs(ScreenComponent) {
  function SwipeTabsWrapper(props) {
    const { navigation } = props;

    const panResponder = useMemo(
      () =>
        PanResponder.create({
          onMoveShouldSetPanResponder: (_evt, g) =>
            Math.abs(g.dx) > SWIPE_DISTANCE &&
            Math.abs(g.dx) > Math.abs(g.dy) * 1.8,
          onPanResponderRelease: (_evt, g) => {
            const state = navigation.getState();
            const { routes, index } = state;
            if (g.dx < -SWIPE_DISTANCE && index < routes.length - 1) {
              navigation.navigate(routes[index + 1].name);
            } else if (g.dx > SWIPE_DISTANCE && index > 0) {
              navigation.navigate(routes[index - 1].name);
            }
          },
        }),
      [navigation],
    );

    return (
      <View style={{ flex: 1 }} {...panResponder.panHandlers}>
        <ScreenComponent {...props} />
      </View>
    );
  }

  SwipeTabsWrapper.displayName = `withSwipeTabs(${
    ScreenComponent.displayName || ScreenComponent.name || "Screen"
  })`;

  return SwipeTabsWrapper;
}
