import { PageHeader, PageHeaderHeading } from "@/components/page-header";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"; // Adicionado TooltipContent
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { DialogCreateClients } from "./CreateClients";
import { DialogEditClient } from "./EditClients";
import { DialogDeleteClients } from "./DeleteClient";
import { DialogViewClients } from "./ViewClients";
import { toast } from "sonner";
import { useEffect, useState } from "react";


const BASE_URL_API = import.meta.env.VITE_BASE_URL_API;

interface Client {
    id: string;
    name: string;
    plate: string;
    cpf: string;
    phone: string;
    email: string;
}

export default function Clients() {

    const [clients, setClients] = useState<Client[]>([]);
    const [refreshClients, setRefreshClients] = useState(0);

    async function fetchClients() {
        try {
            const response = await fetch(`${BASE_URL_API}/client`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Erro ao carregar clientes");
            }

            const data: Client[] = await response.json();
            setClients(data);

        } catch (error: any) {
            console.error("Falha na requisição de clientes:", error);
            toast.error(error.message || "Falha ao carregar clientes. Tente novamente.");
        }
    }

    useEffect(() => {
        fetchClients();
    }, [refreshClients]);

    const handleClientChange = () => {
        setRefreshClients(prev => prev + 1);
        toast.success("Lista de clientes atualizada!");
    };

    return (
        <>
            <PageHeader>
                <PageHeaderHeading>Gerenciamento de Clientes</PageHeaderHeading>
            </PageHeader>

            <div className="flex justify-between items-center py-6">
                <DialogCreateClients  onClientCreated={handleClientChange}/>
            </div>
            <div className="rounded-md border shadow-sm overflow-hidden"> 
                <Table>
                    <TableCaption>Lista de clientes cadastrados no sistema.</TableCaption>

                    <TableHeader>
                        <TableRow className="bg-muted/30"> 
                        <TableHead className="w-[160px]">Nome</TableHead> 
                        <TableHead className="text-center hidden sm:table-cell">Placa</TableHead>
                        <TableHead className="text-center hidden md:table-cell">CPF</TableHead>
                        <TableHead className="text-center hidden lg:table-cell">Telefone</TableHead>
                        <TableHead className="text-center hidden lg:table-cell">Email</TableHead>
                        <TableHead className="text-center">Ações</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {clients.map((client) => ( 
                            <TableRow 
                                key={client.id}
                                className="hover:bg-muted/20 transition-colors cursor-pointer" 
                            >
                                <TableCell className="font-medium">{client.name}</TableCell>
                                <TableCell className="text-center hidden sm:table-cell text-muted-foreground">{client.plate}</TableCell>
                                <TableCell className="text-center hidden md:table-cell text-muted-foreground">{client.cpf}</TableCell>
                                <TableCell className="text-center hidden lg:table-cell text-muted-foreground">{client.phone}</TableCell>
                                <TableCell className="text-center hidden lg:table-cell text-muted-foreground">{client.email}</TableCell>
                                <TableCell className="text-center">
                                    <div className="flex justify-center items-center gap-2">
                                        
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <DialogViewClients client={client} />
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Visualizar detalhes</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>

                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <DialogEditClient client={client} onClientUpdated={handleClientChange} />
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Editar cliente</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>

                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <DialogDeleteClients client_id={client.id} onClientDeleted={handleClientChange}/>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Excluir cliente</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </>
    )
}