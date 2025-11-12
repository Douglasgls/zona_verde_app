// import { useState } from "react";
// import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import { DeviceForm, DeviceFormValues } from "./FormDevices";
// import { toast } from "sonner";
// import { Pencil } from "lucide-react";

// const BASE_URL_API = import.meta.env.VITE_BASE_URL_API;

// interface DialogEditDeviceProps {
//   device: DeviceFormValues & { id: string };
// }

// export function DialogEditDevice({ device }: DialogEditDeviceProps) {
//   const [open, setOpen] = useState(false);

//   async function handleSubmit(values: DeviceFormValues) {
//     try {
//       // const response = await fetch(`/api/devices/${device.id}`, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(values),
//       });

//       if (!response.ok) throw new Error("Erro ao atualizar");

//       toast.success("Dispositivo atualizado!");
//       setOpen(false);
//     } catch {
//       toast.error("Falha ao atualizar dispositivo");
//     }
//   }

//   return (
//     <>

//     <Dialog open={open} onOpenChange={setOpen}>
//       <DialogTrigger asChild>
//         <Button 
//                 variant="ghost" 
//                 size="icon" 
//                 onClick={() => console.log('Editar fatura INV001')} 
//                 className="h-8 w-8"
//             >
//                 <Pencil className="h-4 w-4" /> 
//             </Button>
//       </DialogTrigger>
//       <DialogContent>
//         <DialogHeader>
//           <DialogTitle>Editar dispositivo</DialogTitle>
//         </DialogHeader>

//         <DeviceForm
//           defaultValues={device}
//           onSubmit={handleSubmit}
//           submitLabel="Atualizar"
//         />
//       </DialogContent>
//     </Dialog>
//     </>
//   );
// }

import { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DeviceForm, DeviceFormValues } from "./FormDevices";
import { toast } from "sonner";
import { Pencil } from "lucide-react";

const BASE_URL_API = import.meta.env.VITE_BASE_URL_API;

interface DialogEditDeviceProps {
  device: {
    id: number;
    spot_id: number;
    onecode: string;
    topic_subscribe: string;
  };
  onDeviceUpdated: () => void;
}

export function DialogEditDevice({ device, onDeviceUpdated }: DialogEditDeviceProps) {
  const [open, setOpen] = useState(false);

  async function handleSubmit(values: DeviceFormValues) {
    try {
      const response = await fetch(`${BASE_URL_API}/devices/${device.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Erro ao atualizar dispositivo.");
      }

      toast.success("Dispositivo atualizado com sucesso!");
      setOpen(false);
      onDeviceUpdated(); // Atualiza a lista no pai
    } catch (error: any) {
      toast.error(error.message || "Falha ao atualizar dispositivo.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => console.log(`Editando dispositivo ID ${device.id}`)}
        >
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Dispositivo</DialogTitle>
        </DialogHeader>

        <DeviceForm
          defaultValues={{
            spot_id: device.spot_id,
            onecode: device.onecode,
            topic_subscribe: device.topic_subscribe,
          }}
          onSubmit={handleSubmit}
          submitLabel="Atualizar"
        />
      </DialogContent>
    </Dialog>
  );
}
