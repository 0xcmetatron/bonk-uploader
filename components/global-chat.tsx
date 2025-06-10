"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageCircle, Send, X, Minimize2, Maximize2, Crown, Volume2, RefreshCw } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface Message {
  id: number
  nickname: string
  message: string
  timestamp: string
  user_public_key?: string
}

interface GlobalChatProps {
  user: { publicKey: string; nickname: string } | null
}

const ADMIN_WALLET = "GbzJFTsJjsEPki8qwLZgumCRFdHzpGx5RvKbz7fLmVSf"

export function GlobalChat({ user }: GlobalChatProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(false)
  const [lastMessageCount, setLastMessageCount] = useState(0)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    fetchMessages()
    const interval = setInterval(fetchMessages, 2000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (messages.length > lastMessageCount && lastMessageCount > 0 && soundEnabled && !isOpen) {
      playNotificationSound()
    }
    setLastMessageCount(messages.length)
  }, [messages.length, lastMessageCount, soundEnabled, isOpen])

  const playNotificationSound = () => {
    try {
      // Create a simple beep sound using Web Audio API
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.value = 800
      oscillator.type = "sine"

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.5)
    } catch (error) {
      console.log("Audio playback failed:", error)
    }
  }

  const fetchMessages = async () => {
    if (loading) return

    try {
      setLoading(true)
      const response = await fetch("/api/chat/messages", {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      console.log("Fetched messages:", result)

      if (result.success) {
        setMessages(result.messages || [])
      } else {
        console.error("Failed to fetch messages:", result.error)
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error)
    } finally {
      setLoading(false)
    }
  }

  const sendMessage = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Connect your wallet to send messages",
        variant: "destructive",
      })
      return
    }

    if (!newMessage.trim()) return

    setSending(true)

    try {
      console.log("Sending message:", {
        nickname: user.nickname,
        message: newMessage.trim(),
        userPublicKey: user.publicKey,
      })

      const response = await fetch("/api/chat/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nickname: user.nickname,
          message: newMessage.trim(),
          userPublicKey: user.publicKey,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      console.log("Send message result:", result)

      if (result.success) {
        setNewMessage("")
        if (soundEnabled) {
          playNotificationSound()
        }
        // Immediate refresh
        setTimeout(fetchMessages, 500)
        toast({
          title: "Message sent!",
          description: "Your message has been sent successfully",
          duration: 2000,
        })
      } else {
        throw new Error(result.error || "Failed to send message")
      }
    } catch (error) {
      console.error("Send message error:", error)
      toast({
        title: "Error",
        description: `Failed to send message: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      })
    }

    setSending(false)
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const isAdmin = (publicKey?: string) => {
    return publicKey === ADMIN_WALLET
  }

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110"
        >
          <MessageCircle className="h-6 w-6" />
          {messages.length > 0 && (
            <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
              {messages.length > 99 ? "99+" : messages.length}
            </div>
          )}
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card
        className={`bg-white/95 backdrop-blur-sm border-orange-300 shadow-2xl transition-all duration-300 ${
          isMinimized ? "w-80 h-12" : "w-80 h-96"
        } animate-in slide-in-from-bottom-4`}
      >
        <CardHeader className="p-3 bg-gradient-to-r from-orange-400 to-yellow-400 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold">
              Global Chat ({messages.length}) {loading && <RefreshCw className="inline h-3 w-3 animate-spin ml-1" />}
            </CardTitle>
            <div className="flex items-center space-x-1">
              <Button
                onClick={() => setSoundEnabled(!soundEnabled)}
                size="sm"
                variant="ghost"
                className={`h-6 w-6 p-0 text-white hover:bg-white/20 ${soundEnabled ? "opacity-100" : "opacity-50"}`}
                title={soundEnabled ? "Disable sounds" : "Enable sounds"}
              >
                <Volume2 className="h-3 w-3" />
              </Button>
              <Button
                onClick={fetchMessages}
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 text-white hover:bg-white/20"
                title="Refresh messages"
              >
                <RefreshCw className="h-3 w-3" />
              </Button>
              <Button
                onClick={() => setIsMinimized(!isMinimized)}
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 text-white hover:bg-white/20"
              >
                {isMinimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
              </Button>
              <Button
                onClick={() => setIsOpen(false)}
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 text-white hover:bg-white/20"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {!isMinimized && (
          <CardContent className="p-0 flex flex-col h-80">
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {messages.length === 0 ? (
                <div className="text-center py-8">
                  <MessageCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">No messages yet. Start the conversation!</p>
                </div>
              ) : (
                messages.map((msg, index) => (
                  <div
                    key={`${msg.id}-${index}`}
                    className={`text-sm p-2 rounded-lg transition-all duration-300 ${
                      isAdmin(msg.user_public_key)
                        ? "bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200"
                        : "bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center space-x-2 mb-1">
                      {isAdmin(msg.user_public_key) ? (
                        <div className="flex items-center space-x-1">
                          <Crown className="h-3 w-3 text-yellow-500" />
                          <span className="font-bold text-transparent bg-gradient-to-r from-yellow-600 via-orange-600 to-red-600 bg-clip-text">
                            {msg.nickname}
                          </span>
                          <span className="text-xs bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-1 rounded text-[10px]">
                            ADMIN
                          </span>
                        </div>
                      ) : (
                        <span className="font-semibold text-orange-600">{msg.nickname}</span>
                      )}
                      <span className="text-xs text-gray-400">{formatTime(msg.timestamp)}</span>
                    </div>
                    <p className={`${isAdmin(msg.user_public_key) ? "text-gray-800 font-medium" : "text-gray-700"}`}>
                      {msg.message}
                    </p>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-3 border-t border-gray-200 bg-white">
              {user ? (
                <div className="flex space-x-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={isAdmin(user.publicKey) ? "Speak as admin..." : "Type a message..."}
                    className="flex-1 text-sm"
                    onKeyPress={(e) => e.key === "Enter" && !sending && sendMessage()}
                    disabled={sending}
                    maxLength={500}
                  />
                  <Button
                    onClick={sendMessage}
                    size="sm"
                    disabled={sending || !newMessage.trim()}
                    className={`${
                      isAdmin(user.publicKey)
                        ? "bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
                        : "bg-orange-500 hover:bg-orange-600"
                    } text-white`}
                  >
                    {sending ? (
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                    ) : (
                      <Send className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              ) : (
                <div className="text-center py-2">
                  <p className="text-xs text-gray-500 mb-2">Connect your wallet to chat</p>
                </div>
              )}
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  )
}
