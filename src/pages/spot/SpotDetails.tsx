"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader, PageHeaderHeading } from "@/components/page-header";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipTrigger, TooltipProvider, TooltipContent } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect, useCallback,useMemo } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { User, Phone, Camera, RefreshCw, ShieldAlert, MapPin } from "lucide-react";
const BASE_URL_API = import.meta.env.VITE_BASE_URL_API;
const BASE_URL_WS = import.meta.env.VITE_BASE_URL_WS;

import { useWsStore } from "../Dashboard";
import { set } from "react-hook-form";
import { useRef } from "react";



export default function SpotsDetails() {
  const { spotId } = useParams();
  const [searchParams] = useSearchParams();
  
  // --- 1. ACESSO À STORE GLOBAL ---
  const { data: wsStoreData, update: updateStore } = useWsStore();
  const liveData = wsStoreData[Number(spotId)]; // Dados em tempo real vindos do Zustand

  // --- 2. ESTADOS LOCAIS (Apenas para dados fixos da API e UI) ---
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


  // Verifica se deve mostrar alerta (Usa dados da Store Global + LocalStorage de ignorados)
  const shouldShowAlert = useMemo(() => {
    return !!(liveData?.is_alert && liveData?.last_time !== ignoredAlertTime);
  }, [liveData, ignoredAlertTime]);

  const fetchStaticData = useCallback(async () => {
    if (!spotId) return;
    try {
      const [spotRes, clientRes, reservationRes] = await Promise.all([
        fetch(`${BASE_URL_API}/spots/${spotId}`),
        client_id ? fetch(`${BASE_URL_API}/client/${client_id}`) : null,
        reservation_id ? fetch(`${BASE_URL_API}/reservations/${reservation_id}`) : null
      ].filter(Boolean) as Promise<Response>[]);

      setSpot(await spotRes.json());
      if (clientRes) setClient(await clientRes.json());
      if (reservationRes) setReservation(await reservationRes.json());

    } catch (err) {
      console.error("Erro ao buscar dados estáticos:", err);
    }
  }, [spotId, client_id, reservation_id]);

  // --- 4. WEBSOCKET (Atualiza a Store Global) ---
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

    console.log("WebSocket conectado para vaga", spotId);
    console.log("DADOS WS RECEBIDOS:", wsStoreData);

    return () => socket.close();
  }, [spotId, updateStore]);

  // Inicialização
  useEffect(() => {
    fetchStaticData();
    const savedIgnore = localStorage.getItem(`ignored_alert_${spotId}`);
    if (savedIgnore) setIgnoredAlertTime(savedIgnore);
    
    const data = `${BASE_URL_API}/plate/last_picture/${spotId?.padStart(2, "0")}`;

    fetch(data).then(async res => {
      if (res.ok) {
        setImageUrl(data);
      } else {
        const errorBody = await res.json();
        setImageError(errorBody.detail);
        setLoadingImage(false);
        console.error("Erro ao buscar imagem:", errorBody.detail);
      }
    })

  }, [fetchStaticData, spotId]);

  // --- 5. AÇÕES ---
  const handleIgnoreAlert = () => {
    if (!liveData?.last_time) return;
    setIgnoredAlertTime(liveData.last_time);
    localStorage.setItem(`ignored_alert_${spotId}`, liveData.last_time);
  };

  const takePicture = async () => {
    if (!spotId) return;
    setLoadingImage(true);

    const urlImageTakePicture = `${BASE_URL_API}/plate/take_picture/${spotId.padStart(2, "0")}`;

    try {
      await fetch(urlImageTakePicture, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          {
            id: spotId
          }
        ),
      });
    } catch (e) {
      setLoadingImage(false);
    }
    
    setTimeout(() => {
      setLoadingImage(false);
      setImageError("Timeout ao capturar imagem");
    }, 30000); 
  };

  const refreshImage = async () => {
    if (!spotId) return;

    if (refreshTimeoutRef.current) return;

    refreshTimeoutRef.current = true;
    setLoadingImage(true);
    setImageError(null);

    const data = `${BASE_URL_API}/plate/last_picture/${spotId.padStart(2, "0")}?${Date.now()}`;

    try {
      const res = await fetch(data);

      if (res.ok) {
        setImageUrl(data);
      } else {
        const errorBody = await res.json();
        setImageError(errorBody.detail);
        console.error("Erro ao buscar imagem:", errorBody.detail);
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

  // --- RENDER ---
  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <PageHeader>
        <PageHeaderHeading>Vaga {spot?.number || spotId} - Detalhes</PageHeaderHeading>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* CARD INFORMAÇÕES */}
        <Card className="shadow-md h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              Setor {spot?.sector}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Status em Tempo Real</p>
              <Badge className={liveData?.current_status === "LIVRE" ? "bg-green-500 text-white" : "bg-blue-600 text-white"}>
                {liveData?.current_status || spot?.status || "---"}
              </Badge>
            </div>

            <Separator />

            {client && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground font-medium">Reserva</p>
                <div className="flex items-center gap-2"><User className="w-4 h-4" /> {client.name}</div>
                <div className="flex items-center gap-2"><Phone className="w-4 h-4" /> {client.phone}</div>
                <Badge variant="outline" className="text-md font-mono">{client.plate}</Badge>
              </div>
            )}

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase font-bold">Placa OCR</p>
                <p className="text-2xl font-black text-foreground tracking-tighter">
                  {liveData?.plate_ocr || "---"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase font-bold">Confiança</p>
                <p className={`text-2xl font-black ${Number(liveData?.similarity) < 60 ? 'text-red-500' : 'text-green-500'}`}>
                  {liveData?.similarity ? `${liveData.similarity}%` : "---"}
                </p>
              </div>
            </div>

            {shouldShowAlert && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl space-y-3 animate-pulse">
                <div className="flex items-center gap-2 text-red-700 font-bold">
                  <ShieldAlert className="w-5 h-5" /> ALERTA DE PLACA
                </div>
                <p className="text-xs text-red-600">A placa detectada não condiz com a reserva do cliente.</p>
                <Button variant="destructive" size="sm" className="w-full" onClick={handleIgnoreAlert}>
                  Ignorar Alerta
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* CARD CÂMERA */}
        <Card className="lg:col-span-2 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2"><Camera className="w-5 h-5" /> Monitoramento</CardTitle>
            <span className="text-xs text-muted-foreground font-mono">{liveData?.last_time || "---"}</span>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative flex-col aspect-video bg-muted rounded-lg overflow-hidden border">
              {loadingImage && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
                  <RefreshCw className="w-8 h-8 animate-spin text-primary" />
                </div>
              )}
              {imageUrl ? (
                <img src={imageUrl} alt="Imagem da Vaga" className="w-full h-full object-cover" onLoad={() => setLoadingImage(false)} />
              ) : (
                  <div className="w-full h-full flex flex-col justify-center items-center text-muted-foreground italic">
                    Sem imagem disponível
                    <p className="text-xs p-2">{
                      imageError}</p>
                  </div>
              )}
            </div>
            
            <div className="flex gap-3">
              <Button 
                onClick={takePicture} 
                className="flex-1 gap-2">
                  <Camera className="w-4 h-4" /> Capturar Agora
                </Button>
              <Button  
                  disabled={loadingImage}
                  variant="outline" 
                  onClick={refreshImage}
                  className="gap-2">
                <RefreshCw className="w-4 h-4" /> Atualizar
              </Button>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}