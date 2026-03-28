import { Link } from "react-router-dom";

interface DashboardDrilldownHeaderProps {
  title: string;
  description: string;
  actions?: React.ReactNode;
  className?: string;
  titleClassName?: string;
}

export default function DashboardDrilldownHeader({
  title,
  description,
  actions,
  className,
  titleClassName = "text-3xl",
}: DashboardDrilldownHeaderProps) {
  return (
    <div className={className ?? "px-8 py-6"}>
      <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Link to="/" className="hover:text-foreground">
              Dashboard
            </Link>
            <span>/</span>
            <span>{title}</span>
          </div>
          <h1 className={`${titleClassName} font-bold text-foreground`}>{title}</h1>
          <p className="text-muted-foreground">{description}</p>
        </div>
        {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
      </div>
    </div>
  );
}
