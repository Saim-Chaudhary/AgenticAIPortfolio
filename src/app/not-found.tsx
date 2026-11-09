import Link from "next/link";

export default function NotFound() {
  return (
    <main id="main" className="container" style={{ paddingBlock: "96px" }}>
      <h1 className="case-title">Not found</h1>
      <p className="case-lead">
        <Link href="/">Back to the home page</Link>
      </p>
    </main>
  );
}
