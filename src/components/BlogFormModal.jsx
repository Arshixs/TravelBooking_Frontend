import React, { useState, useEffect } from "react";
import axios from "../utils/axios";
import toast from "react-hot-toast";
import "../styles/PackageFormModal.css"; // Reusing the same CSS

const CloseIcon = () => <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;

const BlogFormModal = ({ postData, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    featuredImage: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (postData) {
      setFormData({
        title: postData.title || "",
        content: postData.content || "",
        featuredImage: postData.featuredImage || "",
      });
    } else {
      setFormData({ title: "", content: "", featuredImage: "" });
    }
  }, [postData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (postData) {
        // Update existing post
        await axios.put(`/blogs/update/${postData.blog_id}`, formData);
        toast.success("Blog post updated successfully!");
      } else {
        // Create new post
        await axios.post("/blogs/add", formData);
        toast.success("Blog post created successfully!");
      }
      onSave();
    } catch (error) {
      toast.error("Failed to save blog post.");
      console.error(error);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <header className="modal-header">
          <h2>{postData ? "Edit Blog Post" : "Add New Blog Post"}</h2>
          <button className="modal-close" onClick={onClose}>
            <CloseIcon />
          </button>
        </header>

        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-grid">
              <div className="input-group full-width">
                <label htmlFor="title">Post Title</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="input-group full-width">
                <label htmlFor="featuredImage">Featured Image URL</label>
                <input
                  type="url"
                  id="featuredImage"
                  name="featuredImage"
                  value={formData.featuredImage}
                  onChange={handleChange}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="input-group full-width">
                <label htmlFor="content">Content</label>
                <textarea
                  id="content"
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  rows="10"
                  placeholder="Write your blog content here. You can use HTML tags."
                  required
                />
              </div>
            </div>
          </div>
          <footer className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Saving..." : "Save Post"}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
};

export default BlogFormModal;