import { SubscriptionProvider } from './src/context/SubscriptionContext';
import { HomeScreen } from './src/screens';

export default function App() {
  return (
    <SubscriptionProvider>
      <HomeScreen />
    </SubscriptionProvider>
  );
}
