## Description

Please include a summary of the change and which issue is fixed. Please also include relevant motivation and context.

## Architectural Review Checklist

Before requesting a review, please ensure your PR adheres to our core React Native architecture guidelines:

- [ ] **Component Cleanliness:** Does this component separate UI from business logic? (i.e. Custom hooks used for data fetching/state instead of cluttering the component)
- [ ] **Adaptive Design:** Are there zero hardcoded pixels for layout? (Using flexbox, percentages, and responsive units)
- [ ] **Accessibility:** Do all interactive elements (Pressable, Touchable) have `accessible`, `accessibilityRole`, and `accessibilityLabel` properties?
- [ ] **Theming:** Does this component respect the `ThemeProvider` context instead of hardcoding colors?
- [ ] **Localization:** Are there absolutely NO hardcoded strings? (Is `useTranslation` and `t()` used everywhere?)
- [ ] **Performance:** If rendering a list, is `FlashList` used instead of `FlatList`?

## Type of change
- [ ] Bug fix
- [ ] New feature
- [ ] Refactoring
- [ ] Architecture/Performance improvement

## Screenshots (if applicable)

[Drop screenshots or videos here]
