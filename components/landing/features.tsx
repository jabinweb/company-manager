'use client'

import { motion } from "framer-motion"
import {
  Users,
  BarChart,
  ClipboardList,
  Package,
  Bell,
  Calendar,
  Clock,
  BadgeDollarSign,
} from "lucide-react"

const features = [
  {
    title: "Employee Management",
    description: "Manage employees, roles, and permissions with ease. Track attendance and performance.",
    icon: Users,
  },
  {
    title: "Inventory Control",
    description: "Track stock levels, manage products, and automate reordering processes.",
    icon: Package,
  },
  {
    title: "Task Management",
    description: "Assign and track tasks, set deadlines, and monitor progress in real-time.",
    icon: ClipboardList,
  },
  {
    title: "Performance Analytics",
    description: "Get insights into your business with detailed reports and analytics.",
    icon: BarChart,
  },
  {
    title: "Leave Management",
    description: "Handle leave requests, track balances, and manage attendance efficiently.",
    icon: Calendar,
  },
  {
    title: "Time Tracking",
    description: "Track work hours, breaks, and overtime with our built-in time management system.",
    icon: Clock,
  },
  {
    title: "Payroll System",
    description: "Manage salaries, deductions, and generate payslips automatically.",
    icon: BadgeDollarSign,
  },
  {
    title: "Real-time Notifications",
    description: "Stay updated with instant notifications for important events and approvals.",
    icon: Bell,
  },
]

export function Features() {
  return (
    <section id="features" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">
            Everything You Need to Run Your Business
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Powerful features to help you manage every aspect of your company
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div 
          className="text-center mt-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <p className="text-xl text-gray-600 mb-8">
            And many more features to help you grow your business
          </p>
        </motion.div>
      </div>
    </section>
  )
}
