import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import useWebSocket from "react-use-websocket";
import { toast } from "sonner";
import { 
  Car, ParkingCircle, Clock, User, Bell, GaugeCircle 
} from "lucide-react";

import { PageHeader, PageHeaderHeading } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// --- Configurações e Tipos ---
const BASE_URL_API = import.meta.env.VITE_BASE_URL_API;
const BASE_URL_WS = import.meta.env.VITE_BASE_URL_WS;

interface SpotsWS {
  id: string;
  status: string;
  is_alert: boolean;
  plate_ocr: string;
  plate_db: string;
  similarity: string;
  current_status: string;
  last_time: string;
}

interface Spot {
  id: number;
  number: number;
  sector: string;
  current_status: string;
  status: string;
}

interface Client {
  id: number;
  name: string;
  plate: string;
}

interface Reservation {
  id: number;
  client_id: number;
  spot_id: number;
}

// Tipo para a vaga já processada com dados de todas as fontes
interface MergedSpot extends Spot {
  plate: string | null;
  plate_ocr: string | null;
  similarity: string | null;
  clientName: string | null;
  isAlert: boolean;
  clientId: number | null;
  reservationId: number | null;
}

// --- Store com Persistência ---
interface WsStore {
  data: Record<number, SpotsWS>;
  update: (id: number, payload: SpotsWS) => void;
}

export const useWsStore = create<WsStore>()(
  persist(
    (set) => ({
      data: {},
      update: (id, payload) =>
        set((state) => ({
          data: { ...state.data, [id]: payload },
        })),
    }),
    {
      name: "parking-ws-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// --- Hook de Lógica de Negócio ---
function useParkingData() {
  const [clients, setClients] = useState<Client[]>([]);
  const [spots, setSpots] = useState<Spot[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  
  const { data: wsData, update } = useWsStore();

  const { lastMessage } = useWebSocket(`${BASE_URL_WS}/plate/ws`, {
    shouldReconnect: () => true,
    reconnectInterval: 3000
  });


  const fetchData = async () => {
    try {
      const [cRes, sRes, rRes] = await Promise.all([
        fetch(`${BASE_URL_API}/client`),
        fetch(`${BASE_URL_API}/spots`),
        fetch(`${BASE_URL_API}/reservations`),
      ]);
      
      setClients(await cRes.json());
      setSpots(await sRes.json());
      setReservations(await rRes.json());
    } catch (err) {
      toast.error("Erro ao sincronizar dados com o servidor");
    }
  };

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    if (lastMessage) {
      try {
        const parsed: SpotsWS = JSON.parse(lastMessage.data);
        update(Number(parsed.id), parsed);
      } catch (e) {
        console.error("Erro no processamento do WebSocket", e);
      }
    }
  }, [lastMessage, update]);

  // Memoriza a mesclagem para evitar re-cálculos desnecessários
  const mergedSpots = useMemo(() => {
    return spots.map((spot): MergedSpot => {
      const reservation = reservations.find(r => r.spot_id === spot.id);
      const client = reservation ? clients.find(c => c.id === reservation.client_id) : null;
      const live = wsData[spot.id] || null;

      console.log("LIVE DATA:", live);
      return {
        ...spot,
        plate: client?.plate ?? null,
        plate_ocr: live?.plate_ocr ?? null,
        similarity: live?.similarity ?? null,
        clientName: client?.name || (live ? "Visitante" : null),
        isAlert: live?.is_alert ?? false,
        clientId: reservation?.client_id ?? null,
        reservationId: reservation?.id ?? null,
        current_status: live?.current_status || spot.current_status
      };
    });
  }, [spots, clients, reservations, wsData]);

  return { mergedSpots };
}

// --- Sub-componentes ---
const STATUS_COLORS: Record<string, string> = {
  LIVRE: "bg-green-500 text-white",
  RESERVADO: "bg-amber-500 text-white",
  OCUPADO: "bg-blue-600 text-white", // Azul forte para presença física
  DISPONIVEL: "bg-green-600 text-white",
};

function SpotCard({ spot }: { spot: MergedSpot }) {
  return (
    <Card className="hover:shadow-lg hover:scale-[1.01] transition-all duration-200 ">
      <CardHeader className="p-4">
        <div className="flex flex-col gap-2 items-start w-full">
          <CardTitle className="text-lg font-semibold leading-tight flex items-center flex-wrap gap-2">
            Vaga: {spot.number.toString().padStart(2, "0")}
            <p className="text-sm font-normal text-muted-foreground whitespace-nowrap">
              Setor: {spot.sector}
            </p>
          </CardTitle>

            <div className="flex flex-wrap gap-2 w-full justify-start items-center">
              <Badge className={STATUS_COLORS[spot.status] || STATUS_COLORS.MANUTENCAO}>
                <ParkingCircle className="w-3 h-3 mr-1" />
                {spot.status}
              </Badge>

              <Badge className={`${STATUS_COLORS[spot.current_status] || "bg-gray-500"} border-none text-white`}>
                <ParkingCircle className="w-3 h-3 mr-1" />
                {spot.current_status || "DESCONHECIDO"}
              </Badge>

              {spot.isAlert && (
                <Badge className="bg-red-500 text-white animate-pulse">
                  <Bell className="w-3 h-3 mr-1" />
                  ALERTA
                </Badge>
              )}
            </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-0 space-y-1">
        <div className="text-sm text-muted-foreground min-h-[40px] flex items-center">
          {spot.status === "LIVRE" && !spot.plate_ocr ? (
            <div className="flex items-center gap-2"><Clock className="w-4 h-4" /> Disponível</div>
          ) : (
            <div className="grid grid-cols-4 gap-4">
              <div className="flex items-center gap-2 text-foreground font-medium">
                <User className="w-4 h-4 text-primary" /> {spot.clientName}
              </div>

              
              <div className="flex items-center gap-4 text-xs text-primary font-medium">
                <span className="flex items-center gap-1"><Car className="w-4 h-4 " /> {spot.plate || "--"}</span>
                {spot.similarity && (
                  <>{ parseFloat(spot.similarity) < 60 ? (
                      <span className="flex items-center gap-1 text-red-500 font-bold">
                        <GaugeCircle className="w-4 h-4 text-primary" /> {spot.similarity}%
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-gray-400 font-bold">
                        <GaugeCircle className="w-4 h-4 text-primary" /> {spot.similarity}%
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        <Button variant="outline" className="w-full group relative" asChild>
          <Link to={`/spotsDetails/${spot.id}?client_id=${spot.clientId ?? ""}&reservation_id=${spot.reservationId ?? ""}`}>
            Gerenciar Vaga
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

// --- Componente Principal ---
export default function Dashboard() {
  const { mergedSpots } = useParkingData();

  return (
    <div className="container mx-auto pb-8">
      <PageHeader>
        <PageHeaderHeading>Visão Geral do Estacionamento</PageHeaderHeading>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mt-6 gap-7">
        {mergedSpots.map((spot) => (
          <SpotCard key={spot.id} spot={spot} />
        ))}
      </div>
    </div>
  );
}