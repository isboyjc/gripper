import { useState, useEffect, createContext, useContext } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MousePointer2, 
  Pipette, 
  Type, 
  Download, 
  Layers, 
  Search,
  Keyboard,
  PanelRight,
  Github,
  ArrowRight,
  Check,
  Globe,
  Moon,
  Sun,
  Monitor,
  Menu,
  X,
  Zap,
  Shield,
  Code2,
  ChevronDown
} from 'lucide-react'
import { type Locale, type Messages, getMessages, detectLocale } from './i18n'

// ============ Types ============
type Theme = 'light' | 'dark' | 'system'

interface AppContextType {
  locale: Locale
  setLocale: (l: Locale) => void
  theme: Theme
  setTheme: (t: Theme) => void
  resolvedTheme: 'light' | 'dark'
  t: Messages
}

// ============ Context ============
const AppContext = createContext<AppContextType>({
  locale: 'en',
  setLocale: () => {},
  theme: 'system',
  setTheme: () => {},
  resolvedTheme: 'dark',
  t: getMessages('en'),
})

const useApp = () => useContext(AppContext)

// ============ Logo ============
function Logo({ size = 24, className = '' }: { size?: number; className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      className={className}
      fill="currentColor"
    >
      <path d="M.975 7q0-2.5 1.763-4.262T7 .974V3Q5.35 3 4.175 4.175T3 7zM5.3 18.725Q3.025 16.45 3.025 13.25T5.3 7.775L7.05 6l.3.3q.725.725.725 1.762T7.35 9.826l-.35.35q-.3.3-.3.713t.3.712l.9.9q.65.65.65 1.575T7.9 15.65l1.075 1.075q1.1-1.1 1.1-2.637T8.95 11.425l-.55-.55q.65-.65.925-1.463T9.55 7.75l4.475-4.475q.3-.3.713-.3t.712.3t.3.712t-.3.713l-4.675 4.675l1.05 1.05l6.025-6q.3-.3.7-.3t.7.3t.3.7t-.3.7l-6 6.025l1.05 1.05l5.3-5.3q.3-.3.713-.3t.712.3t.3.713t-.3.712l-5.3 5.3l1.05 1.05l4.05-4.05q.3-.3.713-.3t.712.3t.3.713t-.3.712l-6 5.975Q13.975 21 10.775 21T5.3 18.725m11.7 4.3V21q1.65 0 2.825-1.175T21 17h2.025q0 2.5-1.763 4.263T17 23.025"/>
    </svg>
  )
}

// ============ Browser Icons ============
function ChromeIcon({ size = 24, className = '' }: { size?: number; className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" className={className}>
      <path fill="currentColor" d="M12 20a8 8 0 0 1-6.91-12h4.09a4 4 0 0 0-1.18 2.83a4 4 0 0 0 4 4a4.05 4.05 0 0 0 3.51-2.1l2.47 4.27A7.94 7.94 0 0 1 12 20m8-8a7.94 7.94 0 0 1-.78 3.45L14.57 8a4 4 0 0 0-2.57-.93h-5a7.93 7.93 0 0 1 5-1.73A8 8 0 0 1 20 12m-8 4a4 4 0 0 0 4-4a4 4 0 0 0-4-4a4 4 0 0 0-4 4a4 4 0 0 0 4 4m0 6a10 10 0 0 0 10-10A10 10 0 0 0 12 2A10 10 0 0 0 2 12a10 10 0 0 0 10 10"/>
    </svg>
  )
}

function FirefoxIcon({ size = 24, className = '' }: { size?: number; className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" className={className}>
      <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10s10-4.48 10-10S17.52 2 12 2m4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19c-.14.75-.42 1-.68 1.03c-.58.05-1.02-.38-1.58-.75c-.88-.58-1.38-.94-2.23-1.5c-.99-.65-.35-1.01.22-1.59c.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.14-.03-.21-.02c-.09.02-1.49.95-4.22 2.79c-.4.27-.76.41-1.08.4c-.36-.01-1.04-.2-1.55-.37c-.63-.2-1.12-.31-1.08-.66c.02-.18.27-.36.74-.55c2.92-1.27 4.86-2.11 5.83-2.51c2.78-1.16 3.35-1.36 3.73-1.36c.08 0 .27.02.39.12c.1.08.13.19.14.27c-.01.06.01.24 0 .38"/>
    </svg>
  )
}

function EdgeIcon({ size = 24, className = '' }: { size?: number; className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" className={className}>
      <path fill="currentColor" d="M21 12a9 9 0 0 1-1.09 4.31A9 9 0 0 1 12 21a9.08 9.08 0 0 1-2-.22a7.45 7.45 0 0 0 3.82-2.11a3.71 3.71 0 0 1-3.29-2.36c2.67-.11 4.22-1.49 4.87-3a5.62 5.62 0 0 0 .42-2.31A5.21 5.21 0 0 0 13.32 6a5.5 5.5 0 0 0-5.25 4.16A17.26 17.26 0 0 1 8 8.44a6.54 6.54 0 0 1 3-5.26A9 9 0 0 1 21 12M3.82 9.07a9 9 0 0 1 4.11-5.28a7.58 7.58 0 0 0-1.72 4.83a6.87 6.87 0 0 0 .74 3.14c.55 1.18 1.45 2.58 3.15 3.68c-2.14.23-3.82-.38-5.26-2.36A8.89 8.89 0 0 1 3 9.51c.23-.15.5-.31.82-.44"/>
    </svg>
  )
}

// ============ Theme Toggle ============
function ThemeToggle() {
  const { theme, setTheme } = useApp()
  const [isOpen, setIsOpen] = useState(false)

  const options = [
    { value: 'light' as Theme, icon: Sun, label: 'Light' },
    { value: 'dark' as Theme, icon: Moon, label: 'Dark' },
    { value: 'system' as Theme, icon: Monitor, label: 'System' },
  ]
  
  const CurrentIcon = theme === 'light' ? Sun : theme === 'dark' ? Moon : Monitor

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-9 h-9 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
      >
        <CurrentIcon size={18} />
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="absolute right-0 top-full mt-2 w-36 rounded-md border border-border bg-card p-1 shadow-lg z-50"
            >
              {options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => { setTheme(option.value); setIsOpen(false) }}
                  className={`flex w-full items-center gap-2 rounded-sm px-3 py-2 text-sm transition-colors hover:bg-accent ${
                    theme === option.value ? 'bg-accent' : ''
                  }`}
                >
                  <option.icon size={16} />
                  {option.label}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

// ============ Language Toggle ============
function LanguageToggle() {
  const { locale, setLocale } = useApp()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="flex items-center gap-1.5 h-9 px-3 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
      >
        <Globe size={16} />
        <span className="hidden sm:inline">{locale === 'en' ? 'EN' : '中文'}</span>
        <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="absolute right-0 top-full mt-2 w-32 rounded-md border border-border bg-card p-1 shadow-lg z-50"
            >
              <button
                onClick={() => { setLocale('en'); setIsOpen(false) }}
                className={`flex w-full items-center px-3 py-2 text-sm rounded-sm transition-colors hover:bg-accent ${locale === 'en' ? 'bg-accent' : ''}`}
              >
                English
              </button>
              <button
                onClick={() => { setLocale('zh'); setIsOpen(false) }}
                className={`flex w-full items-center px-3 py-2 text-sm rounded-sm transition-colors hover:bg-accent ${locale === 'zh' ? 'bg-accent' : ''}`}
              >
                中文
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

// ============ Mobile Menu ============
function MobileMenu({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { t } = useApp()
  
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-72 bg-background border-l border-border z-50 md:hidden"
          >
            <div className="flex items-center justify-between p-4 border-b border-border">
              <span className="font-semibold">Menu</span>
              <button onClick={onClose} className="p-2 rounded-md hover:bg-accent transition-colors">
                <X size={20} />
              </button>
            </div>
            <nav className="p-4 space-y-1">
              <a href="#features" onClick={onClose} className="block px-4 py-3 rounded-md hover:bg-accent transition-colors">{t.nav.features}</a>
              <a href="#usage" onClick={onClose} className="block px-4 py-3 rounded-md hover:bg-accent transition-colors">{t.nav.usage}</a>
              <a href="#download" onClick={onClose} className="block px-4 py-3 rounded-md hover:bg-accent transition-colors">{t.nav.download}</a>
              <hr className="my-4 border-border" />
              <a href="https://github.com/isboyjc/gripper" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-4 py-3 rounded-md hover:bg-accent transition-colors">
                <Github size={18} />
                GitHub
              </a>
            </nav>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// ============ Header ============
function Header() {
  const { t } = useApp()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        isScrolled 
          ? 'bg-background/80 backdrop-blur-md border-b border-border shadow-sm' 
          : 'bg-transparent'
      }`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2.5 font-semibold text-foreground">
            <Logo size={24} />
            <span>Gripper</span>
          </a>
          
          <nav className="hidden md:flex items-center gap-1">
            <a href="#features" className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground rounded-md hover:bg-accent transition-colors">{t.nav.features}</a>
            <a href="#usage" className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground rounded-md hover:bg-accent transition-colors">{t.nav.usage}</a>
            <a href="#download" className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground rounded-md hover:bg-accent transition-colors">{t.nav.download}</a>
          </nav>
          
          <div className="flex items-center gap-1">
            <LanguageToggle />
            <ThemeToggle />
            <a 
              href="https://github.com/isboyjc/gripper" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hidden sm:flex items-center justify-center w-9 h-9 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <Github size={18} />
            </a>
            <a href="#download" className="hidden sm:block ml-2">
              <button className="h-9 px-4 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                {t.hero.downloadBtn}
              </button>
            </a>
            <button 
              className="flex md:hidden items-center justify-center w-9 h-9 rounded-md hover:bg-accent transition-colors" 
              onClick={() => setIsMenuOpen(true)}
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </header>
      <MobileMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </>
  )
}

// ============ Hero ============
function Hero() {
  const { t } = useApp()
  
  return (
    <section className="relative min-h-screen flex items-center justify-center hero-gradient pt-16">
      <div className="absolute inset-0 grid-pattern opacity-40" />
      
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border bg-muted text-sm text-muted-foreground mb-8">
            <Zap size={14} />
            <span>{t.hero.badge}</span>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="mb-6"
        >
          <Logo size={72} className="mx-auto mb-6 text-foreground" />
        </motion.div>
        
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-4 text-foreground"
        >
          Gripper
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-xl sm:text-2xl text-muted-foreground mb-4"
        >
          {t.hero.tagline}
        </motion.p>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="text-muted-foreground mb-10 max-w-2xl mx-auto"
        >
          {t.hero.description}
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <a href="#download">
            <button className="flex items-center justify-center gap-2 h-11 px-8 text-base font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors w-full sm:w-auto">
              <Download size={18} />
              {t.hero.downloadBtn}
            </button>
          </a>
          <a href="#features">
            <button className="flex items-center justify-center gap-2 h-11 px-8 text-base font-medium rounded-md border border-border bg-transparent hover:bg-accent transition-colors w-full sm:w-auto">
              {t.hero.learnMoreBtn}
              <ArrowRight size={18} />
            </button>
          </a>
        </motion.div>
      </div>
    </section>
  )
}

// ============ Features ============
function Features() {
  const { t } = useApp()
  
  const features = [
    { icon: MousePointer2, ...t.features.items.inspector },
    { icon: Pipette, ...t.features.items.colorPicker },
    { icon: Type, ...t.features.items.typography },
    { icon: Layers, ...t.features.items.boxModel },
    { icon: Download, ...t.features.items.assets },
    { icon: Search, ...t.features.items.search },
    { icon: PanelRight, ...t.features.items.sidePanel },
    { icon: Keyboard, ...t.features.items.shortcuts },
  ]

  return (
    <section id="features" className="py-24 sm:py-32 bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4 text-foreground">{t.features.title}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t.features.subtitle}
          </p>
        </div>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="p-6 rounded-lg border border-border bg-card hover:shadow-md transition-all"
            >
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center mb-4">
                <feature.icon size={20} className="text-foreground" />
              </div>
              <h3 className="font-semibold mb-2 text-card-foreground">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ============ Usage ============
function Usage() {
  const { t } = useApp()
  
  const shortcuts = [
    { key: 'V', action: t.usage.shortcutItems.inspector },
    { key: 'I', action: t.usage.shortcutItems.colorPicker },
    { key: 'F', action: t.usage.shortcutItems.search },
    { key: 'S', action: t.usage.shortcutItems.sidePanel },
    { key: 'A', action: t.usage.shortcutItems.inspectAll },
    { key: '↑', action: t.usage.shortcutItems.parent },
    { key: '↓', action: t.usage.shortcutItems.child },
    { key: 'P', action: t.usage.shortcutItems.pause },
    { key: 'Esc', action: t.usage.shortcutItems.close },
  ]
  
  const steps = [
    { step: '1', ...t.usage.steps.install },
    { step: '2', ...t.usage.steps.activate },
    { step: '3', ...t.usage.steps.inspect },
    { step: '4', ...t.usage.steps.sidePanel },
  ]

  return (
    <section id="usage" className="py-24 sm:py-32 bg-muted">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4 text-foreground">{t.usage.title}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t.usage.subtitle}
          </p>
        </div>
        
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Steps */}
          <div>
            <h3 className="text-xl font-semibold mb-8 text-foreground">{t.usage.quickStart}</h3>
            <div className="space-y-6">
              {steps.map((item, index) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex gap-4"
                >
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground font-semibold flex items-center justify-center shrink-0 text-sm">
                    {item.step}
                  </div>
                  <div>
                    <h4 className="font-medium mb-1 text-foreground">{item.title}</h4>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
          
          {/* Shortcuts */}
          <div className="p-6 rounded-lg border border-border bg-card shadow-sm">
            <h3 className="text-xl font-semibold mb-6 flex items-center gap-3 text-card-foreground">
              <Keyboard size={20} />
              {t.usage.shortcuts}
            </h3>
            
            <div className="grid grid-cols-2 gap-3">
              {shortcuts.map((shortcut) => (
                <div key={shortcut.key} className="flex items-center justify-between p-3 rounded-md bg-muted">
                  <span className="text-sm text-muted-foreground">{shortcut.action}</span>
                  <kbd className="px-2 py-1 bg-background border border-border rounded text-xs font-mono text-foreground">
                    {shortcut.key}
                  </kbd>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ============ Download ============
function DownloadSection() {
  const { t } = useApp()
  
  const browsers = [
    { name: 'Chrome', icon: ChromeIcon, url: '#', available: false },
    { name: 'Firefox', icon: FirefoxIcon, url: '#', available: false },
    { name: 'Edge', icon: EdgeIcon, url: '#', available: false },
  ]
  
  return (
    <section id="download" className="py-24 sm:py-32 bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4 text-foreground">{t.download.title}</h2>
        <p className="text-muted-foreground mb-12 max-w-2xl mx-auto">
          {t.download.subtitle}
        </p>
        
        <div className="grid sm:grid-cols-3 gap-6 mb-12">
          {browsers.map((browser) => (
            <div 
              key={browser.name}
              className={`p-8 rounded-lg border border-border bg-card text-center transition-all ${
                browser.available 
                  ? 'hover:shadow-lg hover:border-primary cursor-pointer' 
                  : 'opacity-60 cursor-not-allowed'
              }`}
            >
              <browser.icon size={48} className="mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2 text-card-foreground">{browser.name}</h3>
              <p className="text-sm text-muted-foreground">
                {browser.available ? t.download.downloadNow : t.download.comingSoon}
              </p>
              {browser.available && (
                <button className="mt-4 flex items-center justify-center gap-2 h-9 px-4 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors mx-auto">
                  <Download size={16} />
                  Download
                </button>
              )}
            </div>
          ))}
        </div>
        
        <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Check size={16} className="text-green-600 dark:text-green-500" />
            <span>{t.download.features.free}</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield size={16} className="text-green-600 dark:text-green-500" />
            <span>{t.download.features.noData}</span>
          </div>
          <div className="flex items-center gap-2">
            <Code2 size={16} className="text-green-600 dark:text-green-500" />
            <span>{t.download.features.openSource}</span>
          </div>
        </div>
      </div>
    </section>
  )
}

// ============ Footer ============
function Footer() {
  const { t } = useApp()
  
  return (
    <footer className="py-8 border-t border-border bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-foreground">
            <Logo size={20} />
            <span className="font-semibold">Gripper</span>
          </div>
          
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <a href="https://github.com/isboyjc/gripper" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors flex items-center gap-1">
              <Github size={16} />
              GitHub
            </a>
            <a href="https://github.com/isboyjc/gripper/issues" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
              {t.footer.reportIssue}
            </a>
          </div>
          
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Gripper. {t.footer.license}
          </p>
        </div>
      </div>
    </footer>
  )
}

// ============ App ============
export default function App() {
  const [locale, setLocale] = useState<Locale>(() => {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('gripper-locale') as Locale | null
      if (saved === 'en' || saved === 'zh') return saved
    }
    return detectLocale()
  })
  
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('gripper-theme') as Theme | null
      if (saved === 'light' || saved === 'dark' || saved === 'system') return saved
    }
    return 'system'
  })
  
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light')
  
  const t = getMessages(locale)

  // Handle theme changes
  useEffect(() => {
    const root = document.documentElement
    
    const applyTheme = (isDark: boolean) => {
      if (isDark) {
        root.classList.add('dark')
      } else {
        root.classList.remove('dark')
      }
      setResolvedTheme(isDark ? 'dark' : 'light')
    }
    
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      applyTheme(mediaQuery.matches)
      
      const handler = (e: MediaQueryListEvent) => applyTheme(e.matches)
      mediaQuery.addEventListener('change', handler)
      return () => mediaQuery.removeEventListener('change', handler)
    } else {
      applyTheme(theme === 'dark')
    }
  }, [theme])

  // Save preferences
  useEffect(() => {
    localStorage.setItem('gripper-locale', locale)
  }, [locale])
  
  useEffect(() => {
    localStorage.setItem('gripper-theme', theme)
  }, [theme])

  return (
    <AppContext.Provider value={{ locale, setLocale, theme, setTheme, resolvedTheme, t }}>
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <main>
          <Hero />
          <Features />
          <Usage />
          <DownloadSection />
        </main>
        <Footer />
      </div>
    </AppContext.Provider>
  )
}
