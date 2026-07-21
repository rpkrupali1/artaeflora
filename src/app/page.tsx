import Hero from "@/components/Hero";
import { site } from "@/lib/site";

export default function Home() {
  return (
    <div>
      <Hero />
      <section className="mx-auto max-w-6xl px-4 py-16 text-center">
        <p className="font-hand text-xl text-leaf">{site.punchlines.occasions}</p>
        <div className="mt-4 flex flex-wrap justify-center gap-3">
          {site.occasions.map((o) => (
            <span
              key={o}
              className="rounded-full bg-sage-light px-5 py-2 text-sm font-medium text-leaf-dark"
            >
              {o}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}
