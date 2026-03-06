import { Motion } from '@legendapp/motion';
import { SendHorizontal } from 'lucide-react-native';
import React, { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

interface ChatInputBlockProps {
    onSend: (message: string) => void;
}

export function ChatInputBlock({ onSend }: ChatInputBlockProps) {
    const [text, setText] = useState('');
    const isActive = text.trim().length > 0;

    const handleSend = () => {
        if (isActive) {
            onSend(text.trim());
            setText('');
        }
    };

    return (
        <View className="flex-row items-end gap-x-3 px-5 py-5 bg-zinc-900 border-t-2 border-black" style={styles.containerShadow}>
            <View className="flex-1 bg-black border-2 border-white/5" style={styles.inputShadow}>
                <TextInput
                    className={`w-full min-h-[52px] max-h-[120px] px-5 py-3 text-lg font-bold tracking-tight ${isActive ? 'text-amber-400' : 'text-zinc-400'}`}
                    multiline
                    placeholder="Mande sua mensagem..."
                    placeholderTextColor="#3f3f46" // zinc-700
                    value={text}
                    onChangeText={setText}
                    cursorColor="#FBBF24"
                />
            </View>
            
            <Motion.View 
                animate={{
                    backgroundColor: isActive ? '#FFD60A' : '#18181b', 
                    scale: isActive ? 1.08 : 1,
                    borderColor: isActive ? '#000000' : '#27272a',
                    shadowOpacity: isActive ? 1 : 0,
                }}
                transition={{ type: 'spring', damping: 15, stiffness: 400 }}
                className="border-2 rounded-xl overflow-hidden"
                style={styles.glowEffect}
            >
                <Pressable 
                    onPress={handleSend}
                    disabled={!isActive}
                    className="h-[52px] px-6 items-center justify-center"
                >
                    <SendHorizontal 
                        size={22} 
                        color={isActive ? "#000000" : "#52525b"} 
                        strokeWidth={3} 
                    />
                </Pressable>
            </Motion.View>
        </View>
    );
}

const styles = StyleSheet.create({
    containerShadow: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 20,
    },
    inputShadow: {
        borderRadius: 4,
    },
    glowEffect: {
        shadowColor: '#FFD60A',
        shadowOffset: { width: 0, height: 0 },
        shadowRadius: 15,
        elevation: 10,
    },
    btnShadow: {
        borderRadius: 4,
        elevation: 0,
    }
});
