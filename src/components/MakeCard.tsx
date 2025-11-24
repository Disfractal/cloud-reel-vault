import { Link } from "react-router-dom";
import { Card, CardContent } from "./ui/card";
import type { AutoMake } from "@/types/firestore";

interface MakeCardProps {
  make: AutoMake;
}

export function MakeCard({ make }: MakeCardProps) {
  return (
    <Link to={`/make/${make.id}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            {make.logoImage ? (
              <img 
                src={make.logoImage} 
                alt={`${make.name} logo`}
                className="w-16 h-16 object-contain"
              />
            ) : (
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-muted-foreground uppercase">
                  {make.name.charAt(0)}
                </span>
              </div>
            )}
            <div className="flex-1">
              <h3 className="text-lg font-semibold capitalize">{make.name}</h3>
              {make.foundedYear && (
                <p className="text-sm text-muted-foreground">
                  Founded: {make.foundedYear}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
