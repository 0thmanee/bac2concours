"use client";

import { useState } from "react";
import { ExpenseWithRelations } from "@/lib/types/prisma";
import { useExpenses, useApproveExpense, useRejectExpense, useExpenseMetrics } from "@/lib/hooks/use-expenses";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MetricCard } from "@/components/ui/metric-card";
import {
  Receipt,
  Search,
  Check,
  X,
  Eye,
  FileText,
  Clock,
  DollarSign,
  Filter,
} from "lucide-react";
import { StatusBadge } from "@/components/shared/status-badge";
import { LoadingState } from "@/components/shared/loading-state";
import { EmptyState } from "@/components/shared/empty-state";
import { formatCurrency, formatDate } from "@/lib/utils/startup.utils";
import { EXPENSE_STATUS, MESSAGES } from "@/lib/constants";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ExpensesPage() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedExpense, setSelectedExpense] = useState<ExpenseWithRelations | null>(null);
  const [comment, setComment] = useState("");

  // Use React Query hooks - filtering is done in backend
  const { data: expensesData, isLoading } = useExpenses({
    status: statusFilter !== "all" ? (statusFilter as typeof EXPENSE_STATUS.PENDING | typeof EXPENSE_STATUS.APPROVED | typeof EXPENSE_STATUS.REJECTED) : undefined,
  });
  
  // Get metrics from service
  const { data: metricsData } = useExpenseMetrics();
  
  // API returns { data: [...], success: true }
  const expenses = (expensesData?.data || []) as ExpenseWithRelations[];
  const metrics = metricsData?.data || { pendingCount: 0, pendingTotal: 0, approvedCount: 0, totalCount: 0 };
  
  const approveMutation = useApproveExpense();
  const rejectMutation = useRejectExpense();

  const handleApprove = async () => {
    if (!selectedExpense) return;
    
    try {
      await approveMutation.mutateAsync({
        id: selectedExpense.id,
        adminComment: comment || undefined,
      });
      toast.success(MESSAGES.SUCCESS.EXPENSE_APPROVED);
      setSelectedExpense(null);
      setComment("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : MESSAGES.ERROR.GENERIC);
    }
  };

  const handleReject = async () => {
    if (!selectedExpense) return;
    
    if (!comment || comment.trim().length < 5) {
      toast.error(MESSAGES.ERROR.EXPENSE_REJECTION_REASON_REQUIRED);
      return;
    }
    
    try {
      await rejectMutation.mutateAsync({
        id: selectedExpense.id,
        adminComment: comment.trim(),
      });
      toast.success(MESSAGES.SUCCESS.EXPENSE_REJECTED);
      setSelectedExpense(null);
      setComment("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : MESSAGES.ERROR.GENERIC);
    }
  };

  const isApproving = approveMutation.isPending || rejectMutation.isPending;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-ops-primary">
          Expense Approvals
        </h1>
        <p className="mt-1 text-sm text-ops-secondary">
          Review and approve startup expense requests
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard
          title="Pending Approvals"
          value={metrics.pendingCount}
          icon={Clock}
          color="orange"
          subtitle="Requiring attention"
        />
        <MetricCard
          title="Pending Amount"
          value={formatCurrency(metrics.pendingTotal, { useK: true, decimals: 1 })}
          icon={DollarSign}
          color="cyan"
          subtitle="To be reviewed"
        />
        <MetricCard
          title="Total Requests"
          value={metrics.totalCount}
          icon={Receipt}
          color="purple"
          subtitle="All time"
        />
      </div>

      {/* Filters & Search */}
      <Card className="ops-card border border-ops">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ops-tertiary" />
              <Input
                placeholder="Search expenses..."
                className="ops-input pl-10 h-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-45 ops-input h-9">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="ops-card">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value={EXPENSE_STATUS.PENDING}>Pending</SelectItem>
                <SelectItem value={EXPENSE_STATUS.APPROVED}>Approved</SelectItem>
                <SelectItem value={EXPENSE_STATUS.REJECTED}>Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Expenses Table */}
      <Card className="ops-card border border-ops">
        <Table>
          <TableHeader>
            <TableRow className="border-ops">
              <TableHead className="font-medium text-ops-secondary">Startup</TableHead>
              <TableHead className="font-medium text-ops-secondary">Description</TableHead>
              <TableHead className="font-medium text-ops-secondary">Category</TableHead>
              <TableHead className="font-medium text-ops-secondary">Amount</TableHead>
              <TableHead className="font-medium text-ops-secondary">Date</TableHead>
              <TableHead className="font-medium text-ops-secondary">Status</TableHead>
              <TableHead className="text-right font-medium text-ops-secondary">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <LoadingState message={MESSAGES.LOADING.EXPENSES} />
                </TableCell>
              </TableRow>
            ) : expenses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <EmptyState
                    title="No expenses found"
                    description="No expenses match your filters"
                  />
                </TableCell>
              </TableRow>
            ) : (
              expenses.map((expense) => (
                <TableRow key={expense.id} className="border-ops">
                  <TableCell>
                    <div>
                      <p className="font-medium text-sm text-ops-primary">
                        {expense.startup?.name || "Unknown"}
                      </p>
                      <p className="text-xs text-ops-tertiary">
                        by {expense.submittedBy?.name || "Unknown"}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm max-w-md text-ops-secondary">
                      {expense.description}
                    </p>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline"
                      className="h-6 text-xs bg-neutral-100 text-ops-secondary border-ops"
                    >
                      {expense.category?.name || "Unknown"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm font-medium text-ops-primary">
                      {formatCurrency(expense.amount)}
                    </p>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm text-ops-secondary">
                      {formatDate(expense.date)}
                    </p>
                  </TableCell>
                <TableCell>
                  <StatusBadge status={expense.status} className="h-6 text-xs" />
                </TableCell>
                <TableCell className="text-right">
                  {expense.status === EXPENSE_STATUS.PENDING && (
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => setSelectedExpense(expense)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-metric-mint"
                        onClick={() => {
                          setSelectedExpense(expense);
                          setComment("");
                        }}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-metric-rose"
                        onClick={() => {
                          setSelectedExpense(expense);
                          setComment("");
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  {expense.status !== EXPENSE_STATUS.PENDING && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => setSelectedExpense(expense)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Expense Detail Dialog */}
      <Dialog
        open={!!selectedExpense}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedExpense(null);
            setComment("");
          }
        }}
      >
        <DialogContent className="ops-card sm:max-w-125">
          <DialogHeader>
            <DialogTitle className="text-ops-primary">
              Expense Details
            </DialogTitle>
            <DialogDescription className="text-ops-secondary">
              Review and approve or reject this expense request
            </DialogDescription>
          </DialogHeader>
          
          {selectedExpense && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium mb-1 text-ops-secondary">
                    Startup
                  </p>
                  <p className="text-sm text-ops-primary">
                    {selectedExpense.startup?.name || "Unknown"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1 text-ops-secondary">
                    Amount
                  </p>
                  <p className="text-sm font-semibold text-ops-primary">
                    {formatCurrency(selectedExpense.amount)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1 text-ops-secondary">
                    Category
                  </p>
                  <p className="text-sm text-ops-primary">
                    {selectedExpense.category?.name || "Unknown"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1 text-ops-secondary">
                    Date
                  </p>
                  <p className="text-sm text-ops-primary">
                    {formatDate(selectedExpense.date)}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-1 text-ops-secondary">
                  Description
                </p>
                <p className="text-sm text-ops-primary">
                  {selectedExpense.description}
                </p>
              </div>

              {selectedExpense.receiptUrl && (
                <div>
                  <p className="text-sm font-medium mb-2 text-ops-secondary">
                    Receipt
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="ops-btn-secondary h-8 gap-2"
                    onClick={() => window.open(selectedExpense.receiptUrl!, "_blank")}
                  >
                    <FileText className="h-4 w-4" />
                    View Receipt
                  </Button>
                </div>
              )}

              {selectedExpense.status === EXPENSE_STATUS.PENDING && (
                <div className="space-y-2">
                  <Label htmlFor="comment" className="text-sm font-medium">
                    Comment (Required for rejection)
                  </Label>
                  <Textarea
                    id="comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Add a comment or reason for your decision"
                    rows={3}
                    className="ops-input resize-none"
                  />
                </div>
              )}
            </div>
          )}

          {selectedExpense?.status === EXPENSE_STATUS.PENDING && (
            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={handleReject}
                disabled={isApproving || !comment || comment.trim().length < 5}
                className="ops-btn-secondary h-9 gap-2 text-metric-rose"
              >
                <X className="h-4 w-4" />
                Reject
              </Button>
              <Button
                onClick={handleApprove}
                disabled={isApproving}
                className="ops-btn-primary h-9 gap-2"
              >
                <Check className="h-4 w-4" />
                {isApproving ? "Processing..." : "Approve"}
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
