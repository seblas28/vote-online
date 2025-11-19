import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck, Vote } from "lucide-react";
import { toast } from "sonner";

const Verificacion = () => {
  const navigate = useNavigate();
  const [dni, setDni] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!dni) {
      toast.error("Por favor ingrese tu número de DNI");
      return;
    }

    if (dni.length !== 8) {
      toast.error("El DNI debe tener 8 dígitos");
      return;
    }

    if (!/^\d{8}$/.test(dni)) {
      toast.error("El DNI debe contener solo números");
      return;
    }

    // Simulación de verificación exitosa
    toast.success("Verificación exitosa. Iniciando proceso de votación...");


    //Guarda el DNI en Storage (Esto se cambia a futuro por un token real)
    sessionStorage.setItem("voter_dni", dni);

    setTimeout(() => {
      navigate("/votacion");
    }, 1500);
  };

  const handleDniChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Solo permitir números y máximo 8 dígitos
    const value = e.target.value.replace(/\D/g, "").slice(0, 8);
    setDni(value);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="bg-white border-b border-border/40">
        <div className="container mx-auto max-w-6xl px-4 py-4 flex items-center gap-3">
          <Vote className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold text-foreground">Votaciones Online</span>
        </div>
      </nav>
      
      <div className="flex items-center justify-center px-4 py-12 min-h-[calc(100vh-73px)]">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4">
            <ShieldCheck className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Verificación de Identidad</h1>
          <p className="text-muted-foreground">
            Ingresa tus datos para verificar tu elegibilidad
          </p>
        </div>

        <Card className="shadow-elevated">
          <CardHeader>
            <CardTitle>Datos del Votante</CardTitle>
            <CardDescription>
              Ingresa tu número de DNI para continuar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="dni">Número de DNI</Label>
                <Input
                  id="dni"
                  type="text"
                  placeholder="12345678"
                  maxLength={8}
                  value={dni}
                  onChange={handleDniChange}
                  required
                  className="text-lg text-center tracking-wider font-mono"
                  autoFocus
                />
                <p className="text-xs text-muted-foreground text-center">
                  Ingresa los 8 dígitos de tu DNI sin puntos ni espacios
                </p>
              </div>

              <Button type="submit" className="w-full" size="lg">
                Verificar y Continuar
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
          >
            Volver al Inicio
          </Button>
        </div>
        {/* Información adicional */}
        <Card className="mt-6 bg-muted/50">
          <CardContent className="pt-6">
            <div className="space-y-2 text-sm text-muted-foreground">
              <p className="flex items-start gap-2">
                <ShieldCheck className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                <span>Tu información está protegida y encriptada</span>
              </p>
              <p className="flex items-start gap-2">
                <ShieldCheck className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                <span>Solo puedes votar una vez por DNI</span>
              </p>
              <p className="flex items-start gap-2">
                <ShieldCheck className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                <span>El voto es anónimo y confidencial</span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      </div>
    </div>
  );
};

export default Verificacion;
