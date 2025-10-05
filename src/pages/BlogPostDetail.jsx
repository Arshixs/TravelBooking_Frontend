import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "../utils/axios";
import "../styles/BlogPostDetail.css";

const BlogPostDetail = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/blogs/${id}`);
        setPost(response.data);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch blog post:", err);
        setError("Blog post not found.");
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  if (loading) {
    return (
      <div className="loading-state">
        <div className="spinner"></div>
        <p>Loading article...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="no-data">
        <h2>{error}</h2>
        <p>The post you are looking for might have been removed or does not exist.</p>
        <Link to="/blogs" className="btn-primary">Back to Blog</Link>
      </div>
    );
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="blog-detail-page">
      <div className="post-container">
        <header className="post-header">
          <h1 className="post-title">{post.title}</h1>
          <p className="post-meta">
            Published on {formatDate(post.published_at)}
            {/* If you add author info to your API response, you can display it here */}
            {/* by {post.author.name} */}
          </p>
        </header>

        <div className="post-featured-image">
          <img 
            src={post.featuredImage || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1200&h=600&fit=crop'} 
            alt={post.title} 
          />
        </div>

        <article className="post-content">
          {/* SECURITY NOTE: Using dangerouslySetInnerHTML can be risky if the content is not sanitized
            on the backend to prevent XSS attacks. Ensure your backend cleans any user-submitted HTML.
          */}
          <div dangerouslySetInnerHTML={{ __html: post.content }} />
        </article>

        <div className="back-to-blog">
            <Link to="/blogs" className="btn-secondary">
                Back to All Posts
            </Link>
        </div>
      </div>
    </div>
  );
};

export default BlogPostDetail;