import { Send } from 'lucide-react-native';
import { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSendWebhookMessage } from '../api/useSendWebhookMessage';

type Message = { id: string; text: string; fromMe?: boolean; timestamp?: number };

export default function Index() {
    const [messages, setMessages] = useState<Message[]>([
        { id: '1', text: 'Olá! Eu sou o Robertinho, estou aqui para controlar suas finanças.', fromMe: false, timestamp: Date.now() }
    ]);
    const [input, setInput] = useState('');
    const [inputHeight, setInputHeight] = useState<number>(40);
    const scrollRef = useRef<ScrollView | null>(null);
    const { send: sendToWebhook } = useSendWebhookMessage()

    function pushMessage(msg: Message) {
        setMessages(prev => {
            const next = [...prev, msg];
            // Auto-scroll after the new message renders
            setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
            return next;
        });
    }

    async function handleSend() {
        const text = input.trim();
        if (!text) return;
        const newMsg: Message = { id: Date.now().toString(), text, fromMe: true, timestamp: Date.now() };
        pushMessage(newMsg);
        setInput('');

        try {
            const res = await sendToWebhook(text)
            const replyText = res?.message ?? `Recebi: ${text}`
            const bot: Message = { id: (Date.now() + 1).toString(), text: replyText, fromMe: false, timestamp: Date.now() }
            pushMessage(bot)
        } catch (err) {
            const botErr: Message = { id: (Date.now() + 2).toString(), text: 'Erro ao enviar para API', fromMe: false, timestamp: Date.now() }
            pushMessage(botErr)
            console.error('Erro no envio para webhook:', err)
        }
    }

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                style={styles.keyboard}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <View style={styles.header}>
                    <Text style={styles.title}>Robertinho</Text>
                </View>

                <ScrollView ref={scrollRef} contentContainerStyle={styles.messagesContainer}>
                    {messages.map((m) => (
                        <View key={m.id} style={[styles.bubble, m.fromMe ? styles.bubbleRight : styles.bubbleLeft]}>
                            <Text style={[styles.bubbleText, m.fromMe ? styles.textRight : styles.textLeft]}>{m.text}</Text>
                        </View>
                    ))}
                </ScrollView>

                <View style={styles.inputWrapper}>
                    <View style={styles.inputInner}>
                        <TextInput
                            placeholder="Digite sua mensagem"
                            value={input}
                            onChangeText={setInput}
                            style={[styles.input, { height: Math.max(40, inputHeight) }]}
                            multiline
                            blurOnSubmit={false}
                            onContentSizeChange={(e) => {
                                const h = e.nativeEvent.contentSize.height
                                // limit the height so it doesn't grow indefinitely
                                setInputHeight(Math.min(140, Math.max(40, h)))
                            }}
                        />
                        <TouchableOpacity onPress={handleSend} style={styles.sendButton} accessibilityLabel="Enviar mensagem">
                            <Send color="#fff" />
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    keyboard: { flex: 1 },
    header: { padding: 20, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#e6e6e6' },
    title: { fontSize: 20, fontWeight: '600', color: '#111' },
    messagesContainer: { paddingHorizontal: 16, paddingVertical: 12 },
    bubble: { maxWidth: '80%', marginVertical: 6, padding: 10, borderRadius: 12 },
    bubbleLeft: { backgroundColor: '#f1f1f1', alignSelf: 'flex-start', borderTopLeftRadius: 4 },
    bubbleRight: { backgroundColor: '#0b93f6', alignSelf: 'flex-end', borderTopRightRadius: 4 },
    bubbleText: { fontSize: 16 },
    textLeft: { color: '#111' },
    textRight: { color: '#fff' },
    inputWrapper: { padding: 12, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#e6e6e6' },
    inputInner: { flexDirection: 'row', alignItems: 'flex-end', backgroundColor: '#fff', borderRadius: 8, borderWidth: 1, borderColor: '#ddd', paddingHorizontal: 8, paddingVertical: 6 },
    input: { flex: 1, paddingVertical: 6, paddingHorizontal: 8, fontSize: 16, minHeight: 40, maxHeight: 140 },
    sendButton: { backgroundColor: '#0b93f6', padding: 10, borderRadius: 6, marginLeft: 8 }
});