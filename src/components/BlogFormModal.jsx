import React, { useState, useEffect } from "react";
import axios from "../utils/axios";
import toast from "react-hot-toast";
import "../styles/PackageFormModal.css";

const CloseIcon = () => (
  <svg
    viewBox="0 0 24 24"
    width="24"
    height="24"
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const BlogFormModal = ({ postData, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    featuredImage: null,
    existingImageUrl: "",
  });
  const [imagePreview, setImagePreview] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (postData) {
      setFormData({
        title: postData.title || "",
        content: postData.content || "",
        featuredImage: null,
        existingImageUrl: postData.featuredImage || "",
      });
      setImagePreview(postData.featuredImage || "");
    } else {
      setFormData({
        title: "",
        content: "",
        featuredImage: null,
        existingImageUrl: "",
      });
      setImagePreview("");
    }
  }, [postData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please select a valid image file");
        return;
      }

      // Validate file size (e.g., max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should not exceed 5MB");
        return;
      }

      setFormData((prev) => ({ ...prev, featuredImage: file }));

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({
      ...prev,
      featuredImage: null,
      existingImageUrl: "",
    }));
    setImagePreview("");
    // Reset file input
    const fileInput = document.getElementById("featuredImage");
    if (fileInput) fileInput.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("content", formData.content);

      if (formData.featuredImage) {
        formDataToSend.append("featuredImage", formData.featuredImage);
      } else if (formData.existingImageUrl) {
        formDataToSend.append("existingImageUrl", formData.existingImageUrl);
      }

      if (postData) {
        // Update existing post
        await axios.put(`/blogs/update/${postData.blog_id}`, formDataToSend, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        toast.success("Blog post updated successfully!");
      } else {
        // Create new post
        await axios.post("/blogs/add", formDataToSend, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        toast.success("Blog post created successfully!");
      }
      onSave();
    } catch (error) {
      toast.error(error.response?.data || "Failed to save blog post.");
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
                <label htmlFor="featuredImage">Featured Image</label>
                <input
                  type="file"
                  id="featuredImage"
                  name="featuredImage"
                  accept="image/*"
                  onChange={handleImageChange}
                />
                <small
                  style={{ color: "#666", marginTop: "4px", display: "block" }}
                >
                  Maximum file size: 5MB. Supported formats: JPG, PNG, GIF, WebP
                </small>
              </div>

              {imagePreview && (
                <div className="input-group full-width">
                  <label>Image Preview</label>
                  <div
                    style={{ position: "relative", display: "inline-block" }}
                  >
                    <img
                      src={imagePreview}
                      alt="Preview"
                      style={{
                        maxWidth: "100%",
                        maxHeight: "200px",
                        borderRadius: "8px",
                        border: "1px solid #ddd",
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      style={{
                        position: "absolute",
                        top: "8px",
                        right: "8px",
                        background: "rgba(255, 0, 0, 0.8)",
                        color: "white",
                        border: "none",
                        borderRadius: "50%",
                        width: "30px",
                        height: "30px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      ×
                    </button>
                  </div>
                </div>
              )}

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
