"use client";

import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

export function Features() {
  const features = [
    {
      title: "Agentic Reasoning",
      description: "Ask complex questions like 'What's the ROI on our marketing campaigns?' and get instant, contextual answers with full calculation breakdowns.",
      icon: "🧠",
      span: "md:col-span-2"
    },
    {
      title: "Instant Pivot Visuals",
      description: "Transform your data into charts, graphs, and dashboards with a single prompt. No more manual chart creation.",
      icon: "📊",
      span: "md:col-span-1"
    },
    {
      title: "MSME Ready",
      description: "Built for Indian businesses with vernacular language support, INR currency formatting, and compliance with local data regulations.",
      icon: "🇮🇳",
      span: "md:col-span-1"
    }
  ];

  return (
    <section id="features" className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Powerful Features for Modern Businesses
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need to turn spreadsheet chaos into actionable business intelligence.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className={feature.span}
            >
              <Card className="h-full bg-gradient-to-br from-card to-card/50 border-border hover:border-indigo-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/10">
                <CardContent className="p-8">
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}