import React from 'react';
import {
  Play,
  RotateCcw,
  ShieldCheck,
  Smartphone,
  Sun,
  Moon,
} from 'lucide-react';
import { useAria } from '../../context/AriaContext';

interface HeaderProps {
  onOpenDemoModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenDemoModal }) => {
  const { project, modules, resetToDefault, isDemoActive, demoStep, theme, toggleTheme } = useAria();

  const cartModule = modules.find((m) => m.id === 'mod-checkout-cart');
  const cartRisk = cartModule ? cartModule.currentRiskWeight : 0.3;

  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur px-6 flex items-center justify-between z-20 transition-colors duration-150">
      {/* Left: Project Selector & Status */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60">
          <Smartphone className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{project.name}</span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">({project.targetPlatform})</span>
        </div>

        <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/60 text-blue-700 dark:text-blue-300 text-xs font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span>Autonomy Level 3 (Bounded Active)</span>
        </div>
      </div>

      {/* Right: Key Indicators, Theme Switcher & Demo Controls */}
      <div className="flex items-center gap-3">
        {/* Real-time Cart Module Risk Indicator */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 text-xs">
          <span className="text-slate-500 dark:text-slate-400 font-medium">checkout-cart Risk:</span>
          <span
            className={`font-mono font-bold ${
              cartRisk > 0.5 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
            }`}
          >
            {cartRisk.toFixed(3)}
          </span>
          {cartRisk > 0.5 && (
            <span className="text-[10px] bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 px-1.5 py-0.2 rounded border border-rose-300 dark:border-rose-800 font-semibold">
              AFP Elevated
            </span>
          )}
        </div>

        {/* Theme Toggle (Dark / Light) */}
        <button
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-700" />
          )}
        </button>

        {/* Guided Demo Button */}
        <button
          onClick={onOpenDemoModal}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs transition-colors shadow-sm active:scale-95"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>{isDemoActive ? `Demo Step ${demoStep}/8` : 'Run Demo Scenario'}</span>
        </button>

        {/* Reset Demo Button */}
        <button
          onClick={() => {
            if (confirm('Reset scenario data back to initial research baseline?')) {
              resetToDefault();
            }
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60 hover:text-slate-900 dark:hover:text-white text-xs transition-colors"
          title="Reset scenario data to baseline"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Reset</span>
        </button>
      </div>
    </header>
  );
};
