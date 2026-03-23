export const typeDefs = /* GraphQL */ `
  enum TransactionType {
    INCOME
    EXPENSE
  }

  enum BudgetPeriod {
    MONTHLY
    YEARLY
  }

  type User {
    id: ID!
    email: String!
    name: String
    currency: String!
    darkMode: Boolean!
  }

  type Category {
    id: ID!
    name: String!
    type: TransactionType!
    color: String
  }

  type Transaction {
    id: ID!
    amount: Float!
    description: String
    date: String!
    type: TransactionType!
    category: Category
  }

  type Budget {
    id: ID!
    amount: Float!
    period: BudgetPeriod!
    startDate: String!
    category: Category!
  }

  type Goal {
    id: ID!
    name: String!
    targetAmount: Float!
    currentAmount: Float!
    deadline: String
  }

  type CategorySpend {
    categoryId: ID!
    categoryName: String!
    amount: Float!
  }

  type DashboardSummary {
    totalIncomeThisMonth: Float!
    totalExpenseThisMonth: Float!
    topCategories: [CategorySpend!]!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  input CreateTransactionInput {
    amount: Float!
    description: String
    date: String!
    type: TransactionType!
    categoryId: ID
  }

  type Query {
    me: User
    categories: [Category!]!
    transactions(limit: Int): [Transaction!]!
    budgets: [Budget!]!
    goals: [Goal!]!
    dashboardSummary: DashboardSummary!
  }

  type Mutation {
    register(email: String!, password: String!, name: String): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
    updateProfile(name: String, currency: String, darkMode: Boolean): User!
    createTransaction(input: CreateTransactionInput!): Transaction!
    deleteTransaction(id: ID!): Boolean!
    createCategory(name: String!, type: TransactionType!, color: String): Category!
    createBudget(
      categoryId: ID!
      amount: Float!
      period: BudgetPeriod
      startDate: String
    ): Budget!
    createGoal(name: String!, targetAmount: Float!, deadline: String): Goal!
    updateGoalCurrent(id: ID!, currentAmount: Float!): Goal!
  }
`;
