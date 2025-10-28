import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Shield, Users, Zap, TrendingUp, CheckCircle, AlertCircle } from 'lucide-react'

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard')
  const [selectedModule, setSelectedModule] = useState('auth')

  const modules = {
    auth: {
      name: 'Authentication',
      status: 'In Progress',
      progress: 75,
      tasks: [
        { name: 'Email/Password Setup', completed: true },
        { name: 'Google OAuth Integration', completed: true },
        { name: 'Discord OAuth Integration', completed: false },
        { name: 'Session Management', completed: false },
      ]
    },
    user: {
      name: 'User Management',
      status: 'Planning',
      progress: 40,
      tasks: [
        { name: 'User Profile Schema', completed: true },
        { name: 'Profile CRUD Operations', completed: false },
        { name: 'Preferences Management', completed: false },
        { name: 'User Stats Tracking', completed: false },
      ]
    },
    trader: {
      name: 'Trader Management',
      status: 'Planning',
      progress: 30,
      tasks: [
        { name: 'Trader Profile Schema', completed: false },
        { name: 'Verification Workflow', completed: false },
        { name: 'Performance Tracking', completed: false },
        { name: 'Contact Management', completed: false },
      ]
    },
    strategy: {
      name: 'Strategy Management',
      status: 'Planning',
      progress: 20,
      tasks: [
        { name: 'Strategy Schema Design', completed: false },
        { name: 'Performance Calculation', completed: false },
        { name: 'Backtesting Integration', completed: false },
        { name: 'Rule Management', completed: false },
      ]
    },
    leaderboard: {
      name: 'Ranking System',
      status: 'Planning',
      progress: 10,
      tasks: [
        { name: 'Leaderboard Schema', completed: false },
        { name: 'Real-time Ranking Update', completed: false },
        { name: 'Period Management', completed: false },
        { name: 'Community Scoring', completed: false },
      ]
    }
  }

  const firebaseServices = [
    { name: 'Firestore', icon: '🔥', description: 'Database & Queries', status: 'Active' },
    { name: 'Authentication', icon: '🔐', description: 'User Auth & Sessions', status: 'Active' },
    { name: 'Realtime DB', icon: '⚡', description: 'Live Data Sync', status: 'Ready' },
    { name: 'Cloud Functions', icon: '☁️', description: 'Automation & Logic', status: 'Ready' },
    { name: 'Storage', icon: '💾', description: 'Files & Images', status: 'Ready' },
    { name: 'Hosting', icon: '🚀', description: 'Web Deployment', status: 'Ready' },
  ]

  const phaseChecklist = [
    { item: 'Firebase config.js 완성', done: true },
    { item: 'authService.js 구현', done: true },
    { item: 'userService.js 구현', done: false },
    { item: 'traderService.js 구현', done: false },
    { item: 'strategyService.js 구현', done: false },
    { item: 'leaderboardService.js 구현', done: false },
    { item: 'Security Rules 배포', done: false },
    { item: 'Cloud Functions 배포', done: false },
  ]

  const moduleData = modules[selectedModule as keyof typeof modules]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-700/50 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
              <Shield className="w-6 h-6 text-slate-950 font-bold" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white font-serif tracking-wide">YOLOSEUM</h1>
              <p className="text-xs text-amber-400">Firebase Phase 2 Foundation</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant={currentPage === 'dashboard' ? 'default' : 'ghost'}
              onClick={() => setCurrentPage('dashboard')}
              className="text-sm"
            >
              Dashboard
            </Button>
            <Button
              variant={currentPage === 'modules' ? 'default' : 'ghost'}
              onClick={() => setCurrentPage('modules')}
              className="text-sm"
            >
              Modules
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {currentPage === 'dashboard' && (
          <div className="space-y-8">
            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-slate-400">Overall Progress</p>
                      <p className="text-3xl font-bold text-amber-400 mt-1">35%</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-amber-400/30" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-slate-400">Modules Active</p>
                      <p className="text-3xl font-bold text-cyan-400 mt-1">5</p>
                    </div>
                    <Zap className="w-8 h-8 text-cyan-400/30" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-slate-400">Tasks Completed</p>
                      <p className="text-3xl font-bold text-green-400 mt-1">2/8</p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-green-400/30" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-slate-400">Firebase Ready</p>
                      <p className="text-3xl font-bold text-violet-400 mt-1">6/6</p>
                    </div>
                    <Shield className="w-8 h-8 text-violet-400/30" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Firebase Services Status */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-400" />
                  Firebase Services Status
                </CardTitle>
                <CardDescription>All services configured and ready for integration</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {firebaseServices.map((service) => (
                    <div key={service.name} className="p-4 rounded-lg bg-slate-700/50 border border-slate-600 hover:border-amber-400/50 transition-colors">
                      <div className="text-3xl mb-2">{service.icon}</div>
                      <h4 className="font-semibold text-white text-sm">{service.name}</h4>
                      <p className="text-xs text-slate-400 my-1">{service.description}</p>
                      <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-0 text-xs">
                        {service.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Phase 2 Checklist */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  Phase 2: Core Module Implementation
                </CardTitle>
                <CardDescription>Week 2-3: Firebase 핵심 모듈 구현</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {phaseChecklist.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-slate-700/30">
                      <input
                        type="checkbox"
                        checked={item.done}
                        readOnly
                        className="w-5 h-5 rounded border-slate-600 text-amber-400"
                      />
                      <span className={`text-sm flex-1 ${item.done ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
                        {item.item}
                      </span>
                      {item.done && <CheckCircle className="w-4 h-4 text-green-400" />}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {currentPage === 'modules' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Module List */}
            <div className="lg:col-span-1">
              <Card className="bg-slate-800/50 border-slate-700 sticky top-24">
                <CardHeader>
                  <CardTitle className="text-base">Core Modules</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {Object.entries(modules).map(([key, module]) => (
                    <button
                      key={key}
                      onClick={() => setSelectedModule(key)}
                      className={`w-full text-left p-3 rounded-lg transition-all ${
                        selectedModule === key
                          ? 'bg-amber-400/20 border border-amber-400/50'
                          : 'bg-slate-700/30 hover:bg-slate-700/50 border border-slate-600'
                      }`}
                    >
                      <div className="font-medium text-sm text-white">{module.name}</div>
                      <div className="text-xs text-slate-400 mt-1">{module.status}</div>
                    </button>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Module Details */}
            <div className="lg:col-span-2">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{moduleData.name}</CardTitle>
                      <CardDescription>Implementation Status</CardDescription>
                    </div>
                    <Badge
                      variant="outline"
                      className={`${
                        moduleData.status === 'In Progress'
                          ? 'bg-blue-500/20 text-blue-400 border-blue-400/50'
                          : 'bg-slate-600/20 text-slate-300 border-slate-500/50'
                      }`}
                    >
                      {moduleData.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-slate-300">Progress</span>
                      <span className="text-sm font-bold text-amber-400">{moduleData.progress}%</span>
                    </div>
                    <Progress value={moduleData.progress} className="h-2" />
                  </div>

                  <div>
                    <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-amber-400" />
                      Tasks
                    </h4>
                    <div className="space-y-3">
                      {moduleData.tasks.map((task, idx) => (
                        <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-slate-700/30 border border-slate-600/50">
                          <input
                            type="checkbox"
                            checked={task.completed}
                            readOnly
                            className="w-4 h-4 mt-0.5 rounded border-slate-600"
                          />
                          <div className="flex-1">
                            <p className={`text-sm ${task.completed ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
                              {task.name}
                            </p>
                          </div>
                          {task.completed ? (
                            <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-600">
                    <Button className="w-full bg-amber-600 hover:bg-amber-700">
                      View Details & Code
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
