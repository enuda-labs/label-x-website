import { Brain } from 'lucide-react'

const WelcomeHeader = () => {
  return (
    <div className="mb-8 space-y-6 text-center">
      <div className="space-y-4">
        <div className="from-primary/20 to-primary-glow/20 border-primary/20 inline-flex items-center justify-center rounded-2xl border bg-gradient-to-r p-3 backdrop-blur-sm">
          <Brain className="text-primary h-8 w-8" />
        </div>
        <h1 className="bg-gradient-to-r from-white to-white/80 bg-clip-text text-3xl font-bold text-transparent md:text-4xl">
          Welcome to LabelX
        </h1>
        <p className="mx-auto max-w-md text-base leading-relaxed text-white/70">
          The intelligent platform for precise AI data annotation and training
        </p>
      </div>

      {/* <div className="mx-auto grid max-w-sm grid-cols-3 gap-4">
        <div className="flex flex-col items-center space-y-2 rounded-lg border border-white/10 bg-white/5 p-3 backdrop-blur-sm">
          <Database className="text-primary h-5 w-5" />
          <span className="text-xs font-medium text-white/60">Smart Data</span>
        </div>
        <div className="flex flex-col items-center space-y-2 rounded-lg border border-white/10 bg-white/5 p-3 backdrop-blur-sm">
          <Target className="text-primary h-5 w-5" />
          <span className="text-xs font-medium text-white/60">Precision</span>
        </div>
        <div className="flex flex-col items-center space-y-2 rounded-lg border border-white/10 bg-white/5 p-3 backdrop-blur-sm">
          <Zap className="text-primary h-5 w-5" />
          <span className="text-xs font-medium text-white/60">AI Powered</span>
        </div>
      </div> */}

      {/* <div className="flex items-center justify-center space-x-6 text-sm text-white/50">
        <div className="flex items-center space-x-1">
          <div className="h-2 w-2 rounded-full bg-green-400"></div>
          <span>Secure</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="h-2 w-2 rounded-full bg-blue-400"></div>
          <span>Enterprise Ready</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="h-2 w-2 rounded-full bg-purple-400"></div>
          <span>AI Optimized</span>
        </div>
      </div> */}
    </div>
  )
}

export default WelcomeHeader
