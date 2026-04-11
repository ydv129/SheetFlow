"use client";

import React from "react";
import { motion } from "framer-motion";

export function TrustBanner() {
  const features = [
    "🔒 100% Local AI Processing (WebGPU)",
    "🚀 Zero Latency (No server uploads)",
    "🛡️ GDPR & DPDP Compliant by default"
  ];

  return (
    <section className="py-16 bg-gradient-to-r from-indigo-950/20 to-emerald-950/20 border-y border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="flex flex-col items-center space-y-2"
            >
              <div className="text-2xl">{feature.split(' ')[0]}</div>
              <div className="text-foreground font-semibold">{feature.substring(feature.indexOf(' ') + 1)}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}