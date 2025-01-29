import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/lib/supabase/client';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
  order_id: string;
  read: boolean;
  sender_type: 'customer' | 'florist';
}

interface Chat {
  order_id: string;
  customer_name: string;
  last_message: string;
  unread_count: number;
  last_updated: string;
}

export function CustomerMessages({ floristId }: { floristId: string }) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadChats();
    // Subscribe to new messages
    const subscription = supabase
      .channel('messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `florist_id=eq.${floristId}`
      }, (payload) => {
        handleNewMessage(payload.new as Message);
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (selectedChat) {
      loadMessages(selectedChat);
      markMessagesAsRead(selectedChat);
    }
  }, [selectedChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadChats = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('order_messages')
        .select(`
          order_id,
          orders (
            customer_name,
            created_at
          ),
          messages (
            content,
            created_at,
            read
          )
        `)
        .eq('florist_id', floristId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedChats = data.map(chat => ({
        order_id: chat.order_id,
        customer_name: chat.orders.customer_name,
        last_message: chat.messages[0]?.content || '',
        unread_count: chat.messages.filter(m => !m.read).length,
        last_updated: chat.messages[0]?.created_at || chat.orders.created_at
      }));

      setChats(formattedChats);
    } catch (error) {
      console.error('Error loading chats:', error);
      toast.error('Failed to load conversations');
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async (orderId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast.error('Failed to load messages');
    }
  };

  const markMessagesAsRead = async (orderId: string) => {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ read: true })
        .eq('order_id', orderId)
        .eq('sender_type', 'customer');

      if (error) throw error;
      
      // Update local state
      setChats(current =>
        current.map(chat =>
          chat.order_id === orderId ? { ...chat, unread_count: 0 } : chat
        )
      );
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const handleNewMessage = (message: Message) => {
    if (message.order_id === selectedChat) {
      setMessages(prev => [...prev, message]);
    }
    updateChatList(message);
  };

  const updateChatList = (message: Message) => {
    setChats(current =>
      current.map(chat =>
        chat.order_id === message.order_id
          ? {
              ...chat,
              last_message: message.content,
              last_updated: message.created_at,
              unread_count: message.sender_type === 'customer' 
                ? chat.unread_count + 1 
                : chat.unread_count
            }
          : chat
      )
    );
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return;

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          order_id: selectedChat,
          content: newMessage.trim(),
          sender_id: floristId,
          sender_type: 'florist',
          read: false
        })
        .select()
        .single();

      if (error) throw error;

      setMessages(prev => [...prev, data]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="p-6 h-[calc(100vh-4rem)]">
      <div className="grid grid-cols-12 gap-6 h-full">
        {/* Chat List */}
        <Card className="col-span-4 p-4">
          <h2 className="font-medium mb-4">Conversations</h2>
          <ScrollArea className="h-[calc(100vh-8rem)]">
            <div className="space-y-2">
              {chats.map(chat => (
                <div
                  key={chat.order_id}
                  className={`p-3 rounded-lg cursor-pointer hover:bg-muted ${
                    selectedChat === chat.order_id ? 'bg-muted' : ''
                  }`}
                  onClick={() => setSelectedChat(chat.order_id)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{chat.customer_name}</h3>
                      <p className="text-sm text-muted-foreground truncate">
                        {chat.last_message}
                      </p>
                    </div>
                    {chat.unread_count > 0 && (
                      <span className="bg-primary text-primary-foreground px-2 py-1 rounded-full text-xs">
                        {chat.unread_count}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {format(new Date(chat.last_updated), 'MMM d, h:mm a')}
                  </p>
                </div>
              ))}
            </div>
          </ScrollArea>
        </Card>

        {/* Messages */}
        <Card className="col-span-8 p-4 flex flex-col">
          {selectedChat ? (
            <>
              <ScrollArea className="flex-1 mb-4">
                <div className="space-y-4">
                  {messages.map(message => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.sender_type === 'florist' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-[70%] p-3 rounded-lg ${
                          message.sender_type === 'florist'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <p>{message.content}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {format(new Date(message.created_at), 'h:mm a')}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
              <div className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type your message..."
                />
                <Button onClick={sendMessage}>Send</Button>
              </div>
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              Select a conversation to start messaging
            </div>
          )}
        </Card>
      </div>
    </div>
  );
} 