// import { PageHeader, PageHeaderHeading } from "@/components/page-header";
// import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
// import {
//   Table,
//   TableBody,
//   TableCaption,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { DialogCreateDevice } from "./CreateDevices";
// import { DialogEditDevice } from "./EditDevices";
// import { DialogDeleteDevices } from "./DeleteDevices";
// import { DialogViewDevices } from "./ViewDevices";

// import { Badge } from "@/components/ui/badge";
// import { Circle, Power, WifiOff } from "lucide-react";
// import { toast } from "sonner";
// import { useEffect, useState } from "react";

// const BASE_URL_API = import.meta.env.VITE_BASE_URL_API;

// interface Device {
//   id: number;
//   onecode: string;
//   topic_subscribe: string;
//   spot_id: number;
// }

// interface Spot {
//   id: number;
//   number: string;
//   sector: string;
// }

// export default function Devices() {
//   const [devices, setDevices] = useState<Device[]>([]);
//   const [spots, setSpots] = useState<Spot[]>([]);
//   const [refresh, setRefresh] = useState(0);

//   async function fetchDevices() {
//     try {
//       const response = await fetch(`${BASE_URL_API}/devices`);
//       if (!response.ok) throw new Error("Erro ao carregar dispositivos");
//       const data = await response.json();
//       setDevices(data);
//     } catch (error: any) {
//       toast.error(error.message || "Falha ao carregar dispositivos.");
//     }
//   }

//   async function fetchSpots() {
//     try {
//       const response = await fetch(`${BASE_URL_API}/spots`);
//       if (!response.ok) throw new Error("Erro ao carregar vagas");
//       const data = await response.json();
//       setSpots(data);
//       console.log("Vagas carregadas:", data);
//     } catch (error: any) {
//       toast.error(error.message || "Falha ao carregar vagas.");
//     }
//   }

//   useEffect(() => {
//     fetchDevices();
//     fetchSpots();
//   }, [refresh]);

//   const handleRefresh = () => setRefresh((prev) => prev + 1);

//   const getSpotName = (spotId: number) => {
//     const spot = spots.find((s) => s.id === spotId);
//     return spot ? `Setor ${spot.sector} - Vaga ${spot.number}` : "Sem vaga associada";
//   };

//   return (
//     <>
//       <PageHeader>
//         <PageHeaderHeading>Dispositivos de Monitoramento</PageHeaderHeading>
//       </PageHeader>

//       <div className="flex justify-between items-center py-6">
//         <DialogCreateDevice onDeviceCreated={handleRefresh} />
//       </div>

//       <div className="rounded-md border shadow-sm overflow-hidden">
//         <Table>
//           <TableCaption>Lista de dispositivos conectados ao sistema.</TableCaption>
//           <TableHeader>
//             <TableRow className="bg-muted/30">
//               <TableHead className="hidden sm:table-cell">Código</TableHead>
//               <TableHead className="hidden md:table-cell ">Localização</TableHead>
//               <TableHead className="hidden lg:table-cell text-center">Tópico MQTT</TableHead>
//               <TableHead className="text-center">Ações</TableHead>
//             </TableRow>
//           </TableHeader>

//           <TableBody>
//             {devices.length === 0 ? (
//               <TableRow>
//                 <TableCell colSpan={4} className="text-center text-muted-foreground">
//                   Nenhum dispositivo cadastrado.
//                 </TableCell>
//               </TableRow>
//             ) : (
//               devices.map((device) => (
//                 <TableRow
//                   key={device.id}
//                   className="hover:bg-muted/20 transition-colors cursor-pointer"
//                 >
//                   <TableCell className="hidden sm:table-cell text-muted-foreground">
//                     {device.onecode}
//                   </TableCell>

//                   <TableCell className="hidden md:table-cell text-muted-foreground">
//                     {getSpotName(device.spot_id)}
//                   </TableCell>

//                   <TableCell className="hidden lg:table-cell text-muted-foreground text-center">
//                     {device.topic_subscribe}
//                   </TableCell>

//                   <TableCell className="text-center">
//                     <div className="flex justify-center items-center gap-2">
//                       <TooltipProvider>
//                         <Tooltip>
//                           <TooltipTrigger asChild>
//                             <DialogViewDevices device={{ ...device, id: String(device.id) }} />
//                           </TooltipTrigger>
//                           <TooltipContent>
//                             <p>Visualizar detalhes</p>
//                           </TooltipContent>
//                         </Tooltip>
//                       </TooltipProvider>

//                       <TooltipProvider>
//                         <Tooltip>
//                           <TooltipTrigger asChild>
//                             <DialogEditDevice device={device} onDeviceUpdated={handleRefresh} />
//                           </TooltipTrigger>
//                           <TooltipContent>
//                             <p>Editar dispositivo</p>
//                           </TooltipContent>
//                         </Tooltip>
//                       </TooltipProvider>

//                       <TooltipProvider>
//                         <Tooltip>
//                           <TooltipTrigger asChild>
//                             <DialogDeleteDevices deviceId={device.id} onDeviceDeleted={handleRefresh} />
//                           </TooltipTrigger>
//                           <TooltipContent>
//                             <p>Excluir dispositivo</p>
//                           </TooltipContent>
//                         </Tooltip>
//                       </TooltipProvider>
//                     </div>
//                   </TableCell>
//                 </TableRow>
//               ))
//             )}
//           </TableBody>
//         </Table>
//       </div>
//     </>
//   );
// }
// --------

"use client";

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
import { MapPin, Camera } from "lucide-react"; // Novos ícones sutis
import { toast } from "sonner";
import { useEffect, useState } from "react";

const BASE_URL_API = import.meta.env.VITE_BASE_URL_API;

interface Spot {
  id: number;
  number: number;
  sector: string;
}

interface Device {
  id: number;
  name: string;
  onecode: string;
  topic_subscribe: string;
  spot: Spot | null;
}

interface DialogViewDevicesProps {
  device: Device;
}

export default function Devices({ device }: DialogViewDevicesProps) {
  const [devices, setDevices] = useState<Device[]>([]);
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

  useEffect(() => {
    fetchDevices();
  }, [refresh]);

  const handleRefresh = () => setRefresh((prev) => prev + 1);

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
              <TableHead className="font-semibold">Nome</TableHead>
              <TableHead className="hidden sm:table-cell font-semibold text-center">Código</TableHead>
              <TableHead className="hidden md:table-cell font-semibold">Localização</TableHead>
              <TableHead className="hidden lg:table-cell text-center font-semibold">Tópico MQTT</TableHead>
              <TableHead className="text-center font-semibold">Ações</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {devices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-10">
                  Nenhum dispositivo cadastrado.
                </TableCell>
              </TableRow>
            ) : (
              devices.map((device) => (
                <TableRow
                  key={device.id}
                  className="hover:bg-muted/10 transition-colors"
                >
                  {/* Nome do Dispositivo */}
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">{device.name}</span>
                    </div>
                  </TableCell>

                  {/* OneCode */}
                  <TableCell className="hidden sm:table-cell text-center">
                    <Badge variant="outline" className="font-mono font-normal">
                      {device.onecode}
                    </Badge>
                  </TableCell>

                  {/* Localização Dinâmica */}
                  <TableCell className="hidden md:table-cell">
                    {device.spot ? (
                      <div className="flex items-center gap-1.5 text-blue-700 font-medium">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>Setor {device.spot.sector} - Vaga {device.spot.number}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground italic text-sm">Não vinculado</span>
                    )}
                  </TableCell>

                  {/* Tópico MQTT */}
                  <TableCell className="hidden lg:table-cell text-center text-muted-foreground text-sm">
                    <code>{device.topic_subscribe}</code>
                  </TableCell>

                  <TableCell className="text-center">
                    <div className="flex justify-center items-center gap-1">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <DialogViewDevices device={device} />
                          </TooltipTrigger>
                          <TooltipContent>Visualizar</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <DialogEditDevice device={device} onDeviceUpdated={handleRefresh} />
                          </TooltipTrigger>
                          <TooltipContent>Editar</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <DialogDeleteDevices deviceId={device.id} onDeviceDeleted={handleRefresh} />
                          </TooltipTrigger>
                          <TooltipContent>Excluir</TooltipContent>
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