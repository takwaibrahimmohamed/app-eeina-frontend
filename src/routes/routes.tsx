import { createBrowserRouter } from 'react-router-dom';
import ProtectedRoute from '@/routes/ProtectedRoute';
import { MainLayout, AuthLayout } from '@/components/Layout';
import { AnalyticsLayout } from '@/components/Layout/AnalyticsLayout';

// --- Pages ---
import { ListsLayout } from '@/pages/ShoppingList/ListLayout';
import { ListDetails } from '@/pages/ShoppingList/ListDetails';
import { AccountSettings } from '@/pages/AccountSettings';
import { Login, Signup } from '@/pages/Auth';
import { OAuthCallback } from '@/pages/Auth/OAuthCallback';
import { VerifyOtp } from '@/pages/Auth/VerifiOtp';
import { Category } from '@/pages/Category';
import { CreateRecipe } from '@/pages/CreateRecipe';
import { EditRecipe } from '@/pages/EditRecipe/EditRecipe';
import { Explore } from '@/pages/Explore';
import { Home } from '@/pages/Home';
import { Ingredient } from '@/pages/Ingredient/Ingredient';
import { IngredientDetails } from '@/pages/IngredientDetails';
import { MealPlanner } from '@/pages/MealPlanner';
import NotFound from '@/pages/NotFound';
import { Privacy_Policy } from '@/pages/PrivacyPolicy';
import { ProcessedFood } from '@/pages/processedFood';
import { ProcessedFoodDetails } from '@/pages/ProcessedFoodDetails';
import CreatedByProfile from '@/pages/Profile/CreatedByProfile';
import { RecipeDetails } from '@/pages/RecipeDetails';
import { SearchRecipesResult } from '@/pages/SearchRecipesResult';
import { Terms_Conditions } from '@/pages/Terms_Conditions';
import { Trending } from '@/pages/Trending';
import Checkout from '@/pages/Checkout/Checkout';
import ProfileSetup from '@/pages/ProfileSetup/ProfileSetup';
import GoalsSetup from '@/pages/Goals/GoalsSetup';
import GoalsDashboard from '@/pages/Goals/GoalsDashboard';
import GoalDashboardLayout from '@/components/Layout/GoalDashboardLayout';
import DashboardMealHistory from '@/pages/Goals/DashboardMealHistory';
import DashboardHealthSettings from '@/pages/Goals/DashboardHealthSettings';
import ProfileLayOut from '@/components/Layout/ProfileLayoutv2.tsx/ProfileLayout';
import Profile from '@/pages/Profilev2/Profile';
import EditProfile from '@/pages/Profilev2/EditProfile';
import EditProfileImage from '@/pages/Profilev2/component/editprofile/ProfileImages';
import BasicInformation from '@/pages/Profilev2/component/editprofile/BasicInformation';
import SocialMediaLinks from '@/pages/Profilev2/component/editprofile/SocialMediaLinks';
import HealthProfile from '@/pages/Profilev2/component/editprofile/HealthProfile';
import Preferences from '@/pages/Profilev2/component/editprofile/Preferencers';
import ProfileGoalsLayout from '@/pages/Profilev2/component/goals/ProfileGoalsLayout';
import ProfileViewGoals from '@/pages/Profilev2/component/goals/ProfileViewGoals';
import ProfileMealHistory from '@/pages/Profilev2/component/goals/ProfileMealHistory';
import ProfileHealthSettings from '@/pages/Profilev2/component/goals/ProfileHealthSettings';
import Packages from '@/pages/Packages/Packages';
import OrderSummary from '@/pages/OrderSummary/OrderSummary';
import PaymentPage from '@/pages/Payment/PaymentPage';
import PaymentSuccess from '@/pages/Payment/PaymentSuccess';
import Nutritionist from '@/pages/Nutritionist/Nutritionist';
import NutritionistVideo from '@/pages/Nutritionist/NutritionistVideo';
import NutritionistChat from '@/pages/Nutritionist/NutritionistChat';
import NutritionistLayout from '@/components/Layout/NutritionistLayout';
import Saved from '@/pages/Profilev2/component/Saved';
import PaymentCallback from '@/pages/Payment/PaymentCallback';
import PaymentFailed from '@/pages/Payment/PaymentFailed';
import SubscriptionPage from '@/pages/Subscription/SubscriptionPage';

// ------------------------------------------------------
// ENGLISH ROUTES
// ------------------------------------------------------
const englishRoutes = [
  // Auth routes (no header/footer)
  {
    element: <AuthLayout />,
    children: [
      { path: '/login', element: <Login /> },
      { path: '/signup/*', element: <Signup /> },
      { path: '/verify-otp', element: <VerifyOtp /> },
      {
        path: '/goals-setup',
        element: (
          <ProtectedRoute>
            <GoalsSetup />
          </ProtectedRoute>
        ),
      },
      { path: '/Profile-Setup', element: <ProfileSetup /> },
      { path: '/auth/callback', element: <OAuthCallback /> },
    ],
  },

  // Main routes (with header/footer)
  {
    element: <MainLayout />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/recipes', element: <Explore /> },
      { path: '/processed-food', element: <ProcessedFood /> },
      { path: '/processed-food/:slug', element: <ProcessedFoodDetails /> },
      { path: '/ingredients', element: <Ingredient /> },
      { path: '/ingredient/:slug', element: <IngredientDetails /> },
      { path: '/recipe/:slug', element: <RecipeDetails /> },
      { path: '/category/:categoryName', element: <Category /> },
      { path: '/user/:id', element: <CreatedByProfile /> },
      { path: '/trending', element: <Trending /> },
      { path: '/privacy-policy', element: <Privacy_Policy /> },
      { path: '/Terms_Conditions', element: <Terms_Conditions /> },
      { path: '/search', element: <SearchRecipesResult /> },

      { path: '/packages', element: <Packages /> },
      { path: '/order-summary/:orderId', element: <OrderSummary /> },
      { path: '/payment/:orderId', element: <PaymentPage /> },
      { path: '/payment/callback/:orderId', element: <PaymentCallback /> },
      { path: '/payment/success/:orderId', element: <PaymentSuccess /> },
      { path: '/payment/failed/:orderId', element: <PaymentFailed /> },
      { path: '/subscription', element: <SubscriptionPage /> },

      // Protected Routes

      {
        path: '/planner',
        element: (
          <ProtectedRoute>
            <MealPlanner />
          </ProtectedRoute>
        ),
      },
      {
        path: '/lists',
        element: <ListsLayout />,
        children: [
          {
            path: ':id',
            element: <ListDetails />,
          },
        ],
      },
      {
        path: '/create-recipe',
        element: (
          <ProtectedRoute>
            <CreateRecipe />
          </ProtectedRoute>
        ),
      },
      {
        path: '/edit-recipe/:id',
        element: (
          <ProtectedRoute>
            <EditRecipe />
          </ProtectedRoute>
        ),
      },
      {
        path: '/checkout',
        element: (
          <ProtectedRoute>
            <Checkout />
          </ProtectedRoute>
        ),
      },

      // 404 Fallback
      { path: '*', element: <NotFound /> },
    ],
  },

  {
    element: <ProfileLayOut />,
    children: [
      {
        path: '/Profile',
        element: (
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        ),
      },
      {
        path: '/Profile/goals',
        element: (
          <ProtectedRoute>
            <ProfileGoalsLayout />
          </ProtectedRoute>
        ),
        children: [
          {
            index: true,
            element: <ProfileViewGoals />
          },
          {
            path: 'meal-history',
            element: <ProfileMealHistory />
          },
          {
            path: 'health-settings',
            element: <ProfileHealthSettings />
          }
        ]
      },
      {
        path: '/edit',
        element: (
          <ProtectedRoute>
            <EditProfile />
          </ProtectedRoute>
        ),
        children: [
          { path: 'Profile-images', element: <EditProfileImage /> },
          { path: 'Basic-information', element: <BasicInformation /> },
          { path: 'Preferencers', element: <Preferences /> },
          { path: 'Social-Media', element: <SocialMediaLinks /> },
          { path: 'Health-Profile', element: <HealthProfile /> },
        ],
      },
      {
        path: '/savedrecipes',
        element: (
          <ProtectedRoute>
            <Saved />
          </ProtectedRoute>
        ),
      },
      {
        path: '/account-settings',
        element: (
          <ProtectedRoute>
            <AccountSettings />
          </ProtectedRoute>
        ),
      },
      {
        path: '/subscription',
        element: (
          <ProtectedRoute>
            <SubscriptionPage />
          </ProtectedRoute>
        ),
      },
    ],
  },

  // GoalsDashboardLayout
  {
    element: <GoalDashboardLayout />,
    children: [
      {
        path: '/goals-dashboard',
        element: (
          <ProtectedRoute>
            <GoalsDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: '/dashboard-meal-history',
        element: (
          <ProtectedRoute>
            <DashboardMealHistory />
          </ProtectedRoute>
        ),
      },
      {
        path: '/dashboard-health-settings',
        element: (
          <ProtectedRoute>
            <DashboardHealthSettings />
          </ProtectedRoute>
        ),
      },
    ],
  },
  // NutritionistLayout
  {
    element: <NutritionistLayout />,
    children: [
      {
        path: '/nutritionist',
        element: <Nutritionist />,
      },
      {
        path: '/nutritionist/video',
        element: <NutritionistVideo />,
      },
      {
        path: '/nutritionist/chat',
        element: <NutritionistChat />,
      },
    ],
  },
];

// ------------------------------------------------------
// ARABIC ROUTES (mirrors English, prefixed with /ar)
// ------------------------------------------------------
const arabicRoutes = [
  // Auth routes (no header/footer)
  {
    element: <AuthLayout />,
    children: englishRoutes[0].children.map((route) => ({
      ...route,
      path: `/ar${route.path}`,
    })),
  },

  // Main routes (with header/footer)
  {
    element: <MainLayout />,
    children: englishRoutes[1].children.map((route) => {
      if (route.children) {
        return {
          ...route,
          path: `/ar${route.path}`,
          children: route.children.map((child) => ({
            ...child,
            path: child.path,
          })),
        };
      }
      return { ...route, path: `/ar${route.path}` };
    }),
  },
  {
    element: <ProfileLayOut />,
    children: englishRoutes[2].children.map((route) => ({
      ...route,
      path: `/ar${route.path}`,
    })),
  },
  // GoalDashboardLayout
  {
    element: <GoalDashboardLayout />,
    children: englishRoutes[3].children.map((route) => ({
      ...route,
      path: `/ar${route.path}`,
    })),
  },
  {
    element: <NutritionistLayout />,
    children: englishRoutes[4].children.map((route) => ({
      ...route,
      path: `/ar${route.path}`,
    })),
  },
];

// ------------------------------------------------------
// CREATE ROUTER
// ------------------------------------------------------
export const router = createBrowserRouter([
  {
    element: <AnalyticsLayout />,
    children: [...englishRoutes, ...arabicRoutes],
  },
]);
