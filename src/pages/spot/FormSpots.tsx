"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const spotSchema = z.object({
  spot: z.string(),
  sector: z.string()
});

export type SpotFormValues = z.infer<typeof spotSchema>;

interface SpotFormProps {
  defaultValues?: SpotFormValues;
  onSubmit: (values: SpotFormValues) => Promise<void>;
  submitLabel?: string;
}

export function SpotForm({ defaultValues, onSubmit, submitLabel = "Salvar" }: SpotFormProps) {
  const form = useForm<SpotFormValues>({
    resolver: zodResolver(spotSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: defaultValues ?? {
      spot: "",
      sector: ""
    },
  });

  return (
    <>
    <DialogContent className="w-80 h-min md:w-full md:max-w-md">
           <DialogHeader>
             <DialogTitle>Cadastrar Vaga</DialogTitle>

             <DialogDescription>
               Siga as boas práticas ao preencher o formulário.
            </DialogDescription>

           </DialogHeader>
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-4">

          <div className="grid gap-3">
              <Label htmlFor="spot">Vaga</Label>
              <Input id="spot" placeholder="02" {...form.register("spot")} />
              {form.formState.errors.spot && form.formState.touchedFields.spot && (
                <p className="text-sm font-medium text-red-500">
                  {form.formState.errors.spot.message}
                </p>
              )}    
            </div>

            <div className="grid gap-3">
              <Label htmlFor="sector">Setor</Label>
              <Input id="sector" placeholder="Setor A" {...form.register("sector")} />
              {form.formState.errors.sector && (
                <p className="text-sm font-medium text-red-500">
                  {form.formState.errors.sector.message}
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