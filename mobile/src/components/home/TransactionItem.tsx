import { Car, CreditCard, Home, Package, ShoppingBag } from 'lucide-react-native';
import React from 'react';
import { Text, View } from 'react-native';
import { Transaction } from '../../api/get-home-data';

const categoryIcons: Record<string, React.ReactNode> = {
  TRANSPORT: <Car size={20} color="#FFF" />,
  RESIDENCE: <Home size={20} color="#FFF" />,
  STUDIES: <Package size={20} color="#FFF" />,
  CREDIT: <CreditCard size={20} color="#FFF" />,
  OTHERS: <ShoppingBag size={20} color="#FFF" />,
};

export function TransactionItem({ description, amount, category, date }: Omit<Transaction, 'id'>) {
  const formattedDate = new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const formattedAmount = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(amount);

  return (
    <View className="flex-row items-center justify-between bg-zinc-900 border border-white/5 rounded-3xl p-4 mb-3">
      <View className="flex-row items-center gap-4">
        <View className="bg-zinc-800 p-3 rounded-2xl">
          {categoryIcons[category] || <ShoppingBag size={20} color="#FFF" />}
        </View>
        <View>
          <Text className="text-white font-semibold text-base">{description}</Text>
          <Text className="text-zinc-500 text-xs mt-1">{formattedDate}</Text>
        </View>
      </View>

      <View className="items-end">
        <Text className="text-red-400 font-bold text-base">-{formattedAmount}</Text>
      </View>
    </View>
  );
}
