// File: app/dashboard/page.tsx

import { getUserAccounts } from "@/actions/dashboard";
import { getDashboardData } from "@/actions/dashboard";
import { getCurrentBudget } from "@/actions/budget";

import AccountCard from "./_components/account-card"; // ✅ default export
import {DashboardOverview} from "./_components/transaction-overview"; // ✅ Named  default export
import { BudgetProgress } from "./_components/budget-progress"; // ✅ named export

import CreateAccountDrawer from "@/components/create-account-drawer"; // ✅ default export
import { Card, CardContent } from "@/components/ui/card"; // ✅ named exports
import { Plus } from "lucide-react";

export default async function DashboardPage() {
  const [accounts, transactions] = await Promise.all([
    getUserAccounts(),
    getDashboardData(),
  ]);

  const defaultAccount = accounts?.find((account) => account.isDefault);

  let budgetData = null;
  if (defaultAccount) {
    budgetData = await getCurrentBudget(defaultAccount.id);
  }

  // ✅ Debug log to identify undefined components or props
  console.log("Component checks:", {
    AccountCard,
    DashboardOverview,
    BudgetProgress,
    CreateAccountDrawer,
    Card,
    CardContent,
    accounts,
    transactions,
    budgetData,
  });

  return (
    <div className="space-y-8">
      {/* Budget Progress */}
      {BudgetProgress && budgetData && (
        <BudgetProgress
          initialBudget={budgetData?.budget}
          currentExpenses={budgetData?.currentExpenses || 0}
        />
      )}

      {/* Dashboard Overview */}
      {DashboardOverview && (
        <DashboardOverview
          accounts={accounts}
          transactions={transactions || []}
        />
      )}

      {/* Accounts Grid */}
      {CreateAccountDrawer && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <CreateAccountDrawer>
            {Card && CardContent && (
              <Card className="hover:shadow-md transition-shadow cursor-pointer border-dashed">
                <CardContent className="flex flex-col items-center justify-center text-muted-foreground h-full pt-5">
                  <Plus className="h-10 w-10 mb-2" />
                  <p className="text-sm font-medium">Add New Account</p>
                </CardContent>
              </Card>
            )}
          </CreateAccountDrawer>

          {AccountCard &&
            accounts.length > 0 &&
            accounts.map((account) => (
              <AccountCard key={account.id} account={account} />
            ))}
        </div>
      )}
    </div>
  );
}
