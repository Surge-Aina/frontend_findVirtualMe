import { validateImageFile } from "../services/fileValidator";
import { toast } from "react-toastify";

const FileUploader = ({
  onFileAccepted,
  label = "Choose an image",
  acceptedTypes = "image/*",
  className = "",
}) => {
  const handleChange = (e) => {
    const file = e.target.files[0];
    const { valid, error } = validateImageFile(file);
    if (!valid) {
      toast.error(error);
    } else {
      onFileAccepted(file);
    }
  };

  return (
    <input
      type="file"
      accept={acceptedTypes}
      onChange={handleChange}
      className={`cursor-pointer ${className}`}
      aria-label={label}
    />
  );
};

export default FileUploader;
