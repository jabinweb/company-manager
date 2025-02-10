import React from "react";
import { useFormContext, Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { FormLabel, FormControl, FormMessage, FormItem } from "@/components/ui/form";

const AddressForm = () => {
  const { control } = useFormContext();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Street Address */}
      <div className="col-span-full">
        <FormItem>
          <FormLabel>Street Address</FormLabel>
          <FormControl>
            <Controller
              name="address.street"
              control={control}
              render={({ field }) => (
                <Input placeholder="Enter street address" {...field} />
              )}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      </div>

      {/* City */}
      <div>
        <FormItem>
          <FormLabel>City</FormLabel>
          <FormControl>
            <Controller
              name="address.city"
              control={control}
              render={({ field }) => (
                <Input placeholder="Enter city" {...field} />
              )}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      </div>

      {/* State/Province */}
      <div>
        <FormItem>
          <FormLabel>State/Province</FormLabel>
          <FormControl>
            <Controller
              name="address.state"
              control={control}
              render={({ field }) => (
                <Input placeholder="Enter state" {...field} />
              )}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      </div>

      {/* ZIP/Postal Code */}
      <div>
        <FormItem>
          <FormLabel>ZIP/Postal Code</FormLabel>
          <FormControl>
            <Controller
              name="address.zipCode"
              control={control}
              render={({ field }) => (
                <Input placeholder="Enter ZIP code" {...field} />
              )}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      </div>

      {/* Country */}
      <div>
        <FormItem>
          <FormLabel>Country</FormLabel>
          <FormControl>
            <Controller
              name="address.country"
              control={control}
              render={({ field }) => (
                <Input placeholder="Enter country" {...field} />
              )}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      </div>
    </div>
  );
};

export default AddressForm;
