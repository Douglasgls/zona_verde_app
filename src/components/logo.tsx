import { appConfig } from "@/config/app";
import { Icons } from "./icons";

export function Logo() {
  return (
    <span className="inline-flex items-center gap-2">
      <Icons.logo className="h-5 w-5 text-emerald-600" />
      <span className="font-semibold tracking-tight">{appConfig.name}</span>
    </span>
  );
}
