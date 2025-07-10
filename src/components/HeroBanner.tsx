import heroBanner from "@/assets/hero-banner.jpg";

const HeroBanner = () => {
  return (
    <section className="relative w-full h-[400px] md:h-[500px] overflow-hidden">
      <div className="absolute inset-0">
        <img 
          src={heroBanner} 
          alt="أشهى فطائر الشرق" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent"></div>
      </div>
      
      <div className="relative h-full flex items-center container mx-auto px-4">
        <div className="text-right max-w-lg">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight">
            أشهى فطائر الشرق
          </h1>
          <p className="text-xl text-white/90 mb-6 leading-relaxed">
            تذوق أطيب الأطباق من المطبخ الشرقي والغربي مع توصيل سريع لباب منزلك
          </p>
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;