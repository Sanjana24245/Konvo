
import { useState, useEffect, useContext, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navbar from './NavBar';
import io from 'socket.io-client';
import EmojiPicker from 'emoji-picker-react';
import axios from 'axios';
const notificationSound = new Audio('/sounds/notification.mp3');
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Socket connection
const socket = io('http://localhost:5000');

export default function Chat() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [activeUser, setActiveUser] = useState(null);
  const [messages, setMessages] = useState({});
  const [newMessage, setNewMessage] = useState('');
  const [hasUserActivatedChat, setHasUserActivatedChat] = useState(false);
  const [promptUserId, setPromptUserId] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef(null);
  const [typingUser, setTypingUser] = useState(null);
  const typingTimeoutRef = useRef(null);
  const [uploadingFile, setUploadingFile] = useState(null);
  const [fileProgress, setFileProgress] = useState(0);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [incomingCall, setIncomingCall] = useState(null);
  const [lastMessages, setLastMessages] = useState({});
  const navigate = useNavigate();
  const [input, setInput] = useState("")
  const lastMessageRef = useRef(null);

  useEffect(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]); 

  useEffect(() => {
    if (user) {
      setLoading(false);
    } else {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
      }
    }

    setMessages({});

    const token = localStorage.getItem('token');
    if (!token) return;

    socket.emit('login', { token });

    socket.on('receive_message', (message) => {
      const { senderId, senderName, receiverId, receiverName, message: contentFromSocket, content, timestamp, file } = message;

      const actualContent = contentFromSocket ?? content ?? '[No content]';
      const otherUserId = senderId === user._id ? receiverId : senderId;

      setMessages((prev) => ({
        ...prev,
        [otherUserId]: [
          ...(prev[otherUserId] || []),
          { senderId, senderName, receiverId, receiverName, content: actualContent, timestamp, file },
        ],
      }));

      setLastMessages(prev => ({
        ...prev,
        [otherUserId]: {
          content: actualContent,
          timestamp,
          file,
        }
      }));

      if (senderId !== user._id) {
        if (!activeUser || activeUser._id !== senderId) {
          notificationSound.play().catch((err) => console.error("Sound play error", err));
          toast.info(`New message `, {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
          });

          setUnreadCounts((prev) => ({
            ...prev,
            [senderId]: (prev[senderId] || 0) + 1,
          }));
        }
      }

      scrollToBottom();
    });

    const handleTyping = ({ fromUserId, username }) => {
      if (activeUser && fromUserId === activeUser._id) {
        setTypingUser(username);
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
          setTypingUser(null);
        }, 2000);
      }
    };

    socket.on('user_typing', handleTyping);

    return () => {
      socket.off('receive_message');
      socket.off('user_typing', handleTyping);
    };
  }, [user, activeUser]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!activeUser || !user) return;

      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`/api/chat/messages/${activeUser._id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (Array.isArray(response.data) && response.data.length > 0) {
          setMessages((prev) => {
            const previousMessages = prev[activeUser._id] || [];
            const fetchedMessages = response.data || [];

            const merged = [...previousMessages, ...fetchedMessages];
            const unique = [];

            const seen = new Set();
            for (const msg of merged) {
              const key = `${msg.timestamp}-${msg.content || ''}-${msg?.file?.name || ''}`;
              if (!seen.has(key)) {
                seen.add(key);
                unique.push(msg);
              }
            }

            return {
              ...prev,
              [activeUser._id]: unique,
            };
          });
        }
      } catch (err) {
        console.error('Error fetching messages from DB:', err);
      }
    };

    fetchMessages();
  }, [activeUser, user]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!activeUser || !newMessage.trim()) return;

    const payload = {
      receiverId: activeUser._id,
      content: newMessage,
    };

    if (uploadingFile) {
      payload.file = {
        url: uploadingFile.url,
        name: uploadingFile.name,
        type: uploadingFile.type,
      };
    }

    setLastMessages(prev => ({
      ...prev,
      [activeUser._id]: {
        content: newMessage,
        timestamp: new Date(),
        file: uploadingFile || null,
      }
    }));

    socket.emit('sendMessage', payload);
    setNewMessage('');
    scrollToBottom();
  };

  const handleUserSelect = async (userObj) => {
    setActiveUser(userObj);
    setSelectedUsers((prev) => {
      const updated = prev.some((u) => u._id === userObj._id) ? prev : [...prev, { ...userObj }];
      localStorage.setItem('selectedUsers', JSON.stringify(updated));
      return updated;
    });

    setUnreadCounts((prev) => {
      const updated = { ...prev };
      delete updated[userObj._id];
      localStorage.setItem('unreadCounts', JSON.stringify(updated));
      return updated;
    });

    if (!hasUserActivatedChat) {
      if (!promptUserId) {
        setPromptUserId(userObj._id);
      } else if (promptUserId === userObj._id) {
        setHasUserActivatedChat(true);
      }
    }
  };

  const handleEmojiSelect = (emojiData) => {
    setNewMessage((prevMessage) => prevMessage + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    if (activeUser) {
      socket.emit('typing', {
        toUserId: activeUser._id,
        username: user.username,
      });
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !activeUser) return;

    setUploadingFile(file);
    setFileProgress(0);

    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('token');

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          setFileProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total));
        },
      };

      const response = await axios.post('http://localhost:5000/api/upload', formData, config);
      const fileUrl = response.data.url;

      const fileMessage = {
        senderId: user._id,
        receiverId: activeUser._id,
        content: '',
        timestamp: new Date(),
        file: {
          url: fileUrl,
          name: file.name,
          type: file.type,
        },
      };

      socket.emit('sendMessage', {
        receiverId: activeUser._id,
        content: '',
        file: fileMessage.file,
      });

      setMessages((prev) => {
        const updatedMessages = {
          ...prev,
          [activeUser._id]: [
            ...(prev[activeUser._id] || []),
            fileMessage,
          ],
        };
        localStorage.setItem('messages', JSON.stringify(updatedMessages));
        return updatedMessages;
      });

      scrollToBottom();
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setUploadingFile(null);
      setFileProgress(0);
    }
  };

  const handleCallUser = (userToCall) => {
    if (!user || !userToCall || !user._id || !userToCall._id) {
      toast.error("Cannot initiate call. Invalid user.");
      return;
    }

    const roomID = [user._id, userToCall._id].sort().join('_');

    socket.emit('call_user', {
      toUserId: userToCall._id,
      fromUserId: user._id,
      fromUsername: user.username,
      roomID,
    });

    toast.info(`Calling ${userToCall.username}...`);
  };

  useEffect(() => {
    socket.on('incoming_call', ({ fromUserId, fromUsername, roomID }) => {
      setIncomingCall({ fromUserId, fromUsername, roomID });
      toast.info(`Incoming call from ${fromUsername}`);
    });

    return () => {
      socket.off('incoming_call');
    };
  }, []);

  useEffect(() => {
    socket.on('call_accepted', ({ roomID }) => {
      toast.success('Call accepted. Joining...');
      navigate(`/VideoRoom/${roomID}`);
    });

    return () => {
      socket.off('call_accepted');
    };
  }, []);

  const fetchChatUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/chat/users', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const { chattedUsers, allUsers } = response.data;
      setSelectedUsers(chattedUsers);
    } catch (err) {
      console.error('Error fetching chat users:', err);
    }
  };

  useEffect(() => {
    if (user) fetchChatUsers();
  }, [user]);

  if (!user) return null;

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navbar onUserSelect={handleUserSelect} />

      <div className="flex flex-1 h-screen overflow-hidden">
        {/* Sidebar */}
        <div className="w-80 bg-white/10 backdrop-blur-xl border-r border-white/20 flex flex-col">
          {/* Sidebar Header */}
          <div className="p-6 border-b border-white/10">
            <h2 className="text-xl font-bold text-white flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                💬
              </div>
              Conversations
            </h2>
          </div>

          {/* Chat List */}
          <div className="flex-1 overflow-y-auto">
            {selectedUsers.length > 0 ? (
              <div className="p-2">
                {selectedUsers.map((u, index) => {
                  const lastMessage = lastMessages[u._id];
                  const isActive = activeUser?._id === u._id;
                  const isLast = index === selectedUsers.length - 1;
                  
                  return (
                    <div
                      key={u._id}
                      ref={isLast ? lastMessageRef : null}
                      className={`group cursor-pointer p-4 m-2 rounded-2xl transition-all duration-300 hover:scale-[1.02] hover:shadow-lg ${
                        isActive 
                          ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 shadow-xl' 
                          : 'bg-white/5 hover:bg-white/10 border border-transparent'
                      }`}
                      onClick={() => handleUserSelect(u)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          {/* Avatar */}
                          <div className="relative">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${
                              isActive ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-gradient-to-r from-gray-500 to-gray-600'
                            }`}>
                              {(u.username || "U").charAt(0).toUpperCase()}
                            </div>
                            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                          </div>

                          {/* User Info */}
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-white text-sm">
                              {u.username || "Unnamed User"}
                            </div>
                            <div className="flex items-center justify-between text-xs text-gray-300 mt-1">
                              <span className="truncate max-w-[140px]" title={
                                lastMessage?.content || lastMessage?.file?.name || ''
                              }>
                                {lastMessage?.content
                                  ? lastMessage.content
                                  : lastMessage?.file
                                  ? `📎 ${lastMessage.file.name}`
                                  : 'No messages yet'}
                              </span>
                              <span className="ml-2 text-nowrap opacity-70">
                                {lastMessage?.timestamp
                                  ? new Date(lastMessage.timestamp).toLocaleTimeString([], {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })
                                  : ''}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Unread Badge */}
                        {unreadCounts[u._id] > 0 && !isActive && (
                          <div className="animate-pulse bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full px-2 py-1 text-xs font-bold min-w-[20px] text-center">
                            {unreadCounts[u._id]}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 p-6">
                <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-4">
                  💭
                </div>
                <p className="text-center">No conversations yet</p>
                <p className="text-sm opacity-70 text-center mt-2">Start a conversation from the navbar</p>
              </div>
            )}
          </div>
        </div>

        {/* Chat Window */}
        <div className="flex-1 flex flex-col bg-white/5 backdrop-blur-sm">
          {!activeUser ? (
            <div className="flex-1 flex flex-col items-center justify-center text-white">
              <div className="w-32 h-32 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 flex items-center justify-center mb-8 animate-pulse">
                <span className="text-6xl">💬</span>
              </div>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
                Welcome to Konvo
              </h2>
              <p className="text-gray-300 text-lg">Select a conversation to start chatting</p>
            </div>
          ) : !hasUserActivatedChat && activeUser._id === promptUserId ? (
            <div className="flex-1 flex flex-col items-center justify-center text-white">
              <div className="animate-bounce w-24 h-24 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 flex items-center justify-center mb-6">
                <span className="text-4xl">👆</span>
              </div>
              <p className="text-xl text-gray-300">Click again to start the conversation</p>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="bg-white/10 backdrop-blur-xl border-b border-white/20 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                        {activeUser.username.charAt(0).toUpperCase()}
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                    </div>
                    <div>
                      <h3 className="text-white font-semibold text-lg">{activeUser.username}</h3>
                      {typingUser && (
                        <div className="flex items-center gap-2 text-sm text-gray-300">
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                          <span>typing...</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleCallUser(activeUser)}
                      className="p-3 rounded-full bg-green-500/20 hover:bg-green-500/30 text-green-400 transition-all duration-200 hover:scale-110"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4" style={{ maxHeight: 'calc(100vh - 200px)' }}>
                {(messages[activeUser?._id] || []).map((msg, index) => {
                  const isSender = msg.senderId === user?._id;
                  const isImage = msg.file?.type?.startsWith('image/');
                  
                  return (
                    <div
                      key={index}
                      className={`flex ${isSender ? 'justify-end' : 'justify-start'} animate-fadeIn`}
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className={`flex items-end gap-2 max-w-xs ${isSender ? 'flex-row-reverse' : 'flex-row'}`}>
                        {!isSender && (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-gray-500 to-gray-600 flex items-center justify-center text-white text-xs font-bold">
                            {activeUser.username.charAt(0).toUpperCase()}
                          </div>
                        )}
                        
                        <div className={`p-4 rounded-2xl shadow-lg backdrop-blur-sm border transition-all duration-200 hover:scale-[1.02] ${
                          isSender 
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white border-purple-400/30' 
                            : 'bg-white/10 text-white border-white/20'
                        }`}>
                          {msg.file ? (
                            isImage ? (
                              <img
                                src={msg.file.url}
                                alt="sent"
                                className="rounded-xl max-w-full max-h-60 object-cover mb-2 shadow-lg"
                              />
                            ) : (
                              <a
                                href={msg.file.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-colors border border-white/20"
                              >
                                <span className="text-2xl">📎</span>
                                <span className="underline">{msg.file.name}</span>
                              </a>
                            )
                          ) : (
                            <p className="text-sm leading-relaxed">
                              {msg.message ?? msg.content ?? '[No content]'}
                            </p>
                          )}
                          <div className={`text-xs mt-2 ${isSender ? 'text-white/70' : 'text-gray-400'}`}>
                            {new Date(msg.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-6 bg-white/5 backdrop-blur-xl border-t border-white/20">
                <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={handleTyping}
                      className="w-full p-4 pr-12 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    />
                    <button
                      type="button"
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 rounded-full hover:bg-white/10 transition-colors"
                    >
                      <span className="text-xl">😊</span>
                    </button>
                  </div>

                  <label htmlFor="file-upload" className="cursor-pointer p-3 rounded-2xl bg-white/10 hover:bg-white/20 transition-all duration-200 hover:scale-110">
                    <span className="text-xl">📎</span>
                  </label>
                  <input
                    id="file-upload"
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  <button
                    type="submit"
                    className="p-3 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 transition-all duration-200 hover:scale-110 shadow-lg"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                    </svg>
                  </button>
                </form>

                {/* File Upload Progress */}
                {uploadingFile && (
                  <div className="mt-4 p-4 rounded-xl bg-white/10 border border-white/20">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">📎</span>
                      <span className="text-white text-sm">{uploadingFile.name}</span>
                      <span className="text-gray-400 text-sm">{fileProgress}%</span>
                    </div>
                    <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${fileProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Emoji Picker */}
                {showEmojiPicker && (
                  <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-50 animate-fadeIn">
                    <EmojiPicker 
                      onEmojiClick={handleEmojiSelect} 
                      emojiStyle="native"
                      theme="dark"
                    />
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Incoming Call Modal */}
      {incomingCall && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/20 text-center animate-slideUp">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center animate-pulse">
              <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Incoming Call</h3>
            <p className="text-gray-300 mb-8">from {incomingCall.fromUsername}</p>
            <div className="flex gap-4">
              <button
                onClick={() => {
                  navigate(`/VideoRoom/${incomingCall.roomID}`);
                  socket.emit('accept_call', {
                    toUserId: incomingCall.fromUserId,
                    fromUserId: user._id,
                    roomID: incomingCall.roomID,
                  });
                  setIncomingCall(null);
                }}
                className="flex-1 py-3 px-6 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl hover:from-green-600 hover:to-emerald-600 transition-all duration-200 hover:scale-105"
              >
                Accept
              </button>
              <button
                onClick={() => {
                  setIncomingCall(null);
                  socket.emit('reject_call', {
                    toUserId: incomingCall.fromUserId,
                    fromUserId: user._id,
                  });
                }}
                className="flex-1 py-3 px-6 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-2xl hover:from-red-600 hover:to-rose-600 transition-all duration-200 hover:scale-105"
              >
                Reject
              </button>
            </div>
               </div>
               </div>
 )}



       
        </div>
      
  );
}