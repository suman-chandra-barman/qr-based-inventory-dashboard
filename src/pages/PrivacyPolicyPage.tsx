import { Button } from "../components/ui/button";
import { useNavigate } from "react-router-dom";
import BackButton from "@/components/buttons/BackButton";
import { useGetPrivacyPolicyQuery } from "../redux/api/api";

function PrivacyPolicyPage() {
  const navigate = useNavigate();
  const { data, isLoading } = useGetPrivacyPolicyQuery(undefined);

  const content = data?.data?.description;

  const handleEdit = () => {
    navigate("/settings/privacy-policy/edit");
  };

  return (
    <div className="h-full bg-gray-50 p-6">
      <div className="p-6 bg-white rounded-lg">
        <div className="flex items-center gap-3 mb-6">
          <BackButton />
          <h2 className="text-xl font-semibold text-gray-900">
            Privacy Policy
          </h2>
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
                No Privacy Policy Available
              </p>
              <p className="text-gray-400 text-sm mt-2">
                Click the Edit button below to add Privacy Policy
              </p>
            </div>
          </div>
        )}

        <div className="mt-6 text-end">
          <Button
            onClick={handleEdit}
            className=" bg-yellow-400 hover:bg-yellow-500 text-black font-medium rounded-full px-4"
            disabled={isLoading}
          >
            {content ? "Edit" : "Add"} Privacy Policy
          </Button>
        </div>
      </div>
    </div>
  );
}

export default PrivacyPolicyPage;
