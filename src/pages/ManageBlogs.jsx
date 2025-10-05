import React, { useState, useEffect, useCallback } from "react";
import axios from "../utils/axios";
import toast from "react-hot-toast";
import BlogFormModal from "../components/BlogFormModal";
// import "../styles/VendorManagement.css"; // Reusing the same CSS

const ManageBlogs = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get("/blogs");
      setPosts(response.data);
    } catch (error) {
      toast.error("Failed to fetch blog posts");
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleCreate = () => {
    setSelectedPost(null);
    setShowModal(true);
  };

  const handleEdit = (post) => {
    setSelectedPost(post);
    setShowModal(true);
  };

  const handleDelete = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this blog post?")) {
      return;
    }
    try {
      await axios.delete(`/blogs/delete/${postId}`);
      toast.success("Blog post deleted successfully");
      fetchPosts();
    } catch (error) {
      toast.error("Failed to delete blog post");
      console.error("Error deleting post:", error);
    }
  };

  const handleSave = () => {
    setShowModal(false);
    fetchPosts();
  };
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("en-IN");
  };

  return (
    <div className="vendor-management">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Blog Post Management</h1>
          <p>Create, edit, and manage your articles</p>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="content-section">
          <div className="section-header">
            <h2>All Blog Posts</h2>
            <button className="btn-create" onClick={handleCreate}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Add New Post
            </button>
          </div>

          {loading ? (
            <div className="loading-state"><div className="spinner"></div></div>
          ) : (
            <div className="data-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Title</th>
                    <th>Published Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {posts.length > 0 ? (
                    posts.map((post) => (
                      <tr key={post.blog_id}>
                        <td>{post.blog_id}</td>
                        <td>{post.title}</td>
                        <td>{formatDate(post.published_at)}</td>
                        <td>
                          <div className="action-buttons">
                            <button className="btn-action btn-edit" onClick={() => handleEdit(post)} title="Edit">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                            </button>
                            <button className="btn-action btn-delete" onClick={() => handleDelete(post.blog_id)} title="Delete">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="no-data">
                        No blog posts found. Create your first one!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <BlogFormModal
          postData={selectedPost}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default ManageBlogs;