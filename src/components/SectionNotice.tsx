import type { ReactNode } from "react";

type Props = {
  id?: string;
  title: string;
  reason: string;
  children?: ReactNode;
};

export function SectionNotice({ id, title, reason, children }: Props) {
  return (
    <section className="panel" id={id}>
      <div className="panel-header">
        <div>
          <p className="eyebrow">Restricted</p>
          <h2>{title}</h2>
        </div>
        <div className="pill subtle">Limited access</div>
      </div>
      <p className="muted">{reason}</p>
      {children}
    </section>
  );
}
