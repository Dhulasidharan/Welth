// app/(main)/dashboard/page.jsx

import { getUserAccounts } from "@/actions/dashboard";
import { getDashboardData } from "@/actions/dashboard";
import { getCurrentBudget } from "@/actions/budget";
import { checkUser } from "@/lib/checkUser"; // ✅ Moved here

import AccountCard from "./_components/account-card";
import { DashboardOverview } from "./_components/transaction-overview";
import { BudgetProgress } from "./_components/budget-progress";
import CreateAccountDrawer from "@/components/create-account-drawer";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";

export default async function DashboardPage() {
  const user = await checkUser(); // ✅ Runs only on /dashboard (middleware applies here)

  if (!user) {
    return <div className="text-red-500 text-center mt-10">User not found</div>;
  }

  const [accounts, transactions] = await Promise.all([
    getUserAccounts(),
    getDashboardData(),
  ]);

  const defaultAccount = accounts?.find((account) => account.isDefault);

  let budgetData = null;
  if (defaultAccount) {
    budgetData = await getCurrentBudget(defaultAccount.id);
  }

  return (
    <div className="space-y-8">
      {BudgetProgress && budgetData && (
        <BudgetProgress
          initialBudget={budgetData?.budget}
          currentExpenses={budgetData?.currentExpenses || 0}
        />
      )}

      {DashboardOverview && (
        <DashboardOverview
          accounts={accounts}
          transactions={transactions || []}
        />
      )}

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
