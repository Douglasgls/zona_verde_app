import { PageHeader, PageHeaderHeading } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Car, ParkingCircle, Clock, User,Bell, PlayIcon, Eye, Camera, GaugeCircle } from "lucide-react";
import useWebSocket from "react-use-websocket";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { create } from "zustand";

const BASE_URL_API = import.meta.env.VITE_BASE_URL_API;

interface Spot {
  id: number;
  number: number;
  sector: string;
  current_status: string;
  status?: string | null;
  clientName?: string | null;
  clientId?: number | null;
  plate?: string | null;
  reservationId?: number | null;
  isAlert?: boolean;
  similaridade?: string | null;
  plate_ocr?: string | null;
}

interface WsStore {
  data: Record<number, SpotsWS>;
  update: (id: number, payload: SpotsWS) => void;
}

interface Client {
  id: number;
  name: string;
  plate: string;
}

interface Reservation {
  id: number;
  day: string;
  client_id: number;
  spot_id: number;
}

interface SpotsWS {
  id: string;
  status: string;
  is_alert: boolean;
  plate_ocr: string;
  plate_db: string;
  valid: {
    similaridade: string;
  }
}

interface WsStore {
  data: Record<number, SpotsWS>;
  update: (id: number, payload: SpotsWS) => void;
}

export const useWsStore = create<WsStore>(set => ({
  data: {},
  update: (id, payload) =>
    set(state => ({
      data: {
        ...state.data,
        [id]: payload
      }
    }))
}));

function useWebsocketSpots() {
  const [clients, setClients] = useState<Client[]>([]);
  const [spots, setSpots] = useState<Spot[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);

  const { update } = useWsStore(); 
  const wsData = useWsStore(state => state.data);

  const { lastMessage } = useWebSocket("ws://localhost:8000/api/plate/ws", {
    shouldReconnect: () => true,
    reconnectInterval: 2000
  });

  async function fetchClientsAndSpots() {
    try {
      const [clientsRes, spotsRes] = await Promise.all([
        fetch(`${BASE_URL_API}/client`),
        fetch(`${BASE_URL_API}/spots`)
      ]);

      setClients(await clientsRes.json());
      setSpots(await spotsRes.json());
    } catch {
      toast.error("Erro ao carregar dados");
    }
  }

  async function fetchReservations() {
    try {
      const res = await fetch(`${BASE_URL_API}/reservations`);
      if (!res.ok) throw new Error();
      setReservations(await res.json());
    } catch {
      toast.error("Erro ao carregar reservas");
    }
  }

  useEffect(() => {
    fetchClientsAndSpots();
    fetchReservations();
  }, []);

  useEffect(() => {
    if (!lastMessage) return;

    console.log("WS RECEBIDO BRUTO:", lastMessage.data);

    try {
      const parsed: SpotsWS = JSON.parse(lastMessage.data);
      update(Number(parsed.id), parsed);
    } catch (e) {
      console.error("Erro ao parsear WS:", e);
    }
  }, [lastMessage]);

  return { clients, spots, reservations, wsData };
}



function SpotCard({ spot }: { spot: Spot }) {
  const statusColor =
    spot.status === "LIVRE"
      ? "bg-green-500 text-white"
      : spot.status === "RESERVADO"
      ? "bg-amber-500 text-white"
      : "bg-gray-500 text-white";

  const currentColor =
    spot.current_status === "LIVRE"
      ? "bg-green-500 text-white"
      : spot.current_status === "OCUPADO"
      ? "bg-blue-500 text-white"
      : "bg-gray-500 text-white";

  return (
    <Card className="hover:shadow-lg hover:scale-[1.01] transition-all duration-200">
      <CardHeader className="p-4">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl font-semibold">
            Vaga: {spot.number.toString().padStart(2, "0")}
            <div className="text-sm text-muted-foreground">Setor: {spot.sector}</div>
          </CardTitle>

          <div className="flex flex-col items-end px-2 py-2 space-y-2">
            <div className="flex space-x-2">
              <Badge className={`${statusColor} flex items-center`}>
                <ParkingCircle className="w-4 h-4 mr-1" />
                {spot.status}
              </Badge>

              <Badge className={`${currentColor} flex items-center`}>
                <ParkingCircle className="w-4 h-4 mr-1" />
                {spot.current_status}
              </Badge>

              {
                spot.isAlert && spot.status === "RESERVADO" && (
                  <Badge className="bg-red-500 flex items-center text-white animate-pulse border-teal-50">
                    <Bell className="w-4 h-4 mr-1" />
                    {spot.similaridade}
                  </Badge>
                )
              }
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-0 space-y-3">
        <div className="text-sm text-gray-500 py-2">
          {spot.status === "LIVRE" ? (
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" /> Livre
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <strong>{spot.clientName || "—"}</strong>
              <Car className="w-4 h-4 ml-2" />
                <strong>{spot.plate || "—"}</strong>
              <Camera className="w-4 h-4 ml-2" />
                {spot?.plate_ocr}
              <GaugeCircle className="w-4 h-4 ml-2" />
                {spot?.similaridade}
            </span>
          )}
        </div>

        <Button variant="outline" className="w-full relative">
          Gerenciar Vaga
          <Link
            to={`/spotsDetails/${spot.id}?client_id=${spot.clientId ?? ""}&reservation_id=${spot.reservationId ?? ""}`}
            className="absolute inset-0"
          />
        </Button>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {

  const { spots, clients, reservations, wsData } = useWebsocketSpots();

  const vagasComDados = spots.map((spot) => {
    const reserva = reservations.find((r) => r.spot_id === spot.id);
    const cliente = reserva ? clients.find((c) => c.id === reserva.client_id) : null;

    const live = wsData[spot.id] || null;
  

    const clientName = cliente?.name || (live ? "Visitante" : null);
    return {
      ...spot,
      status: spot.status,
      current_status: spot.current_status,
      plate: live?.plate_db ?? null,
      plate_ocr: live?.plate_ocr ?? null,
      similaridade: live?.valid?.similaridade ?? null,
      clientName,
      isAlert: live?.is_alert ?? false,
      clientId: reserva?.client_id ?? null,
      reservationId: reserva?.id ?? null
    };
  });

  return (
    <>
      <PageHeader>
        <PageHeaderHeading>Visão Geral</PageHeaderHeading>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
        {vagasComDados.map((spot) => (
          <SpotCard key={spot.id} spot={spot} />
        ))}
      </div>
    </>
  );
}