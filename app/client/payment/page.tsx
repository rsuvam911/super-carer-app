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
import { ChevronLeft, ChevronRight, CreditCard, Download, Filter, Search } from "lucide-react"
import { useState } from "react"

// Define types for our data
interface Transaction {
  id: string
  date: string
  client: string
  amount: number
  status: string
  type: string
}

interface PaymentMethod {
  id: string
  type: string
  last4: string
  expiry: string
  isDefault: boolean
}

export default function PaymentPage() {
  const [activeTab, setActiveTab] = useState("transactions")

  // Mock transaction data
  const transactions = [
    {
      id: "tx1",
      date: "Apr 3, 2025",
      client: "Albert Flores",
      amount: 67.0,
      status: "Completed",
      type: "Payment",
    },
    {
      id: "tx2",
      date: "Apr 2, 2025",
      client: "Cameron Williamson",
      amount: 120.0,
      status: "Pending",
      type: "Payment",
    },
    {
      id: "tx3",
      date: "Apr 1, 2025",
      client: "Eleanor Pena",
      amount: 85.5,
      status: "Completed",
      type: "Payment",
    },
    {
      id: "tx4",
      date: "Mar 30, 2025",
      client: "Albert Flores",
      amount: 67.0,
      status: "Completed",
      type: "Payment",
    },
    {
      id: "tx5",
      date: "Mar 28, 2025",
      client: "Cameron Williamson",
      amount: 120.0,
      status: "Completed",
      type: "Payment",
    },
    {
      id: "tx6",
      date: "Mar 25, 2025",
      client: "Eleanor Pena",
      amount: 85.5,
      status: "Completed",
      type: "Payment",
    },
  ]

  // Mock payment methods
  const paymentMethods = [
    {
      id: "pm1",
      type: "Mastercard",
      last4: "4242",
      expiry: "04/2026",
      isDefault: true,
    },
    {
      id: "pm2",
      type: "Visa",
      last4: "1234",
      expiry: "12/2025",
      isDefault: false,
    },
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case "transactions":
        return <TransactionsTab transactions={transactions} />
      case "payment-methods":
        return <PaymentMethodsTab paymentMethods={paymentMethods} />
      default:
        return <TransactionsTab transactions={transactions} />
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Payment</h1>
        <p className="text-gray-500">Manage your payments and transactions</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab("transactions")}
            className={`px-6 py-4 text-sm font-medium ${
              activeTab === "transactions"
                ? "text-[#00C2CB] border-b-2 border-[#00C2CB]"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Transactions
          </button>

          <button
            onClick={() => setActiveTab("payment-methods")}
            className={`px-6 py-4 text-sm font-medium ${
              activeTab === "payment-methods"
                ? "text-[#00C2CB] border-b-2 border-[#00C2CB]"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Payment Methods
          </button>
        </div>

        <div className="p-6">{renderTabContent()}</div>
      </div>
    </div>
  )
}

function TransactionsTab({ transactions }: { transactions: Transaction[] }) {
  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div className="relative w-full sm:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search transactions..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-[#00C2CB] focus:border-transparent"
          />
        </div>

        <div className="flex space-x-2">
          <button className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </button>
          <button className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Type</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>{transaction.date}</TableCell>
                <TableCell>{transaction.client}</TableCell>
                <TableCell>${transaction.amount.toFixed(2)}</TableCell>
                <TableCell>
                  <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${transaction.status === "Completed" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                    <span className={`mr-1 w-1.5 h-1.5 rounded-full ${transaction.status === "Completed" ? "bg-green-700" : "bg-yellow-700"}`}></span>
                    {transaction.status}
                  </div>
                </TableCell>
                <TableCell>{transaction.type}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="mt-6 flex justify-between items-center">
        <div className="text-sm text-gray-500">
          Showing {transactions.length} of {transactions.length} transactions
        </div>

        <div className="flex items-center space-x-1">
          <Button variant="outline" size="icon" className="w-8 h-8 rounded-md">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="default" size="icon" className="w-8 h-8 rounded-md bg-[#00C2CB]">
            1
          </Button>
          <Button variant="outline" size="icon" className="w-8 h-8 rounded-md">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

function PaymentMethodsTab({ paymentMethods }: { paymentMethods: PaymentMethod[] }) {
  const [showAddCard, setShowAddCard] = useState(false)

  return (
    <div>
      <h3 className="text-lg font-medium mb-4">Your Payment Methods</h3>

      <div className="space-y-4 mb-6">
        {paymentMethods.map((method) => (
          <div key={method.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-12 h-8 bg-blue-100 rounded flex items-center justify-center mr-3">
                  {method.type === "Mastercard" ? (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect width="24" height="24" rx="4" fill="#1A56DB" />
                      <path
                        d="M12 18C15.3137 18 18 15.3137 18 12C18 8.68629 15.3137 6 12 6C8.68629 6 6 8.68629 6 12C6 15.3137 8.68629 18 12 18Z"
                        fill="#FF5F00"
                      />
                    </svg>
                  ) : (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect width="24" height="24" rx="4" fill="#2D3A9E" />
                      <path d="M9 16H15V8H9V16Z" fill="#FFFFFF" />
                    </svg>
                  )}
                </div>
                <div>
                  <h4 className="font-medium">
                    {method.type} ending in {method.last4}
                  </h4>
                  <p className="text-sm text-gray-500">Expires {method.expiry}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {method.isDefault && (
                  <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded">Default</span>
                )}
                <button className="text-gray-400 hover:text-gray-600">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M11 4H4C3.44772 4 3 4.44772 3 5V20C3 20.5523 3.44772 21 4 21H19C19.5523 21 20 20.5523 20 20V13"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M18.5 2.5C18.7626 2.23735 19.1131 2.07731 19.5 2.07731C19.8869 2.07731 20.2374 2.23735 20.5 2.5C20.7626 2.76264 20.9227 3.11309 20.9227 3.5C20.9227 3.88691 20.7626 4.23735 20.5 4.5L12 13L9 14L10 11L18.5 2.5Z"
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
        ))}
      </div>

      {showAddCard ? (
        <div className="border border-dashed border-gray-300 rounded-lg p-6">
          <h3 className="text-lg font-medium mb-4">Add New Card</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <CreditCard className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-[#00C2CB] focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expiration Date</label>
                <input
                  type="text"
                  placeholder="MM/YY"
                  className="px-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-[#00C2CB] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CVC</label>
                <input
                  type="text"
                  placeholder="123"
                  className="px-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-[#00C2CB] focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cardholder Name</label>
              <input
                type="text"
                placeholder="John Doe"
                className="px-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-[#00C2CB] focus:border-transparent"
              />
            </div>

            <div className="flex items-center">
              <input
                id="default-card"
                type="checkbox"
                className="h-4 w-4 text-[#00C2CB] focus:ring-[#00C2CB] border-gray-300 rounded"
              />
              <label htmlFor="default-card" className="ml-2 block text-sm text-gray-700">
                Set as default payment method
              </label>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={() => setShowAddCard(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button className="px-4 py-2 bg-[#00C2CB] text-white rounded-md hover:bg-[#00b0b9]">Add Card</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setShowAddCard(true)} className="flex items-center text-[#00C2CB]">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="mr-2"
          >
            <path
              d="M12 5V19M5 12H19"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Add New Payment Method
        </button>
      )}
    </div>
  )
}

