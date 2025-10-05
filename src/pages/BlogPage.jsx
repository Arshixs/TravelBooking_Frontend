import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "../utils/axios";
import "../styles/BlogPage.css";

const BlogPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const response = await axios.get("/blogs");
        setPosts(response.data);
      } catch (error) {
        console.error("Failed to fetch blog posts:", error);
        // You can add a toast notification here if you like
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="blog-page">
      <header className="blog-header">
        <h1>Our Travel Blog</h1>
        <p>Stories, tips, and inspiration from our travel experts.</p>
      </header>

      <main className="container">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading articles...</p>
          </div>
        ) : posts.length > 0 ? (
          <div className="blog-grid">
            {posts.map((post) => (
              <Link to={`/blogs/${post.blog_id}`} key={post.blog_id} className="blog-card-link">
                <article className="blog-card">
                  <div className="card-image-container">
                    <img
                      src={post.featuredImage || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=600&h=400&fit=crop'}
                      alt={post.title}
                      className="card-image"
                    />
                  </div>
                  <div className="card-content">
                    <span className="card-date">{formatDate(post.published_at)}</span>
                    <h2 className="card-title">{post.title}</h2>
                    <p className="card-excerpt">
                      {/* Create a short excerpt from the content */}
                      {post.content.substring(0, 100).replace(/<[^>]+>/g, '')}...
                    </p>
                    <span className="read-more">Read More</span>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        ) : (
          <div className="no-data">
            <h2>No Blog Posts Found</h2>
            <p>Check back later for new articles!</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default BlogPage;