"use client"

import { useQuery } from "@tanstack/react-query"

// Import JSON data
import appointmentsData from "@/data/appointments.json"
import bookingsData from "@/data/bookings.json"
import clientDistributionData from "@/data/client-distribution.json"
import clientsData from "@/data/clients.json"
import invoicesData from "@/data/invoices.json"
import ratingsData from "@/data/ratings.json"
import serviceData from "@/data/service-data.json"
import statsData from "@/data/stats.json"
import usersData from "@/data/users.json"

// Mock API functions that would normally fetch from a backend
// In a real app, these would make actual API calls

export function useStats() {
  return useQuery({
    queryKey: ["stats"],
    queryFn: async () => {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))
      return statsData.stats
    },
    initialData: statsData.stats,
  })
}

export function useClients() {
  return useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))
      return clientsData.clients
    },
    initialData: clientsData.clients,
  })
}

export function useInvoices() {
  return useQuery({
    queryKey: ["invoices"],
    queryFn: async () => {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))
      return invoicesData.invoices
    },
    initialData: invoicesData.invoices,
  })
}

export function useBookings() {
  return useQuery({
    queryKey: ["bookings"],
    queryFn: async () => {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))
      return bookingsData.bookings
    },
    initialData: bookingsData.bookings,
  })
}

export function useAppointments() {
  return useQuery({
    queryKey: ["appointments"],
    queryFn: async () => {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))
      return appointmentsData.appointments
    },
    initialData: appointmentsData.appointments,
  })
}

export function useClientDistribution() {
  return useQuery({
    queryKey: ["clientDistribution"],
    queryFn: async () => {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))
      return clientDistributionData.clientDistribution
    },
    initialData: clientDistributionData.clientDistribution,
  })
}

export function useServiceData() {
  return useQuery({
    queryKey: ["serviceData"],
    queryFn: async () => {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))
      return serviceData.serviceData
    },
    initialData: serviceData.serviceData,
  })
}

export function useRatings() {
  return useQuery({
    queryKey: ["ratings"],
    queryFn: async () => {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))
      return ratingsData.ratings
    },
    initialData: ratingsData.ratings,
  })
}

export function useUser() {
  return useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))
      return { user: usersData.users[0], currentDate: usersData.currentDate }
    },
    initialData: { user: usersData.users[0], currentDate: usersData.currentDate },
  })
}

// Authentication functions
export async function loginUser(email: string, password: string) {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 500))

  const user = usersData.users.find(u => u.email === email && u.password === password)
  if (!user) {
    throw new Error('Invalid email or password')
  }

  return { user, currentDate: usersData.currentDate }
}

export async function registerUser(name: string, email: string, password: string) {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 500))

  // Check if user already exists
  const existingUser = usersData.users.find(u => u.email === email)
  if (existingUser) {
    throw new Error('User with this email already exists')
  }

  // In a real app, we would add the user to the database
  // For now, we'll just return a success message
  return { success: true, message: 'User registered successfully' }
}

export async function socialLogin(provider: 'google' | 'facebook' | 'apple') {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 500))

  // In a real app, we would authenticate with the provider
  // For now, we'll just return the first user
  return { user: usersData.users[0], currentDate: usersData.currentDate }
}

