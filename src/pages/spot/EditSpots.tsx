import { useState } from "react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Pencil } from "lucide-react";
import { SpotForm, SpotFormValues } from "./FormSpots";
const BASE_URL_API = import.meta.env.VITE_BASE_URL_API;

interface DialogEditSpotProps {
  onSpotUpdated: () => void;
  spot: SpotFormValues & { id: string; };
}

export function DialogEditSpot({ spot, onSpotUpdated }: DialogEditSpotProps) {
  const [open, setOpen] = useState(false);

  async function handleSubmit(values: SpotFormValues) {
    try {
      const response = await fetch(`${BASE_URL_API}/spots/${spot.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (response.ok) {
          toast.success("Vaga atualizada com sucesso!");
          onSpotUpdated(); 
          setOpen(false); 
        } else {
          toast.error("Falha ao atualizar vaga");
          setOpen(false);
        }
    } catch {
      toast.error("Falha ao atualizar vaga");
    }
  }

  return (
    <>

    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => console.log('Editar fatura INV001')} 
                className="h-8 w-8"
            >
                <Pencil className="h-4 w-4" /> 
            </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Vaga</DialogTitle>
        </DialogHeader>

        <SpotForm
          defaultValues={spot}
          onSubmit={handleSubmit}
          submitLabel="Atualizar"
        />
      </DialogContent>
    </Dialog>
    </>
  );
}