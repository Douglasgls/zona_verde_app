"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader, PageHeaderHeading } from "@/components/page-header";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipTrigger, TooltipProvider, TooltipContent } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect, useCallback } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { User, Phone, Camera, RefreshCw, ShieldAlert, MapPin } from "lucide-react";
const BASE_URL_API = import.meta.env.VITE_BASE_URL_API;

interface Client {
  id: number;
  name: string;
  phone: string;
  plate: string;
}

interface Spot {
  id: number;
  number: string;
  sector: string;
  status: string;
  current_status: string;
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
  };
}

export default function SpotsDetails() {
  const [spot, setSpot] = useState<Spot | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const [loadingTakePicture, setLoadingTakePicture] = useState(false);
  const [loadingRefresh, setLoadingRefresh] = useState(false);
  const [loadingImage, setLoadingImage] = useState(true);
  const [forceKey, setForceKey] = useState(0);
  const [lastTime, setLastTime] = useState("");
  const [ws, setWs] = useState<SpotsWS | null>(null);

  const { spotId } = useParams();
  const [searchParams] = useSearchParams();

  const client_id = searchParams.get("client_id") ?? "";
  const reservation_id = searchParams.get("reservation_id") ?? "";

  // -------------------------------------------------------------
  // Helpers
  // -------------------------------------------------------------

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR");
  };

  const formatSpotId = (id: string | undefined) => {
    if (!id) return "";
    return id.padStart(2, "0");
  };

  const refreshImage = useCallback( async() => {
    if (!spotId) return;

    setLoadingRefresh(true);
    setLoadingImage(true);

    const formattedId = formatSpotId(spotId);

    setForceKey(prev => prev + 1);

    setImageUrl(`${BASE_URL_API}/plate/last_picture/${formattedId}?${Date.now()}`);

    const res = await fetch(`${BASE_URL_API}/plate/last_picture_info/${formattedId}`);
    const info = await res.json();

    console.log(info);

    setLastTime(info.timestamp);
  }, [spotId]);


  const SpinnerImg = () => (
    <div className="animate-spin rounded-full h-10 w-10 border-4 border-t-transparent border-primary" />
  );

  // -------------------------------------------------------------
  // Fetch recursos iniciais
  // -------------------------------------------------------------
  const fetchAllData = useCallback(async () => {
    if (!spotId || !client_id || !reservation_id) return;

    try {
      const [spotRes, clientRes, reservationRes] = await Promise.all([
        fetch(`${BASE_URL_API}/spots/${spotId}`),
        fetch(`${BASE_URL_API}/client/${client_id}`),
        fetch(`${BASE_URL_API}/reservations/${reservation_id}`)
      ]);

      setSpot(await spotRes.json());
      setClient(await clientRes.json());
      setReservation(await reservationRes.json());
    } catch (err) {
      console.error("Erro ao buscar dados:", err);
    }
  }, [spotId, client_id, reservation_id]);

  // -------------------------------------------------------------
  // Tirar foto
  // -------------------------------------------------------------
  const takePicture = async () => {
    if (!spotId) return;

    setLoadingImage(true);

    try {
      const formattedId = formatSpotId(spotId);

      await fetch(`${BASE_URL_API}/plate/take_picture/${formattedId}/take_picture`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

    } catch (err) {
      console.error("Erro ao tirar foto:", err);
      setLoadingTakePicture(false);
      setLoadingImage(false);
      setImageUrl(null);
    }
  };

  // -------------------------------------------------------------
  // WebSocket
  // -------------------------------------------------------------
  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8000/api/plate/ws");

    ws.onmessage = async(event) => {
      const data = JSON.parse(event.data);

      setWs(data);

      if (data.image_url) {
        setImageUrl(`${BASE_URL_API}${data.image_url}?${Date.now()}`);
        setLastTime(data.last_time);
        setLoadingImage(false);
        setLoadingRefresh(false);
        setLoadingTakePicture(false);
      }

      if (data.status) {
        setSpot((prev) =>
          prev ? { ...prev, current_status: data.status } : prev
        );
      }
    };

    ws.onclose = () => console.log("WebSocket desconectado");

    return () => ws.close();
  }, [BASE_URL_API]);

  // -------------------------------------------------------------
  // Inicialização
  // -------------------------------------------------------------
  useEffect(() => {
    fetchAllData();
    refreshImage();
  }, [fetchAllData, refreshImage]);

  const isFree = spot?.status === "LIVRE";
  const statusColor = isFree ? "bg-green-500" : "bg-blue-500";

  const formatScore = (scoreString?: string): string => {
    if (!scoreString) return "—";
    const score = parseFloat(scoreString);
    if (isNaN(score)) return "—";
    return `${(score * 100).toFixed(0)}%`;
  };

  // -------------------------------------------------------------
  // Render
  // -------------------------------------------------------------
  return (
    <div className="p-6 space-y-6">
      <PageHeader>
        <PageHeaderHeading>Gerenciamento de Vaga</PageHeaderHeading>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CARD - Detalhes da vaga */}
        <Card className="lg:col-span-1 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-muted-foreground" />
              <div>
                Vaga {spot?.number} - Setor {spot?.sector}
              </div>
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Status */}
            <div>
              <h3 className="font-medium text-lg text-muted-foreground">Status Atual</h3>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge className={`${statusColor} text-white mt-2 px-3 py-1`}>
                      {spot?.current_status}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{isFree ? "Vaga livre" : "Vaga ocupada"}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <Separator />

            {/* Reserva */}
            <div>
              <h3 className="font-medium text-lg text-muted-foreground">Reserva Atual</h3>

              <div className="flex justify-between py-2 items-center">
                <p className="text-base flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">{client?.name}</span>
                </p>

                <p className="text-sm text-muted-foreground">
                  Reservado {formatDate(reservation?.day)}
                </p>
              </div>

              <div className="flex justify-between py-1 items-center">
                <p className="text-sm flex items-center gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  {client?.phone}
                </p>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge className="bg-blue-600 text-white font-medium">
                        {client?.plate}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Placa do veículo</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>

            <div className="space-y-1">
              <h3 className="font-medium text-lg">Placa Detectada (OCR)</h3>
                <p className="text-2xl font-bold text-gray-400 tracking-wider">
                  {ws?.plate_ocr || "—"}
                </p>
            </div>
            <Separator />

            {/* Pontuação */}
            <div className="space-y-1">
              <h3 className="font-medium text-lg">Pontuação</h3>
              <p className="text-2xl font-bold text-gray-400 tracking-wider">
                {formatScore(ws?.valid.similaridade) || "—"}
              </p>
            </div>
            

            {ws?.is_alert && (
              <div className="p-3 bg-red-50 border border-red-300 rounded-lg flex items-center gap-2 animate-pulse">
                <ShieldAlert className="w-5 h-5 text-red-600 flex-shrink-0" />
                <p className="text-sm text-red-700 font-medium">
                  ALERTA: Placa OCR ({ws?.plate_ocr}) não confere com a Reserva ({ws?.plate_db || client?.plate}).
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* CARD - Foto */}
        <Card className="lg:col-span-2 flex flex-col items-center justify-center shadow-md max-w-fit">
          <CardHeader className="text-center space-y-1">
            <CardTitle className="text-xl font-semibold flex items-center justify-center gap-2">
              <Camera className="w-5 h-5 text-muted-foreground" />
                Ultima Foto
                {lastTime && (
                  <span className="text-sm text-muted-foreground">
                    {lastTime}
                  </span>
                )}
            </CardTitle>
          </CardHeader>

          <CardContent className="flex flex-col items-center justify-center space-y-4 w-full">
            <div className="w-full h-72 bg-muted rounded-xl flex items-center justify-center overflow-hidden relative">

              {loadingImage && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-xl">
                  <SpinnerImg />
                </div>
              )}

              {imageUrl ? (
                <img
                  src={imageUrl}
                  key={forceKey}
                  // loading="lazy"
                  alt="Foto da vaga"
                  className={`w-full h-full object-cover transition-opacity duration-300 ${
                    loadingImage ? "opacity-0" : "opacity-100"
                  }`}
                  onLoad={() => {
                    setLoadingImage(false);
                    setLoadingRefresh(false);
                    setLoadingTakePicture(false);
                  }}
                  onError={() => {
                    setImageUrl(null);
                    setLoadingRefresh(false);
                    setLoadingTakePicture(false);
                    setLoadingImage(false);
                  }}
                />
              ) : (
                !loadingImage && (<p className="flex justify-center text-center items-center w-full h-full text-muted-foreground">Sem foto</p>)
              )}
            </div>

            {/* Botões */}
            <div className="flex flex-wrap gap-3 justify-center pt-4">
              <Button
                onClick={takePicture}
                disabled={loadingTakePicture}
                className="min-w-[160px] flex items-center gap-2"
              >
                  <Camera className="w-4 h-4" />
                  {loadingTakePicture ? "Tirando..." : "Tirar Foto"}
              </Button>

              <Button
                variant="secondary"
                onClick={refreshImage}
                disabled={loadingRefresh}
                className="min-w-[160px] flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                {loadingRefresh ? "Atualizando..." : "Atualizar"}
              </Button>

              <Button variant="destructive" className="min-w-[160px] flex items-center gap-2">
                <ShieldAlert className="w-4 h-4" /> Ignorar Alerta
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}