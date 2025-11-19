import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CandidateCard } from "@/components/CandidateCard";
import { VoteTimer } from "@/components/VoteTimer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { dataStore } from "@/lib/dataStore";
import { Vote } from "lucide-react";

const Votacion = () => {
  const navigate = useNavigate();
  const [selectedPresident, setSelectedPresident] = useState<string | null>(null);
  const [selectedMayor, setSelectedMayor] = useState<string | null>(null);
  const [selectedDeputy, setSelectedDeputy] = useState<string | null>(null);
  const [showTimeoutDialog, setShowTimeoutDialog] = useState(false);
  
  const candidates = dataStore.getCandidates();
  const presidents = candidates.filter(c => c.category === 'president');
  const mayors = candidates.filter(c => c.category === 'mayor');
  const deputies = candidates.filter(c => c.category === 'deputy');

  const handleTimeUp = () => {
    setShowTimeoutDialog(true);
  };

  const handleSubmitVote = () => {
    if (!selectedPresident || !selectedMayor || !selectedDeputy) {
      toast.error("Por favor selecciona un candidato en cada categoría");
      return;
    }

    dataStore.addVote({
      president: selectedPresident,
      mayor: selectedMayor,
      deputy: selectedDeputy,
    });

    toast.success("¡Voto registrado exitosamente!");
    setTimeout(() => {
      navigate("/confirmacion");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="bg-white border-b border-border/40">
        <div className="container mx-auto max-w-6xl px-4 py-4 flex items-center gap-3">
          <img 
              src="/votodigital-logo.png" 
              alt="VotoDigital Logo" 
              className="h-12 w-auto object-contain" 
            />
        </div>
      </nav>
      
      <div className="container mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Proceso de Votación</h1>
            <p className="text-muted-foreground">
              Selecciona un candidato en cada categoría
            </p>
          </div>
          <VoteTimer durationMinutes={10} onTimeUp={handleTimeUp} />
        </div>

        {/* Voting Interface */}
        <Tabs defaultValue="presidente" className="space-y-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="presidente">Presidente</TabsTrigger>
            <TabsTrigger value="alcalde">Alcalde</TabsTrigger>
            <TabsTrigger value="diputados">Diputados</TabsTrigger>
          </TabsList>

          <TabsContent value="presidente" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {presidents.map((candidate) => (
                <CandidateCard
                  key={candidate.id}
                  name={candidate.name}
                  party={candidate.party}
                  proposals={candidate.proposals}
                  imageUrl={candidate.imageUrl}
                  isSelected={selectedPresident === candidate.id}
                  onSelect={() => setSelectedPresident(candidate.id)}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="alcalde" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {mayors.map((candidate) => (
                <CandidateCard
                  key={candidate.id}
                  name={candidate.name}
                  party={candidate.party}
                  proposals={candidate.proposals}
                  imageUrl={candidate.imageUrl}
                  isSelected={selectedMayor === candidate.id}
                  onSelect={() => setSelectedMayor(candidate.id)}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="diputados" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {deputies.map((candidate) => (
                <CandidateCard
                  key={candidate.id}
                  name={candidate.name}
                  party={candidate.party}
                  proposals={candidate.proposals}
                  imageUrl={candidate.imageUrl}
                  isSelected={selectedDeputy === candidate.id}
                  onSelect={() => setSelectedDeputy(candidate.id)}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Submit Button */}
        <div className="mt-8 flex justify-center">
          <Button
            size="lg"
            onClick={handleSubmitVote}
            className="px-12"
          >
            Confirmar Voto
          </Button>
        </div>
      </div>

      {/* Timeout Dialog */}
      <AlertDialog open={showTimeoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tiempo Agotado</AlertDialogTitle>
            <AlertDialogDescription>
              El tiempo para votar ha finalizado. Por favor intenta nuevamente más tarde.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => navigate("/")}>
              Volver al Inicio
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Votacion;
