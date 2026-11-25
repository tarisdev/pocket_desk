import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useSharedValue, withTiming, runOnJS } from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';
import { Animation, Layout } from '@design/tokens';

export interface BottomNavVisibilityContextValue {
  isBottomNavVisible: boolean;
  toggleBottomNavVisibility: () => void;
  animatedNavBarHeight: SharedValue<number>;
  animatedNavBarOpacity: SharedValue<number>;
}

const BottomNavVisibilityContext = createContext<
  BottomNavVisibilityContextValue | undefined
>(undefined);

export function BottomNavVisibilityProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [isVisible, setIsVisible] = useState(true);
  const isVisibleRef = useRef(isVisible);
  isVisibleRef.current = isVisible;
  const isMountedRef = useRef(true);

  const height = useSharedValue(isVisible ? Layout.tabBarHeight : 0);
  const opacity = useSharedValue(isVisible ? 1 : 0);

  const setIsVisibleSafe = runOnJS((v: boolean) => {
    if (isMountedRef.current) {
      setIsVisible(v);
      isVisibleRef.current = v;
    }
  });

  const toggle = useCallback(() => {
    try {
      const visible = isVisibleRef.current;
      if (!isMountedRef.current) {
        return;
      }
      if (visible) {
        opacity.value = withTiming(
          0,
          { duration: Animation.duration.fast },
          () => {
            try {
              height.value = 0;
            } catch (err) {
              console.error(
                '[BottomNavVisibility] hide height callback error',
                err
              );
            }
          }
        );
        setIsVisibleSafe(false);
        height.value = withTiming(0, { duration: Animation.duration.normal });
      } else {
        setIsVisibleSafe(true);
        height.value = withTiming(Layout.tabBarHeight, {
          duration: Animation.duration.normal,
        });
        opacity.value = withTiming(1, { duration: Animation.duration.fast });
      }
    } catch (err) {
      console.error('[BottomNavVisibility] toggle error', err);
    }
  }, []);

  const value = useMemo<BottomNavVisibilityContextValue>(
    () => ({
      isBottomNavVisible: isVisible,
      toggleBottomNavVisibility: toggle,
      animatedNavBarHeight: height,
      animatedNavBarOpacity: opacity,
    }),
    [isVisible, toggle, height, opacity]
  );

  return (
    <BottomNavVisibilityContext.Provider value={value}>
      {children}
    </BottomNavVisibilityContext.Provider>
  );
}

export function useBottomNavVisibility(): BottomNavVisibilityContextValue {
  const ctx = useContext(BottomNavVisibilityContext);
  if (!ctx) {
    throw new Error(
      'useBottomNavVisibility must be used within BottomNavVisibilityProvider'
    );
  }
  return ctx;
}
