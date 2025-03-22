"use client"

import { useState, useEffect, useRef } from "react"
import { Link, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { useAuth } from "../context/AuthContext"
import "../styles/LandingPage.css"

const LandingPage = () => {
  const [isLightMode, setIsLightMode] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const { currentUser, logout } = useAuth()
  const navigate = useNavigate()
  const dropdownRef = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [dropdownRef])

  const toggleTheme = () => {
    setIsLightMode(!isLightMode)
    document.body.classList.toggle("light-mode")
  }

  const handleCreateRoom = () => {
    if (currentUser) {
      navigate("/create")
    } else {
      navigate("/login", { state: { action: "create" } })
    }
  }

  const handleJoinRoom = () => {
    if (currentUser) {
      navigate("/join")
    } else {
      navigate("/login", { state: { action: "join" } })
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      setIsDropdownOpen(false)
    } catch (error) {
      console.error("Failed to log out", error)
    }
  }

  // Get user initial for avatar
  const getUserInitial = () => {
    if (currentUser?.displayName) {
      return currentUser.displayName.charAt(0).toUpperCase()
    } else if (currentUser?.email) {
      return currentUser.email.charAt(0).toUpperCase()
    }
    return "U"
  }

  return (
    <div className="landing-page">
      <header className="header">
        <div className="container">
          <nav className="navbar">
            <Link to="/" className="logo">
              CodeCollab AI
            </Link>

            <div className="nav-actions">
              <button
                className="theme-toggle"
                onClick={toggleTheme}
                aria-label={isLightMode ? "Switch to dark mode" : "Switch to light mode"}
              >
                {isLightMode ? <i className="fas fa-moon"></i> : <i className="fas fa-sun"></i>}
              </button>

              {currentUser ? (
                <div className="user-dropdown" ref={dropdownRef}>
                  <button
                    className="user-avatar-button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    aria-expanded={isDropdownOpen}
                  >
                    <div className="user-avatar">{getUserInitial()}</div>
                  </button>

                  {isDropdownOpen && (
                    <div className="dropdown-menu">
                      <div className="dropdown-header">
                        <p className="dropdown-email">{currentUser.email}</p>
                      </div>
                      <div className="dropdown-divider"></div>
                      <Link to="/create" className="dropdown-item">
                        <i className="fas fa-plus-circle"></i>
                        Create Room
                      </Link>
                      <Link to="/join" className="dropdown-item">
                        <i className="fas fa-sign-in-alt"></i>
                        Join Room
                      </Link>
                      <div className="dropdown-divider"></div>
                      <button className="dropdown-item logout" onClick={handleLogout}>
                        <i className="fas fa-sign-out-alt"></i>
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="auth-buttons">
                  <Link to="/login" className="sign-in-button">
                    Sign In
                  </Link>
                  <Link to="/signup" className="get-started-button">
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </nav>
        </div>
      </header>

      <main>
        <section className="hero-section">
          <div className="container">
            <motion.div
              className="hero-content"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.h1
                className="hero-title"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                 A limitless space for collaborative coding
              </motion.h1>

              <motion.p
                className="hero-subtitle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                The future of coding: AI assistance, real-time teamwork, and deep analytics.
              </motion.p>

              <motion.div
                className="hero-buttons"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                <motion.button
                  className="start-coding-button"
                  onClick={handleCreateRoom}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <i className="fas fa-code"></i>
                  Create a Room
                </motion.button>

                <motion.button
                  className="join-session-button"
                  onClick={handleJoinRoom}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <i className="fas fa-users"></i>
                  Join a Room
                </motion.button>
              </motion.div>
            </motion.div>
          </div>
        </section>

        <section className="demo-section">
          <div className="container">
            <h2 className="section-title">Try It Yourself</h2>
            <p className="section-subtitle">Experience real-time collaboration and AI assistance in action.</p>

            <motion.div
              className="editor-preview"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="editor-container">
                <div className="editor-tabs">
                  <div className="tab active">App.js</div>
                  <div className="tab">index.html</div>
                </div>
                <div className="editor-split">
                  <div className="code-editor">
                    <pre className="code-content">
                      <code>
                        <span className="line-number">1</span> <span className="keyword">import</span>{" "}
                        <span className="string">"./styles.css"</span>;<br />
                        <span className="line-number">2</span>
                        <br />
                        <span className="line-number">3</span> <span className="keyword">export</span>{" "}
                        <span className="keyword">default</span> <span className="function">function</span>{" "}
                        <span className="function-name">App</span>() {"{"}
                        <br />
                        <span className="line-number">4</span> <span className="keyword">return</span> (<br />
                        <span className="line-number">5</span> &lt;<span className="element">div</span>{" "}
                        <span className="attribute">className</span>=<span className="string">"App"</span>&gt;
                        <br />
                        <span className="line-number">6</span> &lt;<span className="element">h1</span>&gt;Hello
                        CodeSandbox&lt;/<span className="element">h1</span>&gt;
                        <br />
                        <span className="line-number">7</span> &lt;<span className="element">h2</span>&gt;Start editing
                        to see some magic happen!&lt;/<span className="element">h2</span>&gt;
                        <br />
                        <span className="line-number">8</span> &lt;/<span className="element">div</span>&gt;
                        <br />
                        <span className="line-number">9</span> );
                        <br />
                        <span className="line-number">10</span> {"}"}
                        <br />
                        <span className="line-number">11</span>
                      </code>
                    </pre>
                  </div>
                  <div className="preview-pane">
                    <div className="preview-header">
                      <div className="preview-url">https://new.csb.app/</div>
                    </div>
                    <div className="preview-content">
                      <h1>Hello CodeSandbox</h1>
                      <h2>Start editing to see some magic happen!</h2>
                      <button className="sandbox-button">Open Sandbox</button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="testimonials-section">
          <div className="container">
            <h2 className="section-title">What Our Users Say</h2>

            <div className="testimonials-grid">
              <motion.div
                className="testimonial-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <p className="testimonial-text">"This platform has revolutionized how our team codes together!"</p>
                <p className="testimonial-author">- Alex Doe</p>
              </motion.div>

              <motion.div
                className="testimonial-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <p className="testimonial-text">
                  "The AI suggestions are incredibly helpful and save us tons of time."
                </p>
                <p className="testimonial-author">- Jamie Lee</p>
              </motion.div>

              <motion.div
                className="testimonial-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <p className="testimonial-text">"Real-time collaboration is seamless. Love it!"</p>
                <p className="testimonial-author">- Chris Brown</p>
              </motion.div>
            </div>
          </div>
        </section>

        <section className="faq-section">
          <div className="container">
            <h2 className="section-title">Frequently Asked Questions</h2>

            <div className="faq-grid">
              <motion.div
                className="faq-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <h3 className="faq-question">What is CodeCollab AI?</h3>
                <p className="faq-answer">
                  CodeCollab AI is a collaborative coding platform that integrates AI assistance, real-time teamwork,
                  and analytics to improve your coding workflow.
                </p>
              </motion.div>

              <motion.div
                className="faq-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <h3 className="faq-question">Do I need to install any software?</h3>
                <p className="faq-answer">
                  No, CodeCollab AI runs entirely in your browser. No installations or downloads required.
                </p>
              </motion.div>

              <motion.div
                className="faq-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <h3 className="faq-question">Can I use AI assistance for free?</h3>
                <p className="faq-answer">
                  Yes, we offer a free tier with AI-powered suggestions. Additional features are available in premium
                  plans.
                </p>
              </motion.div>

              <motion.div
                className="faq-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <h3 className="faq-question">Is my code secure?</h3>
                <p className="faq-answer">
                  We use end-to-end encryption and strict security policies to protect your code.
                </p>
              </motion.div>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-logo">
              <Link to="/">CodeCollab AI</Link>
              <p className="footer-tagline">The future of collaborative coding</p>
            </div>

            <div className="footer-links">
              <div className="footer-column">
                <h4>Product</h4>
                <a href="#features">Features</a>
                <a href="#pricing">Pricing</a>
                <a href="#testimonials">Testimonials</a>
              </div>

              <div className="footer-column">
                <h4>Resources</h4>
                <a href="#docs">Documentation</a>
                <a href="#tutorials">Tutorials</a>
                <a href="#blog">Blog</a>
              </div>

              <div className="footer-column">
                <h4>Company</h4>
                <a href="#about">About Us</a>
                <a href="#careers">Careers</a>
                <a href="#contact">Contact</a>
              </div>

              <div className="footer-column">
                <h4>Legal</h4>
                <a href="#terms">Terms of Service</a>
                <a href="#privacy">Privacy Policy</a>
                <a href="#cookies">Cookie Policy</a>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <p>&copy; {new Date().getFullYear()} CodeCollab AI. All rights reserved.</p>
            <div className="social-links">
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-github"></i>
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-linkedin"></i>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage

