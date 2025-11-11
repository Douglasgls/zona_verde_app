

"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Eye } from "lucide-react";

interface ClientFormValues {
    id: string;
    name: string;
    plate: string;
    phone: string;
    email: string;
}

interface DialogViewClientsProps {
    client: ClientFormValues;
}

export function DialogViewClients({ client }: DialogViewClientsProps) {
  return (
    <>
    <Dialog>
        <DialogTrigger asChild>
            <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => console.log(`Visualizar cliente: ${client.id}`)} 
                    className="h-8 w-8"
                >
                    <Eye className="h-4 w-4 text-blue-600" /> 
                </Button>
        </DialogTrigger>

        <DialogContent className="w-80 h-min md:w-full md:max-w-md">
            <DialogHeader>
                <DialogTitle>Visualizar Dispositivo</DialogTitle>

                <DialogDescription>
                    Visualize as informações do dispositivo de monitoramento.
                </DialogDescription>

            </DialogHeader>
        <div className="space-y-6">
        <div className="grid gap-4">

            <div className="grid gap-3">
                    <Label htmlFor="name">Nome</Label>
                    <Input id="name" value={client.name} readOnly />
                </div>

                <div className="grid gap-3">
                    <Label htmlFor="onecode">Placa</Label>
                    <Input id="onecode" value={client.plate} readOnly />
                </div>

                <div className="grid gap-3">
                    <Label htmlFor="localization">Telefone</Label>
                    <Input id="localization" value={client.phone} readOnly />
                </div>

                <div className="grid gap-3">
                    <Label htmlFor="mqtt_topic">E-mail</Label>
                    <Input id="mqtt_topic" value={client.email} readOnly />
                </div>
                
            </div>

                <div className="flex justify-end gap-4 pt-6">
                    <DialogClose asChild>
                    <Button variant="outline">Fechar</Button>
                    </DialogClose>
                </div>
        </div>
        </DialogContent>
    </Dialog>
    </>
  );
}