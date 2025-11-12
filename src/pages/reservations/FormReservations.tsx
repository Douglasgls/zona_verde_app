"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Controller } from "react-hook-form";

// URL base da API
const BASE_URL_API = import.meta.env.VITE_BASE_URL_API;

// Schema de valida��o da reserva
const reservationSchema = z.object({
  client_id: z.string().min(1, "Selecione um cliente"),
  spot_id: z.string().min(1, "Selecione uma vaga"),
  day: z.string().min(1, "Informe o dia da reserva"),
  status: z.string().min(1, "Informe o status da reserva"),
  status_spot: z.string().min(1, "Informe o status da vaga"),
});

export type ReservationFormValues = z.infer<typeof reservationSchema>;

interface ReservationFormProps {
  defaultValues?: ReservationFormValues;
  onSubmit: (values: ReservationFormValues) => Promise<void>;
  submitLabel?: string;
}

interface Client {
  id: string;
  name: string;
}

interface Spot {
  id: string;
  spot: string;
  sector: string;
}

export function ReservationForm({
  defaultValues,
  onSubmit,
  submitLabel = "Salvar",
}: ReservationFormProps) {
  const form = useForm<ReservationFormValues>({
    resolver: zodResolver(reservationSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: defaultValues ?? {
      client_id: "",
      spot_id: "",
      day: "",
      status: "ATIVO",
      status_spot: "EM_USO",
    },
  });

  const [clients, setClients] = useState<Client[]>([]);
  const [spots, setSpots] = useState<Spot[]>([]);

  console.log("FORM DEFAULT VALUES", defaultValues);

  // Buscar clientes e vagas
  async function fetchClientsAndSpots() {
    try {
      const [clientsRes, spotsRes] = await Promise.all([
        fetch(`${BASE_URL_API}/client`),
        fetch(`${BASE_URL_API}/spots`),
      ]);

      if (!clientsRes.ok || !spotsRes.ok) {
        throw new Error("Erro ao carregar listas de clientes ou vagas");
      }

      const clientsData: Client[] = await clientsRes.json();
      const spotsData: Spot[] = await spotsRes.json();

      setClients(clientsData);
      setSpots(spotsData);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Falha ao carregar dados");
    }
  }

  useEffect(() => {
    fetchClientsAndSpots();
  }, []);

  return (
    <DialogContent className="w-80 h-min md:w-full md:max-w-md">
      <DialogHeader>
        <DialogTitle>Cadastrar Reserva</DialogTitle>
        <DialogDescription>
          Preencha os campos abaixo para registrar uma nova reserva.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-4">
          <div className="grid gap-3">
            <Controller
                control={form.control}
                name="client_id"
                render={({ field }) => (
                  <div className="grid gap-3">
                    <Label htmlFor="client_id">Cliente</Label>
                    <Select onValueChange={field.onChange} value={field.value.toString()}>
                      <SelectTrigger id="client_id">
                        <SelectValue placeholder="Selecione um cliente" />
                      </SelectTrigger>
                      <SelectContent>
                        {clients.map((client) => (
                          <SelectItem key={client.id} value={String(client.id)}>
                            {client.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {form.formState.errors.client_id && (
                      <p className="text-sm font-medium text-red-500">
                        {form.formState.errors.client_id.message}
                      </p>
                    )}
                  </div>
                )}
              />
            </div>

          {/* VAGA */}
          <div className="grid gap-3">
            <Controller
              control={form.control}
              name="spot_id"
              render={({ field }) => (
                <div className="grid gap-3">
                  <Label htmlFor="spot_id">Vaga</Label>
                  <Select onValueChange={field.onChange} value={field.value.toString()}>
                    <SelectTrigger id="spot_id">
                      <SelectValue placeholder="Selecione uma vaga" />
                    </SelectTrigger>
                    <SelectContent>
                      {spots.map((spot) => (
                        <SelectItem key={spot.id} value={String(spot.id)}>
                          {spot.spot} - {spot.sector}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.spot_id && (
                    <p className="text-sm font-medium text-red-500">
                      {form.formState.errors.spot_id.message}
                    </p>
                  )}
                </div>
              )}
            />
          </div>

          {/* DIA */}
          <div className="grid gap-3">
            <Label htmlFor="day">Data</Label>
            <Input
              id="day"
              type="date"
              {...form.register("day")}
              value={form.watch("day")?.slice(0, 10) ?? ""}
            />
            {form.formState.errors.day && (
              <p className="text-sm font-medium text-red-500">
                {form.formState.errors.day.message}
              </p>
            )}
          </div>

          {/* STATUS */}
          <div className="grid gap-3">
            <Label htmlFor="status">Status da Reserva</Label>
            <Select
              onValueChange={(value) => form.setValue("status", value)}
              defaultValue={form.getValues("status")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ATIVO">Ativo</SelectItem>
                <SelectItem value="CANCELADO">Cancelado</SelectItem>
                <SelectItem value="FINALIZADO">Finalizado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* STATUS DA VAGA */}
          <div className="grid gap-3">
            <Label htmlFor="status_spot">Status da Vaga</Label>
            <Select
              onValueChange={(value) => form.setValue("status_spot", value)}
              defaultValue={form.getValues("status_spot")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o status da vaga" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EM_USO">Em uso</SelectItem>
                <SelectItem value="VAZIO">Livre</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-6">
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>

          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Salvando..." : submitLabel}
          </Button>
        </div>
      </form>
    </DialogContent>
  );
}
