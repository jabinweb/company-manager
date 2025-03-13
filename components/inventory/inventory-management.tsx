'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDistanceToNow } from "date-fns";

interface InventoryEntry {
  id: string;
  quantity: number;
  price: number;
  createdAt: string;
  product: {
    name: string;
  };
}

interface InventoryManagementProps {
  productId?: string;
}

export function InventoryManagement({ productId }: InventoryManagementProps) {
  const [open, setOpen] = useState(false);
  const [inventory, setInventory] = useState<InventoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    quantity: "",
    price: "",
  });

  const fetchInventory = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (productId) queryParams.append("productId", productId);

      const response = await fetch(`/api/inventory?${queryParams}`);
      if (!response.ok) throw new Error("Failed to fetch inventory");
      
      const data = await response.json();
      setInventory(data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch inventory"
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          quantity: parseInt(formData.quantity),
          price: parseFloat(formData.price),
        }),
      });

      if (!response.ok) throw new Error("Failed to update inventory");

      toast({
        title: "Success",
        description: "Inventory updated successfully"
      });
      
      setOpen(false);
      fetchInventory();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update inventory"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Inventory History</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Update Inventory</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Inventory</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                  required
                />
              </div>
              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Updating..." : "Update"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {inventory.map((entry) => (
            <TableRow key={entry.id}>
              <TableCell>{formatDistanceToNow(new Date(entry.createdAt), { addSuffix: true })}</TableCell>
              <TableCell>{entry.quantity}</TableCell>
              <TableCell>${entry.price.toFixed(2)}</TableCell>
              <TableCell>${(entry.quantity * entry.price).toFixed(2)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
} 