import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { Card } from '../../components/Card';
import { EmptyState } from '../../components/EmptyState';
import { Input } from '../../components/Input';
import { LoadingState } from '../../components/LoadingState';
import { Screen } from '../../components/Screen';
import { getApiErrorMessage } from '../../services/api';
import { categoriesService, type Category } from '../../services/categories';
import {
  transactionsService,
  type Transaction,
  type TransactionType,
} from '../../services/transactions';
import { useGroupsStore } from '../../store/groups.store';
import { useTransactionsStore } from '../../store/transactions.store';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { toDateInputValue } from '../../utils/date';

type Props = {
  mode: 'create' | 'edit';
  onBack: () => void;
  onSaved: () => void;
  transactionId?: string;
};

const transactionTypes: Array<{ label: string; value: TransactionType }> = [
  { label: 'Despesa', value: 'expense' },
  { label: 'Receita', value: 'income' },
  { label: 'Transfer.', value: 'transfer' },
];

const getInitialDate = () => toDateInputValue(new Date());

export const TransactionFormScreen = ({ mode, onBack, onSaved, transactionId }: Props) => {
  const activeGroup = useGroupsStore((state) => state.activeGroup);
  const createTransaction = useTransactionsStore((state) => state.createTransaction);
  const updateTransaction = useTransactionsStore((state) => state.updateTransaction);
  const [categories, setCategories] = useState<Category[]>([]);
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(getInitialDate());
  const [categoryId, setCategoryId] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [isLoading, setIsLoading] = useState(mode === 'edit');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const filteredCategories = useMemo(
    () =>
      categories.filter((category) =>
        type === 'income' ? category.type === 'income' : category.type === 'expense',
      ),
    [categories, type],
  );

  const loadData = useCallback(async () => {
    if (!activeGroup) {
      setIsLoading(false);
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const [categoryData, transactionData] = await Promise.all([
        categoriesService.listCategories(activeGroup.id),
        mode === 'edit' && transactionId
          ? transactionsService.getTransaction(activeGroup.id, transactionId)
          : Promise.resolve(null),
      ]);

      setCategories(categoryData);

      if (transactionData) {
        setTransaction(transactionData);
        setType(transactionData.type);
        setAmount(transactionData.amount);
        setDescription(transactionData.description ?? '');
        setDate(transactionData.date.slice(0, 10));
        setCategoryId(transactionData.categoryId ?? '');
        setIsPrivate(transactionData.isPrivate);
      } else {
        const defaultCategory = categoryData.find((category) => category.type === 'expense');
        setCategoryId(defaultCategory?.id ?? '');
      }
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setIsLoading(false);
    }
  }, [activeGroup, mode, transactionId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (!filteredCategories.some((category) => category.id === categoryId)) {
      setCategoryId(filteredCategories[0]?.id ?? '');
    }
  }, [categoryId, filteredCategories]);

  const validate = () => {
    const parsedAmount = Number(amount.replace(',', '.'));

    if (!activeGroup) {
      return 'Nenhum grupo selecionado.';
    }

    if (!parsedAmount || parsedAmount <= 0) {
      return 'Informe um valor maior que zero.';
    }

    if (!description.trim()) {
      return 'Informe uma descricao.';
    }

    if (!date.trim()) {
      return 'Informe a data.';
    }

    if (!categoryId) {
      return 'Selecione uma categoria.';
    }

    return '';
  };

  const handleSave = async () => {
    const validationError = validate();

    if (validationError || !activeGroup) {
      setError(validationError);
      return;
    }

    setError('');
    setIsSaving(true);

    const parsedAmount = Number(amount.replace(',', '.'));

    try {
      if (mode === 'edit' && transactionId) {
        await updateTransaction(activeGroup.id, transactionId, {
          amount: parsedAmount,
          categoryId,
          description: description.trim(),
          date,
        });
      } else {
        await createTransaction(activeGroup.id, {
          type,
          amount: parsedAmount,
          categoryId,
          description: description.trim(),
          date,
          isPrivate,
        });
      }

      onSaved();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <LoadingState message="Carregando transacao..." />;
  }

  return (
    <Screen>
      <Pressable accessibilityRole="button" onPress={onBack}>
        <Text style={styles.backText}>Voltar</Text>
      </Pressable>

      <Text style={styles.title}>{mode === 'edit' ? 'Editar transacao' : 'Nova transacao'}</Text>

      <View style={styles.segment}>
        {transactionTypes.map((item) => (
          <Pressable
            accessibilityRole="button"
            disabled={mode === 'edit'}
            key={item.value}
            onPress={() => setType(item.value)}
            style={[styles.segmentButton, type === item.value && styles.segmentButtonActive]}
          >
            <Text style={[styles.segmentText, type === item.value && styles.segmentTextActive]}>
              {item.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {!activeGroup ? (
        <EmptyState
          description="Selecione ou crie um grupo antes de registrar uma movimentacao."
          title="Nenhum grupo ativo"
        />
      ) : null}

      {activeGroup ? (
        <Card style={styles.form}>
          <Input
            label="Valor"
            keyboardType="decimal-pad"
            onChangeText={setAmount}
            placeholder="0,00"
            style={styles.amountInput}
            value={amount}
          />
          <Input
            label="Descricao"
            onChangeText={setDescription}
            placeholder="Descricao"
            value={description}
          />
          <Input label="Data" onChangeText={setDate} placeholder="AAAA-MM-DD" value={date} />

          {!filteredCategories.length ? (
            <EmptyState
              description="Nenhuma categoria disponivel. Crie categorias padrao no backend ou aguarde o proximo passo."
              title="Sem categorias"
            />
          ) : null}

          <View style={styles.categoryGrid}>
            {filteredCategories.map((category) => (
              <Pressable
                accessibilityRole="button"
                key={category.id}
                onPress={() => setCategoryId(category.id)}
                style={[
                  styles.categoryButton,
                  categoryId === category.id && styles.categoryButtonActive,
                ]}
              >
                <Text
                  numberOfLines={1}
                  style={[
                    styles.categoryText,
                    categoryId === category.id && styles.categoryTextActive,
                  ]}
                >
                  {category.name}
                </Text>
              </Pressable>
            ))}
          </View>

          {mode === 'create' ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => setIsPrivate((current) => !current)}
              style={styles.toggle}
            >
              <View style={[styles.checkbox, isPrivate && styles.checkboxActive]} />
              <Text style={styles.toggleText}>
                {isPrivate ? 'Privada' : 'Compartilhada com o grupo'}
              </Text>
            </Pressable>
          ) : null}

          {transaction && mode === 'edit' ? (
            <Text style={styles.hint}>
              O tipo e a privacidade ficam fixos nesta edicao inicial.
            </Text>
          ) : null}

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Pressable
            accessibilityRole="button"
            disabled={isSaving}
            onPress={handleSave}
            style={({ pressed }) => [styles.saveButton, (pressed || isSaving) && styles.pressed]}
          >
            {isSaving ? (
              <ActivityIndicator color={colors.text.inverted} />
            ) : (
              <Text style={styles.saveButtonText}>Salvar</Text>
            )}
          </Pressable>
        </Card>
      ) : null}
    </Screen>
  );
};

const styles = StyleSheet.create({
  backText: {
    ...typography.button,
    color: colors.brand.accent,
    fontSize: 14,
    letterSpacing: 0,
  },
  title: {
    ...typography.title,
    color: colors.text.primary,
    fontSize: 30,
    lineHeight: 36,
    letterSpacing: 0,
  },
  segment: {
    flexDirection: 'row',
    gap: 8,
  },
  segmentButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.neutral.light,
    backgroundColor: colors.neutral.white,
  },
  segmentButtonActive: {
    borderColor: colors.brand.primary,
    backgroundColor: colors.brand.primary,
  },
  segmentText: {
    ...typography.button,
    color: colors.text.secondary,
    fontSize: 13,
    letterSpacing: 0,
  },
  segmentTextActive: {
    color: colors.text.inverted,
  },
  form: {
    gap: 14,
  },
  amountInput: {
    minHeight: 68,
    fontSize: 28,
    fontWeight: '700',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    maxWidth: '48%',
    minHeight: 42,
    justifyContent: 'center',
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.neutral.light,
    borderRadius: 13,
    backgroundColor: colors.neutral.white,
  },
  categoryButtonActive: {
    borderColor: colors.brand.accent,
    backgroundColor: '#EEF3FF',
  },
  categoryText: {
    ...typography.button,
    color: colors.text.secondary,
    fontSize: 13,
    letterSpacing: 0,
  },
  categoryTextActive: {
    color: colors.brand.accent,
  },
  toggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 42,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 1,
    borderColor: colors.neutral.light,
    borderRadius: 7,
    backgroundColor: colors.neutral.white,
  },
  checkboxActive: {
    borderColor: colors.brand.primary,
    backgroundColor: colors.brand.primary,
  },
  toggleText: {
    ...typography.body,
    color: colors.text.primary,
    fontSize: 14,
    letterSpacing: 0,
  },
  hint: {
    ...typography.body,
    color: colors.text.secondary,
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: 0,
  },
  error: {
    ...typography.body,
    color: colors.feedback.danger,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0,
  },
  saveButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
    borderRadius: 16,
    backgroundColor: colors.brand.primary,
  },
  saveButtonText: {
    ...typography.button,
    color: colors.text.inverted,
    fontSize: 16,
    letterSpacing: 0,
  },
  pressed: {
    opacity: 0.82,
  },
});
