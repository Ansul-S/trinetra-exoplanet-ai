'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'

const links = [
  { href: '/',         label: 'Home'     },
  { href: '/planets',  label: 'Planets'  },
  { href: '/map',      label: 'HZ Map'   },
  { href: '/score',    label: 'Score'    },
  { href: '/pipeline', label: 'Pipeline' },
]

export function Navbar() {
  const path = usePathname()

  return (
    <nav className="glass sticky top-0 z-50 h-16 flex items-center px-6 gap-8">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 flex-shrink-0">
        <div className="relative">
          <div className="w-7 h-7 rounded-full border border-star-blue/50 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-star-blue animate-pulse" />
          </div>
          <div className="absolute inset-0 rounded-full border border-star-blue/20 animate-ping" />
        </div>
        <span className="font-mono text-sm font-bold tracking-wider text-white">TRINETRA</span>
        <span className="text-space-500 text-xs font-mono hidden sm:block">v4</span>
      </Link>

      {/* Links */}
      <div className="flex items-center gap-1 ml-auto">
        {links.map(link => {
          const active = link.href === '/' ? path === '/' : path.startsWith(link.href)
          return (
            <Link
              key={link.href}
              href={link.href}
              className="relative px-3 py-1.5 text-sm font-medium rounded-lg transition-colors"
              style={{ color: active ? '#fff' : 'rgba(232, 237, 245, 0.5)' }}
            >
              {active && (
                <motion.div
                  layoutId="nav-active"
                  className="absolute inset-0 rounded-lg"
                  style={{ background: 'rgba(55, 138, 221, 0.15)', border: '1px solid rgba(55, 138, 221, 0.3)' }}
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                />
              )}
              <span className="relative z-10">{link.label}</span>
            </Link>
          )
        })}
      </div>

      {/* API status dot */}
      <div className="flex items-center gap-1.5 ml-4 hidden md:flex">
        <div className="w-1.5 h-1.5 rounded-full bg-star-green animate-pulse" />
        <span className="text-xs font-mono text-white/30">API live</span>
      </div>
    </nav>
  )
}
