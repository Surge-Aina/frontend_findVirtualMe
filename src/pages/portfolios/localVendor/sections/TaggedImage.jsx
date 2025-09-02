import { useState, useEffect } from "react";
import { FiTrash2 } from "react-icons/fi";
import { toast } from "react-toastify";
import FileUploader from "../components/FileUploader";
import { useVendorApi } from "../services/api";
import { useVendor } from "../../../../context/VendorContext";

const TaggedImage = () => {
  const { vendorId } = useVendor();
  const api = useVendorApi();

  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [taggedImageId, setTaggedImageId] = useState(null);
  const [tags, setTags] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [modalData, setModalData] = useState(null); // { x, y, ... }

  // Load menu items on mount
  useEffect(() => {
    if (!vendorId) return;
    api
      .getMenu()
      .then((res) => setMenuItems(res))
      .catch((err) => console.error("Failed to fetch menu items", err));
  }, [vendorId]);

  // Load latest tagged image
  useEffect(() => {
    if (!vendorId) return;
    api
      .getTaggedImages()
      .then((res) => {
        if (res.length) {
          const latest = res[res.length - 1];
          setTaggedImageId(latest._id);
          setImageUrl(latest.imageUrl);
          setTags(latest.tags || []);
        }
      })
      .catch((err) => console.error("Failed to fetch tagged images", err));
  }, [vendorId]);

  // Upload image handler
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!(imageFile instanceof File)) {
      toast.error("Please select an image to upload.");
      return;
    }
    if (imageFile.size > 2 * 1024 * 1024) {
      toast.error("Please upload an image under 2MB");
      return;
    }

    try {
      const res = await api.uploadTaggedImage(imageFile);
      setImageUrl(res.imageUrl);
      setTaggedImageId(res._id);
      setTags([]);
      toast.success("Image uploaded successfully!");
    } catch (err) {
      toast.error(err.response?.data?.error || "Upload failed");
    }
  };

  // Image click to add a tag
  const handleTagClick = (e) => {
    if (!imageUrl) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setModalData({ x, y, label: "", menuItemId: "" });
  };

  // Delete tag
  const handleDeleteTag = async (index) => {
    try {
      const res = await api.deleteTag(taggedImageId, index);
      setTags(res.tags);
    } catch (err) {
      console.error("Failed to delete tag", err);
    }
  };

  // Save tag (create/update)
  const handleSaveTag = async () => {
    const { x, y, label, menuItemId, tagIndex } = modalData;
    if (!label || !menuItemId) return;

    try {
      let res;
      if (tagIndex !== undefined) {
        // UPDATE
        res = await api.updateTag(taggedImageId, tagIndex, {
          x,
          y,
          label,
          menuItemId,
        });
      } else {
        // CREATE
        res = await api.createTag(taggedImageId, {
          x,
          y,
          label,
          menuItemId,
        });
      }
      setTags(res.tags);
      setModalData(null);
    } catch (err) {
      console.error("Failed to save tag", err);
    }
  };

  return (
    <section className="p-6 max-w-4xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Tagged Image Uploader</h2>

      <form onSubmit={handleUpload} className="mb-6 flex gap-4 items-center">
        <FileUploader onFileAccepted={(file) => setImageFile(file)} />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Upload
        </button>
      </form>

      {imageUrl && (
        <div className="relative border inline-block" onClick={handleTagClick}>
          <img
            src={`${import.meta.env.VITE_BACKEND_API}${imageUrl}`}
            className="max-w-full"
            alt="Taggable"
          />
          {tags.map((tag, idx) => (
            <div
              key={idx}
              className="absolute bg-red-600 text-white text-xs px-2 py-1 rounded-lg cursor-default text-center"
              style={{
                left: `${tag.x * 100}%`,
                top: `${tag.y * 100}%`,
                transform: "translate(-50%, -50%)",
              }}
            >
              <div className="font-semibold">{tag.label}</div>
              <div className="flex justify-center gap-2 mt-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteTag(idx);
                  }}
                  className="text-white hover:text-red-300"
                  title="Delete Tag"
                >
                  <FiTrash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tagging Modal */}
      {modalData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-md w-80">
            <h3 className="text-lg font-semibold mb-2">
              {modalData?.tagIndex !== undefined ? "Edit Tag" : "Add Tag"}
            </h3>

            <input
              type="text"
              placeholder="Enter label"
              className="w-full border mb-3 px-2 py-1"
              value={modalData.label}
              onChange={(e) =>
                setModalData({ ...modalData, label: e.target.value })
              }
            />

            <select
              className="w-full border px-2 py-1 mb-3"
              value={modalData.menuItemId}
              onChange={(e) =>
                setModalData({ ...modalData, menuItemId: e.target.value })
              }
            >
              <option value="">Select menu item</option>
              {menuItems.map((item) => (
                <option key={item._id} value={item._id}>
                  {item.name}
                </option>
              ))}
            </select>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setModalData(null)}
                className="px-3 py-1 bg-gray-300 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveTag}
                className="px-3 py-1 bg-green-600 text-white rounded"
              >
                Save Tag
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default TaggedImage;
