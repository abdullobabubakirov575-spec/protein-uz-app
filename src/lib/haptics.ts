import * as Haptics from 'expo-haptics';

const swallow = () => {};

export const haptic = {
  selection: () => Haptics.selectionAsync().catch(swallow),
  light: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(swallow),
  medium: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(swallow),
  success: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(swallow),
  warning: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(swallow),
  error: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(swallow),
};
