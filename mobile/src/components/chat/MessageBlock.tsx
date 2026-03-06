import { Motion } from '@legendapp/motion';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export type MessageRole = 'user' | 'ai';

export interface MessageProps {
    id: string;
    role: MessageRole;
    content: string;
    timestamp: string;
}

export function MessageBlock({ role, content, timestamp }: Omit<MessageProps, 'id'>) {
    const isUser = role === 'user';

    return (
        <Motion.View 
            initial={{ opacity: 0, y: 30, rotate: isUser ? '1deg' : '-1deg' }}
            animate={{ opacity: 1, y: 0, rotate: '0deg' }}
            transition={{ type: "spring", damping: 18, stiffness: 200, mass: 1 }}
            className={`w-full flex-row my-3 px-6 ${isUser ? 'justify-end' : 'justify-start'}`}
        >
            <View 
                className={`max-w-[88%] px-6 py-5 border-2 border-black ${
                    isUser ? 'bg-zinc-900 shadow-none' : 'bg-amber-400'
                }`}
                style={[
                    styles.brutalBlock,
                    !isUser && styles.aiShadow
                ]}
            >
                <Text 
                    className={`text-[19px] font-black leading-7 tracking-tight ${
                        isUser ? 'text-white' : 'text-black'
                    }`}
                >
                    {content}
                </Text>
                
                <View className={`mt-3 flex-row items-center ${isUser ? 'justify-end' : 'justify-start'}`}>
                    <View className={`h-[2px] w-4 mr-2 ${isUser ? 'bg-zinc-700' : 'bg-black/20'}`} />
                    <Text 
                        className={`text-[10px] font-black uppercase tracking-[2px] ${
                            isUser ? 'text-zinc-500' : 'text-black/40'
                        }`}
                    >
                        {timestamp}
                    </Text>
                </View>
            </View>
        </Motion.View>
    );
}

const styles = StyleSheet.create({
    brutalBlock: {
        borderRadius: 2,
    },
    aiShadow: {
        shadowColor: '#FBBF24',
        shadowOffset: { width: 6, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 0,
        elevation: 0,
    }
});

