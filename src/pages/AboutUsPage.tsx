import { Button } from "../components/ui/button";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import BackButton from "@/components/buttons/BackButton";

function AboutUsPage() {
  const navigate = useNavigate();
  const [content, setContent] = useState("");

  useEffect(() => {
    // Load content from localStorage or use default
    const savedContent = localStorage.getItem('aboutUsContent');
    if (savedContent) {
      setContent(savedContent);
    } else {
      const defaultContent = `Lorem ipsum dolor sit amet consectetur adipisicing elit. Molestiae unde doloribus voluptates voluptas explicabo nulla magnam exercitationem ducimus alias expedita quam soluta aspernatur quisquam, quibusdam, quia nesciunt tempora? Unde exercitationem, magnam aliquid placeat quas adipisci odio consequatur, accusamus officiis suscipit saepe similique. Perferendis ut illum nam rem. Maiores perspiciatis hic modi est repellat, quae iure provident suscipit qui quisquam quo nihil deleniti eos nisi commodi, sapiente cum? Ullam omnis tempora voluptate repellat cum beatae modi praesentium odio dolor, eos nisi possimus rem qui nihil ipsa quas est ad commodi molestias nam eius numquam perferendis, reiciendis nobis! Laboriosam exercitationem quibusdam velit eius natus! Ea hic reprehenderit veritatis doloremque maiores vero mollitia dolorum nulla sapiente, magni fugiat earum quo voluptatem corporis debitis animi magnam dolore assumenda aliquam odit laudantium.`;
      setContent(defaultContent);
    }
  }, []);

  const handleEdit = () => {
    navigate('/settings/about-us/edit');
  };


  return (
    <div className="h-full bg-gray-50 p-6">
      <div>
        <div className="p-6 bg-white rounded-lg">
          <div className="flex items-center gap-3 mb-6">
             <BackButton />
            <h2 className="text-xl font-semibold text-gray-900">About Us</h2>
          </div>
          <div className="text-gray-700 leading-relaxed mb-8 min-h-[400px]">
            {content}
          </div>
          <div className="mt-6 text-end">
            <Button 
              onClick={handleEdit}
              className="w-52 bg-yellow-400 hover:bg-yellow-500 text-black font-medium h-12 rounded-full"
            >
              Edit
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AboutUsPage;