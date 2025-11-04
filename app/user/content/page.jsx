"use client";

import dynamic from "next/dynamic";
import ProtectedRoute from "../../../src/routes/ProtectedRoute";

const Content = dynamic(() => import("../../../src/views/User/Content"), {
  ssr: false,
});

export default function ContentPage() {
  return (
    <ProtectedRoute requiredRole="user">
      <Content />
    </ProtectedRoute>
  );
}
