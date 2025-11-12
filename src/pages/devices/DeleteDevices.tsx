// import { Button } from "@/components/ui/button";

// import {
//   Dialog,
//   DialogClose,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog"
// import { Trash } from "lucide-react";

// const BASE_URL_API = import.meta.env.VITE_BASE_URL_API;



// export function DialogDeleteDevices() {
//   return (
//     <Dialog>
//       <form>
//         <DialogTrigger asChild>
//           <Button 
//                 variant="ghost" 
//                 size="icon" 
//                 onClick={() => console.log('Editar fatura INV001')} 
//                 className="h-8 w-8"
//             >
//                 <Trash className="h-4 w-4" /> 
//             </Button>
//         </DialogTrigger>
        
//         <DialogContent className="w-80 h-min md:w-full md:max-w-md">
//           <DialogHeader>
//             <DialogTitle>Deletar Dispositivo</DialogTitle>
//             <DialogDescription>
//              Tem certeza que deseja deletar este dispositivo de monitoramento? Esta ação não pode ser desfeita.
//             </DialogDescription>
//           </DialogHeader>
//           <DialogFooter className="gap-4">
//             <DialogClose asChild>
//               <Button variant="outline">Cancel</Button>
//             </DialogClose>
//             <Button type="submit" className="bg-red-500 text-white">Deletar</Button>
//           </DialogFooter>
//         </DialogContent>
//       </form>
//     </Dialog>
//   )
// }


import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Trash } from "lucide-react";
import { toast } from "sonner";

const BASE_URL_API = import.meta.env.VITE_BASE_URL_API;

interface DialogDeleteDevicesProps {
  deviceId: number;
  onDeviceDeleted: () => void;
}

export function DialogDeleteDevices({ deviceId, onDeviceDeleted }: DialogDeleteDevicesProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${BASE_URL_API}/devices/${deviceId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Erro ao excluir dispositivo.");
      }

      toast.success("Dispositivo deletado com sucesso!");
      setOpen(false);
      onDeviceDeleted(); // Atualiza a lista no pai
    } catch (error: any) {
      toast.error(error.message || "Falha ao deletar dispositivo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:text-red-700"
          >
            <Trash className="h-4 w-4" />
          </Button>
        </DialogTrigger>

        <DialogContent className="w-80 md:w-full md:max-w-md">
          <DialogHeader>
            <DialogTitle>Deletar Dispositivo</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja deletar este dispositivo? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-4">
            <DialogClose asChild>
              <Button variant="outline" disabled={loading}>
                Cancelar
              </Button>
            </DialogClose>
            <Button
              type="submit"
              className="bg-red-600 text-white hover:bg-red-700"
              disabled={loading}
              onClick={handleDelete}
            >
              {loading ? "Deletando..." : "Deletar"}
            </Button>
          </DialogFooter>
        </DialogContent>
    </Dialog>
  );
}
