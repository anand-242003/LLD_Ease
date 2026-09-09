export function ProblemStatementSection() {
  return (
    <section id="how-it-works" className="px-6 py-28 max-w-5xl mx-auto">
      {/* Section label */}
      <div data-reveal className="text-center mb-12">
        <p className="text-[11px] font-semibold tracking-[0.18em] text-primary uppercase">
          How it works
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-5 mb-12">
        <div data-reveal className="group rounded-[16px] p-8 relative overflow-hidden" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
          {/* Corner accent */}
          <div
            className="absolute top-0 right-0 w-20 h-20 opacity-5"
            style={{ background: 'radial-gradient(circle at top right, var(--primary), transparent)' }}
            aria-hidden="true"
          />
          <div
            className="w-8 h-8 rounded-lg mb-4 flex items-center justify-center text-[16px] font-bold text-text-muted"
            style={{ background: 'var(--surface-3)', border: '1px solid var(--border)' }}
          >
            A
          </div>
          <h3 className="text-[20px] font-semibold text-text mb-3">Draw UML</h3>
          <p className="text-[14px] text-text-muted leading-relaxed">
            Lucidchart, draw.io — infinitely flexible, but the diagram means nothing to the tool. No
            feedback on whether your design is actually sound.
          </p>
        </div>

        <div data-reveal className="group rounded-[16px] p-8 relative overflow-hidden" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
          <div
            className="absolute top-0 right-0 w-20 h-20 opacity-5"
            style={{ background: 'radial-gradient(circle at top right, #7DD3FC, transparent)' }}
            aria-hidden="true"
          />
          <div
            className="w-8 h-8 rounded-lg mb-4 flex items-center justify-center text-[16px] font-bold text-text-muted"
            style={{ background: 'var(--surface-3)', border: '1px solid var(--border)' }}
          >
            B
          </div>
          <h3 className="text-[20px] font-semibold text-text mb-3">Write code</h3>
          <p className="text-[14px] text-text-muted leading-relaxed">
            An IDE gives you real code, but no visual model to reason about structure — and no
            problem set to practice against.
          </p>
        </div>
      </div>

      {/* Animated horizontal divider */}
      <div className="flex items-center justify-center my-12 px-8">
        <div
          data-divider-line
          className="w-full max-w-lg h-[2px] rounded-full cursor-pointer"
          style={{
            background: 'linear-gradient(90deg, transparent, var(--primary) 30%, #7DD3FC 60%, transparent)',
            transformOrigin: 'center',
          }}
          aria-hidden="true"
        />
      </div>

      <div data-reveal className="text-center max-w-3xl mx-auto">
        <p className="text-[26px] sm:text-[34px] font-bold text-text leading-tight tracking-tight">
          <span
            className="text-transparent"
            style={{
              backgroundImage: 'linear-gradient(135deg, #22C7C7, #7DD3FC)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
            }}
          >
            LLDSIM
          </span>{' '}
          sits between them — a diagram that's a semantic model: validated, compiled, and graded.
        </p>
      </div>
    </section>
  );
}

export default ProblemStatementSection;
