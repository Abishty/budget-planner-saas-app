import { gql } from "@apollo/client";

export const ME = gql`
  query Me {
    me {
      id
      email
      name
      currency
      darkMode
    }
  }
`;

export const DASHBOARD_SUMMARY = gql`
  query DashboardSummary {
    dashboardSummary {
      totalIncomeThisMonth
      totalExpenseThisMonth
      topCategories {
        categoryId
        categoryName
        amount
      }
    }
  }
`;

export const CATEGORIES = gql`
  query Categories {
    categories {
      id
      name
      type
      color
    }
  }
`;

export const TRANSACTIONS = gql`
  query Transactions($limit: Int) {
    transactions(limit: $limit) {
      id
      amount
      description
      date
      type
      category {
        id
        name
      }
    }
  }
`;

export const BUDGETS = gql`
  query Budgets {
    budgets {
      id
      amount
      period
      startDate
      category {
        id
        name
      }
    }
  }
`;

export const GOALS = gql`
  query Goals {
    goals {
      id
      name
      targetAmount
      currentAmount
      deadline
    }
  }
`;

export const REGISTER = gql`
  mutation Register($email: String!, $password: String!, $name: String) {
    register(email: $email, password: $password, name: $name) {
      token
      user {
        id
        email
        name
        currency
        darkMode
      }
    }
  }
`;

export const LOGIN = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        id
        email
        name
        currency
        darkMode
      }
    }
  }
`;

export const UPDATE_PROFILE = gql`
  mutation UpdateProfile($name: String, $currency: String, $darkMode: Boolean) {
    updateProfile(name: $name, currency: $currency, darkMode: $darkMode) {
      id
      email
      name
      currency
      darkMode
    }
  }
`;

export const CREATE_TRANSACTION = gql`
  mutation CreateTransaction($input: CreateTransactionInput!) {
    createTransaction(input: $input) {
      id
      amount
      description
      date
      type
      category {
        id
        name
      }
    }
  }
`;

export const DELETE_TRANSACTION = gql`
  mutation DeleteTransaction($id: ID!) {
    deleteTransaction(id: $id)
  }
`;

export const CREATE_CATEGORY = gql`
  mutation CreateCategory(
    $name: String!
    $type: TransactionType!
    $color: String
  ) {
    createCategory(name: $name, type: $type, color: $color) {
      id
      name
      type
      color
    }
  }
`;

export const CREATE_BUDGET = gql`
  mutation CreateBudget(
    $categoryId: ID!
    $amount: Float!
    $period: BudgetPeriod
    $startDate: String
  ) {
    createBudget(
      categoryId: $categoryId
      amount: $amount
      period: $period
      startDate: $startDate
    ) {
      id
      amount
      period
      startDate
      category {
        id
        name
      }
    }
  }
`;

export const CREATE_GOAL = gql`
  mutation CreateGoal(
    $name: String!
    $targetAmount: Float!
    $deadline: String
  ) {
    createGoal(name: $name, targetAmount: $targetAmount, deadline: $deadline) {
      id
      name
      targetAmount
      currentAmount
      deadline
    }
  }
`;

export const UPDATE_GOAL_CURRENT = gql`
  mutation UpdateGoalCurrent($id: ID!, $currentAmount: Float!) {
    updateGoalCurrent(id: $id, currentAmount: $currentAmount) {
      id
      currentAmount
      targetAmount
    }
  }
`;
