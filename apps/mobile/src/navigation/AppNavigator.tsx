import { NavigationContainer } from '@react-navigation/native';
import { type ReactNode } from 'react';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { LoginScreen } from '../screens/Auth/LoginScreen';
import { RegisterScreen } from '../screens/Auth/RegisterScreen';
import { DashboardScreen } from '../screens/Dashboard/DashboardScreen';
import { CreateGroupScreen } from '../screens/Groups/CreateGroupScreen';
import { GroupDetailsScreen } from '../screens/Groups/GroupDetailsScreen';
import { GroupsScreen } from '../screens/Groups/GroupsScreen';
import { InviteMemberScreen } from '../screens/Groups/InviteMemberScreen';
import { ProfileScreen } from '../screens/Profile/ProfileScreen';
import { SettingsScreen } from '../screens/Settings/SettingsScreen';
import { TransactionDetailsScreen } from '../screens/Transactions/TransactionDetailsScreen';
import { TransactionFormScreen } from '../screens/Transactions/TransactionFormScreen';
import { TransactionsScreen } from '../screens/Transactions/TransactionsScreen';
import { getApiErrorMessage } from '../services/api';
import { useAuthStore } from '../store/auth.store';
import { useGroupsStore } from '../store/groups.store';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { ErrorState } from '../components/ErrorState';
import { LoadingState } from '../components/LoadingState';
import { Screen } from '../components/Screen';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type AppStackParamList = {
  CreateGroup: undefined;
  Dashboard: undefined;
  Transactions: undefined;
  Groups: undefined;
  Profile: undefined;
  Settings: undefined;
  GroupDetails: { groupId: string };
  InviteMember: { groupId: string };
  NewTransaction: undefined;
  TransactionDetails: { transactionId: string };
  EditTransaction: { transactionId: string };
};

type AuthRoute = keyof AuthStackParamList;
type MainTab = 'Dashboard' | 'Transactions' | 'Groups' | 'Profile';
type AppRoute =
  | { name: 'CreateGroup'; from?: MainTab }
  | { name: 'Dashboard' }
  | { name: 'Transactions' }
  | { name: 'Groups' }
  | { name: 'Profile' }
  | { name: 'Settings' }
  | { name: 'GroupDetails'; groupId: string }
  | { name: 'InviteMember'; groupId: string }
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

const tabs: Array<{ label: string; route: MainTab }> = [
  { label: 'Inicio', route: 'Dashboard' },
  { label: 'Transacoes', route: 'Transactions' },
  { label: 'Grupos', route: 'Groups' },
  { label: 'Perfil', route: 'Profile' },
];

const getActiveTab = (route: AppRoute): MainTab => {
  if (
    route.name === 'Transactions' ||
    route.name === 'NewTransaction' ||
    route.name === 'TransactionDetails' ||
    route.name === 'EditTransaction'
  ) {
    return 'Transactions';
  }

  if (route.name === 'Groups' || route.name === 'GroupDetails' || route.name === 'InviteMember') {
    return 'Groups';
  }

  if (route.name === 'Profile' || route.name === 'Settings') {
    return 'Profile';
  }

  return 'Dashboard';
};

const toTabRoute = (tab: MainTab): AppRoute => ({ name: tab }) as AppRoute;

const MainTabs = ({
  children,
  route,
  setRoute,
}: {
  children: ReactNode;
  route: AppRoute;
  setRoute: (route: AppRoute) => void;
}) => {
  const activeTab = getActiveTab(route);

  return (
    <View style={styles.shell}>
      <View style={styles.screenSlot}>{children}</View>
      <View style={styles.tabBar}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.route;

          return (
            <Pressable
              accessibilityRole="button"
              key={tab.route}
              onPress={() => setRoute({ name: tab.route })}
              style={styles.tabButton}
            >
              <Text style={[styles.tabText, isActive && styles.tabTextActive]}>{tab.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const MainNavigator = () => {
  const [route, setRoute] = useState<AppRoute>({ name: 'Dashboard' });
  const activeGroup = useGroupsStore((state) => state.activeGroup);
  const groups = useGroupsStore((state) => state.groups);
  const fetchGroups = useGroupsStore((state) => state.fetchGroups);
  const isLoadingGroups = useGroupsStore((state) => state.isLoadingGroups);
  const [hasCheckedGroups, setHasCheckedGroups] = useState(false);
  const [groupsError, setGroupsError] = useState('');

  const loadGroups = useCallback(async () => {
    setGroupsError('');

    try {
      await fetchGroups();
    } catch (error) {
      setGroupsError(getApiErrorMessage(error));
    } finally {
      setHasCheckedGroups(true);
    }
  }, [fetchGroups]);

  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  useEffect(() => {
    if (!hasCheckedGroups || route.name !== 'Dashboard') {
      return;
    }

    if (!activeGroup && groups.length === 0) {
      setRoute({ name: 'CreateGroup' });
    }
  }, [activeGroup, groups.length, hasCheckedGroups, route.name]);

  if (!hasCheckedGroups && isLoadingGroups) {
    return <LoadingState message="Preparando seu Coflu..." />;
  }

  if (groupsError && !groups.length) {
    return (
      <Screen>
        <ErrorState message={groupsError} onRetry={loadGroups} />
      </Screen>
    );
  }

  if (route.name === 'CreateGroup') {
    return (
      <CreateGroupScreen
        onBack={groups.length ? () => setRoute(toTabRoute(route.from ?? 'Groups')) : undefined}
        onCreated={() => setRoute({ name: 'Dashboard' })}
      />
    );
  }

  if (!activeGroup && route.name !== 'Groups') {
    return <CreateGroupScreen onCreated={() => setRoute({ name: 'Dashboard' })} />;
  }

  const renderRoute = () => {
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

    if (route.name === 'Groups') {
      return (
        <GroupsScreen
          onCreateGroup={() => setRoute({ name: 'CreateGroup', from: 'Groups' })}
          onOpenGroup={(groupId) => setRoute({ name: 'GroupDetails', groupId })}
        />
      );
    }

    if (route.name === 'Profile') {
      return <ProfileScreen onOpenSettings={() => setRoute({ name: 'Settings' })} />;
    }

    if (route.name === 'Settings') {
      return <SettingsScreen onBack={() => setRoute({ name: 'Profile' })} />;
    }

    if (route.name === 'GroupDetails') {
      return (
        <GroupDetailsScreen
          groupId={route.groupId}
          onBack={() => setRoute({ name: 'Groups' })}
          onInvite={() => setRoute({ name: 'InviteMember', groupId: route.groupId })}
        />
      );
    }

    if (route.name === 'InviteMember') {
      return (
        <InviteMemberScreen
          groupId={route.groupId}
          onBack={() => setRoute({ name: 'GroupDetails', groupId: route.groupId })}
          onInvited={() => setRoute({ name: 'GroupDetails', groupId: route.groupId })}
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
          onBack={() =>
            setRoute({ name: 'TransactionDetails', transactionId: route.transactionId })
          }
          onSaved={() =>
            setRoute({ name: 'TransactionDetails', transactionId: route.transactionId })
          }
          transactionId={route.transactionId}
        />
      );
    }

    return (
      <DashboardScreen
        onCreateTransaction={() => setRoute({ name: 'NewTransaction' })}
        onOpenTransactions={() => setRoute({ name: 'Transactions' })}
      />
    );
  };

  return (
    <MainTabs route={route} setRoute={setRoute}>
      {renderRoute()}
    </MainTabs>
  );
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
    return <LoadingState message="Abrindo o Coflu..." />;
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    backgroundColor: colors.background.light,
  },
  screenSlot: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.light,
    backgroundColor: colors.neutral.white,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    borderRadius: 14,
  },
  tabText: {
    ...typography.button,
    color: colors.text.secondary,
    fontSize: 12,
    letterSpacing: 0,
  },
  tabTextActive: {
    color: colors.brand.primary,
  },
});
