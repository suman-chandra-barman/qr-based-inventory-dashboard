import React, { useState, useEffect } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { Button } from "../components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import BackButton from "@/components/buttons/BackButton";
import {
  useGetPrivacyPolicyQuery,
  useUpdatePrivacyPolicyMutation,
} from "../redux/api/api";

const EditPrivacyPolicyPage: React.FC = () => {
  const navigate = useNavigate();
  const { data, isLoading: loading } = useGetPrivacyPolicyQuery(undefined);
  const [updatePrivacyPolicy, { isLoading: updating }] =
    useUpdatePrivacyPolicyMutation();
  const [content, setContent] = useState("");

  useEffect(() => {
    if (data?.data?.description) {
      setContent(data.data.description);
    } else if (!loading) {
      setContent("");
    }
  }, [data, loading]);

  const handleUpdate = async () => {
    if (!content.trim()) {
      toast.error("Content cannot be empty");
      return;
    }

    try {
      const result = await updatePrivacyPolicy({
        description: content,
      }).unwrap();
      if (result.success) {
        toast.success("Privacy Policy updated successfully!");
        navigate("/settings/privacy-policy");
      } else {
        toast.error(result.message || "Failed to update Privacy Policy");
      }
    } catch (error) {
      console.error("Error updating privacy policy:", error);
      toast.error("Failed to update Privacy Policy");
    }
  };

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ script: "sub" }, { script: "super" }],
      [{ indent: "-1" }, { indent: "+1" }],
      [{ direction: "rtl" }],
      [{ color: [] }, { background: [] }],
      [{ font: [] }],
      [{ align: [] }],
      ["link", "image", "video"],
      ["clean"],
    ],
  };

  const formats = [
    "header",
    "font",
    "size",
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "list",
    "bullet",
    "indent",
    "link",
    "image",
    "video",
    "color",
    "background",
    "align",
    "script",
  ];

  return (
    <div className="h-full bg-gray-50 p-6 ">
      <div className="max-w-full">
        <div className="p-6 bg-white rounded-lg">
          <div className="flex items-center gap-3 mb-6">
            <BackButton />
            <h2 className="text-xl font-semibold text-gray-900">
              Edit Privacy Policy
            </h2>
          </div>

          {loading ? (
            <div className="mb-6 flex items-center justify-center h-[500px]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
                <p>Loading...</p>
              </div>
            </div>
          ) : (
            <div className="mb-6">
              <style>{`
                .quill-editor-container .ql-container {
                  height: 480px;
                  font-size: 14px;
                }
                .quill-editor-container .ql-editor {
                  height: 100%;
                  overflow-y: auto;
                }
              `}</style>
              <ReactQuill
                theme="snow"
                value={content}
                onChange={setContent}
                modules={modules}
                formats={formats}
                className="quill-editor-container"
              />
            </div>
          )}

          <div className="flex justify-end mt-4">
            <Button
              onClick={handleUpdate}
              className="w-30 bg-yellow-400 hover:bg-yellow-500 text-black font-medium rounded-full"
              disabled={loading || updating}
            >
              {updating ? "Updating..." : "Update"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditPrivacyPolicyPage;
