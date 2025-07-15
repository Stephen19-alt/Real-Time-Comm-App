import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000'); // Change to deployed backend URL on production

export default function App() {
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [privateMessages, setPrivateMessages] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [room, setRoom] = useState('general');
  const [roomMessages, setRoomMessages] = useState([]);
  const [roomNotification, setRoomNotification] = useState('');
  const [offset, setOffset] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [windowActive, setWindowActive] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    socket.on('user-list', (users) => setOnlineUsers(users.filter(u => u !== username)));
    socket.on('private-message', (msg) => setPrivateMessages(prev => [...prev, msg]));
    socket.on('room-notification', (data) => setRoomNotification(data.message));
    socket.on('receive-room-message', (msg) => {
      setRoomMessages(prev => [...prev, { ...msg }]);
      if (msg.username !== username) playNotificationSound();
      if (!windowActive) setUnreadCount(c => c + 1);
    });
    socket.on('message-reaction', handleReactionUpdate);
    socket.on('message-read-update', handleReadReceipt);
    socket.on('room-message-history', (history) => {
      setRoomMessages(prev => [...history.reverse(), ...prev]);
    });
    socket.emit('join-room', { room: 'general' });
  }, []);

  useEffect(() => {
    const onFocus = () => { setWindowActive(true); setUnreadCount(0); };
    const onBlur = () => setWindowActive(false);
    window.addEventListener('focus', onFocus);
    window.addEventListener('blur', onBlur);
    return () => {
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('blur', onBlur);
    };
  }, []);

  useEffect(() => {
    roomMessages.forEach((msg) => {
      if (msg.username !== username && !msg.readBy?.includes(username)) {
        socket.emit('message-read', { room, messageId: msg.id, username });
      }
    });
  }, [roomMessages]);

  const playNotificationSound = () => {
    new Audio('/ping.mp3').play();
    if (!windowActive && Notification.permission === 'granted') {
      new Notification('New message', { body: 'You have a new message' });
    }
  };

  const handleReactionUpdate = ({ messageId, reaction, username }) => {
    setRoomMessages(prev => prev.map(msg =>
      msg.id === messageId
        ? {
            ...msg,
            reactions: {
              ...msg.reactions,
              [reaction]: msg.reactions?.[reaction]?.includes(username)
                ? msg.reactions[reaction]
                : [...(msg.reactions?.[reaction] || []), username],
            },
          }
        : msg
    ));
  };

  const handleReadReceipt = ({ messageId, username }) => {
    setRoomMessages(prev => prev.map(msg =>
      msg.id === messageId
        ? {
            ...msg,
            readBy: msg.readBy?.includes(username)
              ? msg.readBy
              : [...msg.readBy, username],
          }
        : msg
    ));
  };

  const sendRoomMessage = () => {
    if (!room || (!message.trim() && !imageFile)) return;

    const messageId = Date.now();
    if (imageFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        socket.emit('send-room-message', {
          id: messageId,
          username,
          room,
          message,
          image: reader.result,
        });
        setMessage('');
        setImageFile(null);
      };
      reader.readAsDataURL(imageFile);
    } else {
      socket.emit('send-room-message', {
        id: messageId,
        username,
        room,
        message,
        image: null,
      });
      setMessage('');
    }
  };

  const loadMoreMessages = () => {
    socket.emit('load-messages', { room, offset, limit: 20 });
    setOffset(prev => prev + 20);
  };

  const filteredMessages = roomMessages.filter(msg =>
    msg.message?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 max-w-3xl mx-auto w-full">
      {!username ? (
        <input
          className="border p-2"
          placeholder="Enter your username"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              setUsername(e.target.value);
              socket.emit('join', { username: e.target.value });
            }
          }}
        />
      ) : (
        <>
          <h2 className="text-xl font-bold mb-2">Room: {room}</h2>

          {/* Search */}
          <input
            className="border p-1 mb-2"
            placeholder="Search messages"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          {/* Room messages */}
          <div
            className="h-64 overflow-y-auto border p-2"
            onScroll={(e) => e.target.scrollTop === 0 && loadMoreMessages()}
          >
            {filteredMessages.map((msg, i) => (
              <div key={msg.id || i} className="mb-4 border-b pb-2">
                <strong>{msg.username}</strong>: {msg.message}
                <div className="text-xs text-gray-500">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </div>
                {msg.image && <img src={msg.image} alt="img" className="max-w-xs" />}
                <div className="flex gap-2 text-lg">
                  {['👍', '❤️', '😂'].map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => socket.emit('react-to-message', { room, messageId: msg.id, reaction: emoji, username })}
                    >
                      {emoji} {msg.reactions?.[emoji]?.length || 0}
                    </button>
                  ))}
                </div>
                {msg.readBy?.length > 0 && (
                  <div className="text-xs text-green-600">
                    👁 Seen by: {msg.readBy.join(', ')}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Send form */}
          <div className="flex items-center gap-2 mt-2">
            <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} />
            <input
              className="border p-2 flex-1"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
            />
            <button className="bg-indigo-500 text-white p-2" onClick={sendRoomMessage}>
              Send
            </button>
          </div>
        </>
      )}
    </div>
  );
}
