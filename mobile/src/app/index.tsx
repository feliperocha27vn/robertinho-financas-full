import { useQuery } from '@tanstack/react-query';
import { Link, useFocusEffect } from 'expo-router';
import { Home as HomeIcon, MessageSquare, User } from 'lucide-react-native';
import React, { useCallback } from 'react';
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getHomeData } from '../api/get-home-data';
import { BalanceCard } from '../components/home/BalanceCard';
import { TransactionItem } from '../components/home/TransactionItem';
import Skeleton from '../components/Skeleton';

export default function Index() {
    const { data: homeData, isLoading, refetch } = useQuery({
        queryKey: ['homeData'],
        queryFn: getHomeData,
        refetchInterval: 5000 
    });

    useFocusEffect(
        useCallback(() => {
            refetch();
        }, [refetch])
    );

    return (
        <View className="flex-1 bg-black">
            <SafeAreaView className="flex-1 px-5" edges={['top']}>
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                    {/* Header */}
                    <View className="flex-row items-center justify-between mt-4 mb-8">
                        <View className="flex-row items-center gap-3">
                            <Image 
                                source={{ uri: 'https://lh3.googleusercontent.com/a/ACg8ocJyqY96tzFb0G0j12e0tIqd9NtqMuoksveZ4iVpzHsy695BgzLJ=s260-c-no' }} 
                                className="w-12 h-12 rounded-full border border-white/10"
                            />
                            <View>
                                <Text className="text-zinc-500 text-xs font-medium">Bem-vindo de volta</Text>
                                <Text className="text-white text-lg font-bold">Felipe Rocha</Text>
                            </View>
                        </View>
                    </View>

                    {/* Balance Section */}
                    {isLoading ? (
                        <Skeleton className="w-full h-52 rounded-[32px]" />
                    ) : (
                        <BalanceCard 
                            balance={homeData?.balance || 0}
                            income={homeData?.income || 0}
                            expense={homeData?.expense || 0}
                        />
                    )}

                    {/* Recent Transactions */}
                    <View className="mt-10 mb-5 flex-row items-center justify-between">
                        <Text className="text-white text-xl font-bold">Transações Recentes</Text>
                    </View>

                    {isLoading ? (
                        <View className="gap-y-3">
                            <Skeleton className="w-full h-20 rounded-3xl" />
                            <Skeleton className="w-full h-20 rounded-3xl" />
                            <Skeleton className="w-full h-20 rounded-3xl" />
                        </View>
                    ) : homeData?.recentTransactions && homeData.recentTransactions.length > 0 ? (
                        homeData.recentTransactions.map((tx) => (
                            <TransactionItem 
                                key={tx.id}
                                description={tx.description}
                                amount={tx.amount}
                                category={tx.category}
                                date={tx.date}
                            />
                        ))
                    ) : (
                        <View className="bg-zinc-900/50 p-8 rounded-[32px] border border-white/5 items-center justify-center">
                            <Text className="text-zinc-500 text-center font-medium">
                                Nenhuma despesa variável recente encontrada.
                            </Text>
                            <Text className="text-zinc-700 text-xs mt-2 text-center">
                                Suas despesas do dia a dia aparecerão aqui.
                            </Text>
                        </View>
                    )}
                </ScrollView>
            </SafeAreaView>

            {/* Custom Bottom Navigation Bar */}
            <View className="absolute bottom-10 left-6 right-6 h-20 bg-zinc-900/90 rounded-[35px] border border-white/5 flex-row items-center justify-around px-8 shadow-2xl">
                <Pressable className="items-center opacity-100">
                    <HomeIcon size={24} color="#FBBF24" />
                    <Text className="text-amber-400 text-[10px] mt-1 font-bold">Início</Text>
                </Pressable>

                {/* Robertinho FAB */}
                <Link href="/chat" asChild>
                    <Pressable className="bg-amber-400 w-16 h-16 rounded-full items-center justify-center -mt-12 border-4 border-black shadow-lg shadow-amber-400/20">
                        <MessageSquare size={28} color="#000" strokeWidth={2.5} />
                    </Pressable>
                </Link>

                <Pressable className="items-center opacity-40">
                    <User size={24} color="#FFF" />
                    <Text className="text-white text-[10px] mt-1 font-bold">Perfil</Text>
                </Pressable>
            </View>
        </View>
    );
}