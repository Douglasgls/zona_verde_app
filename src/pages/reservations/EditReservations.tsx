import { useState } from "react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Pencil } from "lucide-react";
import { ReservationForm, ReservationFormValues } from "./FormReservations";

const BASE_URL_API = import.meta.env.VITE_BASE_URL_API;

interface DialogEditReservationProps {
  onReservationUpdated: () => void;
  reservation: ReservationFormValues & { id: string };
}

export function DialogEditReservation({ reservation, onReservationUpdated }: DialogEditReservationProps) {
  const [open, setOpen] = useState(false);

  console.log("reservas edit", reservation);

  async function handleSubmit(values: ReservationFormValues) {
    try {
      const response = await fetch(`${BASE_URL_API}/reservations/${reservation.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          client_id: Number(values.client_id),
          spot_id: Number(values.spot_id),
        }),
      });

      if (response.ok) {
        toast.success("Reserva atualizada com sucesso!");
        onReservationUpdated();
        setOpen(false);
      } else {
        const errorData = await response.json();
        console.error("Erro ao atualizar reserva:", errorData);
        toast.error(errorData.message || "Falha ao atualizar reserva");
        setOpen(false);
      }
    } catch (error: any) {
      toast.error(error.message || "Falha ao atualizar reserva");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Reserva</DialogTitle>
        </DialogHeader>

        <ReservationForm
          defaultValues={reservation}
          onSubmit={handleSubmit}
          submitLabel="Atualizar"
        />
      </DialogContent>
    </Dialog>
  );
}
