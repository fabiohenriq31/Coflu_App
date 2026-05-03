import { StatusBar } from 'expo-status-bar';

import { WelcomeScreen } from './src/screens/WelcomeScreen';

export default function App() {
  return (
    <>
      <StatusBar style="dark" />
      <WelcomeScreen />
    </>
  );
}
