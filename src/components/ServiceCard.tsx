import Link from "next/link";
import Image from "next/image";
import type { ServiceView } from "@/lib/cms";
import { ServiceIcon, ArrowIcon } from "./Icons";
import ShareButton from "./ShareButton";

export default function ServiceCard({ service }: { service: ServiceView }) {
  return (
    <article className="service-card">
      <div className={`plate ${service.plate}`}>
        <Image src={service.image} alt={service.alt} fill sizes="(max-width: 860px) 100vw, 50vw" />
        <ServiceIcon kind={service.icon} />
      </div>
      <div className="service-body">
        <h3>{service.name}</h3>
        <p>{service.short}</p>
        <div className="tags">
          {service.capabilities.slice(0, 4).map((cap) => (
            <span className="tag" key={cap}>
              {cap}
            </span>
          ))}
          {service.capabilities.length > 4 && (
            <span className="tag tag--more">+{service.capabilities.length - 4} more</span>
          )}
        </div>
        <div className="service-card__footer">
          <Link className="explore" href={`/services/${service.slug}`}>
            Learn More<span className="sr-only"> about {service.name}</span>
            <ArrowIcon />
          </Link>
          <ShareButton
            title={service.name}
            text={service.short}
            path={`/services/${service.slug}`}
            variant="compact"
          />
        </div>
      </div>
    </article>
  );
}
