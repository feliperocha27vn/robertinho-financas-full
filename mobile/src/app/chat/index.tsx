import { Stack, useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import React, { useRef, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { useSendWebhookMessage } from '../../api/useSendWebhookMessage';
import { ChatInputBlock } from '../../components/chat/ChatInputBlock';
import { MessageBlock, MessageProps } from '../../components/chat/MessageBlock';

const INITIAL_MESSAGES: MessageProps[] = [
    {
        id: '1',
        role: 'ai',
        content: 'E aí! Sou o Robertinho, seu parceiro nas finanças. O que manda hoje?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
];

export default function ChatScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [messages, setMessages] = useState<MessageProps[]>(INITIAL_MESSAGES);
    const flatListRef = useRef<FlatList>(null);
    const { send, loading } = useSendWebhookMessage();

    const handleSend = async (text: string) => {
        const userMsg: MessageProps = {
            id: Date.now().toString(),
            role: 'user',
            content: text,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        
        // Use functional state update to prepend the message (since FlatList is inverted)
        setMessages(prev => [userMsg, ...prev]);

        try {
            const aiResponse = await send(text);
            const aiMsg: MessageProps = {
                id: (Date.now() + 1).toString(),
                role: 'ai',
                content: aiResponse.message,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setMessages(prev => [aiMsg, ...prev]);
        } catch (error) {
            const errorMsg: MessageProps = {
                id: (Date.now() + 1).toString(),
                role: 'ai',
                content: 'Ops, tive um problema de comunicação no momento. Pode tentar de novo?',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setMessages(prev => [errorMsg, ...prev]);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-zinc-950">
            <Stack.Screen 
                options={{
                    headerShown: true,
                    headerTitle: "ROBERTINHO",
                    headerTitleAlign: "center",
                    headerTitleStyle: {
                        fontWeight: '900',
                        fontSize: 20,
                        color: '#000',
                    },
                    headerStyle: {
                        backgroundColor: '#FBBF24', // amber-400
                    },
                    headerShadowVisible: false,
                    headerLeft: () => (
                        <Pressable 
                            onPress={() => router.back()} 
                            className="bg-zinc-950 p-2 border-2 border-black ml-4"
                            style={styles.backBtnStyle}
                        >
                            <ArrowLeft size={18} color="#FBBF24" strokeWidth={4} />
                        </Pressable>
                    )
                }}
            />
            
            <KeyboardAvoidingView 
                behavior="padding"
                className="flex-1"
                keyboardVerticalOffset={90}
            >
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <MessageBlock 
                            role={item.role} 
                            content={item.content} 
                            timestamp={item.timestamp} 
                        />
                    )}
                    inverted={true}
                    contentContainerStyle={{ paddingVertical: 20, gap: 8 }}
                    className="flex-1"
                    showsVerticalScrollIndicator={false}
                />

                <ChatInputBlock onSend={handleSend} />
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    backBtnStyle: {
        shadowColor: '#000',
        shadowOffset: { width: 3, height: 3 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 0,
    }
});
