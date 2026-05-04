import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  orderBy, 
  addDoc, 
  serverTimestamp, 
  doc, 
  getDoc,
  setDoc,
  updateDoc,
  limit
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, 
  User, 
  Search, 
  MoreVertical, 
  Smile, 
  Paperclip,
  Check,
  CheckCheck,
  ArrowLeft,
  MessagesSquare
} from 'lucide-react';

const Chat = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user, userData } = useAuth();
  
  const [rooms, setRooms] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [currentRoom, setCurrentRoom] = useState<any>(null);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch Rooms
  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'chatRooms'),
      where('participants', 'array-contains', user.uid),
      orderBy('lastMessageTime', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setRooms(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // Fetch Messages for current room
  useEffect(() => {
    if (!roomId) {
      setCurrentRoom(null);
      setMessages([]);
      return;
    }

    const roomRef = doc(db, 'chatRooms', roomId);
    getDoc(roomRef).then(snap => {
      if (snap.exists()) setCurrentRoom({ id: snap.id, ...snap.data() });
    });

    const mQ = query(
      collection(db, 'chatRooms', roomId, 'messages'),
      orderBy('createdAt', 'asc'),
      limit(100)
    );

    const unsubscribe = onSnapshot(mQ, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsubscribe();
  }, [roomId]);

  // Scroll to bottom
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !user || !roomId) return;

    const messageData = {
      text: inputText,
      senderId: user.uid,
      createdAt: serverTimestamp(),
    };

    setInputText('');

    try {
      await addDoc(collection(db, 'chatRooms', roomId, 'messages'), messageData);
      await updateDoc(doc(db, 'chatRooms', roomId), {
        lastMessage: inputText,
        lastMessageTime: serverTimestamp(),
        lastMessageSenderId: user.uid
      });

      // Notify the other participant
      if (currentRoom) {
        const otherParticipantId = currentRoom.participants.find((p: string) => p !== user.uid);
        if (otherParticipantId) {
          await addDoc(collection(db, 'users', otherParticipantId, 'notifications'), {
            userId: otherParticipantId,
            title: 'New Message! 💬',
            message: `You received a new message: "${inputText.length > 30 ? inputText.substring(0, 30) + '...' : inputText}"`,
            type: 'message',
            read: false,
            createdAt: serverTimestamp()
          });
        }
      }
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  return (
    <div className="mx-auto max-w-7xl h-[calc(100vh-64px)] p-4 sm:p-6 lg:p-8">
      <div className="flex h-full rounded-[2.5rem] bg-white shadow-2xl border border-neutral-100 overflow-hidden">
        
        {/* Room List */}
        <div className={`w-full md:w-80 lg:w-96 border-r border-neutral-100 flex flex-col ${roomId ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-6 border-b border-neutral-50 flex items-center justify-between">
            <h2 className="text-xl font-black text-neutral-900">Messages</h2>
            <button className="p-2 rounded-xl hover:bg-neutral-50"><MoreVertical size={18} /></button>
          </div>
          <div className="p-4 border-b border-neutral-50">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
              <input 
                type="text" 
                placeholder="Search conversations..." 
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-neutral-50 border-none text-sm focus:ring-2 focus:ring-orange-500/20"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading ? (
               <div className="p-8 text-center text-neutral-400">Loading chats...</div>
            ) : rooms.length === 0 ? (
               <div className="p-12 text-center">
                  <MessagesSquare size={48} className="mx-auto text-neutral-100 mb-4" />
                  <p className="text-sm font-bold text-neutral-400 uppercase tracking-widest">No chats found</p>
               </div>
            ) : (
              rooms.map((room) => {
                const otherParticipantId = room.participants.find((p: string) => p !== user?.uid);
                const isActive = roomId === room.id;
                return (
                  <button
                    key={room.id}
                    onClick={() => navigate(`/chat/${room.id}`)}
                    className={`w-full p-4 flex items-center gap-4 transition-all border-l-4 ${
                      isActive ? 'bg-orange-50/50 border-orange-600' : 'border-transparent hover:bg-neutral-50'
                    }`}
                  >
                    <div className="h-12 w-12 rounded-2xl bg-neutral-100 flex items-center justify-center shrink-0">
                       <User className="text-neutral-400" size={24} />
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-neutral-900 truncate">User {otherParticipantId?.slice(0, 5)}</span>
                        <span className="text-[10px] font-bold text-neutral-400 uppercase">
                          {room.lastMessageTime?.toDate?.().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || ''}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-500 truncate leading-tight">
                        {room.lastMessageSenderId === user?.uid && 'You: '}{room.lastMessage}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Message Area */}
        <div className={`flex-1 flex flex-col bg-neutral-50/30 ${!roomId ? 'hidden md:flex' : 'flex'}`}>
          {roomId ? (
            <>
              {/* Header */}
              <div className="p-4 bg-white border-b border-neutral-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button onClick={() => navigate('/chat')} className="md:hidden p-2"><ArrowLeft size={18} /></button>
                  <div className="h-10 w-10 rounded-xl bg-neutral-100 flex items-center justify-center">
                     <User className="text-neutral-400" size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-neutral-900 text-sm">User {currentRoom?.participants.find((p: string) => p !== user?.uid)?.slice(0, 5)}</h3>
                    <div className="flex items-center gap-1.5">
                       <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                       <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Active Now</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                   <button className="p-2.5 rounded-xl hover:bg-neutral-50 text-neutral-500"><Search size={18} /></button>
                   <button className="p-2.5 rounded-xl hover:bg-neutral-50 text-neutral-500"><MoreVertical size={18} /></button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((msg, idx) => {
                   const isMe = msg.senderId === user?.uid;
                   return (
                     <motion.div 
                       key={msg.id}
                       initial={{ opacity: 0, y: 10, scale: 0.95 }}
                       animate={{ opacity: 1, y: 0, scale: 1 }}
                       className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                     >
                        <div className={`max-w-[70%] rounded-2xl p-4 shadow-sm ${
                          isMe ? 'bg-neutral-900 text-white rounded-tr-none' : 'bg-white text-neutral-900 rounded-tl-none border border-neutral-100'
                        }`}>
                           <p className="text-sm leading-relaxed">{msg.text}</p>
                           <div className={`mt-2 flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest ${isMe ? 'text-white/40' : 'text-neutral-400'}`}>
                              {msg.createdAt?.toDate?.().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              {isMe && <CheckCheck size={12} />}
                           </div>
                        </div>
                     </motion.div>
                   );
                })}
                <div ref={scrollRef} />
              </div>

              {/* Input */}
              <div className="p-6 bg-white border-t border-neutral-100">
                <form onSubmit={handleSendMessage} className="flex items-center gap-4 bg-neutral-50 p-2 rounded-[1.5rem] border border-neutral-100 shadow-inner focus-within:ring-2 focus-within:ring-orange-500/10 transition-all">
                  <button type="button" className="p-3 text-neutral-400 hover:text-neutral-900 transition-colors"><Smile size={20}/></button>
                  <input 
                    type="text" 
                    placeholder="Type your message..." 
                    className="flex-1 bg-transparent border-none py-2 text-sm focus:ring-0"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                  />
                  <button type="button" className="p-3 text-neutral-400 hover:text-neutral-900 transition-colors"><Paperclip size={20}/></button>
                  <button 
                    type="submit" 
                    className="h-10 w-10 flex items-center justify-center rounded-xl bg-orange-600 text-white shadow-lg hover:bg-orange-500 hover:scale-105 transition-all shadow-orange-600/20 active:scale-95"
                  >
                    <Send size={18} />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
               <div className="h-24 w-24 bg-white rounded-[2rem] shadow-xl flex items-center justify-center text-orange-600 mb-8 border border-neutral-100">
                  <MessagesSquare size={40} />
               </div>
               <h2 className="text-2xl font-black text-neutral-900 mb-4 italic">Select a conversation</h2>
               <p className="max-w-xs text-neutral-500 text-sm">Pick a chat from the left or start a new one from a task listing.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;
