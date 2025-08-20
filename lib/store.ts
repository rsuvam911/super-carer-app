// Define types for our data models

export type User = {
  id: string
  name: string
  email: string
  avatar: string
}

export type Client = {
  id: string
  name: string
  location: string
  date: string
  serviceDetails: string
  status: "Completed" | "Pending"
}

export type Invoice = {
  id: string
  invoiceNo: string
  clientName: string
  price: number | string
  dueDate: string
  status: "Completed" | "Pending"
}

export type Booking = {
  id: string
  clientName: string
  location: string
  date: string
  serviceDetails: string
}

export type Appointment = {
  id: string
  name: string
  date: string
  description: string
}

export type Stats = {
  totalWork: number
  totalWorkChange: number
  totalEarning: number
  totalEarningChange: number
  totalInvoices: number
  totalInvoicesChange: number
}

export type ClientDistribution = {
  elderlyCare: number
  childrenCare: number
  disabilityCare: number
}

export type ServiceData = {
  month: string
  value: number
}
