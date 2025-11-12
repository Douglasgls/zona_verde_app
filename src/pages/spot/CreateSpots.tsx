import { useState } from "react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { SpotForm, SpotFormValues } from "./FormSpots";
import {PlusCircle } from "lucide-react";

const BASE_URL_API = import.meta.env.VITE_BASE_URL_API;

interface DialogCreateSpotsProps {
    onSpotCreated: () => void;
}

export function DialogCreateSpots({ onSpotCreated }: DialogCreateSpotsProps) {
  const [open, setOpen] = useState(false);

  async function handleSubmit(values: SpotFormValues) {
    try {
      const response = await fetch(`${BASE_URL_API}/spots`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (response.ok){
        toast.success("Spot criado com sucesso!");
        setOpen(false);
        onSpotCreated();
      }else{
        const errorData = await response.json();
        console.error("Erro ao criar spot:", errorData); 
        throw new Error(errorData.message);
      }
    } catch (error: any) {
      toast.error(error.message || "Falha ao criar spot. Tente novamente.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="inline-flex items-center gap-2 shadow-sm">
          <PlusCircle className="w-4 h-4" />
          Adicionar Spots
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cadastrar Spot</DialogTitle>
        </DialogHeader>

        <SpotForm onSubmit={handleSubmit} />
      </DialogContent>
    </Dialog>
  );
}