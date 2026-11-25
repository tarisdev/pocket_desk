import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { registerRootComponent } from 'expo';
import { ThemeProvider } from './src/theme';
import { AppProvider } from './src/context/AppContext';
import { AppNavigator } from './src/navigator/AppNavigator';
import './src/i18n';

const RNErrorUtils = (
  globalThis as unknown as {
    ErrorUtils?: {
      setHandler: (handler: (error: Error, isFatal: boolean) => void) => void;
    };
  }
).ErrorUtils;
if (RNErrorUtils?.setHandler) {
  RNErrorUtils.setHandler((error: Error, isFatal: boolean) => {
    console.error(
      '[GlobalErrorHandler]',
      isFatal ? 'FATAL' : 'NON-FATAL',
      error
    );
  });
}

if (
  typeof globalThis !== 'undefined' &&
  typeof globalThis.addEventListener === 'function'
) {
  globalThis.addEventListener(
    'unhandledrejection',
    (event: PromiseRejectionEvent) => {
      console.error(
        '[GlobalErrorHandler] Unhandled promise rejection',
        event.reason
      );
    }
  );
}

export function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <StatusBar barStyle="light-content" />
          <AppProvider>
            <AppNavigator />
          </AppProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

registerRootComponent(App);
export default App;
