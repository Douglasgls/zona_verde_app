// "use client";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import * as z from "zod";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// const BASE_URL_API = import.meta.env.VITE_BASE_URL_API;

// const deviceSchema = z.object({
//   onecode: z.string().regex(/^[a-zA-Z0-9_-]+$/, {
//     message: "O código deve conter apenas letras, números, hífen e underscore.",
//   }).min(5, { message: "O código deve ter pelo menos 5 caracteres." }),
//   topic_subscriber: z.string().min(3, { message: "O tópico MQTT deve ter pelo menos 3 caracteres." }),
// });

// export type DeviceFormValues = z.infer<typeof deviceSchema>;

// interface DeviceFormProps {
//   defaultValues?: DeviceFormValues;
//   onSubmit: (values: DeviceFormValues) => Promise<void>;
//   submitLabel?: string;
// }

// export function DeviceForm({ defaultValues, onSubmit, submitLabel = "Salvar" }: DeviceFormProps) {
//   const form = useForm<DeviceFormValues>({
//     resolver: zodResolver(deviceSchema),
//     mode: "onSubmit",
//     reValidateMode: "onChange",
//     defaultValues: defaultValues ?? {
//       name: "",
//       onecode: "",
//       localization: "",
//       mqtt_topic: "",
//     },
//   });

//   return (
//     <>
//     <DialogContent className="w-80 h-min md:w-full md:max-w-md">
//            <DialogHeader>
//              <DialogTitle>Cadastrar Dispositivo</DialogTitle>

//              <DialogDescription>
//                Siga as boas práticas ao preencher o formulário.
//             </DialogDescription>

//            </DialogHeader>
//     <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
//       <div className="grid gap-4">

//           <div className="grid gap-3">
//               <Label htmlFor="name">Nome</Label>
//               <Input id="name" placeholder="Câmera vaga 01" {...form.register("name")} />
//               {form.formState.errors.name && form.formState.touchedFields.name && (
//                 <p className="text-sm font-medium text-red-500">
//                   {form.formState.errors.name.message}
//                 </p>
//               )}    
//             </div>

//             <div className="grid gap-3">
//               <Label htmlFor="onecode">Código único (ID ESP32)</Label>
//               <Input id="onecode" placeholder="esp32cam_21ab" {...form.register("onecode")} />
//               {form.formState.errors.onecode && (
//                 <p className="text-sm font-medium text-red-500">
//                   {form.formState.errors.onecode.message}
//                 </p>
//               )}
//             </div>

//             <div className="grid gap-3">
//               <Label htmlFor="localization">Localização</Label>
//               <Input id="localization" placeholder="Vaga 01 - Bloco A" {...form.register("localization")} />
//               {form.formState.errors.localization && (
//                 <p className="text-sm font-medium text-red-500">
//                   {form.formState.errors.localization.message}
//                 </p>
//               )}
//             </div>

//             <div className="grid gap-3">
//               <Label htmlFor="mqtt_topic">Tópico MQTT</Label>
//               <Input id="mqtt_topic" placeholder="cameras/vaga01" {...form.register("mqtt_topic")} />
//               {form.formState.errors.mqtt_topic && (
//                 <p className="text-sm font-medium text-red-500">
//                   {form.formState.errors.mqtt_topic.message}
//                 </p>
//               )}
//             </div>
//           </div>

//             <div className="flex justify-end gap-4 pt-6">

//                 <DialogClose asChild>
//                   <Button variant="outline">Cancelar</Button>
//                 </DialogClose>

//                 <Button type="submit" disabled={form.formState.isSubmitting}>
//                     {form.formState.isSubmitting ? 'Salvando...' : submitLabel}
//                 </Button>
//             </div>
//       </form>
//     </DialogContent>
//     </>
//   );
// }


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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const BASE_URL_API = import.meta.env.VITE_BASE_URL_API;

const deviceSchema = z.object({
  spot_id: z.number({ required_error: "Selecione uma vaga." }),
  onecode: z
    .string()
    .regex(/^[a-zA-Z0-9_-]+$/, {
      message: "O código deve conter apenas letras, números, hífen e underscore.",
    })
    .min(5, { message: "O código deve ter pelo menos 5 caracteres." }),
  topic_subscribe: z
    .string()
    .min(3, { message: "O tópico MQTT deve ter pelo menos 3 caracteres." }),
  name: z.string().optional(),
});

export type DeviceFormValues = z.infer<typeof deviceSchema>;

interface Spot {
  id: number;
  number: number;
  sector: string;
}

interface DeviceFormProps {
  defaultValues?: Partial<DeviceFormValues>;
  onSubmit: (values: DeviceFormValues) => Promise<void>;
  submitLabel?: string;
}

export function DeviceForm({
  defaultValues,
  onSubmit,
  submitLabel = "Salvar",
}: DeviceFormProps) {
  const [spots, setSpots] = useState<Spot[]>([]);

  const form = useForm<DeviceFormValues>({
    resolver: zodResolver(deviceSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: defaultValues ?? {
      spot_id: 0,
      onecode: "",
      topic_subscribe: "",
    },
  });

  useEffect(() => {
    async function fetchSpots() {
      try {
        const res = await fetch(`${BASE_URL_API}/spots`);
        const data = await res.json();
        setSpots(data);
      } catch (error) {
        console.error("Erro ao carregar vagas:", error);
      }
    }
    fetchSpots();
  }, []);

  return (
    <DialogContent className="w-80 h-min md:w-full md:max-w-md">
      <DialogHeader>
        <DialogTitle>Cadastrar Dispositivo</DialogTitle>
        <DialogDescription>
          Selecione a vaga e informe os dados do dispositivo ESP32.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-4">
          <div className="grid gap-3">
            <Label htmlFor="spot_id">Vaga</Label>
            <Select
              onValueChange={(value) => form.setValue("spot_id", Number(value))}
            >
              <SelectTrigger id="spot_id">
                <SelectValue placeholder="Selecione a vaga" />
              </SelectTrigger>
              
              <SelectContent>
                {spots.map((spot) => (
                  <SelectItem key={spot.id} value={spot.id.toString()}>
                    {`Vaga ${spot.number} - ${spot.sector}`}
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
          {/* nome do dispositivo */}
          <div className="grid gap-3">
            <Label htmlFor="name">Nome do dispositivo</Label>
            <Input
              id="name"
              placeholder="Câmera Vaga 01"
              {...form.register("name")}
            />
            {form.formState.errors.name && (
              <p className="text-sm font-medium text-red-500">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          {/* Código do dispositivo */}
          <div className="grid gap-3">
            <Label htmlFor="onecode">Código de acesso (ID ESP32)</Label>
            <Input
              id="onecode"
              placeholder="esp32cam_21ab"
              {...form.register("onecode")}
            />
            {form.formState.errors.onecode && (
              <p className="text-sm font-medium text-red-500">
                {form.formState.errors.onecode.message}
              </p>
            )}
          </div>

          {/* Tópico MQTT */}
          <div className="grid gap-3">
            <Label htmlFor="topic_subscribe">Tópico MQTT</Label>
            <Input
              id="topic_subscribe"
              placeholder="cameras/vaga01"
              {...form.register("topic_subscribe")}
            />
            {form.formState.errors.topic_subscribe && (
              <p className="text-sm font-medium text-red-500">
                {form.formState.errors.topic_subscribe.message}
              </p>
            )}
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
