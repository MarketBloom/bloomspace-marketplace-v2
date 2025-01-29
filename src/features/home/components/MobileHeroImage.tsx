export const MobileHeroImage = () => {
  return (
    <>
      <img 
        src="/images/hero/carnations-hero.jpg"
        alt="Beautiful pink and coral carnations with dramatic natural light and shadows"
        className="h-full w-full object-cover"
        style={{ 
          objectPosition: '50% 50%',
          objectFit: 'cover',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30" />
    </>
  );
}