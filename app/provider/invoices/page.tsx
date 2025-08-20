"use client"

import { Button } from "@/components/ui/button"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table"
import { useInvoices } from "@/lib/api"
import { Edit, Eye, FileText, Search } from "lucide-react"
import { useState } from "react"

// Define types for our data
interface Invoice {
  id: string
  invoiceNo: string
  clientName: string
  price: string | number
  dueDate: string
  status: string
}

export default function InvoicesPage() {
  const { data: invoices } = useInvoices()
  const [filterStatus, setFilterStatus] = useState<string | null>(null)

  if (!invoices) {
    return <div>Loading...</div>
  }

  const filteredInvoices = filterStatus ? invoices.filter((invoice) => invoice.status === filterStatus) : invoices

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Invoices</h1>
        <p className="text-gray-500">Manage your invoices</p>
      </div>

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="relative w-full sm:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search invoices..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-[#00C2CB] focus:border-transparent"
          />
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setFilterStatus(null)}
            className={`px-4 py-2 rounded-md text-sm ${!filterStatus ? "bg-[#00C2CB] text-white" : "bg-white text-gray-500"}`}
          >
            All
          </button>
          <button
            onClick={() => setFilterStatus("Completed")}
            className={`px-4 py-2 rounded-md text-sm ${filterStatus === "Completed" ? "bg-[#00C2CB] text-white" : "bg-white text-gray-500"}`}
          >
            Completed
          </button>
          <button
            onClick={() => setFilterStatus("Pending")}
            className={`px-4 py-2 rounded-md text-sm ${filterStatus === "Pending" ? "bg-[#00C2CB] text-white" : "bg-white text-gray-500"}`}
          >
            Pending
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium">Invoice List</h2>
            <button className="bg-[#00C2CB] text-white px-4 py-2 rounded-md text-sm flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              Create Invoice
            </button>
          </div>
        </div>

        <div className="overflow-x-auto p-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice No.</TableHead>
                <TableHead>Client Name</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.map((invoice: Invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.invoiceNo}</TableCell>
                  <TableCell>{invoice.clientName}</TableCell>
                  <TableCell>${invoice.price}</TableCell>
                  <TableCell>{invoice.dueDate}</TableCell>
                  <TableCell>
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${invoice.status === "Completed" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      <span className={`mr-1 w-1.5 h-1.5 rounded-full ${invoice.status === "Completed" ? "bg-green-700" : "bg-red-700"}`}></span>
                      {invoice.status}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="px-6 py-4 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing {filteredInvoices.length} of {invoices.length} invoices
          </div>

          <div className="flex items-center space-x-1">
            <button className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-300">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M10 12L6 8L10 4"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-md bg-[#00C2CB] text-white">1</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-300">2</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-300">3</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-300">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M6 4L10 8L6 12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

