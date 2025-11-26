/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { Trash2, Loader2, ArrowUpRight, Download } from "lucide-react";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import { Checkbox } from "../components/ui/checkbox";
import { Pagination } from "../components/pagination/Pagination";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useGetAllUsersQuery } from "@/redux/api/api";
import type { User } from "@/types";
import jsPDF from "jspdf";

const baseUrl = "http://10.10.12.25:5008";

export default function CustomersPage() {
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [deleting, setDeleting] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const itemsPerPage = 6;

  // Fetch users from API
  const { data: usersData, isLoading } = useGetAllUsersQuery({
    page: currentPage,
    limit: itemsPerPage,
  });

  // Extract users from API response
  let users: User[] = [];
  if (usersData?.data?.result && Array.isArray(usersData.data.result)) {
    users = usersData.data.result.map((user: User) => ({
      ...user,
      id: user._id || user.id,
    }));
  }

  const totalCount = usersData?.data?.meta?.total || 0;
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedCustomers(users.map((c) => c.id || c._id));
    } else {
      setSelectedCustomers([]);
    }
  };

  const handleSelectCustomer = (customerId: string, checked: boolean) => {
    if (checked) {
      setSelectedCustomers([...selectedCustomers, customerId]);
    } else {
      setSelectedCustomers(selectedCustomers.filter((id) => id !== customerId));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedCustomers.length === 0) return;

    setDeleting(true);

    // Simulate API delay
    setTimeout(() => {
      toast.success(
        `Successfully deleted ${selectedCustomers.length} customer(s)`
      );
      setSelectedCustomers([]);
      setDeleting(false);
    }, 500);
  };

  const handleActionClick = (customer: User) => {
    setSelectedCustomer(customer);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCustomer(null);
  };

  const handleDownloadPDF = () => {
    if (users.length === 0) {
      toast.error("No data to download");
      return;
    }

    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.text("Customer List", 14, 20);
    
    // Add date
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 28);
    
    // Add table headers
    doc.setFontSize(12);
    let yPos = 40;
    
    users.forEach((user, index) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.setFontSize(11);
      doc.setFont("helvetica", 'bold');
      doc.text(`Customer ${index + 1}`, 14, yPos);
      yPos += 6;
      
      doc.setFontSize(10);
      doc.setFont("helvetica", 'normal');
      doc.text(`ID: ${user._id}`, 14, yPos);
      yPos += 6;
      doc.text(`Name: ${user.name}`, 14, yPos);
      yPos += 6;
      doc.text(`Email: ${user.email}`, 14, yPos);
      yPos += 6;
      doc.text(`Phone: ${user.phone || "N/A"}`, 14, yPos);
      yPos += 6;
      doc.text(`Purchases: $${(user as any).purchases?.toFixed(2) || "0.00"}`, 14, yPos);
      yPos += 6;
      doc.text(`Address: ${(user as any).address || "N/A"}`, 14, yPos);
      yPos += 6;
      doc.text(`Status: ${user.verified ? "Verified" : "Unverified"}`, 14, yPos);
      yPos += 6;
      doc.text(`Joined: ${new Date(user.createdAt).toLocaleDateString()}`, 14, yPos);
      yPos += 10;
    });
    
    doc.save(`customers_${new Date().toISOString().split("T")[0]}.pdf`);
    toast.success("PDF downloaded successfully");
  };

  const isAllSelected =
    users.length > 0 &&
    selectedCustomers.length === users.length;
  const isIndeterminate =
    selectedCustomers.length > 0 &&
    selectedCustomers.length < users.length;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Content */}
        <main className="flex-1 p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                Customer
              </h1>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>Dashboard</span>
                <span>›</span>
                <span className="text-blue-600">Customer</span>
              </div>
            </div>
            <Button
              onClick={handleDownloadPDF}
              className="bg-[#FFD700] text-[#003366] hover:bg-amber-400 rounded-full"
              disabled={isLoading || users.length === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
          </div>

          <div className="space-y-6">
            {selectedCustomers.length > 0 && (
              <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <span className="text-sm text-blue-700">
                  {selectedCustomers.length} customer(s) selected
                </span>
                <Button
                  onClick={handleBulkDelete}
                  disabled={deleting}
                  variant="destructive"
                  size="sm"
                  className="ml-auto"
                >
                  {deleting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Selected
                    </>
                  )}
                </Button>
              </div>
            )}

            <div className="bg-white rounded-lg border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="w-12 p-4">
                        <Checkbox
                          checked={isAllSelected}
                          onCheckedChange={handleSelectAll}
                          className={
                            isIndeterminate
                              ? "data-[state=checked]:bg-blue-500"
                              : ""
                          }
                          ref={(el) => {
                            if (el) {
                              const input = el.querySelector('input');
                              if (input) input.indeterminate = isIndeterminate;
                            }
                          }}
                        />
                      </th>
                      <th className="text-left p-4 font-medium text-gray-900">
                        Name Customer
                      </th>
                      <th className="text-left p-4 font-medium text-gray-900">
                        Contact
                      </th>
                      <th className="text-left p-4 font-medium text-gray-900">
                        Purchases
                      </th>
                      <th className="text-left p-4 font-medium text-gray-900">
                        Address
                      </th>
                      <th className="text-left p-4 font-medium text-gray-900">
                        Status
                      </th>
                      <th className="text-left p-4 font-medium text-gray-900">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                            <span className="text-gray-500">Loading customers...</span>
                          </div>
                        </td>
                      </tr>
                    ) : users.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-gray-500">
                          No customers found
                        </td>
                      </tr>
                    ) : (
                      users.map((user, index) => (
                        <tr
                          key={`${user.id}-${index}`}
                          className="border-b hover:bg-gray-50"
                        >
                          <td className="p-4">
                            <Checkbox
                              checked={selectedCustomers.includes(user.id || user._id)}
                              onCheckedChange={(checked) =>
                                handleSelectCustomer(
                                  user.id || user._id,
                                  checked as boolean
                                )
                              }
                            />
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              {user.image && (
                                <img
                                  src={user.image.startsWith('http') ? user.image : `${baseUrl}${user.image}`}
                                  alt={user.name}
                                  className="w-10 h-10 rounded-full object-cover"
                                />
                              )}
                              <div>
                                <p className="font-medium text-gray-900">
                                  {user.name}
                                </p>
                                <p className="text-sm text-blue-600">
                                  #{user._id.slice(-6).toUpperCase()}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <div>
                              <p className="text-gray-900">{user.email}</p>
                              <p className="text-sm text-gray-500">
                                {user.phone || "N/A"}
                              </p>
                            </div>
                          </td>
                          <td className="p-4 text-gray-900">
                            ${(user as any).purchases?.toFixed(2) || "0.00"}
                          </td>
                          <td className="p-4 text-gray-900">
                            {(user as any).address || "N/A"}
                          </td>
                          <td className="p-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              user.verified 
                                ? "bg-green-100 text-green-800" 
                                : "bg-red-100 text-red-800"
                            }`}>
                              {user.verified ? "Verified" : "Unverified"}
                            </span>
                          </td>
                          <td className="p-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleActionClick(user)}
                            >
                              <ArrowUpRight className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {!isLoading && totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            )}
          </div>
        </main>
      </div>

      {/* Customer Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={(open) => !open && handleCloseModal()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Customer Details</DialogTitle>
          </DialogHeader>
          {selectedCustomer && (
            <div className="space-y-4">
              {selectedCustomer.image && (
                <div className="flex justify-center">
                  <img
                    src={selectedCustomer.image.startsWith('http') ? selectedCustomer.image : `${baseUrl}${selectedCustomer.image}`}
                    alt={selectedCustomer.name}
                    className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
                  />
                </div>
              )}
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-500">Name</p>
                  <p className="text-base font-semibold text-gray-900">{selectedCustomer.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="text-base text-gray-900">{selectedCustomer.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Phone</p>
                  <p className="text-base text-gray-900">{selectedCustomer.phone || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Purchases</p>
                  <p className="text-base text-gray-900">${(selectedCustomer as any).purchases?.toFixed(2) || "0.00"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Address</p>
                  <p className="text-base text-gray-900">{(selectedCustomer as any).address || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    selectedCustomer.verified 
                      ? "bg-green-100 text-green-800" 
                      : "bg-red-100 text-red-800"
                  }`}>
                    {selectedCustomer.verified ? "Verified" : "Unverified"}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Customer ID</p>
                  <p className="text-sm text-gray-900 font-mono">{selectedCustomer._id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Joined At</p>
                  <p className="text-base text-gray-900">
                    {new Date(selectedCustomer.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
              
              {/* Download Button in Modal */}
              <div className="pt-4 border-t">
                <Button
                  onClick={() => {
                    const doc = new jsPDF();
                    
                    // Add title
                    doc.setFontSize(18);
                    doc.text("Customer Details", 14, 20);
                    
                    // Add customer info
                    let yPos = 35;
                    doc.setFontSize(12);
                    
                    doc.setFont("helvetica", 'bold');
                    doc.text("Name:", 14, yPos);
                    doc.setFont("helvetica", 'normal');
                    doc.text(selectedCustomer.name, 50, yPos);
                    yPos += 10;
                    
                    doc.setFont("helvetica", 'bold');
                    doc.text("Email:", 14, yPos);
                    doc.setFont("helvetica", 'normal');
                    doc.text(selectedCustomer.email, 50, yPos);
                    yPos += 10;
                    
                    doc.setFont("helvetica", 'bold');
                    doc.text("Phone:", 14, yPos);
                    doc.setFont("helvetica", 'normal');
                    doc.text(selectedCustomer.phone || "N/A", 50, yPos);
                    yPos += 10;
                    
                    doc.setFont("helvetica", 'bold');
                    doc.text("Purchases:", 14, yPos);
                    doc.setFont("helvetica", 'normal');
                    doc.text(`$${(selectedCustomer as any).purchases?.toFixed(2) || "0.00"}`, 50, yPos);
                    yPos += 10;
                    
                    doc.setFont("helvetica", 'bold');
                    doc.text("Address:", 14, yPos);
                    doc.setFont("helvetica", 'normal');
                    doc.text((selectedCustomer as any).address || "N/A", 50, yPos);
                    yPos += 10;
                    
                    doc.setFont("helvetica", 'bold');
                    doc.text("Status:", 14, yPos);
                    doc.setFont("helvetica", 'normal');
                    doc.text(selectedCustomer.verified ? "Verified" : "Unverified", 50, yPos);
                    yPos += 10;
                    
                    doc.setFont("helvetica", 'bold');
                    doc.text("Customer ID:", 14, yPos);
                    doc.setFont("helvetica", 'normal');
                    doc.text(selectedCustomer._id, 50, yPos);
                    yPos += 10;
                    
                    doc.setFont("helvetica", 'bold');
                    doc.text("Joined At:", 14, yPos);
                    doc.setFont("helvetica", 'normal');
                    doc.text(new Date(selectedCustomer.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    }), 50, yPos);
                    
                    doc.save(`customer_${selectedCustomer._id}_${new Date().toISOString().split("T")[0]}.pdf`);
                    toast.success("PDF downloaded successfully");
                  }}
                  className="w-full bg-[#FFD700] text-[#003366] hover:bg-amber-400 rounded-full"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
