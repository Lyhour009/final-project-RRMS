"use client";

export default function GlobalError({ unstable_retry }: { unstable_retry: () => void }) {
  return (
    <html lang="km">
      <body style={{ margin: 0, fontFamily: "sans-serif", background: "#020617", color: "white" }}>
        <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24 }}>
          <section style={{ maxWidth: 520, textAlign: "center" }}>
            <h1>ប្រព័ន្ធមានបញ្ហាបណ្តោះអាសន្ន</h1>
            <p>សូមសាកល្បងម្តងទៀត ឬទាក់ទងអ្នកគ្រប់គ្រងប្រព័ន្ធ។</p>
            <button type="button" onClick={unstable_retry} style={{ padding: "10px 18px", cursor: "pointer" }}>
              សាកល្បងម្តងទៀត
            </button>
          </section>
        </main>
      </body>
    </html>
  );
}
