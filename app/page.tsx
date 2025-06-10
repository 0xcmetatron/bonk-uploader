"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, Download, Share2, Shield, Zap, Users } from "lucide-react"
import Image from "next/image"
import { WalletConnection } from "@/components/wallet-connection"
import { FileUpload } from "@/components/file-upload"
import { FileList } from "@/components/file-list"
import { GlobalChat } from "@/components/global-chat"

export default function HomePage() {
  const [user, setUser] = useState<{ publicKey: string; nickname: string } | null>(null)
  const [showUpload, setShowUpload] = useState(false)
  const [refreshFiles, setRefreshFiles] = useState(0)

  const handleUploadComplete = () => {
    setRefreshFiles((prev) => prev + 1)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-400 via-yellow-400 to-orange-500">
      {/* Header */}
      <header className="border-b border-orange-300/20 backdrop-blur-sm bg-white/10 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative w-12 h-12 animate-pulse">
              <Image src="/logo.png" alt="BonkUpload Logo" fill className="object-contain drop-shadow-lg" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">BonkUpload</h1>
              <p className="text-orange-100 text-sm font-medium">Fast & Simple File Sharing</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* X.com Link */}
            <a
              href="https://x.com/bonkupload"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 bg-black/20 hover:bg-black/30 text-white px-3 py-2 rounded-full transition-all duration-300 hover:scale-105"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              <span className="text-sm font-medium">@bonkupload</span>
            </a>

            <WalletConnection user={user} setUser={setUser} />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-400/20 via-yellow-400/20 to-orange-500/20 animate-pulse"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="relative w-32 h-32 mx-auto mb-8 animate-bounce">
              <div className="absolute inset-0 bg-yellow-300/30 rounded-full blur-xl animate-ping"></div>
              <Image src="/logo.png" alt="BonkUpload" fill className="object-contain drop-shadow-2xl relative z-10" />
            </div>
            <h2 className="text-5xl md:text-7xl font-bold text-white mb-6 animate-fade-in bg-gradient-to-r from-white via-yellow-200 to-white bg-clip-text text-transparent">
              Welcome to <span className="text-yellow-200">BonkUpload</span>
            </h2>
            <p className="text-xl md:text-2xl text-orange-100 mb-8 max-w-2xl mx-auto font-light">
              The official Bonk app to upload, download, and share files — fast and simple.
            </p>

            {user ? (
              <div className="space-y-4">
                <p className="text-lg text-white">
                  Welcome back, <span className="font-bold text-yellow-200">{user.nickname}</span>!
                </p>
                <Button
                  onClick={() => setShowUpload(!showUpload)}
                  size="lg"
                  className="bg-white text-orange-500 hover:bg-orange-50 font-semibold px-8 py-4 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  <Upload className="mr-2 h-5 w-5" />
                  Start Uploading
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-lg text-orange-100">Connect your Phantom wallet to get started</p>
                <div className="flex justify-center space-x-4">
                  <div className="flex items-center space-x-2 bg-white/20 rounded-full px-4 py-2">
                    <Shield className="h-5 w-5 text-white" />
                    <span className="text-white">Secure</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-white/20 rounded-full px-4 py-2">
                    <Zap className="h-5 w-5 text-white" />
                    <span className="text-white">Fast</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-white/20 rounded-full px-4 py-2">
                    <Users className="h-5 w-5 text-white" />
                    <span className="text-white">Community</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white/10 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="bg-white/20 border-orange-300/30 backdrop-blur-sm hover:bg-white/30 transition-all duration-300 transform hover:scale-105">
              <CardContent className="p-6 text-center">
                <Upload className="h-12 w-12 text-white mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Easy Upload</h3>
                <p className="text-orange-100">Drag and drop your images for instant upload</p>
              </CardContent>
            </Card>

            <Card className="bg-white/20 border-orange-300/30 backdrop-blur-sm hover:bg-white/30 transition-all duration-300 transform hover:scale-105">
              <CardContent className="p-6 text-center">
                <Download className="h-12 w-12 text-white mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Quick Download</h3>
                <p className="text-orange-100">Access your files anytime, anywhere</p>
              </CardContent>
            </Card>

            <Card className="bg-white/20 border-orange-300/30 backdrop-blur-sm hover:bg-white/30 transition-all duration-300 transform hover:scale-105">
              <CardContent className="p-6 text-center">
                <Share2 className="h-12 w-12 text-white mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Share Instantly</h3>
                <p className="text-orange-100">Share files with the community</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Upload Section */}
      {user && showUpload && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <FileUpload user={user} onUploadComplete={handleUploadComplete} />
          </div>
        </section>
      )}

      {/* File List Section */}
      {user && (
        <section className="py-16 bg-white/10 backdrop-blur-sm">
          <div className="container mx-auto px-4">
            <FileList user={user} refreshTrigger={refreshFiles} />
          </div>
        </section>
      )}

      {/* Global Chat */}
      <GlobalChat user={user} />

      {/* Footer */}
      <footer className="py-8 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-4 text-center">
          <p className="text-orange-100">© 2025 BonkUpload.</p>
        </div>
      </footer>
    </div>
  )
}
