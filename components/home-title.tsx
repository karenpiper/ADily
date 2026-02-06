export function HomeTitle() {
  return (
    <div className="select-none animate-fade-in">
      {/* "The" */}
      <p className="text-[44px] font-serif italic text-dose-orange leading-none mb-1">
        The
      </p>
      {/* "ADily" */}
      <p className="text-[100px] md:text-[130px] font-serif leading-[0.85] tracking-tight">
        <span className="text-dose-orange">AD</span>
        <span className="text-foreground">ily</span>
      </p>
      {/* "Dose" */}
      <p className="text-[100px] md:text-[130px] font-serif leading-[0.85] tracking-tight text-foreground ml-[100px] md:ml-[180px]">
        Dose
      </p>
    </div>
  )
}
