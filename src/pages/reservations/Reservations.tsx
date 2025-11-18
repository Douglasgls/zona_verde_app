import { PageHeader, PageHeaderHeading } from "@/components/page-header";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { toast } from "sonner";
import { useEffect, useState } from "react";
import { DialogCreateReservation } from "./CreateReservations";
import { DialogEditReservation } from "./EditReservations";
import { DialogDeleteReservation } from "./DeleteReservations";

const BASE_URL_API = import.meta.env.VITE_BASE_URL_API;

interface Reservation {
  id: string;
  client_id: string;
  spot_id: string;
  day: string;
}

interface Spots {
  id: string;
  number: string;
  sector: string;
}

interface Clients {
  id: string;
  name: string;
  plate: string;
  cpf: string;
  phone: string;
  email: string;
}

export default function Reservations() {

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [refreshReservations, setRefreshReservations] = useState(0);
  const [clients, setClients] = useState<Clients[]>([]);
  const [spots, setSpots] = useState<Spots[]>([]);

  async function fetchReservations() {
    try {
      const response = await fetch(`${BASE_URL_API}/reservations`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro ao carregar reservas");
      }


      const data: Reservation[] = await response.json();
      setReservations(data);

    } catch (error: any) {
      toast.error(error.message || "Falha ao carregar reservas. Tente novamente.");
    }
  }

  async function fetchClientsAndSpots() {
      try {
        const [clientsRes, spotsRes] = await Promise.all([
          fetch(`${BASE_URL_API}/client`),
          fetch(`${BASE_URL_API}/spots`),
        ]);
  
        if (!clientsRes.ok || !spotsRes.ok) {
          throw new Error("Erro ao carregar listas de clientes ou vagas");
        }
  
        const clientsData: Clients[] = await clientsRes.json();
        const spotsData: Spots[] = await spotsRes.json();
  
        setClients(clientsData);
        setSpots(spotsData);
      } catch (error: any) {
        toast.error(error.message || "Falha ao carregar dados");
      }
    }
  
  useEffect(() => {
    fetchReservations();
    fetchClientsAndSpots();    
  }, [refreshReservations]);


  const handleReservationChange = () => {
    setRefreshReservations(prev => prev + 1);
    toast.success("Lista de reservas atualizada!");
  };

  const dateFormat = (date: string) => {
    const options: Intl.DateTimeFormatOptions = { year: "2-digit", month: "2-digit", day: "2-digit" };
    return new Date(date).toLocaleDateString("pt-BR", options);
  }

  const clientMap = Object.fromEntries(clients.map(c => [String(c.id), c]));
  const spotMap = Object.fromEntries(spots.map(s => [String(s.id), s]));

  return (
    <>
      <PageHeader>
        <PageHeaderHeading>Gerenciamento de Reservas</PageHeaderHeading>
      </PageHeader>

      <div className="flex justify-between items-center py-6">
        <DialogCreateReservation onReservationCreated={handleReservationChange} />
      </div>

      <div className="rounded-md border shadow-sm overflow-hidden">
        <Table>
          <TableCaption>Lista de Reservas Cadastradas.</TableCaption>

          <TableHeader>
            <TableRow className="bg-muted/30">
             <TableHead className="w-[160px]">Cliente</TableHead>
             <TableHead className="w-[160px]">Placa</TableHead>
              <TableHead className="text-center hidden sm:table-cell">Localização</TableHead>
              <TableHead className="text-center hidden sm:table-cell">Data</TableHead>
              <TableHead className="text-center">Ações</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {reservations.map((reservation) => (
              <TableRow
                key={reservation.id}
                className="hover:bg-muted/20 transition-colors cursor-pointer"
              >
                <TableCell className="font-medium">
                  {clientMap[String(reservation.client_id)]?.name}
                </TableCell>
                <TableCell className="font-medium">
                  {clientMap[String(reservation.client_id)]?.plate}
                </TableCell>
                <TableCell className="text-center hidden sm:table-cell">Setor {spotMap[String(reservation.spot_id)]?.sector} - Vaga {spotMap[String(reservation.spot_id)]?.number}</TableCell>
                <TableCell className="text-center hidden sm:table-cell text-muted-foreground">{dateFormat(reservation.day)}</TableCell>
                <TableCell className="text-center">
                  <div className="flex justify-center items-center gap-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <DialogEditReservation
                            reservation={reservation}
                            onReservationUpdated={handleReservationChange}
                          />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Editar reserva</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <DialogDeleteReservation
                            reservation_id={reservation.id}
                            onReservationDeleted={handleReservationChange}
                          />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Excluir reserva</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
