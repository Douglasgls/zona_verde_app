import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import useWebSocket, { ReadyState } from "react-use-websocket";
import { toast } from "sonner";
import {
  Activity,
  AlertTriangle,
  Car,
  CheckCircle2,
  Clock,
  GaugeCircle,
  ParkingCircle,
  User,
  Wifi,
  WifiOff,
} from "lucide-react";

import { PageHeader, PageHeaderHeading } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

interface MergedSpot extends Spot {
  plate: string | null;
  plate_ocr: string | null;
  similarity: string | null;
  clientName: string | null;
  isAlert: boolean;
  clientId: number | null;
  reservationId: number | null;
  lastUpdate: string | null;
}

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

function useParkingData() {
  const [clients, setClients] = useState<Client[]>([]);
  const [spots, setSpots] = useState<Spot[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);

  const { data: wsData, update } = useWsStore();

  const { lastMessage, readyState } = useWebSocket(`${BASE_URL_WS}/plate/ws`, {
    shouldReconnect: () => true,
    reconnectInterval: 3000,
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
    } catch {
      toast.error("Erro ao sincronizar dados com o servidor");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (lastMessage) {
      try {
        const parsed: SpotsWS = JSON.parse(lastMessage.data);
        update(Number(parsed.id), parsed);
      } catch (error) {
        console.error("Erro no processamento do WebSocket", error);
      }
    }
  }, [lastMessage, update]);

  const mergedSpots = useMemo(() => {
    return spots.map((spot): MergedSpot => {
      const reservation = reservations.find((r) => r.spot_id === spot.id);
      const client = reservation
        ? clients.find((c) => c.id === reservation.client_id)
        : null;
      const live = wsData[spot.id] || null;

      return {
        ...spot,
        plate: client?.plate ?? null,
        plate_ocr: live?.plate_ocr ?? null,
        similarity: live?.similarity ?? null,
        clientName: client?.name || (live ? "Visitante" : null),
        isAlert: live?.is_alert ?? false,
        clientId: reservation?.client_id ?? null,
        reservationId: reservation?.id ?? null,
        current_status: live?.current_status || spot.current_status,
        lastUpdate: live?.last_time ?? null,
      };
    });
  }, [spots, clients, reservations, wsData]);

  return { mergedSpots, readyState };
}

const STATUS_COLORS: Record<string, string> = {
  LIVRE: "bg-emerald-500/90 text-white",
  RESERVADO: "bg-amber-500/90 text-white",
  OCUPADO: "bg-sky-600/90 text-white",
  DISPONIVEL: "bg-emerald-600/90 text-white",
};

function formatDateTime(value: string | null) {
  if (!value) return "Sem leitura recente";
  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) return value;
  return parsedDate.toLocaleString("pt-BR");
}

function SpotCard({ spot }: { spot: MergedSpot }) {
  const hasSimilarityAlert = spot.similarity && parseFloat(spot.similarity) < 60;

  return (
    <Card className="border-border/70 bg-card/70 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl">
      <CardHeader className="p-4 pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg font-semibold leading-tight">
            Vaga {spot.number.toString().padStart(2, "0")}
          </CardTitle>
          <p className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
            Setor {spot.sector}
          </p>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <Badge className={STATUS_COLORS[spot.status] || "bg-slate-500 text-white"}>
            <ParkingCircle className="mr-1 h-3 w-3" />
            {spot.status}
          </Badge>

          <Badge
            className={`${STATUS_COLORS[spot.current_status] || "bg-zinc-500 text-white"} border-none`}
          >
            <Activity className="mr-1 h-3 w-3" />
            {spot.current_status || "DESCONHECIDO"}
          </Badge>

          {spot.isAlert && (
            <Badge className="animate-pulse bg-rose-500 text-white">
              <AlertTriangle className="mr-1 h-3 w-3" />
              ALERTA
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3 p-4 pt-0 text-sm">
        {spot.status === "LIVRE" && !spot.plate_ocr ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            Disponível para nova reserva.
          </div>
        ) : (
          <div className="space-y-2 rounded-lg border border-border/60 bg-background/60 p-3">
            <div className="flex items-center gap-2 font-medium">
              <User className="h-4 w-4 text-primary" />
              {spot.clientName ?? "Sem cliente vinculado"}
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Car className="h-4 w-4 text-primary" />
                Placa cadastro: {spot.plate || "--"}
              </span>
              <span className="flex items-center gap-1">
                <Car className="h-4 w-4 text-primary" />
                OCR: {spot.plate_ocr || "--"}
              </span>
              {spot.similarity && (
                <span
                  className={`flex items-center gap-1 font-semibold ${
                    hasSimilarityAlert ? "text-rose-600" : "text-emerald-600"
                  }`}
                >
                  <GaugeCircle className="h-4 w-4" />
                  Similaridade: {spot.similarity}%
                </span>
              )}
            </div>

            <p className="text-xs text-muted-foreground">Última leitura: {formatDateTime(spot.lastUpdate)}</p>
          </div>
        )}

        <Button variant="outline" className="w-full" asChild>
          <Link
            to={`/spotsDetails/${spot.id}?client_id=${spot.clientId ?? ""}&reservation_id=${spot.reservationId ?? ""}`}
          >
            Gerenciar vaga
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function connectionMeta(readyState: ReadyState) {
  if (readyState === ReadyState.OPEN) {
    return {
      label: "WebSocket online",
      badgeClass: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
      icon: Wifi,
    };
  }

  return {
    label: "WebSocket reconectando",
    badgeClass: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
    icon: WifiOff,
  };
}

export default function Dashboard() {
  const { mergedSpots, readyState } = useParkingData();

  const stats = useMemo(() => {
    const total = mergedSpots.length;
    const free = mergedSpots.filter((spot) => spot.current_status === "LIVRE").length;
    const busy = mergedSpots.filter((spot) => spot.current_status === "OCUPADO").length;
    const alerts = mergedSpots.filter((spot) => spot.isAlert).length;

    return { total, free, busy, alerts };
  }, [mergedSpots]);

  const connection = connectionMeta(readyState);
  const ConnectionIcon = connection.icon;

  return (
    <div className="container mx-auto pb-8">
      <PageHeader className="mt-2 rounded-2xl border border-border/60 bg-gradient-to-r from-emerald-100/70 via-background to-sky-100/70 p-5 dark:from-emerald-950/30 dark:via-background dark:to-sky-950/30">
        <div>
          <PageHeaderHeading>Painel Zona Verde</PageHeaderHeading>
          <p className="text-sm text-muted-foreground">
            Monitoramento em tempo real de vagas, reservas e alertas com integração API + ESP32.
          </p>
        </div>
        <Badge className={connection.badgeClass}>
          <ConnectionIcon className="mr-1 h-3 w-3" />
          {connection.label}
        </Badge>
      </PageHeader>

      <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Card className="border-emerald-200/80 bg-emerald-50/70 dark:border-emerald-900/50 dark:bg-emerald-950/20">
          <CardContent className="p-4">
            <p className="text-xs uppercase text-muted-foreground">Vagas livres</p>
            <p className="text-2xl font-bold text-emerald-600">{stats.free}</p>
          </CardContent>
        </Card>
        <Card className="border-sky-200/80 bg-sky-50/70 dark:border-sky-900/50 dark:bg-sky-950/20">
          <CardContent className="p-4">
            <p className="text-xs uppercase text-muted-foreground">Vagas ocupadas</p>
            <p className="text-2xl font-bold text-sky-600">{stats.busy}</p>
          </CardContent>
        </Card>
        <Card className="border-amber-200/80 bg-amber-50/70 dark:border-amber-900/50 dark:bg-amber-950/20">
          <CardContent className="p-4">
            <p className="text-xs uppercase text-muted-foreground">Alertas ativos</p>
            <p className="text-2xl font-bold text-amber-600">{stats.alerts}</p>
          </CardContent>
        </Card>
        <Card className="border-border/70 bg-card/70">
          <CardContent className="p-4">
            <p className="text-xs uppercase text-muted-foreground">Total de vagas</p>
            <p className="flex items-center gap-2 text-2xl font-bold">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              {stats.total}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {mergedSpots.map((spot) => (
          <SpotCard key={spot.id} spot={spot} />
        ))}
      </div>
    </div>
  );
}
