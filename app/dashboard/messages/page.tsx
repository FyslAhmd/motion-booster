'use client';

import { useState, useEffect } from 'react';
import {
  Search,
  Send,
  Paperclip,
  Smile,
  MoreVertical,
  Phone,
  Video,
  X,
  Folder,
  Image as ImageIcon,
  File,
  FileText,
  Download,
  Check,
  CheckCheck,
  Mic,
  Square,
} from 'lucide-react';

export default function MessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState(0);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'group' | 'contacts'>('all');
  const [showFilePanel, setShowFilePanel] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  // Voice recording timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording]);

  const conversations = [
    {
      id: 1,
      name: 'Marcia Baker',
      role: 'Account Manager',
      avatar: 'MB',
      lastMessage: 'Sweet! What about team collaboration?',
      time: '09:31 AM',
      unread: 0,
      online: true,
      color: 'from-blue-500 to-purple-500',
    },
    {
      id: 2,
      name: 'Carolyn Barnes',
      role: 'Creative Director',
      avatar: 'CB',
      lastMessage: 'Hello Mateo...',
      time: 'Sun 9:10 PM',
      unread: 2,
      online: false,
      color: 'from-pink-500 to-rose-500',
    },
    {
      id: 3,
      name: 'Donna Miller',
      role: 'Support Team',
      avatar: 'DM',
      lastMessage: 'Great! 🔥',
      time: 'Mon 2:12 PM',
      unread: 0,
      online: true,
      color: 'from-green-500 to-emerald-500',
    },
    {
      id: 4,
      name: 'Barbara Cross',
      role: 'Strategist',
      avatar: 'BC',
      lastMessage: 'That cool, go for it...😊',
      time: 'Tue 8:50 AM',
      unread: 0,
      online: false,
      color: 'from-orange-500 to-amber-500',
    },
    {
      id: 5,
      name: 'Rebecca Block',
      role: 'Developer',
      avatar: 'RB',
      lastMessage: 'Hello!',
      time: 'Wed 9:20 PM',
      unread: 0,
      online: false,
      color: 'from-indigo-500 to-blue-500',
    },
  ];

  const messages = [
    {
      id: 1,
      sender: 'Marcia Baker',
      isMe: false,
      text: 'Hey Micheals, have you had a chance to check out the new admin dashboard?',
      time: '09:10 AM',
      read: true,
    },
    {
      id: 2,
      sender: 'Me',
      isMe: true,
      text: 'Oh, you mean the one for project management?',
      time: '09:20 AM',
      read: true,
    },
    {
      id: 3,
      sender: 'Marcia Baker',
      isMe: false,
      text: 'Oh, they\'ve got this Kanban board for task management. You can drag and drop tasks between columns – it\'s so intuitive. Makes managing tasks a breeze. 🔥',
      time: '09:10 AM',
      read: true,
    },
    {
      id: 4,
      sender: 'Marcia Baker',
      isMe: false,
      text: 'Yeah, that\'s the one! It\'s got a sleek Material Design, and the features are pretty robust.',
      time: '09:20 AM',
      read: true,
    },
    {
      id: 5,
      sender: 'Me',
      isMe: true,
      text: 'Nice! What features are you finding interesting?',
      time: '09:21 AM',
      read: true,
    },
    {
      id: 6,
      sender: 'Me',
      isMe: true,
      text: 'Hey Micheals, have you had a chance to check out the new admin dashboard?',
      time: '09:21 AM',
      read: true,
    },
    {
      id: 7,
      sender: 'Marcia Baker',
      isMe: false,
      text: 'Well, it has a project overview (favourite) with all the key metrics on the landing page – project progress, pending tasks, and a some Gantt charts.',
      time: '09:21 AM',
      read: false,
    },
  ];

  const sharedFiles = [
    { name: 'Campaign_Report_Q1.pdf', size: '2.4 MB', type: 'pdf', date: 'Today', sender: 'Sarah Johnson' },
    { name: 'Updated_Budget.xlsx', size: '890 KB', type: 'spreadsheet', date: 'Today', sender: 'You' },
    { name: 'Ad_Creatives.zip', size: '15.8 MB', type: 'archive', date: 'Yesterday', sender: 'Mike Chen' },
    { name: 'Performance_Chart.png', size: '1.2 MB', type: 'image', date: '2 days ago', sender: 'Sarah Johnson' },
  ];

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FileText className="w-5 h-5 text-red-500" />;
      case 'image':
        return <ImageIcon className="w-5 h-5 text-blue-500" />;
      case 'spreadsheet':
        return <FileText className="w-5 h-5 text-green-500" />;
      case 'video':
        return <File className="w-5 h-5 text-purple-500" />;
      case 'archive':
        return <File className="w-5 h-5 text-orange-500" />;
      default:
        return <File className="w-5 h-5 text-gray-500" />;
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedFiles(files);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const files = Array.from(e.dataTransfer.files);
      setSelectedFiles(files);
    }
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
  };

  const handleSendMessage = () => {
    if (messageInput.trim() || selectedFiles.length > 0) {
      // Handle message and file send
      setMessageInput('');
      setSelectedFiles([]);
    }
  };

  return (
    <div className="flex h-full bg-gradient-to-br from-green-50 via-purple-50 to-white overflow-hidden">
      {/* Conversations Sidebar */}
      <div className="w-105 shrink-0 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Messages</h1>
          
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-0 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
          </div>

          {/* Tabs */}
          <div className="flex gap-6">
            <button
              onClick={() => setActiveTab('all')}
              className={`pb-3 text-sm font-medium relative ${
                activeTab === 'all' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              All Message
              {activeTab === 'all' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-500" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('group')}
              className={`pb-3 text-sm font-medium relative ${
                activeTab === 'group' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Group Chat
              {activeTab === 'group' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-500" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('contacts')}
              className={`pb-3 text-sm font-medium relative ${
                activeTab === 'contacts' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Contacts
              {activeTab === 'contacts' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-500" />
              )}
            </button>
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto">
          {conversations.map((conversation, index) => (
            <div key={conversation.id}
              onClick={() => setSelectedConversation(index)}
              className={`px-6 py-4 cursor-pointer transition-all relative ${
                selectedConversation === index
                  ? 'bg-green-50 border-r-4 border-r-green-500'
                  : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex gap-3">
                <div className="relative shrink-0">
                  <div className={`w-12 h-12 bg-linear-to-br ${conversation.color} rounded-full flex items-center justify-center text-white font-semibold text-sm`}>
                    {conversation.avatar}
                  </div>
                  {conversation.online && (
                    <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white"></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="font-semibold text-gray-900 text-sm">{conversation.name}</h3>
                    <span className="text-xs text-gray-500">{conversation.time}</span>
                  </div>
                  <p className="text-sm text-gray-600 truncate">{conversation.lastMessage}</p>
                </div>
                {conversation.unread > 0 && (
                  <div className="absolute top-4 right-4">
                    <span className="flex items-center justify-center w-5 h-5 bg-red-500 text-white text-xs font-medium rounded-full">
                      {conversation.unread}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {/* Chat Header */}
        <div className="bg-gradient-to-r from-green-50 via-white to-purple-50 px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className={`w-12 h-12 bg-linear-to-br ${conversations[selectedConversation].color} rounded-full flex items-center justify-center text-white font-semibold`}>
                  {conversations[selectedConversation].avatar}
                </div>
                {conversations[selectedConversation].online && (
                  <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white"></div>
                )}
              </div>
              <div>
                <h2 className="font-semibold text-gray-900 text-lg">
                  {conversations[selectedConversation].name}
                </h2>
                <p className="text-sm text-green-600 font-medium">
                  {conversations[selectedConversation].online ? 'Active Now' : 'Offline'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2.5 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Phone className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2.5 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Video className="w-5 h-5 text-gray-600" />
              </button>
              <button onClick={() => setShowFilePanel(!showFilePanel)}
                className={`p-2.5 rounded-lg transition-colors ${
                  showFilePanel ? 'bg-green-50 text-green-600' : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                <Folder className="w-5 h-5" />
              </button>
              <button className="p-2.5 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <MoreVertical className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
          {messages.map((message, index) => (
            <div key={message.id}
              className={`flex ${message.isMe ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex gap-3 max-w-2xl ${message.isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                {!message.isMe && (
                  <div className={`w-10 h-10 shrink-0 bg-linear-to-br ${conversations[selectedConversation].color} rounded-full flex items-center justify-center text-white font-semibold text-sm`}>
                    {conversations[selectedConversation].avatar}
                  </div>
                )}
                <div className={`flex flex-col ${message.isMe ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`rounded-2xl px-5 py-3 ${
                      message.isMe
                        ? 'bg-blue-600 text-white rounded-tr-sm'
                        : 'bg-white text-gray-900 border border-gray-100 rounded-tl-sm shadow-sm'
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{message.text}</p>
                  </div>
                  <div className={`flex items-center gap-2 mt-1.5 ${message.isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                    <span className="text-xs text-gray-500">{message.time}</span>
                    {message.isMe && (
                      <span>
                        {message.read ? (
                          <CheckCheck className="w-4 h-4 text-green-600" />
                        ) : (
                          <Check className="w-4 h-4 text-gray-400" />
                        )}
                      </span>
                    )}
                  </div>
                </div>
                {message.isMe && (
                  <div className="w-10 h-10 shrink-0 bg-linear-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    ME
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Message Input */}
        <div className="bg-white border-t border-gray-100 px-8 py-4">
          {/* Selected Files Preview */}
          {selectedFiles.length > 0 && (
            <div className="mb-3 space-y-2">
              {selectedFiles.map((file, index) => (
                <div key={index}
                  className="flex items-center gap-3 p-3 bg-green-50 border border-green-100 rounded-xl"
                >
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <File className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 text-sm truncate">{file.name}</div>
                    <div className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</div>
                  </div>
                  <button onClick={() => removeSelectedFile(index)}
                    className="p-1.5 hover:bg-green-100 rounded-lg"
                  >
                    <X className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Input Area */}
          <div 
            className="flex items-center gap-3 relative"
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {dragActive && (
              <div className="absolute inset-0 bg-green-50 bg-opacity-95 flex items-center justify-center z-10 border-2 border-dashed border-green-400 rounded-2xl">
                <div className="text-center">
                  <ImageIcon className="w-12 h-12 text-green-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-green-900">Drop files here</p>
                </div>
              </div>
            )}

            <input
              type="file"
              id="file-upload"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
            
            <div className="flex items-center gap-2">
              <label htmlFor="file-upload">
                <div className="p-2.5 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors">
                  <Paperclip className="w-5 h-5 text-gray-500" />
                </div>
              </label>
            </div>

            <div className="flex-1 relative">
              <textarea
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Type your message..."
                className="w-full px-5 py-3.5 bg-gray-50 border-0 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm"
                rows={1}
              />
            </div>

            <button className="p-2.5 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Smile className="w-5 h-5 text-gray-500" />
            </button>

            {/* Voice Recording Button */}
            <button onClick={() => {
                if (isRecording) {
                  setIsRecording(false);
                  setRecordingTime(0);
                  // Handle stop recording
                } else {
                  setIsRecording(true);
                  // Handle start recording
                }
              }}
              className={`p-2.5 rounded-lg transition-colors ${
                isRecording 
                  ? 'bg-red-500 hover:bg-red-600 text-white' 
                  : 'hover:bg-gray-100'
              }`}
            >
              {isRecording ? (
                <Square className="w-5 h-5" />
              ) : (
                <Mic className="w-5 h-5 text-gray-500" />
              )}
            </button>

            {isRecording && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 rounded-lg"
              >
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-red-600">
                  Recording... {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
                </span>
              </div>
            )}

            <button onClick={handleSendMessage}
              disabled={!messageInput.trim() && selectedFiles.length === 0}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium text-sm flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              Send
            </button>
          </div>
        </div>
      </div>

      {/* Files Panel */}
      {showFilePanel && (
        <div className="w-80 bg-white/50 backdrop-blur-sm border-l border-green-100 flex flex-col">
          {/* Files Panel Header */}
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Shared Files</h2>
              <button onClick={() => setShowFilePanel(false)}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search files..."
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Files List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {sharedFiles.map((file, index) => (
              <div key={index}
                className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                    {getFileIcon(file.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 text-sm truncate">{file.name}</div>
                    <div className="text-xs text-gray-500 mt-1">{file.size} • {file.date}</div>
                    <div className="text-xs text-gray-400 mt-0.5">By {file.sender}</div>
                  </div>
                  <button className="p-1.5 hover:bg-gray-100 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Download className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="p-4 border-t border-gray-200">
            <label htmlFor="quick-file-upload">
              <div className="w-full px-4 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 flex items-center justify-center gap-2 cursor-pointer">
                <Paperclip className="w-5 h-5" />
                Upload Files
              </div>
            </label>
            <input
              type="file"
              id="quick-file-upload"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        </div>
      )}
    </div>
  );
}
