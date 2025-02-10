// app/dashboard/employees/new/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "@/hooks/use-toast";
import AddressForm from "@/components/ui/address"; // Import AddressForm component

// Define the form schema
const employeeFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 characters"),
  address: z.object({
    street: z.string().min(5, "Address must be at least 5 characters"),
    city: z.string().min(2, "City must be at least 2 characters"),
    state: z.string().min(2, "State must be at least 2 characters"),
    zipCode: z.string().min(4, "Zip Code must be at least 4 characters"),
    country: z.string().min(2, "Country must be at least 2 characters"),
  }),
  jobTitle: z.string().min(2, "Job title must be at least 2 characters"),
  department: z.string().min(2, "Department must be at least 2 characters"),
  dateJoined: z.string().min(1, "Date joined is required"),
});

// Infer the type from the schema
type EmployeeFormData = z.infer<typeof employeeFormSchema>;

export default function NewEmployeePage() {
  const router = useRouter();

  // Initialize the form
  const form = useForm({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: {
        street: "",
        city: "",
        state: "",
        zipCode: "",
        country: "",
      },
      jobTitle: "",
      department: "",
      dateJoined: "",
    },
  });

  // Handle form submission
  const onSubmit = async (data: EmployeeFormData) => {
    console.log("Form Data", data); // Debug the data object
    try {
      const response = await fetch("/api/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          dateJoined: new Date(data.dateJoined).toISOString(), // Convert date to ISO string
        }),
      });
  
      const result = await response.json();
  
      if (response.ok) {
        toast({
          title: "Success",
          description: "Employee added successfully!",
        });
        router.push("/dashboard/employees");
      } else {
        // Handle API errors
        toast({
          title: "Error",
          description: result.error || "Failed to add employee.",
          variant: "destructive",
        });
      }
    } catch (error) {
      // Handle network or unexpected errors
      toast({
        title: "Error",
        description: "An error occurred while adding the employee.",
        variant: "destructive",
      });
    }
  };
  

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Add New Employee</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter employee name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="Enter employee email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <Input placeholder="Enter employee phone" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
         <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <div>
                    <AddressForm />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="jobTitle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Job Title</FormLabel>
                <FormControl>
                  <Input placeholder="Enter employee job title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="department"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Department</FormLabel>
                <FormControl>
                  <Input placeholder="Enter employee department" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="dateJoined"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date Joined</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Add Employee</Button>
        </form>
      </Form>
    </div>
  );
}
