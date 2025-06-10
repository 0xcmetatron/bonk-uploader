"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Wallet, LogOut } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface User {
  publicKey: string
  nickname: string
}

interface WalletConnectionProps {
  user: User | null
  setUser: (user: User | null) => void
}

export function WalletConnection({ user, setUser }: WalletConnectionProps) {
  const [isConnecting, setIsConnecting] = useState(false)
  const [showNicknameDialog, setShowNicknameDialog] = useState(false)
  const [nickname, setNickname] = useState("")
  const [tempPublicKey, setTempPublicKey] = useState("")

  const connectWallet = async () => {
    setIsConnecting(true)

    try {
      // Check if Phantom wallet is installed
      if (typeof window !== "undefined" && "solana" in window) {
        const solana = (window as any).solana

        if (solana.isPhantom) {
          const response = await solana.connect()
          const publicKey = response.publicKey.toString()

          // Check if user already exists
          const checkResponse = await fetch("/api/users/check", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ publicKey }),
          })

          const userData = await checkResponse.json()

          if (userData.exists) {
            setUser({ publicKey, nickname: userData.nickname })
            toast({
              title: "Welcome back!",
              description: `Connected as ${userData.nickname}`,
            })
          } else {
            setTempPublicKey(publicKey)
            setShowNicknameDialog(true)
          }
        }
      } else {
        toast({
          title: "Phantom Wallet not found",
          description: "Please install Phantom wallet to continue",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Connection failed",
        description: "Failed to connect to Phantom wallet",
        variant: "destructive",
      })
    }

    setIsConnecting(false)
  }

  const createAccount = async () => {
    if (!nickname.trim()) {
      toast({
        title: "Nickname required",
        description: "Please enter a nickname",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch("/api/users/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          publicKey: tempPublicKey,
          nickname: nickname.trim(),
        }),
      })

      const result = await response.json()

      if (result.success) {
        setUser({ publicKey: tempPublicKey, nickname: nickname.trim() })
        setShowNicknameDialog(false)
        setNickname("")
        toast({
          title: "Account created!",
          description: `Welcome to BonkUpload, ${nickname.trim()}!`,
        })
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to create account",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create account",
        variant: "destructive",
      })
    }
  }

  const disconnect = () => {
    setUser(null)
    toast({
      title: "Disconnected",
      description: "Wallet disconnected successfully",
    })
  }

  if (user) {
    return (
      <div className="flex items-center space-x-4">
        <span className="text-white font-medium">{user.nickname}</span>
        <Button
          onClick={disconnect}
          variant="outline"
          size="sm"
          className="bg-white/20 border-white/30 text-white hover:bg-white/30"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Disconnect
        </Button>
      </div>
    )
  }

  return (
    <>
      <Button
        onClick={connectWallet}
        disabled={isConnecting}
        className="bg-white text-orange-500 hover:bg-orange-50 font-semibold"
      >
        <Wallet className="h-4 w-4 mr-2" />
        {isConnecting ? "Connecting..." : "Connect Phantom"}
      </Button>

      <Dialog open={showNicknameDialog} onOpenChange={setShowNicknameDialog}>
        <DialogContent className="bg-gradient-to-br from-orange-400 to-yellow-400 border-orange-300">
          <DialogHeader>
            <DialogTitle className="text-white">Choose Your Nickname</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Enter your nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="bg-white/20 border-white/30 text-white placeholder:text-white/70"
              onKeyPress={(e) => e.key === "Enter" && createAccount()}
            />
            <Button onClick={createAccount} className="w-full bg-white text-orange-500 hover:bg-orange-50">
              Create Account
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
