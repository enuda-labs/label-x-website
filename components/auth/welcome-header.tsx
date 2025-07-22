import { Brain, Database, Target, Zap } from "lucide-react";

const WelcomeHeader = () => {
  return (
    <div className="text-center mb-8 space-y-6">
      
      <div className="space-y-4">
        <div className="inline-flex items-center justify-center p-3 bg-gradient-to-r from-primary/20 to-primary-glow/20 rounded-2xl backdrop-blur-sm border border-primary/20">
          <Brain className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
          Welcome to LabelX
        </h1>
        <p className="text-xl text-white/70 max-w-md mx-auto leading-relaxed">
          The intelligent platform for precise AI data annotation and training
        </p>
      </div>

     
      <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto">
        <div className="flex flex-col items-center space-y-2 p-3 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10">
          <Database className="w-5 h-5 text-primary" />
          <span className="text-xs text-white/60 font-medium">Smart Data</span>
        </div>
        <div className="flex flex-col items-center space-y-2 p-3 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10">
          <Target className="w-5 h-5 text-primary" />
          <span className="text-xs text-white/60 font-medium">Precision</span>
        </div>
        <div className="flex flex-col items-center space-y-2 p-3 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10">
          <Zap className="w-5 h-5 text-primary" />
          <span className="text-xs text-white/60 font-medium">AI Powered</span>
        </div>
      </div>

    
      <div className="flex items-center justify-center space-x-6 text-sm text-white/50">
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          <span>Secure</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
          <span>Enterprise Ready</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
          <span>AI Optimized</span>
        </div>
      </div>
    </div>
  );
};

export default WelcomeHeader;