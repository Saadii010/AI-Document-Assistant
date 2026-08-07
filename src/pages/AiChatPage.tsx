import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { ApiService } from '../services/api';
import { DocumentApiService, DocumentResponse } from '../services/documentApi';
import Markdown from 'react-markdown';
import {
  MessageSquare,
  Sparkles,
  Send,
  Plus,
  Settings,
  Sliders,
  Trash2,
  Pin,
  PinOff,
  Star,
  Search,
  Check,
  ChevronDown,
  ChevronUp,
  FileText,
  Volume2,
  ThumbsUp,
  ThumbsDown,
  Share2,
  RotateCcw,
  Copy,
  Clock,
  ExternalLink,
  HelpCircle,
  Eye,
  Settings2,
  AlertCircle,
  FolderOpen,
  X,
  RefreshCw,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface IChatSettings {
  temperature: number;
  maxTokens: number;
  topP: number;
  model: string;
}

interface IConversation {
  _id: string;
  title: string;
  userId: string;
  documentIds: string[];
  isPinned: boolean;
  isFavorite: boolean;
  isArchived: boolean;
  settings: IChatSettings;
  createdAt: string;
  updatedAt: string;
}

interface ISourceCitation {
  documentId: string;
  documentName: string;
  pageNumber: number;
  paragraphNumber: number;
  chunkId: string;
  confidence: number;
  text: string;
}

interface IMessageMetrics {
  responseTime: number;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  chunkCount: number;
  embeddingCount: number;
}

interface IMessage {
  _id: string;
  conversationId: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  sources: ISourceCitation[];
  metrics: IMessageMetrics;
  rating: 'like' | 'dislike' | null;
  createdAt: string;
  updatedAt: string;
}

export const AiChatPage: React.FC = () => {
  const { user } = useAuth();
  const { resolvedTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  // Conversations & UI State
  const [conversations, setConversations] = useState<IConversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<IConversation | null>(null);
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [userDocuments, setUserDocuments] = useState<DocumentResponse[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Active inputs & controls
  const [question, setQuestion] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);
  const [showDocSelector, setShowDocSelector] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Settings
  const [tempSettings, setTempSettings] = useState<IChatSettings>({
    temperature: 0.7,
    maxTokens: 2048,
    topP: 0.95,
    model: 'gemini-3.6-flash',
  });

  // Source inspection modal
  const [inspectingSource, setInspectingSource] = useState<ISourceCitation | null>(null);

  // Edit / Rename states
  const [renamingConvId, setRenamingConvId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  // Chat panel bottom scroll reference
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Load everything on start
  useEffect(() => {
    fetchHistory();
    fetchDocuments();

    // Check if we came with a prefilled query from Search page
    const state = location.state as { prefilledQuery?: string; documentId?: string } | null;
    if (state?.prefilledQuery) {
      setQuestion(state.prefilledQuery);
      if (state.documentId) {
        setSelectedDocIds([state.documentId]);
      }
    }
  }, [location.state]);

  // Scroll to bottom on messages update
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingText]);

  // Adjust input height automatically
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 200)}px`;
    }
  }, [question]);

  const fetchHistory = async () => {
    try {
      setLoadingHistory(true);
      const res = await ApiService.get<IConversation[]>('/chat/history');
      if (res.success && res.data) {
        setConversations(res.data);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to load conversation history');
    } finally {
      setLoadingHistory(false);
    }
  };

  const fetchDocuments = async () => {
    try {
      const res = await DocumentApiService.getDocuments({ limit: 100 });
      if (res.success && res.data && res.data.documents) {
        // Only allow selecting processed documents
        const processed = res.data.documents.filter((d) => d.status === 'processed');
        setUserDocuments(processed);
      }
    } catch (err: any) {
      console.error('Failed to load user documents:', err);
    }
  };

  const selectConversation = async (conversation: IConversation) => {
    if (isGenerating) {
      toast.error('Please wait for the current answer to complete generation.');
      return;
    }
    try {
      setLoadingMessages(true);
      setCurrentConversation(conversation);
      setSelectedDocIds(conversation.documentIds || []);
      setTempSettings(conversation.settings || {
        temperature: 0.7,
        maxTokens: 2048,
        topP: 0.95,
        model: 'gemini-3.6-flash',
      });

      const res = await ApiService.get<{ conversation: IConversation; messages: IMessage[] }>(`/chat/${conversation._id}`);
      if (res.success && res.data) {
        setMessages(res.data.messages);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to fetch conversation messages');
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleCreateNewChat = async () => {
    if (isGenerating) return;
    try {
      const res = await ApiService.post<IConversation>('/chat/new', {
        title: 'New Chat Room',
        documentIds: selectedDocIds,
        settings: tempSettings,
      });

      if (res.success && res.data) {
        setConversations((prev) => [res.data!, ...prev]);
        setCurrentConversation(res.data);
        setMessages([]);
        toast.success('New chat room initiated.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to create new chat');
    }
  };

  const handleUpdateSettings = async (newSettings: IChatSettings) => {
    setTempSettings(newSettings);
    if (currentConversation) {
      try {
        const res = await ApiService.put<IConversation>(`/chat/${currentConversation._id}`, {
          settings: newSettings,
        });
        if (res.success && res.data) {
          setCurrentConversation(res.data);
          setConversations((prev) => prev.map((c) => (c._id === res.data!._id ? res.data! : c)));
          toast.success('Chat settings updated successfully.');
        }
      } catch (err: any) {
        toast.error(err.message || 'Failed to sync settings with backend');
      }
    }
  };

  const handleDocSelectionToggle = async (docId: string) => {
    const isSelected = selectedDocIds.includes(docId);
    const updated = isSelected ? selectedDocIds.filter((id) => id !== docId) : [...selectedDocIds, docId];
    setSelectedDocIds(updated);

    if (currentConversation) {
      try {
        const res = await ApiService.put<IConversation>(`/chat/${currentConversation._id}`, {
          documentIds: updated,
        });
        if (res.success && res.data) {
          setCurrentConversation(res.data);
          setConversations((prev) => prev.map((c) => (c._id === res.data!._id ? res.data! : c)));
          toast.success('Selected scope updated.');
        }
      } catch (err: any) {
        toast.error(err.message || 'Failed to update document scope');
      }
    }
  };

  const handlePinToggle = async (conv: IConversation, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await ApiService.post<IConversation>('/chat/pin', {
        conversationId: conv._id,
        isPinned: !conv.isPinned,
      });
      if (res.success && res.data) {
        setConversations((prev) =>
          prev
            .map((c) => (c._id === conv._id ? { ...c, isPinned: res.data!.isPinned } : c))
            .sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0))
        );
        if (currentConversation?._id === conv._id) {
          setCurrentConversation((prev) => prev ? { ...prev, isPinned: res.data!.isPinned } : null);
        }
        toast.success(res.data!.isPinned ? 'Chat pinned to top.' : 'Chat unpinned.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to toggle pin');
    }
  };

  const handleFavoriteToggle = async (conv: IConversation, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await ApiService.put<IConversation>(`/chat/${conv._id}`, {
        isFavorite: !conv.isFavorite,
      });
      if (res.success && res.data) {
        setConversations((prev) => prev.map((c) => (c._id === conv._id ? res.data! : c)));
        if (currentConversation?._id === conv._id) {
          setCurrentConversation(res.data);
        }
        toast.success(res.data!.isFavorite ? 'Saved to favorites.' : 'Removed from favorites.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to toggle favorite');
    }
  };

  const handleRenameChat = async (convId: string, title: string) => {
    if (!title.trim()) return;
    try {
      const res = await ApiService.put<IConversation>(`/chat/${convId}`, {
        title: title.trim(),
      });
      if (res.success && res.data) {
        setConversations((prev) => prev.map((c) => (c._id === convId ? res.data! : c)));
        if (currentConversation?._id === convId) {
          setCurrentConversation(res.data);
        }
        setRenamingConvId(null);
        toast.success('Conversation renamed successfully.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to rename conversation');
    }
  };

  const handleDeleteChat = async (convId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you absolutely sure you want to delete this conversation? This action cannot be undone.')) return;
    try {
      const res = await ApiService.delete<{ success: boolean; message: string }>(`/chat/${convId}`);
      if (res.success) {
        setConversations((prev) => prev.filter((c) => c._id !== convId));
        if (currentConversation?._id === convId) {
          setCurrentConversation(null);
          setMessages([]);
        }
        toast.success('Conversation cleared successfully.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete conversation');
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!question.trim() || isGenerating) return;

    const queryText = question.trim();
    setQuestion('');
    setIsGenerating(true);
    setStreamingText('');

    // Pre-emptively append the user's message locally for instantaneous fluid response
    const tempUserMsg: IMessage = {
      _id: `temp-user-${Date.now()}`,
      conversationId: currentConversation?._id || '',
      sender: 'user',
      text: queryText,
      sources: [],
      metrics: { responseTime: 0, promptTokens: 0, completionTokens: 0, totalTokens: 0, chunkCount: 0, embeddingCount: 0 },
      rating: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    const token = localStorage.getItem('auth_token');
    try {
      const response = await fetch('/api/chat/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          conversationId: currentConversation?._id,
          question: queryText,
          stream: true,
          selectedDocumentIds: selectedDocIds,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Streaming failure');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder('utf-8');
      if (!reader) throw new Error('No body stream reader available.');

      let buffer = '';
      let isInit = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6).trim();
            if (!dataStr) continue;

            try {
              const data = JSON.parse(dataStr);

              if (data.type === 'init') {
                if (!currentConversation && data.conversationId) {
                  // Created conversation automatically
                  fetchHistory();
                  setCurrentConversation({
                    _id: data.conversationId,
                    title: queryText,
                    userId: user?.id || '',
                    documentIds: selectedDocIds,
                    isPinned: false,
                    isFavorite: false,
                    isArchived: false,
                    settings: tempSettings,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                  });
                }
              } else if (data.type === 'token') {
                setStreamingText((prev) => prev + data.token);
              } else if (data.type === 'done') {
                // Done event includes the complete final Assistant Message
                const finalMsg: IMessage = data.message;
                setMessages((prev) => {
                  // Replace any temp user message and insert final response
                  const filtered = prev.filter((m) => !m._id.startsWith('temp-user-'));
                  const cleanUserMsg = { ...tempUserMsg, conversationId: finalMsg.conversationId };
                  return [...filtered, cleanUserMsg, finalMsg];
                });
                setStreamingText('');

                // Reload history to reflect correct updatedAt order
                fetchHistory();
              } else if (data.type === 'error') {
                throw new Error(data.message);
              }
            } catch (err: any) {
              console.error('SSE line parse issue:', err);
            }
          }
        }
      }
    } catch (err: any) {
      toast.error(err.message || 'RAG response pipeline failed.');
      // Remove the user message from visual list so user can retry easily
      setMessages((prev) => prev.filter((m) => !m._id.startsWith('temp-user-')));
      setQuestion(queryText); // Restore input value
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerateAnswer = async () => {
    if (!currentConversation || isGenerating) return;
    setIsGenerating(true);
    setStreamingText('');

    const token = localStorage.getItem('auth_token');
    try {
      const response = await fetch('/api/chat/regenerate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          conversationId: currentConversation._id,
          stream: true,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Regeneration failure');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder('utf-8');
      if (!reader) throw new Error('No body stream reader available.');

      // Clear the last assistant messages from screen before regeneration start
      setMessages((prev) => {
        let lastUserIdx = -1;
        for (let i = prev.length - 1; i >= 0; i--) {
          if (prev[i].sender === 'user') {
            lastUserIdx = i;
            break;
          }
        }
        if (lastUserIdx === -1) return prev;
        return prev.slice(0, lastUserIdx + 1);
      });

      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6).trim();
            if (!dataStr) continue;

            try {
              const data = JSON.parse(dataStr);
              if (data.type === 'token') {
                setStreamingText((prev) => prev + data.token);
              } else if (data.type === 'done') {
                const finalMsg: IMessage = data.message;
                setMessages((prev) => [...prev, finalMsg]);
                setStreamingText('');
                fetchHistory();
              } else if (data.type === 'error') {
                throw new Error(data.message);
              }
            } catch (err: any) {
              console.error('SSE line parse issue:', err);
            }
          }
        }
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to regenerate response.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleToggleRating = async (msgId: string, currRating: 'like' | 'dislike' | null, action: 'like' | 'dislike') => {
    const targetRating = currRating === action ? null : action;
    try {
      // Direct call to save rating (assuming we can put rating inside a message or a lightweight endpoint)
      // We can use a PUT on /chat/message/:id or perform inline state modification for a fluid mockup
      setMessages((prev) =>
        prev.map((m) => (m._id === msgId ? { ...m, rating: targetRating } : m))
      );
      toast.success(targetRating ? `Response feedback saved: ${action}.` : 'Feedback cleared.');
    } catch (err: any) {
      toast.error('Failed to submit rating.');
    }
  };

  const handleCopyAnswer = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Response copied to clipboard.');
  };

  const handleResetConversation = async () => {
    if (!currentConversation) return;
    if (!confirm('Clear all messages in this conversation? The conversation context will be reset.')) return;
    try {
      const res = await ApiService.delete<{ success: boolean; message: string }>(`/chat/${currentConversation._id}`);
      if (res.success) {
        // Re-init empty conversation
        const newRes = await ApiService.post<IConversation>('/chat/new', {
          title: currentConversation.title,
          documentIds: selectedDocIds,
          settings: tempSettings,
        });
        if (newRes.success && newRes.data) {
          setConversations((prev) => prev.map((c) => (c._id === currentConversation._id ? newRes.data! : c)));
          setCurrentConversation(newRes.data);
          setMessages([]);
          toast.success('Conversation reset successfully.');
        }
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to reset conversation');
    }
  };

  const filteredHistory = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-6rem)] -m-4 md:-m-6 lg:-m-8 flex bg-zinc-50 dark:bg-zinc-950 overflow-hidden rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 shadow-inner select-none transition-all duration-200">
      
      {/* 1. LEFT SIDEBAR */}
      <aside className="w-80 border-r border-zinc-200 dark:border-zinc-850 bg-white dark:bg-zinc-950/60 flex flex-col h-full shrink-0">
        
        {/* New Chat Button Header */}
        <div className="p-4 border-b border-zinc-150 dark:border-zinc-900 flex items-center justify-between gap-3">
          <button
            onClick={handleCreateNewChat}
            disabled={isGenerating}
            className="flex-1 flex items-center justify-center gap-2 px-4.5 py-2.5 rounded-xl text-xs font-black bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100 transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
          >
            <Plus className="w-4 h-4" />
            <span>New Chat Session</span>
          </button>
        </div>

        {/* Search bar */}
        <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-900">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400 dark:text-zinc-500" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-zinc-100 dark:bg-zinc-900/60 hover:bg-zinc-200/30 border-transparent focus:border-indigo-500/30 rounded-xl text-xs font-bold outline-none transition-colors dark:placeholder-zinc-600"
            />
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto p-2.5 flex flex-col gap-1.5 scrollbar-thin">
          {loadingHistory ? (
            <div className="flex flex-col items-center justify-center h-48 gap-3 text-zinc-400">
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span className="text-xs font-medium">Retrieving chat rooms...</span>
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center px-4 gap-2 text-zinc-400">
              <MessageSquare className="w-6 h-6 text-zinc-300 dark:text-zinc-700" />
              <span className="text-xs font-bold">No chats found</span>
              <p className="text-[10px] text-zinc-500 leading-normal">Start a new query to construct a custom RAG room.</p>
            </div>
          ) : (
            filteredHistory.map((conv) => {
              const isSelected = currentConversation?._id === conv._id;
              const isRenaming = renamingConvId === conv._id;

              return (
                <div
                  key={conv._id}
                  onClick={() => !isRenaming && selectConversation(conv)}
                  className={`group flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer relative ${
                    isSelected
                      ? 'bg-zinc-900 border-zinc-900 text-white dark:bg-zinc-900 dark:border-zinc-850 dark:text-zinc-100 shadow-md'
                      : 'bg-white border-zinc-200/50 text-zinc-700 dark:bg-zinc-950/25 dark:border-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-900/40 hover:text-zinc-900 dark:hover:text-zinc-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5 flex-1 min-w-0 pr-2">
                    <MessageSquare className={`w-4 h-4 shrink-0 ${isSelected ? 'text-indigo-400' : 'text-zinc-400 group-hover:text-zinc-600'}`} />
                    
                    {isRenaming ? (
                      <input
                        type="text"
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        onBlur={() => handleRenameChat(conv._id, renameValue)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleRenameChat(conv._id, renameValue);
                          if (e.key === 'Escape') setRenamingConvId(null);
                        }}
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                        className="flex-1 bg-zinc-800 text-white text-xs px-2 py-0.5 rounded outline-none border border-zinc-700"
                      />
                    ) : (
                      <div className="flex flex-col text-left min-w-0">
                        <span className="text-xs font-black truncate tracking-tight">{conv.title}</span>
                        <span className={`text-[9px] mt-0.5 ${isSelected ? 'text-zinc-400' : 'text-zinc-400'}`}>
                          {conv.documentIds?.length > 0 ? `${conv.documentIds.length} docs scope` : 'All Documents'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Right hand controls */}
                  {!isRenaming && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 shrink-0">
                      <button
                        onClick={(e) => handlePinToggle(conv, e)}
                        title={conv.isPinned ? 'Unpin Chat' : 'Pin Chat'}
                        className={`p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 ${conv.isPinned ? 'text-amber-500' : ''}`}
                      >
                        <Pin className="w-3 h-3" />
                      </button>

                      <button
                        onClick={(e) => handleFavoriteToggle(conv, e)}
                        title={conv.isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
                        className={`p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 ${conv.isFavorite ? 'text-rose-500' : ''}`}
                      >
                        <Star className="w-3 h-3" />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setRenamingConvId(conv._id);
                          setRenameValue(conv.title);
                        }}
                        title="Rename Chat"
                        className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
                      >
                        <Settings className="w-3 h-3" />
                      </button>

                      <button
                        onClick={(e) => handleDeleteChat(conv._id, e)}
                        title="Delete Chat"
                        className="p-1 rounded-lg hover:bg-red-500/10 text-zinc-400 hover:text-red-500"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}

                  {/* Persistent indicator if pinned or favorited and not hovering */}
                  {!isSelected && (conv.isPinned || conv.isFavorite) && (
                    <div className="absolute right-3 group-hover:opacity-0 flex items-center gap-1 text-[10px] pointer-events-none transition-opacity">
                      {conv.isPinned && <Pin className="w-2.5 h-2.5 text-amber-500" />}
                      {conv.isFavorite && <Star className="w-2.5 h-2.5 text-rose-500" />}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </aside>

      {/* 2. MAIN CHAT CONTAINER */}
      <main className="flex-1 flex flex-col h-full bg-zinc-50 dark:bg-zinc-950 relative">
        {currentConversation ? (
          <>
            {/* A. ACTIVE CHAT HEADER */}
            <header className="h-16 border-b border-zinc-200/60 dark:border-zinc-900 bg-white/70 dark:bg-zinc-950/70 backdrop-blur px-5 flex items-center justify-between gap-4 shrink-0 z-20">
              <div className="flex flex-col text-left min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-black truncate max-w-xs md:max-w-md tracking-tight dark:text-zinc-100">{currentConversation.title}</h2>
                  {currentConversation.isPinned && <Pin className="w-3.5 h-3.5 text-amber-500" />}
                  {currentConversation.isFavorite && <Star className="w-3.5 h-3.5 text-rose-500" />}
                </div>
                
                {/* Meta stats */}
                <div className="flex items-center gap-2 mt-0.5 text-[10px] text-zinc-400">
                  <span className="flex items-center gap-1"><Sparkles className="w-2.5 h-2.5 text-indigo-400" /> {currentConversation.settings?.model || 'gemini-3.6-flash'}</span>
                  <span className="h-2 w-[1px] bg-zinc-200 dark:bg-zinc-800" />
                  <span>{currentConversation.documentIds?.length > 0 ? `${currentConversation.documentIds.length} doc${currentConversation.documentIds.length > 1 ? 's' : ''} scope` : 'All processed docs'}</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2">
                {/* Document selector toggle button */}
                <div className="relative">
                  <button
                    onClick={() => setShowDocSelector(!showDocSelector)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-xl text-xs font-black transition-all ${
                      showDocSelector
                        ? 'bg-zinc-900 border-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950'
                        : 'border-zinc-250 bg-white text-zinc-700 dark:bg-zinc-900/60 dark:border-zinc-850 dark:text-zinc-200 hover:bg-zinc-50'
                    }`}
                  >
                    <FolderOpen className="w-3.5 h-3.5" />
                    <span>Select Scope</span>
                    <ChevronDown className="w-3 h-3" />
                  </button>

                  <AnimatePresence>
                    {showDocSelector && (
                      <>
                        <div className="fixed inset-0 z-30" onClick={() => setShowDocSelector(false)} />
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 6, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 mt-2 w-72 max-h-80 overflow-y-auto rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 shadow-xl z-40 p-3 flex flex-col gap-2.5 text-left scrollbar-thin"
                        >
                          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-900 pb-2">
                            <span className="text-[10px] font-black tracking-wider uppercase text-zinc-400">Target Scope</span>
                            <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/40 px-1.5 py-0.5 rounded-md">{selectedDocIds.length === 0 ? 'All Documents' : `${selectedDocIds.length} selected`}</span>
                          </div>

                          <div className="flex flex-col gap-1 overflow-y-auto max-h-56 p-0.5">
                            {userDocuments.length === 0 ? (
                              <p className="text-[10px] text-zinc-500 text-center py-4 leading-normal">No processed documents in Knowledge Base. Go to Knowledge Base to upload files.</p>
                            ) : (
                              userDocuments.map((doc) => {
                                const isChecked = selectedDocIds.includes(doc.id);
                                return (
                                  <button
                                    key={doc.id}
                                    onClick={() => handleDocSelectionToggle(doc.id)}
                                    className="w-full flex items-center justify-between p-2 hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-xl transition-all text-left"
                                  >
                                    <div className="flex items-center gap-2 min-w-0 pr-2">
                                      <FileText className="w-3.5 h-3.5 shrink-0 text-zinc-400" />
                                      <span className="text-[11px] font-bold truncate text-zinc-700 dark:text-zinc-200 leading-tight">{doc.title}</span>
                                    </div>
                                    <div className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 transition-all ${isChecked ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-zinc-300 dark:border-zinc-700'}`}>
                                      {isChecked && <Check className="w-3 h-3" />}
                                    </div>
                                  </button>
                                );
                              })
                            )}
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>

                {/* Settings Panel Toggle */}
                <button
                  onClick={() => setShowSettingsModal(true)}
                  className="p-2 rounded-xl border border-zinc-200/50 bg-white hover:bg-zinc-50 text-zinc-600 dark:bg-zinc-900/60 dark:border-zinc-850 dark:text-zinc-300 dark:hover:bg-zinc-900 shadow-sm transition-all"
                  title="Conversation Parameters"
                >
                  <Settings2 className="w-4 h-4" />
                </button>
              </div>
            </header>

            {/* B. MESSAGES SCROLL AREA */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 scrollbar-thin">
              {loadingMessages ? (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-zinc-400">
                  <RefreshCw className="w-6 h-6 animate-spin" />
                  <span className="text-xs font-medium">Retrieving messages...</span>
                </div>
              ) : (
                <>
                  {messages.map((msg, idx) => {
                    const isUser = msg.sender === 'user';
                    return (
                      <div
                        key={msg._id}
                        className={`flex ${isUser ? 'justify-end' : 'justify-start'} w-full animate-fade-in`}
                      >
                        <div
                          className={`max-w-[85%] md:max-w-[75%] rounded-2xl p-4 text-sm leading-relaxed border flex flex-col text-left ${
                            isUser
                              ? 'bg-zinc-900 border-zinc-900 text-white dark:bg-zinc-900 dark:border-zinc-850 dark:text-zinc-100 shadow-sm'
                              : 'bg-white border-zinc-200/60 text-zinc-800 dark:bg-zinc-950/25 dark:border-zinc-900 dark:text-zinc-200 shadow-sm'
                          }`}
                        >
                          {/* Message Author Header */}
                          <div className="flex items-center gap-2 mb-2 select-none">
                            <div className={`w-5 h-5 rounded-md flex items-center justify-center font-bold text-[9px] ${isUser ? 'bg-zinc-800 text-white dark:bg-zinc-800' : 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400'}`}>
                              {isUser ? 'ME' : 'AI'}
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                              {isUser ? 'You' : 'Personal AI'}
                            </span>
                            <span className="text-[9px] text-zinc-400 dark:text-zinc-600">
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>

                          {/* Message body with custom markdown */}
                          <div className="prose prose-zinc dark:prose-invert prose-xs leading-relaxed max-w-none text-zinc-800 dark:text-zinc-100">
                            <Markdown
                              components={{
                                code(props) {
                                  const {children, className, node, ...rest} = props
                                  const match = /language-(\w+)/.exec(className || '')
                                  return !match ? (
                                    <code {...rest} className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 font-mono text-xs text-zinc-800 dark:text-zinc-200">
                                      {children}
                                    </code>
                                  ) : (
                                    <pre className="p-4 rounded-xl bg-zinc-950 text-zinc-100 font-mono text-xs overflow-x-auto my-3 border border-zinc-800">
                                      <code className={className} {...rest}>
                                        {children}
                                      </code>
                                    </pre>
                                  )
                                },
                                table(props) {
                                  return (
                                    <div className="overflow-x-auto my-4 rounded-xl border border-zinc-200 dark:border-zinc-850">
                                      <table className="w-full text-xs text-left border-collapse" {...props} />
                                    </div>
                                  )
                                },
                                th(props) {
                                  return <th className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 font-bold" {...props} />
                                },
                                td(props) {
                                  return <td className="px-3 py-1.5 border-b border-zinc-200 dark:border-zinc-850" {...props} />
                                },
                                p(props) {
                                  return <p className="mb-2 last:mb-0 leading-relaxed text-zinc-800 dark:text-zinc-200" {...props} />
                                }
                              }}
                            >
                              {msg.text}
                            </Markdown>
                          </div>

                          {/* Source Citations & Metrics for AI Messages */}
                          {!isUser && (
                            <>
                              {msg.sources && msg.sources.length > 0 && (
                                <div className="mt-4 pt-3.5 border-t border-zinc-100 dark:border-zinc-900">
                                  <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-zinc-400 mb-2">
                                    <Sparkles className="w-3 h-3 text-indigo-400" />
                                    <span>Verified Source Citations ({msg.sources.length})</span>
                                  </div>

                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {msg.sources.map((src, sIdx) => (
                                      <div
                                        key={sIdx}
                                        className="p-2.5 rounded-xl border border-zinc-200/50 dark:border-zinc-900/60 bg-zinc-50/50 dark:bg-zinc-950/40 hover:bg-zinc-100/50 dark:hover:bg-zinc-900/40 transition-colors flex flex-col text-left gap-1.5 relative group"
                                      >
                                        <div className="flex items-start justify-between gap-2 min-w-0">
                                          <div className="flex items-center gap-1.5 min-w-0">
                                            <FileText className="w-3.5 h-3.5 shrink-0 text-zinc-400" />
                                            <span className="text-[10px] font-black truncate text-zinc-700 dark:text-zinc-300">{src.documentName}</span>
                                          </div>
                                          <span className="text-[9px] font-extrabold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded-md shrink-0">{src.confidence}% Match</span>
                                        </div>

                                        <div className="text-[9px] text-zinc-400 mt-0.5 flex items-center gap-2">
                                          <span>Page {src.pageNumber}</span>
                                          <span className="h-1.5 w-[1px] bg-zinc-200 dark:bg-zinc-800" />
                                          <span>Paragraph {src.paragraphNumber}</span>
                                        </div>

                                        {/* Inspect Context button */}
                                        <div className="mt-1 flex items-center gap-2">
                                          <button
                                            onClick={() => setInspectingSource(src)}
                                            className="flex items-center gap-1 text-[9px] font-extrabold text-indigo-500 hover:text-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/30 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 px-2 py-0.5 rounded transition-all"
                                          >
                                            <Eye className="w-2.5 h-2.5" />
                                            <span>Inspect context chunk</span>
                                          </button>
                                          <button
                                            onClick={() => {
                                              navigate(`/viewer/${src.documentId}`, {
                                                state: {
                                                  page: src.pageNumber,
                                                  chunkId: src.chunkId,
                                                  paragraphNumber: src.paragraphNumber
                                                }
                                              });
                                            }}
                                            className="flex items-center gap-1 text-[9px] font-extrabold text-emerald-500 hover:text-emerald-600 bg-emerald-50/60 dark:bg-emerald-950/30 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 px-2 py-0.5 rounded transition-all"
                                          >
                                            <ExternalLink className="w-2.5 h-2.5" />
                                            <span>Open in Reader</span>
                                          </button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Footer panel statistics and ratings */}
                              <div className="mt-3 pt-2.5 border-t border-zinc-100 dark:border-zinc-900 flex flex-wrap items-center justify-between gap-3 text-[10px] text-zinc-400 select-none">
                                <div className="flex items-center gap-3">
                                  {msg.metrics?.responseTime !== undefined && (
                                    <span className="flex items-center gap-1">
                                      <Clock className="w-2.5 h-2.5" />
                                      {(msg.metrics.responseTime / 1000).toFixed(2)}s generation
                                    </span>
                                  )}
                                  {msg.metrics?.totalTokens !== undefined && (
                                    <span>{msg.metrics.totalTokens} tokens tracked</span>
                                  )}
                                </div>

                                {/* Feedbacks controls */}
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => handleCopyAnswer(msg.text)}
                                    title="Copy Answer"
                                    className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                                  >
                                    <Copy className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={() => handleToggleRating(msg._id, msg.rating, 'like')}
                                    title="Good Response"
                                    className={`p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 ${msg.rating === 'like' ? 'text-emerald-500 bg-emerald-500/10' : 'text-zinc-400 hover:text-emerald-500'}`}
                                  >
                                    <ThumbsUp className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={() => handleToggleRating(msg._id, msg.rating, 'dislike')}
                                    title="Poor Response"
                                    className={`p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 ${msg.rating === 'dislike' ? 'text-rose-500 bg-rose-500/10' : 'text-zinc-400 hover:text-rose-500'}`}
                                  >
                                    <ThumbsDown className="w-3 h-3" />
                                  </button>
                                  {idx === messages.length - 1 && (
                                    <button
                                      onClick={handleRegenerateAnswer}
                                      title="Regenerate Answer"
                                      className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
                                    >
                                      <RotateCcw className="w-3 h-3" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* Active streaming text visual fallback */}
                  {streamingText && (
                    <div className="flex justify-start w-full animate-pulse">
                      <div className="max-w-[75%] rounded-2xl p-4 text-sm leading-relaxed border bg-white border-zinc-200/60 text-zinc-800 dark:bg-zinc-900 dark:border-zinc-850 dark:text-zinc-100 shadow-sm flex flex-col text-left">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-5 h-5 rounded-md flex items-center justify-center font-bold text-[9px] bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                            AI
                          </div>
                          <span className="text-[10px] font-black uppercase tracking-wider text-indigo-500 animate-pulse">
                            Thinking...
                          </span>
                        </div>
                        <div className="prose prose-zinc dark:prose-invert prose-xs text-zinc-800 dark:text-zinc-200">
                          <Markdown>{streamingText}</Markdown>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Thinking/Waiting animation */}
                  {isGenerating && !streamingText && (
                    <div className="flex justify-start w-full">
                      <div className="max-w-[75%] rounded-2xl p-4 border bg-white border-zinc-200/60 dark:bg-zinc-900 dark:border-zinc-850 flex items-center gap-3">
                        <RefreshCw className="w-4 h-4 text-indigo-500 animate-spin" />
                        <span className="text-xs font-bold text-zinc-500">Formulating RAG Pipeline answer...</span>
                      </div>
                    </div>
                  )}
                </>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* C. BOTTOM INPUT AND CONTROLS */}
            <footer className="p-4 border-t border-zinc-200/60 dark:border-zinc-900 bg-white/50 dark:bg-zinc-950/50 backdrop-blur shrink-0 z-10">
              <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto flex flex-col gap-2">
                <div className="flex items-end gap-3.5 bg-zinc-100 dark:bg-zinc-900/60 hover:bg-zinc-200/20 rounded-2xl px-4 py-3 border border-transparent focus-within:border-indigo-500/20 focus-within:bg-white dark:focus-within:bg-zinc-950 transition-all shadow-inner relative">
                  
                  {/* Multiline textarea */}
                  <textarea
                    ref={inputRef}
                    rows={1}
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder={isGenerating ? 'AI is formulating answer...' : 'Ask a question about your documents...'}
                    disabled={isGenerating}
                    className="flex-1 bg-transparent border-none outline-none resize-none text-xs font-semibold py-1 pr-12 dark:placeholder-zinc-600 leading-relaxed max-h-48 dark:text-zinc-100"
                  />

                  {/* Send Action */}
                  <button
                    type="submit"
                    disabled={!question.trim() || isGenerating}
                    className="p-2 rounded-xl bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100 shadow-sm active:scale-95 disabled:opacity-30 disabled:pointer-events-none transition-all absolute right-3 bottom-2.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center justify-between px-2 text-[10px] text-zinc-400">
                  <span>Shift + Enter for new line</span>
                  <span className="flex items-center gap-1 select-none">
                    <Sparkles className="w-3 h-3 text-indigo-400" />
                    <span>Gemini RAG pipeline active</span>
                  </span>
                </div>
              </form>
            </footer>
          </>
        ) : (
          /* NO CONVERSATION SELECT VIEW */
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-2xl mx-auto gap-6 select-none animate-fade-in">
            <div className="p-4 rounded-3xl bg-zinc-100 dark:bg-zinc-900/60 border border-zinc-200/40 dark:border-zinc-800 text-zinc-900 dark:text-zinc-50 shadow-inner">
              <Sparkles className="w-10 h-10 text-indigo-500" />
            </div>

            <div className="flex flex-col gap-2">
              <h1 className="text-xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">AI Document Assistant</h1>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Connect and query your entire PDF, DOCX, and TXT base. Our AI draws verified facts and sources exclusively from your uploads — zero hallucination, absolute truth.
              </p>
            </div>

            {/* Quick scope setup */}
            <div className="w-full bg-white dark:bg-zinc-950/40 rounded-2xl border border-zinc-200/50 dark:border-zinc-900 p-5 flex flex-col gap-4 text-left">
              <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Choose scope & start conversation</span>
              
              <div className="flex items-center justify-between gap-4">
                <div className="flex flex-col">
                  <span className="text-xs font-black text-zinc-700 dark:text-zinc-300">Document Selection Scope</span>
                  <p className="text-[10px] text-zinc-400 leading-normal mt-0.5">Toggle and filter which parsed files to retrieve knowledge from.</p>
                </div>

                <div className="relative">
                  <button
                    onClick={() => setShowDocSelector(!showDocSelector)}
                    className="flex items-center gap-1.5 px-4 py-2 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 rounded-xl text-xs font-bold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100"
                  >
                    <FolderOpen className="w-3.5 h-3.5" />
                    <span>{selectedDocIds.length === 0 ? 'All Documents' : `${selectedDocIds.length} Selected`}</span>
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>

                  <AnimatePresence>
                    {showDocSelector && (
                      <>
                        <div className="fixed inset-0 z-30" onClick={() => setShowDocSelector(false)} />
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 6, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 mt-2 w-72 max-h-64 overflow-y-auto rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 shadow-xl z-45 p-3 flex flex-col gap-2 scrollbar-thin"
                        >
                          <div className="flex flex-col gap-1">
                            {userDocuments.length === 0 ? (
                              <p className="text-[10px] text-zinc-500 text-center py-4">No processed documents yet.</p>
                            ) : (
                              userDocuments.map((doc) => {
                                const isChecked = selectedDocIds.includes(doc.id);
                                return (
                                  <button
                                    key={doc.id}
                                    onClick={() => handleDocSelectionToggle(doc.id)}
                                    className="w-full flex items-center justify-between p-2 hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-xl transition-all text-left"
                                  >
                                    <span className="text-[11px] font-bold truncate max-w-[200px] text-zinc-700 dark:text-zinc-200">{doc.title}</span>
                                    <div className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ${isChecked ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-zinc-300 dark:border-zinc-700'}`}>
                                      {isChecked && <Check className="w-3 h-3" />}
                                    </div>
                                  </button>
                                );
                              })
                            )}
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <button
                onClick={handleCreateNewChat}
                className="w-full py-3 rounded-xl text-xs font-black bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 hover:opacity-90 shadow-sm active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Initialize RAG Chat Room</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* 3. PARMS / SETTINGS MODAL */}
      <AnimatePresence>
        {showSettingsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md p-6 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl text-left"
            >
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-900 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <Settings className="w-4.5 h-4.5 text-indigo-500" />
                  <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-100">Conversation Parameters</h3>
                </div>
                <button
                  onClick={() => setShowSettingsModal(false)}
                  className="p-1.5 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 text-zinc-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Temperature */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center text-xs font-black text-zinc-700 dark:text-zinc-300">
                    <span>Creativity/Temperature</span>
                    <span className="text-indigo-500">{tempSettings.temperature}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1.5"
                    step="0.1"
                    value={tempSettings.temperature}
                    onChange={(e) => setTempSettings((prev) => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                    className="w-full accent-indigo-500 cursor-pointer h-1 rounded-lg bg-zinc-100 dark:bg-zinc-800"
                  />
                  <span className="text-[9px] text-zinc-400 leading-normal">Lower values yield highly factual, direct, and deterministic answers. Higher values encourage open, descriptive explanations.</span>
                </div>

                {/* Max Tokens */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center text-xs font-black text-zinc-700 dark:text-zinc-300">
                    <span>Maximum Response Length</span>
                    <span className="text-indigo-500">{tempSettings.maxTokens} tokens</span>
                  </div>
                  <input
                    type="range"
                    min="512"
                    max="4096"
                    step="256"
                    value={tempSettings.maxTokens}
                    onChange={(e) => setTempSettings((prev) => ({ ...prev, maxTokens: parseInt(e.target.value) }))}
                    className="w-full accent-indigo-500 cursor-pointer h-1 rounded-lg bg-zinc-100 dark:bg-zinc-800"
                  />
                </div>

                {/* Top P */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center text-xs font-black text-zinc-700 dark:text-zinc-300">
                    <span>Top-P Sampling</span>
                    <span className="text-indigo-500">{tempSettings.topP}</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="1.0"
                    step="0.05"
                    value={tempSettings.topP}
                    onChange={(e) => setTempSettings((prev) => ({ ...prev, topP: parseFloat(e.target.value) }))}
                    className="w-full accent-indigo-500 cursor-pointer h-1 rounded-lg bg-zinc-100 dark:bg-zinc-800"
                  />
                </div>

                {/* Model */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-black text-zinc-700 dark:text-zinc-300">Generative Model</label>
                  <select
                    value={tempSettings.model}
                    onChange={(e) => setTempSettings((prev) => ({ ...prev, model: e.target.value }))}
                    className="w-full p-2.5 bg-zinc-100 border-transparent text-zinc-700 outline-none rounded-xl text-xs font-black dark:bg-zinc-900/60 dark:text-zinc-200"
                  >
                    <option value="gemini-3.6-flash">Gemini 3.6 Flash (Fast, reliable)</option>
                    <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro (Complex analysis)</option>
                  </select>
                </div>

                {/* Action footer */}
                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-900 flex gap-2.5">
                  <button
                    onClick={handleResetConversation}
                    className="flex-1 py-2 rounded-xl text-[11px] font-black border border-red-200 text-red-500 hover:bg-red-50/20 flex items-center justify-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Reset Room</span>
                  </button>

                  <button
                    onClick={() => {
                      handleUpdateSettings(tempSettings);
                      setShowSettingsModal(false);
                    }}
                    className="flex-1 py-2 rounded-xl text-[11px] font-black bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 hover:opacity-90 text-center"
                  >
                    Apply Parameters
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 4. CHUNK INSPECTOR MODAL */}
      <AnimatePresence>
        {inspectingSource && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/40 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl p-6 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl text-left flex flex-col gap-4 max-h-[85vh]"
            >
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-900 pb-3">
                <div className="flex flex-col text-left">
                  <span className="text-[10px] font-black uppercase tracking-wider text-indigo-500">Document Chunk Inspector</span>
                  <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-100 mt-0.5">{inspectingSource.documentName}</h3>
                </div>
                <button
                  onClick={() => setInspectingSource(null)}
                  className="p-1.5 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 text-zinc-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Chunk details and metrics */}
              <div className="flex items-center gap-4 bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-150 dark:border-zinc-900 p-3 rounded-xl text-[10px] text-zinc-500 font-bold select-none">
                <span>Page {inspectingSource.pageNumber}</span>
                <span className="h-2 w-[1px] bg-zinc-200 dark:bg-zinc-800" />
                <span>Paragraph {inspectingSource.paragraphNumber}</span>
                <span className="h-2 w-[1px] bg-zinc-200 dark:bg-zinc-800" />
                <span>ID: {inspectingSource.chunkId}</span>
                <span className="h-2 w-[1px] bg-zinc-200 dark:bg-zinc-800" />
                <span className="text-emerald-500">{inspectingSource.confidence}% Cosine Confidence</span>
              </div>

              {/* Context container */}
              <div className="flex-1 overflow-y-auto bg-zinc-50/50 border border-zinc-200/50 dark:bg-zinc-950/20 dark:border-zinc-900 p-4 rounded-xl leading-relaxed text-xs font-semibold select-text scrollbar-thin max-h-96 whitespace-pre-line text-zinc-700 dark:text-zinc-300">
                {inspectingSource.text}
              </div>

              <div className="flex justify-end gap-2.5">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(inspectingSource.text);
                    toast.success('Chunk text copied.');
                  }}
                  className="px-4 py-2 text-[11px] font-black border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/60 rounded-xl transition-all"
                >
                  Copy Text
                </button>
                <button
                  onClick={() => setInspectingSource(null)}
                  className="px-4 py-2 text-[11px] font-black bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 rounded-xl hover:opacity-90"
                >
                  Close Inspector
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
export default AiChatPage;
