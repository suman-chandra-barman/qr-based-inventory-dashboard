import { Button } from "../components/ui/button";
import { useNavigate } from "react-router-dom";
import BackButton from "@/components/buttons/BackButton";
import { useGetAboutUsQuery } from "../redux/api/api";

function AboutUsPage() {
  const navigate = useNavigate();
  const { data, isLoading } = useGetAboutUsQuery(undefined);

  const content = data?.data?.description;

  const handleEdit = () => {
    navigate("/settings/about-us/edit");
  };

  return (
    <div className="h-full bg-gray-50 p-6">
      <div className="p-6 bg-white rounded-lg">
        <div className="flex items-center gap-3 mb-6">
          <BackButton />
          <h2 className="text-xl font-semibold text-gray-900">About Us</h2>
        </div>

        {isLoading ? (
          <div className="text-gray-700 leading-relaxed mb-8 min-h-[400px] flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
              <p>Loading...</p>
            </div>
          </div>
        ) : content ? (
          <div
            className="text-gray-700 leading-relaxed mb-8 min-h-[400px] prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        ) : (
          <div className="text-gray-700 leading-relaxed mb-8 min-h-[400px] flex items-center justify-center">
            <div className="text-center">
              <div className="text-gray-400 mb-4">
                <svg
                  className="mx-auto h-16 w-16"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <p className="text-gray-500 text-lg font-medium">
                No About Us Content Available
              </p>
              <p className="text-gray-400 text-sm mt-2">
                Click the Edit button below to add About Us content
              </p>
            </div>
          </div>
        )}

        <div className="mt-6 text-end">
          <Button
            onClick={handleEdit}
            className="w-32 bg-yellow-400 hover:bg-yellow-500 text-black font-medium rounded-full"
            disabled={isLoading}
          >
            {content ? "Edit" : "Add"} About Us
          </Button>
        </div>
      </div>
    </div>
  );
}

export default AboutUsPage;
