"use client";

import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { Mail, User } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import debounce from 'lodash/debounce'; 

const employeeRegisterSchema = z.object({
  name: z.string().min(2, "Your name is required"),
  email: z.string().email("Valid email is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  companyId: z.number().positive("Company selection is required"), // Changed from company string to companyId number
});

type EmployeeRegisterFormData = z.infer<typeof employeeRegisterSchema>;

interface Company {
  id: number;  // Changed from string to number
  name: string;
}

export default function EmployeeRegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<EmployeeRegisterFormData>({
    resolver: zodResolver(employeeRegisterSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      companyId: undefined, // Changed from company to companyId
    }
  });

  const debouncedSearch = useMemo(
    () =>
      debounce(async (query: string) => {
        if (query.length < 2) {
          setCompanies([]);
          return;
        }
  
        try {
          const response = await fetch(`/api/companies/search?q=${encodeURIComponent(query)}`);
          const data = await response.json();
          if (response.ok) {
            setCompanies(data.companies);
          }
        } catch (error) {
          console.error("Failed to fetch companies:", error);
          setCompanies([]);
        }
      }, 300),
    []
  );

  useEffect(() => {
    debouncedSearch(searchTerm);
    return () => debouncedSearch.cancel();
  }, [searchTerm, debouncedSearch]);

  const handleCompanySelect = (company: Company) => {
    setSelectedCompany(company);
    setSearchTerm(company.name);
    setValue('companyId', company.id); // Changed from company to companyId
    setCompanies([]); // Clear the search results
  };

  const onSubmit = async (data: EmployeeRegisterFormData) => {
    if (!selectedCompany) {
      toast({
        title: "Error",
        description: "Please select a company from the list",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/employee/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          email: data.email.toLowerCase(),
          password: data.password,
          companyId: data.companyId, // Using the numeric companyId
          status: 'PENDING',
          role: 'EMPLOYEE',
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Registration failed");
      }

      toast({
        title: "Registration submitted",
        description: "Your account is pending admin approval. You'll be able to login once approved.",
        duration: 6000,
      });

      await new Promise(resolve => setTimeout(resolve, 2000));
      router.push("/employee/login");

    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Registration failed",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-lg">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold">Employee Registration</h2>
          <p className="text-gray-600 mt-2">Join your company</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Input
              {...register("name")}
              type="text"
              placeholder="Full Name"
              className="w-full"
            />
            {errors.name && (
              <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Input
                {...register("email")}
                type="email"
                placeholder="Email address"
                className="pl-10"
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div>
            <div className="relative">
              <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Input
                {...register("password")}
                type="password"
                placeholder="Password"
                className="pl-10"
              />
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>

          <div className="relative">
            <label htmlFor="company" className="block text-sm font-medium text-gray-700">
              Company
            </label>
            <Input
              type="text"
              placeholder="Search for your company"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mt-1 block w-full"
            />
            <input 
              type="hidden" 
              {...register("companyId")} // Changed from company to companyId
              value={selectedCompany?.id || ''} 
            />
            {companies.length > 0 && (
              <ul className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-200 bg-white shadow-sm">
                {companies.map((company) => (
                  <li
                    key={company.id}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleCompanySelect(company)}
                  >
                    {company.name}
                  </li>
                ))}
              </ul>
            )}
            {errors.companyId && ( // Changed from company to companyId
              <p className="text-sm text-red-500 mt-1">{errors.companyId.message}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? "Submitting..." : "Register"}
          </Button>

          <p className="text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link href="/employee/login" className="text-blue-600 hover:text-blue-500">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}