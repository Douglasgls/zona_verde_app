// "use client";

// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import {
//   Dialog,
//   DialogClose,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import { Eye, Cpu, MapPin, Hash, Network } from "lucide-react";
// import { toast } from "sonner";

// const BASE_URL_API = import.meta.env.VITE_BASE_URL_API;

// interface DeviceFormValues {
//   id: string;
//   onecode: string;
//   topic_subscriber: string;
//   localization: string;
// }

// interface DialogViewDevicesProps {
//   device: DeviceFormValues;
// }

// export function DialogViewDevices({ device }: DialogViewDevicesProps) {

//   async function fetchSpots(spot_id:string) {
//     try {
//         const response = await fetch(`${BASE_URL_API}/spots/${spot_id}`, {
//             method: "GET",
//             headers: { "Content-Type": "application/json" },
//         });

//         if (!response.ok) {
//             const errorData = await response.json();
//             throw new Error(errorData.message || "Erro ao carregar vaga");
//         }

//         const data = await response.json();
//         return data;

//     } catch (error: any) {
//         console.error("Falha na requisição da vaga:", error);
//         toast.error(error.message || "Falha ao carregar vaga. Tente novamente.");
//     }
//   }


//   return (
//     <Dialog>
//       <DialogTrigger asChild>
//         <Button
//           variant="ghost"
//           size="icon"
//           className="h-8 w-8 hover:bg-muted transition-colors"
//           onClick={() => console.log(`Visualizar dispositivo: ${device.id}`)}
//         >
//           <Eye className="h-4 w-4 text-blue-600" />
//         </Button>
//       </DialogTrigger>

//       <DialogContent className="max-w-md">
//         <DialogHeader className="space-y-1">
//           <DialogTitle className="text-lg font-semibold flex items-center gap-2">
//             <Cpu className="w-5 h-5 text-primary" />
//             Detalhes do Dispositivo
//           </DialogTitle>
//           <DialogDescription>
//             Visualize as informações registradas do dispositivo.
//           </DialogDescription>
//         </DialogHeader>

//         <div className="space-y-5 pt-4">
//           <div className="grid gap-3">
//             <Label htmlFor="name" className="flex items-center gap-1 text-sm">
//               <Cpu className="w-4 h-4 text-muted-foreground" />
//               Id Dispositivo
//             </Label>
//             <Input id="id" value={device.id} readOnly className="bg-muted/30" />
//           </div>

//           <div className="grid gap-3">
//             <Label htmlFor="onecode" className="flex items-center gap-1 text-sm">
//               <Hash className="w-4 h-4 text-muted-foreground" />
//               Código único (ID ESP32)
//             </Label>
//             <Input id="onecode" value={device.onecode} readOnly className="bg-muted/30" />
//           </div>

//           <div className="grid gap-3">
//             <Label htmlFor="localization" className="flex items-center gap-1 text-sm">
//               <MapPin className="w-4 h-4 text-muted-foreground" />
//               Localização
//             </Label>
//             <Input id="localization" value={device.localization} readOnly className="bg-muted/30" />
//           </div>

//           <div className="grid gap-3">
//             <Label htmlFor="mqtt_topic" className="flex items-center gap-1 text-sm">
//               <Network className="w-4 h-4 text-muted-foreground" />
//               Tópico MQTT
//             </Label>
//             <Input id="mqtt_topic" value={device.topic_subscriber} readOnly className="bg-muted/30" />
//           </div>

//           <div className="flex justify-between items-center pt-4">
//             <Badge variant="secondary" className="text-xs px-3 py-1">
//               ID Interno: {device.id}
//             </Badge>

//             <DialogClose asChild>
//               <Button variant="outline" size="sm" className="hover:bg-muted">
//                 Fechar
//               </Button>
//             </DialogClose>
//           </div>
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// }

// ---------------------
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Eye, Cpu, MapPin, Hash, Network } from "lucide-react";
import { toast } from "sonner";

const BASE_URL_API = import.meta.env.VITE_BASE_URL_API;

interface Spot {
  id: number;
  number: number;
  sector: string;
}

interface DeviceFormValues {
  id: string | number;
  name: string;
  onecode: string;
  topic_subscribe: string;
  spot: Spot | null; 
}

export function DialogViewDevices({ device }: { device: DeviceFormValues }) {
  const [open, setOpen] = useState(false);
  const [localization, setLocalization] = useState("Carregando...");

  async function fetchSpot(spot_id: number) {
    try {
      const response = await fetch(`${BASE_URL_API}/spots/${spot_id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro ao carregar vaga");
      }

      const data = await response.json();
      const locationText = `Setor ${data.sector} — Vaga ${data.spot}`;
      setLocalization(locationText);
    } catch (error: any) {
      console.error("Falha na requisição da vaga:", error);
      toast.error(error.message || "Falha ao carregar vaga. Tente novamente.");
      setLocalization("Erro ao carregar localização");
    }
  }

  useEffect(() => {
    if (open && device.spot?.id) {
      fetchSpot(device.spot.id);
    }
  }, [open, device.spot?.id]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 hover:bg-muted transition-colors"
          onClick={() => console.log(`Visualizar dispositivo: ${device.id}`)}
        >
          <Eye className="h-4 w-4 text-blue-600" />
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-lg font-semibold flex items-center gap-2">
            <Cpu className="w-5 h-5 text-primary" />
            Detalhes do Dispositivo
          </DialogTitle>
          <DialogDescription>
            Visualize as informações registradas do dispositivo.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 pt-4">
          <div className="grid gap-3">
            <Label htmlFor="id" className="flex items-center gap-1 text-sm">
              <Cpu className="w-4 h-4 text-muted-foreground" />
              ID Dispositivo
            </Label>
            <Input id="id" value={device.id} readOnly className="bg-muted/30" />
          </div>



          <div className="grid gap-3">
            <Label htmlFor="localization" className="flex items-center gap-1 text-sm">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              Nome
            </Label>
            <Input id="localization" value={device.name} readOnly className="bg-muted/30" />
          </div>


          <div className="grid gap-3">
            <Label htmlFor="onecode" className="flex items-center gap-1 text-sm">
              <Hash className="w-4 h-4 text-muted-foreground" />
              Código único (ESP32)
            </Label>
            <Input id="onecode" value={device.onecode} readOnly className="bg-muted/30" />
          </div>

         

          <div className="grid gap-3">
            <Label htmlFor="mqtt_topic" className="flex items-center gap-1 text-sm">
              <Network className="w-4 h-4 text-muted-foreground" />
              Tópico MQTT
            </Label>
            <Input
              id="mqtt_topic"
              value={device.topic_subscribe}
              readOnly
              className="bg-muted/30"
            />
          </div>

          <div className="flex justify-between items-center pt-4">
            <Badge variant="secondary" className="text-xs px-3 py-1">
              ID Interno: {device.id}
            </Badge>

            <DialogClose asChild>
              <Button variant="outline" size="sm" className="hover:bg-muted">
                Fechar
              </Button>
            </DialogClose>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
// -----------------------
