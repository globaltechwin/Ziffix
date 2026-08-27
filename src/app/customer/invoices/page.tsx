"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Download, ChevronDown, ChevronUp } from "lucide-react";
import { mockInvoices, type InvoiceStatus } from "@/data/invoices";

const statusConfig: Record<InvoiceStatus, { label: string; color: string }> = {
  paid: { label: "Paid", color: "text-green-600 bg-green-50" },
  pending: { label: "Pending", color: "text-amber-600 bg-amber-50" },
  overdue: { label: "Overdue", color: "text-red-600 bg-red-50" },
  draft: { label: "Draft", color: "text-muted-foreground bg-muted" },
};

const tabs = ["All", "Paid", "Pending", "Overdue"] as const;

export default function CustomerInvoicesPage() {
  const [activeTab, setActiveTab] = useState<string>("All");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = mockInvoices.filter((inv) => {
    if (activeTab === "All") return true;
    return inv.status === activeTab.toLowerCase();
  });

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const totalPaid = mockInvoices.filter((i) => i.status === "paid").reduce((sum, i) => sum + i.total, 0);
  const totalPending = mockInvoices.filter((i) => i.status === "pending").reduce((sum, i) => sum + i.total, 0);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Invoices
        </h1>
        <p className="text-muted-foreground">View and download your invoices</p>
      </div>

      {/* Summary */}
      <div className="mb-6 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Total Paid</p>
          <p className="text-2xl font-bold text-green-600">₹{totalPaid.toLocaleString("en-IN")}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Total Pending</p>
          <p className="text-2xl font-bold text-amber-600">₹{totalPending.toLocaleString("en-IN")}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 rounded-xl border border-border bg-muted p-1">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab
                ? "bg-white text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Invoices List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-8 text-center">
            <p className="text-muted-foreground">No invoices found.</p>
          </div>
        ) : (
          filtered.map((invoice, index) => {
            const status = statusConfig[invoice.status];
            const isExpanded = expandedId === invoice.id;

            return (
              <motion.div
                key={invoice.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="overflow-hidden rounded-xl border border-border bg-card"
              >
                {/* Invoice Header */}
                <button
                  onClick={() => toggleExpand(invoice.id)}
                  className="flex w-full items-center justify-between p-4 text-left"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground">
                        {invoice.id}
                      </h3>
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${status.color}`}>
                        {status.label}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {invoice.serviceName} &middot; {invoice.technicianName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(invoice.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-lg font-bold text-foreground">
                      ₹{invoice.total.toLocaleString("en-IN")}
                    </p>
                    {isExpanded ? (
                      <ChevronUp className="size-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="size-5 text-muted-foreground" />
                    )}
                  </div>
                </button>

                {/* Expanded Details */}
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    className="border-t border-border"
                  >
                    <div className="p-4">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border text-left text-muted-foreground">
                            <th className="pb-2 font-medium">Item</th>
                            <th className="pb-2 text-center font-medium">Qty</th>
                            <th className="pb-2 text-right font-medium">Price</th>
                            <th className="pb-2 text-right font-medium">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {invoice.items.map((item, i) => (
                            <tr key={i} className="text-foreground">
                              <td className="py-2">{item.description}</td>
                              <td className="py-2 text-center">{item.quantity}</td>
                              <td className="py-2 text-right">₹{item.unitPrice}</td>
                              <td className="py-2 text-right">₹{item.total}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      <div className="mt-3 space-y-1 border-t border-border pt-3">
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>Subtotal</span>
                          <span>₹{invoice.subtotal.toLocaleString("en-IN")}</span>
                        </div>
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>Tax (18% GST)</span>
                          <span>₹{invoice.tax.toLocaleString("en-IN")}</span>
                        </div>
                        <div className="flex justify-between text-base font-bold text-foreground">
                          <span>Total</span>
                          <span>₹{invoice.total.toLocaleString("en-IN")}</span>
                        </div>
                      </div>

                      <div className="mt-4 flex justify-end">
                        <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                          <Download className="size-4" />
                          Download PDF
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
