import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "Knowledge Graph RAG",
  description:
    "An internal assistant over 500k+ Indonesian legal and corporate PDFs: a four-stage ingestion pipeline into a knowledge graph, and hybrid dense-plus-graph retrieval with citation validation.",
};

const facts = [
  { label: "Corpus", value: "500k+ PDFs" },
  { label: "Cold pipeline", value: "~30min → ~4min" },
  { label: "Warm", value: "10–15s" },
  { label: "Retrieval", value: "Milvus + FalkorDB" },
];

const benchmark = [
  { metric: "Connect", falkor: "13.9 ms", neo4j: "34.2 ms", winner: "falkor" },
  {
    metric: "Node ingest (42)",
    falkor: "90.1 ms",
    neo4j: "30.0 ms",
    winner: "neo4j",
  },
  {
    metric: "Relationship ingest (171)",
    falkor: "412.7 ms",
    neo4j: "1,325.9 ms",
    winner: "falkor",
  },
  {
    metric: "1-hop retrieval (54 rels)",
    falkor: "7.69 ms",
    neo4j: "18.50 ms",
    winner: "falkor",
  },
];

export default function RagPage() {
  return (
    <main className="mx-auto max-w-[72ch] px-6 py-24 text-[18px] leading-relaxed">
      <Link
        href="/"
        className="text-[15px] text-muted underline underline-offset-4 hover:no-underline"
      >
        Ryan Rochmanofenna
      </Link>

      <h1 className="mt-8 text-4xl font-bold tracking-tight">
        Knowledge Graph RAG
      </h1>

      <p className="mt-4 text-lg text-muted">
        An internal assistant that answers questions about a company&rsquo;s own
        documents &mdash; meeting minutes, financial reports, contracts &mdash;
        by reading both the text and the relationships between the entities
        inside it. Built at Lintasarta on the in-house DekaLLM platform.
      </p>

      <Image
        src="/projects/rag/login.webp"
        alt="Sign-in screen showing a knowledge graph of company entities"
        width={1600}
        height={807}
        className="mt-8 w-full border border-line"
        priority
      />

      <dl className="mt-8 grid grid-cols-2 gap-4 border-y border-line py-4 text-[15px] sm:grid-cols-4">
        {facts.map((fact) => (
          <div key={fact.label}>
            <dt className="text-xs uppercase tracking-wide text-subtle">
              {fact.label}
            </dt>
            <dd>{fact.value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-16 space-y-12">
        <section>
          <h2 className="font-medium">Getting documents into a graph</h2>
          <p className="mt-2 text-muted">
            Ingestion is a four-stage LangGraph flow: OCR, then named-entity
            recognition, then entity-relation extraction, then graph ingestion.
            A document arrives from S3 as a scan, and leaves as nodes and edges
            &mdash; organizations, people, assets, and the relations connecting
            them. Redis holds the organization alias map, so the same company
            written five different ways across five documents resolves to one
            node rather than five.
          </p>
          <p className="mt-3 text-muted">
            The stage that decides whether any of this is usable is entity
            resolution. Skip it and the graph technically exists but answers
            nothing, because the entity you asked about is scattered across
            duplicates that never join up.
          </p>
        </section>

        <section>
          <h2 className="font-medium">Choosing the graph store by measuring</h2>
          <p className="mt-2 text-muted">
            FalkorDB or Neo4j was a real decision, so I benchmarked both on the
            same extracted output rather than arguing from reputation:
          </p>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full border-collapse text-[15px]">
              <thead>
                <tr className="border-b border-line text-left">
                  <th className="py-2 pr-4 font-medium"> </th>
                  <th className="py-2 pr-4 font-medium">FalkorDB</th>
                  <th className="py-2 font-medium">Neo4j</th>
                </tr>
              </thead>
              <tbody>
                {benchmark.map((row) => (
                  <tr
                    key={row.metric}
                    className="border-b border-line"
                  >
                    <td className="py-2 pr-4 text-muted">{row.metric}</td>
                    <td
                      className={`py-2 pr-4 tabular-nums ${
                        row.winner === "falkor"
                          ? "font-medium"
                          : "text-muted"
                      }`}
                    >
                      {row.falkor}
                    </td>
                    <td
                      className={`py-2 tabular-nums ${
                        row.winner === "neo4j"
                          ? "font-medium"
                          : "text-muted"
                      }`}
                    >
                      {row.neo4j}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-4 text-muted">
            Neo4j ingests nodes three times faster. FalkorDB wins relationship
            ingest by 3.2x and one-hop retrieval by 2.4x. This workload is
            relationship-dense &mdash; 171 relationships against 42 nodes for a
            single document &mdash; and every user question is a read, so
            FalkorDB was the right trade. Worth stating plainly: this is one
            document&rsquo;s extracted output, not a scale test. It was enough
            to settle the question it was asked.
          </p>
        </section>

        <section>
          <h2 className="font-medium">Retrieval, and refusing to make things up</h2>
          <p className="mt-2 text-muted">
            A question seeds dense retrieval in Milvus, and those hits expand
            one hop through FalkorDB across shared entity keys &mdash; so an
            answer can pull in a document that never matched the query text but
            is connected to something that did. A cross-encoder reranks the
            merged set, with a fallback cascade down to seed-only if graph
            expansion returns nothing useful.
          </p>
          <p className="mt-3 text-muted">
            Every citation then passes three-state validation before the answer
            ships, which exists because the failure that actually matters here
            isn&rsquo;t a wrong answer &mdash; it&rsquo;s a confident answer
            citing a page that doesn&rsquo;t exist. In a company&rsquo;s legal
            archive, a fabricated reference is worse than no answer.
          </p>

          <Image
            src="/projects/rag/trace.webp"
            alt="Query trace: Milvus text search returning 10 documents in 165ms, then FalkorDB graph expansion returning 50 relations in 47ms, with the resulting subgraph"
            width={1600}
            height={911}
            className="mt-6 w-full border border-line"
          />
          <p className="mt-3 text-[15px] text-muted">
            The trace is shown to the user, not hidden: which store was hit,
            how many hits came back, how long each took, and the subgraph the
            answer was built from.
          </p>
        </section>

        <section>
          <h2 className="font-medium">The two stores, from the inside</h2>
          <p className="mt-2 text-muted">
            &ldquo;Cross-store&rdquo; is easy to claim, so here are both halves
            of it. The graph carries the structure the extraction pipeline
            found, and the vector index carries the text it was found in.
          </p>

          <figure className="mt-6">
            <Image
              src="/projects/rag/falkordb.webp"
              alt="FalkorDB browser showing 271 nodes, 802 edges, and the extracted relationship vocabulary"
              width={1600}
              height={807}
              className="w-full border border-line"
            />
            <figcaption className="mt-3 text-[15px] text-muted">
              271 nodes and 802 edges from one corpus. The relationship list on
              the left is the interesting part &mdash;{" "}
              <span className="font-mono">REPORTS_ASSET_VALUE</span>,{" "}
              <span className="font-mono">SUBSIDIARY_OF</span>,{" "}
              <span className="font-mono">PAID_TAX_AMOUNT</span> &mdash; because
              nobody wrote that schema. The extraction pipeline produced it from
              the documents. The property keys tell the rest of the story:{" "}
              <span className="font-mono">aliases</span> is where entity
              resolution lands, and{" "}
              <span className="font-mono">evidence_pages</span> is what makes
              citations checkable.
            </figcaption>
          </figure>

          <figure className="mt-10">
            <Image
              src="/projects/rag/milvus.webp"
              alt="Milvus collection browser showing 359 embedded chunks with their vectors"
              width={1300}
              height={1598}
              className="w-full border border-line"
            />
            <figcaption className="mt-3 text-[15px] text-muted">
              The same corpus as 359 embedded chunks. Retrieval starts here and
              expands into the graph above through shared entity keys. Document
              text is cropped out of this view deliberately &mdash; it&rsquo;s
              the client&rsquo;s.
            </figcaption>
          </figure>
        </section>

        <section>
          <h2 className="font-medium">Making it fast enough to use</h2>
          <p className="mt-2 text-muted">
            The pipeline started at roughly 30 minutes per document and now runs
            about 4 minutes cold, 10&ndash;15 seconds warm. Most of that came
            from content-addressed caching in Redis &mdash; SHA-256 keyed on
            input so identical content never gets re-processed, and fail-open so
            a cache outage degrades speed instead of availability &mdash; plus
            async parallelization and eliminating self-pair comparisons in
            entity resolution. A determinism check guarantees the same document
            yields the same graph across runs, which is what makes the cache
            safe to trust in the first place.
          </p>
        </section>

        <section>
          <h2 className="font-medium">Serving it</h2>
          <p className="mt-2 text-muted">
            A FastAPI service fronts retrieval and answering. Authentication is
            JWT with HS256 over Postgres-backed accounts, with an admin panel
            for dataset and user management. The interface is Indonesian
            throughout, because the people using it work in Indonesian.
          </p>
          <p className="mt-3 text-muted">
            Registration doesn&rsquo;t self-approve: a new account is inert
            until an admin approves it, and every auth event lands in an
            append-only activity log. In a system whose whole job is answering
            questions about internal documents, who asked is as much a record as
            what was answered.
          </p>

          <figure className="mt-6">
            <Image
              src="/projects/rag/postgres.webp"
              alt="Postgres query output showing the users table with roles, and an activity log of registration, approval, and login events"
              width={1200}
              height={1297}
              className="w-full border border-line"
            />
            <figcaption className="mt-3 text-[15px] text-muted">
              Roles, and the audit trail:{" "}
              <span className="font-mono">REGISTER</span> &rarr;{" "}
              <span className="font-mono">APPROVE_USER</span> &rarr;{" "}
              <span className="font-mono">LOGIN_FAILED</span> &rarr;{" "}
              <span className="font-mono">LOGIN_SUCCESS</span>. Email addresses
              and IPs are redacted.
            </figcaption>
          </figure>
        </section>
      </div>

      <section className="mt-16 border-t border-line pt-8">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-subtle">
          Stack
        </h2>
        <p className="mt-3 text-muted">
          Python, LangGraph, FastAPI, Milvus, FalkorDB, Redis, Postgres, S3,
          Docker. Go for the telemetry collector.
        </p>
      </section>
    </main>
  );
}
