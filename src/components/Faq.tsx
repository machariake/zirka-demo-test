import { getFaqs } from "@/lib/cms";

export default async function Faq() {
  const faqs = await getFaqs();
  if (faqs.length === 0) return null;

  return (
    <section id="faq" className="section--cream">
      {/* No FAQPage schema: it was there only to chase rich results (brief §14). */}
      <div className="wrap">
        <div className="section-head">
          <div>
            <span className="eyebrow">Common questions</span>
            <h2>The things people ask before they call.</h2>
          </div>
          <p>
            If your question isn&rsquo;t here, call, text, or message our Atlanta team to speak
            directly with a Zirka strategist.
          </p>
        </div>

        <div className="faq-list">
          {faqs.map((item, i) => (
            <details key={item.q} name="faq" open={i === 0}>
              <summary>
                {item.q}
                <span className="faq-icon" aria-hidden="true" />
              </summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
