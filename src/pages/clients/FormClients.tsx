"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const deviceSchema = z.object({
  name: z.string().min(3, { message: "O nome deve ter pelo menos 3 caracteres." }),

  plate: z.string().regex(/^[a-zA-Z0-9_-]+$/, {
    message: "A placa deve ser do formato válido. Ex: LLLNLNN",
  }).min(7, { message: "A placa deve ter exatamente 7 digitos." }),

  phone: z.string().min(5, { message: "Informe um telefone válido." }),

  email: z.string().min(3, { message: "O email deve ter pelo menos 3 caracteres." }),

  cpf: z.string().min(11, 
    { message: "O CPF deve ter apenas 11 caracteres." }).max(11, 
    { message: "O CPF deve ter apenas 11 caracteres." }),

});

export type ClientFormValues = z.infer<typeof deviceSchema>;

interface ClientFormProps {
  defaultValues?: ClientFormValues;
  onSubmit: (values: ClientFormValues) => Promise<void>;
  submitLabel?: string;
}

export function ClientForm({ defaultValues, onSubmit, submitLabel = "Salvar" }: ClientFormProps) {
  const form = useForm<ClientFormValues>({
    resolver: zodResolver(deviceSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: defaultValues ?? {
      name: "",
      plate: "",
      phone: "",
      email: "",
      cpf: "",
    },
  });

  return (
    <>
    <DialogContent className="w-80 h-min md:w-full md:max-w-md">
           <DialogHeader>
             <DialogTitle>Cadastrar Cliente</DialogTitle>

             <DialogDescription>
               Siga as boas práticas ao preencher o formulário.
            </DialogDescription>

           </DialogHeader>
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-4">

          <div className="grid gap-3">
              <Label htmlFor="name">Nome</Label>
              <Input id="name" placeholder="Joaquim Silva de Souza" {...form.register("name")} />
              {form.formState.errors.name && form.formState.touchedFields.name && (
                <p className="text-sm font-medium text-red-500">
                  {form.formState.errors.name.message}
                </p>
              )}    
            </div>

            <div className="grid gap-3">
              <Label htmlFor="plate">Placa</Label>
              <Input id="plate" placeholder="ABC123" {...form.register("plate")} />
              {form.formState.errors.plate && (
                <p className="text-sm font-medium text-red-500">
                  {form.formState.errors.plate.message}
                </p>
              )}
            </div>

            <div className="grid gap-3">
              <Label htmlFor="phone">Telefone</Label>
              <Input id="phone" placeholder="(99) 99999-9999" {...form.register("phone")} />
              {form.formState.errors.phone && (
                <p className="text-sm font-medium text-red-500">
                  {form.formState.errors.phone.message}
                </p>
              )}
            </div>

            <div className="grid gap-3">
              <Label htmlFor="cpf">CPF</Label>
              <Input id="cpf" placeholder="00000000000" {...form.register("cpf")} />
              {form.formState.errors.cpf && (
                <p className="text-sm font-medium text-red-500">
                  {form.formState.errors.cpf.message}
                </p>
              )}
            </div>

            <div className="grid gap-3">
              <Label htmlFor="email">Email</Label>
              <Input id="email" placeholder="email@example.com" {...form.register("email")} />
              {form.formState.errors.email && (
                <p className="text-sm font-medium text-red-500">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>
          </div>

            <div className="flex justify-end gap-4 pt-6">

                <DialogClose asChild>
                  <Button variant="outline">Cancelar</Button>
                </DialogClose>

                <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? 'Salvando...' : submitLabel}
                </Button>
            </div>
      </form>
    </DialogContent>
    </>
  );
}