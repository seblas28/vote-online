import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Vote, Clock, CheckCircle2, Trophy, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {dataStore, type VotingStatus} from "@/lib/dataStore";

const Index = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<VotingStatus>(dataStore.getVotingStatus());
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [winners, setWinners] = useState<any>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const currentStatus = dataStore.getVotingStatus();
      setStatus(currentStatus);

      if (currentStatus.isActive && currentStatus.endTime) {
        const now = new Date().getTime();
        const endDate = new Date(currentStatus.endTime as string);
        const end = endDate.getTime();

        if (isNaN(end)) {
            console.error("Fecha de fin inválida detectada:", currentStatus.endTime);
            return;
        }

        const distance = end - now;

        if (distance < 0) {
          dataStore.endVoting();
          setStatus(dataStore.getVotingStatus());
        } else {
          const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((distance % (1000 * 60)) / 1000);
          setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
        }
      }
      
      if (currentStatus.isFinished) {
        setWinners(dataStore.getWinners());
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  if (status.isFinished && winners) {
    return (
      <div className="min-h-screen bg-background">
         {/* Navbar Simplificado */}
        <nav className="bg-white border-b border-border/40 sticky top-0 z-50">
            <div className="container mx-auto max-w-6xl px-4 py-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
                <img 
                  src="/votodigital-logo.png" 
                  alt="VotoDigital Logo" 
                  className="h-12 w-auto object-contain" 
                />
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate("/admin/login")}>
                Acceso Administrativo
            </Button>
            </div>
        </nav>

        <div className="container mx-auto max-w-6xl px-4 py-12">
            <div className="text-center mb-12">
                <div className="inline-flex items-center justify-center p-4 bg-yellow-100 rounded-full mb-4">
                    <Trophy className="h-12 w-12 text-yellow-600" />
                </div>
                <h1 className="text-4xl font-bold mb-4">Votación Finalizada</h1>
                <p className="text-xl text-muted-foreground">Presentando a los ganadores electos</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                {/* Ganador Presidente */}
                <WinnerCard 
                    title="Presidente Electo" 
                    winner={winners.president} 
                    color="border-institutional"
                />
                {/* Ganador Alcalde */}
                <WinnerCard 
                    title="Alcalde Electo" 
                    winner={winners.mayor} 
                    color="border-success"
                />
                {/* Ganador Diputado */}
                <WinnerCard 
                    title="Diputado Electo" 
                    winner={winners.deputy} 
                    color="border-warning"
                />
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="bg-white border-b border-border/40 sticky top-0 z-50">
        <div className="container mx-auto max-w-6xl px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img 
              src="/votodigital-logo.png" 
              alt="VotoDigital Logo" 
              className="h-12 w-auto object-contain" 
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/admin/login")}
          >
            Acceso Administrativo
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-institutional py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center text-white space-y-6">
            {/* Lógica del Cronómetro / Botón */}
            {!status.isActive && !status.isFinished ? (
                 <>
                    <div className="inline-flex items-center justify-center p-3 bg-white/10 rounded-full mb-4">
                        <AlertTriangle className="h-12 w-12 text-yellow-300" />
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold">Votación Cerrada</h1>
                    <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto">
                        El proceso electoral aún no ha comenzado. Por favor espera a la apertura oficial.
                    </p>
                 </>
            ) : (
                <>
                  <div className="inline-flex items-center justify-center p-3 bg-white/10 rounded-full mb-4">
                        <Clock className="h-12 w-12 animate-pulse" />
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold">
                        Tiempo Restante
                    </h1>
                    <div className="text-5xl md:text-7xl font-mono font-bold text-white py-4 tracking-wider">
                        {timeLeft}
                    </div>
                    <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto">
                    Plataforma segura y transparente para ejercer tu derecho al voto
                    </p>
                    <Button
                    size="lg"
                    onClick={() => navigate("/verificacion")}
                    className="bg-white text-institutional hover:bg-white/90 text-lg px-8 py-6 mt-4 shadow-lg transform hover:scale-105 transition-all"
                    >
                    Ingresar a Votar
                    </Button>
                </>
            )}
          </div>
        </div>
      </section>

      {/* Security Features */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12">
            Seguridad y Transparencia
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="shadow-card">
              <CardHeader>
                <div className="mb-4 inline-flex p-3 bg-primary/10 rounded-lg">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>Verificación de Identidad</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Sistema de verificación mediante DNI, nombre completo y fecha de nacimiento.
                  Cada votante es validado antes de acceder al sistema.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <div className="mb-4 inline-flex p-3 bg-primary/10 rounded-lg">
                  <Clock className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>Tiempo Controlado</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  El proceso de votación tiene un límite de tiempo para garantizar
                  la seguridad y evitar manipulaciones.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <div className="mb-4 inline-flex p-3 bg-primary/10 rounded-lg">
                  <CheckCircle2 className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>Un Voto por Persona</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  El sistema garantiza que cada ciudadano pueda votar una sola vez,
                  preservando la integridad del proceso electoral.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Voting Categories */}
      <section className="py-16 px-4 bg-muted">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12">
            Categorías de Votación
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-2xl">Presidente</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Elige al candidato que liderará el país durante los próximos años.
                  Conoce sus propuestas de gobierno y planes de acción.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-2xl">Alcalde</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Selecciona al representante de tu municipio. Revisa los planes
                  de desarrollo local y mejoras comunitarias.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-2xl">Diputados</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Vota por los representantes legislativos que defenderán tus
                  intereses en el congreso.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How to Vote */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-center mb-12">
            Cómo Votar
          </h2>
          <div className="space-y-6">
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Verificación de Identidad</h3>
                <p className="text-muted-foreground">
                  Ingresa tu número de DNI, nombre completo y fecha de nacimiento para verificar tu elegibilidad.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Revisa a los Candidatos</h3>
                <p className="text-muted-foreground">
                  Lee las propuestas de cada candidato en las diferentes categorías: Presidente, Alcalde y Diputados.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Emite tu Voto</h3>
                <p className="text-muted-foreground">
                  Selecciona tus candidatos preferidos antes de que termine el tiempo límite y confirma tu voto.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                4
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Confirmación</h3>
                <p className="text-muted-foreground">
                  Recibe la confirmación de que tu voto ha sido registrado de forma segura y anónima.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-12 text-center">
            {status.isActive ? (
              <Button
                size="lg"
                onClick={() => navigate("/verificacion")}
                className="text-lg px-8 py-6"
              >
                Comenzar a Votar Ahora
              </Button>
            ) : (
              <Button
                size="lg"
                disabled
                className="text-lg px-8 py-6 opacity-70 cursor-not-allowed bg-muted text-muted-foreground hover:bg-muted"
              >
                {status.isFinished ? "Votación Finalizada" : "Votación No Iniciada"}
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-8 px-4">
        <div className="container mx-auto max-w-6xl text-center">
          <p className="text-sm">
            © 2024 Votaciones Online. Todos los derechos reservados.
          </p>
          <p className="text-xs mt-2 opacity-80">
            Plataforma segura certificada para procesos electorales democráticos
          </p>
        </div>
      </footer>
    </div>
  );
};

const WinnerCard = ({ title, winner, color }: { title: string, winner: any, color: string }) => {
    return (
        <Card className={`relative overflow-hidden border-t-4 ${color} shadow-elevated`}>
            <CardHeader className="text-center pb-2">
                <CardTitle className="text-xl text-muted-foreground uppercase tracking-widest text-xs font-bold mb-2">
                    {title}
                </CardTitle>
                {winner ? (
                    <h2 className="text-2xl font-bold">{winner.name}</h2>
                ) : (
                    <h2 className="text-xl font-bold text-muted-foreground">Empate / Sin Votos</h2>
                )}
            </CardHeader>
            <CardContent className="text-center">
                {winner && (
                    <>
                        <div className="my-4">
                            <img 
                                src={winner.imageUrl || "/placeholder.svg"} 
                                alt={winner.name}
                                className="w-24 h-24 rounded-full mx-auto object-cover border-4 border-white shadow-md"
                            />
                        </div>
                        <div className="bg-muted/50 rounded-lg p-3">
                            <p className="font-semibold text-institutional">{winner.party}</p>
                            <p className="text-2xl font-bold mt-1">{winner.votes} <span className="text-sm font-normal text-muted-foreground">votos</span></p>
                        </div>
                    </>
                )}
                {!winner && <p className="py-8 text-muted-foreground">No hay datos suficientes</p>}
            </CardContent>
        </Card>
    )
}

export default Index;
