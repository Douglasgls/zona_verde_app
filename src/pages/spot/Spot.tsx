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

import { toast } from "sonner";
import { useEffect, useState } from "react";
import { DialogCreateSpots } from "./CreateSpots";
import { DialogEditSpot } from "./EditSpots";
import { DialogDeleteSpots } from "./DeleteSpots";


const BASE_URL_API = import.meta.env.VITE_BASE_URL_API;

interface Spots {
    id: string;
    spot: string;
    sector: string;
}

export default function Spots() {

    const [spots, setSpots] = useState<Spots[]>([]);
    const [refreshSpots, setRefreshSpots] = useState(0);

    async function fetchSpots() {
        try {
            const response = await fetch(`${BASE_URL_API}/spots`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Erro ao carregar vagas");
            }

            console.log("Vagas carregadas:", response);

            const data: Spots[] = await response.json();
            setSpots(data);

        } catch (error: any) {
            console.error("Falha na requisição de vagas:", error);
            toast.error(error.message || "Falha ao carregar vagas. Tente novamente.");
        }
    }

    useEffect(() => {
        fetchSpots();
    }, [refreshSpots]);

    const handleSpotChange = () => {
        setRefreshSpots(prev => prev + 1);
        toast.success("Lista de vagas atualizada!");
    };

    return (
        <>
            <PageHeader>
                <PageHeaderHeading>Gerenciamento de Vagas</PageHeaderHeading>
            </PageHeader>

            <div className="flex justify-between items-center py-6">
                <DialogCreateSpots  onSpotCreated={handleSpotChange}/>
            </div>
            <div className="rounded-md border shadow-sm overflow-hidden"> 
                <Table>
                    <TableCaption>Lista de Vagas Cadastradas.</TableCaption>

                    <TableHeader>
                        <TableRow className="bg-muted/30"> 
                        <TableHead className="w-[160px]">Nome</TableHead> 
                        <TableHead className="text-center hidden sm:table-cell">Setor</TableHead>
                        <TableHead className="text-center">Ações</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {spots.map((spot) => ( 
                            <TableRow 
                                key={spot.id}
                                className="hover:bg-muted/20 transition-colors cursor-pointer" 
                            >
                                <TableCell className="font-medium">{spot.spot}</TableCell>
                                <TableCell className="text-center hidden sm:table-cell text-muted-foreground">{spot.sector}</TableCell>
                              
                                <TableCell className="text-center">
                                    <div className="flex justify-center items-center gap-2">
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <DialogEditSpot spot={spot} onSpotUpdated={handleSpotChange} />
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Editar vaga</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>

                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <DialogDeleteSpots spot_id={spot.id} onSpotDeleted={handleSpotChange}/>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Excluir vaga</p>
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