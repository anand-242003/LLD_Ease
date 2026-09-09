interface Feature {
  title: string;
  copy: string;
  tag: string;
  mock: React.ReactNode;
}

const FEATURES: Feature[] = [
  {
    tag: '01 — Editor',
    title: 'A real UML editor',
    copy: 'Drag Class, Abstract, Interface, Enum, and Record nodes onto an infinite canvas, and connect them with the six standard UML relationships — Inherit, Realize, Compose, Aggregate, Associate, Depend.',
    mock: (
      <div className="w-full max-w-sm bg-surface-3 border border-border rounded-[12px] font-mono text-[12px] overflow-hidden shadow-md">
        <div className="bg-surface-4 px-4 py-2.5 font-bold text-text border-b border-border">
          Vehicle <span className="text-kind-abstract text-[11px] font-normal">«abstract»</span>
        </div>
        <div className="px-4 py-2 border-b border-border text-text-muted">- licensePlate: String</div>
        <div className="px-4 py-2 text-text-muted">+ getType(): VehicleType</div>
      </div>
    ),
  },
  {
    tag: '02 — Library',
    title: 'A curated problem library',
    copy: 'Parking Lot, Splitwise, Elevator System, Vending Machine, and more — each with a difficulty rating, the patterns it exercises, and a verified reference solution.',
    mock: (
      <div className="w-full max-w-sm grid grid-cols-2 gap-3">
        {[
          { name: 'Parking Lot', diff: 'EASY' },
          { name: 'Splitwise', diff: 'MEDIUM' },
          { name: 'Elevator', diff: 'MEDIUM' },
          { name: 'LRU Cache', diff: 'HARD' },
        ].map(({ name, diff }) => (
          <div
            key={name}
            className="bg-surface-3 border border-border rounded-[10px] p-3 text-[12px] font-semibold text-text flex flex-col gap-1.5"
          >
            <span
              className={`text-[9px] font-bold uppercase tracking-wider rounded-full px-2 py-0.5 w-fit ${
                diff === 'EASY'
                  ? 'bg-success/15 text-success'
                  : diff === 'MEDIUM'
                  ? 'bg-warning/15 text-warning'
                  : 'bg-danger/15 text-danger'
              }`}
            >
              {diff}
            </span>
            {name}
          </div>
        ))}
      </div>
    ),
  },
  {
    tag: '03 — Codegen',
    title: 'Live code generation',
    copy: 'The diagram compiles continuously into idiomatic Java, Python, TypeScript, JavaScript, C++, and C# — proof the model actually holds together.',
    mock: (
      <div className="w-full max-w-sm bg-surface-3 border border-border rounded-[12px] font-mono text-[11px] p-4 text-left overflow-hidden shadow-md leading-relaxed">
        <div className="text-kind-interface mb-1">public interface <span className="text-text font-bold">FeeStrategy</span> {'{'}</div>
        <div className="text-text-muted pl-4">double <span className="text-success">calculate</span>(Ticket t);</div>
        <div className="text-kind-interface">{'}'}</div>
        <div className="mt-3 text-kind-abstract">public class <span className="text-text font-bold">HourlyFeeStrategy</span></div>
        <div className="text-text-muted pl-2">implements <span className="text-kind-interface">FeeStrategy</span> {'{ }'}</div>
      </div>
    ),
  },
  {
    tag: '04 — Scoring',
    title: 'A linter and a scoring loop',
    copy: 'Modelling mistakes surface the moment you make them. Model a problem from its brief alone and get scored against the reference — with explainable, per-class feedback.',
    mock: (
      <div className="w-full max-w-sm bg-surface-3 border border-border rounded-[12px] p-4 text-[12px] space-y-3">
        <div className="flex items-start gap-2">
          <span className="w-2 h-2 rounded-full bg-warning mt-1.5 shrink-0" />
          <span className="text-text-muted leading-relaxed">"NewClass0" realizes "NewClsdsd" which is not an interface.</span>
        </div>
        <div className="h-px bg-border" />
        <div className="flex items-center gap-3">
          <span className="text-[28px] font-bold text-primary font-mono leading-none">87</span>
          <div className="flex flex-col gap-1">
            <span className="text-text text-[12px] font-semibold">Strong match</span>
            <span className="text-text-muted text-[11px]">Relationships 90% · Members 80%</span>
          </div>
        </div>
      </div>
    ),
  },
];

export function FeatureShowcaseSection() {
  return (
    <section className="px-6 py-24 max-w-5xl mx-auto">
      <div data-section-heading className="mb-20 text-center" style={{ clipPath: 'inset(0 100% 0 0)' }}>
        <p className="text-[11px] font-semibold tracking-[0.18em] text-primary uppercase mb-3">
          Features
        </p>
        <h2 className="text-[32px] sm:text-[40px] font-bold text-text tracking-tight">
          Everything you need to go from idea to grade
        </h2>
      </div>

      <div className="flex flex-col gap-28">
        {FEATURES.map((feature, idx) => (
          <div
            key={feature.title}
            data-feature-row
            className={`flex flex-col md:flex-row items-center gap-12 ${
              idx % 2 === 1 ? 'md:flex-row-reverse' : ''
            }`}
          >
            {/* Text */}
            <div className="flex-1 flex flex-col gap-4">
              <span className="text-[10px] font-bold tracking-[0.2em] text-primary uppercase">
                {feature.tag}
              </span>
              <h3 className="text-[26px] sm:text-[30px] font-bold text-text tracking-tight leading-tight">
                {feature.title}
              </h3>
              <p className="text-[15px] text-text-muted leading-relaxed max-w-md">{feature.copy}</p>
            </div>
            {/* Mock */}
            <div className="flex-1 flex justify-center">{feature.mock}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default FeatureShowcaseSection;
