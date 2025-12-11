import { cn } from "@/lib/utils";

export const BentoGrid = ({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) => {
  return (
    <div
      className={cn(
        "grid md:auto-rows-[18rem] grid-cols-1 md:grid-cols-3 gap-4 max-w-7xl mx-auto",
        className
      )}
    >
      {children}
    </div>
  );
};

export const BentoGridItem = ({
  className,
  title,
  description,
  header,
  icon,
}: {
  className?: string;
  title?: string | React.ReactNode;
  description?: string | React.ReactNode;
  header?: React.ReactNode;
  icon?: React.ReactNode;
}) => {
  return (
    <div
      className={cn(
        "row-span-1 rounded-xl group/bento hover:shadow-xl transition duration-200 shadow-input dark:shadow-none p-4 dark:bg-slate-900/50 dark:border-white/10 border border-transparent justify-between flex flex-col space-y-4 backdrop-blur-md relative overflow-hidden",
        className
      )}
    >
      {/* Hover Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 via-indigo-500/0 to-indigo-500/0 opacity-0 group-hover/bento:opacity-10 group-hover/bento:from-indigo-500/10 group-hover/bento:to-purple-500/10 transition-all duration-500" />
      
      {header}
      <div className="group-hover/bento:translate-x-2 transition duration-200 relative z-10">
        {icon}
        <div className="font-sans font-bold text-slate-100 mb-2 mt-2">
          {title}
        </div>
        <div className="font-sans font-normal text-slate-400 text-xs">
          {description}
        </div>
      </div>
    </div>
  );
};