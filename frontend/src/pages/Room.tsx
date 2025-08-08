import { useParams, useNavigate } from "react-router";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/supabase-client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, ArrowLeft, Users, Copy } from "lucide-react";
import { toast } from "sonner";

const Room = () => {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const [messages, setMessages] = useState<any[]>([]);
    const [message, setMessage] = useState('');
    const [currentUser, setCurrentUser] = useState<any>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [roomName, setRoomName] = useState('');

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async () => {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
            console.error('No session found');
            return;
        }

        const userId = session.user.id;
        console.log('Current User ID:', userId);

        const { data, error } = await supabase.from('messages').insert({ content: message, room_id: roomId, user_id: userId }).select().single();

        if (error) {
            console.error('Error sending message:', error);
        } else {
            setMessage('');
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (message.trim()) {
                handleSendMessage();
            }
        }
    };

    useEffect(() => {
        // Get current user info
        const getCurrentUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                setCurrentUser(session.user);
            }
        };
        getCurrentUser();

        const fetchRoomName = async () => {
            const { data, error } = await supabase
                .from('rooms').select('name').eq('id', roomId).single();
            if (data) setRoomName(data.name);
            if (error) console.error(error.message);
        };
        fetchRoomName();

        fetchMessages();

        const subscription = supabase
            .channel('public:messages')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'messages' },
                (payload) => {
                    console.log('Change received!', payload);
                    if (payload.eventType === 'INSERT') {
                        setMessages((prev) => [...prev, payload.new]);
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(subscription);
        };
    }, []);

    const fetchMessages = async () => {
        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .eq('room_id', roomId)
            .order('created_at', { ascending: true });

        if (data) setMessages(data);
        if (error) console.error(error.message);
    };

    const formatTime = (timestamp: string) => {
        return new Date(timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const isOwnMessage = (messageUserId: string) => {
        return currentUser?.id === messageUserId;
    };

    const copyRoomId = async () => {
        try {
            await navigator.clipboard.writeText(roomId || '');
            toast.success('Room ID copied to clipboard');
        } catch (err) {
            console.error('Failed to copy room ID:', err);
            toast.error('Failed to copy room ID');
        }
    };

    return (
        <div className="flex flex-col h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-4 md:px-6 md:py-4 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate('/')}
                        className="p-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <div className="flex flex-col items-start space-x-2">
                            <h1 className="text-xl font-semibold text-gray-900">{roomName}</h1>
                            <div className="flex items-center space-x-1">
                                <span className="text-sm text-gray-500 font-mono">#{roomId}</span>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={copyRoomId}
                                    className="p-1 h-6 w-6"
                                    title="Copy room ID"
                                >
                                    <Copy className="h-3 w-3" />
                                </Button>
                            </div>
                        </div>
                        <p className="text-sm text-gray-500 flex items-center">
                            <Users className="h-4 w-4 mr-1" />
                            {messages.length > 0 ? `${messages.length} messages` : 'No messages yet'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                            <div className="text-gray-400 text-6xl mb-4">💬</div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">{roomName} #{roomId}</h3>
                            <p className="text-gray-500">Start the conversation by sending a message!</p>
                        </div>
                    </div>
                ) : (
                    messages.map((message) => (
                        <div
                            key={message.id}
                            className={`flex ${isOwnMessage(message.user_id) ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`max-w-xs lg:max-w-md ${isOwnMessage(message.user_id) ? 'order-2' : 'order-1'}`}>
                                <div className={`rounded-2xl px-4 py-2 ${isOwnMessage(message.user_id)
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-white text-gray-900 border border-gray-200'
                                    }`}>
                                    <p className="text-sm">{message.content}</p>
                                </div>
                                <div className={`text-xs text-gray-500 mt-1 ${isOwnMessage(message.user_id) ? 'text-right' : 'text-left'
                                    }`}>
                                    {formatTime(message.created_at)}
                                </div>
                            </div>
                            {!isOwnMessage(message.user_id) && (
                                <div className="order-2 ml-2">
                                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-sm font-medium text-gray-600">
                                        {message.user_id?.slice(0, 2).toUpperCase() || 'U'}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="bg-white border-t border-gray-200 py-2 md:px-6 md:py-4">
                <div className="flex items-center space-x-3">
                    <div className="flex-1 relative">
                        <Input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Type your message..."
                            className="pr-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>
                    <Button
                        onClick={handleSendMessage}
                        disabled={!message.trim()}
                        className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                        <Send className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default Room;