
import { useState, useEffect } from 'react'
import { Toaster } from "@/components/ui/toaster"
import { supabase } from '@/integrations/supabase/client'
import AuthScreen from './components/AuthScreen'
import OnboardingScreen from './components/OnboardingScreen'
import ChatInterface from './components/ChatInterface'
import ProjectsScreen from './components/ProjectsScreen'
import ProfileScreen from './components/ProfileScreen'
import SubscriptionScreen from './components/SubscriptionScreen'
import AccountSettingsScreen from './components/AccountSettingsScreen'
import './App.css'

type Screen = 'chat' | 'projects' | 'profile' | 'subscription' | 'settings'

function App() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [currentScreen, setCurrentScreen] = useState<Screen>('chat')
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [projectChatId, setProjectChatId] = useState<string | null>(null)
  const [conversationId, setConversationId] = useState<string | null>(null)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        console.log('Auth state changed: SIGNED_IN', session)
        setUser(session.user)
        
        // Check if user needs onboarding
        const needsOnboarding = !session.user.user_metadata?.onboarding_completed
        setShowOnboarding(needsOnboarding)
      } else {
        console.log('Auth state changed: SIGNED_OUT')
        setUser(null)
      }
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session)
      if (session?.user) {
        setUser(session.user)
        
        // Check if user needs onboarding
        const needsOnboarding = !session.user.user_metadata?.onboarding_completed
        setShowOnboarding(needsOnboarding)
      } else {
        setUser(null)
        setShowOnboarding(false)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleCompleteOnboarding = () => {
    setShowOnboarding(false)
  }

  const handleStartNewChat = (projectId?: string, conversationId?: string) => {
    setProjectChatId(projectId || null)
    setConversationId(conversationId || null)
    setCurrentScreen('chat')
  }

  const handleChatComplete = () => {
    setProjectChatId(null)
    setConversationId(null)
  }

  const handleAuth = (isAuth: boolean) => {
    // This function is called when authentication state changes
    if (isAuth) {
      setCurrentScreen('chat')
    }
  }

  const handleNavigateToSettings = () => {
    setCurrentScreen('subscription')
  }

  const handleBackToProfile = () => {
    setCurrentScreen('profile')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) {
    return <AuthScreen onAuth={handleAuth} setUser={setUser} />
  }

  if (showOnboarding) {
    return <OnboardingScreen user={user} onComplete={handleCompleteOnboarding} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-950">
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="w-64 bg-gray-900/50 backdrop-blur-sm border-r border-gray-800/30 flex flex-col">
          <div className="p-6 border-b border-gray-800/30">
            <h1 className="text-xl font-bold text-white">EezyBuild</h1>
            <p className="text-gray-400 text-sm">Building Regulations Assistant</p>
          </div>
          
          <nav className="flex-1 p-4">
            <div className="space-y-2">
              <button
                onClick={() => setCurrentScreen('chat')}
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                  currentScreen === 'chat'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'text-gray-300 hover:bg-gray-800/50'
                }`}
              >
                Chat
              </button>
              <button
                onClick={() => setCurrentScreen('projects')}
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                  currentScreen === 'projects'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'text-gray-300 hover:bg-gray-800/50'
                }`}
              >
                Projects
              </button>
              <button
                onClick={() => setCurrentScreen('profile')}
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                  currentScreen === 'profile'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'text-gray-300 hover:bg-gray-800/50'
                }`}
              >
                Profile
              </button>
              <button
                onClick={() => setCurrentScreen('subscription')}
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                  currentScreen === 'subscription'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'text-gray-300 hover:bg-gray-800/50'
                }`}
              >
                Subscription
              </button>
              <button
                onClick={() => setCurrentScreen('settings')}
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                  currentScreen === 'settings'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'text-gray-300 hover:bg-gray-800/50'
                }`}
              >
                Settings
              </button>
            </div>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          {currentScreen === 'chat' && (
            <ChatInterface 
              user={user} 
              onViewPlans={() => setCurrentScreen('subscription')} 
              projectId={projectChatId}
              conversationId={conversationId}
              onChatComplete={handleChatComplete}
            />
          )}
          {currentScreen === 'projects' && (
            <ProjectsScreen 
              user={user} 
              onStartNewChat={handleStartNewChat}
            />
          )}
          {currentScreen === 'profile' && (
            <ProfileScreen 
              user={user} 
              onNavigateToSettings={handleNavigateToSettings}
            />
          )}
          {currentScreen === 'subscription' && (
            <SubscriptionScreen 
              user={user} 
              onBack={handleBackToProfile}
            />
          )}
          {currentScreen === 'settings' && (
            <AccountSettingsScreen 
              user={user} 
              onBack={handleBackToProfile}
            />
          )}
        </div>
      </div>
      <Toaster />
    </div>
  )
}

export default App
