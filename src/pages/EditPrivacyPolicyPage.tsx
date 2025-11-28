import React, { useState, useEffect } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { Button } from "../components/ui/button";
import { useNavigate } from "react-router-dom";
import BackButton from "@/components/buttons/BackButton";

const EditPrivacyPolicyPage: React.FC = () => {
  const navigate = useNavigate();
  const [content, setContent] = useState("");

  useEffect(() => {
    // Load existing content from localStorage
    const savedContent = localStorage.getItem("privacyPolicyContent");
    if (savedContent) {
      setContent(savedContent);
    } else {
      // Set default content if no saved content exists
      const defaultContent = `Lorem ipsum dolor sit amet consectetur adipisicing elit. Molestiae unde doloribus voluptates voluptas explicabo nulla magnam exercitationem ducimus alias expedita quam soluta aspernatur quisquam, quibusdam, quia nesciunt tempora? Unde exercitationem, magnam aliquid placeat quas adipisci odio consequatur, accusamus officiis suscipit saepe similique. Perferendis ut illum nam rem. Maiores perspiciatis hic modi est repellat, quae iure provident suscipit qui quisquam quo nihil deleniti eos nisi commodi, sapiente cum? Ullam omnis tempora voluptate repellat cum beatae modi praesentium odio dolor, eos nisi possimus rem qui nihil ipsa quas est ad commodi molestias nam eius numquam perferendis, reiciendis nobis! Laboriosam exercitationem quibusdam velit eius natus! Ea hic reprehenderit veritatis doloremque maiores vero mollitia dolorum nulla sapiente, magni fugiat earum quo voluptatem corporis debitis animi magnam dolore assumenda aliquam odit laudantium.`;
      setContent(defaultContent);
    }
  }, []);

  const handleUpdate = () => {
    // Save content to localStorage
    localStorage.setItem("privacyPolicyContent", content);
    // Navigate back to the view page
    navigate("/settings/privacy-policy");
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
    <div className="h-full bg-gray-50 p-6">
      <div>
        <div className="p-6 bg-white rounded-lg">
          <div className="flex items-center gap-3 mb-6">
            <BackButton />
            <h2 className="text-xl font-semibold text-gray-900">
              Edit Privacy Policy
            </h2>
          </div>

          <div className="mb-6">
            <ReactQuill
              theme="snow"
              value={content}
              onChange={setContent}
              modules={modules}
              formats={formats}
              className="mb-6"
              style={{ minHeight: "400px" }}
            />
          </div>

          <div className="flex justify-end">
            <Button
              onClick={handleUpdate}
              className="w-52 bg-yellow-400 hover:bg-yellow-500 text-black font-medium h-12 rounded-full"
            >
              Update
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditPrivacyPolicyPage;
