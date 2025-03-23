"use client"

import { useEffect, useRef } from "react"
import "../styles/CustomCursor.css"

const CustomCursor = () => {
  const cursorRef = useRef(null)

  useEffect(() => {
    const cursor = cursorRef.current
    let mouseX = 0
    let mouseY = 0
    let cursorX = 0
    let cursorY = 0

    const animate = () => {
      // Create lag effect by moving only a percentage of the distance each frame
      const lagFactor = 0.15
      cursorX += (mouseX - cursorX) * lagFactor
      cursorY += (mouseY - cursorY) * lagFactor

      if (cursor) {
        cursor.style.transform = `translate(${cursorX}px, ${cursorY}px)`
      }

      requestAnimationFrame(animate)
    }

    const onMouseMove = (e) => {
      mouseX = e.clientX
      mouseY = e.clientY
    }

    // Add hover class when hovering over buttons and links
    const addHoverClass = (e) => {
      const target = e.target
      if (target.tagName === "BUTTON" || target.tagName === "A" || target.closest("button") || target.closest("a")) {
        if (cursor) cursor.classList.add("hover")
      }
    }

    // Remove hover class when not hovering over buttons and links
    const removeHoverClass = (e) => {
      if (cursor) cursor.classList.remove("hover")
    }

    document.addEventListener("mousemove", onMouseMove)
    document.addEventListener("mouseover", addHoverClass)
    document.addEventListener("mouseout", removeHoverClass)
    animate()

    return () => {
      document.removeEventListener("mousemove", onMouseMove)
      document.removeEventListener("mouseover", addHoverClass)
      document.removeEventListener("mouseout", removeHoverClass)
    }
  }, [])

  return <div className="custom-cursor" ref={cursorRef}></div>
}

export default CustomCursor

