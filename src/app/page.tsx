"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Dumbbell } from "lucide-react";
import { motion } from "framer-motion";

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to login page
    router.push("/login");
  }, [router]);

  // Show loading state while redirecting
  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--primary)] via-[var(--primary-dark)] to-[var(--secondary)] flex items-center justify-center">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      >
        <Dumbbell className="w-12 h-12 text-white" />
      </motion.div>
    </div>
  );
}
