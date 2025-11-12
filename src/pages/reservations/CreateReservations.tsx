import { useState } from "react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { PlusCircle } from "lucide-react";
import { ReservationForm, ReservationFormValues } from "./FormReservations";

const BASE_URL_API = import.meta.env.VITE_BASE_URL_API;

interface DialogCreateReservationProps {
  onReservationCreated: () => void;
}

export function DialogCreateReservation({ onReservationCreated }: DialogCreateReservationProps) {
  const [open, setOpen] = useState(false);

  async function handleSubmit(values: ReservationFormValues) {
    try {
      const response = await fetch(`${BASE_URL_API}/reservations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          client_id: Number(values.client_id),
          spot_id: Number(values.spot_id),
        }),
      });

      if (response.ok) {
        toast.success("Reserva criada com sucesso!");
        setOpen(false);
        onReservationCreated();
      } else {
        const errorData = await response.json();
        console.error("Erro ao criar reserva:", errorData);
        throw new Error(errorData.message || "Erro desconhecido ao criar reserva");
      }
    } catch (error: any) {
      toast.error(error.message || "Falha ao criar reserva. Tente novamente.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="inline-flex items-center gap-2 shadow-sm">
          <PlusCircle className="w-4 h-4" />
          Adicionar Reserva
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cadastrar Reserva</DialogTitle>
        </DialogHeader>

        <ReservationForm onSubmit={handleSubmit} />
      </DialogContent>
    </Dialog>
  );
}
