import Link from "next/link";
import WkTable, { TableConfig } from "./WkTable";

export interface DashboardWidgetProps {
  Icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  title: string;
  button?: {
    text: string;
    href: string;
    icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  };
  table: TableConfig;
  widgetLink?: {
    link: string;
    text?: string;
  };
  styles?: string;
}

export default function DashboardWidget({
  Icon,
  title,
  button,
  table,
  widgetLink,
  styles,
}: DashboardWidgetProps) {
  return (
    <div className={`wk-dashboard-widget ${styles ? styles : ""}`}>
      <div className='wk-dashboard-widget__header'>
        <h2 className=''>
          {Icon ? <Icon /> : ""}
          {title}
        </h2>
        {button ? (
          <Link
            className='wk-btn wk-btn--sm wk-btn--secondary'
            href={button.href}>
            {button.icon ? <button.icon /> : ""}
            {button.text}
          </Link>
        ) : (
          ""
        )}
      </div>

      <WkTable config={table} />

      <Link
        className='wk-dashboard-widget__link'
        href={`${widgetLink && widgetLink.link}`}>
        {widgetLink && widgetLink.text ? widgetLink.text : "Ver mais"}
      </Link>
    </div>
  );
}
