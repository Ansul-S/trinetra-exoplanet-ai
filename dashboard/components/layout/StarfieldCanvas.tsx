'use client'

import { useEffect, useRef } from 'react'

interface Star {
  x: number
  y: number
  radius: number
  opacity: number
  speed: number
  twinkle: number
  twinkleSpeed: number
}

export function StarfieldCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    let stars: Star[] = []

    const resize = () => {
      canvas.width  = window.innerWidth
      canvas.height = window.innerHeight
      initStars()
    }

    const initStars = () => {
      const count = Math.floor((canvas.width * canvas.height) / 6000)
      stars = Array.from({ length: count }, () => ({
        x           : Math.random() * canvas.width,
        y           : Math.random() * canvas.height,
        radius      : Math.random() * 1.2 + 0.2,
        opacity     : Math.random() * 0.6 + 0.1,
        speed       : Math.random() * 0.02 + 0.005,
        twinkle     : Math.random() * Math.PI * 2,
        twinkleSpeed: Math.random() * 0.015 + 0.005,
      }))
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      stars.forEach(star => {
        star.twinkle += star.twinkleSpeed
        star.y -= star.speed

        if (star.y < -2) {
          star.y = canvas.height + 2
          star.x = Math.random() * canvas.width
        }

        const opacity = star.opacity * (0.7 + 0.3 * Math.sin(star.twinkle))

        ctx.beginPath()
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(200, 220, 255, ${opacity})`
        ctx.fill()
      })

      animId = requestAnimationFrame(draw)
    }

    resize()
    draw()

    window.addEventListener('resize', resize)
    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ opacity: 0.6 }}
    />
  )
}
