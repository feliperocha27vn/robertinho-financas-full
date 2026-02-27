import { useQuery } from '@tanstack/react-query';
import { DollarSign } from 'lucide-react-native';
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getAccountPayableNextMonth } from '../api/account-payable-next-month';
import Skeleton from '../components/Skeleton';

export default function Index() {
    const { data: totalPayableNextMonth, isLoading } = useQuery({
        queryKey: ['totalPayableNextMonth'],
        queryFn: getAccountPayableNextMonth
    });

    return (
        <SafeAreaView style={{ padding: 16, flex: 1, justifyContent: 'space-between' }}>
            <View className='bg-amber-300 gap-y-12 py-5 px-8 rounded-3xl'>
                <Text className='text-2xl'>
                    Contas a pagar até o dia 15
                </Text>
                <View className='flex-row items-center'>
                    <DollarSign size={40} color="#000" />
                    {isLoading ? (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <Skeleton className="h-8 w-28 rounded-md" />
                        </View>
                    ) : (
                        <Text className='text-[40px]'>
                            {totalPayableNextMonth?.totalAmountForPayByDayFifteen.toFixed(2)}
                        </Text>
                    )}
                </View>
            </View>
        </SafeAreaView>
    )
}