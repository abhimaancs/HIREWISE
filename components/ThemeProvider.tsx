'use client'
import { createContext, useContext, useEffect, useState, useCallback } from 'react'

type Theme = 'dark' | 'light'

interface ThemeContextValue {
    theme: Theme
    toggle: () => void
}

const ThemeContext = createContext<ThemeContextValue>({
    theme: 'dark',
    toggle: () => { },
})

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    // Initialise from the value already set by the inline FOUC script
    const [theme, setTheme] = useState<Theme>(() => {
        if (typeof window === 'undefined') return 'dark'
        return (document.documentElement.getAttribute('data-theme') as Theme) || 'dark'
    })

    // Keep html[data-theme] and localStorage in sync whenever theme changes
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme)
        try { localStorage.setItem('hw-theme', theme) } catch { }
    }, [theme])

    const toggle = useCallback(() => {
        setTheme(prev => (prev === 'dark' ? 'light' : 'dark'))
    }, [])

    return (
        <ThemeContext.Provider value={{ theme, toggle }}>
            {children}
        </ThemeContext.Provider>
    )
}

export function useTheme() {
    return useContext(ThemeContext)
}
