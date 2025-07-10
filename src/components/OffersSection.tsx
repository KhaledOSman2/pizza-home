import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Percent, Truck } from "lucide-react";

const offers = [
  {
    id: 1,
    title: "خصم 20% على البيتزا",
    description: "خصم 20% على جميع أنواع البيتزا الشرقي والغربي",
    icon: Percent,
    color: "bg-pizza-red"
  },
  {
    id: 2,
    title: "توصيل مجاني",
    description: "توصيل مجاني للطلبات أكثر من 50 جنيه",
    icon: Truck,
    color: "bg-pizza-orange"
  }
];

const OffersSection = () => {
  return (
    <section className="py-12 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-foreground mb-8">
          العروض الحالية
        </h2>
        
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {offers.map((offer) => (
            <Card key={offer.id} className="hover:shadow-lg transition-all duration-300 border-2 hover:border-pizza-gold">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className={`${offer.color} p-3 rounded-full text-white`}>
                    <offer.icon className="h-6 w-6" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-semibold text-foreground">
                        {offer.title}
                      </h3>
                      <Badge variant="secondary" className="bg-pizza-gold text-white">
                        جديد
                      </Badge>
                    </div>
                    <p className="text-muted-foreground">
                      {offer.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default OffersSection;