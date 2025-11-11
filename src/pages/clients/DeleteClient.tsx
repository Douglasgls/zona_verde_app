import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Trash } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

const BASE_URL_API = import.meta.env.VITE_BASE_URL_API;

interface DialogDeleteClientsProps {
    client_id: string;
    onClientDeleted: () => void;
}


export function DialogDeleteClients( { client_id, onClientDeleted }: DialogDeleteClientsProps ) {

  const [open, setOpen] = useState(false);
  async function handleDelete(event: React.FormEvent) {
    event.preventDefault();

    try {
      const response = await fetch(`${BASE_URL_API}/client/${client_id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        toast.success("Cliente deletado com sucesso!");
        onClientDeleted();
        setOpen(false);
      }else{
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro ao deletar cliente");
      }
    } catch {
      toast.error("Falha ao deletar cliente. Tente novamente.");
    }
   } 

  return (
    <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            >
              <Trash className="h-4 w-4" /> 
            </Button>
        </DialogTrigger>
        
        <DialogContent className="w-80 h-min md:w-full md:max-w-md">
          <DialogHeader>
            <DialogTitle>Deletar Cliente</DialogTitle>
            <DialogDescription>
             Tem certeza que deseja deletar este cliente? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-4">
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
              <Button type="submit" className="bg-red-500 text-white" onClick={handleDelete}>Deletar</Button>
          </DialogFooter>
        </DialogContent>
    </Dialog>
  )
}