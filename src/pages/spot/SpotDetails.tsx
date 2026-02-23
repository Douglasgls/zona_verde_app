"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import {
  AlertTriangle,
  Camera,
  GaugeCircle,
  MapPin,
  Phone,
  RefreshCw,
  ShieldAlert,
  User,
} from "lucide-react";

import { PageHeader, PageHeaderHeading } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

import { useWsStore } from "../Dashboard";

const BASE_URL_API = import.meta.env.VITE_BASE_URL_API;
const BASE_URL_WS = import.meta.env.VITE_BASE_URL_WS;

function formatDateTime(value?: string | null) {
  if (!value) return "Sem atualização";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("pt-BR");
}

export default function SpotsDetails() {
  const { spotId } = useParams();
  const [searchParams] = useSearchParams();

  const { data: wsStoreData, update: updateStore } = useWsStore();
  const liveData = wsStoreData[Number(spotId)];

  const [spot, setSpot] = useState<any>(null);
  const [client, setClient] = useState<any>(null);
  const [reservation, setReservation] = useState<any>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loadingImage, setLoadingImage] = useState(true);
  const [ignoredAlertTime, setIgnoredAlertTime] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);

  const client_id = searchParams.get("client_id") ?? "";
  const reservation_id = searchParams.get("reservation_id") ?? "";
  const refreshTimeoutRef = useRef(false);

  const shouldShowAlert = useMemo(() => {
    return !!(liveData?.is_alert && liveData?.last_time !== ignoredAlertTime);
  }, [liveData, ignoredAlertTime]);

  const fetchStaticData = useCallback(async () => {
    if (!spotId) return;
    try {
      const [spotRes, clientRes, reservationRes] = await Promise.all(
        [
          fetch(`${BASE_URL_API}/spots/${spotId}`),
          client_id ? fetch(`${BASE_URL_API}/client/${client_id}`) : null,
          reservation_id ? fetch(`${BASE_URL_API}/reservations/${reservation_id}`) : null,
        ].filter(Boolean) as Promise<Response>[]
      );

      setSpot(await spotRes.json());
      if (clientRes) setClient(await clientRes.json());
      if (reservationRes) setReservation(await reservationRes.json());
    } catch (err) {
      console.error("Erro ao buscar dados estáticos:", err);
    }
  }, [spotId, client_id, reservation_id]);

  useEffect(() => {
    const socket = new WebSocket(`${BASE_URL_WS}/plate/ws`);

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.id) {
        updateStore(Number(data.id), data);
      }

      if (data.image_url) {
        setImageUrl(`${BASE_URL_API}${data.image_url}?${Date.now()}`);
        setLoadingImage(false);
      }
    };

    return () => socket.close();
  }, [updateStore]);

  const handleIgnoreAlert = async () => {
    if (!liveData?.last_time || !spotId) return;

    try {
      const response = await fetch(`${BASE_URL_API}/plate/ignore_alert/${spotId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        setIgnoredAlertTime(liveData.last_time);
        localStorage.setItem(`ignored_alert_${spotId}`, liveData.last_time);
      } else {
        console.error("Falha ao ignorar alerta no servidor");
      }
    } catch (error) {
      console.error("Erro de rede ao ignorar alerta:", error);
    }
  };

  const takePicture = async () => {
    if (!spotId) return;
    setLoadingImage(true);

    try {
      const deviceRes = await fetch(`${BASE_URL_API}/devices/by_spot/${spotId}`);
      if (!deviceRes.ok) throw new Error("Dispositivo não encontrado");

      const deviceData = await deviceRes.json();
      const urlImageTakePicture = `${BASE_URL_API}/plate/take_picture/${deviceData.onecode}`;

      await fetch(urlImageTakePicture, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
    } catch (e) {
      console.error("Erro ao processar captura:", e);
      setImageError("Falha na comunicação com o dispositivo");
      setLoadingImage(false);
    }

    setTimeout(() => setLoadingImage(false), 30000);
  };

  const refreshImage = async () => {
    if (!spotId) return;
    if (refreshTimeoutRef.current) return;

    refreshTimeoutRef.current = true;
    setLoadingImage(true);
    setImageError(null);

    const data = `${BASE_URL_API}/plate/last_picture/${spotId}?${Date.now()}`;

    try {
      const res = await fetch(data);

      if (res.ok) {
        setImageUrl(data);
      } else {
        const errorBody = await res.json();
        setImageError(errorBody.detail);
      }
    } catch (e) {
      console.error("Erro de rede:", e);
      setImageError("Erro de conexão");
    } finally {
      setLoadingImage(false);

      setTimeout(() => {
        refreshTimeoutRef.current = false;
      }, 3000);
    }
  };

  useEffect(() => {
    fetchStaticData();
    const savedIgnore = localStorage.getItem(`ignored_alert_${spotId}`);
    if (savedIgnore) setIgnoredAlertTime(savedIgnore);
    refreshImage();
  }, [fetchStaticData, spotId]);

  const currentStatus = liveData?.current_status || spot?.current_status || "---";

  return (
    <div className="container mx-auto pb-8">
      <PageHeader className="mt-2 rounded-2xl border border-border/60 bg-gradient-to-r from-emerald-100/70 via-background to-sky-100/70 p-5 dark:from-emerald-950/30 dark:via-background dark:to-sky-950/30">
        <div>
          <PageHeaderHeading>Vaga {spot?.number || spotId} • Detalhes</PageHeaderHeading>
          <p className="text-sm text-muted-foreground">
            Setor {spot?.sector || "--"} • Última leitura: {formatDateTime(liveData?.last_time)}
          </p>
        </div>
        <Badge
          className={
            currentStatus === "LIVRE"
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
              : "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300"
          }
        >
          <MapPin className="mr-1 h-3 w-3" />
          {currentStatus}
        </Badge>
      </PageHeader>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="h-fit border-border/70 bg-card/70 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <MapPin className="h-4 w-4 text-primary" />
              Informações da vaga
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2 rounded-lg border border-border/60 bg-background/60 p-3">
              <p className="text-xs uppercase text-muted-foreground">Status em tempo real</p>
              <Badge className={currentStatus === "LIVRE" ? "bg-emerald-500 text-white" : "bg-sky-600 text-white"}>
                {currentStatus}
              </Badge>
            </div>

            {client && (
              <>
                <Separator />
                <div className="space-y-2 rounded-lg border border-border/60 bg-background/60 p-3">
                  <p className="text-xs uppercase text-muted-foreground">Reserva ativa</p>
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <User className="h-4 w-4 text-primary" />
                    {client.name}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    {client.phone}
                  </div>
                  <Badge variant="outline" className="font-mono">
                    {client.plate}
                  </Badge>
                </div>
              </>
            )}

            <Separator />

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-border/60 bg-background/60 p-3">
                <p className="text-xs uppercase text-muted-foreground">Placa OCR</p>
                <p className="mt-1 text-xl font-black tracking-tight">{liveData?.plate_ocr || "---"}</p>
              </div>

              <div className="rounded-lg border border-border/60 bg-background/60 p-3">
                <p className="text-xs uppercase text-muted-foreground">Confiabilidade</p>
                <p
                  className={`mt-1 flex items-center gap-1 text-xl font-black ${
                    Number(liveData?.similarity) < 60 ? "text-rose-600" : "text-emerald-600"
                  }`}
                >
                  <GaugeCircle className="h-4 w-4" />
                  {liveData?.similarity ? `${liveData.similarity}%` : "---"}
                </p>
              </div>
            </div>

            {shouldShowAlert && (
              <div className="space-y-3 rounded-xl border border-rose-300 bg-rose-50 p-4 dark:border-rose-800/60 dark:bg-rose-950/30">
                <div className="flex items-center gap-2 font-bold text-rose-700 dark:text-rose-300">
                  <AlertTriangle className="h-5 w-5" />
                  ALERTA DE PLACA
                </div>
                <p className="text-xs text-rose-600 dark:text-rose-300">
                  A placa detectada não condiz com a reserva do cliente.
                </p>
                <Button variant="destructive" size="sm" className="w-full" onClick={handleIgnoreAlert}>
                  <ShieldAlert className="mr-1 h-4 w-4" />
                  Ignorar alerta
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-card/70 shadow-sm lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Camera className="h-4 w-4 text-primary" />
              Monitoramento da câmera
            </CardTitle>
            <p className="text-xs text-muted-foreground">{formatDateTime(liveData?.last_time)}</p>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="relative aspect-video overflow-hidden rounded-xl border border-border/70 bg-muted/30">
              {loadingImage && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/60">
                  <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                </div>
              )}

              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt="Imagem da vaga"
                  className="h-full w-full object-cover"
                  onLoad={() => setLoadingImage(false)}
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center text-center text-muted-foreground">
                  Sem imagem disponível
                  <p className="mt-1 px-3 text-xs">{imageError}</p>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button onClick={takePicture} className="flex-1 gap-2">
                <Camera className="h-4 w-4" />
                Capturar agora
              </Button>
              <Button disabled={loadingImage} variant="outline" onClick={refreshImage} className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Atualizar imagem
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
