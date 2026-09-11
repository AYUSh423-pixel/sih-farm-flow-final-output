"use client";

import { Suspense } from "react";
import BookPage from "./book-client";

export default function Page() {
  return (
    <Suspense fallback={<p>Loading booking…</p>}>
      <BookPage />
    </Suspense>
  );
}
