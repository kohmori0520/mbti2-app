import React from 'react'

interface AnimatedBackgroundProps {
  variant?: 'gradient' | 'particles' | 'waves' | 'geometric' | 'aurora'
  intensity?: 'subtle' | 'normal' | 'strong'
  speed?: 'slow' | 'normal' | 'fast'
  colors?: string[]
  className?: string
}

export default function AnimatedBackground({
  variant = 'gradient',
  intensity = 'normal',
  speed = 'normal',
  colors = ['#667eea', '#764ba2', '#f093fb'],
  className = ''
}: AnimatedBackgroundProps) {
  const speedValue = {
    slow: '20s',
    normal: '15s', 
    fast: '10s'
  }[speed]

  const intensityValue = {
    subtle: 0.3,
    normal: 0.6,
    strong: 1
  }[intensity]

  const renderGradient = () => (
    <div className={`animated-gradient ${className}`}>
      <style>{`
        .animated-gradient {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(
            45deg,
            ${colors[0]}40,
            ${colors[1]}40,
            ${colors[2]}40
          );
          background-size: 400% 400%;
          animation: gradientFlow ${speedValue} ease-in-out infinite;
          opacity: ${intensityValue};
        }
        
        @keyframes gradientFlow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  )

  const renderParticles = () => (
    <div className={`animated-particles ${className}`}>
      {Array.from({ length: 50 }, (_, i) => (
        <div
          key={i}
          className="particle"
          style={{
            '--delay': `${Math.random() * 20}s`,
            '--duration': `${15 + Math.random() * 10}s`,
            '--x': `${Math.random() * 100}%`,
            '--y': `${Math.random() * 100}%`,
            '--size': `${2 + Math.random() * 4}px`,
            '--color': colors[Math.floor(Math.random() * colors.length)]
          } as React.CSSProperties}
        />
      ))}
      
      <style>{`
        .animated-particles {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          overflow: hidden;
          opacity: ${intensityValue};
        }
        
        .particle {
          position: absolute;
          left: var(--x);
          top: var(--y);
          width: var(--size);
          height: var(--size);
          background: var(--color);
          border-radius: 50%;
          animation: float var(--duration) linear infinite var(--delay);
          opacity: 0.6;
        }
        
        @keyframes float {
          0% {
            transform: translateY(100vh) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 0.6;
          }
          90% {
            opacity: 0.6;
          }
          100% {
            transform: translateY(-10vh) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )

  const renderWaves = () => (
    <div className={`animated-waves ${className}`}>
      <svg
        viewBox="0 0 1200 120"
        preserveAspectRatio="none"
        className="wave-svg"
      >
        <path
          d="M0,60 C200,100 400,20 600,60 C800,100 1000,20 1200,60 L1200,120 L0,120 Z"
          className="wave-path wave-1"
        />
        <path
          d="M0,80 C200,40 400,120 600,80 C800,40 1000,120 1200,80 L1200,120 L0,120 Z"
          className="wave-path wave-2"
        />
      </svg>
      
      <style>{`
        .animated-waves {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 120px;
          overflow: hidden;
          opacity: ${intensityValue};
        }
        
        .wave-svg {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }
        
        .wave-path {
          animation: waveFlow ${speedValue} ease-in-out infinite;
        }
        
        .wave-1 {
          fill: ${colors[0]}40;
          animation-delay: 0s;
        }
        
        .wave-2 {
          fill: ${colors[1]}30;
          animation-delay: -5s;
        }
        
        @keyframes waveFlow {
          0%, 100% {
            transform: translateX(0);
          }
          50% {
            transform: translateX(-50px);
          }
        }
      `}</style>
    </div>
  )

  const renderGeometric = () => (
    <div className={`animated-geometric ${className}`}>
      {Array.from({ length: 20 }, (_, i) => (
        <div
          key={i}
          className="geometric-shape"
          style={{
            '--delay': `${Math.random() * 10}s`,
            '--x': `${Math.random() * 100}%`,
            '--y': `${Math.random() * 100}%`,
            '--size': `${20 + Math.random() * 60}px`,
            '--rotation': `${Math.random() * 360}deg`,
            '--color': colors[Math.floor(Math.random() * colors.length)]
          } as React.CSSProperties}
        />
      ))}
      
      <style>{`
        .animated-geometric {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          overflow: hidden;
          opacity: ${intensityValue * 0.5};
        }
        
        .geometric-shape {
          position: absolute;
          left: var(--x);
          top: var(--y);
          width: var(--size);
          height: var(--size);
          background: var(--color);
          clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
          animation: geometricFloat ${speedValue} ease-in-out infinite var(--delay);
          transform: rotate(var(--rotation));
        }
        
        @keyframes geometricFloat {
          0%, 100% {
            transform: rotate(var(--rotation)) translateY(0) scale(1);
            opacity: 0.3;
          }
          50% {
            transform: rotate(calc(var(--rotation) + 180deg)) translateY(-20px) scale(1.2);
            opacity: 0.7;
          }
        }
      `}</style>
    </div>
  )

  const renderAurora = () => (
    <div className={`animated-aurora ${className}`}>
      <div className="aurora-layer aurora-1" />
      <div className="aurora-layer aurora-2" />
      <div className="aurora-layer aurora-3" />
      
      <style>{`
        .animated-aurora {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          overflow: hidden;
          opacity: ${intensityValue};
        }
        
        .aurora-layer {
          position: absolute;
          top: -50%;
          left: -50%;
          right: -50%;
          bottom: -50%;
          background: radial-gradient(ellipse at center, 
            ${colors[0]}20 0%, 
            ${colors[1]}15 25%, 
            transparent 70%);
          animation: auroraMove ${speedValue} ease-in-out infinite;
        }
        
        .aurora-1 {
          animation-delay: 0s;
          transform: rotate(0deg);
        }
        
        .aurora-2 {
          background: radial-gradient(ellipse at center, 
            ${colors[1]}20 0%, 
            ${colors[2]}15 25%, 
            transparent 70%);
          animation-delay: -5s;
          transform: rotate(120deg);
        }
        
        .aurora-3 {
          background: radial-gradient(ellipse at center, 
            ${colors[2]}20 0%, 
            ${colors[0]}15 25%, 
            transparent 70%);
          animation-delay: -10s;
          transform: rotate(240deg);
        }
        
        @keyframes auroraMove {
          0%, 100% {
            transform: rotate(var(--rotation, 0deg)) scale(1);
          }
          33% {
            transform: rotate(calc(var(--rotation, 0deg) + 30deg)) scale(1.1);
          }
          66% {
            transform: rotate(calc(var(--rotation, 0deg) - 20deg)) scale(0.9);
          }
        }
      `}</style>
    </div>
  )

  const variants = {
    gradient: renderGradient,
    particles: renderParticles,
    waves: renderWaves,
    geometric: renderGeometric,
    aurora: renderAurora
  }

  return (
    <div className="animated-background-container">
      {variants[variant]()}
      
      <style>{`
        .animated-background-container {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
          z-index: -1;
        }
        
        @media (prefers-reduced-motion: reduce) {
          .animated-background-container * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </div>
  )
}