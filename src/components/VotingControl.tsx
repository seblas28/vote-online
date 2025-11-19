import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Square, RefreshCcw, Timer } from "lucide-react";
import { dataStore, type VotingStatus } from "@/lib/dataStore";
import { toast } from "sonner";

export const VotingControl = () => {
  const [status, setStatus] = useState<VotingStatus>(dataStore.getVotingStatus());

  const handleStart = () => {
    const newStatus = dataStore.startVoting();
    setStatus(newStatus);
    toast.success("Votación iniciada (24 horas)");
  };

  const handleEnd = () => {
    if (confirm("¿Estás seguro de finalizar la votación ahora?")) {
      const newStatus = dataStore.endVoting();
      setStatus(newStatus);
      toast.success("Votación finalizada manualmente");
    }
  };

  const handleReset = () => {
    if (confirm("Esto borrará el estado de la votación y los votos. ¿Continuar?")) {
      dataStore.resetVoting();
      setStatus(dataStore.getVotingStatus());
      toast.info("Sistema reiniciado");
    }
  };

  return (
    <Card className="border-institutional/20 bg-institutional/5">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
            <Timer className="h-5 w-5 text-institutional" />
            <CardTitle>Control de Votación</CardTitle>
        </div>
        <CardDescription>Gestiona el ciclo de vida del proceso electoral</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-muted-foreground">Estado Actual:</span>
            <span className={`text-lg font-bold ${status.isActive ? 'text-green-600' : status.isFinished ? 'text-red-600' : 'text-gray-600'}`}>
              {status.isActive ? "En Progreso" : status.isFinished ? "Finalizada" : "No Iniciada"}
            </span>
            {status.endTime && status.isActive && (
                <span className="text-xs text-muted-foreground">
                    Finaliza: {new Date(status.endTime).toLocaleString()}
                </span>
            )}
          </div>

          <div className="flex gap-2">
            {!status.isActive && !status.isFinished && (
              <Button onClick={handleStart} className="bg-green-600 hover:bg-green-700">
                <Play className="mr-2 h-4 w-4" /> Iniciar (24h)
              </Button>
            )}
            
            {status.isActive && (
              <Button onClick={handleEnd} variant="destructive">
                <Square className="mr-2 h-4 w-4" /> Finalizar Ahora
              </Button>
            )}

            {status.isFinished && (
               <Button onClick={handleReset} variant="outline">
                 <RefreshCcw className="mr-2 h-4 w-4" /> Reiniciar Sistema
               </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};