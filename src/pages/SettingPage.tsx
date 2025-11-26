import { ChevronRight } from "lucide-react"
import { Link } from "react-router-dom"

const settingsItems = [
  {
    title: "Personal Information",
    href: "/settings/personal-information",
  },
  {
    title: "Change Password",
    href: "/settings/change-password",
  },
  {
    title: "Terms & Condition",
    href: "/settings/terms-condition",
  },
  {
    title: "Privacy policy",
    href: "/settings/privacy-policy",
  },
  {
    title: "About Us",
    href: "/settings/about-us",
  },
]

export default function SettingsPage() {
  return (
    <div className="flex bg-gray-50">
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Content */}
        <main className="flex-1 p-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-8">Setting</h1>

            <div className="space-y-1">
              {settingsItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  <span className="text-sm font-medium text-gray-900">{item.title}</span>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                </Link>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
