const FloatingElements = () => {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Floating neural network nodes */}
      <div className="bg-primary/30 absolute top-20 left-10 h-3 w-3 animate-pulse rounded-full"></div>
      <div className="absolute top-40 right-20 h-2 w-2 animate-pulse rounded-full bg-blue-400/40 delay-1000"></div>
      <div className="absolute bottom-40 left-20 h-4 w-4 animate-pulse rounded-full bg-purple-400/30 delay-2000"></div>
      <div className="bg-primary-glow/40 absolute right-10 bottom-20 h-2 w-2 animate-pulse rounded-full delay-500"></div>

      {/* Connecting lines */}
      <svg className="absolute inset-0 h-full w-full opacity-20">
        <line
          x1="10%"
          y1="20%"
          x2="30%"
          y2="40%"
          stroke="url(#gradient1)"
          strokeWidth="1"
          strokeDasharray="4,4"
          className="animate-pulse"
        />
        <line
          x1="70%"
          y1="30%"
          x2="90%"
          y2="50%"
          stroke="url(#gradient2)"
          strokeWidth="1"
          strokeDasharray="4,4"
          className="animate-pulse delay-1000"
        />
        <line
          x1="20%"
          y1="70%"
          x2="40%"
          y2="80%"
          stroke="url(#gradient3)"
          strokeWidth="1"
          strokeDasharray="4,4"
          className="animate-pulse delay-2000"
        />

        <defs>
          <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop
              offset="0%"
              stopColor="hsl(24, 100%, 50%)"
              stopOpacity="0.6"
            />
            <stop
              offset="100%"
              stopColor="hsl(24, 100%, 65%)"
              stopOpacity="0.2"
            />
          </linearGradient>
          <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop
              offset="0%"
              stopColor="hsl(220, 100%, 60%)"
              stopOpacity="0.6"
            />
            <stop
              offset="100%"
              stopColor="hsl(260, 100%, 70%)"
              stopOpacity="0.2"
            />
          </linearGradient>
          <linearGradient id="gradient3" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop
              offset="0%"
              stopColor="hsl(280, 100%, 60%)"
              stopOpacity="0.6"
            />
            <stop
              offset="100%"
              stopColor="hsl(300, 100%, 70%)"
              stopOpacity="0.2"
            />
          </linearGradient>
        </defs>
      </svg>

      <div className="border-primary/20 absolute top-1/4 left-1/4 h-16 w-16 rotate-45 animate-pulse border delay-3000"></div>
      <div className="absolute right-1/4 bottom-1/4 h-12 w-12 rotate-12 animate-pulse border border-blue-400/20 delay-4000"></div>
    </div>
  )
}

export default FloatingElements
