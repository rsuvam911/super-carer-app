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
import { useClients } from "@/lib/api"
import { MoreVertical, Search } from "lucide-react"

// Define types for our data
interface Client {
  id: string
  name: string
  location: string
  date: string
  serviceDetails: string
  status: string
}

export default function ClientsPage() {
  const { data: clients } = useClients()

  if (!clients) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Client Listing</h1>
        <p className="text-gray-500">250 clients</p>
      </div>

      <div className="flex justify-between">
        <div className="relative w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search here"
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-[#00C2CB] focus:border-transparent"
          />
        </div>

        <div className="flex items-center">
          <span className="mr-2 text-sm">Sort by:</span>
          <select className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00C2CB] focus:border-transparent">
            <option>Newest</option>
            <option>Oldest</option>
            <option>A-Z</option>
            <option>Z-A</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto p-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client Name</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Service Details</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((client: Client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">{client.name}</TableCell>
                  <TableCell>{client.location}</TableCell>
                  <TableCell>{client.date}</TableCell>
                  <TableCell>{client.serviceDetails}</TableCell>
                  <TableCell>
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${client.status === "Completed" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      <span className={`mr-1 w-1.5 h-1.5 rounded-full ${client.status === "Completed" ? "bg-green-700" : "bg-red-700"}`}></span>
                      {client.status}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="px-6 py-4 flex items-center justify-center space-x-1">
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
          <button className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-300">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M9 12L5 8L9 4"
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
          <button className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-300">...</button>
          <button className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-300">10</button>
          <button className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-300">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M7 4L11 8L7 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
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
  )
}

