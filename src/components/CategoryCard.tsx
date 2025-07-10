import { Card, CardContent } from "./ui/card";

interface CategoryCardProps {
  title: string;
  image: string;
  onClick?: () => void;
}

const CategoryCard = ({ title, image, onClick }: CategoryCardProps) => {
  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-[1.02] bg-gradient-to-b from-card to-pizza-cream"
      onClick={onClick}
    >
      <CardContent className="p-0">
        <div className="relative overflow-hidden rounded-t-lg">
          <img 
            src={image} 
            alt={title}
            className="w-full h-48 object-cover hover:scale-110 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
        </div>
        
        <div className="p-4 text-center">
          <h3 className="text-lg font-semibold text-foreground hover:text-pizza-red transition-colors">
            {title}
          </h3>
        </div>
      </CardContent>
    </Card>
  );
};

export default CategoryCard;