import {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { Animation } from './tokens';

export function useStaggeredFadeIn(
  count: number,
  baseDelay: number = 50,
  duration: number = Animation.duration.normal
) {
  const opacities = useSharedValue<number[]>(Array(count).fill(0));

  const styles: ReturnType<typeof useAnimatedStyle>[] = [];
  for (let i = 0; i < count; i++) {
    styles[i] = useAnimatedStyle(() => ({
      opacity: opacities.value[i] ?? 0,
    }));
  }

  const getAnimatedStyle = (index: number) => styles[index];

  const start = () => {
    const newOpacities = opacities.value.map((_, i) =>
      withDelay(
        i * baseDelay,
        withTiming(1, { duration, easing: Easing.out(Easing.quad) })
      )
    );
    opacities.value = newOpacities;
  };

  const reset = () => {
    opacities.value = Array(count).fill(0);
  };

  return { getAnimatedStyle, start, reset };
}
