import { LinearGradient } from 'expo-linear-gradient';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface BalanceCardProps {
  balance: number;
  income: number;
  expense: number;
}

export function BalanceCard({ balance, income, expense }: BalanceCardProps) {
  return (
    <LinearGradient
      colors={['#FCD34D', '#F59E0B']} // Amber 300 to Amber 500
      style={styles.card}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View className="mb-6">
        <Text className="text-black/60 text-sm font-bold uppercase tracking-wider">Saldo Disponível</Text>
        <Text className="text-black text-4xl font-extrabold mt-1">
          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(balance)}
        </Text>
        <Text className="text-black/40 text-[10px] mt-1 font-bold uppercase">Atualizado recentemente</Text>
      </View>

      <View className="flex-row items-center justify-between bg-black/10 rounded-2xl p-4 border border-black/5">
        <View className="flex-row items-center gap-3">
          <View className="bg-black/20 p-2 rounded-full">
            <ArrowUpRight size={20} color="#000" />
          </View>
          <View>
            <Text className="text-black/60 text-[10px] font-bold uppercase">Receitas</Text>
            <Text className="text-black font-extrabold">
               {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(income)}
            </Text>
          </View>
        </View>

        <View className="w-[1px] h-8 bg-black/20" />

        <View className="flex-row items-center gap-3">
          <View className="bg-black/20 p-2 rounded-full">
            <ArrowDownRight size={20} color="#000" />
          </View>
          <View>
            <Text className="text-black/60 text-[10px] font-bold uppercase">Despesas</Text>
            <Text className="text-black font-extrabold">
               {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(expense)}
            </Text>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    padding: 24,
    borderWidth: 2,
    borderColor: '#000',
    shadowColor: '#000',
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
  },
});
