"use client"

import { useState, useEffect, useRef } from "react"
import { Link, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { useAuth } from "../context/AuthContext"
import CustomCursor from "../components/CustomCursor"
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

  // Enable custom cursor
  useEffect(() => {
    document.body.classList.add("custom-cursor-active")

    return () => {
      document.body.classList.remove("custom-cursor-active")
    }
  }, [])

  const toggleTheme = () => {
    setIsLightMode(!isLightMode)
    if (isLightMode) {
      document.body.classList.remove("light-mode")
    } else {
      document.body.classList.add("light-mode")
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

  // Blog posts data
  const blogPosts = [
    {
      id: 1,
      title: "How MultiPlan Transformed R&D Productivity with CodeTogether",
      excerpt: "When MultiPlan – a leader in healthcare cost management – needed a better work model...",
      author: "Vishwa Panchal",
      date: "February 18, 2025",
      image: "/blog-1.jpg",
    },
    {
      id: 2,
      title: "The Founding Story of CodeTogether: From Humble Beginnings to Transformative Innovation",
      excerpt: "Our story began with a team of technologists passionate about improving collaborative...",
      author: "Kunj Prajapati",
      date: "January 25, 2025",
      image: "/blog-2.jpg",
    },
    {
      id: 3,
      title: "Introducing the New Unified CodeTogether: Enhanced Features and Streamlined Plans!",
      excerpt: "The CodeTogether Intelligence Suite revolutionizes the software development...",
      author: "Mayur Rathod",
      date: "January 10, 2025",
      image: "/blog-3.jpg",
    },
    {
      id: 4,
      title: "10 Tips for Effective Remote Collaboration in Coding Projects",
      excerpt: "Discover practical tips to enhance collaboration and productivity in remote coding teams...",
      author: "Alex Johnson",
      date: "March 5, 2025",
      image: "/blog-4.jpg",
    },
  ]

  return (
    <div className="landing-page">
      <CustomCursor />

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
                A Limitless Space for Collaborative Coding
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
                <Link to={currentUser ? "/create" : "/login"} className="start-coding-button">
                  <i className="fas fa-code"></i>
                  Create a Room
                </Link>

                <Link to={currentUser ? "/join" : "/login"} className="join-session-button">
                  <i className="fas fa-users"></i>
                  Join a Room
                </Link>
              </motion.div>
            </motion.div>
          </div>

          {/* Animated background elements */}
          <div className="hero-background">
            <div className="floating-element element-1"></div>
            <div className="floating-element element-2"></div>
            <div className="floating-element element-3"></div>
          </div>
        </section>

        <section className="features-section">
          <div className="container">
            <h2 className="section-title">Powerful Features</h2>

            <div className="features-grid">
              <motion.div
                className="feature-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <div className="feature-icon">
                  <i className="fas fa-bolt"></i>
                </div>
                <h3>Real-time Collaboration</h3>
                <p>Code together with your team in real-time, seeing changes as they happen.</p>
              </motion.div>

              <motion.div
                className="feature-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <div className="feature-icon">
                  <i className="fas fa-robot"></i>
                </div>
                <h3>AI Assistance</h3>
                <p>Get intelligent code suggestions and autocompletions powered by AI.</p>
              </motion.div>

              <motion.div
                className="feature-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="feature-icon">
                  <i className="fas fa-shield-alt"></i>
                </div>
                <h3>Secure Environment</h3>
                <p>Your code is protected with enterprise-grade security and encryption.</p>
              </motion.div>

              <motion.div
                className="feature-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <div className="feature-icon">
                  <i className="fas fa-chart-line"></i>
                </div>
                <h3>Deep Analytics</h3>
                <p>Gain insights into your coding patterns and team productivity.</p>
              </motion.div>
            </div>
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

        {/* Blog Section - Added at the end of the landing page */}
        <section className="blog-section">
          <div className="container">
            <div className="blog-header">
              <h2 className="section-title">Latest blog posts</h2>
              <Link to="/blog" className="browse-all-button">
                Browse all Articles <i className="fas fa-arrow-right"></i>
              </Link>
            </div>

            <div className="blog-grid">
              {blogPosts.map((post) => (
                <motion.div
                  key={post.id}
                  className="blog-card"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.1 * post.id }}
                >
                  <div className="blog-card-content">
                    <h3 className="blog-title">{post.title}</h3>
                  </div>
                  <div className="blog-meta">
                    <span className="blog-author">{post.author}</span>
                    <span className="blog-date">{post.date}</span>
                  </div>
                  <p className="blog-excerpt">{post.excerpt}</p>
                  <div className="blog-footer">
                    <Link to={`/blog/${post.id}`} className="read-more">
                      Read Blog <i className="fas fa-arrow-right"></i>
                    </Link>
                  </div>
                </motion.div>
              ))}
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

