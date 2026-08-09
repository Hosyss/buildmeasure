type WorkedExampleStep = {
  label: string;
  value: string;
};

export function CalculatorWorkedExample({
  title,
  description,
  steps,
  result,
  verification,
}: {
  title: string;
  description: string;
  steps: WorkedExampleStep[];
  result: string;
  verification: string;
}) {
  return (
    <section className="worked-example-section">
      <div className="shell worked-example-grid">
        <div>
          <p className="eyebrow">Worked example</p>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
        <div className="worked-example-card">
          <ol>
            {steps.map((step, index) => (
              <li key={step.label}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <strong>{step.label}</strong>
                  <code>{step.value}</code>
                </div>
              </li>
            ))}
          </ol>
          <div className="worked-example-result">
            <span>Verified result</span>
            <strong>{result}</strong>
            <p>{verification}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
