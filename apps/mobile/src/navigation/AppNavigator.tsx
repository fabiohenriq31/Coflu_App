import { NavigationContainer } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { LoginScreen } from '../screens/Auth/LoginScreen';
import { RegisterScreen } from '../screens/Auth/RegisterScreen';
import { DashboardScreen } from '../screens/Dashboard/DashboardScreen';
import { TransactionDetailsScreen } from '../screens/Transactions/TransactionDetailsScreen';
import { TransactionFormScreen } from '../screens/Transactions/TransactionFormScreen';
import { TransactionsScreen } from '../screens/Transactions/TransactionsScreen';
import { useAuthStore } from '../store/auth.store';
import { colors } from '../theme/colors';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type AppStackParamList = {
  Dashboard: undefined;
  Transactions: undefined;
  NewTransaction: undefined;
  TransactionDetails: { transactionId: string };
  EditTransaction: { transactionId: string };
};

type AuthRoute = keyof AuthStackParamList;
type AppRoute =
  | { name: 'Dashboard' }
  | { name: 'Transactions' }
  | { name: 'NewTransaction' }
  | { name: 'TransactionDetails'; transactionId: string }
  | { name: 'EditTransaction'; transactionId: string };

const AuthNavigator = () => {
  const [route, setRoute] = useState<AuthRoute>('Login');

  if (route === 'Register') {
    return <RegisterScreen onNavigateToLogin={() => setRoute('Login')} />;
  }

  return <LoginScreen onNavigateToRegister={() => setRoute('Register')} />;
};

const MainNavigator = () => {
  const [route, setRoute] = useState<AppRoute>({ name: 'Dashboard' });

  if (route.name === 'Transactions') {
    return (
      <TransactionsScreen
        onBack={() => setRoute({ name: 'Dashboard' })}
        onCreate={() => setRoute({ name: 'NewTransaction' })}
        onOpenTransaction={(transactionId) =>
          setRoute({ name: 'TransactionDetails', transactionId })
        }
      />
    );
  }

  if (route.name === 'NewTransaction') {
    return (
      <TransactionFormScreen
        mode="create"
        onBack={() => setRoute({ name: 'Transactions' })}
        onSaved={() => setRoute({ name: 'Transactions' })}
      />
    );
  }

  if (route.name === 'TransactionDetails') {
    return (
      <TransactionDetailsScreen
        onBack={() => setRoute({ name: 'Transactions' })}
        onDeleted={() => setRoute({ name: 'Transactions' })}
        onEdit={() => setRoute({ name: 'EditTransaction', transactionId: route.transactionId })}
        transactionId={route.transactionId}
      />
    );
  }

  if (route.name === 'EditTransaction') {
    return (
      <TransactionFormScreen
        mode="edit"
        onBack={() => setRoute({ name: 'TransactionDetails', transactionId: route.transactionId })}
        onSaved={() => setRoute({ name: 'TransactionDetails', transactionId: route.transactionId })}
        transactionId={route.transactionId}
      />
    );
  }

  return <DashboardScreen onOpenTransactions={() => setRoute({ name: 'Transactions' })} />;
};

export const AppNavigator = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const restoreSession = useAuthStore((state) => state.restoreSession);

  useEffect(() => {
    if (isHydrated) {
      restoreSession();
    }
  }, [isHydrated, restoreSession]);

  if (!isHydrated) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={colors.brand.primary} size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background.light,
  },
});
