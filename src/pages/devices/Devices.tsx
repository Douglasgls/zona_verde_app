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
import { DialogCreateDevice } from "./CreateDevices";
import { DialogEditDevice } from "./EditDevices";
import { DialogDeleteDevices } from "./DeleteDevices";
import { DialogViewDevices } from "./ViewDevices";

import { Badge } from "@/components/ui/badge";
import { Circle, Power, WifiOff } from "lucide-react";
import { toast } from "sonner";
import { useEffect, useState } from "react";

const BASE_URL_API = import.meta.env.VITE_BASE_URL_API;

interface Device {
  id: number;
  onecode: string;
  topic_subscribe: string;
  spot_id: number;
}

interface Spot {
  id: number;
  number: string;
  sector: string;
}

export default function Devices() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [spots, setSpots] = useState<Spot[]>([]);
  const [refresh, setRefresh] = useState(0);

  async function fetchDevices() {
    try {
      const response = await fetch(`${BASE_URL_API}/devices`);
      if (!response.ok) throw new Error("Erro ao carregar dispositivos");
      const data = await response.json();
      setDevices(data);
    } catch (error: any) {
      toast.error(error.message || "Falha ao carregar dispositivos.");
    }
  }

  async function fetchSpots() {
    try {
      const response = await fetch(`${BASE_URL_API}/spots`);
      if (!response.ok) throw new Error("Erro ao carregar vagas");
      const data = await response.json();
      setSpots(data);
      console.log("Vagas carregadas:", data);
    } catch (error: any) {
      toast.error(error.message || "Falha ao carregar vagas.");
    }
  }

  useEffect(() => {
    fetchDevices();
    fetchSpots();
  }, [refresh]);

  const handleRefresh = () => setRefresh((prev) => prev + 1);

  const getSpotName = (spotId: number) => {
    const spot = spots.find((s) => s.id === spotId);
    return spot ? `Setor ${spot.sector} - Vaga ${spot.number}` : "Sem vaga associada";
  };

  return (
    <>
      <PageHeader>
        <PageHeaderHeading>Dispositivos de Monitoramento</PageHeaderHeading>
      </PageHeader>

      <div className="flex justify-between items-center py-6">
        <DialogCreateDevice onDeviceCreated={handleRefresh} />
      </div>

      <div className="rounded-md border shadow-sm overflow-hidden">
        <Table>
          <TableCaption>Lista de dispositivos conectados ao sistema.</TableCaption>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="hidden sm:table-cell">Código</TableHead>
              <TableHead className="hidden md:table-cell ">Localização</TableHead>
              <TableHead className="hidden lg:table-cell text-center">Tópico MQTT</TableHead>
              <TableHead className="text-center">Ações</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {devices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  Nenhum dispositivo cadastrado.
                </TableCell>
              </TableRow>
            ) : (
              devices.map((device) => (
                <TableRow
                  key={device.id}
                  className="hover:bg-muted/20 transition-colors cursor-pointer"
                >
                  <TableCell className="hidden sm:table-cell text-muted-foreground">
                    {device.onecode}
                  </TableCell>

                  <TableCell className="hidden md:table-cell text-muted-foreground">
                    {getSpotName(device.spot_id)}
                  </TableCell>

                  <TableCell className="hidden lg:table-cell text-muted-foreground text-center">
                    {device.topic_subscribe}
                  </TableCell>

                  <TableCell className="text-center">
                    <div className="flex justify-center items-center gap-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <DialogViewDevices device={{ ...device, id: String(device.id) }} />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Visualizar detalhes</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <DialogEditDevice device={device} onDeviceUpdated={handleRefresh} />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Editar dispositivo</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <DialogDeleteDevices deviceId={device.id} onDeviceDeleted={handleRefresh} />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Excluir dispositivo</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
