import { ArrowLeft } from "lucide-react";
import { Button } from "../components/ui/button";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { toast } from "sonner";

const baseUrl = "http://10.10.12.25:5008";

function TermsConditionPage() {
  const navigate = useNavigate();
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTermsCondition();
  }, []);

  const fetchTermsCondition = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${baseUrl}/api/v1/setting/get/terms`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const result = await response.json();
      console.log("Terms & Condition response:", result);

      if (response.ok && result.success && result.data?.description) {
        setContent(result.data.description);
      } else {
        // Use default content if API fails
        const defaultContent = `Lorem ipsum dolor sit amet consectetur adipisicing elit. Molestiae unde doloribus voluptates voluptas explicabo nulla magnam exercitationem ducimus alias expedita quam soluta aspernatur quisquam, quibusdam, quia nesciunt tempora? Unde exercitationem, magnam aliquid placeat quas adipisci odio consequatur, accusamus officiis suscipit saepe similique. Perferendis ut illum nam rem. Maiores perspiciatis hic modi est repellat, quae iure provident suscipit qui quisquam quo nihil deleniti eos nisi commodi, sapiente cum? Ullam omnis tempora voluptate repellat cum beatae modi praesentium odio dolor, eos nisi possimus rem qui nihil ipsa quas est ad commodi molestias nam eius numquam perferendis, reiciendis nobis! Laboriosam exercitationem quibusdam velit eius natus! Ea hic reprehenderit veritatis doloremque maiores vero mollitia dolorum nulla sapiente, magni fugiat earum quo voluptatem corporis debitis animi magnam dolore assumenda aliquam odit laudantium.`;
        setContent(defaultContent);
      }
    } catch (error) {
      console.error("Error fetching terms & condition:", error);
      toast.error("Failed to load Terms & Condition");
      const defaultContent = `Lorem ipsum dolor sit amet consectetur adipisicing elit. Molestiae unde doloribus voluptates voluptas explicabo nulla magnam exercitationem ducimus alias expedita quam soluta aspernatur quisquam, quibusdam, quia nesciunt tempora? Unde exercitationem, magnam aliquid placeat quas adipisci odio consequatur, accusamus officiis suscipit saepe similique. Perferendis ut illum nam rem. Maiores perspiciatis hic modi est repellat, quae iure provident suscipit qui quisquam quo nihil deleniti eos nisi commodi, sapiente cum? Ullam omnis tempora voluptate repellat cum beatae modi praesentium odio dolor, eos nisi possimus rem qui nihil ipsa quas est ad commodi molestias nam eius numquam perferendis, reiciendis nobis! Laboriosam exercitationem quibusdam velit eius natus! Ea hic reprehenderit veritatis doloremque maiores vero mollitia dolorum nulla sapiente, magni fugiat earum quo voluptatem corporis debitis animi magnam dolore assumenda aliquam odit laudantium.`;
      setContent(defaultContent);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigate("/settings/terms-condition/edit");
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  return (
    <div className="h-full bg-gray-50 p-6">
      <div className="p-6 bg-white rounded-lg">
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant="ghost"
            size="sm"
            className="p-0 h-auto"
            onClick={handleBack}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-xl font-semibold text-gray-900">
            Terms & Condition
          </h2>
        </div>
        
        {loading ? (
          <div className="text-gray-700 leading-relaxed mb-8 min-h-[400px] flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
              <p>Loading...</p>
            </div>
          </div>
        ) : (
          <div className="text-gray-700 leading-relaxed mb-8 min-h-[400px] whitespace-pre-wrap">
            {content}
          </div>
        )}
        
        <div className="mt-6 text-end">
          <Button
            onClick={handleEdit}
            className="w-52 bg-yellow-400 hover:bg-yellow-500 text-black font-medium h-12 rounded-full"
            disabled={loading}
          >
            Edit
          </Button>
        </div>
      </div>
    </div>
  );
}

export default TermsConditionPage;
