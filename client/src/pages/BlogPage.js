import { useParams, Link } from "react-router-dom";
import "../styles/BlogPage.css";

const blogs = {
  1: {
    title: "How MultiPlan Transformed R&D Productivity with CodeTogether",
    content: `
      MultiPlan, a leader in healthcare cost management, faced challenges in remote collaboration.
      By adopting CodeTogether, they streamlined their R&D processes, enabling real-time collaboration
      and boosting productivity by 40%. The platform's AI assistance further reduced coding errors,
      saving countless hours of debugging.
    `,
    author: "Vishwa Panchal",
    date: "February 18, 2025",
  },
  2: {
    title: "The Founding Story of CodeTogether: From Humble Beginnings to Transformative Innovation",
    content: `
      CodeTogether started as a small project among friends passionate about improving collaborative coding.
      Over the years, it evolved into a transformative platform, empowering developers worldwide with
      real-time collaboration and AI-powered tools. This is the story of how it all began.
    `,
    author: "Kunj Prajapati",
    date: "January 25, 2025",
  },
  3: {
    title: "Introducing the New Unified CodeTogether: Enhanced Features and Streamlined Plans!",
    content: `
      The new CodeTogether Intelligence Suite brings enhanced features like deep analytics, improved
      real-time collaboration, and streamlined subscription plans. Learn how these updates can revolutionize
      your team's workflow and productivity.
    `,
    author: "Mayur Rathod",
    date: "January 10, 2025",
  },
  4: {
    title: "10 Tips for Effective Remote Collaboration in Coding Projects",
    content: `
      Remote collaboration can be challenging, but with the right tools and strategies, it can be highly
      effective. Discover 10 practical tips to enhance collaboration and productivity in your remote coding
      projects, including leveraging platforms like CodeTogether.
    `,
    author: "Alex Johnson",
    date: "March 5, 2025",
  },
};

const BlogPage = () => {
  const { id } = useParams();
  const blog = blogs[id];

  if (!blog) {
    return <div className="blog-page">Blog not found.</div>;
  }

  return (
    <div className="blog-page">
      <div className="container">
        <h1 className="blog-title">{blog.title}</h1>
        <p className="blog-meta">
          By {blog.author} | {blog.date}
        </p>
        <div className="blog-content">
          <p>{blog.content}</p>
        </div>
        <Link to="/" className="back-button">
          &larr; Back to Home
        </Link>
      </div>
    </div>
  );
};

export default BlogPage;
