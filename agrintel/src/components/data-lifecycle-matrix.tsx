interface DataLifecycleMatrixProps {
  labels: {
    title: string;
    subtitle: string;
    juryQuestion: string;
    juryQuestionText: string;
    columns: {
      tier: string;
      frequency: string;
      datasets: string;
      automation: string;
    };
    tiers: Array<{
      name: string;
      frequency: string;
      datasets: string;
      automation: string;
      badgeColor: string;
    }>;
    liveDemoNote: string;
  };
}

export function DataLifecycleMatrix({ labels }: DataLifecycleMatrixProps) {
  return (
    <section aria-labelledby="data-lifecycle-title" className="flex flex-col gap-4">
      <div>
        <span className="inline-flex items-center rounded-full bg-forest/10 px-2.5 py-0.5 text-xs font-semibold text-forest">
          Production Architecture & Automation
        </span>
        <h2 id="data-lifecycle-title" className="mt-1 text-2xl font-bold text-canopy">
          {labels.title}
        </h2>
        <p className="mt-1 text-sm text-ink">{labels.subtitle}</p>
      </div>

      <div className="rounded-xl border border-line bg-cream/40 p-4">
        <strong className="text-xs uppercase tracking-wide text-clay font-bold block">
          {labels.juryQuestion}
        </strong>
        <p className="mt-1 text-xs text-ink italic font-medium">
          &ldquo;{labels.juryQuestionText}&rdquo;
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-line bg-paper shadow-xs">
        <table className="w-full min-w-[48rem] text-left text-sm">
          <thead>
            <tr className="border-b border-line bg-cream/20 text-muted">
              <th scope="col" className="px-4 py-3 font-semibold text-canopy">
                {labels.columns.tier}
              </th>
              <th scope="col" className="px-4 py-3 font-semibold text-canopy">
                {labels.columns.frequency}
              </th>
              <th scope="col" className="px-4 py-3 font-semibold text-canopy">
                {labels.columns.datasets}
              </th>
              <th scope="col" className="px-4 py-3 font-semibold text-canopy">
                {labels.columns.automation}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line/60">
            {labels.tiers.map((t, idx) => (
              <tr key={idx} className="hover:bg-cream/20 transition-colors align-top">
                <td className="px-4 py-3 font-semibold text-canopy whitespace-nowrap">
                  <span className="inline-flex items-center rounded-md bg-forest/10 px-2 py-0.5 text-xs font-bold text-forest mr-2">
                    {t.name}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs font-mono font-medium text-ink whitespace-nowrap">
                  {t.frequency}
                </td>
                <td className="px-4 py-3 text-xs text-ink font-medium leading-relaxed max-w-xs">
                  {t.datasets}
                </td>
                <td className="px-4 py-3 text-xs text-ink leading-relaxed">
                  {t.automation}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rounded-xl border border-line/60 bg-paper p-3.5 text-xs text-muted flex items-start gap-2">
        <span className="text-forest font-bold text-sm">✓</span>
        <p>
          <strong className="text-canopy font-semibold">Live Demo Ingestion Simulator:</strong>{" "}
          {labels.liveDemoNote}
        </p>
      </div>
    </section>
  );
}
