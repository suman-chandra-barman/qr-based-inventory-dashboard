import { useNavigate } from "react-router";
import { Button } from "../ui/button";
import { ArrowLeft } from "lucide-react";

function BackButton() {
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };
  return (
    <Button
      variant="ghost"
      size="sm"
      className="p-2 h-8 w-8 hover:bg-gray-100 transition-colors duration-150"
      onClick={handleBack}
    >
      <ArrowLeft className="h-4 w-4" />
    </Button>
  );
}

export default BackButton;
