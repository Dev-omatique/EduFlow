"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {Form,FormField,FormItem,FormControl,FormMessage,} from "@/components/ui/form";


type Field = {
  name: string;
  type: string;
  placeholder: string;
};

type AuthFormProps = {
  title: string;
  fields: Field[] ;
  submitText: string;
  schema: z.ZodSchema<any>;
  onSubmit: (values: any) => Promise<void>;
};

export default function DynamicForm({ title,fields,submitText,schema,onSubmit,}: AuthFormProps) {

  const form = useForm({
    resolver: zodResolver(schema),
  });

  return (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            {fields.map((field) => (
              <FormField
                key={field.name}
                control={form.control}
                name={field.name}
                render={({ field: inputField }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        type={field.type}
                        placeholder={field.placeholder}
                        {...inputField}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}

            <Button
              type="submit"
              className="w-full"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting
                ? "Chargement..."
                : submitText}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
