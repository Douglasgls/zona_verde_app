import { PageHeader, PageHeaderHeading } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Car, ParkingCircle, Clock, User } from "lucide-react";
import useWebSocket from 'react-use-websocket';
import { useState } from 'react';
import { useEffect } from "react";

interface Spot {
    id: string
    name: string,
    sector: string,
    status: string,
    reservationName: string,
    isReserved: string,
    plate: string,
}

function useWebsocketSpots() {
  const [vagas, setVagas] = useState<Record<string, any>>({});

  const websocketOptions = {
    shouldReconnect: () => true,
    reconnectInterval: 2000,
  };

  const { lastMessage } = useWebSocket('ws://localhost:8000/api/plate/ws', websocketOptions);

  useEffect(() => {
    if (lastMessage) {
      try {
        const data = JSON.parse(lastMessage.data);
        if (data.id) {
          setVagas(prev => ({
            ...prev,
            [data.id]: {
              ...prev[data.id],
              ...data,
            },
          }));
          console.log("Atualização WS recebida:", data);
        }
      } catch (err) {
        console.error("Erro ao parsear mensagem WS:", err);
      }
    }
  }, [lastMessage]);

  return vagas;
}


function SpotCard({ spot }: { spot: Spot }) {
    const isLivre = spot.status === "Livre";
    const isReserved = spot.isReserved === "Reservada";

    const statusColor = isLivre
        ? "bg-green-500/90 text-white"
        : "bg-blue-500/90 text-white";

    const reserveColor = isReserved
        ? "bg-amber-500/90 text-white"
        : "bg-green-600/90 text-white";

    return (
        <Card className="hover:shadow-lg hover:scale-[1.01] transition-all duration-200">
            <CardHeader className="p-4">
                <div className="flex justify-between items-start">
                    <CardTitle className="text-xl font-semibold">
                        {spot.name}
                        <div className="text-sm text-muted-foreground">
                            {spot.sector}
                        </div>
                    </CardTitle>

                    <div className="flex gap-2">
                        <Badge className={statusColor}>
                            <ParkingCircle className="w-4 h-4 mr-1" />
                            {spot.status}
                        </Badge>

                        <Badge className={reserveColor}>
                            <Clock className="w-4 h-4 mr-1" />
                            {spot.isReserved}
                        </Badge>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-4 pt-0 space-y-3">
                <div className="text-sm text-gray-500 py-2">
                    {isLivre ? (
                        <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            Livre
                        </span>
                    ) : (
                        <span className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            Ocupada por <strong>{spot.reservationName}</strong> —{" "}
                            <Car className="w-4 h-4 ml-1" />
                            Placa: <strong>{spot.plate}</strong>
                        </span>
                    )}
                </div>

                <Link to={`/spotsDetails`}>
                    <Button variant="outline" className="w-full font-medium">
                        Gerenciar Vaga
                    </Button>
                </Link>
            </CardContent>
        </Card>
    );
}

export default function Dashboard() {
    const spots = [
        {
            id: '1',
            name: "Vaga 01",
            sector: "Setor A",
            status: "Livre",
            reservationName: 'null',
            isReserved: "Não reservado",
            plate: 'null',
        },
        {
            id: '2',
            name: "Vaga 02",
            sector: "Setor A",
            status: "Ocupada",
            reservationName: "Fulano",
            isReserved: "Reservada",
            plate: "ABC-1234",
        },
        {
            id: '3',
            name: "Vaga 03",
            sector: "Setor A",
            status: "Livre",
            reservationName: "Douglas",
            isReserved: "Reservada",
            plate: "ABC-1234",
        },
         {
            id: '4',
            name: "Vaga 04",
            sector: "Setor A",
            status: "Ocupado",
            reservationName: "Maria Amanda",
            isReserved: "Reservada",
            plate: "LLLNLNN",
        },
    ];

    const vagasWebsocket = useWebsocketSpots();

    return (
        <>
            <PageHeader>
                <PageHeaderHeading>Visão Geral de Vagas</PageHeaderHeading>
            </PageHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
                {spots.map((spot) => {
                const vagaWS = vagasWebsocket[spot.id] || {};
                const spotAtualizado = {
                    ...spot,
                    status: vagaWS.status || spot.status,
                    plate: vagaWS.plate_ocr || spot.plate,
                    plate_db: vagaWS.plate_db,
                    similaridade: vagaWS.valid?.similaridade_pct,
                };
                return <SpotCard key={spot.id} spot={spotAtualizado} />;
                })}
            </div>

                
        </>
    );
}