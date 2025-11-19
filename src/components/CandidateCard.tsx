import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

interface CandidateCardProps {
  name: string;
  party: string;
  proposals: string;
  imageUrl?: string;
  isSelected: boolean;
  onSelect: () => void;
}

export const CandidateCard = ({
  name,
  party,
  proposals,
  imageUrl,
  isSelected,
  onSelect,
}: CandidateCardProps) => {
  return (
    <Card className={`relative transition-all ${
      isSelected ? 'ring-2 ring-accent shadow-elevated' : 'shadow-card hover:shadow-elevated'
    }`}>
      {isSelected && (
        <div className="absolute -top-2 -right-2 bg-accent text-accent-foreground rounded-full p-1">
          <CheckCircle2 className="h-5 w-5" />
        </div>
      )}
      <CardHeader>
        <div className="flex items-center gap-4">
          {imageUrl && (
            <img
              src={imageUrl}
              alt={name}
              className="h-16 w-16 rounded-full object-cover"
            />
          )}
          <div className="flex-1">
            <CardTitle className="text-lg">{name}</CardTitle>
            <CardDescription className="text-sm font-medium text-institutional">
              {party}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{proposals}</p>
        <Button
          onClick={onSelect}
          variant={isSelected ? "default" : "outline"}
          className="w-full"
        >
          {isSelected ? "Seleccionado" : "Seleccionar"}
        </Button>
      </CardContent>
    </Card>
  );
};
